const express = require('express');
const router = express.Router();
const ollamaService = require('../services/ollamaService');

// Store conversation history in memory (in production, use a database or Redis)
const conversations = new Map();

/**
 * POST /api/chat/message
 * Send a message to the chatbot
 */
router.post('/message', async (req, res) => {
    try {
        const { message, conversationId, model } = req.body;

        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid message',
                message: 'Message is required and must be a non-empty string'
            });
        }

        // Get or create conversation history
        const sessionId = conversationId || 'default';
        let conversationHistory = conversations.get(sessionId) || [];

        // Send message to Ollama
        const response = await ollamaService.sendMessage(message, conversationHistory, model);

        // Update conversation history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: response.message }
        );

        // Keep only last N messages to prevent memory issues
        const maxLength = parseInt(process.env.MAX_CONVERSATION_LENGTH) || 20;
        if (conversationHistory.length > maxLength) {
            conversationHistory = conversationHistory.slice(-maxLength);
        }

        conversations.set(sessionId, conversationHistory);

        res.json({
            success: true,
            response: response.message,
            conversationId: sessionId,
            model: response.model,
            timestamp: response.timestamp,
            stats: response.stats,
            historyLength: conversationHistory.length
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
        const { message, conversationId, model } = req.body;

        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
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

        // Stream the response
        const response = await ollamaService.streamMessage(
            message,
            conversationHistory,
            (chunk) => {
                fullMessage += chunk;
                res.write(`data: ${JSON.stringify({ 
                    type: 'chunk', 
                    content: chunk,
                    timestamp: new Date().toISOString()
                })}\n\n`);
            },
            model
        );

        // Update conversation history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: fullMessage }
        );

        // Keep only last N messages to prevent memory issues
        const maxLength = parseInt(process.env.MAX_CONVERSATION_LENGTH) || 20;
        if (conversationHistory.length > maxLength) {
            conversationHistory = conversationHistory.slice(-maxLength);
        }

        conversations.set(sessionId, conversationHistory);

        // Send completion event
        res.write(`data: ${JSON.stringify({
            type: 'complete',
            conversationId: sessionId,
            model: response.model,
            timestamp: response.timestamp,
            stats: response.stats,
            historyLength: conversationHistory.length
        })}\n\n`);

        res.end();

    } catch (error) {
        console.error('Chat stream error:', error);
        res.write(`data: ${JSON.stringify({
            type: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
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
            messageCount: history.length,
            timestamp: new Date().toISOString()
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
        const existed = conversations.has(conversationId);
        conversations.delete(conversationId);
        
        res.json({
            success: true,
            message: existed ? 'Conversation history cleared' : 'Conversation did not exist',
            conversationId,
            timestamp: new Date().toISOString()
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
        const config = ollamaService.getConfiguration();
        
        res.json({
            success: true,
            models: models.map(model => ({
                name: model.name,
                size: model.size,
                digest: model.digest,
                modified_at: model.modified_at
            })),
            currentModel: config.model,
            configuration: config,
            timestamp: new Date().toISOString()
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

/**
 * GET /api/chat/model/:modelName
 * Get information about a specific model
 */
router.get('/model/:modelName', async (req, res) => {
    try {
        const { modelName } = req.params;
        const modelInfo = await ollamaService.getModelInfo(modelName);
        
        res.json({
            success: true,
            model: modelName,
            info: modelInfo,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Get model info error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve model information',
            message: error.message,
            model: req.params.modelName
        });
    }
});

/**
 * GET /api/chat/conversations
 * Get list of active conversations
 */
router.get('/conversations', (req, res) => {
    try {
        const conversationList = Array.from(conversations.keys()).map(id => ({
            id,
            messageCount: conversations.get(id).length,
            lastMessage: conversations.get(id).slice(-1)[0] || null
        }));
        
        res.json({
            success: true,
            conversations: conversationList,
            totalConversations: conversationList.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve conversations',
            message: error.message
        });
    }
});

module.exports = router;
