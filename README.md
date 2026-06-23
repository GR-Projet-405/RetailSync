<img width="1536" height="1024" alt="ChatGPT Image Jun 22, 2026, 10_32_54 AM" src="https://github.com/user-attachments/assets/0664ea6d-fb0d-4b8b-ad77-9cb8a8f5e78a" />

# RetailSync - Multi-Branch Retail POS & Inventory Management System

**RetailSync** is a modern, scalable, and feature-rich Point of Sale (POS) and inventory management system designed for multi-branch retail operations. It provides full-suite capabilities from checkout billing to AI-powered forecasting, warehouse management, and granular permission controls.

---

## 🚀 Key Features

### 🏢 Operations & Logistics
* **Branch & Warehouse Management:** Oversee multiple physical branch locations and warehouses with dedicated stock levels.
* **Stock Transfers:** Move inventory safely between warehouses and branches with transit tracking.
* **Goods Receiving & POs:** Manage supplier purchase orders and verify incoming shipments against documents.

### 💳 POS & Sales
* **Interactive Checkout:** Intuitive register for POS billing, adding discounts, applying promotional rates, and processing sales.
* **Flexible Payments:** Support for multiple payment methods and seamless checkout workflows.
* **Returns & Refunds:** Straightforward processing of client returns with automated inventory restock checks.

### 📦 Inventory & Products
* **Product Catalog:** Manage barcodes, pricing tiers, and stock status.
* **Categories & Suppliers:** Categorize products and manage supplier contact books and history.
* **AI-Powered Capabilities:**
  * **AI Assistant:** Real-time conversational helper for store analytics.
  * **AI Forecasting:** Predict future product demand using historical trends.
  * **AI Reordering:** Automatic suggestion of purchase orders based on stock velocities.

### 🔒 Governance & Security
* **Granular RBAC:** Complete control over roles and permissions.
* **Audit Logs:** Track every action taken within the system for accountability.
* **Employee Management:** Manage employee profiles, active sessions, and access logs.

---

## 🛠️ Technology Stack

### Backend
* **Runtime:** Node.js (Express framework)
* **Database:** MongoDB via Mongoose ODM
* **Security:** Helmet, bcryptjs (hashing), JSON Web Tokens (JWT) for authentication
* **Validation & Logging:** Joi validation, Morgan HTTP request logger

### Frontend
* **Core:** React 19 & Vite
* **Routing & State:** React Router DOM, TanStack React Query (v5)
* **Styling & Assets:** Tailwind CSS, Lucide React Icons, Axios for HTTP client requests

---

## ⚙️ Getting Started

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** (local or Atlas cluster)

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd RetailSync
   ```

2. **Configure and Run Backend**
   ```bash
   cd backend
   # Create a .env file and populate required environment variables:
   # PORT=5000
   # MONGODB_URI=mongodb://localhost:27017/retailsync
   # JWT_SECRET=your_jwt_secret
   
   npm install
   
   # Optional: Seed the database with sample data
   npm run seed
   
   # Start the development server
   npm run dev
   ```

3. **Configure and Run Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Start the development server
   npm run dev
   ```

---

## 📁 Directory Structure

```text
RetailSync/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurations (database, permissions, etc.)
│   │   ├── middleware/      # Authentication and validation middlewares
│   │   ├── modules/         # Modular business logic endpoints
│   │   ├── seeders/         # Database initialization scripts
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/      # Shared visual UI components
    │   ├── features/        # Feature-specific logic (auth, user/role management)
    │   ├── layouts/         # Page templates and sidebars
    │   └── main.jsx         # App bootstrapping
    ├── package.json
    └── tailwind.config.js
```
