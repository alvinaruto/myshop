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
import androidx.compose.material3.RadioButtonDefaults;
import android.content.Intent;
import android.net.Uri;
import android.widget.Toast;
import android.content.ClipboardManager;
import android.content.ClipData;
import android.content.Context;
import com.myshop.cafe.utils.KhqrUtil;

@kotlin.Metadata(mv = {1, 9, 0}, k = 2, xi = 48, d1 = {"\u0000F\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0006\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0010\u000e\n\u0002\b\u0003\n\u0002\u0010\u0006\n\u0002\b\b\n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0010\u000b\n\u0002\b\n\n\u0002\u0018\u0002\n\u0000\u001a4\u0010\u0007\u001a\u00020\b2\b\b\u0002\u0010\t\u001a\u00020\n2\f\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\b0\f2\u0012\u0010\r\u001a\u000e\u0012\u0004\u0012\u00020\u000f\u0012\u0004\u0012\u00020\b0\u000eH\u0007\u001a2\u0010\u0010\u001a\u00020\b2\u0006\u0010\u0011\u001a\u00020\u000f2\u0006\u0010\u0012\u001a\u00020\u00132\n\b\u0002\u0010\u0014\u001a\u0004\u0018\u00010\u000f2\f\u0010\u0015\u001a\b\u0012\u0004\u0012\u00020\b0\fH\u0007\u001a,\u0010\u0016\u001a\u00020\b2\u0006\u0010\u0017\u001a\u00020\u000f2\f\u0010\u0018\u001a\b\u0012\u0004\u0012\u00020\b0\f2\f\u0010\u0019\u001a\b\u0012\u0004\u0012\u00020\b0\fH\u0007\u001aP\u0010\u001a\u001a\u00020\b2\u0006\u0010\u001b\u001a\u00020\u001c2\u0006\u0010\u001d\u001a\u00020\u000f2\u0006\u0010\u001e\u001a\u00020\u000f2\u0006\u0010\u001f\u001a\u00020\u000f2\u0006\u0010 \u001a\u00020\u00012\u0006\u0010!\u001a\u00020\"2\f\u0010#\u001a\b\u0012\u0004\u0012\u00020\b0\fH\u0003\u00f8\u0001\u0000\u00a2\u0006\u0004\b$\u0010%\u001a$\u0010&\u001a\u00020\b2\u0006\u0010\'\u001a\u00020\u001c2\u0012\u0010(\u001a\u000e\u0012\u0004\u0012\u00020\u001c\u0012\u0004\u0012\u00020\b0\u000eH\u0003\u001a\u0010\u0010)\u001a\u00020\b2\u0006\u0010*\u001a\u00020\u0013H\u0003\u001a \u0010+\u001a\u00020\b2\u0006\u0010,\u001a\u00020-2\u0006\u0010\u0014\u001a\u00020\u000f2\u0006\u0010\u0011\u001a\u00020\u000fH\u0002\"\u0013\u0010\u0000\u001a\u00020\u0001\u00a2\u0006\n\n\u0002\u0010\u0004\u001a\u0004\b\u0002\u0010\u0003\"\u0013\u0010\u0005\u001a\u00020\u0001\u00a2\u0006\n\n\u0002\u0010\u0004\u001a\u0004\b\u0006\u0010\u0003\u0082\u0002\u0007\n\u0005\b\u00a1\u001e0\u0001\u00a8\u0006."}, d2 = {"BakongRed", "Landroidx/compose/ui/graphics/Color;", "getBakongRed", "()J", "J", "TealPay", "getTealPay", "CheckoutScreen", "", "viewModel", "Lcom/myshop/cafe/ui/screens/checkout/CheckoutViewModel;", "onBackClick", "Lkotlin/Function0;", "onOrderSuccess", "Lkotlin/Function1;", "", "KhqrPaymentDialog", "khqrString", "amount", "", "deepLinkUrl", "onDismiss", "OrderSuccessScreen", "orderNumber", "onTrackOrderClick", "onOrderMoreClick", "PaymentMethodItem", "method", "Lcom/myshop/cafe/ui/screens/checkout/PaymentMethod;", "title", "subtitle", "icon", "iconColor", "isSelected", "", "onClick", "PaymentMethodItem-qFjXxE8", "(Lcom/myshop/cafe/ui/screens/checkout/PaymentMethod;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;JZLkotlin/jvm/functions/Function0;)V", "PaymentMethodSection", "selectedMethod", "onMethodSelect", "SummaryCard", "total", "launchDeepLink", "context", "Landroid/content/Context;", "app_release"})
public final class CheckoutScreenKt {
    private static final long TealPay = 0L;
    private static final long BakongRed = 0L;
    
    public static final long getTealPay() {
        return 0L;
    }
    
    @kotlin.OptIn(markerClass = {androidx.compose.material3.ExperimentalMaterial3Api.class})
    @androidx.compose.runtime.Composable()
    public static final void CheckoutScreen(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.ui.screens.checkout.CheckoutViewModel viewModel, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onBackClick, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function1<? super java.lang.String, kotlin.Unit> onOrderSuccess) {
    }
    
    @androidx.compose.runtime.Composable()
    private static final void SummaryCard(double total) {
    }
    
    @androidx.compose.runtime.Composable()
    private static final void PaymentMethodSection(com.myshop.cafe.ui.screens.checkout.PaymentMethod selectedMethod, kotlin.jvm.functions.Function1<? super com.myshop.cafe.ui.screens.checkout.PaymentMethod, kotlin.Unit> onMethodSelect) {
    }
    
    @androidx.compose.runtime.Composable()
    public static final void OrderSuccessScreen(@org.jetbrains.annotations.NotNull()
    java.lang.String orderNumber, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onTrackOrderClick, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onOrderMoreClick) {
    }
    
    public static final long getBakongRed() {
        return 0L;
    }
    
    @androidx.compose.runtime.Composable()
    public static final void KhqrPaymentDialog(@org.jetbrains.annotations.NotNull()
    java.lang.String khqrString, double amount, @org.jetbrains.annotations.Nullable()
    java.lang.String deepLinkUrl, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onDismiss) {
    }
    
    private static final void launchDeepLink(android.content.Context context, java.lang.String deepLinkUrl, java.lang.String khqrString) {
    }
}