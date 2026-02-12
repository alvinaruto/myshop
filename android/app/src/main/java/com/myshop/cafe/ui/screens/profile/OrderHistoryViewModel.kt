package com.myshop.cafe.ui.screens.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.myshop.cafe.data.models.Order
import com.myshop.cafe.data.repository.OrderRepository
import com.myshop.cafe.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrderHistoryUiState(
    val isLoading: Boolean = false,
    val orders: List<Order> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class OrderHistoryViewModel @Inject constructor(
    private val orderRepository: OrderRepository,
    private val userRepository: UserRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrderHistoryUiState())
    val uiState: StateFlow<OrderHistoryUiState> = _uiState.asStateFlow()

    init {
        loadOrders()
    }

    fun loadOrders() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            
            // Get current user's phone number
            val session = userRepository.userSession.first()
            if (session.phoneNumber.isBlank()) {
                _uiState.update { it.copy(isLoading = false, error = "User not logged in") }
                return@launch
            }

            // Fetch orders
            val result = orderRepository.getCustomerOrders(session.phoneNumber)
            result.onSuccess { orders ->
                _uiState.update { 
                    it.copy(
                        isLoading = false, 
                        orders = orders.sortedByDescending { order -> order.createdAt }
                    ) 
                }
            }.onFailure { error ->
                _uiState.update { it.copy(isLoading = false, error = error.message) }
            }
        }
    }
}
