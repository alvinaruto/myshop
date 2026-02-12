package com.myshop.cafe.ui.screens.orderstatus

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.LocalCafe
import androidx.compose.material.icons.outlined.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.myshop.cafe.R
import com.myshop.cafe.data.models.Order
import com.myshop.cafe.ui.theme.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderStatusScreen(
    viewModel: OrderStatusViewModel = hiltViewModel(),
    onBackClick: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var isDarkTheme by remember { mutableStateOf(true) }
    
    // Current time state for display
    var currentTime by remember { mutableStateOf(LocalDateTime.now()) }
    LaunchedEffect(Unit) {
        while (true) {
            currentTime = LocalDateTime.now()
            kotlinx.coroutines.delay(1000)
        }
    }
    
    val backgroundColor = if (isDarkTheme) DarkNavy else CreamWhite
    val contentColor = if (isDarkTheme) TextLight else TextDark
    val surfaceColor = if (isDarkTheme) DarkNavyLight else PureWhite
    val cardColor = if (isDarkTheme) CardDark else CardLight
    
    val animatedBgColor by animateColorAsState(targetValue = backgroundColor, label = "bgColor")
    val animatedContentColor by animateColorAsState(targetValue = contentColor, label = "contentColor")
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            Icons.Default.ArrowBack,
                            contentDescription = stringResource(R.string.back),
                            tint = animatedContentColor
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { isDarkTheme = !isDarkTheme }) {
                        Icon(
                            if (isDarkTheme) Icons.Default.LightMode else Icons.Default.DarkMode,
                            contentDescription = "Toggle Theme",
                            tint = if (isDarkTheme) BrownLight else TextDark
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent,
                    scrolledContainerColor = animatedBgColor.copy(alpha = 0.95f)
                )
            )
        },
        containerColor = animatedBgColor
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(animatedBgColor)
                .padding(padding)
        ) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp),
                contentPadding = PaddingValues(bottom = 32.dp)
            ) {
                // Header Section
                item {
                    HeaderSection(
                        currentTime = currentTime,
                        textColor = animatedContentColor,
                        accentColor = if (isDarkTheme) BrownLight else BrownPrimary
                    )
                }
                
                // Track Order Section
                item {
                    PhoneSearchCard(
                        phoneNumber = uiState.phoneNumber,
                        onPhoneChange = viewModel::setPhoneNumber,
                        onSearch = viewModel::searchOrders,
                        isSearching = uiState.isSearching,
                        searchedPhone = uiState.searchedPhone,
                        customerOrders = uiState.customerOrders,
                        cardColor = cardColor,
                        textColor = animatedContentColor,
                        accentColor = BrownLight,
                        inputBgColor = if (isDarkTheme) InputDark else InputLight
                    )
                }
                
                // Order Queue Dashboard
                item {
                    OrderQueueDashboard(
                        allOrders = uiState.allOrders,
                        cardColor = cardColor,
                        textColor = animatedContentColor
                    )
                }
                
                // Footer
                item {
                    FooterSection(textColor = animatedContentColor)
                }
            }
        }
    }
}

