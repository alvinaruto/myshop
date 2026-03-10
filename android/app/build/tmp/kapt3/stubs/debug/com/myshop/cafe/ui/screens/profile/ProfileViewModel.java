package com.myshop.cafe.ui.screens.profile;

import androidx.lifecycle.ViewModel;
import com.myshop.cafe.data.models.LoyaltyData;
import com.myshop.cafe.data.models.UserSession;
import com.myshop.cafe.data.repository.LoyaltyRepository;
import com.myshop.cafe.data.repository.UserRepository;
import dagger.hilt.android.lifecycle.HiltViewModel;
import kotlinx.coroutines.flow.SharingStarted;
import kotlinx.coroutines.flow.StateFlow;
import javax.inject.Inject;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000@\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0003\b\u0007\u0018\u00002\u00020\u0001B\u0017\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u0016\u0010\u0011\u001a\u00020\u00122\u0006\u0010\u0013\u001a\u00020\u0014H\u0082@\u00a2\u0006\u0002\u0010\u0015J\u0006\u0010\u0016\u001a\u00020\u0012R\u0016\u0010\u0007\u001a\n\u0012\u0006\u0012\u0004\u0018\u00010\t0\bX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0019\u0010\n\u001a\n\u0012\u0006\u0012\u0004\u0018\u00010\t0\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\rR\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\u000e\u001a\b\u0012\u0004\u0012\u00020\u000f0\u000b\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0010\u0010\r\u00a8\u0006\u0017"}, d2 = {"Lcom/myshop/cafe/ui/screens/profile/ProfileViewModel;", "Landroidx/lifecycle/ViewModel;", "userRepository", "Lcom/myshop/cafe/data/repository/UserRepository;", "loyaltyRepository", "Lcom/myshop/cafe/data/repository/LoyaltyRepository;", "(Lcom/myshop/cafe/data/repository/UserRepository;Lcom/myshop/cafe/data/repository/LoyaltyRepository;)V", "_loyalty", "Lkotlinx/coroutines/flow/MutableStateFlow;", "Lcom/myshop/cafe/data/models/LoyaltyData;", "loyalty", "Lkotlinx/coroutines/flow/StateFlow;", "getLoyalty", "()Lkotlinx/coroutines/flow/StateFlow;", "userSession", "Lcom/myshop/cafe/data/models/UserSession;", "getUserSession", "fetchLoyalty", "", "token", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "logout", "app_debug"})
@dagger.hilt.android.lifecycle.HiltViewModel()
public final class ProfileViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.repository.UserRepository userRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.repository.LoyaltyRepository loyaltyRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.data.models.UserSession> userSession = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<com.myshop.cafe.data.models.LoyaltyData> _loyalty = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.data.models.LoyaltyData> loyalty = null;
    
    @javax.inject.Inject()
    public ProfileViewModel(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.repository.UserRepository userRepository, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.repository.LoyaltyRepository loyaltyRepository) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.data.models.UserSession> getUserSession() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.data.models.LoyaltyData> getLoyalty() {
        return null;
    }
    
    private final java.lang.Object fetchLoyalty(java.lang.String token, kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    public final void logout() {
    }
}