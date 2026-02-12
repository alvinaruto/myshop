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

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00006\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u000b\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0010\b\n\u0000\n\u0002\u0010\u0006\n\u0000\n\u0002\u0018\u0002\n\u0002\b&\b\u0086\b\u0018\u00002\u00020\u0001B\u0087\u0001\u0012\b\b\u0002\u0010\u0002\u001a\u00020\u0003\u0012\u000e\b\u0002\u0010\u0004\u001a\b\u0012\u0004\u0012\u00020\u00060\u0005\u0012\n\b\u0002\u0010\u0007\u001a\u0004\u0018\u00010\b\u0012\n\b\u0002\u0010\t\u001a\u0004\u0018\u00010\b\u0012\b\b\u0002\u0010\n\u001a\u00020\u000b\u0012\b\b\u0002\u0010\f\u001a\u00020\r\u0012\n\b\u0002\u0010\u000e\u001a\u0004\u0018\u00010\u000f\u0012\n\b\u0002\u0010\u0010\u001a\u0004\u0018\u00010\b\u0012\b\b\u0002\u0010\u0011\u001a\u00020\b\u0012\b\b\u0002\u0010\u0012\u001a\u00020\u0003\u0012\u000e\b\u0002\u0010\u0013\u001a\b\u0012\u0004\u0012\u00020\u000f0\u0005\u00a2\u0006\u0002\u0010\u0014J\t\u0010%\u001a\u00020\u0003H\u00c6\u0003J\t\u0010&\u001a\u00020\u0003H\u00c6\u0003J\u000f\u0010\'\u001a\b\u0012\u0004\u0012\u00020\u000f0\u0005H\u00c6\u0003J\u000f\u0010(\u001a\b\u0012\u0004\u0012\u00020\u00060\u0005H\u00c6\u0003J\u000b\u0010)\u001a\u0004\u0018\u00010\bH\u00c6\u0003J\u000b\u0010*\u001a\u0004\u0018\u00010\bH\u00c6\u0003J\t\u0010+\u001a\u00020\u000bH\u00c6\u0003J\t\u0010,\u001a\u00020\rH\u00c6\u0003J\u000b\u0010-\u001a\u0004\u0018\u00010\u000fH\u00c6\u0003J\u000b\u0010.\u001a\u0004\u0018\u00010\bH\u00c6\u0003J\t\u0010/\u001a\u00020\bH\u00c6\u0003J\u008b\u0001\u00100\u001a\u00020\u00002\b\b\u0002\u0010\u0002\u001a\u00020\u00032\u000e\b\u0002\u0010\u0004\u001a\b\u0012\u0004\u0012\u00020\u00060\u00052\n\b\u0002\u0010\u0007\u001a\u0004\u0018\u00010\b2\n\b\u0002\u0010\t\u001a\u0004\u0018\u00010\b2\b\b\u0002\u0010\n\u001a\u00020\u000b2\b\b\u0002\u0010\f\u001a\u00020\r2\n\b\u0002\u0010\u000e\u001a\u0004\u0018\u00010\u000f2\n\b\u0002\u0010\u0010\u001a\u0004\u0018\u00010\b2\b\b\u0002\u0010\u0011\u001a\u00020\b2\b\b\u0002\u0010\u0012\u001a\u00020\u00032\u000e\b\u0002\u0010\u0013\u001a\b\u0012\u0004\u0012\u00020\u000f0\u0005H\u00c6\u0001J\u0013\u00101\u001a\u00020\u00032\b\u00102\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u00103\u001a\u00020\u000bH\u00d6\u0001J\t\u00104\u001a\u00020\bH\u00d6\u0001R\u0011\u0010\n\u001a\u00020\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0015\u0010\u0016R\u0011\u0010\f\u001a\u00020\r\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0017\u0010\u0018R\u0017\u0010\u0004\u001a\b\u0012\u0004\u0012\u00020\u00060\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0019\u0010\u001aR\u0013\u0010\t\u001a\u0004\u0018\u00010\b\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001b\u0010\u001cR\u0017\u0010\u0013\u001a\b\u0012\u0004\u0012\u00020\u000f0\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001d\u0010\u001aR\u0011\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0002\u0010\u001eR\u0011\u0010\u0011\u001a\u00020\b\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001f\u0010\u001cR\u0013\u0010\u0007\u001a\u0004\u0018\u00010\b\u00a2\u0006\b\n\u0000\u001a\u0004\b \u0010\u001cR\u0013\u0010\u000e\u001a\u0004\u0018\u00010\u000f\u00a2\u0006\b\n\u0000\u001a\u0004\b!\u0010\"R\u0011\u0010\u0012\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b#\u0010\u001eR\u0013\u0010\u0010\u001a\u0004\u0018\u00010\b\u00a2\u0006\b\n\u0000\u001a\u0004\b$\u0010\u001c\u00a8\u00065"}, d2 = {"Lcom/myshop/cafe/ui/screens/menu/MenuUiState;", "", "isLoading", "", "categories", "", "Lcom/myshop/cafe/data/models/MenuCategory;", "selectedCategoryId", "", "error", "cartItemCount", "", "cartTotal", "", "selectedItem", "Lcom/myshop/cafe/data/models/MenuItem;", "showToast", "searchQuery", "showScannerDialog", "filteredItems", "(ZLjava/util/List;Ljava/lang/String;Ljava/lang/String;IDLcom/myshop/cafe/data/models/MenuItem;Ljava/lang/String;Ljava/lang/String;ZLjava/util/List;)V", "getCartItemCount", "()I", "getCartTotal", "()D", "getCategories", "()Ljava/util/List;", "getError", "()Ljava/lang/String;", "getFilteredItems", "()Z", "getSearchQuery", "getSelectedCategoryId", "getSelectedItem", "()Lcom/myshop/cafe/data/models/MenuItem;", "getShowScannerDialog", "getShowToast", "component1", "component10", "component11", "component2", "component3", "component4", "component5", "component6", "component7", "component8", "component9", "copy", "equals", "other", "hashCode", "toString", "app_release"})
public final class MenuUiState {
    private final boolean isLoading = false;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<com.myshop.cafe.data.models.MenuCategory> categories = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String selectedCategoryId = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String error = null;
    private final int cartItemCount = 0;
    private final double cartTotal = 0.0;
    @org.jetbrains.annotations.Nullable()
    private final com.myshop.cafe.data.models.MenuItem selectedItem = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String showToast = null;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String searchQuery = null;
    private final boolean showScannerDialog = false;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<com.myshop.cafe.data.models.MenuItem> filteredItems = null;
    
