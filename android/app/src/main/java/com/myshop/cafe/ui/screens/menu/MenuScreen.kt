package com.myshop.cafe.ui.screens.menu

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.myshop.cafe.data.models.MenuItem
import com.myshop.cafe.data.models.Size
import com.myshop.cafe.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MenuScreen(
    viewModel: MenuViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showSizeSheet by remember { mutableStateOf<MenuItem?>(null) }
    
    // Theme colors matching mockup
    val backgroundColor = DarkNavy
    val cardColor = CardDark
    val accentColor = BrownLight
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundColor)
    ) {
        if (uiState.isLoading) {
            LoadingState()
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(bottom = 120.dp), // Space for bottom nav
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header Section
                HeaderSection(
                    searchQuery = uiState.searchQuery,
                    onSearchQueryChange = viewModel::onSearchQueryChange,
                    onQRClick = { viewModel.toggleScanner(true) }
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Category Tabs
                CategorySection(
                    categories = uiState.categories,
                    selectedCategoryId = uiState.selectedCategoryId,
                    onCategorySelect = viewModel::selectCategory
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Product Grid
                ProductGridSection(
                    items = uiState.filteredItems,
                    onItemClick = { showSizeSheet = it },
                    onQuickAdd = viewModel::quickAdd
                )
                
                Spacer(modifier = Modifier.height(32.dp))
                
                // Special For You Section
                SpecialForYouSection(
                    items = uiState.categories
                        .flatMap { it.items ?: emptyList() }
                        .take(1)
                )
            }
        }
    }
    
    // Item Detail Bottom Sheet (Enhanced)
    showSizeSheet?.let { item ->
        ItemDetailSheet(
            item = item,
            onDismiss = { showSizeSheet = null },
            onAddToCart = { size ->
                viewModel.addToCart(item, size)
                showSizeSheet = null
            }
        )
    }

    // Scanner Placeholder Dialog
    if (uiState.showScannerDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.toggleScanner(false) },
            title = { Text("Scanner") },
            text = { Text("QR Scanner implementation coming soon!") },
            confirmButton = {
                Button(onClick = { viewModel.toggleScanner(false) }) {
                    Text("Close")
                }
            },
            containerColor = CardDark,
            titleContentColor = TextLight,
            textContentColor = TextGray
        )
    }
}

@Composable
fun HeaderSection(
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onQRClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .padding(top = 16.dp)
            .statusBarsPadding()
    ) {
        // Top Row with Menu Icon and Avatar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Grid Menu Icon
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color.Transparent
            ) {
                Icon(
                    imageVector = Icons.Outlined.GridView,
                    contentDescription = "Menu",
                    tint = TextLight,
                    modifier = Modifier.size(28.dp)
                )
            }
            
            // Profile Avatar
            Surface(
                shape = CircleShape,
                modifier = Modifier.size(44.dp),
                color = BrownLight
            ) {
                Icon(
                    imageVector = Icons.Outlined.Person,
                    contentDescription = "Profile",
                    modifier = Modifier.padding(10.dp),
                    tint = Color.White
                )
            }
        }
        
        Spacer(modifier = Modifier.height(28.dp))
        
        // Main Title
        Text(
            text = "Find the best",
            style = MaterialTheme.typography.headlineLarge,
            color = TextLight,
            fontWeight = FontWeight.Bold,
            fontSize = 28.sp
        )
        Text(
            text = "Coffee to your taste",
            style = MaterialTheme.typography.headlineLarge,
            color = TextLight,
            fontWeight = FontWeight.Bold,
            fontSize = 28.sp
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Search Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Search Input
            Surface(
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp),
                shape = RoundedCornerShape(16.dp),
                color = InputDark
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 16.dp)
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Search,
                        contentDescription = "Search",
                        tint = TextGray,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    BasicTextField(
                        value = searchQuery,
                        onValueChange = onSearchQueryChange,
                        textStyle = MaterialTheme.typography.bodyMedium.copy(color = TextLight),
                        modifier = Modifier.weight(1f),
                        decorationBox = { innerTextField ->
                            if (searchQuery.isEmpty()) {
                                Text(
                                    text = "Find your coffee...",
                                    color = TextGray,
                                    fontSize = 15.sp
                                )
                            }
                            innerTextField()
                        }
                    )
                }
            }
            
            // QR / Scanner Button
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = BrownLight,
                modifier = Modifier
                    .size(52.dp)
                    .bouncyClick(onClick = onQRClick)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Outlined.QrCodeScanner,
                        contentDescription = "Scan QR",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun CategorySection(
    categories: List<com.myshop.cafe.data.models.MenuCategory>,
    selectedCategoryId: String?,
    onCategorySelect: (String) -> Unit
) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 24.dp),
        horizontalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        items(categories) { category ->
            val isSelected = category.id == selectedCategoryId
            
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.bouncyClick { onCategorySelect(category.id) }
            ) {
                Text(
                    text = category.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    color = if (isSelected) BrownLight else TextGray,
                    fontSize = 16.sp
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Underline indicator
                Box(
                    modifier = Modifier
                        .width(if (isSelected) 6.dp else 0.dp)
                        .height(6.dp)
                        .clip(CircleShape)
                        .background(if (isSelected) BrownLight else Color.Transparent)
                )
            }
        }
    }
}

