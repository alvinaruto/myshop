package com.myshop.cafe.data.repository;

import com.myshop.cafe.data.api.ApiService;
import com.myshop.cafe.data.models.MenuCategory;
import com.myshop.cafe.data.models.MenuItem;
import kotlinx.coroutines.Dispatchers;
import javax.inject.Inject;
import javax.inject.Singleton;

@javax.inject.Singleton()
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000*\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0018\u0002\n\u0002\b\u0002\b\u0007\u0018\u00002\u00020\u0001B\u000f\b\u0007\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\"\u0010\u0005\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\b0\u00070\u0006H\u0086@\u00f8\u0001\u0000\u00f8\u0001\u0001\u00a2\u0006\u0004\b\t\u0010\nJ\"\u0010\u000b\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\b0\u00070\u0006H\u0086@\u00f8\u0001\u0000\u00f8\u0001\u0001\u00a2\u0006\u0004\b\f\u0010\nJ\"\u0010\r\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u000e0\u00070\u0006H\u0086@\u00f8\u0001\u0000\u00f8\u0001\u0001\u00a2\u0006\u0004\b\u000f\u0010\nR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u0082\u0002\u000b\n\u0002\b!\n\u0005\b\u00a1\u001e0\u0001\u00a8\u0006\u0010"}, d2 = {"Lcom/myshop/cafe/data/repository/MenuRepository;", "", "apiService", "Lcom/myshop/cafe/data/api/ApiService;", "(Lcom/myshop/cafe/data/api/ApiService;)V", "getCategories", "Lkotlin/Result;", "", "Lcom/myshop/cafe/data/models/MenuCategory;", "getCategories-IoAF18A", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getCategoriesWithItems", "getCategoriesWithItems-IoAF18A", "getMenuItems", "Lcom/myshop/cafe/data/models/MenuItem;", "getMenuItems-IoAF18A", "app_debug"})
public final class MenuRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.api.ApiService apiService = null;
    
    @javax.inject.Inject()
    public MenuRepository(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.api.ApiService apiService) {
        super();
    }
}