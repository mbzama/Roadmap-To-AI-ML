const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const ollamaService = require('./services/ollamaService');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200
}));

// Request logging
app.use(morgan('combined'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/chat', chatRoutes);

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Root API endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Express.js Ollama Chatbot API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            chat: '/api/chat/message',
            stream: '/api/chat/stream',
            models: '/api/chat/models'
        },
        documentation: 'See README.md for full API documentation'
    });
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const startTime = Date.now();
        const isOllamaRunning = await ollamaService.checkOllamaHealth();
        const responseTime = Date.now() - startTime;
        
        const healthStatus = {
            status: isOllamaRunning ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            services: {
                api: 'healthy',
                ollama: isOllamaRunning ? 'connected' : 'disconnected'
            },
            performance: {
                responseTime: `${responseTime}ms`,
                uptime: `${Math.floor(process.uptime())}s`
            },
            configuration: {
                ollamaUrl: process.env.OLLAMA_BASE_URL,
                model: process.env.OLLAMA_MODEL,
                nodeEnv: process.env.NODE_ENV
            }
        };

        res.status(isOllamaRunning ? 200 : 503).json(healthStatus);
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
        success: false,
        error: 'Internal server error',
        message: isDevelopment ? error.message : 'Something went wrong',
        ...(isDevelopment && { stack: error.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: `The endpoint ${req.method} ${req.path} does not exist`,
        availableEndpoints: [
            'GET /',
            'GET /health',
            'POST /api/chat/message',
            'POST /api/chat/stream',
            'GET /api/chat/models'
        ]
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Express.js + Streamlit Ollama Chatbot API');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Ollama URL: ${process.env.OLLAMA_BASE_URL}`);
    console.log(`🧠 Using model: ${process.env.OLLAMA_MODEL}`);
    console.log('🎨 Streamlit UI should be accessible at http://localhost:8501');
    console.log('');
    console.log('Available endpoints:');
    console.log('  GET  /health');
    console.log('  POST /api/chat/message');
    console.log('  POST /api/chat/stream');
    console.log('  GET  /api/chat/models');
});

module.exports = app;
