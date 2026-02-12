package com.myshop.cafe.ui.screens.checkout

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.myshop.cafe.R
import com.myshop.cafe.data.models.OrderType
import com.myshop.cafe.ui.theme.*
import androidx.compose.animation.*
import androidx.compose.animation.core.*

import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.window.Dialog
import com.myshop.cafe.utils.KhqrUtil

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    viewModel: CheckoutViewModel = hiltViewModel(),
    onBackClick: () -> Unit,
    onOrderSuccess: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    // Theme colors matching mockup
    val backgroundColor = DarkNavy
    val cardColor = CardDark
    val inputColor = InputDark
    
    // Handle success
    LaunchedEffect(uiState.successOrder) {
        uiState.successOrder?.let { order ->
            onOrderSuccess(order.orderNumber)
        }
    }
    
    // Error snackbar
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(uiState.error) {
        uiState.error?.let { error ->
            snackbarHostState.showSnackbar(error)
            viewModel.clearError()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Text(
                        stringResource(R.string.checkout_title),
                        color = TextLight,
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    ) 
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            Icons.Default.ArrowBack, 
                            contentDescription = stringResource(R.string.back),
                            tint = TextLight
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = backgroundColor)
            )
        },
        containerColor = backgroundColor,
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(backgroundColor)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Order Summary
            OrderSummaryCard(
                items = uiState.items,
                total = uiState.totalPrice
            )
            
            // Order Type
            OrderTypeSection(
                selectedType = uiState.orderType,
                onTypeSelect = viewModel::setOrderType
            )
            
            // Table Number (for dine-in)
            if (uiState.orderType == OrderType.DINE_IN) {
                OutlinedTextField(
                    value = uiState.tableNumber,
                    onValueChange = viewModel::setTableNumber,
                    label = { Text(stringResource(R.string.table_number) + " *", color = TextGray) },
                    placeholder = { Text(stringResource(R.string.table_number_hint), color = TextGray) },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = inputColor,
                        unfocusedContainerColor = inputColor,
                        focusedBorderColor = BrownLight,
                        unfocusedBorderColor = Color.Transparent,
                        focusedTextColor = TextLight,
                        unfocusedTextColor = TextLight,
                        cursorColor = BrownLight
                    )
                )
            }
            
            // Phone Number
            Column {
                Text(
                    text = "Phone Number *",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextLight,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                OutlinedTextField(
                    value = uiState.phoneNumber,
                    onValueChange = viewModel::setPhoneNumber,
                    placeholder = { Text(stringResource(R.string.phone_number_hint), color = TextGray) },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = inputColor,
                        unfocusedContainerColor = inputColor,
                        focusedBorderColor = BrownLight,
                        unfocusedBorderColor = Color.Transparent,
                        focusedTextColor = TextLight,
                        unfocusedTextColor = TextLight,
                        cursorColor = BrownLight
                    )
                )
            }
            
            // Customer Name
            Column {
                Text(
                    text = "Name (Optional)",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextLight,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                OutlinedTextField(
                    value = uiState.customerName,
                    onValueChange = viewModel::setCustomerName,
                    placeholder = { Text(stringResource(R.string.customer_name_hint), color = TextGray) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = inputColor,
                        unfocusedContainerColor = inputColor,
                        focusedBorderColor = BrownLight,
                        unfocusedBorderColor = Color.Transparent,
                        focusedTextColor = TextLight,
                        unfocusedTextColor = TextLight,
                        cursorColor = BrownLight
                    )
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Place Order Button
            BouncyButton(
                onClick = viewModel::placeOrder,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                enabled = !uiState.isSubmitting,
                containerColor = if (uiState.isSubmitting) TextGray else BrownLight,
                shape = RoundedCornerShape(28.dp)
            ) {
                if (uiState.isSubmitting) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = stringResource(R.string.place_order),
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(Icons.Default.Send, contentDescription = null, tint = Color.White)
                    }
                }
            }
            
            // KHQR Button
            BouncyButton(
                onClick = { viewModel.showKhqr(true) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                enabled = !uiState.isSubmitting,
                containerColor = Color.Red,
                shape = RoundedCornerShape(28.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "Pay with KHQR",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "🇰🇭", fontSize = 20.sp)
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }

    if (uiState.showKhqr && uiState.khqrString != null) {
        KhqrPaymentDialog(
            khqrString = uiState.khqrString!!,
            amount = uiState.totalPrice,
            onDismiss = { viewModel.showKhqr(false) }
        )
    }
}

@Composable
private fun OrderSummaryCard(
    items: List<com.myshop.cafe.data.models.CartItem>,
    total: Double
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = CardDark
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(
                text = stringResource(R.string.order_summary),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = TextLight
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            items.forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "${item.quantity}x ${item.menuItem.name}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextGrayLight,
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        text = if (item.totalPrice.isNaN()) "$0.00" else "$${String.format("%.2f", item.totalPrice)}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                        color = TextLight
                    )
                }
            }
            
            HorizontalDivider(
                modifier = Modifier.padding(vertical = 16.dp),
                color = DarkNavyMedium
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = stringResource(R.string.cart_total),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextLight
                )
                val displayTotal = if (total.isNaN()) 0.0 else total
                Text(
                    text = "$${String.format("%.2f", displayTotal)}",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = BrownLight
                )
            }
        }
    }
}

