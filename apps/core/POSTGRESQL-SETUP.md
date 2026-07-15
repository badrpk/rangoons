# 🗄️ PostgreSQL Setup Guide for RangoonsCore

## 🎯 Why PostgreSQL?

- **Production Ready**: Enterprise-grade database system
- **Better Performance**: Faster than SQLite for concurrent users
- **Scalability**: Handles large datasets and high traffic
- **ACID Compliance**: Reliable transactions and data integrity
- **Advanced Features**: JSON support, full-text search, etc.

## 🚀 Quick Setup for Windows

### Option 1: Install PostgreSQL Locally

#### 1. Download PostgreSQL
- Visit: https://www.postgresql.org/download/windows/
- Download the latest version (15.x or 16.x)
- Run the installer as Administrator

#### 2. Installation Steps
```
✅ PostgreSQL Server
✅ pgAdmin 4 (GUI tool)
✅ Stack Builder
✅ Command Line Tools

Port: 5432 (default)
Password: Set a strong password (remember this!)
```

#### 3. Verify Installation
```bash
# Check if PostgreSQL is running
services.msc
# Look for "postgresql-x64-15" service

# Test connection
psql -U postgres -h localhost
# Enter your password when prompted
```

### Option 2: Use Docker (Recommended for Development)

#### 1. Install Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop/
- Install and restart your computer

#### 2. Run PostgreSQL Container
```bash
# Create and run PostgreSQL container
docker run --name rangoons-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=rangoons \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

## 🔧 Database Configuration

### 1. Create Database and User
```sql
-- Connect to PostgreSQL as postgres user
psql -U postgres -h localhost

-- Create database
CREATE DATABASE rangoons;

-- Create user (optional, for security)
CREATE USER rangoons_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rangoons TO rangoons_user;

-- Connect to rangoons database
\c rangoons

-- Verify connection
\dt
```

### 2. Environment Variables
Create a `.env` file in your project root:
```bash
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=rangoons
DB_PASSWORD=your_password
DB_PORT=5432

# Domain Configuration
RANGOONS_DOMAIN=www.rangoons.my
SHOP_DOMAIN=www.rangoons.my
API_DOMAIN=api.rangoons.my
WA_DOMAIN=wa.rangoons.my
WA_NUMBER=923001555681
```

## 🚀 Start PostgreSQL Server

### 1. Install Dependencies
```bash
cd integrations
npm install
```

### 2. Start the Server
```bash
# Start PostgreSQL version
npm run start-simple-pg

# Or directly
node simple-server-pg.js
```

### 3. Test Connection
```bash
# Health check
curl http://localhost:8080/health

# Or visit in browser
http://localhost:8080/health
```

## 📊 Database Schema

### Products Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    price_cents INTEGER NOT NULL,
    base_price_cents INTEGER DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT DEFAULT '',
    source VARCHAR(100) DEFAULT '',
    external_id VARCHAR(100) DEFAULT '',
    category VARCHAR(100) DEFAULT '',
    brand VARCHAR(100) DEFAULT '',
    source_url TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    cart_id VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    total_cents INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    whatsapp_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cart Items Table
```sql
CREATE TABLE cart_items (
    cart_id VARCHAR(100) NOT NULL,
    product_id INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    PRIMARY KEY (cart_id, product_id),
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if PostgreSQL is running
services.msc
# Start "postgresql-x64-15" service

# Or restart the service
net stop postgresql-x64-15
net start postgresql-x64-15
```

#### 2. Authentication Failed
```bash
# Reset postgres user password
psql -U postgres -h localhost
ALTER USER postgres PASSWORD 'new_password';
```

#### 3. Port Already in Use
```bash
# Check what's using port 5432
netstat -an | findstr :5432

# Kill the process or change port in postgresql.conf
```

#### 4. Permission Denied
```bash
# Grant permissions to user
GRANT ALL PRIVILEGES ON DATABASE rangoons TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

## 📱 WhatsApp Integration

### 1. Update WhatsApp Bot
The PostgreSQL server automatically creates WhatsApp links:
```
https://wa.me/923001555681?text=New order #123 from Customer Name
```

### 2. Test Order Flow
1. Visit: http://localhost:8080
2. Browse products
3. Place test order
4. Check WhatsApp link generation

## 🌐 Production Deployment

### 1. Environment Variables
```bash
# Production database
DB_HOST=your-production-host
DB_NAME=rangoons_prod
DB_USER=rangoons_user
DB_PASSWORD=strong_production_password

# Custom domains
RANGOONS_DOMAIN=www.rangoons.my
SHOP_DOMAIN=shop.rangoons.my
```

### 2. Database Security
```sql
-- Create read-only user for reporting
CREATE USER rangoons_readonly WITH PASSWORD 'readonly_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rangoons_readonly;

-- Create application user
CREATE USER rangoons_app WITH PASSWORD 'app_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rangoons_app;
```

### 3. Backup Strategy
```bash
# Automated backup script
pg_dump -U postgres -h localhost rangoons > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres -h localhost rangoons < backup_20241201.sql
```

## 🎉 Benefits of PostgreSQL

✅ **Performance**: 10x faster than SQLite for concurrent users  
✅ **Reliability**: ACID compliance and crash recovery  
✅ **Scalability**: Handles millions of records  
✅ **Features**: JSON, full-text search, advanced indexing  
✅ **Production Ready**: Used by major companies worldwide  

## 📋 Next Steps

1. **Install PostgreSQL** (local or Docker)
2. **Create database** and user
3. **Set environment variables**
4. **Start the server**: `npm run start-simple-pg`
5. **Test the system** at http://localhost:8080
6. **Configure your domain** in environment variables

---

**Need Help?** Check the troubleshooting section or restart the PostgreSQL service!
