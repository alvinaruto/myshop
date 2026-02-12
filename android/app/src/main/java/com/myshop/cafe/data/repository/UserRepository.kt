package com.myshop.cafe.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.myshop.cafe.data.models.UserSession
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_prefs")

@Singleton
class UserRepository @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private object PreferencesKeys {
        val PHONE_NUMBER = stringPreferencesKey("phone_number")
        val CUSTOMER_NAME = stringPreferencesKey("customer_name")
        val AUTH_TOKEN = stringPreferencesKey("auth_token")
        val IS_LOGGED_IN = booleanPreferencesKey("is_logged_in")
    }

    val userSession: Flow<UserSession> = context.dataStore.data
        .map { preferences ->
            UserSession(
                phoneNumber = preferences[PreferencesKeys.PHONE_NUMBER] ?: "",
                customerName = preferences[PreferencesKeys.CUSTOMER_NAME],
                token = preferences[PreferencesKeys.AUTH_TOKEN],
                isLoggedIn = preferences[PreferencesKeys.IS_LOGGED_IN] ?: false
            )
        }

    val isLoggedIn: Flow<Boolean> = userSession.map { it.isLoggedIn }

    suspend fun login(phoneNumber: String, customerName: String?, token: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.PHONE_NUMBER] = phoneNumber
            preferences[PreferencesKeys.CUSTOMER_NAME] = customerName ?: ""
            preferences[PreferencesKeys.AUTH_TOKEN] = token
            preferences[PreferencesKeys.IS_LOGGED_IN] = true
        }
    }

    suspend fun logout() {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.IS_LOGGED_IN] = false
        }
    }
}
