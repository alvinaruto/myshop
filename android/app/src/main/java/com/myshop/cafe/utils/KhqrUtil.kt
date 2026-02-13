package com.myshop.cafe.utils

import android.graphics.Bitmap
import android.graphics.Color
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.google.zxing.common.BitMatrix
import java.security.MessageDigest

object KhqrUtil {

    data class KhqrConfig(
        val amount: Double,
        val currency: String = "USD", // USD or KHR
        val merchantName: String,
        val accountNumber: String,
        val merchantCity: String = "PHNOM PENH",
        val billNumber: String? = null
    )

    private fun formatTlv(tag: String, value: String): String {
        val length = value.length.toString().padStart(2, '0')
        return "$tag$length$value"
    }

    /**
     * CRC16-CCITT implementation for KHQR
     */
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

    /**
     * Generates a KHQR string following the BSTHEN pattern (Manual Tag Builder)
     */
    fun generateKhqr(config: KhqrConfig): String {
        var khqr = ""

        // Tag 00: Payload Format Indicator
        khqr += formatTlv("00", "01")

        // Tag 01: Point of Initiation Method (11 for Static, 12 for Dynamic)
        val isDynamic = config.amount > 0
        khqr += formatTlv("01", if (isDynamic) "12" else "11")

        // Tag 29: Merchant Account Information (Individual)
        val tag29Value = formatTlv("00", config.accountNumber)
        khqr += formatTlv("29", tag29Value)

        // Tag 52: Merchant Category Code
        khqr += formatTlv("52", "5999")

        // Tag 53: Transaction Currency (840 for USD, 116 for KHR)
        khqr += formatTlv("53", if (config.currency == "USD") "840" else "116")

        // Tag 54: Transaction Amount
        if (isDynamic) {
            khqr += formatTlv("54", String.format("%.2f", config.amount))
        }

        // Tag 58: Country Code
        khqr += formatTlv("58", "KH")

        // Tag 59: Merchant Name
        khqr += formatTlv("59", config.merchantName)

        // Tag 60: Merchant City
        khqr += formatTlv("60", config.merchantCity)

        // Tag 62: Additional Data Field Template
        var tag62Value = ""
        if (config.billNumber != null) tag62Value += formatTlv("01", config.billNumber)
        tag62Value += formatTlv("02", "078211599") // Mobile Number
        tag62Value += formatTlv("03", config.merchantName) // Store Label

        if (tag62Value.isNotEmpty()) {
            khqr += formatTlv("62", tag62Value)
        }

        // Final Tag 63: CRC
        khqr += "6304"
        khqr += calculateCrc16(khqr)

        return khqr
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
