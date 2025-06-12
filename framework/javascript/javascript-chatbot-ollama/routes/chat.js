const express = require('express');
const router = express.Router();
const ollamaService = require('../services/ollamaService');

// Store conversation history in memory (in production, use a database)
const conversations = new Map();

/**
 * POST /api/chat/message
 * Send a message to the chatbot
 */
router.post('/message', async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid message',
                message: 'Message is required and must be a non-empty string'
            });
        }

        // Get or create conversation history
        const sessionId = conversationId || 'default';
        let conversationHistory = conversations.get(sessionId) || [];

        // Send message to Ollama
        const response = await ollamaService.sendMessage(message, conversationHistory);

        // Update conversation history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: response.message }
        );

        // Keep only last 20 messages to prevent memory issues
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        conversations.set(sessionId, conversationHistory);

        res.json({
            success: true,
            response: response.message,
            conversationId: sessionId,
            model: response.model,
            timestamp: response.timestamp
        });

    } catch (error) {
        console.error('Chat message error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message',
            message: error.message
        });
    }
});

/**
 * POST /api/chat/stream
 * Stream a response from the chatbot
 */
router.post('/stream', async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid message',
                message: 'Message is required and must be a non-empty string'
            });
        }

        // Set headers for Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        const sessionId = conversationId || 'default';
        let conversationHistory = conversations.get(sessionId) || [];

        let fullMessage = '';

        const response = await ollamaService.streamMessage(
            message,
            conversationHistory,
            (chunk) => {
                fullMessage += chunk;
                res.write(`data: ${JSON.stringify({ chunk, type: 'chunk' })}\n\n`);
            }
        );

        // Update conversation history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: fullMessage }
        );

        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        conversations.set(sessionId, conversationHistory);

        // Send completion event
        res.write(`data: ${JSON.stringify({
            type: 'complete',
            conversationId: sessionId,
            model: response.model,
            timestamp: response.timestamp
        })}\n\n`);

        res.end();

    } catch (error) {
        console.error('Chat stream error:', error);
        res.write(`data: ${JSON.stringify({
            type: 'error',
            error: error.message
        })}\n\n`);
        res.end();
    }
});

/**
 * GET /api/chat/history/:conversationId
 * Get conversation history
 */
router.get('/history/:conversationId', (req, res) => {
    try {
        const { conversationId } = req.params;
        const history = conversations.get(conversationId) || [];
        
        res.json({
            success: true,
            conversationId,
            history,
            messageCount: history.length
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve conversation history',
            message: error.message
        });
    }
});

/**
 * DELETE /api/chat/history/:conversationId
 * Clear conversation history
 */
router.delete('/history/:conversationId', (req, res) => {
    try {
        const { conversationId } = req.params;
        conversations.delete(conversationId);
        
        res.json({
            success: true,
            message: 'Conversation history cleared',
            conversationId
        });
    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear conversation history',
            message: error.message
        });
    }
});

/**
 * GET /api/chat/models
 * Get available Ollama models
 */
router.get('/models', async (req, res) => {
    try {
        const models = await ollamaService.getAvailableModels();
        res.json({
            success: true,
            models,
            currentModel: process.env.OLLAMA_MODEL
        });
    } catch (error) {
        console.error('Get models error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve models',
            message: error.message
        });
    }
});

module.exports = router;
