package com.myshop.cafe.ui.screens.checkout;

import androidx.lifecycle.ViewModel;
import com.myshop.cafe.data.models.CartItem;
import com.myshop.cafe.data.models.Order;
import com.myshop.cafe.data.models.OrderType;
import com.myshop.cafe.data.repository.CartRepository;
import com.myshop.cafe.data.repository.OrderRepository;
import com.myshop.cafe.data.repository.UserRepository;
import dagger.hilt.android.lifecycle.HiltViewModel;
import kotlinx.coroutines.flow.StateFlow;
import com.myshop.cafe.utils.KhqrUtil;
import java.net.URLEncoder;
import javax.inject.Inject;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000H\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0006\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0003\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\b*\n\u0002\u0010\b\n\u0002\b\u0002\b\u0086\b\u0018\u00002\u00020\u0001B\u00ab\u0001\u0012\u000e\b\u0002\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u0012\b\b\u0002\u0010\u0005\u001a\u00020\u0006\u0012\b\b\u0002\u0010\u0007\u001a\u00020\b\u0012\b\b\u0002\u0010\t\u001a\u00020\n\u0012\b\b\u0002\u0010\u000b\u001a\u00020\n\u0012\b\b\u0002\u0010\f\u001a\u00020\n\u0012\b\b\u0002\u0010\r\u001a\u00020\u000e\u0012\n\b\u0002\u0010\u000f\u001a\u0004\u0018\u00010\n\u0012\n\b\u0002\u0010\u0010\u001a\u0004\u0018\u00010\u0011\u0012\b\b\u0002\u0010\u0012\u001a\u00020\u000e\u0012\n\b\u0002\u0010\u0013\u001a\u0004\u0018\u00010\n\u0012\n\b\u0002\u0010\u0014\u001a\u0004\u0018\u00010\n\u0012\b\b\u0002\u0010\u0015\u001a\u00020\u0016\u0012\b\b\u0002\u0010\u0017\u001a\u00020\u000e\u0012\n\b\u0002\u0010\u0018\u001a\u0004\u0018\u00010\n\u00a2\u0006\u0002\u0010\u0019J\u000f\u0010.\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003H\u00c6\u0003J\t\u0010/\u001a\u00020\u000eH\u00c6\u0003J\u000b\u00100\u001a\u0004\u0018\u00010\nH\u00c6\u0003J\u000b\u00101\u001a\u0004\u0018\u00010\nH\u00c6\u0003J\t\u00102\u001a\u00020\u0016H\u00c6\u0003J\t\u00103\u001a\u00020\u000eH\u00c6\u0003J\u000b\u00104\u001a\u0004\u0018\u00010\nH\u00c6\u0003J\t\u00105\u001a\u00020\u0006H\u00c6\u0003J\t\u00106\u001a\u00020\bH\u00c6\u0003J\t\u00107\u001a\u00020\nH\u00c6\u0003J\t\u00108\u001a\u00020\nH\u00c6\u0003J\t\u00109\u001a\u00020\nH\u00c6\u0003J\t\u0010:\u001a\u00020\u000eH\u00c6\u0003J\u000b\u0010;\u001a\u0004\u0018\u00010\nH\u00c6\u0003J\u000b\u0010<\u001a\u0004\u0018\u00010\u0011H\u00c6\u0003J\u00af\u0001\u0010=\u001a\u00020\u00002\u000e\b\u0002\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u00032\b\b\u0002\u0010\u0005\u001a\u00020\u00062\b\b\u0002\u0010\u0007\u001a\u00020\b2\b\b\u0002\u0010\t\u001a\u00020\n2\b\b\u0002\u0010\u000b\u001a\u00020\n2\b\b\u0002\u0010\f\u001a\u00020\n2\b\b\u0002\u0010\r\u001a\u00020\u000e2\n\b\u0002\u0010\u000f\u001a\u0004\u0018\u00010\n2\n\b\u0002\u0010\u0010\u001a\u0004\u0018\u00010\u00112\b\b\u0002\u0010\u0012\u001a\u00020\u000e2\n\b\u0002\u0010\u0013\u001a\u0004\u0018\u00010\n2\n\b\u0002\u0010\u0014\u001a\u0004\u0018\u00010\n2\b\b\u0002\u0010\u0015\u001a\u00020\u00162\b\b\u0002\u0010\u0017\u001a\u00020\u000e2\n\b\u0002\u0010\u0018\u001a\u0004\u0018\u00010\nH\u00c6\u0001J\u0013\u0010>\u001a\u00020\u000e2\b\u0010?\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u0010@\u001a\u00020AH\u00d6\u0001J\t\u0010B\u001a\u00020\nH\u00d6\u0001R\u0011\u0010\f\u001a\u00020\n\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001a\u0010\u001bR\u0013\u0010\u0018\u001a\u0004\u0018\u00010\n\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001c\u0010\u001bR\u0013\u0010\u000f\u001a\u0004\u0018\u00010\n\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001d\u0010\u001bR\u0011\u0010\u0017\u001a\u00020\u000e\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0017\u0010\u001eR\u0011\u0010\r\u001a\u00020\u000e\u00a2\u0006\b\n\u0000\u001a\u0004\b\r\u0010\u001eR\u0017\u0010\u0002\u001a\b\u0012\u0004\u0012\u00020\u00040\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u001f\u0010 R\u0013\u0010\u0013\u001a\u0004\u0018\u00010\n\u00a2\u0006\b\n\u0000\u001a\u0004\b!\u0010\u001bR\u0011\u0010\u0007\u001a\u00020\b\u00a2\u0006\b\n\u0000\u001a\u0004\b\"\u0010#R\u0013\u0010\u0014\u001a\u0004\u0018\u00010\n\u00a2\u0006\b\n\u0000\u001a\u0004\b$\u0010\u001bR\u0011\u0010\u000b\u001a\u00020\n\u00a2\u0006\b\n\u0000\u001a\u0004\b%\u0010\u001bR\u0011\u0010\u0015\u001a\u00020\u0016\u00a2\u0006\b\n\u0000\u001a\u0004\b&\u0010\'R\u0011\u0010\u0012\u001a\u00020\u000e\u00a2\u0006\b\n\u0000\u001a\u0004\b(\u0010\u001eR\u0013\u0010\u0010\u001a\u0004\u0018\u00010\u0011\u00a2\u0006\b\n\u0000\u001a\u0004\b)\u0010*R\u0011\u0010\t\u001a\u00020\n\u00a2\u0006\b\n\u0000\u001a\u0004\b+\u0010\u001bR\u0011\u0010\u0005\u001a\u00020\u0006\u00a2\u0006\b\n\u0000\u001a\u0004\b,\u0010-\u00a8\u0006C"}, d2 = {"Lcom/myshop/cafe/ui/screens/checkout/CheckoutUiState;", "", "items", "", "Lcom/myshop/cafe/data/models/CartItem;", "totalPrice", "", "orderType", "Lcom/myshop/cafe/data/models/OrderType;", "tableNumber", "", "phoneNumber", "customerName", "isSubmitting", "", "error", "successOrder", "Lcom/myshop/cafe/data/models/Order;", "showKhqr", "khqrString", "paymentMd5", "selectedPaymentMethod", "Lcom/myshop/cafe/ui/screens/checkout/PaymentMethod;", "isPaymentConfirmed", "deepLinkUrl", "(Ljava/util/List;DLcom/myshop/cafe/data/models/OrderType;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;ZLjava/lang/String;Lcom/myshop/cafe/data/models/Order;ZLjava/lang/String;Ljava/lang/String;Lcom/myshop/cafe/ui/screens/checkout/PaymentMethod;ZLjava/lang/String;)V", "getCustomerName", "()Ljava/lang/String;", "getDeepLinkUrl", "getError", "()Z", "getItems", "()Ljava/util/List;", "getKhqrString", "getOrderType", "()Lcom/myshop/cafe/data/models/OrderType;", "getPaymentMd5", "getPhoneNumber", "getSelectedPaymentMethod", "()Lcom/myshop/cafe/ui/screens/checkout/PaymentMethod;", "getShowKhqr", "getSuccessOrder", "()Lcom/myshop/cafe/data/models/Order;", "getTableNumber", "getTotalPrice", "()D", "component1", "component10", "component11", "component12", "component13", "component14", "component15", "component2", "component3", "component4", "component5", "component6", "component7", "component8", "component9", "copy", "equals", "other", "hashCode", "", "toString", "app_release"})
public final class CheckoutUiState {
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<com.myshop.cafe.data.models.CartItem> items = null;
    private final double totalPrice = 0.0;
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.data.models.OrderType orderType = null;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String tableNumber = null;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String phoneNumber = null;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String customerName = null;
    private final boolean isSubmitting = false;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String error = null;
    @org.jetbrains.annotations.Nullable()
    private final com.myshop.cafe.data.models.Order successOrder = null;
    private final boolean showKhqr = false;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String khqrString = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String paymentMd5 = null;
    @org.jetbrains.annotations.NotNull()
    private final com.myshop.cafe.ui.screens.checkout.PaymentMethod selectedPaymentMethod = null;
    private final boolean isPaymentConfirmed = false;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String deepLinkUrl = null;
    
