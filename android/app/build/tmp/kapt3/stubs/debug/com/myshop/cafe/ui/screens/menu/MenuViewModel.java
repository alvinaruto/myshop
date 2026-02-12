package com.myshop.cafe.ui.screens.menu;

import androidx.lifecycle.ViewModel;
import com.myshop.cafe.data.models.MenuCategory;
import com.myshop.cafe.data.models.MenuItem;
import com.myshop.cafe.data.models.Size;
import com.myshop.cafe.data.repository.CartRepository;
import com.myshop.cafe.data.repository.MenuRepository;
import dagger.hilt.android.lifecycle.HiltViewModel;
import kotlinx.coroutines.flow.StateFlow;
import javax.inject.Inject;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000N\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0010\u000e\n\u0002\b\u0006\n\u0002\u0010\u000b\n\u0002\b\u0002\b\u0007\u0018\u00002\u00020\u0001B\u0017\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u0016\u0010\u000e\u001a\u00020\u000f2\u0006\u0010\u0010\u001a\u00020\u00112\u0006\u0010\u0012\u001a\u00020\u0013J\u0006\u0010\u0014\u001a\u00020\u000fJ\u0006\u0010\u0015\u001a\u00020\u000fJ\b\u0010\u0016\u001a\u00020\u000fH\u0002J\u000e\u0010\u0017\u001a\u00020\u000f2\u0006\u0010\u0018\u001a\u00020\u0019J\u000e\u0010\u001a\u001a\u00020\u000f2\u0006\u0010\u0010\u001a\u00020\u0011J\u000e\u0010\u001b\u001a\u00020\u000f2\u0006\u0010\u001c\u001a\u00020\u0019J\u0010\u0010\u001d\u001a\u00020\u000f2\b\u0010\u0010\u001a\u0004\u0018\u00010\u0011J\u000e\u0010\u001e\u001a\u00020\u000f2\u0006\u0010\u001f\u001a\u00020 J\b\u0010!\u001a\u00020\u000fH\u0002R\u0014\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\n\u001a\b\u0012\u0004\u0012\u00020\t0\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\r\u00a8\u0006\""}, d2 = {"Lcom/myshop/cafe/ui/screens/menu/MenuViewModel;", "Landroidx/lifecycle/ViewModel;", "menuRepository", "Lcom/myshop/cafe/data/repository/MenuRepository;", "cartRepository", "Lcom/myshop/cafe/data/repository/CartRepository;", "(Lcom/myshop/cafe/data/repository/MenuRepository;Lcom/myshop/cafe/data/repository/CartRepository;)V", "_uiState", "Lkotlinx/coroutines/flow/MutableStateFlow;", "Lcom/myshop/cafe/ui/screens/menu/MenuUiState;", "uiState", "Lkotlinx/coroutines/flow/StateFlow;", "getUiState", "()Lkotlinx/coroutines/flow/StateFlow;", "addToCart", "", "item", "Lcom/myshop/cafe/data/models/MenuItem;", "size", "Lcom/myshop/cafe/data/models/Size;", "clearToast", "loadMenu", "observeCart", "onSearchQueryChange", "query", "", "quickAdd", "selectCategory", "categoryId", "selectItem", "toggleScanner", "show", "", "updateFilteredItems", "app_debug"})
@dagger.hilt.android.lifecycle.HiltViewModel()
public final class MenuViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.repository.MenuRepository menuRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.repository.CartRepository cartRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<com.myshop.cafe.ui.screens.menu.MenuUiState> _uiState = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.ui.screens.menu.MenuUiState> uiState = null;
    
    @javax.inject.Inject()
    public MenuViewModel(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.repository.MenuRepository menuRepository, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.repository.CartRepository cartRepository) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.ui.screens.menu.MenuUiState> getUiState() {
        return null;
    }
    
    private final void observeCart() {
    }
    
    public final void loadMenu() {
    }
    
    public final void selectCategory(@org.jetbrains.annotations.NotNull()
    java.lang.String categoryId) {
    }
    
    public final void selectItem(@org.jetbrains.annotations.Nullable()
    com.myshop.cafe.data.models.MenuItem item) {
    }
    
    public final void addToCart(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.MenuItem item, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.Size size) {
    }
    
    public final void quickAdd(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.MenuItem item) {
    }
    
    public final void clearToast() {
    }
    
    public final void onSearchQueryChange(@org.jetbrains.annotations.NotNull()
    java.lang.String query) {
    }
    
    private final void updateFilteredItems() {
    }
    
    public final void toggleScanner(boolean show) {
    }
}