@Composable
fun ProductGridSection(
    items: List<MenuItem>,
    onItemClick: (MenuItem) -> Unit,
    onQuickAdd: (MenuItem) -> Unit
) {
    // Horizontal scrolling product cards (2 visible at a time like mockup)
    LazyRow(
        contentPadding = PaddingValues(horizontal = 24.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        items(items) { item ->
            ProductCard(
                item = item,
                onItemClick = { onItemClick(item) },
                onQuickAdd = { onQuickAdd(item) }
            )
        }
    }
}

@Composable
fun ProductCard(
    item: MenuItem,
    onItemClick: () -> Unit,
    onQuickAdd: () -> Unit
) {
    val cardWidth = 160.dp
    
    Surface(
        modifier = Modifier
            .width(cardWidth)
            .bouncyClick { onItemClick() },
        shape = RoundedCornerShape(20.dp),
        color = CardDark
    ) {
        Column(
            modifier = Modifier.padding(12.dp)
        ) {
            // Image with Rating Badge
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
            ) {
                AsyncImage(
                    model = item.imageUrl ?: getCoffeeImageUrl(item.name),
                    contentDescription = item.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(16.dp))
                )
                
                // Rating Badge
                Surface(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp),
                    shape = RoundedCornerShape(8.dp),
                    color = Color.Black.copy(alpha = 0.6f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Star,
                            contentDescription = null,
                            tint = StarGold,
                            modifier = Modifier.size(12.dp)
                        )
                        Text(
                            text = "4.5",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Product Name
            Text(
                text = item.name,
                style = MaterialTheme.typography.titleMedium,
                color = TextLight,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                fontSize = 15.sp
            )
            
            // Subtitle
            Text(
                text = item.description?.take(20) ?: "with Oat Milk",
                style = MaterialTheme.typography.bodySmall,
                color = TextGray,
                maxLines = 1,
                fontSize = 12.sp
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Price and Add Button Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "$${String.format("%.2f", item.basePrice)}",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextLight,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = BrownLight,
                    modifier = Modifier
                        .size(32.dp)
                        .bouncyClick { onQuickAdd() }
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add",
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SpecialForYouSection(items: List<MenuItem>) {
    Column(
        modifier = Modifier.padding(horizontal = 24.dp)
    ) {
        Text(
            text = "Special for you",
            style = MaterialTheme.typography.titleLarge,
            color = TextLight,
            fontWeight = FontWeight.Bold,
            fontSize = 20.sp
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Special Card
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(130.dp),
            shape = RoundedCornerShape(20.dp),
            color = CardDark
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Image
                AsyncImage(
                    model = items.firstOrNull()?.imageUrl 
                        ?: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400",
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(90.dp)
                        .clip(RoundedCornerShape(16.dp))
                )
                
                Spacer(modifier = Modifier.width(16.dp))
                
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = "Specially mixed and",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextLight,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "brewed which you",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextLight,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "must try!",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextLight,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

@Composable
fun LoadingState() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkNavy),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(color = BrownLight)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemDetailSheet(
    item: MenuItem,
    onDismiss: () -> Unit,
    onAddToCart: (Size) -> Unit
) {
    var selectedSize by remember { mutableStateOf(Size.MEDIUM) }
    
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = DarkNavy,
        dragHandle = { BottomSheetDefaults.DragHandle(color = TextGray.copy(alpha = 0.3f)) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 48.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Header Image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(250.dp)
                    .padding(horizontal = 24.dp)
            ) {
                AsyncImage(
                    model = item.imageUrl ?: getCoffeeImageUrl(item.name),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(24.dp))
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Info Content
            Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = item.name,
                            style = MaterialTheme.typography.headlineMedium,
                            color = TextLight,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "with Oat Milk", // Placeholder or dynamic if exists
                            style = MaterialTheme.typography.bodyLarge,
                            color = TextGray
                        )
                    }
                    
                    // Rating
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Filled.Star, null, tint = StarGold, modifier = Modifier.size(20.dp))
                        Text("4.5", color = TextLight, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("(1.2k)", color = TextGray, fontSize = 14.sp)
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Description
                Text(
                    text = "Description",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextLight,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = item.description ?: "This ${item.name} is a meticulously crafted beverage using high-quality beans, providing a rich and aromatic experience with every sip. Perfect for any time of the day.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextGray,
                    lineHeight = 22.sp
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Size Selection
                Text(
                    text = "Size",
                    style = MaterialTheme.typography.titleMedium,
                    color = TextLight,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Size.values().forEach { size ->
                        val isSelected = size == selectedSize
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .height(44.dp)
                                .bouncyClick { selectedSize = size },
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) Color.Transparent else CardDark,
                            border = BorderStroke(
                                width = 1.dp,
                                color = if (isSelected) BrownLight else Color.Transparent
                            )
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = size.label,
                                    color = if (isSelected) BrownLight else TextGray,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(32.dp))
                
                // Price and Add to Cart
                val displayPrice = when (selectedSize) {
                    Size.SMALL -> item.basePrice
                    Size.MEDIUM -> item.priceMedium ?: (item.basePrice + 0.50)
                    Size.LARGE -> item.priceLarge ?: (item.basePrice + 1.00)
                }
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Price", color = TextGray, fontSize = 14.sp)
                        Text(
                            text = "$${String.format("%.2f", displayPrice)}",
                            style = MaterialTheme.typography.headlineSmall,
                            color = BrownLight,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    BouncyButton(
                        onClick = { onAddToCart(selectedSize) },
                        modifier = Modifier
                            .height(56.dp)
                            .width(200.dp),
                        containerColor = BrownLight
                    ) {
                        Text("Add to Cart", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }
        }
    }
}

// Helper function to get appropriate coffee image based on name
fun getCoffeeImageUrl(name: String): String {
    val nameLower = name.lowercase()
    return when {
        nameLower.contains("espresso") -> "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400"
        nameLower.contains("latte") -> "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400"
        nameLower.contains("cappuccino") -> "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400"
        nameLower.contains("mocha") -> "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400"
        nameLower.contains("americano") -> "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=400"
        nameLower.contains("macchiato") -> "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400"
        nameLower.contains("tea") -> "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"
        nameLower.contains("chocolate") -> "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400"
        nameLower.contains("frappe") || nameLower.contains("frappuccino") -> "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400"
        nameLower.contains("cold") || nameLower.contains("iced") -> "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400"
        else -> "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400"
    }
}
