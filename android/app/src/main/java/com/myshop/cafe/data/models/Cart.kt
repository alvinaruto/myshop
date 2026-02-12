package com.myshop.cafe.data.models

import java.util.UUID

data class CartItem(
    val id: String = UUID.randomUUID().toString(),
    val menuItem: MenuItem,
    val size: Size = Size.SMALL,
    val quantity: Int = 1
) {
    val unitPrice: Double
        get() = when (size) {
            Size.SMALL -> menuItem.basePrice
            Size.MEDIUM -> menuItem.priceMedium ?: (menuItem.basePrice + 0.50)
            Size.LARGE -> menuItem.priceLarge ?: (menuItem.basePrice + 1.00)
        }
    
    val totalPrice: Double
        get() = unitPrice * quantity
}

enum class Size(val label: String, val apiValue: String) {
    SMALL("S", "regular"),
    MEDIUM("M", "medium"),
    LARGE("L", "large")
}

enum class OrderType(val label: String, val apiValue: String) {
    TAKEAWAY("Takeaway", "takeaway"),
    DINE_IN("Dine-In", "dine_in")
}
