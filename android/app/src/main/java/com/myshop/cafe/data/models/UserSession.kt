package com.myshop.cafe.data.models

import kotlinx.serialization.Serializable

@Serializable
data class UserSession(
    val phoneNumber: String = "",
    val customerName: String? = null,
    val token: String? = null,
    val isLoggedIn: Boolean = false
)
