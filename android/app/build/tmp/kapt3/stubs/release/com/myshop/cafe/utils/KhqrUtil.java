package com.myshop.cafe.utils;

import android.graphics.Bitmap;
import android.graphics.Color;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;
import java.security.MessageDigest;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000,\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0002\b\n\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\b\n\u0002\b\u0002\b\u00c6\u0002\u0018\u00002\u00020\u0001:\u0001\u0017B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002J\u0010\u0010\b\u001a\u00020\u00042\u0006\u0010\t\u001a\u00020\u0004H\u0002J\u0018\u0010\n\u001a\u00020\u00042\u0006\u0010\u000b\u001a\u00020\u00042\u0006\u0010\f\u001a\u00020\u0004H\u0002J\u000e\u0010\r\u001a\u00020\u00042\u0006\u0010\u000e\u001a\u00020\u000fJ\u000e\u0010\u0010\u001a\u00020\u00042\u0006\u0010\u0011\u001a\u00020\u0004J\u001a\u0010\u0012\u001a\u0004\u0018\u00010\u00132\u0006\u0010\u0014\u001a\u00020\u00042\b\b\u0002\u0010\u0015\u001a\u00020\u0016R\u000e\u0010\u0003\u001a\u00020\u0004X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0005\u001a\u00020\u0004X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0004X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0007\u001a\u00020\u0004X\u0082T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0018"}, d2 = {"Lcom/myshop/cafe/utils/KhqrUtil;", "", "()V", "BANK_ABA", "", "BANK_ACLEDA", "BANK_BAKONG", "BANK_WING", "calculateCrc16", "data", "formatTlv", "tag", "value", "generateKhqr", "config", "Lcom/myshop/cafe/utils/KhqrUtil$KhqrConfig;", "generateMd5", "input", "generateQrBitmap", "Landroid/graphics/Bitmap;", "content", "size", "", "KhqrConfig", "app_release"})
public final class KhqrUtil {
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String BANK_ACLEDA = "khqr@aclb";
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String BANK_ABA = "khqr@aba";
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String BANK_WING = "khqr@wing";
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String BANK_BAKONG = "bakong@nbc";
    @org.jetbrains.annotations.NotNull()
    public static final com.myshop.cafe.utils.KhqrUtil INSTANCE = null;
    
