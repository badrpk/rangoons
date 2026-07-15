#!/data/data/com.termux/files/usr/bin/bash

echo "🚀 Setting up Rangoons Mobile Backup Server on Termux..."
echo "=================================================="

# Update package list
echo "📦 Updating package list..."
pkg update -y

# Install required packages
echo "🔧 Installing required packages..."
pkg install -y nodejs postgresql

# Start PostgreSQL service
echo "🗄️ Starting PostgreSQL service..."
pg_ctl -D $PREFIX/var/lib/postgresql start

# Create rangoons directory
echo "📁 Creating rangoons directory..."
mkdir -p ~/rangoons
cd ~/rangoons

# Download the mobile backup server
echo "⬇️ Downloading mobile backup server..."
curl -o mobile-backup-server.js https://raw.githubusercontent.com/your-repo/rangoons-core/main/integrations/mobile-backup-server.js

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm init -y
npm install express pg

# Create startup script
echo "📝 Creating startup script..."
cat > start-server.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/rangoons
echo "🚀 Starting Rangoons Mobile Backup Server..."
echo "📱 IP: 192.168.18.22:8081"
echo "🗄️ Database: PostgreSQL"
echo "🔗 Health: http://192.168.18.22:8081/health"
echo "📊 Status: http://192.168.18.22:8081/status"
echo "✅ Server will keep running in background"
echo "🛑 Press Ctrl+C to stop"
node mobile-backup-server.js
EOF

# Make startup script executable
chmod +x start-server.sh

# Create background startup script
echo "📝 Creating background startup script..."
cat > start-background.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/rangoons
echo "🚀 Starting Rangoons Mobile Backup Server in background..."
nohup node mobile-backup-server.js > server.log 2>&1 &
echo "✅ Server started in background with PID: $!"
echo "📋 Logs saved to: ~/rangoons/server.log"
echo "🔍 Check status: tail -f ~/rangoons/server.log"
echo "🛑 Stop server: pkill -f mobile-backup-server.js"
EOF

chmod +x start-background.sh

# Create status check script
echo "📝 Creating status check script..."
cat > check-status.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
echo "📊 Rangoons Mobile Server Status:"
echo "=================================="
echo "🔍 Process status:"
ps aux | grep mobile-backup-server.js | grep -v grep
echo ""
echo "🌐 Port status:"
netstat -tlnp | grep :8081
echo ""
echo "🗄️ PostgreSQL status:"
pg_ctl -D $PREFIX/var/lib/postgresql status
echo ""
echo "📋 Recent logs:"
tail -10 ~/rangoons/server.log
EOF

chmod +x check-status.sh

# Create auto-startup script for Termux
echo "📝 Creating auto-startup script..."
cat > ~/.bashrc << 'EOF'
# Rangoons Auto-startup
if [ ! -f ~/rangoons/.server-started ]; then
    echo "🚀 Auto-starting Rangoons Mobile Backup Server..."
    cd ~/rangoons
    nohup node mobile-backup-server.js > server.log 2>&1 &
    echo $! > .server-started
    echo "✅ Server auto-started with PID: $(cat .server-started)"
fi
EOF

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "📁 Directory: ~/rangoons"
echo "🚀 Start server: ./start-server.sh"
echo "🚀 Start background: ./start-background.sh"
echo "📊 Check status: ./check-status.sh"
echo ""
echo "📋 Next steps:"
echo "1. Ensure PostgreSQL is running: pg_ctl -D \$PREFIX/var/lib/postgresql start"
echo "2. Create database: createdb rangoons"
echo "3. Import your products data"
echo "4. Run: ./start-background.sh"
echo "5. Your mobile server will be available at: http://192.168.18.22:8081"
echo ""
echo "🔗 Test endpoints:"
echo "   - Main site: http://192.168.18.22:8081"
echo "   - Health: http://192.168.18.22:8081/health"
echo "   - Status: http://192.168.18.22:8081/status"
echo ""
echo "✅ Server will auto-start when you open Termux!"
echo "🗄️ Database: PostgreSQL (no SQLite dependencies)"
