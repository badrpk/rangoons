const express = require('express');
const app = express();
const port = 3002;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.send('Rangoons Harmony App - Connected to www.rangoons.live');
});

app.get('/api/products', async (req, res) => {
    try {
        // Connect to your main server
        const response = await fetch('http://www.rangoons.live/api/products');
        const products = await response.json();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Server connection failed' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        app: 'Rangoons Harmony',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🌸 Harmony app listening on port ${port}`);
    console.log(`🌐 Server: http://0.0.0.0:${port}`);
    console.log(`🏥 Health: http://0.0.0.0:${port}/health`);
    console.log(`📊 Status: http://0.0.0.0:${port}/status`);
});

console.log('🚀 Rangoons Harmony app starting...');
