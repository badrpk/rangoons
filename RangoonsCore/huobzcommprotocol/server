const WebSocket = require('ws');

// Create WebSocket server on port 8080
const server = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

// Handle connection
server.on('connection', (ws) => {
    console.log('A new client connected.');

    // Handle incoming messages
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);

        // Broadcast message to all connected clients
        server.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});
