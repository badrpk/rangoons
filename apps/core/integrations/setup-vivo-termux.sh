#!/data/data/com.termux/files/usr/bin/bash

# Vivo Mobile Edge Computing Server Setup Script
set -e

echo "🚀 Setting up Vivo Mobile Edge Computing Server..."

# Install packages
pkg update -y
pkg install -y nodejs postgresql git curl

# Create directory
VIVO_EDGE_DIR="$HOME/vivo-edge"
mkdir -p "$VIVO_EDGE_DIR"
cd "$VIVO_EDGE_DIR"

# Create .env
cat > .env << 'EOF'
VIVO_EDGE_ID=vivo-mobile
VIVO_EDGE_NAME=Vivo Mobile Edge
VIVO_EDGE_TYPE=vivo
VIVO_EDGE_PORT=8081
VIVO_EDGE_HOST=0.0.0.0
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rangoons
DB_USER=postgres
DB_PASSWORD=Karachi5846$
EDGE_CACHE_SIZE_MB=128
MAX_CONCURRENT_CONNECTIONS=50
WORKER_THREADS=2
ENABLE_COMPRESSION=true
ENABLE_CACHING=true
CACHE_TTL=300
EOF

# Create startup scripts
cat > start-vivo-edge.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/vivo-edge
export $(cat .env | grep -v '^#' | xargs)
pg_ctl -D $PREFIX/var/lib/postgresql start > /dev/null 2>&1
sleep 3
node vivo-edge-server.js
EOF

cat > start-vivo-background.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/vivo-edge
export $(cat .env | grep -v '^#' | xargs)
pg_ctl -D $PREFIX/var/lib/postgresql start > /dev/null 2>&1
sleep 3
nohup node vivo-edge-server.js > vivo-edge.log 2>&1 &
echo "✅ Vivo edge server started (PID: $!)"
EOF

cat > check-vivo-status.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/vivo-edge
echo "📊 Vivo Mobile Edge Status:"
if pgrep -f "vivo-edge-server.js" > /dev/null; then
    echo "✅ Server: RUNNING"
else
    echo "❌ Server: STOPPED"
fi
if pg_ctl -D $PREFIX/var/lib/postgresql status > /dev/null 2>&1; then
    echo "✅ PostgreSQL: RUNNING"
else
    echo "❌ PostgreSQL: STOPPED"
fi
echo "🔍 Health: $(curl -s http://localhost:8081/health | head -c 50)..."
EOF

# Make executable
chmod +x start-vivo-edge.sh start-vivo-background.sh check-vivo-status.sh

# Create server
cat > vivo-edge-server.js << 'EOF'
const express = require('express');
const { Pool } = require('pg');
const compression = require('compression');
const helmet = require('helmet');

require('dotenv').config();

const EDGE_CONFIG = {
    id: process.env.VIVO_EDGE_ID || 'vivo-mobile',
    name: process.env.VIVO_EDGE_NAME || 'Vivo Mobile Edge',
    type: process.env.VIVO_EDGE_TYPE || 'vivo',
    port: parseInt(process.env.VIVO_EDGE_PORT) || 8081,
    host: process.env.VIVO_EDGE_HOST || '0.0.0.0'
};

const dbPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'rangoons',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Karachi5846$',
    max: 5
});

class VivoEdgeCache {
    constructor() {
        this.cache = new Map();
        this.hits = 0;
        this.misses = 0;
    }

    put(key, data, ttl = 300) {
        const expiresAt = Date.now() + (ttl * 1000);
        this.cache.set(key, { data, expiresAt });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item || Date.now() > item.expiresAt) {
            this.misses++;
            return null;
        }
        this.hits++;
        return item.data;
    }

    getStats() {
        const total = this.hits + this.misses;
        return {
            cacheSize: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRatio: total > 0 ? this.hits / total : 0
        };
    }
}

const vivoEdgeCache = new VivoEdgeCache();
const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        node: EDGE_CONFIG.id,
        name: EDGE_CONFIG.name,
        type: EDGE_CONFIG.type,
        uptime: Math.floor(process.uptime() * 1000),
        timestamp: new Date().toISOString()
    });
});

