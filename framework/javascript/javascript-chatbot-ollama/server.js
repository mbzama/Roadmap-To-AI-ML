const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const ollamaService = require('./services/ollamaService');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/chat', chatRoutes);

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const isOllamaRunning = await ollamaService.checkOllamaHealth();
        res.json({
            status: 'ok',
            ollama: isOllamaRunning ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested endpoint does not exist'
    });
});

app.listen(PORT, () => {
    console.log(`🤖 Chatbot server running on http://localhost:${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
    console.log(`🔗 Ollama URL: ${process.env.OLLAMA_BASE_URL}`);
    console.log(`🧠 Using model: ${process.env.OLLAMA_MODEL}`);
});

module.exports = app;