@Composable
private fun HeaderSection(
    currentTime: LocalDateTime,
    textColor: Color,
    accentColor: Color
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Surface(
                modifier = Modifier.size(48.dp),
                shape = CircleShape,
                color = accentColor,
                shadowElevation = 8.dp
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        Icons.Outlined.LocalCafe,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(
                    text = "Order Status",
                    style = MaterialTheme.typography.headlineSmall,
                    color = textColor,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Check your coffee status",
                    style = MaterialTheme.typography.bodyMedium,
                    color = textColor.copy(alpha = 0.7f)
                )
            }
        }
        
        Column(horizontalAlignment = Alignment.End) {
            Text(
                text = currentTime.format(DateTimeFormatter.ofPattern("HH:mm")),
                style = MaterialTheme.typography.headlineMedium,
                color = textColor,
                fontWeight = FontWeight.Black
            )
            Text(
                text = currentTime.format(DateTimeFormatter.ofPattern("EEE, MMM d")),
                style = MaterialTheme.typography.labelMedium,
                color = textColor.copy(alpha = 0.6f),
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
private fun PhoneSearchCard(
    phoneNumber: String,
    onPhoneChange: (String) -> Unit,
    onSearch: () -> Unit,
    isSearching: Boolean,
    searchedPhone: String,
    customerOrders: List<Order>,
    cardColor: Color,
    textColor: Color,
    accentColor: Color,
    inputBgColor: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth().shadow(8.dp, RoundedCornerShape(24.dp)),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = cardColor)
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Text(
                text = "Track Your Order",
                style = MaterialTheme.typography.titleMedium,
                color = textColor,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = phoneNumber,
                    onValueChange = onPhoneChange,
                    placeholder = { 
                        Text(
                            "Enter Phone Number", 
                            color = textColor.copy(alpha = 0.4f)
                        ) 
                    },
                    modifier = Modifier.weight(1f),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Phone,
                        imeAction = ImeAction.Search
                    ),
                    keyboardActions = KeyboardActions(onSearch = { onSearch() }),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = textColor,
                        unfocusedTextColor = textColor,
                        focusedBorderColor = accentColor,
                        unfocusedBorderColor = textColor.copy(alpha = 0.2f),
                        cursorColor = accentColor,
                        focusedContainerColor = inputBgColor,
                        unfocusedContainerColor = inputBgColor
                    ),
                    shape = RoundedCornerShape(16.dp),
                    singleLine = true,
                    leadingIcon = {
                        Icon(
                            Icons.Default.Search, 
                            contentDescription = null, 
                            tint = textColor.copy(alpha = 0.5f)
                        )
                    }
                )
                
                Button(
                    onClick = onSearch,
                    enabled = phoneNumber.isNotBlank() && !isSearching,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = accentColor,
                        disabledContainerColor = accentColor.copy(alpha = 0.5f)
                    ),
                    shape = RoundedCornerShape(16.dp),
                    contentPadding = PaddingValues(0.dp),
                    modifier = Modifier.size(56.dp)
                ) {
                    if (isSearching) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            Icons.Default.ArrowBack, // Using ArrowBack as a generic "Go" or similar if no Send icon
                            contentDescription = "Search",
                            modifier = Modifier.rotate(180f) // Rotate to look like forward arrow
                        )
                    }
                }
            }
            
            // Results
            AnimatedVisibility(visible = searchedPhone.isNotBlank()) {
                Column {
                    Spacer(modifier = Modifier.height(24.dp))
                    Text(
                        text = "Orders for $searchedPhone",
                        style = MaterialTheme.typography.labelLarge,
                        color = accentColor,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    if (customerOrders.isEmpty()) {
                        Text(
                            text = stringResource(R.string.no_orders_found),
                            style = MaterialTheme.typography.bodyMedium,
                            color = textColor.copy(alpha = 0.6f)
                        )
                    } else {
                        customerOrders.forEach { order ->
                            CustomerOrderCard(
                                order = order, 
                                textColor = textColor,
                                bgColor = inputBgColor
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun OrderQueueDashboard(
    allOrders: List<Order>,
    cardColor: Color,
    textColor: Color
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Preparing Column
            DashboardCard(
                title = "Preparing",
                orders = allOrders.filter { it.status == "preparing" || it.status == "pending" },
                icon = Icons.Default.Schedule,
                accentColor = Orange500,
                modifier = Modifier.weight(1f),
                textColor = textColor,
                cardColor = cardColor
            )
            
            // Ready Column
            DashboardCard(
                title = "Ready",
                orders = allOrders.filter { it.status == "ready" },
                icon = Icons.Default.CheckCircle,
                accentColor = Green500,
                modifier = Modifier.weight(1f),
                isReady = true,
                textColor = textColor,
                cardColor = cardColor
            )
        }
    }
}

@Composable
private fun DashboardCard(
    title: String,
    orders: List<Order>,
    icon: ImageVector,
    accentColor: Color,
    modifier: Modifier,
    isReady: Boolean = false,
    textColor: Color,
    cardColor: Color
) {
    Card(
        modifier = modifier.height(380.dp).shadow(4.dp, RoundedCornerShape(24.dp)),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = cardColor)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 16.dp)
            ) {
                Surface(
                    color = accentColor.copy(alpha = 0.1f),
                    shape = CircleShape,
                    modifier = Modifier.size(36.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            icon,
                            contentDescription = null,
                            tint = accentColor,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = textColor
                    )
                    Text(
                        text = "${orders.size}",
                        style = MaterialTheme.typography.labelMedium,
                        color = textColor.copy(alpha = 0.5f)
                    )
                }
            }
            
            if (orders.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize().weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Empty",
                        color = textColor.copy(alpha = 0.3f),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(orders) { order ->
                        QueueOrderCard(
                            order = order,
                            isReady = isReady,
                            accentColor = accentColor,
                            textColor = textColor
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun QueueOrderCard(
    order: Order,
    isReady: Boolean,
    accentColor: Color,
    textColor: Color
) {
    Surface(
        color = accentColor.copy(alpha = if (isReady) 0.1f else 0.05f),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "#${getShortOrderNumber(order.orderNumber)}",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = textColor
            )
            
            if (isReady) {
                Icon(
                    Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = accentColor,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}

@Composable
fun CustomerOrderCard(
    order: Order,
    textColor: Color = TextLight,
    bgColor: Color = CardDark
) {
    val statusColor = when (order.status) {
        "ready" -> Green500
        "preparing" -> Blue500
        "pending" -> Yellow500
        else -> Stone500
    }
    
    Surface(
        color = bgColor,
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth().border(1.dp, statusColor.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "#${getShortOrderNumber(order.orderNumber)}",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Black,
                    color = textColor
                )
                
                Surface(
                    color = statusColor,
                    shape = RoundedCornerShape(50)
                ) {
                    Text(
                        text = order.status.replaceFirstChar { it.uppercase() },
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            order.items?.let { items ->
                Text(
                    text = items.joinToString(", ") { "${it.quantity}x ${it.name}" },
                    style = MaterialTheme.typography.bodyMedium,
                    color = textColor.copy(alpha = 0.8f)
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Fix NaN issue here
            val priceText = if (order.totalUsd == null || order.totalUsd.isNaN()) {
                "Price TBD"
            } else {
                "$${String.format("%.2f", order.totalUsd)}"
            }
            
            Text(
                text = priceText,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = CoffeeGold
            )
        }
    }
}

@Composable
private fun FooterSection(textColor: Color) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Please check in with the counter if your order is delayed.",
            style = MaterialTheme.typography.bodySmall,
            color = textColor.copy(alpha = 0.5f),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}

private fun getShortOrderNumber(orderNumber: String): String {
    return orderNumber.split("-").lastOrNull() ?: orderNumber
}

// Extension to rotate modifier
fun Modifier.rotate(degrees: Float) = this.then(
    Modifier.graphicsLayer(rotationZ = degrees)
)

