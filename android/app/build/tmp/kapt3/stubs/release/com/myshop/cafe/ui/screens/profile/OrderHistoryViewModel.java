package com.myshop.cafe.ui.screens.profile;

import androidx.lifecycle.ViewModel;
import com.myshop.cafe.data.models.Order;
import com.myshop.cafe.data.repository.OrderRepository;
import com.myshop.cafe.data.repository.UserRepository;
import dagger.hilt.android.lifecycle.HiltViewModel;
import kotlinx.coroutines.flow.*;
import javax.inject.Inject;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0000\b\u0007\u0018\u00002\u00020\u0001B\u0017\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u0006\u0010\u000e\u001a\u00020\u000fR\u0014\u0010\u0007\u001a\b\u0012\u0004\u0012\u00020\t0\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\n\u001a\b\u0012\u0004\u0012\u00020\t0\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\rR\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0010"}, d2 = {"Lcom/myshop/cafe/ui/screens/profile/OrderHistoryViewModel;", "Landroidx/lifecycle/ViewModel;", "orderRepository", "Lcom/myshop/cafe/data/repository/OrderRepository;", "userRepository", "Lcom/myshop/cafe/data/repository/UserRepository;", "(Lcom/myshop/cafe/data/repository/OrderRepository;Lcom/myshop/cafe/data/repository/UserRepository;)V", "_uiState", "Lkotlinx/coroutines/flow/MutableStateFlow;", "Lcom/myshop/cafe/ui/screens/profile/OrderHistoryUiState;", "uiState", "Lkotlinx/coroutines/flow/StateFlow;", "getUiState", "()Lkotlinx/coroutines/flow/StateFlow;", "loadOrders", "", "app_release"})
@dagger.hilt.android.lifecycle.HiltViewModel()
public final class OrderHistoryViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.repository.OrderRepository orderRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.repository.UserRepository userRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<com.myshop.cafe.ui.screens.profile.OrderHistoryUiState> _uiState = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.ui.screens.profile.OrderHistoryUiState> uiState = null;
    
    @javax.inject.Inject()
    public OrderHistoryViewModel(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.repository.OrderRepository orderRepository, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.repository.UserRepository userRepository) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.ui.screens.profile.OrderHistoryUiState> getUiState() {
        return null;
    }
    
    public final void loadOrders() {
    }
}