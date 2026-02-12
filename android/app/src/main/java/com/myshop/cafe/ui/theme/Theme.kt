package com.myshop.cafe.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Coffee Shop Premium Light Theme (Cream/Beige)
private val LightColorScheme = lightColorScheme(
    primary = BrownPrimary,
    onPrimary = Color.White,
    primaryContainer = CreamLight,
    onPrimaryContainer = TextDark,
    secondary = BrownLight,
    onSecondary = Color.White,
    secondaryContainer = CreamWhite,
    onSecondaryContainer = BrownDark,
    tertiary = BrownGold,
    onTertiary = Color.White,
    tertiaryContainer = CreamLight,
    onTertiaryContainer = TextDark,
    error = Red500,
    onError = Color.White,
    errorContainer = Color(0xFFFFEDED),
    onErrorContainer = Red600,
    background = CreamWhite,
    onBackground = TextDark,
    surface = PureWhite,
    onSurface = TextDark,
    surfaceVariant = CreamLight,
    onSurfaceVariant = TextGray,
    outline = BrownPrimary.copy(alpha = 0.3f),
    outlineVariant = CreamLight
)

// Coffee Shop Premium Dark Theme (Navy/Dark Blue)
private val DarkColorScheme = darkColorScheme(
    primary = BrownLight,
    onPrimary = DarkNavy,
    primaryContainer = DarkNavyLight,
    onPrimaryContainer = CreamWhite,
    secondary = BrownGold,
    onSecondary = DarkNavy,
    secondaryContainer = DarkNavyMedium,
    onSecondaryContainer = CreamLight,
    tertiary = BrownPrimary,
    onTertiary = DarkNavy,
    tertiaryContainer = DarkNavyLight,
    onTertiaryContainer = CreamWhite,
    error = Red500,
    onError = Color.Black,
    errorContainer = Color(0xFF410002),
    onErrorContainer = Color(0xFFFFDAD6),
    background = DarkNavy,
    onBackground = TextLight,
    surface = DarkNavyLight,
    onSurface = TextLight,
    surfaceVariant = DarkNavyMedium,
    onSurfaceVariant = TextGrayLight,
    outline = BrownPrimary.copy(alpha = 0.5f),
    outlineVariant = DarkNavyMedium
)

@Composable
fun MyShopCafeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context.findActivity())?.window
            window?.let {
                it.statusBarColor = if (darkTheme) DarkNavy.toArgb() else CreamWhite.toArgb()
                WindowCompat.getInsetsController(it, view).isAppearanceLightStatusBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

private fun android.content.Context.findActivity(): Activity? {
    var context = this
    while (context is android.content.ContextWrapper) {
        if (context is Activity) return context
        context = context.baseContext
    }
    return null
}

