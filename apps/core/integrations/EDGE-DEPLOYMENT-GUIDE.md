# 🚀 Rangoons Edge Computing Deployment Guide

This guide covers the complete setup and deployment of the Rangoons edge computing architecture with three nodes:
1. **Primary C++ Server** (Computer - High Performance)
2. **Vivo Mobile Edge** (Mobile Phone - Edge Computing)
3. **Samsung Mobile Edge** (Mobile Phone - Advanced Edge Computing)

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Rangoons Edge Computing                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Primary C++   │    │   Load          │                │
│  │   Server        │◄──►│   Balancer      │                │
│  │   (Computer)    │    │   & Cache       │                │
│  │   Port: 8080    │    │   Manager       │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                        │                       │
│           │                        │                       │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Vivo Mobile   │    │  Samsung Mobile │                │
│  │   Edge Node     │    │  Edge Node      │                │
│  │   Port: 8081    │    │  Port: 8082     │                │
│  │   IP: 192.168.  │    │  IP: 192.168.   │                │
│  │       18.22     │    │       18.160     │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL Database                        │ │
│  │              (Shared across all nodes)                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🖥️ Node 1: Primary C++ Server (Computer)

### Prerequisites
- Windows 10/11 with C++ compiler
- PostgreSQL installed
- Make utility

### Quick Setup
```bash
# 1. Navigate to project directory
cd D:\rangoons-core

# 2. Install dependencies (if not already done)
make install-deps-windows

# 3. Setup database
make setup-db

# 4. Build the server
make all

# 5. Start the server
make run
```

### Configuration
The C++ server automatically configures:
- **Port**: 8080
- **Database**: PostgreSQL (localhost:5432/rangoons)
- **Edge Computing**: Enabled with load balancing
- **Cache**: In-memory edge cache
- **Performance**: Hardware-optimized C++ implementation

### Access URLs
- **Website**: http://localhost:8080
- **Admin Panel**: http://localhost:8080/admin
- **Health Check**: http://localhost:8080/health
- **Status**: http://localhost:8080/status

## 📱 Node 2: Vivo Mobile Edge (Mobile Phone)

### Prerequisites
- Android phone with Termux installed
- WiFi connection to same network as computer
- IP address: 192.168.18.22

### Quick Setup
```bash
# 1. Open Termux on Vivo mobile
# 2. Download and run setup script
curl -O https://raw.githubusercontent.com/your-repo/rangoons-core/main/integrations/setup-vivo-termux.sh
bash setup-vivo-termux.sh

# 3. Start the edge server
vivo-background

# 4. Check status
vivo-status
```

### Configuration
- **Port**: 8081
- **IP**: 192.168.18.22
- **Cache Size**: 128 MB
- **Database**: PostgreSQL (shared with primary)
- **Features**: Edge caching, compression, security

### Access URLs
- **Health**: http://192.168.18.22:8081/health
- **Status**: http://192.168.18.22:8081/status
- **Products**: http://192.168.18.22:8081/api/products
- **Cache Stats**: http://192.168.18.22:8081/api/edge/cache-stats

### Management Commands
```bash
vivo-edge          # Start in foreground
vivo-background    # Start in background
vivo-status        # Check status
vivo-stop          # Stop server
```

## 📱 Node 3: Samsung Mobile Edge (Mobile Phone)

### Prerequisites
- Samsung Android phone with Termux installed
- WiFi connection to same network as computer
- IP address: 192.168.18.160

### Quick Setup
```bash
# 1. Open Termux on Samsung mobile
# 2. Download and run setup script
curl -O https://raw.githubusercontent.com/your-repo/rangoons-core/main/integrations/setup-samsung-termux.sh
bash setup-samsung-termux.sh

# 3. Start the edge server
samsung-background

# 4. Check status
samsung-status
```

### Configuration
- **Port**: 8082
- **IP**: 192.168.18.160
- **Cache Size**: 256 MB
- **Database**: PostgreSQL (shared with primary)
- **Features**: Advanced edge caching, performance monitoring, load balancing

### Access URLs
- **Health**: http://192.168.18.160:8082/health
- **Status**: http://192.168.18.160:8082/status
- **Products**: http://192.168.18.160:8082/api/products
- **Cache Stats**: http://192.168.18.160:8082/api/edge/cache-stats
- **Performance**: http://192.168.18.160:8082/api/edge/performance

### Management Commands
```bash
samsung-edge       # Start in foreground
samsung-background # Start in background
samsung-status     # Check status
samsung-monitor    # Real-time monitoring
samsung-stop       # Stop server
```

## 🔧 Load Balancing & Failover

### Automatic Failover
The system automatically detects node failures and routes traffic to healthy nodes:

1. **Primary C++ Server** (Priority: Highest)
   - Handles main traffic
   - Manages load balancing
   - Coordinates edge nodes

2. **Vivo Mobile Edge** (Priority: Medium)
   - Handles overflow traffic
   - Provides edge caching
   - Automatic failover support

3. **Samsung Mobile Edge** (Priority: Medium)
   - Advanced edge computing
   - Performance monitoring
   - Load distribution

