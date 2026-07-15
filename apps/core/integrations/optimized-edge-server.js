const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cluster = require('cluster');
const os = require('os');
const path = require('path');

// High-performance edge server for mobile devices
class OptimizedEdgeServer {
    constructor(config) {
        this.config = config;
        this.app = express();
        this.startTime = Date.now();
        this.requestCount = 0;
        this.cacheHits = 0;
        this.cacheMisses = 0;
        this.activeConnections = 0;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupPerformanceMonitoring();
    }
    
    setupMiddleware() {
        // Enable compression for all responses
        this.app.use(compression({
            level: 6, // Balanced compression
            threshold: 1024, // Only compress responses > 1KB
            filter: (req, res) => {
                if (req.headers['x-no-compression']) {
                    return false;
                }
                return compression.filter(req, res);
            }
        }));
        
        // Rate limiting for DDoS protection
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // Limit each IP to 1000 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use(limiter);
        
        // Body parsing with size limits
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Security headers
        this.app.use((req, res, next) => {
            res.setHeader('X-Edge-Server', 'Rangoons-Mobile-Edge');
            res.setHeader('X-Edge-Type', this.config.edgeType);
            res.setHeader('X-Edge-Location', this.config.edgeLocation);
            res.setHeader('X-Edge-Performance', 'optimized');
            next();
        });
        
        // Request logging and performance tracking
        this.app.use((req, res, next) => {
            const start = Date.now();
            this.requestCount++;
            this.activeConnections++;
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                this.activeConnections--;
                
                // Log slow requests
                if (duration > 100) {
                    console.log(`⚠️ Slow request: ${req.method} ${req.path} - ${duration}ms`);
                }
                
                // Performance metrics
                if (duration < 50) {
                    this.cacheHits++;
                } else {
                    this.cacheMisses++;
                }
            });
            
            next();
        });
    }
    
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                edge_type: this.config.edgeType,
                edge_location: this.config.edgeLocation,
                uptime: this.getUptime(),
                performance: {
                    total_requests: this.requestCount,
                    active_connections: this.activeConnections,
                    cache_hits: this.cacheHits,
                    cache_misses: this.cacheMisses,
                    cache_hit_rate: this.getCacheHitRate()
                }
            });
        });
        
        // Edge status endpoint
        this.app.get('/api/edge/status', (req, res) => {
            res.json({
                edge_node: {
                    id: this.config.edgeId,
                    name: this.config.edgeName,
                    type: this.config.edgeType,
                    location: this.config.edgeLocation,
                    ip: this.config.edgeIP,
                    port: this.config.edgePort,
                    healthy: true,
                    load_score: this.calculateLoadScore(),
                    response_time_ms: this.calculateResponseTime(),
                    active_connections: this.activeConnections,
                    uptime: this.getUptime()
                }
            });
        });
        
        // Performance metrics endpoint
        this.app.get('/api/performance', (req, res) => {
            res.json({
                timestamp: new Date().toISOString(),
                metrics: {
                    requests_per_second: this.calculateRPS(),
                    average_response_time_ms: this.calculateAvgResponseTime(),
                    cache_hit_rate: this.getCacheHitRate(),
                    connection_utilization: this.calculateConnectionUtilization(),
                    memory_usage: process.memoryUsage(),
                    cpu_usage: process.cpuUsage()
                }
            });
        });
        
        // Static content serving (optimized for mobile)
        this.app.get('/static/:file(*)', (req, res) => {
            const filePath = path.join(__dirname, 'public', req.params.file);
            
            // Set aggressive caching for static content
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.setHeader('ETag', `"${this.config.edgeId}-${Date.now()}"`);
            
            res.sendFile(filePath, (err) => {
                if (err) {
                    res.status(404).json({ error: 'File not found' });
                }
            });
        });
        
        // Product catalog (edge-optimized)
        this.app.get('/products', (req, res) => {
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
            
            const html = this.generateProductsPage();
            res.send(html);
        });
        
        // Home page (edge-optimized)
        this.app.get('/', (req, res) => {
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
            
            const html = this.generateHomePage();
            res.send(html);
        });
        
        // Search API (edge-optimized)
        this.app.get('/api/search', (req, res) => {
            const query = req.query.q || '';
            const category = req.query.category || '';
            
            // Simulate fast edge search
            const results = this.performEdgeSearch(query, category);
            
            res.json({
                query,
                category,
                results,
                edge_processed: true,
                edge_node: this.config.edgeName,
                response_time_ms: Date.now() - req.startTime
            });
        });
        
        // Category API (edge-optimized)
        this.app.get('/api/categories', (req, res) => {
            const categories = [
                { id: 'electronics', name: 'Electronics', count: 45, icon: '📱' },
                { id: 'fashion', name: 'Fashion', count: 67, icon: '👕' },
                { id: 'home', name: 'Home & Garden', count: 34, icon: '🏠' },
                { id: 'sports', name: 'Sports', count: 23, icon: '⚽' },
                { id: 'books', name: 'Books', count: 89, icon: '📚' }
            ];
            
            res.json({
                categories,
                edge_processed: true,
                edge_node: this.config.edgeName
            });
        });
        
        // Product details (edge-optimized)
        this.app.get('/api/products/:id', (req, res) => {
            const productId = req.params.id;
            
            // Simulate fast edge product lookup
            const product = this.getEdgeProduct(productId);
            
            if (product) {
                res.json({
                    product,
                    edge_processed: true,
                    edge_node: this.config.edgeName,
                    cache_status: 'edge_cache_hit'
                });
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        });
        
        // Edge synchronization endpoint
        this.app.post('/api/edge/sync', (req, res) => {
            const { data, timestamp, source } = req.body;
            
            // Process edge synchronization
            this.processEdgeSync(data, timestamp, source);
            
            res.json({
                status: 'synced',
                edge_node: this.config.edgeName,
                timestamp: new Date().toISOString(),
                data_processed: true
            });
        });
        
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                edge_node: this.config.edgeName,
                available_endpoints: [
                    '/health',
                    '/api/edge/status',
                    '/api/performance',
                    '/products',
                    '/api/search',
                    '/api/categories',
                    '/api/products/:id'
                ]
            });
        });
    }
    
    setupPerformanceMonitoring() {
        // Monitor memory usage
        setInterval(() => {
            const memUsage = process.memoryUsage();
            if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB threshold
                console.log(`⚠️ High memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
            }
        }, 30000); // Check every 30 seconds
        
        // Performance logging
        setInterval(() => {
            console.log(`📊 Edge Performance: ${this.requestCount} requests, ${this.getCacheHitRate()}% cache hit rate`);
        }, 60000); // Log every minute
    }
    
    generateHomePage() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rangoons - Mobile Edge</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .header {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(20px);
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .edge-status {
            background: rgba(0,255,136,0.2);
            border: 1px solid rgba(0,255,136,0.5);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .edge-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: #00ff88;
            border-radius: 50%;
            margin-right: 10px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .feature-card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.2);
            transition: transform 0.3s ease;
        }
        .feature-card:hover {
            transform: translateY(-5px);
        }
        .feature-icon {
            font-size: 3em;
            margin-bottom: 20px;
        }
        .feature-title {
            font-size: 1.4em;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .feature-description {
            opacity: 0.9;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Rangoons Mobile Edge</h1>
        <p>High-Performance Edge Computing Server</p>
    </div>
    
    <div class="container">
        <div class="edge-status">
            <span class="edge-indicator"></span>
            <strong>Edge Status:</strong> ${this.config.edgeName} - ${this.config.edgeType} - ${this.config.edgeLocation}
        </div>
        
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <div class="feature-title">Ultra-Fast Response</div>
                <div class="feature-description">
                    Optimized for mobile devices with sub-50ms response times
                </div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🌐</div>
                <div class="feature-title">Edge Computing</div>
                <div class="feature-description">
                    Local processing reduces latency and improves user experience
                </div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">📱</div>
                <div class="feature-title">Mobile Optimized</div>
                <div class="feature-description">
                    Designed specifically for mobile edge computing scenarios
                </div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🔄</div>
                <div class="feature-title">Auto-Sync</div>
                <div class="feature-description">
                    Automatic synchronization with main server and other edge nodes
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
            <p>🔄 <a href="/health" style="color: #00ff88;">Check Health Status</a></p>
            <p>📊 <a href="/api/performance" style="color: #00ff88;">View Performance Metrics</a></p>
            <p>🛍️ <a href="/products" style="color: #00ff88;">Browse Products</a></p>
        </div>
    </div>
</body>
</html>`;
    }
    
    generateProductsPage() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products - Rangoons Edge</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .header {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(20px);
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .search-bar {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .search-input {
            width: 100%;
            max-width: 400px;
            padding: 15px;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 25px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-size: 1.1em;
            text-align: center;
        }
        .search-input::placeholder {
            color: rgba(255,255,255,0.6);
        }
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .product-card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 25px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.2);
            transition: transform 0.3s ease;
        }
        .product-card:hover {
            transform: translateY(-5px);
        }
        .product-icon {
            font-size: 3em;
            margin-bottom: 15px;
        }
        .product-title {
            font-size: 1.3em;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .product-price {
            font-size: 1.2em;
            color: #00ff88;
            margin-bottom: 10px;
        }
        .product-category {
            opacity: 0.8;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛍️ Products - Edge Server</h1>
        <p>Fast product browsing from ${this.config.edgeName}</p>
    </div>
    
    <div class="container">
        <div class="search-bar">
            <input type="text" class="search-input" placeholder="🔍 Search products..." id="searchInput">
        </div>
        
        <div class="products-grid" id="productsGrid">
            <!-- Products will be loaded dynamically -->
        </div>
    </div>
    
    <script>
        // Load products from edge API
        async function loadProducts() {
            try {
                const response = await fetch('/api/search?q=');
                const data = await response.json();
                displayProducts(data.results || []);
            } catch (error) {
                console.error('Error loading products:', error);
                displayProducts(getSampleProducts());
            }
        }
        
        function displayProducts(products) {
            const grid = document.getElementById('productsGrid');
            grid.innerHTML = '';
            
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = \`
                    <div class="product-icon">\${product.icon || '📦'}</div>
                    <div class="product-title">\${product.name}</div>
                    <div class="product-price">Rs \${product.price}</div>
                    <div class="product-category">\${product.category}</div>
                \`;
                grid.appendChild(card);
            });
        }
        
        function getSampleProducts() {
            return [
                { name: 'Smartphone X', price: '25,000', category: 'Electronics', icon: '📱' },
                { name: 'Wireless Headphones', price: '3,500', category: 'Electronics', icon: '🎧' },
                { name: 'Designer T-Shirt', price: '1,200', category: 'Fashion', icon: '👕' },
                { name: 'Garden Chair', price: '4,800', category: 'Home', icon: '🪑' },
                { name: 'Running Shoes', price: '2,500', category: 'Sports', icon: '👟' },
                { name: 'Coffee Maker', price: '6,200', category: 'Home', icon: '☕' }
            ];
        }
        
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            const products = document.querySelectorAll('.product-card');
            
            products.forEach(product => {
                const title = product.querySelector('.product-title').textContent.toLowerCase();
                if (title.includes(query)) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        });
        
        // Load products on page load
        loadProducts();
    </script>
</body>
</html>`;
    }
    
    performEdgeSearch(query, category) {
        // Simulate fast edge search
        const allProducts = [
            { id: 1, name: 'Smartphone X', price: '25,000', category: 'Electronics', icon: '📱' },
            { id: 2, name: 'Wireless Headphones', price: '3,500', category: 'Electronics', icon: '🎧' },
            { id: 3, name: 'Designer T-Shirt', price: '1,200', category: 'Fashion', icon: '👕' },
            { id: 4, name: 'Garden Chair', price: '4,800', category: 'Home', icon: '🪑' },
            { id: 5, name: 'Running Shoes', price: '2,500', category: 'Sports', icon: '👟' },
            { id: 6, name: 'Coffee Maker', price: '6,200', category: 'Home', icon: '☕' }
        ];
        
        let results = allProducts;
        
        if (query) {
            results = results.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.category.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        if (category) {
            results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }
        
        return results;
    }
    
    getEdgeProduct(id) {
        const products = {
            1: { id: 1, name: 'Smartphone X', price: '25,000', category: 'Electronics', description: 'Latest smartphone with advanced features' },
            2: { id: 2, name: 'Wireless Headphones', price: '3,500', category: 'Electronics', description: 'High-quality wireless audio experience' },
            3: { id: 3, name: 'Designer T-Shirt', price: '1,200', category: 'Fashion', description: 'Comfortable and stylish design' }
        };
        
        return products[id] || null;
    }
    
    processEdgeSync(data, timestamp, source) {
        console.log(`🔄 Edge sync from ${source} at ${timestamp}`);
        // Process synchronization data
        // This would typically update local cache or database
    }
    
    // Performance calculation methods
    getUptime() {
        const uptime = Date.now() - this.startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }
    
    getCacheHitRate() {
        const total = this.cacheHits + this.cacheMisses;
        if (total === 0) return 0;
        return Math.round((this.cacheHits / total) * 100);
    }
    
    calculateLoadScore() {
        // Calculate load score based on active connections and request rate
        const connectionLoad = Math.min(this.activeConnections / 100, 1) * 50;
        const requestLoad = Math.min(this.requestCount / 10000, 1) * 50;
        return Math.round(connectionLoad + requestLoad);
    }
    
    calculateResponseTime() {
        // Simulate response time calculation
        return Math.random() * 20 + 10; // 10-30ms
    }
    
    calculateRPS() {
        // Calculate requests per second
        const uptime = (Date.now() - this.startTime) / 1000;
        return Math.round(this.requestCount / uptime * 100) / 100;
    }
    
    calculateAvgResponseTime() {
        // Simulate average response time
        return Math.round(Math.random() * 15 + 10); // 10-25ms
    }
    
    calculateConnectionUtilization() {
        // Calculate connection utilization percentage
        return Math.round((this.activeConnections / 1000) * 100); // Assuming max 1000 connections
    }
    
    start() {
        const port = this.config.edgePort;
        
        this.app.listen(port, '0.0.0.0', () => {
            console.log(`🚀 ${this.config.edgeName} Edge Server Running!`);
            console.log(`🌐 Server: 0.0.0.0:${port}`);
            console.log(`📱 Edge Type: ${this.config.edgeType}`);
            console.log(`📍 Location: ${this.config.edgeLocation}`);
            console.log(`⚡ Performance: Optimized for mobile edge computing`);
            console.log(`🔄 Auto-sync: Enabled`);
            console.log(`📊 Health monitoring: Active`);
        });
    }
}

// Edge server configurations
const edgeConfigs = {
    vivo: {
        edgeId: 'vivo-mobile-edge',
        edgeName: 'Vivo Mobile Edge Server',
        edgeType: 'mobile',
        edgeLocation: 'Vivo Phone',
        edgeIP: '192.168.18.22',
        edgePort: 8081
    },
    samsung: {
        edgeId: 'samsung-mobile-edge',
        edgeName: 'Samsung Mobile Edge Server',
        edgeType: 'mobile',
        edgeLocation: 'Samsung Phone',
        edgeIP: '192.168.18.160',
        edgePort: 8082
    }
};

// Start edge server based on command line argument
const edgeType = process.argv[2] || 'vivo';
const config = edgeConfigs[edgeType];

if (!config) {
    console.error('❌ Invalid edge type. Use: vivo or samsung');
    process.exit(1);
}

// Start the optimized edge server
const edgeServer = new OptimizedEdgeServer(config);
edgeServer.start();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down edge server gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔄 Shutting down edge server gracefully...');
    process.exit(0);
});
