package com.myshop.cafe.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.myshop.cafe.ui.theme.*
import com.myshop.cafe.ui.theme.bouncyClick

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaymentMethodsScreen(onBackClick: () -> Unit) {
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Payment Methods", color = TextLight, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, "Back", tint = TextLight)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = DarkNavy)
            )
        },
        containerColor = DarkNavy
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Payment Cards Placeholder
            PaymentMethodItem(
                name = "Cash on Delivery",
                isDefault = true
            )
            
            PaymentMethodItem(
                name = "KHQR (ACLEDA/ABA)",
                isDefault = false
            )
            
            Spacer(modifier = Modifier.weight(1f))
            
            BouncyButton(
                onClick = { /* Add card flow */ },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                containerColor = BrownLight
            ) {
                Icon(Icons.Default.Add, null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Add Payment Method", color = Color.White, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun PaymentMethodItem(name: String, isDefault: Boolean) {
    Surface(
        shape = MaterialTheme.shapes.large,
        color = CardDark,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.CreditCard, 
                null, 
                tint = if(isDefault) BrownLight else TextGray,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(name, color = TextLight, fontWeight = FontWeight.SemiBold)
                if (isDefault) {
                    Text("Default", color = BrownLight, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}
