package com.myshop.cafe.ui.screens.checkout;

import androidx.lifecycle.ViewModel;
import com.myshop.cafe.data.models.CartItem;
import com.myshop.cafe.data.models.Order;
import com.myshop.cafe.data.models.OrderType;
import com.myshop.cafe.data.repository.CartRepository;
import com.myshop.cafe.data.repository.OrderRepository;
import com.myshop.cafe.data.repository.UserRepository;
import dagger.hilt.android.lifecycle.HiltViewModel;
import kotlinx.coroutines.flow.StateFlow;
import com.myshop.cafe.utils.KhqrUtil;
import javax.inject.Inject;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000V\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0002\b\u0004\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\n\b\u0007\u0018\u00002\u00020\u0001B\u001f\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u0012\u0006\u0010\u0006\u001a\u00020\u0007\u00a2\u0006\u0002\u0010\bJ\u0006\u0010\u0012\u001a\u00020\u0013J\b\u0010\u0014\u001a\u00020\u0013H\u0002J\b\u0010\u0015\u001a\u00020\u0013H\u0002J\u0010\u0010\u0016\u001a\u00020\u00132\b\b\u0002\u0010\u0017\u001a\u00020\u0018J\u000e\u0010\u0019\u001a\u00020\u00132\u0006\u0010\u001a\u001a\u00020\u001bJ\u000e\u0010\u001c\u001a\u00020\u00132\u0006\u0010\u001d\u001a\u00020\u001eJ\u000e\u0010\u001f\u001a\u00020\u00132\u0006\u0010 \u001a\u00020\u001bJ\u000e\u0010!\u001a\u00020\u00132\u0006\u0010\"\u001a\u00020\u001bJ\u000e\u0010#\u001a\u00020\u00132\u0006\u0010$\u001a\u00020\u0018J\u0010\u0010%\u001a\u00020\u00132\u0006\u0010&\u001a\u00020\u001bH\u0002J\b\u0010\'\u001a\u00020\u0013H\u0002R\u0014\u0010\t\u001a\b\u0012\u0004\u0012\u00020\u000b0\nX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0010\u0010\f\u001a\u0004\u0018\u00010\rX\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u0017\u0010\u000e\u001a\b\u0012\u0004\u0012\u00020\u000b0\u000f\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0010\u0010\u0011R\u000e\u0010\u0006\u001a\u00020\u0007X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006("}, d2 = {"Lcom/myshop/cafe/ui/screens/checkout/CheckoutViewModel;", "Landroidx/lifecycle/ViewModel;", "cartRepository", "Lcom/myshop/cafe/data/repository/CartRepository;", "orderRepository", "Lcom/myshop/cafe/data/repository/OrderRepository;", "userRepository", "Lcom/myshop/cafe/data/repository/UserRepository;", "(Lcom/myshop/cafe/data/repository/CartRepository;Lcom/myshop/cafe/data/repository/OrderRepository;Lcom/myshop/cafe/data/repository/UserRepository;)V", "_uiState", "Lkotlinx/coroutines/flow/MutableStateFlow;", "Lcom/myshop/cafe/ui/screens/checkout/CheckoutUiState;", "pollingJob", "Lkotlinx/coroutines/Job;", "uiState", "Lkotlinx/coroutines/flow/StateFlow;", "getUiState", "()Lkotlinx/coroutines/flow/StateFlow;", "clearError", "", "observeCart", "observeUserSession", "placeOrder", "isPaid", "", "setCustomerName", "customerName", "", "setOrderType", "orderType", "Lcom/myshop/cafe/data/models/OrderType;", "setPhoneNumber", "phoneNumber", "setTableNumber", "tableNumber", "showKhqr", "show", "startPaymentPolling", "md5", "stopPolling", "app_release"})
@dagger.hilt.android.lifecycle.HiltViewModel()
public final class CheckoutViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.repository.CartRepository cartRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.repository.OrderRepository orderRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.repository.UserRepository userRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<com.myshop.cafe.ui.screens.checkout.CheckoutUiState> _uiState = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.ui.screens.checkout.CheckoutUiState> uiState = null;
    @org.jetbrains.annotations.Nullable()
    private kotlinx.coroutines.Job pollingJob;
    
    @javax.inject.Inject()
    public CheckoutViewModel(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.repository.CartRepository cartRepository, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.repository.OrderRepository orderRepository, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.repository.UserRepository userRepository) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.ui.screens.checkout.CheckoutUiState> getUiState() {
        return null;
    }
    
    private final void observeUserSession() {
    }
    
    private final void observeCart() {
    }
    
    public final void setOrderType(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.OrderType orderType) {
    }
    
    public final void setTableNumber(@org.jetbrains.annotations.NotNull()
    java.lang.String tableNumber) {
    }
    
    public final void setPhoneNumber(@org.jetbrains.annotations.NotNull()
    java.lang.String phoneNumber) {
    }
    
    public final void setCustomerName(@org.jetbrains.annotations.NotNull()
    java.lang.String customerName) {
    }
    
    public final void clearError() {
    }
    
    public final void showKhqr(boolean show) {
    }
    
    private final void startPaymentPolling(java.lang.String md5) {
    }
    
    private final void stopPolling() {
    }
    
    public final void placeOrder(boolean isPaid) {
    }
}