# 📊 CSV Import Guide for RangoonsCore PostgreSQL

## 🎯 What This Does

This guide will help you import your Shopify products from the `products_export csv.csv` file into your PostgreSQL database. The import script will:

✅ **Parse Shopify CSV format** automatically  
✅ **Handle product variants** (colors, sizes, etc.)  
✅ **Import all product details** (name, price, stock, images, etc.)  
✅ **Create proper database structure** with relationships  
✅ **Generate import summary** with statistics  

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
cd integrations
npm install
```

### 2. **Run CSV Import**
```bash
# Option 1: Use batch file (Windows)
.\import-csv.bat

# Option 2: Use npm script
npm run import-csv

# Option 3: Direct command
node import-csv-pg.js
```

## 📁 CSV File Structure

Your `products_export csv.csv` contains these key fields:

| Field | Description | Example |
|-------|-------------|---------|
| `Handle` | Product URL slug | `3-in-1-brushes` |
| `Title` | Product name | `3 in 1 brushes` |
| `Body (HTML)` | Product description | `<p>Makeup brushes...</p>` |
| `Vendor` | Brand/Manufacturer | `Rangoons Shop` |
| `Product Category` | Category path | `Health & Beauty > Personal Care` |
| `Variant Price` | Price in PKR | `400.00` |
| `Variant Compare At Price` | Original price | `500.00` |
| `Variant Inventory Qty` | Stock quantity | `10` |
| `Image Src` | Product image URL | `https://cdn.shopify.com/...` |
| `Option1 Value` | Variant option (e.g., color) | `blue` |
| `Tags` | Product tags | `all kids products, watches` |

## 🗄️ Database Schema

The import creates these tables:

### **Products Table**
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,           -- Product title
    description TEXT,                     -- Product description
    price_cents INTEGER NOT NULL,         -- Current price (in cents)
    base_price_cents INTEGER DEFAULT 0,   -- Compare at price
    stock INTEGER NOT NULL DEFAULT 0,     -- Available stock
    image_url TEXT,                       -- Product image URL
    source VARCHAR(100) DEFAULT 'shopify', -- Data source
    external_id VARCHAR(100),             -- Shopify SKU
    category VARCHAR(100),                -- Product category
    brand VARCHAR(100),                   -- Vendor/brand
    source_url TEXT,                      -- Shopify product URL
    handle VARCHAR(255),                  -- Product handle/slug
    sku VARCHAR(100),                     -- Stock keeping unit
    weight_grams INTEGER DEFAULT 0,       -- Product weight
    option1_name VARCHAR(100),            -- Variant option 1 name
    option1_value VARCHAR(100),           -- Variant option 1 value
    option2_name VARCHAR(100),            -- Variant option 2 name
    option2_value VARCHAR(100),           -- Variant option 2 value
    option3_name VARCHAR(100),            -- Variant option 3 name
    option3_value VARCHAR(100),           -- Variant option 3 value
    tags TEXT,                            -- Product tags
    published BOOLEAN DEFAULT true,       -- Published status
    status VARCHAR(50) DEFAULT 'active',  -- Product status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Product Stats Table**
```sql
CREATE TABLE product_stats (
    product_id INTEGER PRIMARY KEY REFERENCES products(id),
    sold_count INTEGER DEFAULT 0
);
```

## 🔧 Import Process

### **Step 1: Data Cleaning**
- Removes HTML tags from descriptions
- Converts prices to cents (e.g., 400.00 → 40000)
- Parses stock quantities as integers
- Handles empty/missing values gracefully

### **Step 2: Variant Handling**
- Groups products by handle + variant options
- Prevents duplicate variants
- Maintains product relationships

### **Step 3: Database Insertion**
- Inserts products with proper relationships
- Creates product statistics records
- Handles errors gracefully

### **Step 4: Summary Report**
- Total products imported
- Total stock count
- Average price
- Category count
- Brand count

## 📊 Expected Results

Based on your CSV file (161 lines), you should see:

- **~80-100 unique products** (after variant consolidation)
- **Categories**: Health & Beauty, Apparel, Toys, Office Supplies, etc.
- **Brands**: Rangoons Shop, various manufacturers
- **Price Range**: Rs 40 - Rs 3000+
- **Stock**: Various quantities per product

## 🚨 Troubleshooting

### **Common Issues**

#### 1. **PostgreSQL Connection Failed**
```bash
# Check if PostgreSQL is running
services.msc
# Look for "postgresql-x64-15" service

# Test connection
psql -U postgres -h localhost
```

#### 2. **CSV File Not Found**
```bash
# Make sure CSV file is in project root
dir products_export csv.csv

# Check file path in import script
CSV_FILE = '../products_export csv.csv'
```

#### 3. **Permission Denied**
```sql
-- Grant permissions to user
GRANT ALL PRIVILEGES ON DATABASE rangoons TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

#### 4. **Import Errors**
```bash
# Check CSV format
# Ensure no special characters in file names
# Verify PostgreSQL is running
```

## 🌐 After Import

### **1. View Products**
Visit: http://localhost:8080
- Browse all imported products
- See prices, stock, categories
- View product images

### **2. API Access**
```bash
# Get all products
GET http://localhost:8080/api/products

# Health check
GET http://localhost:8080/health
```

### **3. Database Queries**
```sql
-- View all products
SELECT * FROM products ORDER BY created_at DESC;

-- Products by category
SELECT category, COUNT(*) FROM products GROUP BY category;

-- Low stock products
SELECT name, stock FROM products WHERE stock < 5;

-- Price statistics
SELECT 
    MIN(price_cents/100) as min_price,
    MAX(price_cents/100) as max_price,
    AVG(price_cents/100) as avg_price
FROM products;
```

## 🔄 Re-importing

To update products from a new CSV:

```bash
# The import script automatically:
# 1. Clears existing products
# 2. Imports new data
# 3. Maintains data integrity

npm run import-csv
```

## 📱 WhatsApp Integration

After import, your products will automatically:

✅ **Generate WhatsApp order links**  
✅ **Include product details** in notifications  
✅ **Track inventory** for order management  
✅ **Support catalog queries** via WhatsApp bot  

## 🎯 Next Steps

1. **Run the import**: `.\import-csv.bat`
2. **Start PostgreSQL server**: `.\start-postgresql.bat`
3. **View your products**: http://localhost:8080
4. **Test WhatsApp integration**: Message +923001555681

---

**Need Help?** Check the troubleshooting section or restart PostgreSQL service!
