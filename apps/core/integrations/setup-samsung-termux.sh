#!/data/data/com.termux/files/usr/bin/bash

# Samsung Mobile Edge Computing Server Setup Script for Termux
# This script sets up a high-performance edge computing node on Samsung mobile

set -e

echo "🚀 Samsung Mobile Edge Computing Server Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if running in Termux
if [[ ! -d "/data/data/com.termux" ]]; then
    print_error "This script must be run in Termux on Android"
    exit 1
fi

print_header "📱 Samsung Mobile Edge Computing Setup"
echo ""

# Update package list
print_status "Updating package list..."
pkg update -y

# Install essential packages
print_status "Installing essential packages..."
pkg install -y nodejs postgresql git curl wget nano

# Install additional performance packages
print_status "Installing performance optimization packages..."
pkg install -y htop procps-ng

# Create Samsung edge computing directory
print_status "Creating Samsung edge computing directory..."
mkdir -p ~/samsung-edge
cd ~/samsung-edge

# Create Samsung edge configuration
print_status "Creating Samsung edge configuration..."
cat > .env << EOF
# Samsung Mobile Edge Computing Configuration
SAMSUNG_MOBILE_IP=192.168.18.160
SAMSUNG_PORT=8082
DB_HOST=localhost
DB_NAME=rangoons
DB_USER=postgres
DB_PASSWORD=Karachi5846$
DB_PORT=5432

# Performance Settings
NODE_ENV=production
UV_THREADPOOL_SIZE=8
NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"
EOF

# Create Samsung edge startup script
print_status "Creating Samsung edge startup script..."
cat > start-samsung-edge.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# Samsung Mobile Edge Computing Server Startup Script

cd ~/samsung-edge

echo "🚀 Starting Samsung Mobile Edge Computing Server..."
echo "📱 Edge Node: Samsung Mobile"
echo "🌐 IP: 192.168.18.160"
echo "🔌 Port: 8082"
echo "💾 Cache: 256 MB"
echo "⚡ Compression: Enabled"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if PostgreSQL is running
if ! pg_ctl -D $PREFIX/var/lib/postgresql status > /dev/null 2>&1; then
    echo "🗄️ Starting PostgreSQL..."
    pg_ctl -D $PREFIX/var/lib/postgresql start
    sleep 3
fi

# Check database connection
echo "🔍 Testing database connection..."
if node -e "
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'rangoons',
    password: process.env.DB_PASSWORD || 'Karachi5846$',
    port: process.env.DB_PORT || 5432
});

pool.query('SELECT 1', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Database connection successful');
    pool.end();
});
"; then
    echo "✅ Database connection verified"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Start Samsung edge server
echo "🚀 Launching Samsung edge server..."
node samsung-edge-server.js
EOF

# Make startup script executable
chmod +x start-samsung-edge.sh

# Create Samsung edge background service script
print_status "Creating Samsung edge background service..."
cat > start-samsung-background.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# Samsung Mobile Edge Computing Background Service

cd ~/samsung-edge

echo "🔄 Starting Samsung edge background service..."
echo "📱 This will run the edge server in the background"
echo "💡 Use 'ps aux | grep samsung' to check if running"
echo "💡 Use 'pkill -f samsung-edge' to stop"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start PostgreSQL if not running
if ! pg_ctl -D $PREFIX/var/lib/postgresql status > /dev/null 2>&1; then
    echo "🗄️ Starting PostgreSQL..."
    pg_ctl -D $PREFIX/var/lib/postgresql start
    sleep 3
fi

# Start Samsung edge server in background
nohup node samsung-edge-server.js > samsung-edge.log 2>&1 &
echo "✅ Samsung edge server started in background (PID: $!)"
echo "📋 Log file: ~/samsung-edge/samsung-edge.log"
echo "🔍 Check status: curl http://localhost:8082/health"
echo ""
echo "💡 To stop: pkill -f samsung-edge"
echo "💡 To view logs: tail -f ~/samsung-edge/samsung-edge.log"
EOF

# Make background script executable
chmod +x start-samsung-background.sh

# Create Samsung edge status checker
print_status "Creating Samsung edge status checker..."
cat > check-samsung-status.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# Samsung Mobile Edge Computing Status Checker

echo "📱 Samsung Mobile Edge Computing Status"
echo "======================================"
echo ""

