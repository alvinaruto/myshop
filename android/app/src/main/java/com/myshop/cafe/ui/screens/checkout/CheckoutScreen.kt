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

import androidx.compose.foundation.BorderStroke
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import android.content.ClipboardManager
import android.content.ClipData
import android.content.Context
import androidx.compose.ui.window.Dialog
import com.myshop.cafe.utils.KhqrUtil

val TealPay = Color(0xFF1B8A9E)

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
    val context = LocalContext.current
    val currentDeepLink = uiState.deepLinkUrl
    
    // Auto-launch deep link when KHQR dialog is shown for ACLEDA Mobile
    LaunchedEffect(uiState.showKhqr, currentDeepLink) {
        if (uiState.showKhqr && currentDeepLink != null) {
            launchDeepLink(context, currentDeepLink, uiState.khqrString ?: "")
        }
    }
    
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
            // 1. Summary Section (Mockup Style)
            SummaryCard(total = uiState.totalPrice)
            
            // 2. Choose Payment Methods Section
            PaymentMethodSection(
                selectedMethod = uiState.selectedPaymentMethod,
                onMethodSelect = viewModel::setPaymentMethod
            )

            // Table Number & Phone (Collapsible or simplified to keep focus on payment)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(cardColor, RoundedCornerShape(20.dp))
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Order Details",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextLight
                )

                if (uiState.orderType == OrderType.DINE_IN) {
                    OutlinedTextField(
                        value = uiState.tableNumber,
                        onValueChange = viewModel::setTableNumber,
                        label = { Text("Table Number *", color = TextGray) },
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = inputColor,
                            unfocusedContainerColor = inputColor,
                            focusedBorderColor = BrownLight,
                            unfocusedBorderColor = Color.Transparent,
                            focusedTextColor = TextLight,
                            unfocusedTextColor = TextLight
                        )
                    )
                }

                OutlinedTextField(
                    value = uiState.phoneNumber,
                    onValueChange = viewModel::setPhoneNumber,
                    label = { Text("Phone Number *", color = TextGray) },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = inputColor,
                        unfocusedContainerColor = inputColor,
                        focusedBorderColor = BrownLight,
                        unfocusedBorderColor = Color.Transparent,
                        focusedTextColor = TextLight,
                        unfocusedTextColor = TextLight
                    )
                )
            }

            // 3. Confirmation Checkbox
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.setPaymentConfirmed(!uiState.isPaymentConfirmed) }
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = uiState.isPaymentConfirmed,
                    onCheckedChange = { viewModel.setPaymentConfirmed(it) },
                    colors = CheckboxDefaults.colors(
                        checkedColor = BrownLight,
                        uncheckedColor = TextGray,
                        checkmarkColor = Color.White
                    )
                )
                Text(
                    text = "I hereby confirm this payment",
                    color = TextLight,
                    fontSize = 14.sp
                )
            }
            
            // 4. Action Buttons (Cancel and Pay Now)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                BouncyButton(
                    onClick = onBackClick,
                    modifier = Modifier
                        .weight(1f)
                        .height(56.dp),
                    containerColor = DarkNavyMedium,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Cancel", fontWeight = FontWeight.Bold)
                    }
                }

                BouncyButton(
                    onClick = viewModel::onPayNowClick,
                    modifier = Modifier
                        .weight(1f)
                        .height(56.dp),
                    enabled = !uiState.isSubmitting,
                    containerColor = if (uiState.isSubmitting) TextGray else TealPay,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    if (uiState.isSubmitting) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Pay Now", fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }

    if (uiState.showKhqr && uiState.khqrString != null) {
        KhqrPaymentDialog(
            khqrString = uiState.khqrString!!,
            amount = uiState.totalPrice,
            deepLinkUrl = uiState.deepLinkUrl,
            onDismiss = { viewModel.showKhqr(false) }
        )
    }
}

