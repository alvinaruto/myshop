package com.myshop.cafe.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class MenuCategory(
    val id: String,
    val name: String,
    @SerialName("name_kh")
    val nameKh: String? = null,
    val icon: String? = null,
    @SerialName("display_order")
    val displayOrder: Int = 0,
    @SerialName("is_active")
    val isActive: Boolean = true,
    val items: List<MenuItem>? = null
)

@Serializable
data class MenuItem(
    val id: String,
    val name: String,
    @SerialName("name_kh")
    val nameKh: String? = null,
    val description: String? = null,
    @SerialName("image_url")
    val imageUrl: String? = null,
    @SerialName("base_price")
    val basePrice: Double,
    @SerialName("has_sizes")
    val hasSizes: Boolean = true,
    @SerialName("price_medium")
    val priceMedium: Double? = null,
    @SerialName("price_large")
    val priceLarge: Double? = null,
    @SerialName("is_available")
    val isAvailable: Boolean = true,
    @SerialName("category_id")
    val categoryId: String? = null,
    val category: MenuCategory? = null
)

@Serializable
data class MenuCategoriesResponse(
    val success: Boolean,
    val data: List<MenuCategory>? = null,
    val message: String? = null
)

@Serializable
data class MenuItemsResponse(
    val success: Boolean,
    val data: List<MenuItem>? = null,
    val message: String? = null
)
