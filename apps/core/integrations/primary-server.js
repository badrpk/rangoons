const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Main route - serve the website
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Rangoons - High Performance E-commerce</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    text-align: center;
                }
                .header {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 30px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                    backdrop-filter: blur(10px);
                }
                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .status-card {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                }
                .status-card h3 {
                    margin-top: 0;
                    color: #ffd700;
                }
                .status-indicator {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    margin-right: 8px;
                }
                .status-online { background: #4CAF50; }
                .status-offline { background: #f44336; }
                .btn {
                    display: inline-block;
                    padding: 12px 24px;
                    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                    color: white;
                    text-decoration: none;
                    border-radius: 25px;
                    margin: 10px;
                    transition: transform 0.2s;
                }
                .btn:hover {
                    transform: translateY(-2px);
                }
                .performance {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 Rangoons E-commerce System</h1>
                    <p>High-Performance Distributed Architecture</p>
                </div>
                
                <div class="status-grid">
                    <div class="status-card">
                        <h3>🖥️ Primary Server</h3>
                        <p><span class="status-indicator status-online"></span>Online</p>
                        <p>Port: 8080</p>
                        <p>IP: 192.168.18.73</p>
                    </div>
                    
                    <div class="status-card">
                        <h3>📱 Vivo Edge Server</h3>
                        <p><span class="status-indicator status-offline"></span>Offline</p>
                        <p>Port: 8081</p>
                        <p>IP: 192.168.18.22</p>
                    </div>
                    
                    <div class="status-card">
                        <h3>📱 Samsung Edge Server</h3>
                        <p><span class="status-indicator status-offline"></span>Offline</p>
                        <p>Port: 8082</p>
                        <p>IP: 192.168.18.160</p>
                    </div>
                </div>
                
                <div class="performance">
                    <h3>⚡ System Performance</h3>
                    <p>Multi-threaded C++ core with Node.js edge computing</p>
                    <p>Load balancing and automatic failover</p>
                    <p>24/7 operation with health monitoring</p>
                </div>
                
                <div style="margin-top: 30px;">
                    <a href="/integrations/performance-dashboard.html" class="btn">📊 Performance Dashboard</a>
                    <a href="/integrations/business-control-panel/index.html" class="btn">🎯 Business Control Panel</a>
                    <a href="/integrations/android-app/index.html" class="btn">📱 Android App</a>
                    <a href="/integrations/ios-app/index.html" class="btn">🍎 iOS App</a>
                </div>
            </div>
            
            <script>
                // Auto-refresh status every 5 seconds
                setInterval(() => {
                    location.reload();
                }, 5000);
            </script>
        </body>
        </html>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        server: 'Rangoons Primary Server',
        port: PORT,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Rangoons Primary Server Running!`);
    console.log(`🌐 Server: 0.0.0.0:${PORT}`);
    console.log(`📍 Local: http://192.168.18.73:${PORT}`);
    console.log(`🌍 External: http://154.57.212.38:${PORT}`);
    console.log(`🔗 Website: http://www.rangoons.live:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down primary server gracefully...');
    process.exit(0);
});
