package com.myshop.cafe.ui.screens.checkout

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.myshop.cafe.data.models.CartItem
import com.myshop.cafe.data.models.Order
import com.myshop.cafe.data.models.OrderType
import com.myshop.cafe.data.repository.CartRepository
import com.myshop.cafe.data.repository.OrderRepository
import com.myshop.cafe.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import com.myshop.cafe.utils.KhqrUtil
import javax.inject.Inject

data class CheckoutUiState(
    val items: List<CartItem> = emptyList(),
    val totalPrice: Double = 0.0,
    val orderType: OrderType = OrderType.TAKEAWAY,
    val tableNumber: String = "",
    val phoneNumber: String = "",
    val customerName: String = "",
    val isSubmitting: Boolean = false,
    val error: String? = null,
    val successOrder: Order? = null,
    val showKhqr: Boolean = false,
    val khqrString: String? = null,
    val paymentMd5: String? = null
)

@HiltViewModel
class CheckoutViewModel @Inject constructor(
    private val cartRepository: CartRepository,
    private val orderRepository: OrderRepository,
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(CheckoutUiState())
    val uiState: StateFlow<CheckoutUiState> = _uiState.asStateFlow()
    
    init {
        observeCart()
        observeUserSession()
    }
    
    private fun observeUserSession() {
        viewModelScope.launch {
            userRepository.userSession.collect { session ->
                if (session.isLoggedIn) {
                    _uiState.value = _uiState.value.copy(
                        phoneNumber = session.phoneNumber,
                        customerName = session.customerName ?: ""
                    )
                }
            }
        }
    }
    
    private fun observeCart() {
        viewModelScope.launch {
            cartRepository.cartItems.collect { items ->
                _uiState.value = _uiState.value.copy(
                    items = items,
                    totalPrice = items.sumOf { it.totalPrice }
                )
            }
        }
    }
    
    fun setOrderType(orderType: OrderType) {
        _uiState.value = _uiState.value.copy(orderType = orderType)
    }
    
    fun setTableNumber(tableNumber: String) {
        _uiState.value = _uiState.value.copy(tableNumber = tableNumber)
    }
    
    fun setPhoneNumber(phoneNumber: String) {
        _uiState.value = _uiState.value.copy(phoneNumber = phoneNumber)
    }
    
    fun setCustomerName(customerName: String) {
        _uiState.value = _uiState.value.copy(customerName = customerName)
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    fun showKhqr(show: Boolean) {
        val state = _uiState.value
        
        if (show) {
            // Generate KHQR
            val billNo = "CAFE${System.currentTimeMillis().toString().takeLast(8)}"
            val khqr = KhqrUtil.generateKhqr(
                KhqrUtil.KhqrConfig(
                    amount = state.totalPrice,
                    currency = "USD",
                    merchantName = "MY SHOP",
                    accountNumber = "lavin_mara@bkrt",
                    billNumber = billNo
                )
            )
            val md5 = KhqrUtil.generateMd5(khqr)
            
            _uiState.value = state.copy(
                showKhqr = true,
                khqrString = khqr,
                paymentMd5 = md5
            )
            
            // Start polling
            startPaymentPolling(md5)
        } else {
            _uiState.value = state.copy(
                showKhqr = false,
                khqrString = null,
                paymentMd5 = null
            )
            stopPolling()
        }
    }
    
    private var pollingJob: Job? = null
    
    private fun startPaymentPolling(md5: String) {
        stopPolling()
        pollingJob = viewModelScope.launch {
            while (isActive) {
                delay(3000) // Poll every 3 seconds
                
                orderRepository.verifyKhqr(md5)
                    .onSuccess { verified ->
                        if (verified) {
                            placeOrder(isPaid = true)
                            stopPolling()
                        }
                    }
                    .onFailure {
                        // Continue polling on error
                    }
            }
        }
    }
    
    private fun stopPolling() {
        pollingJob?.cancel()
        pollingJob = null
    }

    fun placeOrder(isPaid: Boolean = false) {
        val state = _uiState.value
        
        // Validation
        if (state.phoneNumber.isBlank()) {
            _uiState.value = state.copy(error = "Please enter your phone number")
            return
        }
        
        if (state.orderType == OrderType.DINE_IN && state.tableNumber.isBlank()) {
            _uiState.value = state.copy(error = "Please enter your table number")
            return
        }
        
        if (state.items.isEmpty()) {
            _uiState.value = state.copy(error = "Your cart is empty")
            return
        }
        
        viewModelScope.launch {
            _uiState.value = state.copy(isSubmitting = true, showKhqr = false, error = null)
            
            val tableNum = state.tableNumber.toIntOrNull()
            
            orderRepository.createOrder(
                customerPhone = state.phoneNumber,
                customerName = state.customerName.takeIf { it.isNotBlank() },
                items = state.items,
                orderType = state.orderType,
                tableNumber = tableNum
            ).onSuccess { order ->
                cartRepository.clearCart()
                _uiState.value = _uiState.value.copy(
                    isSubmitting = false,
                    successOrder = order
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    isSubmitting = false,
                    error = error.message ?: "Failed to place order"
                )
            }
        }
    }
}
