package com.myshop.cafe.data.repository

import com.myshop.cafe.data.api.ApiService
import com.myshop.cafe.data.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrderRepository @Inject constructor(
    private val apiService: ApiService
) {
    
    suspend fun createOrder(
        customerPhone: String,
        customerName: String?,
        items: List<CartItem>,
        orderType: OrderType,
        tableNumber: Int?
    ): Result<Order> = withContext(Dispatchers.IO) {
        try {
            val request = CreateOrderRequest(
                customerPhone = customerPhone,
                customerName = customerName?.takeIf { it.isNotBlank() },
                items = items.map { cartItem ->
                    CreateOrderItem(
                        menuItemId = cartItem.menuItem.id,
                        size = cartItem.size.apiValue,
                        quantity = cartItem.quantity
                    )
                },
                orderType = orderType.apiValue,
                tableNumber = if (orderType == OrderType.DINE_IN) tableNumber else null
            )
            
            val response = apiService.createOrder(request)
            if (response.success && response.data != null) {
                Result.success(response.data.order)
            } else {
                Result.failure(Exception(response.message ?: "Failed to place order"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCustomerOrders(phone: String): Result<List<Order>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getCustomerOrders(phone)
            if (response.success) {
                Result.success(response.data ?: emptyList())
            } else {
                Result.failure(Exception(response.message ?: "Failed to load orders"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getOrdersQueue(): Result<List<Order>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getOrdersQueue()
            if (response.success) {
                Result.success(response.data ?: emptyList())
            } else {
                Result.failure(Exception(response.message ?: "Failed to load order queue"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyKhqr(md5: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.verifyKhqr(VerifyKhqrRequest(md5))
            if (response.success) {
                Result.success(true)
            } else {
                Result.failure(Exception(response.message ?: "Payment not verified"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
