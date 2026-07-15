const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8081; // Different port to avoid conflicts

// PostgreSQL Configuration for mobile backup
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '192.168.18.22', // Mobile's local IP
    database: process.env.DB_NAME || 'rangoons',
    password: process.env.DB_PASSWORD || 'Karachi5846$',
    port: process.env.DB_PORT || 5432,
});

// Server configuration
const SERVER_CONFIG = {
    type: 'MOBILE_BACKUP',
    ip: '192.168.18.22',
    port: PORT,
    status: 'standby',
    lastHeartbeat: new Date(),
    computerServer: '154.57.212.38:8080',
    database: 'postgresql'
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        server: SERVER_CONFIG.type,
        status: SERVER_CONFIG.status,
        ip: SERVER_CONFIG.ip,
        port: SERVER_CONFIG.port,
        database: SERVER_CONFIG.database,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Status endpoint for the widget
app.get('/status', (req, res) => {
    res.json({
        activeServer: SERVER_CONFIG.status === 'active' ? 'mobile' : 'computer',
        mobileStatus: SERVER_CONFIG.status,
        mobileIP: SERVER_CONFIG.ip,
        mobilePort: SERVER_CONFIG.port,
        computerServer: SERVER_CONFIG.computerServer,
        database: SERVER_CONFIG.database,
        lastHeartbeat: SERVER_CONFIG.lastHeartbeat,
        uptime: process.uptime()
    });
});

// Main website route
app.get('/', async (req, res) => {
    try {
        // Get featured products
        const featuredProducts = await pool.query(`
            SELECT * FROM products 
            WHERE stock > 0 
            ORDER BY RANDOM() 
            LIMIT 8
        `);
        
        // Get categories
        const categories = await pool.query(`
            SELECT category, COUNT(*) as product_count 
            FROM products 
            GROUP BY category 
            ORDER BY product_count DESC
        `);
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Rangoons - Mobile Backup Server</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        background: #f8f9fa; 
                        color: #333;
                    }
                    
                    .header {
                        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                        color: white;
                        padding: 20px;
                        text-align: center;
                    }
                    
                    .status-banner {
                        background: #ff9ff3;
                        color: #2c3e50;
                        padding: 10px;
                        text-align: center;
                        font-weight: bold;
                        border-bottom: 3px solid #e84393;
                    }
                    
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    
                    .products-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 20px;
                        margin-top: 30px;
                    }
                    
                    .product-card {
                        background: white;
                        border-radius: 15px;
                        padding: 20px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                        transition: transform 0.3s ease;
                    }
                    
                    .product-card:hover {
                        transform: translateY(-5px);
                    }
                    
                    .product-image {
                        width: 100%;
                        height: 200px;
                        object-fit: cover;
                        border-radius: 10px;
                        margin-bottom: 15px;
                    }
                    
                    .product-title {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 10px;
                        color: #2c3e50;
                    }
                    
                    .product-price {
                        font-size: 24px;
                        color: #e74c3c;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    
                    .product-stock {
                        color: #27ae60;
                        font-weight: bold;
                        margin-bottom: 15px;
                    }
                    
                    .buy-button {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 25px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        width: 100%;
                        transition: transform 0.2s ease;
                    }
                    
                    .buy-button:hover {
                        transform: scale(1.05);
                    }
                    
                    .categories {
                        display: flex;
                        gap: 15px;
                        margin: 30px 0;
                        flex-wrap: wrap;
                    }
                    
                    .category-tag {
                        background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                        color: white;
                        padding: 8px 20px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="status-banner">
                    🚨 MOBILE BACKUP SERVER ACTIVE - Computer server may be offline
                </div>
                
                <div class="header">
                    <h1>🛍️ Rangoons</h1>
                    <p>Fashion & Lifestyle - Mobile Backup Server</p>
                    <p>IP: ${SERVER_CONFIG.ip}:${SERVER_CONFIG.port}</p>
                    <p>Database: ${SERVER_CONFIG.database}</p>
                </div>
                
                <div class="container">
                    <div class="categories">
                        ${categories.rows.map(cat => `
                            <div class="category-tag">
                                ${cat.category} (${cat.product_count})
                            </div>
                        `).join('')}
                    </div>
                    
                    <h2>Featured Products</h2>
                    <div class="products-grid">
                        ${featuredProducts.rows.map(product => `
                            <div class="product-card">
                                <img src="${product.image_url || 'https://via.placeholder.com/250x200?text=Product'}" 
                                     alt="${product.name}" 
                                     class="product-image">
                                <div class="product-title">${product.name}</div>
                                <div class="product-price">Rs ${(product.price_cents / 100).toFixed(2)}</div>
                                <div class="product-stock">Stock: ${product.stock}</div>
                                <button class="buy-button" onclick="orderProduct('${product.name}')">
                                    Order via WhatsApp
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <script>
                    function orderProduct(productName) {
                        const message = \`Hi! I want to order: \${productName}\`;
                        const whatsappUrl = \`https://wa.me/923001555681?text=\${encodeURIComponent(message)}\`;
                        window.open(whatsappUrl, '_blank');
                    }
                    
                    // Auto-refresh status every 30 seconds
                    setInterval(() => {
                        fetch('/status')
                            .then(response => response.json())
                            .then(data => {
                                console.log('Server status:', data);
                            });
                    }, 30000);
                </script>
            </body>
            </html>
        `);
        
    } catch (err) {
        res.status(500).send('Error loading products: ' + err.message);
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mobile Backup Server running on port ${PORT}`);
    console.log(`📱 IP: ${SERVER_CONFIG.ip}:${PORT}`);
    console.log(`🗄️ Database: ${SERVER_CONFIG.database}`);
    console.log(`🔗 Health check: http://${SERVER_CONFIG.ip}:${PORT}/health`);
    console.log(`📊 Status: http://${SERVER_CONFIG.ip}:${PORT}/status`);
    console.log(`✅ Ready to take over if computer server fails!`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down mobile backup server...');
    await pool.end();
    process.exit(0);
});
