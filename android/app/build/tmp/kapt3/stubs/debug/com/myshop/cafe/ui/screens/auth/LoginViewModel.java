package com.myshop.cafe.ui.screens.auth;

import android.content.ClipboardManager;
import android.content.Context;
import androidx.lifecycle.ViewModel;
import com.myshop.cafe.data.api.ApiService;
import com.myshop.cafe.data.models.RequestOtpRequest;
import com.myshop.cafe.data.models.VerifyOtpRequest;
import com.myshop.cafe.data.repository.UserRepository;
import com.myshop.cafe.services.OtpDetectionRegistry;
import dagger.hilt.android.lifecycle.HiltViewModel;
import dagger.hilt.android.qualifiers.ApplicationContext;
import kotlinx.coroutines.flow.*;
import javax.inject.Inject;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000@\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0002\b\u0006\n\u0002\u0010\u000e\n\u0002\b\u0005\b\u0007\u0018\u00002\u00020\u0001B!\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u0012\b\b\u0001\u0010\u0006\u001a\u00020\u0007\u00a2\u0006\u0002\u0010\bJ\u0006\u0010\u0010\u001a\u00020\u0011J\u0006\u0010\u0012\u001a\u00020\u0011J\u0006\u0010\u0013\u001a\u00020\u0011J\u0006\u0010\u0014\u001a\u00020\u0011J\b\u0010\u0015\u001a\u00020\u0011H\u0002J\u000e\u0010\u0016\u001a\u00020\u00112\u0006\u0010\u0017\u001a\u00020\u0018J\u000e\u0010\u0019\u001a\u00020\u00112\u0006\u0010\u001a\u001a\u00020\u0018J\u0006\u0010\u001b\u001a\u00020\u0011J\u0006\u0010\u001c\u001a\u00020\u0011R\u0014\u0010\t\u001a\b\u0012\u0004\u0012\u00020\u000b0\nX\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0007X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0017\u0010\f\u001a\b\u0012\u0004\u0012\u00020\u000b0\r\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000e\u0010\u000fR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u001d"}, d2 = {"Lcom/myshop/cafe/ui/screens/auth/LoginViewModel;", "Landroidx/lifecycle/ViewModel;", "userRepository", "Lcom/myshop/cafe/data/repository/UserRepository;", "apiService", "Lcom/myshop/cafe/data/api/ApiService;", "context", "Landroid/content/Context;", "(Lcom/myshop/cafe/data/repository/UserRepository;Lcom/myshop/cafe/data/api/ApiService;Landroid/content/Context;)V", "_uiState", "Lkotlinx/coroutines/flow/MutableStateFlow;", "Lcom/myshop/cafe/ui/screens/auth/LoginUiState;", "uiState", "Lkotlinx/coroutines/flow/StateFlow;", "getUiState", "()Lkotlinx/coroutines/flow/StateFlow;", "autoFillOtpFromClipboard", "", "backToPhone", "checkNotificationServiceStatus", "clearError", "observeNotificationOtp", "onOtpCodeChange", "otp", "", "onPhoneNumberChange", "phone", "requestOtp", "verifyOtp", "app_debug"})
@dagger.hilt.android.lifecycle.HiltViewModel()
public final class LoginViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.repository.UserRepository userRepository = null;
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.api.ApiService apiService = null;
    @org.jetbrains.annotations.NotNull()
    private final android.content.Context context = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.MutableStateFlow<com.myshop.cafe.ui.screens.auth.LoginUiState> _uiState = null;
    @org.jetbrains.annotations.NotNull()
    private final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.ui.screens.auth.LoginUiState> uiState = null;
    
    @javax.inject.Inject()
    public LoginViewModel(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.repository.UserRepository userRepository, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.api.ApiService apiService, @dagger.hilt.android.qualifiers.ApplicationContext()
    @org.jetbrains.annotations.NotNull()
    android.content.Context context) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.StateFlow<com.myshop.cafe.ui.screens.auth.LoginUiState> getUiState() {
        return null;
    }
    
    private final void observeNotificationOtp() {
    }
    
    public final void checkNotificationServiceStatus() {
    }
    
    public final void onPhoneNumberChange(@org.jetbrains.annotations.NotNull()
    java.lang.String phone) {
    }
    
    public final void onOtpCodeChange(@org.jetbrains.annotations.NotNull()
    java.lang.String otp) {
    }
    
    /**
     * Reads clipboard and auto-fills OTP if a 6-digit numeric code is found
     */
    public final void autoFillOtpFromClipboard() {
    }
    
    public final void requestOtp() {
    }
    
    public final void verifyOtp() {
    }
    
    public final void backToPhone() {
    }
    
    public final void clearError() {
    }
}