const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cluster = require('cluster');
const os = require('os');

// Edge computing configuration
const EDGE_CONFIG = {
    id: 'samsung-mobile',
    name: 'Samsung Mobile Edge',
    type: 'samsung',
    port: process.env.SAMSUNG_PORT || 8082,
    cache_size_mb: 256,
    max_connections: 5000,
    worker_threads: os.cpus().length,
    enable_compression: true,
    enable_caching: true,
    sync_interval_ms: 10000
};

// Performance optimizations
const PERFORMANCE_CONFIG = {
    compression_level: 6,
    cache_ttl: 300, // 5 minutes
    max_payload_size: '10mb',
    keep_alive_timeout: 30000,
    request_timeout: 30000,
    connection_limit: 1000
};

// Database connection pool with Samsung-specific optimizations
const dbPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'rangoons',
    password: process.env.DB_PASSWORD || 'Karachi5846$',
    port: process.env.DB_PORT || 5432,
    max: 20, // Samsung mobile optimized pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    statement_timeout: 10000, // 10 second query timeout
    query_timeout: 10000
});

// Edge computing cache
class SamsungEdgeCache {
    constructor(maxSizeMB = 256) {
        this.maxSizeBytes = maxSizeMB * 1024 * 1024;
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            size: 0,
            evictions: 0
        };
    }

    put(key, data, ttl = 300) {
        const entry = {
            data,
            expires: Date.now() + (ttl * 1000),
            size: Buffer.byteLength(data, 'utf8'),
            accessCount: 0
        };

        // Evict if necessary
        if (this.stats.size + entry.size > this.maxSizeBytes) {
            this.evictLRU();
        }

        this.cache.set(key, entry);
        this.stats.size += entry.size;
        return true;
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            return null;
        }

        if (Date.now() > entry.expires) {
            this.cache.delete(key);
            this.stats.size -= entry.size;
            this.stats.misses++;
            return null;
        }

        entry.accessCount++;
        this.stats.hits++;
        return entry.data;
    }

    evictLRU() {
        let oldestKey = null;
        let oldestAccess = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.accessCount < oldestAccess) {
                oldestAccess = entry.accessCount;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            const entry = this.cache.get(oldestKey);
            this.stats.size -= entry.size;
            this.cache.delete(oldestKey);
            this.stats.evictions++;
        }
    }

    getStats() {
        return {
            ...this.stats,
            hitRatio: this.stats.hits / (this.stats.hits + this.stats.misses),
            cacheSize: this.stats.size,
            maxSize: this.maxSizeBytes,
            entries: this.cache.size
        };
    }
}

// Initialize Samsung edge cache
const edgeCache = new SamsungEdgeCache(EDGE_CONFIG.cache_size_mb);

// Samsung-specific optimizations
const app = express();

// Security and performance middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Samsung mobile compression optimization
if (EDGE_CONFIG.enable_compression) {
    app.use(compression({
        level: PERFORMANCE_CONFIG.compression_level,
        threshold: 1024,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        }
    }));
}

// Rate limiting for Samsung edge
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Samsung mobile optimized limit
    message: 'Too many requests from Samsung edge node',
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Body parsing with Samsung optimizations
app.use(express.json({ limit: PERFORMANCE_CONFIG.max_payload_size }));
app.use(express.urlencoded({ extended: true, limit: PERFORMANCE_CONFIG.max_payload_size }));

