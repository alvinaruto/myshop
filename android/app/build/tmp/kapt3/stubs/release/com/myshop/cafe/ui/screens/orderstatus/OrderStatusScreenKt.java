package com.myshop.cafe.ui.screens.orderstatus;

import androidx.compose.animation.core.*;
import androidx.compose.foundation.layout.*;
import androidx.compose.foundation.text.KeyboardOptions;
import androidx.compose.material.icons.Icons;
import androidx.compose.material3.*;
import androidx.compose.runtime.*;
import androidx.compose.ui.Alignment;
import androidx.compose.ui.Modifier;
import androidx.compose.ui.graphics.Brush;
import androidx.compose.ui.graphics.vector.ImageVector;
import androidx.compose.ui.text.font.FontWeight;
import androidx.compose.ui.text.input.ImeAction;
import androidx.compose.ui.text.input.KeyboardType;
import com.myshop.cafe.R;
import com.myshop.cafe.data.models.Order;
import com.myshop.cafe.ui.theme.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@kotlin.Metadata(mv = {1, 9, 0}, k = 2, xi = 48, d1 = {"\u0000\\\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010 \n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000b\n\u0002\b\b\n\u0002\u0018\u0002\n\u0002\b\b\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u000e\n\u0002\u0010\u0007\n\u0000\u001a.\u0010\u0000\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00032\b\b\u0002\u0010\u0004\u001a\u00020\u00052\b\b\u0002\u0010\u0006\u001a\u00020\u0005H\u0007\u00f8\u0001\u0000\u00a2\u0006\u0004\b\u0007\u0010\b\u001aZ\u0010\t\u001a\u00020\u00012\u0006\u0010\n\u001a\u00020\u000b2\f\u0010\f\u001a\b\u0012\u0004\u0012\u00020\u00030\r2\u0006\u0010\u000e\u001a\u00020\u000f2\u0006\u0010\u0010\u001a\u00020\u00052\u0006\u0010\u0011\u001a\u00020\u00122\b\b\u0002\u0010\u0013\u001a\u00020\u00142\u0006\u0010\u0004\u001a\u00020\u00052\u0006\u0010\u0015\u001a\u00020\u0005H\u0003\u00f8\u0001\u0000\u00a2\u0006\u0004\b\u0016\u0010\u0017\u001a\u001a\u0010\u0018\u001a\u00020\u00012\u0006\u0010\u0004\u001a\u00020\u0005H\u0003\u00f8\u0001\u0000\u00a2\u0006\u0004\b\u0019\u0010\u001a\u001a*\u0010\u001b\u001a\u00020\u00012\u0006\u0010\u001c\u001a\u00020\u001d2\u0006\u0010\u0004\u001a\u00020\u00052\u0006\u0010\u0010\u001a\u00020\u0005H\u0003\u00f8\u0001\u0000\u00a2\u0006\u0004\b\u001e\u0010\u001f\u001a0\u0010 \u001a\u00020\u00012\f\u0010!\u001a\b\u0012\u0004\u0012\u00020\u00030\r2\u0006\u0010\u0015\u001a\u00020\u00052\u0006\u0010\u0004\u001a\u00020\u0005H\u0003\u00f8\u0001\u0000\u00a2\u0006\u0004\b\"\u0010#\u001a \u0010$\u001a\u00020\u00012\b\b\u0002\u0010%\u001a\u00020&2\f\u0010\'\u001a\b\u0012\u0004\u0012\u00020\u00010(H\u0007\u001az\u0010)\u001a\u00020\u00012\u0006\u0010*\u001a\u00020\u000b2\u0012\u0010+\u001a\u000e\u0012\u0004\u0012\u00020\u000b\u0012\u0004\u0012\u00020\u00010,2\f\u0010-\u001a\b\u0012\u0004\u0012\u00020\u00010(2\u0006\u0010.\u001a\u00020\u00142\u0006\u0010/\u001a\u00020\u000b2\f\u00100\u001a\b\u0012\u0004\u0012\u00020\u00030\r2\u0006\u0010\u0015\u001a\u00020\u00052\u0006\u0010\u0004\u001a\u00020\u00052\u0006\u0010\u0010\u001a\u00020\u00052\u0006\u00101\u001a\u00020\u0005H\u0003\u00f8\u0001\u0000\u00a2\u0006\u0004\b2\u00103\u001a2\u00104\u001a\u00020\u00012\u0006\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0013\u001a\u00020\u00142\u0006\u0010\u0010\u001a\u00020\u00052\u0006\u0010\u0004\u001a\u00020\u0005H\u0003\u00f8\u0001\u0000\u00a2\u0006\u0004\b5\u00106\u001a\u0010\u00107\u001a\u00020\u000b2\u0006\u00108\u001a\u00020\u000bH\u0002\u001a\u0012\u00109\u001a\u00020\u0012*\u00020\u00122\u0006\u0010:\u001a\u00020;\u0082\u0002\u0007\n\u0005\b\u00a1\u001e0\u0001\u00a8\u0006<"}, d2 = {"CustomerOrderCard", "", "order", "Lcom/myshop/cafe/data/models/Order;", "textColor", "Landroidx/compose/ui/graphics/Color;", "bgColor", "CustomerOrderCard-WkMS-hQ", "(Lcom/myshop/cafe/data/models/Order;JJ)V", "DashboardCard", "title", "", "orders", "", "icon", "Landroidx/compose/ui/graphics/vector/ImageVector;", "accentColor", "modifier", "Landroidx/compose/ui/Modifier;", "isReady", "", "cardColor", "DashboardCard-XffNo7U", "(Ljava/lang/String;Ljava/util/List;Landroidx/compose/ui/graphics/vector/ImageVector;JLandroidx/compose/ui/Modifier;ZJJ)V", "FooterSection", "FooterSection-8_81llA", "(J)V", "HeaderSection", "currentTime", "Ljava/time/LocalDateTime;", "HeaderSection-WkMS-hQ", "(Ljava/time/LocalDateTime;JJ)V", "OrderQueueDashboard", "allOrders", "OrderQueueDashboard-WkMS-hQ", "(Ljava/util/List;JJ)V", "OrderStatusScreen", "viewModel", "Lcom/myshop/cafe/ui/screens/orderstatus/OrderStatusViewModel;", "onBackClick", "Lkotlin/Function0;", "PhoneSearchCard", "phoneNumber", "onPhoneChange", "Lkotlin/Function1;", "onSearch", "isSearching", "searchedPhone", "customerOrders", "inputBgColor", "PhoneSearchCard-UAZAlZw", "(Ljava/lang/String;Lkotlin/jvm/functions/Function1;Lkotlin/jvm/functions/Function0;ZLjava/lang/String;Ljava/util/List;JJJJ)V", "QueueOrderCard", "QueueOrderCard-0YGnOg8", "(Lcom/myshop/cafe/data/models/Order;ZJJ)V", "getShortOrderNumber", "orderNumber", "rotate", "degrees", "", "app_release"})
public final class OrderStatusScreenKt {
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void OrderStatusScreen(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.ui.screens.orderstatus.OrderStatusViewModel viewModel, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onBackClick) {
    }
    
    private static final java.lang.String getShortOrderNumber(java.lang.String orderNumber) {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public static final androidx.compose.ui.Modifier rotate(@org.jetbrains.annotations.NotNull()
    androidx.compose.ui.Modifier $this$rotate, float degrees) {
        return null;
    }
}