@Composable
private fun OrderTypeSection(
    selectedType: OrderType,
    onTypeSelect: (OrderType) -> Unit
) {
    Column {
        Text(
            text = stringResource(R.string.order_type),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = TextLight
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OrderTypeButton(
                icon = Icons.Default.ShoppingBag,
                label = stringResource(R.string.takeaway),
                isSelected = selectedType == OrderType.TAKEAWAY,
                onClick = { onTypeSelect(OrderType.TAKEAWAY) },
                modifier = Modifier.weight(1f)
            )
            
            OrderTypeButton(
                icon = Icons.Default.People,
                label = stringResource(R.string.dine_in),
                isSelected = selectedType == OrderType.DINE_IN,
                onClick = { onTypeSelect(OrderType.DINE_IN) },
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun OrderTypeButton(
    icon: ImageVector,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .clickable(onClick = onClick)
            .border(
                width = 2.dp,
                color = if (isSelected) BrownLight else DarkNavyMedium,
                shape = RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        color = if (isSelected) CardDarkElevated else CardDark
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(28.dp),
                tint = if (isSelected) BrownLight else TextGray
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Medium,
                color = if (isSelected) TextLight else TextGray
            )
        }
    }
}

@Composable
fun OrderSuccessScreen(
    orderNumber: String,
    onTrackOrderClick: () -> Unit,
    onOrderMoreClick: () -> Unit
) {
    var showContent by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        showContent = true
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkNavy),
        contentAlignment = Alignment.Center
    ) {
        AnimatedVisibility(
            visible = showContent,
            enter = slideInVertically(
                initialOffsetY = { it / 2 },
                animationSpec = BouncySpringIntOffset
            ) + fadeIn(animationSpec = spring(stiffness = Spring.StiffnessLow))
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = CardDark)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Success Icon with its own bouncy scale
                    var iconVisible by remember { mutableStateOf(false) }
                    LaunchedEffect(Unit) {
                        kotlinx.coroutines.delay(200)
                        iconVisible = true
                    }
                    
                    AnimatedVisibility(
                        visible = iconVisible,
                        enter = scaleIn(
                            initialScale = 0.5f,
                            animationSpec = spring(
                                dampingRatio = 0.5f,
                                stiffness = Spring.StiffnessMediumLow
                            )
                        ) + fadeIn()
                    ) {
                        Surface(
                            modifier = Modifier.size(80.dp),
                            shape = RoundedCornerShape(40.dp),
                            color = Green600.copy(alpha = 0.2f)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = null,
                                    modifier = Modifier.size(40.dp),
                                    tint = Green500
                                )
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Text(
                        text = stringResource(R.string.order_placed),
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = TextLight
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = stringResource(R.string.order_sent_to_kitchen),
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextGray,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Order Number
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .bouncyClick(onClick = {}), // Add tactile feel even if just for show
                        shape = RoundedCornerShape(16.dp),
                        color = BrownLight
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = stringResource(R.string.order_number),
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.White.copy(alpha = 0.8f)
                            )
                            Text(
                                text = "#${orderNumber.split("-").lastOrNull() ?: orderNumber}",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = stringResource(R.string.proceed_to_counter),
                        style = MaterialTheme.typography.bodySmall,
                        color = TextGray,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Buttons with bouncy clicks
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        BouncyButton(
                            onClick = onTrackOrderClick,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            containerColor = DarkNavyMedium,
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(stringResource(R.string.track_order), color = TextLight)
                        }
                        
                        BouncyButton(
                            onClick = onOrderMoreClick,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            containerColor = BrownLight,
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                stringResource(R.string.order_more), 
                                color = Color.White, 
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun KhqrPaymentDialog(
    khqrString: String,
    amount: Double,
    onDismiss: () -> Unit
) {
    val bitmap = remember(khqrString) {
        KhqrUtil.generateQrBitmap(khqrString, 800)
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center,
                    modifier = Modifier.padding(bottom = 16.dp)
                ) {
                    Surface(
                        color = Color.Red,
                        shape = RoundedCornerShape(50),
                        modifier = Modifier.size(32.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("🇰🇭", fontSize = 16.sp)
                        }
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "KHQR Payment",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }

                Text(
                    text = "$${String.format("%.2f", amount)}",
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Black,
                    color = Color.Red
                )
                
                Text(
                    text = "Alvin Cafe",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )

                Spacer(modifier = Modifier.height(24.dp))

                // QR Code
                if (bitmap != null) {
                    androidx.compose.foundation.Image(
                        bitmap = bitmap.asImageBitmap(),
                        contentDescription = "KHQR Code",
                        modifier = Modifier
                            .fillMaxWidth()
                            .aspectRatio(1f)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Scan with Bakong, ACLEDA, ABA or any KHQR supported app",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray,
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.LightGray)
                ) {
                    Text("Cancel", color = Color.Black)
                }
            }
        }
    }
}
