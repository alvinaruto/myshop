package com.myshop.cafe.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Order(
    val id: String,
    @SerialName("order_number")
    val orderNumber: String,
    val status: String,
    @SerialName("order_type")
    val orderType: String? = null,
    @SerialName("table_number")
    val tableNumber: Int? = null,
    @SerialName("total_usd")
    val totalUsd: Double? = null,
    @SerialName("createdAt")
    val createdAt: String? = null,
    val items: List<OrderItem>? = null,
    val customer: Customer? = null
)

@Serializable
data class OrderItem(
    val id: String? = null,
    val name: String,
    val size: String,
    val quantity: Int,
    @SerialName("unit_price")
    val unitPrice: Double? = null,
    val total: Double? = null,
    val customizations: Map<String, String>? = null
)

@Serializable
data class Customer(
    val id: String,
    val name: String? = null,
    val phone: String
)

@Serializable
data class CreateOrderRequest(
    @SerialName("customer_phone")
    val customerPhone: String,
    @SerialName("customer_name")
    val customerName: String? = null,
    val items: List<CreateOrderItem>,
    @SerialName("order_type")
    val orderType: String = "takeaway",
    @SerialName("table_number")
    val tableNumber: Int? = null,
    val notes: String? = null
)

@Serializable
data class CreateOrderItem(
    @SerialName("menu_item_id")
    val menuItemId: String,
    val size: String = "regular",
    val quantity: Int = 1,
    val customizations: Map<String, String>? = null
)

@Serializable
data class CreateOrderResponse(
    val success: Boolean,
    val data: CreateOrderData? = null,
    val message: String? = null
)

@Serializable
data class CreateOrderData(
    val order: Order,
    val message: String? = null
)

@Serializable
data class CustomerOrdersResponse(
    val success: Boolean,
    val data: List<Order>? = null,
    val message: String? = null
)

@Serializable
data class OrdersQueueResponse(
    val success: Boolean,
    val data: List<Order>? = null,
    val message: String? = null
)

@Serializable
data class VerifyKhqrRequest(
    val md5: String
)

@Serializable
data class VerifyKhqrResponse(
    val success: Boolean,
    val message: String? = null,
    val data: VerifyKhqrData? = null
)

@Serializable
data class VerifyKhqrData(
    val responseCode: Int? = null,
    val responseMessage: String? = null,
    val hash: String? = null,
    val externalRef: String? = null
)
