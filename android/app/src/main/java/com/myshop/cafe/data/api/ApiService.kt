package com.myshop.cafe.data.api

import com.myshop.cafe.data.models.*
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface ApiService {
    
    // Auth endpoints
    @POST("customer/otp-request")
    suspend fun requestOtp(@Body request: RequestOtpRequest): OtpRequestResponse

    @POST("customer/otp-verify")
    suspend fun verifyOtp(@Body request: VerifyOtpRequest): AuthResponse

    // Menu endpoints
    @GET("cafe/menu-categories")
    suspend fun getMenuCategories(): MenuCategoriesResponse
    
    @GET("cafe/menu-items")
    suspend fun getMenuItems(
        @Query("available_only") availableOnly: Boolean = true
    ): MenuItemsResponse
    
    // Customer order endpoints
    @POST("customer/orders")
    suspend fun createOrder(@Body request: CreateOrderRequest): CreateOrderResponse
    
    @GET("customer/orders")
    suspend fun getCustomerOrders(@Query("phone") phone: String): CustomerOrdersResponse
    
    // Order queue (for display)
    @GET("cafe/orders")
    suspend fun getOrdersQueue(
        @Query("status") status: String = "pending,preparing,ready",
        @Query("limit") limit: Int = 30
    ): OrdersQueueResponse

    @POST("sales/verify-khqr")
    suspend fun verifyKhqr(@Body request: VerifyKhqrRequest): VerifyKhqrResponse
}
