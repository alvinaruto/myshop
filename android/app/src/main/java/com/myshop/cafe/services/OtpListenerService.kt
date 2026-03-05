package com.myshop.cafe.services

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

object OtpDetectionRegistry {
    private val _detectedOtp = MutableStateFlow<String?>(null)
    val detectedOtp = _detectedOtp.asStateFlow()

    fun onOtpDetected(otp: String) {
        _detectedOtp.value = otp
    }

    fun clear() {
        _detectedOtp.value = null
    }
}

class OtpListenerService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName
        
        // We look for Telegram or common messaging apps
        if (!packageName.contains("tele", ignoreCase = true) && 
            !packageName.contains("bot", ignoreCase = true)) {
            // If we want to be safe, we could only look for Telegram, 
            // but let's be generous for the user's bot.
        }

        val extras = sbn.notification.extras
        val title = extras.getString("android.title") ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        
        val fullContent = "$title $text"
        
        // Check if it's related to myShop OTP
        if (fullContent.contains("myShop", ignoreCase = true) && 
            (fullContent.contains("OTP", ignoreCase = true) || fullContent.contains("code", ignoreCase = true))) {
            
            // Extract 6-digit code
            val otpMatch = Regex("\\b(\\d{6})\\b").find(fullContent)
            otpMatch?.groupValues?.get(1)?.let { otp ->
                OtpDetectionRegistry.onOtpDetected(otp)
            }
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        // No-op
    }
}