    public MenuUiState(boolean isLoading, @org.jetbrains.annotations.NotNull()
    java.util.List<com.myshop.cafe.data.models.MenuCategory> categories, @org.jetbrains.annotations.Nullable()
    java.lang.String selectedCategoryId, @org.jetbrains.annotations.Nullable()
    java.lang.String error, int cartItemCount, double cartTotal, @org.jetbrains.annotations.Nullable()
    com.myshop.cafe.data.models.MenuItem selectedItem, @org.jetbrains.annotations.Nullable()
    java.lang.String showToast, @org.jetbrains.annotations.NotNull()
    java.lang.String searchQuery, boolean showScannerDialog, @org.jetbrains.annotations.NotNull()
    java.util.List<com.myshop.cafe.data.models.MenuItem> filteredItems) {
        super();
    }
    
    public final boolean isLoading() {
        return false;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.myshop.cafe.data.models.MenuCategory> getCategories() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getSelectedCategoryId() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getError() {
        return null;
    }
    
    public final int getCartItemCount() {
        return 0;
    }
    
    public final double getCartTotal() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final com.myshop.cafe.data.models.MenuItem getSelectedItem() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getShowToast() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getSearchQuery() {
        return null;
    }
    
    public final boolean getShowScannerDialog() {
        return false;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.myshop.cafe.data.models.MenuItem> getFilteredItems() {
        return null;
    }
    
    public MenuUiState() {
        super();
    }
    
    public final boolean component1() {
        return false;
    }
    
    public final boolean component10() {
        return false;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.myshop.cafe.data.models.MenuItem> component11() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.myshop.cafe.data.models.MenuCategory> component2() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component3() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component4() {
        return null;
    }
    
    public final int component5() {
        return 0;
    }
    
    public final double component6() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final com.myshop.cafe.data.models.MenuItem component7() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component8() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component9() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.myshop.cafe.ui.screens.menu.MenuUiState copy(boolean isLoading, @org.jetbrains.annotations.NotNull()
    java.util.List<com.myshop.cafe.data.models.MenuCategory> categories, @org.jetbrains.annotations.Nullable()
    java.lang.String selectedCategoryId, @org.jetbrains.annotations.Nullable()
    java.lang.String error, int cartItemCount, double cartTotal, @org.jetbrains.annotations.Nullable()
    com.myshop.cafe.data.models.MenuItem selectedItem, @org.jetbrains.annotations.Nullable()
    java.lang.String showToast, @org.jetbrains.annotations.NotNull()
    java.lang.String searchQuery, boolean showScannerDialog, @org.jetbrains.annotations.NotNull()
    java.util.List<com.myshop.cafe.data.models.MenuItem> filteredItems) {
        return null;
    }
    
    @java.lang.Override()
    public boolean equals(@org.jetbrains.annotations.Nullable()
    java.lang.Object other) {
        return false;
    }
    
    @java.lang.Override()
    public int hashCode() {
        return 0;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public java.lang.String toString() {
        return null;
    }
}