@Composable
private fun SummaryCard(total: Double) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        color = Color(0xFF2D2F45)
    ) {
        Row(
            modifier = Modifier
                .padding(24.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.ShoppingBag,
                        contentDescription = null,
                        tint = TextGray,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = "Summary",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextLight
                    )
                }
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Total amount to be paid",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextGray
                )
            }
            Text(
                text = "${String.format("%,.2f", if (total.isNaN()) 0.0 else total)} USD",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Black,
                color = TextLight
            )
        }
    }
}

@Composable
private fun PaymentMethodSection(
    selectedMethod: PaymentMethod,
    onMethodSelect: (PaymentMethod) -> Unit
) {
    Column {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.People, contentDescription = null, tint = TextGray, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(8.dp))
            Text(
                text = "Choose Payment Methods",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = TextLight
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            PaymentMethodItem(
                method = PaymentMethod.ACLEDA_KHQR,
                title = "ACLEDA KHQR",
                subtitle = "Scan to pay with ACLEDA app or any bank apps",
                icon = "QR",
                iconColor = Color.Red,
                isSelected = selectedMethod == PaymentMethod.ACLEDA_KHQR,
                onClick = { onMethodSelect(PaymentMethod.ACLEDA_KHQR) }
            )
            
            PaymentMethodItem(
                method = PaymentMethod.ACLEDA_MOBILE,
                title = "ACLEDA mobile",
                subtitle = "Pay with ACLEDA mobile",
                icon = "APP",
                iconColor = Color(0xFF0D47A1),
                isSelected = selectedMethod == PaymentMethod.ACLEDA_MOBILE,
                onClick = { onMethodSelect(PaymentMethod.ACLEDA_MOBILE) }
            )
            
            PaymentMethodItem(
                method = PaymentMethod.ACLEDA_PAY,
                title = "ACLEDA Pay",
                subtitle = "ACLEDA Cards / Bank Account / ACLEDA mobile",
                icon = "PAY",
                iconColor = Color(0xFF0D47A1),
                isSelected = selectedMethod == PaymentMethod.ACLEDA_PAY,
                onClick = { onMethodSelect(PaymentMethod.ACLEDA_PAY) }
            )
            
            PaymentMethodItem(
                method = PaymentMethod.CARD,
                title = "Credit / Debit Card",
                subtitle = "VISA / MasterCard / JC B",
                icon = "CARD",
                iconColor = Color.Gray,
                isSelected = selectedMethod == PaymentMethod.CARD,
                onClick = { onMethodSelect(PaymentMethod.CARD) }
            )
        }
    }
}

