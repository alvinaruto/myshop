package com.myshop.cafe.ui.screens.orderstatus

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.myshop.cafe.data.models.Order
import com.myshop.cafe.data.repository.OrderRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrderStatusUiState(
    val phoneNumber: String = "",
    val searchedPhone: String = "",
    val customerOrders: List<Order> = emptyList(),
    val allOrders: List<Order> = emptyList(),
    val isLoading: Boolean = false,
    val isSearching: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class OrderStatusViewModel @Inject constructor(
    private val orderRepository: OrderRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(OrderStatusUiState())
    val uiState: StateFlow<OrderStatusUiState> = _uiState.asStateFlow()
    
    private var pollingJob: Job? = null
    private var customerPollingJob: Job? = null
    
    init {
        loadOrderQueue()
        startPolling()
    }
    
    fun setPhoneNumber(phone: String) {
        _uiState.value = _uiState.value.copy(phoneNumber = phone)
    }
    
    fun searchOrders() {
        val phone = _uiState.value.phoneNumber
        if (phone.isBlank()) return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSearching = true, error = null)
            
            orderRepository.getCustomerOrders(phone)
                .onSuccess { orders ->
                    _uiState.value = _uiState.value.copy(
                        isSearching = false,
                        searchedPhone = phone,
                        customerOrders = orders
                    )
                    startCustomerPolling(phone)
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isSearching = false,
                        error = error.message
                    )
                }
        }
    }
    
    private fun loadOrderQueue() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            orderRepository.getOrdersQueue()
                .onSuccess { orders ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        allOrders = orders
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message
                    )
                }
        }
    }
    
    private fun startPolling() {
        pollingJob?.cancel()
        pollingJob = viewModelScope.launch {
            while (isActive) {
                delay(3000)
                orderRepository.getOrdersQueue()
                    .onSuccess { orders ->
                        _uiState.value = _uiState.value.copy(allOrders = orders)
                    }
            }
        }
    }
    
    private fun startCustomerPolling(phone: String) {
        customerPollingJob?.cancel()
        customerPollingJob = viewModelScope.launch {
            while (isActive) {
                delay(5000)
                orderRepository.getCustomerOrders(phone)
                    .onSuccess { orders ->
                        _uiState.value = _uiState.value.copy(customerOrders = orders)
                    }
            }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    override fun onCleared() {
        super.onCleared()
        pollingJob?.cancel()
        customerPollingJob?.cancel()
    }
}