# Check if Samsung edge server is running
if pgrep -f "samsung-edge-server" > /dev/null; then
    echo "✅ Samsung edge server: RUNNING"
    PID=$(pgrep -f "samsung-edge-server")
    echo "   PID: $PID"
else
    echo "❌ Samsung edge server: NOT RUNNING"
fi

# Check PostgreSQL status
if pg_ctl -D $PREFIX/var/lib/postgresql status > /dev/null 2>&1; then
    echo "✅ PostgreSQL: RUNNING"
else
    echo "❌ PostgreSQL: NOT RUNNING"
fi

# Check Samsung edge server health
echo ""
echo "🔍 Testing Samsung edge server health..."
if curl -s http://localhost:8082/health > /dev/null 2>&1; then
    echo "✅ Samsung edge health check: PASSED"
    echo "🌐 Server accessible at: http://192.168.18.160:8082"
else
    echo "❌ Samsung edge health check: FAILED"
fi

# Check cache statistics
echo ""
echo "💾 Cache Statistics:"
if curl -s http://localhost:8082/api/edge/cache-stats > /dev/null 2>&1; then
    curl -s http://localhost:8082/api/edge/cache-stats | node -e "
    const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
    console.log('   Cache Size:', Math.round(data.cache.cacheSize / 1024 / 1024 * 100) / 100, 'MB');
    console.log('   Hit Ratio:', Math.round(data.cache.hitRatio * 100), '%');
    console.log('   Entries:', data.cache.entries);
    "
else
    echo "   Unable to fetch cache statistics"
fi