@Composable
private fun PaymentMethodItem(
    method: PaymentMethod,
    title: String,
    subtitle: String,
    icon: String,
    iconColor: Color,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        color = Color.White,
        border = if (isSelected) BorderStroke(2.dp, BrownLight) else null
    ) {
        Row(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon Placeholder
            Surface(
                modifier = Modifier.size(40.dp),
                shape = RoundedCornerShape(8.dp),
                color = iconColor.copy(alpha = 0.1f),
                border = BorderStroke(1.dp, iconColor.copy(alpha = 0.2f))
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(icon, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = iconColor)
                }
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.Gray
                )
            }
            
            RadioButton(
                selected = isSelected,
                onClick = onClick,
                colors = RadioButtonDefaults.colors(
                    selectedColor = BrownLight,
                    unselectedColor = Color.LightGray
                )
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

val BakongRed = Color(0xFFE1232E)

@Composable
fun KhqrPaymentDialog(
    khqrString: String,
    amount: Double,
    deepLinkUrl: String? = null,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val bitmap = remember(khqrString) {
        KhqrUtil.generateQrBitmap(khqrString, 800)
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Official Red Header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(BakongRed)
                        .padding(vertical = 16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "KHQR",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Black,
                        color = Color.White,
                        fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                    )
                }

                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "MY SHOP",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color.Gray,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                    
                    Text(
                        text = "$${String.format("%.2f", amount)}",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Black,
                        color = Color.Black
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // QR Code with border
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .aspectRatio(1f)
                            .padding(8.dp),
                        shape = RoundedCornerShape(16.dp),
                        border = BorderStroke(1.dp, Color.LightGray.copy(alpha = 0.5f)),
                        color = Color.White
                    ) {
                        if (bitmap != null) {
                            androidx.compose.foundation.Image(
                                bitmap = bitmap.asImageBitmap(),
                                contentDescription = "KHQR Code",
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(16.dp)
                                    .clip(RoundedCornerShape(8.dp))
                            )
                        } else {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = BakongRed)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    Text(
                        text = "Scan to pay with Bakong\nor any mobile banking app",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                        lineHeight = 16.sp
                    )
                    
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    if (deepLinkUrl != null) {
                        Text(
                            text = "Auto-opening ACLEDA...\nIf it fails, tap 'Copy KHQR' and use 'Paste QR' in the app.",
                            fontSize = 12.sp,
                            color = Color.Gray,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        BouncyButton(
                            onClick = {
                                launchDeepLink(context, deepLinkUrl, khqrString)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .padding(bottom = 8.dp),
                            containerColor = Color(0xFF0D47A1), // ACLEDA Blue
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Open ACLEDA Mobile", color = Color.White, fontWeight = FontWeight.Bold)
                        }

                        BouncyButton(
                            onClick = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val clip = ClipData.newPlainText("KHQR Data", khqrString)
                                clipboard.setPrimaryClip(clip)
                                Toast.makeText(context, "KHQR Copied! Paste it in ACLEDA app.", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .padding(bottom = 8.dp),
                            containerColor = Color(0xFFE3F2FD), // Light Blue
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Copy KHQR to Paste", color = Color(0xFF0D47A1), fontWeight = FontWeight.Bold)
                        }
                    }

                    BouncyButton(
                        onClick = onDismiss,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        containerColor = Color.LightGray.copy(alpha = 0.3f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Cancel", color = Color.Gray, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

private fun launchDeepLink(context: android.content.Context, deepLinkUrl: String, khqrString: String) {
    val encodedKhqr = java.net.URLEncoder.encode(khqrString, "UTF-8")
    val schemes = listOf(
        deepLinkUrl, // Primary
        "acledamobile://khqr/pay?qr=$encodedKhqr",
        "acledamobile://pay/khqr?qr=$encodedKhqr",
        "acledamobile://scan/khqr?qr=$encodedKhqr",
        "acledabankqr://khqr/pay?qr=$encodedKhqr",
        "acledabankqr://pay/khqr?qr=$encodedKhqr",
        "acledabankqr://scan/khqr?qr=$encodedKhqr",
        "acledabankqr://qr?data=$encodedKhqr",
        "acledabankqr://pay?qr=$encodedKhqr",
        "acledamobile://qr?data=$encodedKhqr",
        "acledamobile://pay?qr=$encodedKhqr",
        "acledabank://khqr/scan?qr=$encodedKhqr",
        "acleda://khqr/scan?qr=$encodedKhqr",
        "acledaplay://khqr/scan?qr=$encodedKhqr"
    )

    var launched = false
    
    // 1. Try schemes first with Extras
    for (scheme in schemes) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(scheme))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            // Add "Swiss Army Knife" Extras - pass data in every possible way
            intent.putExtra("qr", khqrString)
            intent.putExtra("khqr", khqrString)
            intent.putExtra("data", khqrString)
            intent.putExtra("payload", khqrString)
            intent.putExtra("deep_link_value", khqrString)
            
            context.startActivity(intent)
            launched = true
            break
        } catch (e: Exception) {
            // Try next scheme
        }
    }

    // 2. Fallback: Launch by Package Name if schemes failed
    if (!launched) {
        val packages = listOf("com.domain.acledabankqr", "com.acledabank.mobile")
        for (pkg in packages) {
            try {
                val intent = context.packageManager.getLaunchIntentForPackage(pkg)
                if (intent != null) {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    // Pass extras here too
                    intent.putExtra("qr", khqrString)
                    intent.putExtra("khqr", khqrString)
                    intent.putExtra("data", khqrString) 
                    context.startActivity(intent)
                    launched = true
                    break
                }
            } catch (e: Exception) {
                // Try next package
            }
        }
    }

    if (!launched) {
        Toast.makeText(context, "ACLEDA Mobile app not found or could not be opened.", Toast.LENGTH_LONG).show()
    }
}
