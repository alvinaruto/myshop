package com.myshop.cafe.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.myshop.cafe.data.api.ApiService
import com.myshop.cafe.data.models.RequestOtpRequest
import com.myshop.cafe.data.models.VerifyOtpRequest
import com.myshop.cafe.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LoginUiState(
    val phoneNumber: String = "",
    val otpCode: String = "",
    val isLoading: Boolean = false,
    val isOtpSent: Boolean = false,
    val error: String? = null,
    val isLoginSuccess: Boolean = false,
    val isTelegramLinked: Boolean = true,
    val botUrl: String? = null
)

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun onPhoneNumberChange(phone: String) {
        _uiState.value = _uiState.value.copy(phoneNumber = phone)
    }

    fun onOtpCodeChange(otp: String) {
        if (otp.length <= 6) {
            _uiState.value = _uiState.value.copy(otpCode = otp)
        }
    }

    fun requestOtp() {
        val phone = _uiState.value.phoneNumber
        if (phone.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Please enter phone number")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = apiService.requestOtp(RequestOtpRequest(phone))
                if (response.success) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isOtpSent = true,
                        isTelegramLinked = response.data?.telegram_linked ?: true,
                        botUrl = response.data?.bot_url,
                        error = null
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = response.message
                    )
                }
            } catch (e: Exception) {
                val message = e.message ?: ""
                val friendlyError = when {
                    message.contains("401") -> "Invalid verification code"
                    message.contains("404") -> "Customer not found"
                    message.contains("Unable to resolve host") -> "No internet connection"
                    else -> "Failed to connect to server"
                }
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = friendlyError
                )
            }
        }
    }

    fun verifyOtp() {
        val state = _uiState.value
        if (state.otpCode.length < 6) {
            _uiState.value = _uiState.value.copy(error = "Please enter 6-digit code")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = apiService.verifyOtp(VerifyOtpRequest(state.phoneNumber, state.otpCode))
                if (response.success && response.data != null) {
                    val authData = response.data
                    userRepository.login(
                        phoneNumber = authData.customer.phone,
                        customerName = authData.customer.name,
                        token = authData.token
                    )
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoginSuccess = true
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = response.message
                    )
                }
            } catch (e: Exception) {
                val message = e.message ?: ""
                val friendlyError = when {
                    message.contains("401") -> "Invalid verification code"
                    message.contains("404") -> "Customer not found"
                    message.contains("Unable to resolve host") -> "No internet connection"
                    else -> "Verification failed"
                }
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = friendlyError
                )
            }
        }
    }

    fun backToPhone() {
        _uiState.value = _uiState.value.copy(isOtpSent = false, otpCode = "")
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
