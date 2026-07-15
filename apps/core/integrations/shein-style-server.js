const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer'); // Added multer for file uploads
const csv = require('csv-parse'); // Added csv-parse for CSV parsing
const fs = require('fs'); // Added fs for file operations

const app = express();
const PORT = process.env.PORT || 8080;

// PostgreSQL Configuration
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'rangoons',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// Configuration
const DOMAIN_CONFIG = {
    main: process.env.RANGOONS_DOMAIN || '154.57.212.38:8080',
    shop: process.env.SHOP_DOMAIN || '154.57.212.38:8080',
    api: process.env.API_DOMAIN || '154.57.212.38:8080',
    whatsapp: process.env.WA_DOMAIN || '154.57.212.38:3001',
    waNumber: process.env.WA_NUMBER || '923001555681'
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Database initialization
async function initDatabase() {
    try {
        const client = await pool.connect();
        
        // Create enhanced tables for Shein-style features
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
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
                handle VARCHAR(255) DEFAULT '',
                sku VARCHAR(100) DEFAULT '',
                weight_grams INTEGER DEFAULT 0,
                option1_name VARCHAR(100) DEFAULT '',
                option1_value VARCHAR(100) DEFAULT '',
                option2_name VARCHAR(100) DEFAULT '',
                option2_value VARCHAR(100) DEFAULT '',
                option3_name VARCHAR(100) DEFAULT '',
                option3_value VARCHAR(100) DEFAULT '',
                tags TEXT DEFAULT '',
                published BOOLEAN DEFAULT true,
                status VARCHAR(50) DEFAULT 'active',
                views INTEGER DEFAULT 0,
                likes INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS product_stats (
                product_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
                sold_count INTEGER DEFAULT 0,
                view_count INTEGER DEFAULT 0,
                like_count INTEGER DEFAULT 0
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                image_url TEXT,
                parent_id INTEGER REFERENCES categories(id),
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS carts (
                cart_id VARCHAR(100) PRIMARY KEY,
                user_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                cart_id VARCHAR(100) NOT NULL,
                product_id INTEGER NOT NULL,
                qty INTEGER NOT NULL,
                selected_options JSONB DEFAULT '{}',
                PRIMARY KEY (cart_id, product_id),
                FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                cart_id VARCHAR(100) NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(255),
                address TEXT NOT NULL,
                city VARCHAR(100),
                postal_code VARCHAR(20),
                country VARCHAR(100) DEFAULT 'Pakistan',
                total_cents INTEGER NOT NULL,
                shipping_cents INTEGER DEFAULT 0,
                tax_cents INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'pending',
                payment_status VARCHAR(50) DEFAULT 'pending',
                whatsapp_sent BOOLEAN DEFAULT FALSE,
                tracking_number VARCHAR(100),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                quantity INTEGER DEFAULT 1,
                price_cents INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS wishlist (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(100) NOT NULL,
                product_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, product_id),
                FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
            );
        `);

        // Create indexes for better performance
        await client.query('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_products_price ON products(price_cents)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)');

        client.release();
        console.log('✅ Shein-style database initialized successfully');
        
    } catch (err) {
        console.error('❌ Database initialization failed:', err);
    }
}

// Initialize database
initDatabase();

// WhatsApp Integration
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const qrcode = require('qrcode');

let waSocket = null;
let qrCode = null;

// WhatsApp connection function
async function connectWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('wa-session');
        
        waSocket = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 'silent' })
        });

        waSocket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                qrCode = await qrcode.toDataURL(qr);
                console.log('📱 New WhatsApp QR code generated');
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('📱 WhatsApp connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
                
                if (shouldReconnect) {
                    connectWhatsApp();
                }
            } else if (connection === 'open') {
                console.log('✅ WhatsApp connected successfully!');
                qrCode = null;
            }
        });

        waSocket.ev.on('creds.update', saveCreds);
        
        // Handle incoming messages
        waSocket.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg.key.fromMe && msg.message) {
                await handleIncomingMessage(msg);
            }
        });

    } catch (err) {
        console.error('❌ WhatsApp connection failed:', err);
        setTimeout(connectWhatsApp, 5000);
    }
}

// Handle incoming WhatsApp messages
async function handleIncomingMessage(msg) {
    try {
        const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const sender = msg.key.remoteJid;
        
        if (!messageText || !sender) return;
        
        console.log(`📱 WhatsApp message from ${sender}: ${messageText}`);
        
        // Check if it's an order
        if (messageText.toLowerCase().includes('order') || messageText.toLowerCase().includes('buy')) {
            await processOrder(messageText, sender);
        } else {
            // Send catalog
            await sendCatalog(sender);
        }
        
    } catch (err) {
        console.error('❌ Error handling WhatsApp message:', err);
    }
}

// Process order from WhatsApp
async function processOrder(messageText, sender) {
    try {
        // Extract product name from message
        const productMatch = messageText.match(/order\s+(.+)/i) || messageText.match(/buy\s+(.+)/i);
        if (!productMatch) {
            await sendWhatsAppMessage(sender, 'Please specify which product you want to order. Example: "Order Product Name"');
            return;
        }
        
        const productName = productMatch[1].trim();
        
        // Find product in database
        const result = await pool.query(
            'SELECT * FROM products WHERE LOWER(title) LIKE LOWER($1) AND stock > 0',
            [`%${productName}%`]
        );
        
        if (result.rows.length === 0) {
            await sendWhatsAppMessage(sender, `Sorry, product "${productName}" not found or out of stock.`);
            return;
        }
        
        const product = result.rows[0];
        
        // Create order
        const orderResult = await pool.query(`
            INSERT INTO orders (customer_phone, customer_name, total_amount, status, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id
        `, [sender, 'WhatsApp Customer', product.price_cents, 'pending']);
        
        const orderId = orderResult.rows[0].id;
        
        // Add order item
        await pool.query(`
            INSERT INTO order_items (order_id, product_id, quantity, price_cents)
            VALUES ($1, $2, $3, $4)
        `, [orderId, product.id, 1, product.price_cents]);
        
        // Update stock
        await pool.query(
            'UPDATE products SET stock = stock - 1 WHERE id = $1',
            [product.id]
        );
        
        // Send confirmation
        const confirmationMessage = `✅ Order Confirmed!
        
📦 Product: ${product.title}
💰 Price: Rs ${(product.price_cents / 100).toFixed(2)}
🆔 Order ID: #${orderId}
📱 Contact: 923001555681

Your order has been received and is being processed. We'll contact you shortly for delivery details.`;
        
        await sendWhatsAppMessage(sender, confirmationMessage);
        
        console.log(`✅ Order processed via WhatsApp: ${orderId}`);
        
    } catch (err) {
        console.error('❌ Error processing WhatsApp order:', err);
        await sendWhatsAppMessage(sender, 'Sorry, there was an error processing your order. Please try again or contact us directly.');
    }
}

// Send catalog to WhatsApp user
async function sendCatalog(sender) {
    try {
        const result = await pool.query(`
            SELECT title, price_cents, stock, image_url 
            FROM products 
            WHERE stock > 0 
            ORDER BY RANDOM() 
            LIMIT 5
        `);
        
        let catalogMessage = '🛍️ Welcome to Rangoons!\n\nHere are some featured products:\n\n';
        
        result.rows.forEach((product, index) => {
            catalogMessage += `${index + 1}. ${product.title}\n`;
            catalogMessage += `   💰 Rs ${(product.price_cents / 100).toFixed(2)}\n`;
            catalogMessage += `   📦 Stock: ${product.stock}\n\n`;
        });
        
        catalogMessage += 'To order, reply with: "Order [Product Name]"\n';
        catalogMessage += '📱 Contact: 923001555681';
        
        await sendWhatsAppMessage(sender, catalogMessage);
        
    } catch (err) {
        console.error('❌ Error sending catalog:', err);
    }
}

// Send WhatsApp message
async function sendWhatsAppMessage(to, message) {
    try {
        if (!waSocket) {
            console.log('❌ WhatsApp not connected');
            return;
        }
        
        await waSocket.sendMessage(to, { text: message });
        console.log(`📱 WhatsApp message sent to ${to}`);
        
    } catch (err) {
        console.error('❌ Error sending WhatsApp message:', err);
    }
}

// WhatsApp QR code endpoint
app.get('/admin/whatsapp/qr', (req, res) => {
    if (qrCode) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>WhatsApp QR Code</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                    .qr-container { max-width: 400px; margin: 0 auto; }
                    img { max-width: 100%; height: auto; }
                    .instructions { margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="qr-container">
                    <h1>📱 WhatsApp QR Code</h1>
                    <img src="${qrCode}" alt="WhatsApp QR Code">
                    <div class="instructions">
                        <p>1. Open WhatsApp on your phone</p>
                        <p>2. Go to Settings > Linked Devices</p>
                        <p>3. Scan this QR code</p>
                        <p>4. Your WhatsApp will be connected!</p>
                    </div>
                    <p><a href="/admin/whatsapp/qr">🔄 Refresh QR Code</a></p>
                </div>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>WhatsApp Status</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                </style>
            </head>
            <body>
                <h1>📱 WhatsApp Status</h1>
                <p>✅ WhatsApp is connected and ready!</p>
                <p><a href="/admin/whatsapp/qr">🔄 Check Status</a></p>
            </body>
            </html>
        `);
    }
});

// Start WhatsApp connection
connectWhatsApp();

// Routes
app.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        
        // Get featured products
        const featuredProducts = await client.query(`
            SELECT * FROM products 
            WHERE status = 'active' AND stock > 0 
            ORDER BY views DESC, created_at DESC 
            LIMIT 8
        `);
        
        // Get categories
        const categories = await client.query(`
            SELECT DISTINCT category, COUNT(*) as product_count 
            FROM products 
            WHERE status = 'active' 
            GROUP BY category 
            ORDER BY product_count DESC
        `);
        
        // Get new arrivals
        const newArrivals = await client.query(`
            SELECT * FROM products 
            WHERE status = 'active' AND stock > 0 
            ORDER BY created_at DESC 
            LIMIT 6
        `);
        
        client.release();
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Rangoons - Fashion & Lifestyle</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        background: #f8f9fa; 
                        color: #333;
                    }
                    
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 1rem 0;
                        position: sticky;
                        top: 0;
                        z-index: 1000;
                        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
                    }
                    
                    .nav-container {
                        max-width: 1200px;
                        margin: 0 auto;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0 2rem;
                    }
                    
                    .logo {
                        font-size: 2rem;
                        font-weight: bold;
                        color: white;
                        text-decoration: none;
                    }
                    
                    .nav-menu {
                        display: flex;
                        list-style: none;
                        gap: 2rem;
                    }
                    
                    .nav-menu a {
                        color: white;
                        text-decoration: none;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    }
                    
                    .nav-menu a:hover {
                        color: #ffd700;
                        transform: translateY(-2px);
                    }
                    
                    .search-bar {
                        display: flex;
                        align-items: center;
                        background: rgba(255,255,255,0.2);
                        border-radius: 25px;
                        padding: 0.5rem 1rem;
                        margin: 1rem 0;
                    }
                    
                    .search-bar input {
                        background: transparent;
                        border: none;
                        color: white;
                        outline: none;
                        width: 300px;
                        padding: 0.5rem;
                    }
                    
                    .search-bar input::placeholder {
                        color: rgba(255,255,255,0.8);
                    }
                    
                    .hero-section {
                        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                        color: white;
                        text-align: center;
                        padding: 4rem 2rem;
                        margin-bottom: 3rem;
                    }
                    
                    .hero-title {
                        font-size: 3.5rem;
                        margin-bottom: 1rem;
                        font-weight: 300;
                    }
                    
                    .hero-subtitle {
                        font-size: 1.2rem;
                        margin-bottom: 2rem;
                        opacity: 0.9;
                    }
                    
                    .cta-button {
                        background: #ffd700;
                        color: #333;
                        padding: 1rem 2rem;
                        border: none;
                        border-radius: 25px;
                        font-size: 1.1rem;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-decoration: none;
                        display: inline-block;
                    }
                    
                    .cta-button:hover {
                        background: #ffed4e;
                        transform: translateY(-3px);
                        box-shadow: 0 10px 25px rgba(255,215,0,0.3);
                    }
                    
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 0 2rem;
                    }
                    
                    .section-title {
                        font-size: 2.5rem;
                        text-align: center;
                        margin-bottom: 3rem;
                        color: #333;
                        position: relative;
                    }
                    
                    .section-title::after {
                        content: '';
                        position: absolute;
                        bottom: -10px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 80px;
                        height: 4px;
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        border-radius: 2px;
                    }
                    
                    .categories-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 2rem;
                        margin-bottom: 4rem;
                    }
                    
                    .category-card {
                        background: white;
                        border-radius: 15px;
                        padding: 2rem;
                        text-align: center;
                        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                        transition: all 0.3s ease;
                        cursor: pointer;
                    }
                    
                    .category-card:hover {
                        transform: translateY(-10px);
                        box-shadow: 0 15px 40px rgba(0,0,0,0.15);
                    }
                    
                    .category-icon {
                        font-size: 3rem;
                        margin-bottom: 1rem;
                        color: #667eea;
                    }
                    
                    .products-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                        gap: 2rem;
                        margin-bottom: 4rem;
                    }
                    
                    .product-card {
                        background: white;
                        border-radius: 15px;
                        overflow: hidden;
                        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                        transition: all 0.3s ease;
                        position: relative;
                    }
                    
                    .product-card:hover {
                        transform: translateY(-10px);
                        box-shadow: 0 15px 40px rgba(0,0,0,0.15);
                    }
                    
                    .product-image {
                        width: 100%;
                        height: 300px;
                        object-fit: cover;
                        transition: transform 0.3s ease;
                    }
                    
                    .product-card:hover .product-image {
                        transform: scale(1.05);
                    }
                    
                    .product-info {
                        padding: 1.5rem;
                    }
                    
                    .product-name {
                        font-size: 1.2rem;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                        color: #333;
                    }
                    
                    .product-price {
                        font-size: 1.5rem;
                        font-weight: bold;
                        color: #e74c3c;
                        margin-bottom: 1rem;
                    }
                    
                    .product-actions {
                        display: flex;
                        gap: 1rem;
                    }
                    
                    .btn {
                        padding: 0.8rem 1.5rem;
                        border: none;
                        border-radius: 25px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-decoration: none;
                        display: inline-block;
                        text-align: center;
                        flex: 1;
                    }
                    
                    .btn-primary {
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        color: white;
                    }
                    
                    .btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(102,126,234,0.4);
                    }
                    
                    .btn-outline {
                        background: transparent;
                        color: #667eea;
                        border: 2px solid #667eea;
                    }
                    
                    .btn-outline:hover {
                        background: #667eea;
                        color: white;
                    }
                    
                    .footer {
                        background: #2c3e50;
                        color: white;
                        padding: 3rem 0;
                        margin-top: 4rem;
                    }
                    
                    .footer-content {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 2rem;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 0 2rem;
                    }
                    
                    .footer-section h3 {
                        margin-bottom: 1rem;
                        color: #ffd700;
                    }
                    
                    .footer-section p, .footer-section a {
                        color: #bdc3c7;
                        text-decoration: none;
                        line-height: 1.6;
                    }
                    
                    .footer-section a:hover {
                        color: #ffd700;
                    }
                    
                    .whatsapp-float {
                        position: fixed;
                        bottom: 2rem;
                        right: 2rem;
                        background: #25d366;
                        color: white;
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        text-align: center;
                        font-size: 2rem;
                        line-height: 60px;
                        box-shadow: 0 5px 20px rgba(37,211,102,0.3);
                        transition: all 0.3s ease;
                        z-index: 1000;
                        text-decoration: none;
                    }
                    
                    .whatsapp-float:hover {
                        transform: scale(1.1);
                        box-shadow: 0 8px 25px rgba(37,211,102,0.4);
                    }
                    
                    @media (max-width: 768px) {
                        .nav-menu { display: none; }
                        .hero-title { font-size: 2.5rem; }
                        .search-bar input { width: 200px; }
                        .products-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
                    }
                </style>
            </head>
            <body>
                <header class="header">
                    <nav class="nav-container">
                        <a href="/" class="logo">🛍️ Rangoons</a>
                        <ul class="nav-menu">
                            <li><a href="#home">Home</a></li>
                            <li><a href="#categories">Categories</a></li>
                            <li><a href="#new-arrivals">New Arrivals</a></li>
                            <li><a href="#sale">Sale</a></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </nav>
                    <div class="container">
                        <div class="search-bar">
                            <i class="fas fa-search" style="color: white; margin-right: 10px;"></i>
                            <input type="text" placeholder="Search for products..." id="searchInput">
                        </div>
                    </div>
                </header>

                <section class="hero-section" id="home">
                    <h1 class="hero-title">Discover Amazing Products</h1>
                    <p class="hero-subtitle">Your one-stop shop for fashion, beauty, and lifestyle products</p>
                    <a href="#categories" class="cta-button">Shop Now</a>
                </section>

                <div class="container">
                    <section id="categories">
                        <h2 class="section-title">Shop by Category</h2>
                        <div class="categories-grid">
                            ${categories.rows.map(cat => `
                                <div class="category-card" onclick="filterByCategory('${cat.category}')">
                                    <div class="category-icon">
                                        ${getCategoryIcon(cat.category)}
                                    </div>
                                    <h3>${cat.category || 'General'}</h3>
                                    <p>${cat.product_count} products</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section id="featured">
                        <h2 class="section-title">Featured Products</h2>
                        <div class="products-grid" id="featuredProducts">
                            ${featuredProducts.rows.map(product => createProductCard(product)).join('')}
                        </div>
                    </section>

                    <section id="new-arrivals">
                        <h2 class="section-title">New Arrivals</h2>
                        <div class="products-grid" id="newArrivals">
                            ${newArrivals.rows.map(product => createProductCard(product)).join('')}
                        </div>
                    </section>
                </div>

                <footer class="footer">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h3>About Rangoons</h3>
                            <p>Your trusted source for quality products at affordable prices. We bring you the best selection of fashion, beauty, and lifestyle items.</p>
                        </div>
                        <div class="footer-section">
                            <h3>Quick Links</h3>
                            <p><a href="#home">Home</a></p>
                            <p><a href="#categories">Categories</a></p>
                            <p><a href="#new-arrivals">New Arrivals</a></p>
                            <p><a href="#sale">Sale</a></p>
                        </div>
                        <div class="footer-section">
                            <h3>Contact Info</h3>
                            <p>📱 WhatsApp: +${DOMAIN_CONFIG.waNumber}</p>
                            <p>🌐 Website: ${DOMAIN_CONFIG.shop}</p>
                            <p>📍 Location: Pakistan</p>
                        </div>
                        <div class="footer-section">
                            <h3>Follow Us</h3>
                            <p><a href="#"><i class="fab fa-facebook"></i> Facebook</a></p>
                            <p><a href="#"><i class="fab fa-instagram"></i> Instagram</a></p>
                            <p><a href="#"><i class="fab fa-twitter"></i> Twitter</a></p>
                        </div>
                    </div>
                </footer>

                <a href="https://wa.me/${DOMAIN_CONFIG.waNumber}" class="whatsapp-float" target="_blank">
                    <i class="fab fa-whatsapp"></i>
                </a>

                <script>
                    // Search functionality
                    document.getElementById('searchInput').addEventListener('input', function(e) {
                        const searchTerm = e.target.value.toLowerCase();
                        const products = document.querySelectorAll('.product-card');
                        
                        products.forEach(product => {
                            const name = product.querySelector('.product-name').textContent.toLowerCase();
                            const description = product.querySelector('.product-description')?.textContent.toLowerCase() || '';
                            
                            if (name.includes(searchTerm) || description.includes(searchTerm)) {
                                product.style.display = 'block';
                            } else {
                                product.style.display = 'none';
                            }
                        });
                    });

                    // Category filtering
                    function filterByCategory(category) {
                        const products = document.querySelectorAll('.product-card');
                        products.forEach(product => {
                            const productCategory = product.dataset.category;
                            if (category === 'all' || productCategory === category) {
                                product.style.display = 'block';
                            } else {
                                product.style.display = 'none';
                            }
                        });
                    }

                    // Add to cart functionality
                    function addToCart(productId) {
                        // TODO: Implement cart functionality
                        alert('Product added to cart! (Feature coming soon)');
                    }

                    // Add to wishlist functionality
                    function addToWishlist(productId) {
                        // TODO: Implement wishlist functionality
                        alert('Product added to wishlist! (Feature coming soon)');
                    }

                    // Smooth scrolling for navigation
                    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                        anchor.addEventListener('click', function (e) {
                            e.preventDefault();
                            const target = document.querySelector(this.getAttribute('href'));
                            if (target) {
                                target.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }
                        });
                    });
                </script>
            </body>
            </html>
        `);
        
    } catch (err) {
        res.status(500).send('Error loading page: ' + err.message);
    }
});

// Admin dashboard
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Rangoons - Admin Dashboard</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; margin-bottom: 30px; text-align: center; }
                .admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
                .admin-card { background: #f8f9fa; padding: 25px; border-radius: 10px; text-align: center; border: 2px solid transparent; transition: all 0.3s ease; }
                .admin-card:hover { border-color: #007bff; transform: translateY(-5px); }
                .admin-card h3 { color: #495057; margin-bottom: 15px; }
                .admin-card p { color: #6c757d; margin-bottom: 20px; }
                .admin-button { background: #007bff; color: white; padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; text-decoration: none; display: inline-block; }
                .admin-button:hover { background: #0056b3; }
                .admin-button.whatsapp { background: #25d366; }
                .admin-button.whatsapp:hover { background: #1ea952; }
                .admin-button.export { background: #28a745; }
                .admin-button.export:hover { background: #218838; }
                .admin-button.import { background: #ffc107; color: #212529; }
                .admin-button.import:hover { background: #e0a800; }
                .status { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
                .status h3 { color: #495057; margin-bottom: 10px; }
                .status p { color: #6c757d; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🛠️ Rangoons Admin Dashboard</h1>
                
                <div class="status">
                    <h3>📊 System Status</h3>
                    <p>✅ Server running on port 8080 | 🗄️ PostgreSQL connected | 📱 WhatsApp integration ready</p>
                </div>
                
                <div class="admin-grid">
                    <div class="admin-card">
                        <h3>📱 WhatsApp</h3>
                        <p>Connect and manage WhatsApp integration for customer orders</p>
                        <a href="/admin/whatsapp/qr" class="admin-button whatsapp">Manage WhatsApp</a>
                    </div>
                    
                    <div class="admin-card">
                        <h3>📊 Import Products</h3>
                        <p>Import product catalog from CSV files (Shopify format)</p>
                        <a href="/admin/import" class="admin-button import">Import CSV</a>
                    </div>
                    
                    <div class="admin-card">
                        <h3>📤 Export Database</h3>
                        <p>Export database for mobile backup server setup</p>
                        <a href="/admin/export" class="admin-button export">Export DB</a>
                    </div>
                    
                    <div class="admin-card">
                        <h3>📊 Status Monitor</h3>
                        <p>Monitor server status and failover system</p>
                        <a href="/server-status-widget.html" class="admin-button">View Status</a>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="/" class="admin-button">🏠 Back to Website</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Helper function to create product cards
function createProductCard(product) {
    return `
        <div class="product-card" data-category="${product.category || 'General'}">
            <img src="${product.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || 'No description available'}</p>
                <div class="product-price">Rs ${(product.price_cents / 100).toFixed(2)}</div>
                ${product.base_price_cents > 0 ? `<div class="product-compare-price">Compare: Rs ${(product.base_price_cents / 100).toFixed(2)}</div>` : ''}
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn btn-outline" onclick="addToWishlist(${product.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Helper function to get category icons
function getCategoryIcon(category) {
    const icons = {
        'Health & Beauty': '💄',
        'Apparel': '👕',
        'Toys': '🧸',
        'Office Supplies': '📚',
        'Home & Garden': '🏠',
        'Electronics': '📱',
        'Sports': '⚽',
        'Books': '📖'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
        if (category && category.includes(key)) {
            return icon;
        }
    }
    return '🛍️'; // Default icon
}

// API Routes
app.get('/api/products', async (req, res) => {
    try {
        const { category, search, sort = 'newest' } = req.query;
        let query = 'SELECT * FROM products WHERE status = $1';
        const params = ['active'];
        
        if (category && category !== 'all') {
            query += ' AND category = $2';
            params.push(category);
        }
        
        if (search) {
            query += ' AND (name ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ')';
            params.push(`%${search}%`);
        }
        
        switch (sort) {
            case 'price_low':
                query += ' ORDER BY price_cents ASC';
                break;
            case 'price_high':
                query += ' ORDER BY price_cents DESC';
                break;
            case 'popular':
                query += ' ORDER BY views DESC';
                break;
            default:
                query += ' ORDER BY created_at DESC';
        }
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT category, COUNT(*) as product_count 
            FROM products 
            WHERE status = 'active' 
            GROUP BY category 
            ORDER BY product_count DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CSV Import endpoint
app.post('/admin/import-csv', upload.single('csv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No CSV file uploaded' });
        }

        const csvPath = req.file.path;
        const products = [];

        // Parse CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvPath)
                .pipe(csv())
                .on('data', (row) => {
                    if (!row.Handle || row.Handle.trim() === '') return;
                    
                    const product = {
                        handle: row.Handle || row.Title?.toLowerCase().replace(/\s+/g, '-'),
                        title: row.Title || row.Handle.replace(/-/g, ' '),
                        description: row['Body (HTML)'] || '',
                        vendor: row.Vendor || 'Rangoons',
                        category: row['Product Category'] || 'General',
                        tags: row.Tags || '',
                        published: row.Published === 'TRUE',
                        sku: row['Variant SKU'] || '',
                        stock: parseInt(row['Variant Inventory Qty']) || 0,
                        price_cents: Math.round(parseFloat(row['Variant Price'] || 0) * 100),
                        compare_price_cents: Math.round(parseFloat(row['Variant Compare At Price'] || 0) * 100),
                        image_url: row['Image Src'] || '',
                        weight_grams: Math.round(parseFloat(row['Variant Weight'] || 0) * 1000),
                        option1_name: row['Option1 Name'] || '',
                        option1_value: row['Option1 Value'] || '',
                        option2_name: row['Option2 Name'] || '',
                        option2_value: row['Option2 Value'] || '',
                        option3_name: row['Option3 Name'] || '',
                        option3_value: row['Option3 Value'] || ''
                    };
                    products.push(product);
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Clear existing products
        await pool.query('DELETE FROM products');
        console.log(`✅ Cleared existing products`);

        // Insert new products
        let inserted = 0;
        for (const product of products) {
            try {
                await pool.query(`
                    INSERT INTO products (
                        handle, title, description, vendor, category, tags, published,
                        sku, stock, price_cents, compare_price_cents, image_url,
                        weight_grams, option1_name, option1_value, option2_name,
                        option2_value, option3_name, option3_value
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                `, [
                    product.handle, product.title, product.description, product.vendor,
                    product.category, product.tags, product.published, product.sku,
                    product.stock, product.price_cents, product.compare_price_cents,
                    product.image_url, product.weight_grams, product.option1_name,
                    product.option1_value, product.option2_name, product.option2_value,
                    product.option3_name, product.option3_value
                ]);
                inserted++;
                
                if (inserted % 20 === 0) {
                    console.log(`✅ Imported ${inserted}/${products.length} products...`);
                }
            } catch (err) {
                console.error(`❌ Error importing ${product.title}:`, err.message);
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(csvPath);

        res.json({
            success: true,
            message: `Successfully imported ${inserted} products`,
            total: products.length,
            inserted: inserted
        });

    } catch (err) {
        console.error('❌ CSV import failed:', err);
        res.status(500).json({ error: 'Import failed: ' + err.message });
    }
});

// Admin CSV import page
app.get('/admin/import', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Rangoons - CSV Import</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; margin-bottom: 20px; }
                .upload-form { margin: 20px 0; }
                input[type="file"] { margin: 10px 0; padding: 10px; border: 2px dashed #ddd; border-radius: 5px; width: 100%; }
                button { background: #007bff; color: white; padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
                button:hover { background: #0056b3; }
                .status { margin: 20px 0; padding: 15px; border-radius: 5px; }
                .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📊 CSV Product Import</h1>
                <form class="upload-form" enctype="multipart/form-data">
                    <input type="file" name="csv" accept=".csv" required>
                    <button type="submit">Import Products</button>
                </form>
                <div id="status"></div>
            </div>
            <script>
                document.querySelector('form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    const fileInput = document.querySelector('input[type="file"]');
                    formData.append('csv', fileInput.files[0]);
                    
                    const status = document.getElementById('status');
                    status.innerHTML = '<div class="status">🔄 Importing products...</div>';
                    
                    try {
                        const response = await fetch('/admin/import-csv', {
                            method: 'POST',
                            body: formData
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            status.innerHTML = \`<div class="status success">✅ \${result.message}</div>\`;
                        } else {
                            status.innerHTML = \`<div class="status error">❌ \${result.error}</div>\`;
                        }
                    } catch (err) {
                        status.innerHTML = \`<div class="status error">❌ Import failed: \${err.message}</div>\`;
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// Database export endpoint
app.get('/admin/export-database', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const fs = require('fs');
        const path = require('path');
        
        // Check if pg_dump is available
        exec('pg_dump --version', async (error) => {
            if (error) {
                return res.status(500).json({ 
                    error: 'pg_dump not found. Please install PostgreSQL command line tools.',
                    instructions: [
                        '1. Download PostgreSQL from: https://www.postgresql.org/download/windows/',
                        '2. Install with command line tools',
                        '3. Add PostgreSQL bin directory to PATH'
                    ]
                });
            }
            
            const exportPath = path.join(__dirname, 'rangoons_backup.sql');
            
            // Export database
            exec(`pg_dump -U postgres -h localhost rangoons > "${exportPath}"`, async (error) => {
                if (error) {
                    return res.status(500).json({ 
                        error: 'Database export failed: ' + error.message,
                        check: 'Ensure PostgreSQL is running and accessible'
                    });
                }
                
                // Check if file was created
                if (!fs.existsSync(exportPath)) {
                    return res.status(500).json({ error: 'Export file not created' });
                }
                
                const stats = fs.statSync(exportPath);
                const fileSizeInBytes = stats.size;
                const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
                
                res.json({
                    success: true,
                    message: 'Database exported successfully',
                    file: 'rangoons_backup.sql',
                    size: `${fileSizeInMB} MB`,
                    path: exportPath,
                    instructions: [
                        '1. Copy rangoons_backup.sql to your mobile device',
                        '2. In Termux, run: psql -U postgres -d rangoons -f rangoons_backup.sql',
                        '3. Your mobile server will have the same data'
                    ]
                });
            });
        });
        
    } catch (err) {
        console.error('❌ Database export failed:', err);
        res.status(500).json({ error: 'Export failed: ' + err.message });
    }
});

// Admin database export page
app.get('/admin/export', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Rangoons - Database Export</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; margin-bottom: 20px; }
                .export-button { background: #28a745; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 20px 0; }
                .export-button:hover { background: #218838; }
                .status { margin: 20px 0; padding: 15px; border-radius: 5px; }
                .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
                .instructions { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .instructions h3 { margin-bottom: 10px; color: #495057; }
                .instructions ol { margin-left: 20px; }
                .instructions li { margin-bottom: 8px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🗄️ Database Export</h1>
                <p>Export your PostgreSQL database for mobile backup server setup.</p>
                
                <button class="export-button" onclick="exportDatabase()">📤 Export Database</button>
                
                <div id="status"></div>
                
                <div class="instructions">
                    <h3>📱 Mobile Setup Instructions:</h3>
                    <ol>
                        <li><strong>Export Database:</strong> Click the button above</li>
                        <li><strong>Copy to Mobile:</strong> Transfer rangoons_backup.sql to your mobile</li>
                        <li><strong>Setup Termux:</strong> Run the setup script on your mobile</li>
                        <li><strong>Import Data:</strong> Run: psql -U postgres -d rangoons -f rangoons_backup.sql</li>
                        <li><strong>Start Server:</strong> Run: ./start-background.sh</li>
                    </ol>
                </div>
            </div>
            
            <script>
                async function exportDatabase() {
                    const status = document.getElementById('status');
                    status.innerHTML = '<div class="status">🔄 Exporting database...</div>';
                    
                    try {
                        const response = await fetch('/admin/export-database');
                        const result = await response.json();
                        
                        if (result.success) {
                            status.innerHTML = \`
                                <div class="status success">
                                    <h3>✅ \${result.message}</h3>
                                    <p><strong>File:</strong> \${result.file}</p>
                                    <p><strong>Size:</strong> \${result.size}</p>
                                    <p><strong>Path:</strong> \${result.path}</p>
                                </div>
                            \`;
                        } else {
                            status.innerHTML = \`<div class="status error">❌ \${result.error}</div>\`;
                        }
                    } catch (err) {
                        status.innerHTML = \`<div class="status error">❌ Export failed: \${err.message}</div>\`;
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
    res.json({
        server: 'COMPUTER_PRIMARY',
        status: 'online',
        ip: '154.57.212.38:8080',
        local_ip: 'localhost:8080',
        database: 'postgresql',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Status endpoint for the widget
app.get('/status', (req, res) => {
    res.json({
        activeServer: 'computer',
        computerStatus: 'online',
        computerIP: '154.57.212.38:8080',
        computerLocalIP: 'localhost:8080',
        mobileServer: '192.168.18.22:8081',
        database: 'postgresql',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Shein-Style E-commerce Server running on port', PORT);
    console.log('🌐 Local: http://localhost:' + PORT);
    console.log('🌍 Network: http://154.57.212.38:' + PORT);
    console.log('📱 WhatsApp: https://wa.me/' + DOMAIN_CONFIG.waNumber);
    console.log('🗄️ Database: PostgreSQL');
    console.log('');
    console.log('✨ Features:');
    console.log('   ✅ Modern Shein-style UI');
    console.log('   ✅ Responsive design');
    console.log('   ✅ Product search & filtering');
    console.log('   ✅ Category browsing');
    console.log('   ✅ WhatsApp integration');
    console.log('   ✅ PostgreSQL database');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await pool.end();
    process.exit(0);
});