app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        node: EDGE_CONFIG.id,
        name: EDGE_CONFIG.name,
        type: EDGE_CONFIG.type,
        uptime: Math.floor(process.uptime() * 1000),
        timestamp: new Date().toISOString(),
        cache: vivoEdgeCache.getStats(),
        database: {
            connected: dbPool.totalCount > 0,
            poolSize: dbPool.totalCount
        }
    });
});

app.get('/api/products', async (req, res) => {
    try {
        const cacheKey = `products_${req.query.category || 'all'}_${req.query.limit || 20}`;
        
        const cachedData = vivoEdgeCache.get(cacheKey);
        if (cachedData) {
            res.set('X-Cache', 'VIVO-EDGE-HIT');
            res.set('X-Edge-Node', EDGE_CONFIG.id);
            return res.json(JSON.parse(cachedData));
        }

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

        const dataToCache = JSON.stringify(products);
        vivoEdgeCache.put(cacheKey, dataToCache, 300);

        res.set('X-Cache', 'VIVO-EDGE-MISS');
        res.set('X-Edge-Node', EDGE_CONFIG.id);
        res.json(products);
    } catch (error) {
        console.error('Vivo edge products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/edge/cache-stats', (req, res) => {
    res.json({
        node: EDGE_CONFIG.id,
        cache: vivoEdgeCache.getStats()
    });
});

app.get('/api/edge/performance', (req, res) => {
    const memoryUsage = process.memoryUsage();
    res.json({
        node: EDGE_CONFIG.id,
        timestamp: new Date().toISOString(),
        memory: {
            heapUsed: memoryUsage.heapUsed,
            heapTotal: memoryUsage.heapTotal
        },
        database: {
            connected: dbPool.totalCount > 0,
            poolSize: dbPool.totalCount
        },
        cache: vivoEdgeCache.getStats()
    });
});

process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down Vivo edge server...');
    await dbPool.end();
    process.exit(0);
});

dbPool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Database connected successfully');
    
    app.listen(EDGE_CONFIG.port, EDGE_CONFIG.host, () => {
        console.log('🚀 Vivo Mobile Edge Computing Server Started!');
        console.log(`📱 Node: ${EDGE_CONFIG.name} (${EDGE_CONFIG.id})`);
        console.log(`🌐 Server: http://${EDGE_CONFIG.host}:${EDGE_CONFIG.port}`);
        console.log(`🏥 Health: http://${EDGE_CONFIG.host}:${EDGE_CONFIG.port}/health`);
        console.log(`📊 Status: http://${EDGE_CONFIG.host}:${EDGE_CONFIG.port}/status`);
        console.log(`💾 Cache Stats: http://${EDGE_CONFIG.host}:${EDGE_CONFIG.port}/api/edge/cache-stats`);
        console.log(`⚡ Performance: http://${EDGE_CONFIG.host}:${EDGE_CONFIG.port}/api/edge/performance`);
    });
});
EOF

# Initialize npm and install dependencies
npm init -y
npm install express pg compression helmet dotenv

# Setup PostgreSQL
pg_ctl -D $PREFIX/var/lib/postgresql start
sleep 5
createdb rangoons 2>/dev/null || echo "Database exists"

# Add aliases
cat >> ~/.bashrc << 'EOF'
alias vivo-edge='cd ~/vivo-edge && ./start-vivo-edge.sh'
alias vivo-background='cd ~/vivo-edge && ./start-vivo-background.sh'
alias vivo-status='cd ~/vivo-edge && ./check-vivo-status.sh'
alias vivo-stop='pkill -f vivo-edge'
EOF

echo ""
echo "🎉 Vivo Mobile Edge Computing Server Setup Complete!"
echo "=================================================="
echo "📁 Directory: $VIVO_EDGE_DIR"
echo "🌐 Server Port: 8081"
echo "🚀 Start: ./start-vivo-edge.sh"
echo "🔍 Status: ./check-vivo-status.sh"
echo "💡 Aliases: vivo-edge, vivo-background, vivo-status, vivo-stop"
echo ""
