package com.myshop.cafe.ui.screens.auth

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.clickable
import androidx.compose.foundation.border
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ContentPaste
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import android.content.Intent
import android.net.Uri
import com.myshop.cafe.ui.theme.*
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.ui.res.painterResource
import com.myshop.cafe.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: LoginViewModel = hiltViewModel(),
    onLoginSuccess: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.isLoginSuccess) {
        if (uiState.isLoginSuccess) {
            onLoginSuccess()
        }
    }

    val context = LocalContext.current
    // NOTE: This Web Client ID should ideally come from strings.xml or BuildConfig
    // If not found in google-services.json, you might need to get it from Firebase Console -> Project Settings -> Auth -> Google
    val webClientId = "978048441489-060bm3tli86b8updaj4qg38uo3sei611.apps.googleusercontent.com" // Placeholder, user needs to update

    val googleSignInLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            account?.idToken?.let { viewModel.loginWithGoogle(it) }
        } catch (e: ApiException) {
            // Handle error
            viewModel.clearError() // reset
        }
    }

    fun startGoogleSignIn() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(webClientId)
            .requestEmail()
            .build()
        val googleSignInClient = GoogleSignIn.getClient(context, gso)
        googleSignInLauncher.launch(googleSignInClient.signInIntent)
    }

    Scaffold(
        containerColor = DarkNavy,
        topBar = {
            if (uiState.isOtpSent) {
                TopAppBar(
                    title = { },
                    navigationIcon = {
                        IconButton(onClick = viewModel::backToPhone) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextLight)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkNavy)
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(DarkNavy)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = when {
                        uiState.isStaffMode -> "Staff Sign In"
                        uiState.isOtpSent -> "Verification"
                        else -> "Welcome to myShop"
                    },
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextLight,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
                
                Text(
                    text = when {
                        uiState.isStaffMode -> "Enter your username and password"
                        uiState.isOtpSent -> "Enter the 6-digit code sent to ${uiState.phoneNumber}"
                        else -> "Sign in with phone number to start ordering"
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextGray,
                    modifier = Modifier.padding(top = 8.dp, bottom = 48.dp),
                    textAlign = TextAlign.Center
                )

                TextButton(
                    onClick = viewModel::toggleStaffMode,
                    modifier = Modifier.padding(bottom = 16.dp)
                ) {
                    Text(
                        text = if (uiState.isStaffMode) "Login as Customer" else "Login as Staff",
                        color = BrownLight,
                        fontWeight = FontWeight.Medium
                    )
                }

                AnimatedContent(
                    targetState = if (uiState.isStaffMode) "staff" else if (uiState.isOtpSent) "otp" else "phone",
                    transitionSpec = {
                        slideInHorizontally { it } + fadeIn() togetherWith 
                        slideOutHorizontally { -it } + fadeOut()
                    },
                    label = "LoginTransition"
                ) { mode ->
                    when (mode) {
                        "staff" -> {
                            Column {
                                OutlinedTextField(
                                    value = uiState.username,
                                    onValueChange = viewModel::onUsernameChange,
                                    label = { Text("Username", color = TextGray) },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(16.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedContainerColor = InputDark,
                                        unfocusedContainerColor = InputDark,
                                        focusedBorderColor = BrownLight,
                                        unfocusedBorderColor = Color.Transparent,
                                        focusedTextColor = TextLight,
                                        unfocusedTextColor = TextLight
                                    ),
                                    leadingIcon = {
                                        Icon(Icons.Default.Lock, contentDescription = null, tint = TextGray)
                                    }
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                OutlinedTextField(
                                    value = uiState.password,
                                    onValueChange = viewModel::onPasswordChange,
                                    label = { Text("Password", color = TextGray) },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(16.dp),
                                    visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedContainerColor = InputDark,
                                        unfocusedContainerColor = InputDark,
                                        focusedBorderColor = BrownLight,
                                        unfocusedBorderColor = Color.Transparent,
                                        focusedTextColor = TextLight,
                                        unfocusedTextColor = TextLight
                                    ),
                                    leadingIcon = {
                                        Icon(Icons.Default.Lock, contentDescription = null, tint = TextGray)
                                    }
                                )
                            }
                        }
                        "phone" -> {
                            // Phone Number Input
                            OutlinedTextField(
                                value = uiState.phoneNumber,
                                onValueChange = viewModel::onPhoneNumberChange,
                                label = { Text("Phone Number", color = TextGray) },
                                placeholder = { Text("e.g. 012345678", color = TextGray.copy(alpha = 0.5f)) },
                                modifier = Modifier.fillMaxWidth(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                shape = RoundedCornerShape(16.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedContainerColor = InputDark,
                                    unfocusedContainerColor = InputDark,
                                    focusedBorderColor = BrownLight,
                                    unfocusedBorderColor = Color.Transparent,
                                    focusedTextColor = TextLight,
                                    unfocusedTextColor = TextLight,
                                    cursorColor = BrownLight
                                ),
                                leadingIcon = {
                                    Icon(Icons.Default.Phone, contentDescription = null, tint = TextGray)
                                }
                            )
                        }
                        else -> {
                            // OTP
                            val lifecycleOwner = LocalLifecycleOwner.current
                            DisposableEffect(lifecycleOwner) {
                                val observer = LifecycleEventObserver { _, event ->
                                    if (event == Lifecycle.Event.ON_RESUME) {
                                        viewModel.autoFillOtpFromClipboard()
                                        viewModel.checkNotificationServiceStatus()
                                    }
                                }
                                lifecycleOwner.lifecycle.addObserver(observer)
                                onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                OtpInputField(
                                    otpCode = uiState.otpCode,
                                    onOtpCodeChange = viewModel::onOtpCodeChange,
                                    isLoading = uiState.isLoading
                                )

                                Spacer(modifier = Modifier.height(16.dp))

                                // Paste from Notification button fallback
                                OutlinedButton(
                                    onClick = { viewModel.autoFillOtpFromClipboard() },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(
                                        contentColor = if (uiState.isNotificationServiceEnabled) TextGray else BrownLight
                                    ),
                                    border = androidx.compose.foundation.BorderStroke(
                                        1.dp, 
                                        if (uiState.isNotificationServiceEnabled) TextGray.copy(alpha = 0.3f) else BrownLight.copy(alpha = 0.5f)
                                    )
                                ) {
                                    Icon(
                                        Icons.Default.ContentPaste,
                                        contentDescription = null,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        "Paste Code Manually",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }

                                if (!uiState.isNotificationServiceEnabled) {
                                    val context = LocalContext.current
                                    Spacer(modifier = Modifier.height(16.dp))
                                    Card(
                                        colors = CardDefaults.cardColors(containerColor = BrownLight.copy(alpha = 0.1f)),
                                        shape = RoundedCornerShape(12.dp),
                                        modifier = Modifier.fillMaxWidth().clickable {
                                            val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
                                            context.startActivity(intent)
                                        }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(16.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Lock,
                                                contentDescription = null,
                                                tint = BrownLight,
                                                modifier = Modifier.size(20.dp)
                                            )
                                            Spacer(modifier = Modifier.width(12.dp))
                                            Column {
                                                Text(
                                                    text = "Enable Auto-Fill OTP",
                                                    color = BrownLight,
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 14.sp
                                                )
                                                Text(
                                                    text = "Tap to enable notification access for automatic OTP capture.",
                                                    color = TextGray,
                                                    fontSize = 12.sp
                                                )
                                            }
                                        }
                                    }
                                }

                                if (!uiState.isTelegramLinked) {
                                    val context = LocalContext.current
                                    Spacer(modifier = Modifier.height(16.dp))
                                    Card(
                                        colors = CardDefaults.cardColors(containerColor = BrownLight.copy(alpha = 0.1f)),
                                        shape = RoundedCornerShape(12.dp),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Column(modifier = Modifier.padding(16.dp)) {
                                            Text(
                                                text = "Account not linked to Telegram",
                                                color = BrownLight,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp
                                            )
                                            Text(
                                                text = "Please link your phone to our bot to receive the OTP code.",
                                                color = TextGray,
                                                fontSize = 12.sp,
                                                modifier = Modifier.padding(top = 4.dp)
                                            )
                                            TextButton(
                                                onClick = {
                                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(uiState.botUrl ?: "https://t.me/myshop_coffee_bot"))
                                                    context.startActivity(intent)
                                                },
                                                contentPadding = PaddingValues(0.dp)
                                            ) {
                                                Text("Open Telegram Bot", color = BrownLight, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = { 
                        when {
                            uiState.isStaffMode -> viewModel.loginStaff()
                            uiState.isOtpSent -> viewModel.verifyOtp()
                            else -> viewModel.requestOtp()
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    enabled = !uiState.isLoading,
                    colors = ButtonDefaults.buttonColors(containerColor = BrownLight),
                    shape = RoundedCornerShape(28.dp)
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
                    } else {
                        val text = when {
                            uiState.isStaffMode -> "Sign In"
                            uiState.isOtpSent -> "Verify & Sign In"
                            else -> "Send Code"
                        }
                        Text(
                            text = text,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = Color.White
                        )
                    }
                }
                
                if (!uiState.isStaffMode && !uiState.isOtpSent) {
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "OR",
                        color = TextGray.copy(alpha = 0.5f),
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                    
                    OutlinedButton(
                        onClick = { startGoogleSignIn() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(28.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = Color.White,
                            contentColor = Color.Black
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color.LightGray)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            // We can use a font icon or just a text G if we don't have the resource
                            Text(
                                "G",
                                fontWeight = FontWeight.Black,
                                fontSize = 20.sp,
                                color = Color(0xFF4285F4),
                                modifier = Modifier.padding(end = 12.dp)
                            )
                            Text(
                                "Sign in with Google",
                                fontWeight = FontWeight.Medium,
                                fontSize = 16.sp
                            )
                        }
                    }
                }

                if (uiState.isOtpSent) {
                    TextButton(
                        onClick = viewModel::requestOtp,
                        modifier = Modifier.padding(top = 8.dp)
                    ) {
                        Text(
                            text = "Didn't receive code? Resend",
                            color = BrownLight,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
                
                uiState.error?.let { error ->
                    Text(
                        text = error,
                        color = Color.Red,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(top = 16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun OtpInputField(
    otpCode: String,
    onOtpCodeChange: (String) -> Unit,
    isLoading: Boolean = false
) {
    val focusRequester = remember { FocusRequester() }
    val keyboardController = LocalSoftwareKeyboardController.current

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
        keyboardController?.show()
    }

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .fillMaxWidth()
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) {
                focusRequester.requestFocus()
                keyboardController?.show()
            }
    ) {
        BasicTextField(
            value = otpCode,
            onValueChange = {
                if (it.length <= 6 && it.all { char -> char.isDigit() } && !isLoading) {
                    onOtpCodeChange(it)
                }
            },
            enabled = !isLoading,
            modifier = Modifier
                .fillMaxWidth()
                .focusRequester(focusRequester),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Number,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(
                onDone = { keyboardController?.hide() }
            ),
            decorationBox = { innerTextField ->
                if (isLoading) {
                    // Show loading shimmer on OTP boxes while verifying
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        repeat(6) {
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(56.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(BrownLight.copy(alpha = 0.3f)),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = BrownLight,
                                    strokeWidth = 2.dp
                                )
                            }
                        }
                    }
                } else {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        repeat(6) { index ->
                            val char = when {
                                index < otpCode.length -> otpCode[index].toString()
                                else -> ""
                            }
                            val isFocused = index == otpCode.length
                            val isFilled = index < otpCode.length

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(56.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(
                                        when {
                                            isFilled -> BrownLight.copy(alpha = 0.15f)
                                            isFocused -> BrownLight.copy(alpha = 0.08f)
                                            else -> InputDark
                                        }
                                    )
                                    .border(
                                        width = if (isFocused || isFilled) 1.5.dp else 0.dp,
                                        color = when {
                                            isFilled -> BrownLight
                                            isFocused -> BrownLight.copy(alpha = 0.6f)
                                            else -> Color.Transparent
                                        },
                                        shape = RoundedCornerShape(12.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = char,
                                    style = MaterialTheme.typography.headlineSmall,
                                    color = if (char.isNotEmpty()) TextLight else TextGray.copy(alpha = 0.3f),
                                    fontWeight = FontWeight.Bold
                                )

                                // Caret for focused empty box
                                if (isFocused && char.isEmpty()) {
                                    Box(
                                        modifier = Modifier
                                            .width(2.dp)
                                            .height(24.dp)
                                            .background(BrownLight)
                                    )
                                }
                            }
                        }
                    }
                }
                // Hidden inner text field
                Box(Modifier.size(0.dp)) {
                    innerTextField()
                }
            }
        )
    }
}