// Samsung edge health endpoint
app.get('/health', async (req, res) => {
    try {
        const client = await dbPool.connect();
        await client.query('SELECT 1');
        client.release();

        const health = {
            server: 'SAMSUNG_EDGE',
            status: 'online',
            ip: process.env.SAMSUNG_MOBILE_IP || '192.168.18.160',
            port: EDGE_CONFIG.port,
            database: 'postgresql',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            cache: edgeCache.getStats(),
            performance: {
                compression: EDGE_CONFIG.enable_compression,
                caching: EDGE_CONFIG.enable_caching,
                workerThreads: EDGE_CONFIG.worker_threads,
                maxConnections: EDGE_CONFIG.max_connections
            }
        };

        res.json(health);
    } catch (error) {
        res.status(500).json({
            server: 'SAMSUNG_EDGE',
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Samsung edge status endpoint
app.get('/status', async (req, res) => {
    try {
        const status = {
            activeServer: 'samsung',
            samsungStatus: 'online',
            samsungIP: process.env.SAMSUNG_MOBILE_IP || '192.168.18.160',
            samsungPort: EDGE_CONFIG.port,
            database: 'postgresql',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            edgeComputing: {
                enabled: true,
                cacheSize: edgeCache.getStats().cacheSize,
                hitRatio: edgeCache.getStats().hitRatio,
                activeConnections: 0
            }
        };

        res.json(status);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Samsung edge products endpoint with caching
app.get('/api/products', async (req, res) => {
    try {
        const cacheKey = `products_${req.query.category || 'all'}_${req.query.limit || 20}`;
        
        // Check Samsung edge cache first
        const cachedData = edgeCache.get(cacheKey);
        if (cachedData) {
            res.set('X-Cache', 'SAMSUNG-EDGE-HIT');
            res.set('X-Edge-Node', EDGE_CONFIG.id);
            return res.json(JSON.parse(cachedData));
        }

        // Query database
        let query = 'SELECT id, handle, title, description, price_cents, stock, image_url, category FROM products WHERE published = true';
        const params = [];
        
        if (req.query.category) {
            query += ' AND category = $1';
            params.push(req.query.category);
        }
        
        query += ' ORDER BY created_at DESC';
        
        if (req.query.limit) {
            query += ` LIMIT $${params.length + 1}`;
            params.push(parseInt(req.query.limit));
        }

        const result = await dbPool.query(query, params);
        const products = result.rows;

        // Cache in Samsung edge for 5 minutes
        const dataToCache = JSON.stringify(products);
        edgeCache.put(cacheKey, dataToCache, PERFORMANCE_CONFIG.cache_ttl);

        res.set('X-Cache', 'SAMSUNG-EDGE-MISS');
        res.set('X-Edge-Node', EDGE_CONFIG.id);
        res.json(products);
    } catch (error) {
        console.error('Samsung edge products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Samsung edge product detail with caching
app.get('/api/products/:id', async (req, res) => {
    try {
        const cacheKey = `product_${req.params.id}`;
        
        // Check Samsung edge cache
        const cachedData = edgeCache.get(cacheKey);
        if (cachedData) {
            res.set('X-Cache', 'SAMSUNG-EDGE-HIT');
            res.set('X-Edge-Node', EDGE_CONFIG.id);
            return res.json(JSON.parse(cachedData));
        }

        const result = await dbPool.query(
            'SELECT * FROM products WHERE id = $1 AND published = true',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = result.rows[0];
        
        // Cache product for 10 minutes
        edgeCache.put(cacheKey, JSON.stringify(product), 600);

        res.set('X-Cache', 'SAMSUNG-EDGE-MISS');
        res.set('X-Edge-Node', EDGE_CONFIG.id);
        res.json(product);
    } catch (error) {
        console.error('Samsung edge product detail error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Samsung edge cache statistics
app.get('/api/edge/cache-stats', (req, res) => {
    res.json({
        edgeNode: EDGE_CONFIG.id,
        cache: edgeCache.getStats(),
        config: {
            maxSizeMB: EDGE_CONFIG.cache_size_mb,
            enableCompression: EDGE_CONFIG.enable_compression,
            enableCaching: EDGE_CONFIG.enable_caching
        }
    });
});

// Samsung edge synchronization endpoint
app.post('/api/edge/sync', async (req, res) => {
    try {
        const { action, data, key } = req.body;
        
        switch (action) {
            case 'cache_put':
                if (edgeCache.put(key, JSON.stringify(data), 300)) {
                    res.json({ success: true, message: 'Data cached in Samsung edge' });
                } else {
                    res.status(500).json({ error: 'Failed to cache data' });
                }
                break;
                
            case 'cache_get':
                const cachedData = edgeCache.get(key);
                if (cachedData) {
                    res.json({ success: true, data: JSON.parse(cachedData) });
                } else {
                    res.status(404).json({ error: 'Data not found in cache' });
                }
                break;
                
            default:
                res.status(400).json({ error: 'Invalid sync action' });
        }
    } catch (error) {
        console.error('Samsung edge sync error:', error);
        res.status(500).json({ error: 'Sync failed' });
    }
});

// Samsung edge performance monitoring
app.get('/api/edge/performance', (req, res) => {
    const performance = {
        edgeNode: EDGE_CONFIG.id,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        cache: edgeCache.getStats(),
        database: {
            poolSize: dbPool.totalCount,
            idleCount: dbPool.idleCount,
            waitingCount: dbPool.waitingCount
        }
    };
    
    res.json(performance);
});

// Samsung edge error handling
app.use((err, req, res, next) => {
    console.error('Samsung edge error:', err);
    res.status(500).json({
        error: 'Samsung edge server error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Samsung edge 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found on Samsung edge',
        edgeNode: EDGE_CONFIG.id,
        timestamp: new Date().toISOString()
    });
});

// Samsung edge server startup
async function startSamsungEdgeServer() {
    try {
        // Test database connection
        const client = await dbPool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('✅ Samsung edge database connection successful');

        // Start Samsung edge server
        const server = app.listen(EDGE_CONFIG.port, '0.0.0.0', () => {
            console.log('🚀 Samsung Mobile Edge Server Started!');
            console.log(`📱 Edge Node ID: ${EDGE_CONFIG.id}`);
            console.log(`🌐 Listening on: 0.0.0.0:${EDGE_CONFIG.port}`);
            console.log(`💾 Cache Size: ${EDGE_CONFIG.cache_size_mb} MB`);
            console.log(`🧵 Worker Threads: ${EDGE_CONFIG.worker_threads}`);
            console.log(`🔗 Max Connections: ${EDGE_CONFIG.max_connections}`);
            console.log(`⚡ Compression: ${EDGE_CONFIG.enable_compression ? 'ON' : 'OFF'}`);
            console.log(`💾 Caching: ${EDGE_CONFIG.enable_caching ? 'ON' : 'OFF'}`);
            console.log('');
            console.log('🔧 Samsung Edge Endpoints:');
            console.log(`   • Health: http://0.0.0.0:${EDGE_CONFIG.port}/health`);
            console.log(`   • Status: http://0.0.0.0:${EDGE_CONFIG.port}/status`);
            console.log(`   • Products: http://0.0.0.0:${EDGE_CONFIG.port}/api/products`);
            console.log(`   • Cache Stats: http://0.0.0.0:${EDGE_CONFIG.port}/api/edge/cache-stats`);
            console.log(`   • Performance: http://0.0.0.0:${EDGE_CONFIG.port}/api/edge/performance`);
        });

        // Samsung edge graceful shutdown
        process.on('SIGTERM', () => {
            console.log('🔄 Samsung edge shutting down gracefully...');
            server.close(() => {
                console.log('✅ Samsung edge server closed');
                dbPool.end();
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('🔄 Samsung edge shutting down...');
            server.close(() => {
                console.log('✅ Samsung edge server closed');
                dbPool.end();
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Samsung edge startup failed:', error);
        process.exit(1);
    }
}

// Start Samsung edge server
if (require.main === module) {
    startSamsungEdgeServer();
}

module.exports = { app, edgeCache, dbPool, EDGE_CONFIG };