    public CheckoutUiState(@org.jetbrains.annotations.NotNull()
    java.util.List<com.myshop.cafe.data.models.CartItem> items, double totalPrice, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.OrderType orderType, @org.jetbrains.annotations.NotNull()
    java.lang.String tableNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String phoneNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String customerName, boolean isSubmitting, @org.jetbrains.annotations.Nullable()
    java.lang.String error, @org.jetbrains.annotations.Nullable()
    com.myshop.cafe.data.models.Order successOrder, boolean showKhqr, @org.jetbrains.annotations.Nullable()
    java.lang.String khqrString, @org.jetbrains.annotations.Nullable()
    java.lang.String paymentMd5, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.ui.screens.checkout.PaymentMethod selectedPaymentMethod, boolean isPaymentConfirmed, @org.jetbrains.annotations.Nullable()
    java.lang.String deepLinkUrl) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.myshop.cafe.data.models.CartItem> getItems() {
        return null;
    }
    
    public final double getTotalPrice() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.myshop.cafe.data.models.OrderType getOrderType() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getTableNumber() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getPhoneNumber() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getCustomerName() {
        return null;
    }
    
    public final boolean isSubmitting() {
        return false;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getError() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final com.myshop.cafe.data.models.Order getSuccessOrder() {
        return null;
    }
    
    public final boolean getShowKhqr() {
        return false;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getKhqrString() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getPaymentMd5() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.myshop.cafe.ui.screens.checkout.PaymentMethod getSelectedPaymentMethod() {
        return null;
    }
    
    public final boolean isPaymentConfirmed() {
        return false;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getDeepLinkUrl() {
        return null;
    }
    
    public CheckoutUiState() {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.myshop.cafe.data.models.CartItem> component1() {
        return null;
    }
    
    public final boolean component10() {
        return false;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component11() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component12() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.myshop.cafe.ui.screens.checkout.PaymentMethod component13() {
        return null;
    }
    
    public final boolean component14() {
        return false;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component15() {
        return null;
    }
    
    public final double component2() {
        return 0.0;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.myshop.cafe.data.models.OrderType component3() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component4() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component5() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component6() {
        return null;
    }
    
    public final boolean component7() {
        return false;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component8() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final com.myshop.cafe.data.models.Order component9() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.myshop.cafe.ui.screens.checkout.CheckoutUiState copy(@org.jetbrains.annotations.NotNull()
    java.util.List<com.myshop.cafe.data.models.CartItem> items, double totalPrice, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.data.models.OrderType orderType, @org.jetbrains.annotations.NotNull()
    java.lang.String tableNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String phoneNumber, @org.jetbrains.annotations.NotNull()
    java.lang.String customerName, boolean isSubmitting, @org.jetbrains.annotations.Nullable()
    java.lang.String error, @org.jetbrains.annotations.Nullable()
    com.myshop.cafe.data.models.Order successOrder, boolean showKhqr, @org.jetbrains.annotations.Nullable()
    java.lang.String khqrString, @org.jetbrains.annotations.Nullable()
    java.lang.String paymentMd5, @org.jetbrains.annotations.NotNull()
    com.myshop.cafe.ui.screens.checkout.PaymentMethod selectedPaymentMethod, boolean isPaymentConfirmed, @org.jetbrains.annotations.Nullable()
    java.lang.String deepLinkUrl) {
        return null;
    }
    
    @java.lang.Override()
    public boolean equals(@org.jetbrains.annotations.Nullable()
    java.lang.Object other) {
        return false;
    }
    
    @java.lang.Override()
    public int hashCode() {
        return 0;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public java.lang.String toString() {
        return null;
    }
}