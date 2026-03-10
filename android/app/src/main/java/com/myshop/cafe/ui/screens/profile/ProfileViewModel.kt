package com.myshop.cafe.ui.screens.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.myshop.cafe.data.models.LoyaltyData
import com.myshop.cafe.data.models.UserSession
import com.myshop.cafe.data.repository.LoyaltyRepository
import com.myshop.cafe.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val loyaltyRepository: LoyaltyRepository,
    private val apiService: com.myshop.cafe.data.api.ApiService
) : ViewModel() {

    val userSession: StateFlow<UserSession> = userRepository.userSession
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = UserSession()
        )

    private val _loyalty = MutableStateFlow<LoyaltyData?>(null)
    val loyalty: StateFlow<LoyaltyData?> = _loyalty.asStateFlow()

    init {
        // Fetch loyalty whenever session changes
        viewModelScope.launch {
            userRepository.userSession.collect { session ->
                if (session.isLoggedIn && session.token != null) {
                    fetchLoyalty(session.token)
                    syncFcmToken(session.phoneNumber)
                }
            }
        }
    }

    private fun syncFcmToken(phone: String) {
        viewModelScope.launch {
            try {
                var token = userRepository.getFcmToken()
                
                if (token == null) {
                    // Try to get current token from Firebase
                    try {
                        val task = com.google.firebase.messaging.FirebaseMessaging.getInstance().token
                        token = kotlinx.coroutines.tasks.await(task)
                        if (token != null) {
                            userRepository.saveFcmToken(token)
                        }
                    } catch (e: Exception) {
                        // ignore
                    }
                }

                if (token != null) {
                    apiService.updateFcmToken(
                        com.myshop.cafe.data.models.UpdateFcmTokenRequest(phone, token)
                    )
                }
            } catch (e: Exception) {
                // Silently fail
            }
        }
    }

    private suspend fun fetchLoyalty(token: String) {
        loyaltyRepository.getLoyalty(token)
            .onSuccess { data -> _loyalty.value = data }
            .onFailure { /* silently ignore — loyalty is non-critical */ }
    }

    fun logout() {
        viewModelScope.launch {
            userRepository.logout()
        }
    }
}
