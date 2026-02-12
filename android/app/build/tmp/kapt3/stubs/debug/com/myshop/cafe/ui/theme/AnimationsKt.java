package com.myshop.cafe.ui.theme;

import androidx.compose.animation.core.Spring;
import androidx.compose.runtime.*;
import androidx.compose.ui.Modifier;
import androidx.compose.foundation.layout.RowScope;
import androidx.compose.material3.ButtonDefaults;
import androidx.compose.ui.graphics.Shape;

@kotlin.Metadata(mv = {1, 9, 0}, k = 2, xi = 48, d1 = {"\u0000P\n\u0000\n\u0002\u0018\u0002\n\u0002\u0010\u0007\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000b\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0004\u001ap\u0010\b\u001a\u00020\t2\f\u0010\n\u001a\b\u0012\u0004\u0012\u00020\t0\u000b2\b\b\u0002\u0010\f\u001a\u00020\r2\b\b\u0002\u0010\u000e\u001a\u00020\u000f2\b\b\u0002\u0010\u0010\u001a\u00020\u00112\b\b\u0002\u0010\u0012\u001a\u00020\u00112\b\b\u0002\u0010\u0013\u001a\u00020\u00142\u001c\u0010\u0015\u001a\u0018\u0012\u0004\u0012\u00020\u0017\u0012\u0004\u0012\u00020\t0\u0016\u00a2\u0006\u0002\b\u0018\u00a2\u0006\u0002\b\u0019H\u0007\u00f8\u0001\u0000\u00a2\u0006\u0004\b\u001a\u0010\u001b\u001a\"\u0010\u001c\u001a\u00020\r*\u00020\r2\b\b\u0002\u0010\u000e\u001a\u00020\u000f2\f\u0010\n\u001a\b\u0012\u0004\u0012\u00020\t0\u000b\"\u0017\u0010\u0000\u001a\b\u0012\u0004\u0012\u00020\u00020\u0001\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0003\u0010\u0004\"\u0017\u0010\u0005\u001a\b\u0012\u0004\u0012\u00020\u00060\u0001\u00a2\u0006\b\n\u0000\u001a\u0004\b\u0007\u0010\u0004\u0082\u0002\u0007\n\u0005\b\u00a1\u001e0\u0001\u00a8\u0006\u001d"}, d2 = {"BouncySpring", "Landroidx/compose/animation/core/SpringSpec;", "", "getBouncySpring", "()Landroidx/compose/animation/core/SpringSpec;", "BouncySpringIntOffset", "Landroidx/compose/ui/unit/IntOffset;", "getBouncySpringIntOffset", "BouncyButton", "", "onClick", "Lkotlin/Function0;", "modifier", "Landroidx/compose/ui/Modifier;", "enabled", "", "containerColor", "Landroidx/compose/ui/graphics/Color;", "contentColor", "shape", "Landroidx/compose/ui/graphics/Shape;", "content", "Lkotlin/Function1;", "Landroidx/compose/foundation/layout/RowScope;", "Landroidx/compose/runtime/Composable;", "Lkotlin/ExtensionFunctionType;", "BouncyButton-ZkgLGzA", "(Lkotlin/jvm/functions/Function0;Landroidx/compose/ui/Modifier;ZJJLandroidx/compose/ui/graphics/Shape;Lkotlin/jvm/functions/Function1;)V", "bouncyClick", "app_debug"})
public final class AnimationsKt {
    
    /**
     * Global Bouncy Spring configuration for iOS-like feel (Float)
     * Toned down damping for a more professional feel (less overshoot)
     */
    @org.jetbrains.annotations.NotNull()
    private static final androidx.compose.animation.core.SpringSpec<java.lang.Float> BouncySpring = null;
    
    /**
     * Global Bouncy Spring configuration for iOS-like feel (IntOffset)
     * Toned down damping for a more professional feel (less overshoot)
     */
    @org.jetbrains.annotations.NotNull()
    private static final androidx.compose.animation.core.SpringSpec<androidx.compose.ui.unit.IntOffset> BouncySpringIntOffset = null;
    
    /**
     * Global Bouncy Spring configuration for iOS-like feel (Float)
     * Toned down damping for a more professional feel (less overshoot)
     */
    @org.jetbrains.annotations.NotNull()
    public static final androidx.compose.animation.core.SpringSpec<java.lang.Float> getBouncySpring() {
        return null;
    }
    
    /**
     * Global Bouncy Spring configuration for iOS-like feel (IntOffset)
     * Toned down damping for a more professional feel (less overshoot)
     */
    @org.jetbrains.annotations.NotNull()
    public static final androidx.compose.animation.core.SpringSpec<androidx.compose.ui.unit.IntOffset> getBouncySpringIntOffset() {
        return null;
    }
    
    /**
     * Modifier that adds a bouncy scale effect when the element is clicked.
     * Provides a tactile, premium feel similar to iOS controls.
     * Uses pointerInput for state and clickable for the action to ensure maximum compatibility.
     */
    @org.jetbrains.annotations.NotNull()
    public static final androidx.compose.ui.Modifier bouncyClick(@org.jetbrains.annotations.NotNull()
    androidx.compose.ui.Modifier $this$bouncyClick, boolean enabled, @org.jetbrains.annotations.NotNull()
    kotlin.jvm.functions.Function0<kotlin.Unit> onClick) {
        return null;
    }
}