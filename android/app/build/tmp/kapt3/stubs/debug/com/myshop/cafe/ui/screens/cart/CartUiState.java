package com.myshop.cafe.ui.screens.cart;

import androidx.lifecycle.ViewModel;
import com.myshop.cafe.data.models.CartItem;
import com.myshop.cafe.data.repository.CartRepository;
import dagger.hilt.android.lifecycle.HiltViewModel;
import kotlinx.coroutines.flow.StateFlow;
import javax.inject.Inject;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00000\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0006\n\u0002\b\t\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0010\b\n\u0000\n\u0002\u0010\u000e\n\u0000\b\u0086\b\u0018\u00002\u00020\u0001B\u001f\u0012\u000e\b\u0002\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u0012\b\b\u0002\u0010\u0005\u001a\u00020\u0006\u00a2\u0006\u0002\u0010\u0007J\u000f\u0010\f\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003H\u00c6\u0003J\t\u0010\r\u001a\u00020\u0006H\u00c6\u0003J#\u0010\u000e\u001a\u00020\u00002\u000e\b\u0002\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u00032\b\b\u0002\u0010\u0005\u001a\u00020\u0006H\u00c6\u0001J\u0013\u0010\u000f\u001a\u00020\u00102\b\u0010\u0011\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u0010\u0012\u001a\u00020\u0013H\u00d6\u0001J\t\u0010\u0014\u001a\u00020\u0015H\u00d6\u0001R\u0017\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\b\u0010\tR\u0011\u0010\u0005\u001a\u00020\u0006\u00a2\u0006\b\n\u0000\u001a\u0004\b\n\u0010\u000b\u00a8\u0006\u0016"}, d2 = {"Lcom/myshop/cafe/ui/screens/cart/CartUiState;", "", "items", "", "Lcom/myshop/cafe/data/models/CartItem;", "totalPrice", "", "(Ljava/util/List;D)V", "getItems", "()Ljava/util/List;", "getTotalPrice", "()D", "component1", "component2", "copy", "equals", "", "other", "hashCode", "", "toString", "", "app_debug"})
public final class CartUiState {
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<com.myshop.cafe.data.models.CartItem> items = null;
    private final double totalPrice = 0.0;
    
    public CartUiState(@org.jetbrains.annotations.NotNull()
    java.util.List<com.myshop.cafe.data.models.CartItem> items, double totalPrice) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.myshop.cafe.data.models.CartItem> getItems() {
        return null;
    }
    
    public final double getTotalPrice() {
        return 0.0;
    }
    
    public CartUiState() {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.myshop.cafe.data.models.CartItem> component1() {
        return null;
    }
    
    public final double component2() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.myshop.cafe.ui.screens.cart.CartUiState copy(@org.jetbrains.annotations.NotNull()
    java.util.List<com.myshop.cafe.data.models.CartItem> items, double totalPrice) {
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