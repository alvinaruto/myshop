package com.myshop.cafe.data.repository

import com.myshop.cafe.data.api.ApiService
import com.myshop.cafe.data.models.LoyaltyData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LoyaltyRepository @Inject constructor(
    private val apiService: ApiService
) {
    suspend fun getLoyalty(token: String): Result<LoyaltyData> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getLoyalty("Bearer $token")
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to load loyalty data"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
