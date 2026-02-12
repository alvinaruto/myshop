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
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import android.content.Intent
import android.net.Uri
import com.myshop.cafe.ui.theme.*

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
                    text = if (uiState.isOtpSent) "Verification" else "Welcome to myShop",
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextLight,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
                
                Text(
                    text = if (uiState.isOtpSent) 
                        "Enter the 6-digit code sent to ${uiState.phoneNumber}" 
                        else "Sign in with phone number to start ordering",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextGray,
                    modifier = Modifier.padding(top = 8.dp, bottom = 48.dp),
                    textAlign = TextAlign.Center
                )

                AnimatedContent(
                    targetState = uiState.isOtpSent,
                    transitionSpec = {
                        slideInHorizontally { it } + fadeIn() togetherWith 
                        slideOutHorizontally { -it } + fadeOut()
                    },
                    label = "LoginTransition"
                ) { isOtp ->
                    if (!isOtp) {
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
                    } else {
                        // OTP Code Input & Telegram Warning
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            OtpInputField(
                                otpCode = uiState.otpCode,
                                onOtpCodeChange = viewModel::onOtpCodeChange
                            )
                            
                            if (!uiState.isTelegramLinked) {
                                val context = LocalContext.current
                                Spacer(modifier = Modifier.height(24.dp))
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

                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = { if (uiState.isOtpSent) viewModel.verifyOtp() else viewModel.requestOtp() },
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
                        Text(
                            text = if (uiState.isOtpSent) "Verify & Sign In" else "Send Code",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = Color.White
                        )
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
    onOtpCodeChange: (String) -> Unit
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
                if (it.length <= 6 && it.all { char -> char.isDigit() }) {
                    onOtpCodeChange(it)
                }
            },
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

                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(56.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isFocused) BrownLight.copy(alpha = 0.1f) else InputDark)
                                .border(
                                    width = if (isFocused) 1.dp else 0.dp,
                                    color = if (isFocused) BrownLight else Color.Transparent,
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
                            
                            // Caret for focused box
                            if (isFocused) {
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
                // Need to include innerTextField() so Compose matches the BasicTextField call properly
                Box(Modifier.size(0.dp)) {
                    innerTextField()
                }
            }
        )
    }
}
