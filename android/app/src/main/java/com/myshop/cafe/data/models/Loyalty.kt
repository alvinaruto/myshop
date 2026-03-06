package com.myshop.cafe.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// ── Loyalty model (mirrors /api/customer/loyalty response) ──────────────────

@Serializable
data class LoyaltyTierInfo(
    val current: String,
    val next: String? = null,
    @SerialName("points_to_next") val pointsToNext: Int = 0,
    @SerialName("progress_percent") val progressPercent: Int = 0
)

@Serializable
data class LoyaltyData(
    val id: String,
    val phone: String,
    val name: String? = null,
    @SerialName("loyalty_points") val loyaltyPoints: Int = 0,
    @SerialName("total_spent") val totalSpent: Double = 0.0,
    @SerialName("total_orders") val totalOrders: Int = 0,
    @SerialName("last_visit") val lastVisit: String? = null,
    val tier: String = "bronze",
    @SerialName("tier_info") val tierInfo: LoyaltyTierInfo
)

@Serializable
data class LoyaltyResponse(
    val success: Boolean,
    val data: LoyaltyData? = null,
    val message: String? = null
)

// ── Loyalty fields in order response ────────────────────────────────────────

@Serializable
data class OrderLoyalty(
    @SerialName("points_earned") val pointsEarned: Int = 0,
    @SerialName("total_points") val totalPoints: Int = 0,
    val tier: String = "bronze"
)
