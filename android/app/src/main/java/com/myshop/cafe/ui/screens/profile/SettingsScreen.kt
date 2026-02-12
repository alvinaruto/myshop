package com.myshop.cafe.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.myshop.cafe.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onBackClick: () -> Unit) {
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Settings", color = TextLight, fontWeight = FontWeight.Bold) },
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
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            SettingSection("Notifications") {
                SettingToggleItem(Icons.Default.Notifications, "Push Notifications", true)
                SettingToggleItem(Icons.Default.Notifications, "Email Updates", false)
            }
            
            SettingSection("Privacy & Security") {
                SettingItem(Icons.Default.Lock, "Change Password")
                SettingItem(Icons.Default.Lock, "Two-Factor Authentication")
            }
        }
    }
}

@Composable
fun SettingSection(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(title, color = BrownLight, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 8.dp))
        Surface(
            shape = MaterialTheme.shapes.large,
            color = CardDark,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(8.dp)) {
                content()
            }
        }
    }
}

@Composable
fun SettingItem(icon: ImageVector, title: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null, tint = TextGray)
        Spacer(modifier = Modifier.width(16.dp))
        Text(title, color = TextLight, modifier = Modifier.weight(1f))
    }
}

@Composable
fun SettingToggleItem(icon: ImageVector, title: String, initialChecked: Boolean) {
    val checked = remember { mutableStateOf(initialChecked) }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null, tint = TextGray)
        Spacer(modifier = Modifier.width(16.dp))
        Text(title, color = TextLight, modifier = Modifier.weight(1f))
        Switch(
            checked = checked.value,
            onCheckedChange = { checked.value = it },
            colors = SwitchDefaults.colors(
                checkedThumbColor = BrownLight,
                checkedTrackColor = BrownLight.copy(alpha = 0.5f)
            )
        )
    }
}
