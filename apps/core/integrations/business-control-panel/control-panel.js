const express = require('express');
const app = express();
const port = 3003;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Business Control Panel Routes
app.get('/', (req, res) => {
    res.send('Rangoons Business Control Panel - Connected to www.rangoons.live');
});

// Inventory Management
app.get('/api/inventory', async (req, res) => {
    try {
        // Connect to your main server for inventory data
        const response = await fetch('http://www.rangoons.live/api/inventory');
        const inventory = await response.json();
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ error: 'Inventory server connection failed' });
    }
});

// Order Management
app.get('/api/orders', async (req, res) => {
    try {
        // Connect to your main server for order data
        const response = await fetch('http://www.rangoons.live/api/orders');
        const orders = await response.json();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Orders server connection failed' });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        app: 'Rangoons Business Control Panel',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🏢 Business Control Panel listening on port ${port}`);
    console.log(`🌐 Server: http://0.0.0.0:${port}`);
    console.log(`🏥 Health: http://0.0.0.0:${port}/health`);
    console.log(`📊 Status: http://0.0.0.0:${port}/status`);
});

console.log('🚀 Rangoons Business Control Panel starting...');
