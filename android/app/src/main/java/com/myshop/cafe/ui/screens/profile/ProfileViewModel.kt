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
import kotlinx.coroutines.tasks.await
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
                    if (!session.isStaff) {
                        fetchLoyalty(session.token)
                    }
                    syncFcmToken(session)
                }
            }
        }
    }
    
    private fun syncFcmToken(session: UserSession) {
        viewModelScope.launch {
            try {
                var token = userRepository.getFcmToken()
                
                if (token == null) {
                    try {
                        com.google.firebase.messaging.FirebaseMessaging.getInstance().token
                            .addOnCompleteListener { task ->
                                if (task.isSuccessful) {
                                    val newToken = task.result
                                    if (newToken != null) {
                                        viewModelScope.launch {
                                            userRepository.saveFcmToken(newToken)
                                            // Trigger sync again since we now have a token
                                            syncFcmToken(session)
                                        }
                                    }
                                }
                            }
                    } catch (e: Exception) { }
                }

                if (token != null && session.token != null) {
                    if (session.isStaff) {
                        apiService.updateStaffFcmToken(
                            "Bearer ${session.token}",
                            mapOf("fcmToken" to token)
                        )
                    } else {
                        apiService.updateFcmToken(
                            com.myshop.cafe.data.models.UpdateFcmTokenRequest(session.phoneNumber, token)
                        )
                    }
                }
            } catch (e: Exception) { }
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
