const axios = require('axios');

class OllamaService {
    constructor() {
        this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.model = process.env.OLLAMA_MODEL || 'llama2';
    }

    /**
     * Check if Ollama is running and accessible
     */
    async checkOllamaHealth() {
        try {
            const response = await axios.get(`${this.baseURL}/api/tags`, {
                timeout: 5000
            });
            return response.status === 200;
        } catch (error) {
            console.error('Ollama health check failed:', error.message);
            return false;
        }
    }

    /**
     * Get list of available models
     */
    async getAvailableModels() {
        try {
            const response = await axios.get(`${this.baseURL}/api/tags`);
            return response.data.models || [];
        } catch (error) {
            console.error('Failed to fetch models:', error.message);
            throw new Error('Failed to fetch available models');
        }
    }

    /**
     * Send a chat message to Ollama
     */
    async sendMessage(message, conversationHistory = []) {
        try {
            // Prepare the conversation context
            const messages = [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.'
                },
                ...conversationHistory,
                {
                    role: 'user',
                    content: message
                }
            ];

            const response = await axios.post(`${this.baseURL}/api/chat`, {
                model: this.model,
                messages: messages,
                stream: false
            }, {
                timeout: 30000, // 30 seconds timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.message) {
                return {
                    success: true,
                    message: response.data.message.content,
                    model: this.model,
                    timestamp: new Date().toISOString()
                };
            } else {
                throw new Error('Invalid response format from Ollama');
            }
        } catch (error) {
            console.error('Ollama request failed:', error.message);
            
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Cannot connect to Ollama. Make sure Ollama is running on ' + this.baseURL);
            } else if (error.response?.status === 404) {
                throw new Error(`Model '${this.model}' not found. Please install it using: ollama pull ${this.model}`);
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout. The model might be too slow to respond.');
            } else {
                throw new Error(`Ollama error: ${error.message}`);
            }
        }
    }

    /**
     * Stream a chat response from Ollama
     */
    async streamMessage(message, conversationHistory = [], onChunk) {
        try {
            const messages = [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.'
                },
                ...conversationHistory,
                {
                    role: 'user',
                    content: message
                }
            ];

            const response = await axios.post(`${this.baseURL}/api/chat`, {
                model: this.model,
                messages: messages,
                stream: true
            }, {
                responseType: 'stream',
                timeout: 60000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            let fullResponse = '';

            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message && data.message.content) {
                            fullResponse += data.message.content;
                            onChunk(data.message.content);
                        }
                    } catch (e) {
                        // Ignore JSON parsing errors for incomplete chunks
                    }
                }
            });

            return new Promise((resolve, reject) => {
                response.data.on('end', () => {
                    resolve({
                        success: true,
                        message: fullResponse,
                        model: this.model,
                        timestamp: new Date().toISOString()
                    });
                });

                response.data.on('error', (error) => {
                    reject(error);
                });
            });

        } catch (error) {
            console.error('Ollama streaming failed:', error.message);
            throw new Error(`Streaming error: ${error.message}`);
        }
    }
}

module.exports = new OllamaService();