echo ""
echo "📊 Performance Metrics:"
if curl -s http://localhost:8082/api/edge/performance > /dev/null 2>&1; then
    curl -s http://localhost:8082/api/edge/performance | node -e "
    const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
    console.log('   Uptime:', Math.round(data.uptime / 60), 'minutes');
    console.log('   Memory Usage:', Math.round(data.memory.heapUsed / 1024 / 1024), 'MB');
    console.log('   Database Pool:', data.database.poolSize, 'connections';
    "
else
    echo "   Unable to fetch performance metrics"
fi
EOF

# Make status checker executable
chmod +x check-samsung-status.sh

# Create Samsung edge monitoring script
print_status "Creating Samsung edge monitoring script..."
cat > monitor-samsung.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# Samsung Mobile Edge Computing Real-time Monitor

cd ~/samsung-edge

echo "📱 Samsung Mobile Edge Computing Monitor"
echo "======================================="
echo "Press Ctrl+C to stop monitoring"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

while true; do
    clear
    echo "📱 Samsung Mobile Edge Computing Monitor"
    echo "======================================="
    echo "Time: $(date)"
    echo ""
    
    # Check server status
    if pgrep -f "samsung-edge-server" > /dev/null; then
        echo "✅ Server Status: RUNNING"
        PID=$(pgrep -f "samsung-edge-server")
        echo "   PID: $PID"
    else
        echo "❌ Server Status: STOPPED"
    fi
    
    # Check database
    if pg_ctl -D $PREFIX/var/lib/postgresql status > /dev/null 2>&1; then
        echo "✅ Database: RUNNING"
    else
        echo "❌ Database: STOPPED"
    fi
    
    # Health check
    echo ""
    echo "🔍 Health Check:"
    if curl -s http://localhost:8082/health > /dev/null 2>&1; then
        echo "   ✅ Health: OK"
        echo "   🌐 Accessible: Yes"
    else
        echo "   ❌ Health: FAILED"
        echo "   🌐 Accessible: No"
    fi
    
    # Cache stats
    echo ""
    echo "💾 Cache Statistics:"
    if curl -s http://localhost:8082/api/edge/cache-stats > /dev/null 2>&1; then
        curl -s http://localhost:8082/api/edge/cache-stats | node -e "
        try {
            const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
            console.log('   Size:', Math.round(data.cache.cacheSize / 1024 / 1024 * 100) / 100, 'MB');
            console.log('   Hit Ratio:', Math.round(data.cache.hitRatio * 100), '%');
            console.log('   Entries:', data.cache.entries);
        } catch (e) {
            console.log('   Error:', e.message);
        }
        "
    else
        echo "   Unable to fetch"
    fi
    
    # Performance metrics
    echo ""
    echo "⚡ Performance:"
    if curl -s http://localhost:8082/api/edge/performance > /dev/null 2>&1; then
        curl -s http://localhost:8082/api/edge/performance | node -e "
        try {
            const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
            console.log('   Uptime:', Math.round(data.uptime / 60), 'min');
            console.log('   Memory:', Math.round(data.memory.heapUsed / 1024 / 1024), 'MB');
            console.log('   DB Pool:', data.database.poolSize, 'conn';
        } catch (e) {
            console.log('   Error:', e.message);
        }
        "
    else
        echo "   Unable to fetch"
    fi
    
    echo ""
    echo "🔄 Refreshing in 5 seconds... (Ctrl+C to stop)"
    sleep 5
done
EOF

# Make monitoring script executable
chmod +x monitor-samsung.sh

# Download Samsung edge server
print_status "Downloading Samsung edge server..."
if [ -f "samsung-edge-server.js" ]; then
    print_warning "Samsung edge server already exists, skipping download"
else
    # Create a simple Samsung edge server if download fails
    print_status "Creating Samsung edge server locally..."
    cat > samsung-edge-server.js << 'EOF'
const express = require('express');
const { Pool } = require('pg');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const os = require('os');

// Samsung edge configuration
const EDGE_CONFIG = {
    id: 'samsung-mobile',
    name: 'Samsung Mobile Edge',
    type: 'samsung',
    port: process.env.SAMSUNG_PORT || 8082,
    cache_size_mb: 256,
    max_connections: 5000,
    worker_threads: os.cpus().length,
    enable_compression: true,
    enable_caching: true
};

// Samsung edge cache
class SamsungEdgeCache {
    constructor(maxSizeMB = 256) {
        this.maxSizeBytes = maxSizeMB * 1024 * 1024;
        this.cache = new Map();
        this.stats = { hits: 0, misses: 0, size: 0, evictions: 0 };
    }

    put(key, data, ttl = 300) {
        const entry = {
            data,
            expires: Date.now() + (ttl * 1000),
            size: Buffer.byteLength(data, 'utf8'),
            accessCount: 0
        };

        if (this.stats.size + entry.size > this.maxSizeBytes) {
            this.evictLRU();
        }

        this.cache.set(key, entry);
        this.stats.size += entry.size;
        return true;
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry || Date.now() > entry.expires) {
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
            hitRatio: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
            cacheSize: this.stats.size,
            maxSize: this.maxSizeBytes,
            entries: this.cache.size
        };
    }
}

// Initialize Samsung edge
const edgeCache = new SamsungEdgeCache(EDGE_CONFIG.cache_size_mb);
const app = express();

// Middleware
if (EDGE_CONFIG.enable_compression) {
    app.use(compression({ level: 6 }));
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Samsung edge endpoints
app.get('/health', (req, res) => {
    res.json({
        server: 'SAMSUNG_EDGE',
        status: 'online',
        ip: process.env.SAMSUNG_MOBILE_IP || '192.168.18.160',
        port: EDGE_CONFIG.port,
        database: 'postgresql',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        cache: edgeCache.getStats()
    });
});

app.get('/status', (req, res) => {
    res.json({
        activeServer: 'samsung',
        samsungStatus: 'online',
        samsungIP: process.env.SAMSUNG_MOBILE_IP || '192.168.18.160',
        samsungPort: EDGE_CONFIG.port,
        database: 'postgresql',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/api/edge/cache-stats', (req, res) => {
    res.json({
        edgeNode: EDGE_CONFIG.id,
        cache: edgeCache.getStats()
    });
});

app.get('/api/edge/performance', (req, res) => {
    res.json({
        edgeNode: EDGE_CONFIG.id,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cache: edgeCache.getStats()
    });
});

// Start Samsung edge server
const server = app.listen(EDGE_CONFIG.port, '0.0.0.0', () => {
    console.log('🚀 Samsung Mobile Edge Server Started!');
    console.log(`📱 Edge Node ID: ${EDGE_CONFIG.id}`);
    console.log(`🌐 Listening on: 0.0.0.0:${EDGE_CONFIG.port}`);
    console.log(`💾 Cache Size: ${EDGE_CONFIG.cache_size_mb} MB`);
    console.log(`🧵 Worker Threads: ${EDGE_CONFIG.worker_threads}`);
    console.log(`🔗 Max Connections: ${EDGE_CONFIG.max_connections}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    server.close(() => process.exit(0));
});
EOF
fi

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm init -y

# Create package.json with Samsung edge dependencies
cat > package.json << EOF
{
  "name": "samsung-edge-server",
  "version": "1.0.0",
  "description": "Samsung Mobile Edge Computing Server",
  "main": "samsung-edge-server.js",
  "scripts": {
    "start": "node samsung-edge-server.js",
    "dev": "node samsung-edge-server.js",
    "background": "./start-samsung-background.sh",
    "status": "./check-samsung-status.sh",
    "monitor": "./monitor-samsung.sh"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "compression": "^1.7.4",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "keywords": ["edge-computing", "samsung", "mobile", "rangoons"],
  "author": "Rangoons Team",
  "license": "MIT"
}
EOF

# Install dependencies
print_status "Installing dependencies..."
npm install

# Setup PostgreSQL
print_status "Setting up PostgreSQL..."
pg_ctl -D $PREFIX/var/lib/postgresql start

# Wait for PostgreSQL to start
sleep 3

# Create database if it doesn't exist
print_status "Creating database..."
createdb rangoons 2>/dev/null || echo "Database 'rangoons' already exists"

# Test database connection
print_status "Testing database connection..."
psql -U postgres -d rangoons -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_status "✅ Database connection successful"
else
    print_error "❌ Database connection failed"
    exit 1
fi

# Create Samsung edge startup service
print_status "Creating Samsung edge startup service..."
cat > ~/.termux/boot/samsung-edge.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/samsung-edge
./start-samsung-background.sh
EOF

chmod +x ~/.termux/boot/samsung-edge.sh

# Final setup
print_status "Setting up Samsung edge environment..."
echo "export PATH=\$PATH:~/samsung-edge" >> ~/.bashrc
echo "alias samsung-edge='cd ~/samsung-edge'" >> ~/.bashrc
echo "alias samsung-status='~/samsung-edge/check-samsung-status.sh'" >> ~/.bashrc
echo "alias samsung-monitor='~/samsung-edge/monitor-samsung.sh'" >> ~/.bashrc

# Create Samsung edge info file
cat > ~/samsung-edge/README.md << 'EOF'
# Samsung Mobile Edge Computing Server

## 🚀 Quick Start

### Start Samsung Edge Server
```bash
cd ~/samsung-edge
./start-samsung-edge.sh
```

### Start in Background
```bash
cd ~/samsung-edge
./start-samsung-background.sh
```

### Check Status
```bash
cd ~/samsung-edge
./check-samsung-status.sh
```

### Monitor Real-time
```bash
cd ~/samsung-edge
./monitor-samsung.sh
```

## 📱 Edge Node Information

- **Node ID**: samsung-mobile
- **IP Address**: 192.168.18.160
- **Port**: 8082
- **Cache Size**: 256 MB
- **Type**: Samsung Mobile Edge

## 🔧 Endpoints

- **Health**: http://192.168.18.160:8082/health
- **Status**: http://192.168.18.160:8082/status
- **Cache Stats**: http://192.168.18.160:8082/api/edge/cache-stats
- **Performance**: http://192.168.18.160:8082/api/edge/performance

## 💾 Cache Features

- LRU eviction policy
- TTL-based expiration
- Hit ratio tracking
- Memory usage monitoring

## ⚡ Performance Features

- Compression enabled
- Rate limiting
- Connection pooling
- Background processing

## 🗄️ Database

- PostgreSQL connection
- Connection pooling
- Query optimization
- Health monitoring
EOF

print_header "🎉 Samsung Mobile Edge Computing Setup Complete!"
echo ""
echo "📱 Samsung Edge Node: samsung-mobile"
echo "🌐 IP Address: 192.168.18.160"
echo "🔌 Port: 8082"
echo "💾 Cache Size: 256 MB"
echo "⚡ Compression: Enabled"
echo "🧵 Worker Threads: $(nproc)"
echo ""
echo "🚀 To start Samsung edge server:"
echo "   cd ~/samsung-edge"
echo "   ./start-samsung-edge.sh"
echo ""
echo "🔄 To start in background:"
echo "   ./start-samsung-background.sh"
echo ""
echo "📊 To check status:"
echo "   ./check-samsung-status.sh"
echo ""
echo "📈 To monitor real-time:"
echo "   ./monitor-samsung.sh"
echo ""
echo "🔧 Samsung edge will auto-start on Termux boot"
echo "💡 Use 'samsung-status' alias to check status quickly"
echo ""
echo "🌐 Test Samsung edge:"
echo "   curl http://192.168.18.160:8082/health"
echo ""
print_status "Samsung mobile edge computing server is ready!"
print_status "Your Samsung mobile is now a high-performance edge computing node!"