    private KhqrUtil() {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String generateKhqr(@org.jetbrains.annotations.NotNull()
    com.myshop.cafe.utils.KhqrUtil.KhqrConfig config) {
        return null;
    }
    
    private final java.lang.String formatTlv(java.lang.String tag, java.lang.String value) {
        return null;
    }
    
    private final java.lang.String calculateCrc16(java.lang.String data) {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String generateMd5(@org.jetbrains.annotations.NotNull()
    java.lang.String input) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final android.graphics.Bitmap generateQrBitmap(@org.jetbrains.annotations.NotNull()
    java.lang.String content, int size) {
        return null;
    }
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000(\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u0006\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0018\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0010\b\n\u0002\b\u0002\b\u0086\b\u0018\u00002\u00020\u0001BG\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u0012\b\b\u0002\u0010\u0004\u001a\u00020\u0005\u0012\u0006\u0010\u0006\u001a\u00020\u0005\u0012\u0006\u0010\u0007\u001a\u00020\u0005\u0012\b\b\u0002\u0010\b\u001a\u00020\u0005\u0012\b\b\u0002\u0010\t\u001a\u00020\u0005\u0012\n\b\u0002\u0010\n\u001a\u0004\u0018\u00010\u0005\u00a2\u0006\u0002\u0010\u000bJ\t\u0010\u0015\u001a\u00020\u0003H\u00c6\u0003J\t\u0010\u0016\u001a\u00020\u0005H\u00c6\u0003J\t\u0010\u0017\u001a\u00020\u0005H\u00c6\u0003J\t\u0010\u0018\u001a\u00020\u0005H\u00c6\u0003J\t\u0010\u0019\u001a\u00020\u0005H\u00c6\u0003J\t\u0010\u001a\u001a\u00020\u0005H\u00c6\u0003J\u000b\u0010\u001b\u001a\u0004\u0018\u00010\u0005H\u00c6\u0003JQ\u0010\u001c\u001a\u00020\u00002\b\b\u0002\u0010\u0002\u001a\u00020\u00032\b\b\u0002\u0010\u0004\u001a\u00020\u00052\b\b\u0002\u0010\u0006\u001a\u00020\u00052\b\b\u0002\u0010\u0007\u001a\u00020\u00052\b\b\u0002\u0010\b\u001a\u00020\u00052\b\b\u0002\u0010\t\u001a\u00020\u00052\n\b\u0002\u0010\n\u001a\u0004\u0018\u00010\u0005H\u00c6\u0001J\u0013\u0010\u001d\u001a\u00020\u001e2\b\u0010\u001f\u001a\u0004\u0018\u00010\u0001H\u00d6\u0003J\t\u0010 \u001a\u00020!H\u00d6\u0001J\t\u0010\"\u001a\u00020\u0005H\u00d6\u0001R\u0011\u0010\u0007\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\rR\u0011\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000e\u0010\u000fR\u0011\u0010\b\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0010\u0010\rR\u0013\u0010\n\u001a\u0004\u0018\u00010\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0011\u0010\rR\u0011\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0012\u0010\rR\u0011\u0010\t\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0013\u0010\rR\u0011\u0010\u0006\u001a\u00020\u0005\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0014\u0010\r\u00a8\u0006#"}, d2 = {"Lcom/myshop/cafe/utils/KhqrUtil$KhqrConfig;", "", "amount", "", "currency", "", "merchantName", "accountNumber", "bankCode", "merchantCity", "billNumber", "(DLjava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", "getAccountNumber", "()Ljava/lang/String;", "getAmount", "()D", "getBankCode", "getBillNumber", "getCurrency", "getMerchantCity", "getMerchantName", "component1", "component2", "component3", "component4", "component5", "component6", "component7", "copy", "equals", "", "other", "hashCode", "", "toString", "app_release"})
    public static final class KhqrConfig {
        private final double amount = 0.0;
        @org.jetbrains.annotations.NotNull()
        private final java.lang.String currency = null;
        @org.jetbrains.annotations.NotNull()
        private final java.lang.String merchantName = null;
        @org.jetbrains.annotations.NotNull()
        private final java.lang.String accountNumber = null;
        @org.jetbrains.annotations.NotNull()
        private final java.lang.String bankCode = null;
        @org.jetbrains.annotations.NotNull()
        private final java.lang.String merchantCity = null;
        @org.jetbrains.annotations.Nullable()
        private final java.lang.String billNumber = null;
        
        public KhqrConfig(double amount, @org.jetbrains.annotations.NotNull()
        java.lang.String currency, @org.jetbrains.annotations.NotNull()
        java.lang.String merchantName, @org.jetbrains.annotations.NotNull()
        java.lang.String accountNumber, @org.jetbrains.annotations.NotNull()
        java.lang.String bankCode, @org.jetbrains.annotations.NotNull()
        java.lang.String merchantCity, @org.jetbrains.annotations.Nullable()
        java.lang.String billNumber) {
            super();
        }
        
        public final double getAmount() {
            return 0.0;
        }
        
        @org.jetbrains.annotations.NotNull()
        public final java.lang.String getCurrency() {
            return null;
        }
        
        @org.jetbrains.annotations.NotNull()
        public final java.lang.String getMerchantName() {
            return null;
        }
        
        @org.jetbrains.annotations.NotNull()
        public final java.lang.String getAccountNumber() {
            return null;
        }
        
        @org.jetbrains.annotations.NotNull()
        public final java.lang.String getBankCode() {
            return null;
        }
        
        @org.jetbrains.annotations.NotNull()
        public final java.lang.String getMerchantCity() {
            return null;
        }
        
        @org.jetbrains.annotations.Nullable()
        public final java.lang.String getBillNumber() {
            return null;
        }
        
        public final double component1() {
            return 0.0;
        }
        
        @org.jetbrains.annotations.NotNull()
        public final java.lang.String component2() {
            return null;
        }
        
        @org.jetbrains.annotations.NotNull()
        public final java.lang.String component3() {
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
        
        @org.jetbrains.annotations.Nullable()
        public final java.lang.String component7() {
            return null;
        }
        
        @org.jetbrains.annotations.NotNull()
        public final com.myshop.cafe.utils.KhqrUtil.KhqrConfig copy(double amount, @org.jetbrains.annotations.NotNull()
        java.lang.String currency, @org.jetbrains.annotations.NotNull()
        java.lang.String merchantName, @org.jetbrains.annotations.NotNull()
        java.lang.String accountNumber, @org.jetbrains.annotations.NotNull()
        java.lang.String bankCode, @org.jetbrains.annotations.NotNull()
        java.lang.String merchantCity, @org.jetbrains.annotations.Nullable()
        java.lang.String billNumber) {
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
}