### Load Balancing Strategy
- **Strategy**: Least Connections
- **Health Check Interval**: 5 seconds
- **Max Failures**: 3 before marking as unhealthy
- **Auto Failover**: Enabled

## 📊 Monitoring & Status

### Enhanced Status Widget
Access the comprehensive monitoring dashboard:
```
http://localhost:8080/enhanced-status-widget.html
```

### Real-time Metrics
- Node health status
- Response times
- Cache hit ratios
- Memory usage
- Database connections
- Performance statistics

### Health Endpoints
Each node provides health monitoring:
- `/health` - Basic health check
- `/status` - Detailed status
- `/api/edge/cache-stats` - Cache statistics
- `/api/edge/performance` - Performance metrics

## 🗄️ Database Configuration

### Shared PostgreSQL Setup
All nodes connect to the same PostgreSQL database:

```bash
# Database connection details
Host: localhost (or computer's IP)
Port: 5432
Database: rangoons
User: postgres
Password: Karachi5846$
```

### Database Schema
The system automatically creates:
- Products table
- Categories table
- Orders table
- Carts table
- Product statistics
- Edge computing metrics

## 🚀 Performance Optimization

### C++ Primary Server
- Hardware-optimized code
- Multi-threading support
- Connection pooling
- Memory management
- CPU affinity optimization

### Mobile Edge Nodes
- In-memory caching
- GZIP compression
- Rate limiting
- Security headers
- Background processing

### Cache Strategy
- **Primary Cache**: In-memory with TTL
- **Edge Cache**: Distributed across mobile nodes
- **Cache Sync**: Automatic synchronization
- **Eviction Policy**: LRU with TTL

## 🔒 Security Features

### Built-in Security
- Helmet.js security headers
- Rate limiting
- CORS configuration
- Input validation
- SQL injection protection

### Network Security
- Local network isolation
- Port-specific access
- Database authentication
- Secure communication

## 📱 Mobile Setup Tips

### Termux Configuration
1. **Install Termux** from F-Droid
2. **Grant storage permissions**
3. **Install required packages**
4. **Configure auto-start**

### Network Configuration
1. **Ensure same WiFi network**
2. **Note IP addresses**
3. **Test connectivity**
4. **Configure firewall if needed**

### Performance Tuning
1. **Close unnecessary apps**
2. **Enable battery optimization**
3. **Monitor resource usage**
4. **Restart periodically**

## 🚨 Troubleshooting

### Common Issues

#### Node Not Responding
```bash
# Check if server is running
ps aux | grep edge-server

# Check logs
tail -f ~/vivo-edge/vivo-edge.log
tail -f ~/samsung-edge/samsung-edge.log

# Restart server
pkill -f edge-server
./start-vivo-background.sh  # or samsung-background.sh
```

#### Database Connection Failed
```bash
# Start PostgreSQL
pg_ctl -D $PREFIX/var/lib/postgresql start

# Test connection
psql -d rangoons -c "SELECT NOW();"

# Check credentials in .env file
cat .env
```

#### Cache Not Working
```bash
# Check cache stats
curl http://localhost:8081/api/edge/cache-stats

# Clear cache if needed
curl -X POST http://localhost:8081/api/edge/sync \
  -H "Content-Type: application/json" \
  -d '{"action": "clear"}'
```

### Performance Issues
1. **Check memory usage**
2. **Monitor CPU usage**
3. **Verify network latency**
4. **Review cache hit ratios**

## 📈 Scaling & Maintenance

### Adding More Edge Nodes
1. **Clone setup scripts**
2. **Modify IP addresses**
3. **Update load balancer config**
4. **Test connectivity**

### Performance Monitoring
- **Real-time metrics**
- **Historical data**
- **Alert thresholds**
- **Performance reports**

### Backup & Recovery
- **Database backups**
- **Configuration backups**
- **Disaster recovery**
- **Rollback procedures**

## 🎯 Best Practices

### Development
1. **Test on all nodes**
2. **Monitor performance**
3. **Update regularly**
4. **Document changes**

### Production
1. **Monitor health**
2. **Scale gradually**
3. **Backup regularly**
4. **Update securely**

### Maintenance
1. **Regular health checks**
2. **Performance tuning**
3. **Security updates**
4. **Capacity planning**

## 📚 Additional Resources

### Documentation
- [C++ Server Implementation](src/)
- [Edge Computing Architecture](integrations/)
- [Database Schema](src/database.cpp)
- [API Endpoints](integrations/*-edge-server.js)

### Support
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check this guide and README files
- **Community**: Join discussions and share solutions

---

## 🎉 Quick Start Summary

1. **Start Primary C++ Server**: `make run`
2. **Setup Vivo Mobile**: Run `setup-vivo-termux.sh`
3. **Setup Samsung Mobile**: Run `setup-samsung-termux.sh`
4. **Monitor Status**: Access enhanced status widget
5. **Test Integration**: Verify all nodes are communicating

Your Rangoons edge computing system is now ready to handle high traffic with distributed processing across multiple nodes! 🚀
