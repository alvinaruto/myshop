package com.myshop.cafe.data.api;

import com.myshop.cafe.data.models.*;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000p\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\bf\u0018\u00002\u00020\u0001J\u0018\u0010\u0002\u001a\u00020\u00032\b\b\u0001\u0010\u0004\u001a\u00020\u0005H\u00a7@\u00a2\u0006\u0002\u0010\u0006J\u0018\u0010\u0007\u001a\u00020\b2\b\b\u0001\u0010\t\u001a\u00020\nH\u00a7@\u00a2\u0006\u0002\u0010\u000bJ\u000e\u0010\f\u001a\u00020\rH\u00a7@\u00a2\u0006\u0002\u0010\u000eJ\u0018\u0010\u000f\u001a\u00020\u00102\b\b\u0003\u0010\u0011\u001a\u00020\u0012H\u00a7@\u00a2\u0006\u0002\u0010\u0013J\"\u0010\u0014\u001a\u00020\u00152\b\b\u0003\u0010\u0016\u001a\u00020\n2\b\b\u0003\u0010\u0017\u001a\u00020\u0018H\u00a7@\u00a2\u0006\u0002\u0010\u0019J\u0018\u0010\u001a\u001a\u00020\u001b2\b\b\u0001\u0010\u0004\u001a\u00020\u001cH\u00a7@\u00a2\u0006\u0002\u0010\u001dJ\u0018\u0010\u001e\u001a\u00020\u001f2\b\b\u0001\u0010\u0004\u001a\u00020 H\u00a7@\u00a2\u0006\u0002\u0010!J\u0018\u0010\"\u001a\u00020#2\b\b\u0001\u0010\u0004\u001a\u00020$H\u00a7@\u00a2\u0006\u0002\u0010%\u00a8\u0006&"}, d2 = {"Lcom/myshop/cafe/data/api/ApiService;", "", "createOrder", "Lcom/myshop/cafe/data/models/CreateOrderResponse;", "request", "Lcom/myshop/cafe/data/models/CreateOrderRequest;", "(Lcom/myshop/cafe/data/models/CreateOrderRequest;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getCustomerOrders", "Lcom/myshop/cafe/data/models/CustomerOrdersResponse;", "phone", "", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getMenuCategories", "Lcom/myshop/cafe/data/models/MenuCategoriesResponse;", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getMenuItems", "Lcom/myshop/cafe/data/models/MenuItemsResponse;", "availableOnly", "", "(ZLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getOrdersQueue", "Lcom/myshop/cafe/data/models/OrdersQueueResponse;", "status", "limit", "", "(Ljava/lang/String;ILkotlin/coroutines/Continuation;)Ljava/lang/Object;", "requestOtp", "Lcom/myshop/cafe/data/models/OtpRequestResponse;", "Lcom/myshop/cafe/data/models/RequestOtpRequest;", "(Lcom/myshop/cafe/data/models/RequestOtpRequest;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "verifyKhqr", "Lcom/myshop/cafe/data/models/VerifyKhqrResponse;", "Lcom/myshop/cafe/data/models/VerifyKhqrRequest;", "(Lcom/myshop/cafe/data/models/VerifyKhqrRequest;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "verifyOtp", "Lcom/myshop/cafe/data/models/AuthResponse;", "Lcom/myshop/cafe/data/models/VerifyOtpRequest;", "(Lcom/myshop/cafe/data/models/VerifyOtpRequest;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_release"})
public abstract interface ApiService {
    
    @retrofit2.http.POST(value = "customer/otp-request")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object requestOtp(@retrofit2.http.Body()
    @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.RequestOtpRequest request, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.myshop.cafe.data.models.OtpRequestResponse> $completion);
    
    @retrofit2.http.POST(value = "customer/otp-verify")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object verifyOtp(@retrofit2.http.Body()
    @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.VerifyOtpRequest request, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.myshop.cafe.data.models.AuthResponse> $completion);
    
    @retrofit2.http.GET(value = "cafe/menu-categories")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getMenuCategories(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.myshop.cafe.data.models.MenuCategoriesResponse> $completion);
    
    @retrofit2.http.GET(value = "cafe/menu-items")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getMenuItems(@retrofit2.http.Query(value = "available_only")
    boolean availableOnly, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.myshop.cafe.data.models.MenuItemsResponse> $completion);
    
    @retrofit2.http.POST(value = "customer/orders")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object createOrder(@retrofit2.http.Body()
    @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.CreateOrderRequest request, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.myshop.cafe.data.models.CreateOrderResponse> $completion);
    
    @retrofit2.http.GET(value = "customer/orders")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getCustomerOrders(@retrofit2.http.Query(value = "phone")
    @org.jetbrains.annotations.NotNull()
    java.lang.String phone, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.myshop.cafe.data.models.CustomerOrdersResponse> $completion);
    
    @retrofit2.http.GET(value = "cafe/orders")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getOrdersQueue(@retrofit2.http.Query(value = "status")
    @org.jetbrains.annotations.NotNull()
    java.lang.String status, @retrofit2.http.Query(value = "limit")
    int limit, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.myshop.cafe.data.models.OrdersQueueResponse> $completion);
    
    @retrofit2.http.POST(value = "sales/verify-khqr")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object verifyKhqr(@retrofit2.http.Body()
    @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.VerifyKhqrRequest request, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.myshop.cafe.data.models.VerifyKhqrResponse> $completion);
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 3, xi = 48)
    public static final class DefaultImpls {
    }
}