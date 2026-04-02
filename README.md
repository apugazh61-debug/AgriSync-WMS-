# 🏭 WMS Pro — Smart Warehouse Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?style=flat-square&logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose)
[![JWT](https://img.shields.io/badge/Auth-JWT-000?style=flat-square&logo=jsonwebtokens)](https://jwt.io)

A **production-ready**, full-stack warehouse management platform built for logistics companies. Manage products, suppliers, inventory, inbound shipments, outbound orders, and multiple warehouses — all with real-time updates, AI demand prediction, and barcode/QR scanning.

---

## 📸 Features at a Glance

> 📌 Screenshots placeholder — run the app and capture dashboard, products, analytics pages.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 JWT Auth | Role-based access control (ADMIN / STAFF) |
| 📦 Product Management | CRUD + QR/Barcode auto-generation + Excel bulk upload |
| 🏭 Multi-Warehouse | Track inventory across multiple warehouse locations |
| 📊 Real-time Updates | WebSocket (STOMP) broadcasts inventory changes live |
| 🤖 AI Demand Prediction | Linear regression on order history to forecast demand |
| 🔴 Redis Caching | Per-entity TTL cache for products, inventory, warehouses |
| 📬 Email Alerts | Async email notifications for low-stock events |
| 📷 QR Scanner | Camera-based and manual barcode/QR product lookup |
| 📈 Analytics Dashboard | Charts for order trends, warehouse stock, status breakdown |
| 📤 Inbound Tracking | Record goods received + auto-update inventory |
| 📥 Order Management | Create multi-item orders, update delivery status |
| 🐳 Docker Ready | Full containerized deployment with health checks |

---

## 🛠️ Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- **Spring Data MongoDB** — document store
- **Spring Security** + **JWT** — authentication
- **Spring Data Redis** — caching
- **Spring WebSocket** (STOMP + SockJS) — real-time
- **Spring Mail** — email notifications
- **Apache POI** — Excel processing
- **ZXing** — QR code & barcode generation
- **Lombok** + **ModelMapper**

### Frontend
- **React 18** + **Vite 8**
- **Tailwind CSS v4** — utility-first styling
- **Recharts** — charts and graphs
- **Axios** — HTTP client with interceptors
- **@stomp/stompjs** + **SockJS** — WebSocket client
- **React Router v6** — SPA routing
- **react-hot-toast** — notifications
- **lucide-react** — icons
- **html5-qrcode** — QR scanner

### Infrastructure
- **MongoDB Atlas** / local MongoDB 7
- **Redis 7.2**
- **Docker** + **Docker Compose**
- **Nginx** — frontend server with API proxy

---

## 🗂️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                    │
│  (Vite + Tailwind + Recharts + WebSocket Client)    │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/WebSocket
┌────────────────────▼────────────────────────────────┐
│                Spring Boot Backend                  │
│   ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│   │Controller│→ │ Service  │→ │   Repository    │  │
│   └──────────┘  └──────────┘  └────────┬────────┘  │
│                 ┌──────────┐           │            │
│                 │  Redis   │           │            │
│                 │  Cache   │           │            │
│                 └──────────┘           │            │
│             ┌──────────────────────────▼──────────┐ │
│             │         MongoDB Atlas                │ │
│             └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
warehouse management/
├── backend/
│   ├── src/main/java/com/warehouse/wms/
│   │   ├── controller/        # REST API endpoints
│   │   ├── service/           # Business logic
│   │   ├── repository/        # MongoDB repositories
│   │   ├── model/             # Document entities
│   │   ├── dto/               # Data transfer objects
│   │   ├── config/            # Security, Redis, WebSocket
│   │   ├── security/          # JWT filter, utils
│   │   └── util/              # Barcode/QR generator
│   ├── src/main/resources/
│   │   └── application.yml    # Configuration
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Sidebar, Header, UIComponents
│   │   ├── pages/             # All page components
│   │   ├── services/          # Axios API service
│   │   ├── context/           # AuthContext
│   │   ├── hooks/             # useWebSocket
│   │   └── App.jsx            # Router + layout
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🗄️ Database Collections (MongoDB)

| Collection | Key Fields |
|---|---|
| `users` | id, name, email, password, role, createdAt |
| `warehouses` | warehouseId, name, location, capacity, manager |
| `products` | productId, name, category, price, barcode, qrCode, supplierId |
| `suppliers` | supplierId, name, phone, email, address |
| `inventory` | inventoryId, productId, warehouseId, stockQuantity, reorderLevel |
| `inbound_shipments` | inboundId, supplierId, warehouseId, batchNumber, items[] |
| `orders` | orderId, warehouseId, orderDate, status, items[] |
| `stock_movements` | movementId, productId, warehouseId, type, quantity, timestamp |

---

## 🔌 API Reference (40+ endpoints)

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/profile` | Current user profile |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product (auto QR/barcode) |
| GET | `/api/products/{id}` | Get product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/products/search?q=` | Search products |
| POST | `/api/products/bulk-upload` | Upload Excel file |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/inventory` | All inventory |
| GET | `/api/inventory/{productId}` | Product inventory |
| GET | `/api/inventory/low-stock` | Low stock items |
| PUT | `/api/inventory/update` | Update stock (INBOUND/OUTBOUND) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Full dashboard data |
| GET | `/api/dashboard/inventory-chart` | Warehouse stock chart |
| GET | `/api/dashboard/order-stats` | Monthly order stats |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/prediction/demand/{productId}` | AI demand forecast |

> Full list includes: `/api/warehouses`, `/api/suppliers`, `/api/inbound`, `/api/orders`, `/api/stock-movements`, `/api/users`

---

## 🚀 Local Development Setup

### Prerequisites
- Java 17+
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local)
- Maven 3.9+

### Backend
```bash
cd backend

# Set up environment variables (or edit application.yml)
export MONGODB_URI="mongodb://localhost:27017/wms"
export JWT_SECRET="your-secret-key"

# Run
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env: set VITE_API_URL=http://localhost:8080/api

npm install
npm run dev
# Visit: http://localhost:3000
```

---

## 🐳 Docker Deployment

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env with your values

# 2. Start all services
docker-compose up -d

# 3. Access
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8080
# MongoDB:   localhost:27017
# Redis:     localhost:6379
```

### Services
| Service | Port | Description |
|---|---|---|
| `frontend` | 3000 | React (Nginx) |
| `backend` | 8080 | Spring Boot |
| `mongodb` | 27017 | MongoDB 7 |
| `redis` | 6379 | Redis 7.2 |

---

## ☁️ Production Deployment

### Frontend → Vercel/Netlify
```bash
# Build
npm run build

# Vercel
npx vercel --prod

# Set env var: VITE_API_URL = https://your-backend.com/api
```

### Backend → Render/Railway
1. Push `backend/` directory
2. Build command: `./mvnw clean package -DskipTests`
3. Start command: `java -jar target/wms-1.0.0.jar`
4. Set all environment variables from `.env.example`

### Database → MongoDB Atlas
1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get connection URI
3. Set `MONGODB_URI` env var

---

## 📊 ER Diagram

```
Users ──────────────── (manages warehouses)
  │
Products ─── supplierId ──► Suppliers
  │
  ├── Inventory ─── productId, warehouseId ──► Warehouses
  │
  ├── InboundShipments ─── supplierId ──► Suppliers
  │     └── InboundItems ─── productId ──► Products
  │
  ├── Orders ─── warehouseId ──► Warehouses
  │     └── OrderItems ─── productId ──► Products
  │
  └── StockMovements ─── productId, warehouseId
```

---

## 🔮 Future Improvements

- [ ] Role-based dashboard views (ADMIN vs STAFF)
- [ ] Multi-language support (i18n)
- [ ] Supplier portal with self-service
- [ ] RFID integration for automated tracking
- [ ] Mobile app (React Native)
- [ ] Advanced ML model (Prophet/LSTM) for demand forecasting
- [ ] Audit log for all data changes
- [ ] PDF invoice generation for orders
- [ ] Kubernetes (K8s) deployment config
- [ ] CI/CD with GitHub Actions

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

> Built with ❤️ using Spring Boot + React + MongoDB + Redis
