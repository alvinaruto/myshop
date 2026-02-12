package com.myshop.cafe.utils

import android.graphics.Bitmap
import android.graphics.Color
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.google.zxing.common.BitMatrix
import java.security.MessageDigest

object KhqrUtil {

    private const val BANK_ACLEDA = "khqr@aclb"
    private const val BANK_ABA = "khqr@aba"
    private const val BANK_WING = "khqr@wing"
    private const val BANK_BAKONG = "bakong@nbc"

    data class KhqrConfig(
        val amount: Double,
        val currency: String = "USD", // USD or KHR
        val merchantName: String,
        val accountNumber: String,
        val bankCode: String = "ACLEDA",
        val merchantCity: String = "PHNOM PENH",
        val billNumber: String? = null
    )

    fun generateKhqr(config: KhqrConfig): String {
        var khqr = formatTlv("00", "01")
        
        // Dynamic QR (12) if amount > 0, else Static (11)
        khqr += formatTlv("01", if (config.amount > 0) "12" else "11")

        // 30. Merchant Account Information
        val acquirerId = when (config.bankCode) {
            "ABA" -> BANK_ABA
            "WING" -> BANK_WING
            "BAKONG" -> BANK_BAKONG
            else -> BANK_ACLEDA
        }

        val merchantAccountInfo = formatTlv("00", acquirerId) +
                formatTlv("01", config.accountNumber) +
                formatTlv("02", config.bankCode)
        
        khqr += formatTlv("30", merchantAccountInfo)
        
        // 52. Merchant Category Code
        khqr += formatTlv("52", "2000")
        
        // 53. Transaction Currency
        khqr += formatTlv("53", if (config.currency == "USD") "840" else "116")
        
        // 54. Transaction Amount
        if (config.amount > 0) {
            khqr += formatTlv("54", String.format("%.2f", config.amount))
        }
        
        // 58. Country Code
        khqr += formatTlv("58", "KH")
        
        // 59. Merchant Name
        khqr += formatTlv("59", config.merchantName.take(25).uppercase())
        
        // 60. Merchant City
        khqr += formatTlv("60", config.merchantCity.uppercase())
        
        // 62. Additional Data
        if (config.billNumber != null) {
            val additionalData = formatTlv("02", config.billNumber)
            khqr += formatTlv("62", additionalData)
        }
        
        // 63. CRC
        khqr += "6304"
        khqr += calculateCrc16(khqr)
        
        return khqr
    }

    private fun formatTlv(tag: String, value: String): String {
        val length = value.length.toString().padStart(2, '0')
        return "$tag$length$value"
    }

    private fun calculateCrc16(data: String): String {
        var crc = 0xFFFF
        for (char in data) {
            val byte = char.code
            crc = crc xor (byte shl 8)
            for (i in 0 until 8) {
                if ((crc and 0x8000) != 0) {
                    crc = (crc shl 1) xor 0x1021
                } else {
                    crc = crc shl 1
                }
            }
        }
        return (crc and 0xFFFF).toString(16).uppercase().padStart(4, '0')
    }

    fun generateMd5(input: String): String {
        val bytes = MessageDigest.getInstance("MD5").digest(input.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }

    fun generateQrBitmap(content: String, size: Int = 512): Bitmap? {
        return try {
            val bitMatrix: BitMatrix = MultiFormatWriter().encode(
                content,
                BarcodeFormat.QR_CODE,
                size,
                size
            )
            val width = bitMatrix.width
            val height = bitMatrix.height
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)
            for (x in 0 until width) {
                for (y in 0 until height) {
                    bitmap.setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
                }
            }
            bitmap
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
