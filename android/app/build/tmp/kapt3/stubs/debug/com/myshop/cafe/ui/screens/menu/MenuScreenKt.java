package com.myshop.cafe.ui.screens.menu;

import androidx.compose.animation.*;
import androidx.compose.animation.core.*;
import androidx.compose.foundation.*;
import androidx.compose.foundation.layout.*;
import androidx.compose.foundation.lazy.grid.GridCells;
import androidx.compose.material.icons.Icons;
import androidx.compose.material.icons.outlined.*;
import androidx.compose.material3.*;
import androidx.compose.runtime.*;
import androidx.compose.ui.Alignment;
import androidx.compose.ui.Modifier;
import androidx.compose.ui.graphics.Brush;
import androidx.compose.ui.layout.ContentScale;
import androidx.compose.ui.text.font.FontWeight;
import androidx.compose.ui.text.style.TextOverflow;
import com.myshop.cafe.data.models.MenuItem;
import com.myshop.cafe.data.models.Size;
import com.myshop.cafe.ui.theme.*;

@kotlin.Metadata(mv = {1, 9, 0}, k = 2, xi = 48, d1 = {"\u0000@\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\t\u001a4\u0010\u0000\u001a\u00020\u00012\f\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u00032\b\u0010\u0005\u001a\u0004\u0018\u00010\u00062\u0012\u0010\u0007\u001a\u000e\u0012\u0004\u0012\u00020\u0006\u0012\u0004\u0012\u00020\u00010\bH\u0007\u001a2\u0010\t\u001a\u00020\u00012\u0006\u0010\n\u001a\u00020\u00062\u0012\u0010\u000b\u001a\u000e\u0012\u0004\u0012\u00020\u0006\u0012\u0004\u0012\u00020\u00010\b2\f\u0010\f\u001a\b\u0012\u0004\u0012\u00020\u00010\rH\u0007\u001a2\u0010\u000e\u001a\u00020\u00012\u0006\u0010\u000f\u001a\u00020\u00102\f\u0010\u0011\u001a\b\u0012\u0004\u0012\u00020\u00010\r2\u0012\u0010\u0012\u001a\u000e\u0012\u0004\u0012\u00020\u0013\u0012\u0004\u0012\u00020\u00010\bH\u0007\u001a\b\u0010\u0014\u001a\u00020\u0001H\u0007\u001a\u0012\u0010\u0015\u001a\u00020\u00012\b\b\u0002\u0010\u0016\u001a\u00020\u0017H\u0007\u001a,\u0010\u0018\u001a\u00020\u00012\u0006\u0010\u000f\u001a\u00020\u00102\f\u0010\u0019\u001a\b\u0012\u0004\u0012\u00020\u00010\r2\f\u0010\u001a\u001a\b\u0012\u0004\u0012\u00020\u00010\rH\u0007\u001a>\u0010\u001b\u001a\u00020\u00012\f\u0010\u001c\u001a\b\u0012\u0004\u0012\u00020\u00100\u00032\u0012\u0010\u0019\u001a\u000e\u0012\u0004\u0012\u00020\u0010\u0012\u0004\u0012\u00020\u00010\b2\u0012\u0010\u001a\u001a\u000e\u0012\u0004\u0012\u00020\u0010\u0012\u0004\u0012\u00020\u00010\bH\u0007\u001a\u0016\u0010\u001d\u001a\u00020\u00012\f\u0010\u001c\u001a\b\u0012\u0004\u0012\u00020\u00100\u0003H\u0007\u001a\u000e\u0010\u001e\u001a\u00020\u00062\u0006\u0010\u001f\u001a\u00020\u0006\u00a8\u0006 "}, d2 = {"CategorySection", "", "categories", "", "Lcom/myshop/cafe/data/models/MenuCategory;", "selectedCategoryId", "", "onCategorySelect", "Lkotlin/Function1;", "HeaderSection", "searchQuery", "onSearchQueryChange", "onQRClick", "Lkotlin/Function0;", "ItemDetailSheet", "item", "Lcom/myshop/cafe/data/models/MenuItem;", "onDismiss", "onAddToCart", "Lcom/myshop/cafe/data/models/Size;", "LoadingState", "MenuScreen", "viewModel", "Lcom/myshop/cafe/ui/screens/menu/MenuViewModel;", "ProductCard", "onItemClick", "onQuickAdd", "ProductGridSection", "items", "SpecialForYouSection", "getCoffeeImageUrl", "name", "app_debug"})
public final class MenuScreenKt {
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void MenuScreen(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.ui.screens.menu.MenuViewModel viewModel) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void HeaderSection(@org.jetbrains.annotations.NotNull()
    java.lang.String searchQuery, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onSearchQueryChange, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onQRClick) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void CategorySection(@org.jetbrains.annotations.NotNull()
    java.util.List<com.myshop.cafe.data.models.MenuCategory> categories, @org.jetbrains.annotations.Nullable()
    java.lang.String selectedCategoryId, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onCategorySelect) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void ProductGridSection(@org.jetbrains.annotations.NotNull()
    java.util.List<com.myshop.cafe.data.models.MenuItem> items, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super com.myshop.cafe.data.models.MenuItem, kotlin.Unit> onItemClick, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super com.myshop.cafe.data.models.MenuItem, kotlin.Unit> onQuickAdd) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void ProductCard(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.MenuItem item, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onItemClick, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onQuickAdd) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void SpecialForYouSection(@org.jetbrains.annotations.NotNull()
    java.util.List<com.myshop.cafe.data.models.MenuItem> items) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void LoadingState() {
    }
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void ItemDetailSheet(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.MenuItem item, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onDismiss, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super com.myshop.cafe.data.models.Size, kotlin.Unit> onAddToCart) {
    }
    
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String getCoffeeImageUrl(@org.jetbrains.annotations.NotNull()
    java.lang.String name) {
        return null;
    }
}