package com.myshop.cafe.data.repository

import com.myshop.cafe.data.models.CartItem
import com.myshop.cafe.data.models.MenuItem
import com.myshop.cafe.data.models.Size
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CartRepository @Inject constructor() {
    
    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()
    
    val totalPrice: Double
        get() = _cartItems.value.sumOf { it.totalPrice }
    
    val itemCount: Int
        get() = _cartItems.value.sumOf { it.quantity }
    
    fun addItem(menuItem: MenuItem, size: Size = Size.SMALL) {
        _cartItems.update { currentItems ->
            val existingIndex = currentItems.indexOfFirst { 
                it.menuItem.id == menuItem.id && it.size == size 
            }
            
            if (existingIndex >= 0) {
                currentItems.toMutableList().apply {
                    val existing = this[existingIndex]
                    this[existingIndex] = existing.copy(quantity = existing.quantity + 1)
                }
            } else {
                currentItems + CartItem(menuItem = menuItem, size = size)
            }
        }
    }
    
    fun updateQuantity(cartItemId: String, delta: Int) {
        _cartItems.update { currentItems ->
            currentItems.mapNotNull { item ->
                if (item.id == cartItemId) {
                    val newQuantity = item.quantity + delta
                    if (newQuantity <= 0) null else item.copy(quantity = newQuantity)
                } else {
                    item
                }
            }
        }
    }
    
    fun removeItem(cartItemId: String) {
        _cartItems.update { currentItems ->
            currentItems.filter { it.id != cartItemId }
        }
    }
    
    fun clearCart() {
        _cartItems.value = emptyList()
    }
    
    fun getItems(): List<CartItem> = _cartItems.value
}
