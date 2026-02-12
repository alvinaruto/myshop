package com.myshop.cafe.data.repository;

import com.myshop.cafe.data.models.CartItem;
import com.myshop.cafe.data.models.MenuItem;
import com.myshop.cafe.data.models.Size;
import kotlinx.coroutines.flow.StateFlow;
import javax.inject.Inject;
import javax.inject.Singleton;

@javax.inject.Singleton()
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000N\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\b\n\u0002\b\u0003\n\u0002\u0010\u0006\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0010\u000e\n\u0002\b\u0003\b\u0007\u0018\u00002\u00020\u0001B\u0007\b\u0007\u00a2\u0006\u0002\u0010\u0002J\u0018\u0010\u0013\u001a\u00020\u00142\u0006\u0010\u0015\u001a\u00020\u00162\b\b\u0002\u0010\u0017\u001a\u00020\u0018J\u0006\u0010\u0019\u001a\u00020\u0014J\f\u0010\u001a\u001a\b\u0012\u0004\u0012\u00020\u00060\u0005J\u000e\u0010\u001b\u001a\u00020\u00142\u0006\u0010\u001c\u001a\u00020\u001dJ\u0016\u0010\u001e\u001a\u00020\u00142\u0006\u0010\u001c\u001a\u00020\u001d2\u0006\u0010\u001f\u001a\u00020\fR\u001a\u0010\u0003\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00060\u00050\u0004X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u001d\u0010\u0007\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u00060\u00050\b\u00a2\u0006\b\n\u0000\u001a\u0004\b\t\u0010\nR\u0011\u0010\u000b\u001a\u00020\f8F\u00a2\u0006\u0006\u001a\u0004\b\r\u0010\u000eR\u0011\u0010\u000f\u001a\u00020\u00108F\u00a2\u0006\u0006\u001a\u0004\b\u0011\u0010\u0012\u00a8\u0006 "}, d2 = {"Lcom/myshop/cafe/data/repository/CartRepository;", "", "()V", "_cartItems", "Lkotlinx/coroutines/flow/MutableStateFlow;", "", "Lcom/myshop/cafe/data/models/CartItem;", "cartItems", "Lkotlinx/coroutines/flow/StateFlow;", "getCartItems", "()Lkotlinx/coroutines/flow/StateFlow;", "itemCount", "", "getItemCount", "()I", "totalPrice", "", "getTotalPrice", "()D", "addItem", "", "menuItem", "Lcom/myshop/cafe/data/models/MenuItem;", "size", "Lcom/myshop/cafe/data/models/Size;", "clearCart", "getItems", "removeItem", "cartItemId", "", "updateQuantity", "delta", "app_release"})
public final class CartRepository {
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<java.util.List<com.myshop.cafe.data.models.CartItem>> _cartItems = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<java.util.List<com.myshop.cafe.data.models.CartItem>> cartItems = null;
    
    @javax.inject.Inject()
    public CartRepository() {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<java.util.List<com.myshop.cafe.data.models.CartItem>> getCartItems() {
        return null;
    }
    
    public final double getTotalPrice() {
        return 0.0;
    }
    
    public final int getItemCount() {
        return 0;
    }
    
    public final void addItem(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.MenuItem menuItem, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.Size size) {
    }
    
    public final void updateQuantity(@org.jetbrains.annotations.NotNull()
    java.lang.String cartItemId, int delta) {
    }
    
    public final void removeItem(@org.jetbrains.annotations.NotNull()
    java.lang.String cartItemId) {
    }
    
    public final void clearCart() {
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.myshop.cafe.data.models.CartItem> getItems() {
        return null;
    }
}