package com.myshop.cafe.ui.screens.checkout;

import androidx.compose.foundation.layout.*;
import androidx.compose.foundation.text.KeyboardOptions;
import androidx.compose.material.icons.Icons;
import androidx.compose.material3.*;
import androidx.compose.runtime.*;
import androidx.compose.ui.Alignment;
import androidx.compose.ui.Modifier;
import androidx.compose.ui.graphics.vector.ImageVector;
import androidx.compose.ui.text.font.FontWeight;
import androidx.compose.ui.text.input.KeyboardType;
import androidx.compose.ui.text.style.TextAlign;
import com.myshop.cafe.R;
import com.myshop.cafe.data.models.OrderType;
import com.myshop.cafe.ui.theme.*;
import androidx.compose.animation.*;
import androidx.compose.animation.core.*;

@kotlin.Metadata(mv = {1, 9, 0}, k = 2, xi = 48, d1 = {"\u0000R\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0010\u000e\n\u0002\b\u0006\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0006\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\u001a4\u0010\u0000\u001a\u00020\u00012\b\b\u0002\u0010\u0002\u001a\u00020\u00032\f\u0010\u0004\u001a\b\u0012\u0004\u0012\u00020\u00010\u00052\u0012\u0010\u0006\u001a\u000e\u0012\u0004\u0012\u00020\b\u0012\u0004\u0012\u00020\u00010\u0007H\u0007\u001a,\u0010\t\u001a\u00020\u00012\u0006\u0010\n\u001a\u00020\b2\f\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\u00010\u00052\f\u0010\f\u001a\b\u0012\u0004\u0012\u00020\u00010\u0005H\u0007\u001a\u001e\u0010\r\u001a\u00020\u00012\f\u0010\u000e\u001a\b\u0012\u0004\u0012\u00020\u00100\u000f2\u0006\u0010\u0011\u001a\u00020\u0012H\u0003\u001a8\u0010\u0013\u001a\u00020\u00012\u0006\u0010\u0014\u001a\u00020\u00152\u0006\u0010\u0016\u001a\u00020\b2\u0006\u0010\u0017\u001a\u00020\u00182\f\u0010\u0019\u001a\b\u0012\u0004\u0012\u00020\u00010\u00052\b\b\u0002\u0010\u001a\u001a\u00020\u001bH\u0003\u001a$\u0010\u001c\u001a\u00020\u00012\u0006\u0010\u001d\u001a\u00020\u001e2\u0012\u0010\u001f\u001a\u000e\u0012\u0004\u0012\u00020\u001e\u0012\u0004\u0012\u00020\u00010\u0007H\u0003\u00a8\u0006 "}, d2 = {"CheckoutScreen", "", "viewModel", "Lcom/myshop/cafe/ui/screens/checkout/CheckoutViewModel;", "onBackClick", "Lkotlin/Function0;", "onOrderSuccess", "Lkotlin/Function1;", "", "OrderSuccessScreen", "orderNumber", "onTrackOrderClick", "onOrderMoreClick", "OrderSummaryCard", "items", "", "Lcom/myshop/cafe/data/models/CartItem;", "total", "", "OrderTypeButton", "icon", "Landroidx/compose/ui/graphics/vector/ImageVector;", "label", "isSelected", "", "onClick", "modifier", "Landroidx/compose/ui/Modifier;", "OrderTypeSection", "selectedType", "Lcom/myshop/cafe/data/models/OrderType;", "onTypeSelect", "app_debug"})
public final class CheckoutScreenKt {
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void CheckoutScreen(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.ui.screens.checkout.CheckoutViewModel viewModel, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onBackClick, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onOrderSuccess) {
    }
    
    @androidx.compose.runtime.Composable()
    private static final void OrderSummaryCard(java.util.List<com.myshop.cafe.data.models.CartItem> items, double total) {
    }
    
    @androidx.compose.runtime.Composable()
    private static final void OrderTypeSection(com.myshop.cafe.data.models.OrderType selectedType, kotlin.jvm.functions.Function1<? super com.myshop.cafe.data.models.OrderType, kotlin.Unit> onTypeSelect) {
    }
    
    @androidx.compose.runtime.Composable()
    private static final void OrderTypeButton(androidx.compose.ui.graphics.vector.ImageVector icon, java.lang.String label, boolean isSelected, kotlin.jvm.functions.Function0<kotlin.Unit> onClick, androidx.compose.ui.Modifier modifier) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void OrderSuccessScreen(@org.jetbrains.annotations.NotNull()
    java.lang.String orderNumber, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onTrackOrderClick, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onOrderMoreClick) {
    }
}