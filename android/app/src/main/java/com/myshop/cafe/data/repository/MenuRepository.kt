package com.myshop.cafe.data.repository

import com.myshop.cafe.data.api.ApiService
import com.myshop.cafe.data.models.MenuCategory
import com.myshop.cafe.data.models.MenuItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MenuRepository @Inject constructor(
    private val apiService: ApiService
) {
    
    suspend fun getCategories(): Result<List<MenuCategory>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getMenuCategories()
            if (response.success) {
                Result.success(response.data ?: emptyList())
            } else {
                Result.failure(Exception(response.message ?: "Failed to load categories"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getMenuItems(): Result<List<MenuItem>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getMenuItems(availableOnly = true)
            if (response.success) {
                Result.success(response.data ?: emptyList())
            } else {
                Result.failure(Exception(response.message ?: "Failed to load menu items"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCategoriesWithItems(): Result<List<MenuCategory>> = withContext(Dispatchers.IO) {
        try {
            val categoriesResult = getCategories()
            val itemsResult = getMenuItems()
            
            if (categoriesResult.isFailure) return@withContext categoriesResult
            if (itemsResult.isFailure) return@withContext Result.failure(itemsResult.exceptionOrNull()!!)
            
            val categories = categoriesResult.getOrThrow()
            val items = itemsResult.getOrThrow()
            
            val grouped = categories.map { category ->
                category.copy(
                    items = items.filter { it.categoryId == category.id }
                )
            }.filter { !it.items.isNullOrEmpty() }
            
            Result.success(grouped)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
