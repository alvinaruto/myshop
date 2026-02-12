package com.myshop.cafe.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.myshop.cafe.ui.screens.cart.CartScreen
import com.myshop.cafe.ui.screens.checkout.CheckoutScreen
import com.myshop.cafe.ui.screens.menu.MenuScreen
import com.myshop.cafe.ui.screens.menu.MenuViewModel
import com.myshop.cafe.ui.screens.orderstatus.OrderStatusScreen
import com.myshop.cafe.ui.screens.auth.LoginScreen
import com.myshop.cafe.ui.screens.profile.ProfileScreen
import com.myshop.cafe.ui.screens.profile.PersonalInfoScreen
import com.myshop.cafe.ui.screens.profile.OrderHistoryScreen
import com.myshop.cafe.ui.screens.profile.PaymentMethodsScreen
import com.myshop.cafe.ui.screens.profile.SettingsScreen
import com.myshop.cafe.data.repository.UserRepository
import com.myshop.cafe.ui.theme.*
import androidx.compose.animation.*
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring

sealed class Screen(val route: String) {
    data object Menu : Screen("menu")
    data object Cart : Screen("cart")
    data object Checkout : Screen("checkout")
    data object OrderStatus : Screen("order_status")
    data object OrderSuccess : Screen("order_success/{orderNumber}") {
        fun createRoute(orderNumber: String) = "order_success/$orderNumber"
    }
    data object Profile : Screen("profile")
    data object Login : Screen("login")
    // Profile Sub-screens
    data object PersonalInfo : Screen("profile/personal_info")
    data object OrderHistory : Screen("profile/order_history")
    data object PaymentMethods : Screen("profile/payment_methods")
    data object Settings : Screen("profile/settings")
}

@Composable
fun NavGraph(
    navController: NavHostController = rememberNavController(),
    menuViewModel: MenuViewModel = hiltViewModel()
) {
    val profileViewModel: com.myshop.cafe.ui.screens.profile.ProfileViewModel = hiltViewModel()
    val userSession by profileViewModel.userSession.collectAsState()
    val menuUiState by menuViewModel.uiState.collectAsState()

    MainScaffold(
        navController = navController,
        cartItemCount = menuUiState.cartItemCount
    ) {
        NavHost(
            navController = navController,
            startDestination = if (userSession.isLoggedIn) Screen.Menu.route else Screen.Login.route,
            enterTransition = {
                slideIntoContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Start,
                    animationSpec = BouncySpringIntOffset
                ) + fadeIn(animationSpec = spring(stiffness = Spring.StiffnessLow))
            },
            exitTransition = {
                slideOutOfContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Start,
                    animationSpec = spring(stiffness = Spring.StiffnessLow)
                ) + fadeOut()
            },
            popEnterTransition = {
                slideIntoContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.End,
                    animationSpec = BouncySpringIntOffset
                ) + fadeIn(animationSpec = spring(stiffness = Spring.StiffnessLow))
            },
            popExitTransition = {
                slideOutOfContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.End,
                    animationSpec = spring(stiffness = Spring.StiffnessLow)
                ) + fadeOut()
            }
        ) {
            composable(Screen.Login.route) {
                LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Screen.Menu.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Profile.route) {
                ProfileScreen(
                    navController = navController,
                    onLogout = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
            
            // Profile Sub-routes
            composable(Screen.PersonalInfo.route) {
                PersonalInfoScreen(onBackClick = { navController.popBackStack() })
            }
            composable(Screen.OrderHistory.route) {
                OrderHistoryScreen(onBackClick = { navController.popBackStack() })
            }
            composable(Screen.PaymentMethods.route) {
                PaymentMethodsScreen(onBackClick = { navController.popBackStack() })
            }
            composable(Screen.Settings.route) {
                SettingsScreen(onBackClick = { navController.popBackStack() })
            }
            
            composable(Screen.Menu.route) {
                MenuScreen(
                    viewModel = menuViewModel
                )
            }
            
            composable(Screen.Cart.route) {
                CartScreen(
                    onBackClick = { navController.navigate(Screen.Menu.route) }, // Cart is now a tab, but back goes home for safety
                    onCheckoutClick = { navController.navigate(Screen.Checkout.route) }
                )
            }
            
            composable(Screen.Checkout.route) {
                CheckoutScreen(
                    onBackClick = { navController.popBackStack() },
                    onOrderSuccess = { orderNumber ->
                        navController.navigate(Screen.OrderSuccess.createRoute(orderNumber)) {
                            popUpTo(Screen.Menu.route) { inclusive = false }
                        }
                    }
                )
            }
            
            composable(Screen.OrderStatus.route) {
                OrderStatusScreen(
                    onBackClick = { navController.navigate(Screen.Menu.route) } // Tab behavior
                )
            }
            
            composable(Screen.OrderSuccess.route) { backStackEntry ->
                val orderNumber = backStackEntry.arguments?.getString("orderNumber") ?: ""
                OrderSuccessContent(
                    orderNumber = orderNumber,
                    onTrackOrderClick = { navController.navigate(Screen.OrderStatus.route) },
                    onOrderMoreClick = {
                        navController.navigate(Screen.Menu.route) {
                            popUpTo(Screen.Menu.route) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}

@Composable
private fun OrderSuccessContent(
    orderNumber: String,
    onTrackOrderClick: () -> Unit,
    onOrderMoreClick: () -> Unit
) {
    com.myshop.cafe.ui.screens.checkout.OrderSuccessScreen(
        orderNumber = orderNumber,
        onTrackOrderClick = onTrackOrderClick,
        onOrderMoreClick = onOrderMoreClick
    )
}
