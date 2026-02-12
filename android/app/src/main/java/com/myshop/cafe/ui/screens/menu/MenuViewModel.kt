package com.myshop.cafe.ui.screens.menu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.myshop.cafe.data.models.MenuCategory
import com.myshop.cafe.data.models.MenuItem
import com.myshop.cafe.data.models.Size
import com.myshop.cafe.data.repository.CartRepository
import com.myshop.cafe.data.repository.MenuRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MenuUiState(
    val isLoading: Boolean = true,
    val categories: List<MenuCategory> = emptyList(),
    val selectedCategoryId: String? = null,
    val error: String? = null,
    val cartItemCount: Int = 0,
    val cartTotal: Double = 0.0,
    val selectedItem: MenuItem? = null,
    val showToast: String? = null,
    val searchQuery: String = "",
    val showScannerDialog: Boolean = false,
    val filteredItems: List<MenuItem> = emptyList()
)

@HiltViewModel
class MenuViewModel @Inject constructor(
    private val menuRepository: MenuRepository,
    private val cartRepository: CartRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(MenuUiState())
    val uiState: StateFlow<MenuUiState> = _uiState.asStateFlow()
    
    init {
        loadMenu()
        observeCart()
    }
    
    private fun observeCart() {
        viewModelScope.launch {
            cartRepository.cartItems.collect { items ->
                _uiState.value = _uiState.value.copy(
                    cartItemCount = items.sumOf { it.quantity },
                    cartTotal = items.sumOf { it.totalPrice }
                )
            }
        }
    }
    
    fun loadMenu() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            menuRepository.getCategoriesWithItems()
                .onSuccess { categories ->
                    val selectedId = categories.firstOrNull()?.id
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        categories = categories,
                        selectedCategoryId = selectedId
                    )
                    updateFilteredItems()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Failed to load menu"
                    )
                }
        }
    }
    
    fun selectCategory(categoryId: String) {
        _uiState.value = _uiState.value.copy(selectedCategoryId = categoryId)
        updateFilteredItems()
    }
    
    fun selectItem(item: MenuItem?) {
        _uiState.value = _uiState.value.copy(selectedItem = item)
    }
    
    fun addToCart(item: MenuItem, size: Size) {
        cartRepository.addItem(item, size)
        _uiState.value = _uiState.value.copy(
            selectedItem = null,
            showToast = "Added ${item.name} to cart!"
        )
    }
    
    fun quickAdd(item: MenuItem) {
        cartRepository.addItem(item, Size.SMALL)
        _uiState.value = _uiState.value.copy(
            showToast = "Added ${item.name} to cart!"
        )
    }
    
    fun clearToast() {
        _uiState.value = _uiState.value.copy(showToast = null)
    }

    fun onSearchQueryChange(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        updateFilteredItems()
    }

    private fun updateFilteredItems() {
        val state = _uiState.value
        val items = if (state.searchQuery.isBlank()) {
            state.categories.find { it.id == state.selectedCategoryId }?.items ?: emptyList()
        } else {
            state.categories.flatMap { it.items ?: emptyList() }
                .filter { it.name.contains(state.searchQuery, ignoreCase = true) }
        }
        _uiState.value = _uiState.value.copy(filteredItems = items)
    }

    fun toggleScanner(show: Boolean) {
        _uiState.value = _uiState.value.copy(showScannerDialog = show)
    }
}
