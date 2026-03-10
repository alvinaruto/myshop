package com.myshop.cafe.data.models

import kotlinx.serialization.Serializable

@Serializable
data class RequestOtpRequest(
    val phone: String
)

@Serializable
data class VerifyOtpRequest(
    val phone: String,
    val otp_code: String
)

@Serializable
data class AuthResponse(
    val success: Boolean,
    val message: String,
    val data: AuthData? = null
)

@Serializable
data class AuthData(
    val token: String,
    val customer: CustomerData
)

@Serializable
data class OtpRequestResponse(
    val success: Boolean,
    val message: String,
    val data: OtpRequestData? = null
)

@Serializable
data class OtpRequestData(
    val phone: String,
    val telegram_linked: Boolean = true,
    val bot_url: String? = null
)

@Serializable
data class CustomerData(
    val id: String,
    val phone: String,
    val name: String? = null
)

@Serializable
data class UpdateFcmTokenRequest(
    val phone: String,
    val fcm_token: String
)

@Serializable
data class CommonResponse(
    val success: Boolean,
    val message: String? = null
)
@Serializable
data class StaffAuthResponse(
    val success: Boolean,
    val message: String? = null,
    val data: StaffAuthData? = null
)

@Serializable
data class StaffAuthData(
    val user: StaffUser,
    val token: String
)

@Serializable
data class StaffUser(
    val username: String,
    val role: String? = null
)
