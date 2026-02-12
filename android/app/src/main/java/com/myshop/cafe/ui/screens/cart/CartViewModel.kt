package com.myshop.cafe.ui.screens.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.myshop.cafe.data.models.CartItem
import com.myshop.cafe.data.repository.CartRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CartUiState(
    val items: List<CartItem> = emptyList(),
    val totalPrice: Double = 0.0
)

@HiltViewModel
class CartViewModel @Inject constructor(
    private val cartRepository: CartRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(CartUiState())
    val uiState: StateFlow<CartUiState> = _uiState.asStateFlow()
    
    init {
        observeCart()
    }
    
    private fun observeCart() {
        viewModelScope.launch {
            cartRepository.cartItems.collect { items ->
                _uiState.value = CartUiState(
                    items = items,
                    totalPrice = items.sumOf { it.totalPrice }
                )
            }
        }
    }
    
    fun updateQuantity(cartItemId: String, delta: Int) {
        cartRepository.updateQuantity(cartItemId, delta)
    }
    
    fun removeItem(cartItemId: String) {
        cartRepository.removeItem(cartItemId)
    }
    
    fun clearCart() {
        cartRepository.clearCart()
    }
}
