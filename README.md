# MyShop POS - Phone Shop Management System

A full-stack Point of Sale (POS) and inventory management system built specifically for the Cambodian market, featuring dual-currency support (USD/KHR) and IMEI tracking.

## 🚀 Features

### Core Features
- **Dual Currency (USD/KHR)**: Handle payments in both currencies with automatic conversion
- **IMEI/Serial Tracking**: Track phones and laptops by individual IMEI or serial number
- **Point of Sale (POS)**: Fast, touch-friendly interface for quick sales
- **Inventory Management**: Manage products, stock levels, and low-stock alerts
- **Warranty Management**: Automatic warranty tracking for serialized items

### Business Features
- **Daily Exchange Rate**: Set daily USD to KHR conversion rate
- **Split Payments**: Accept both USD and KHR in a single transaction
- **Change Calculation**: Automatically calculate change (small amounts in Riel)
- **Reports & Analytics**: Daily sales, profit margins, top products, staff performance

### User Roles
- **Admin**: Full system access including user management
- **Manager**: Inventory, reports, but cannot delete sales
- **Cashier**: POS access only, no cost price visibility

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Zustand
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: PostgreSQL
- **Deployment**: Docker Compose

## 📁 Project Structure

```
myShop/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & validation
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Helpers (currency, etc.)
│   ├── seeders/            # Database seeders
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # API client
│   │   └── stores/        # Zustand stores
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml      # Container orchestration
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Using Docker (Recommended)

```bash
# Clone and start all services
cd myShop
docker-compose up -d

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:4000
# - PostgreSQL: localhost:5432
```

### Local Development

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## 🔐 Default Accounts

| Role     | Username  | Password    |
|----------|-----------|-------------|
| Admin    | admin     | admin123    |
| Manager  | manager   | manager123  |
| Cashier  | cashier1  | cashier123  |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - List products
- `GET /api/products/search?q=` - Search products
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product

### Serial Items (IMEI)
- `GET /api/serial-items/imei/:imei` - Find by IMEI
- `GET /api/serial-items/warranty/:imei` - Check warranty
- `POST /api/serial-items` - Add serial item
- `POST /api/serial-items/bulk` - Bulk add

### Sales
- `GET /api/sales` - List sales
- `POST /api/sales` - Create sale
- `POST /api/sales/:id/void` - Void sale

### Exchange Rate
- `GET /api/exchange-rate` - Get today's rate
- `POST /api/exchange-rate` - Set today's rate

### Reports
- `GET /api/reports/daily` - Daily sales report
- `GET /api/reports/profit` - Profit/loss report
- `GET /api/reports/top-selling` - Top selling items
- `GET /api/reports/staff-performance` - Staff metrics

## 💵 Dual Currency Logic

The system handles USD and KHR simultaneously:

1. **All prices stored in USD** in the database
2. **Daily exchange rate** is set by admin/manager
3. **Split payments** allow mixing currencies
4. **Change calculation** rules:
   - Change < $20 → Given in Riel
   - Change ≥ $20 → Whole dollars in USD, remainder in Riel
   - Riel amounts rounded to nearest 100

### Example Transaction
```
Total: $1,200.00
Exchange Rate: 4,100 KHR/$

Customer Pays:
- $1,000 USD
- 820,000 KHR (= $200 USD equivalent)

Result:
- Total Paid: $1,200.00 ✓
- Change: $0.00
```

## 🇰🇭 Khmer Language Support

- Product names support Khmer Unicode text
- Category names have English and Khmer fields
- Receipts support Khmer text output
- UI uses Kantumruy Pro font for Khmer text

## 📝 License

MIT License - Feel free to use for your business!

---

Built with ❤️ for Cambodia 🇰🇭
