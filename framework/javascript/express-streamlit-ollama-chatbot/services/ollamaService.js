const axios = require('axios');

class OllamaService {
    constructor() {
        this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.model = process.env.OLLAMA_MODEL || 'llama2';
        this.timeout = parseInt(process.env.API_TIMEOUT) || 30000;
        this.maxConversationLength = parseInt(process.env.MAX_CONVERSATION_LENGTH) || 20;
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
            const response = await axios.get(`${this.baseURL}/api/tags`, {
                timeout: 10000
            });
            return response.data.models || [];
        } catch (error) {
            console.error('Failed to fetch models:', error.message);
            throw new Error('Failed to fetch available models from Ollama');
        }
    }

    /**
     * Send a chat message to Ollama
     */
    async sendMessage(message, conversationHistory = [], model = null) {
        try {
            const useModel = model || this.model;
            
            // Prepare the conversation context
            const messages = [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses. Be friendly and professional.'
                },
                ...conversationHistory.slice(-this.maxConversationLength),
                {
                    role: 'user',
                    content: message
                }
            ];

            console.log(`Sending message to Ollama (model: ${useModel}):`, message);

            const response = await axios.post(`${this.baseURL}/api/chat`, {
                model: useModel,
                messages: messages,
                stream: false,
                options: {
                    temperature: 0.7,
                    num_ctx: 4096
                }
            }, {
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.message) {
                console.log('Received response from Ollama');
                return {
                    success: true,
                    message: response.data.message.content,
                    model: useModel,
                    timestamp: new Date().toISOString(),
                    stats: {
                        eval_count: response.data.eval_count || 0,
                        eval_duration: response.data.eval_duration || 0,
                        load_duration: response.data.load_duration || 0,
                        prompt_eval_count: response.data.prompt_eval_count || 0,
                        prompt_eval_duration: response.data.prompt_eval_duration || 0,
                        total_duration: response.data.total_duration || 0
                    }
                };
            } else {
                throw new Error('Invalid response format from Ollama');
            }
        } catch (error) {
            console.error('Ollama request failed:', error.message);
            
            if (error.code === 'ECONNREFUSED') {
                throw new Error(`Cannot connect to Ollama at ${this.baseURL}. Make sure Ollama is running.`);
            } else if (error.response?.status === 404) {
                throw new Error(`Model '${model || this.model}' not found. Please install it using: ollama pull ${model || this.model}`);
            } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                throw new Error('Request timeout. The model might be taking too long to respond.');
            } else {
                throw new Error(`Ollama error: ${error.message}`);
            }
        }
    }

    /**
     * Stream a chat response from Ollama
     */
    async streamMessage(message, conversationHistory = [], onChunk, model = null) {
        try {
            const useModel = model || this.model;
            
            const messages = [
                {
                    role: 'system',
                    content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses. Be friendly and professional.'
                },
                ...conversationHistory.slice(-this.maxConversationLength),
                {
                    role: 'user',
                    content: message
                }
            ];

            console.log(`Streaming message to Ollama (model: ${useModel}):`, message);

            const response = await axios.post(`${this.baseURL}/api/chat`, {
                model: useModel,
                messages: messages,
                stream: true,
                options: {
                    temperature: 0.7,
                    num_ctx: 4096
                }
            }, {
                responseType: 'stream',
                timeout: this.timeout * 2, // Longer timeout for streaming
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            let fullResponse = '';
            let stats = {};

            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message && data.message.content) {
                            fullResponse += data.message.content;
                            if (onChunk) {
                                onChunk(data.message.content);
                            }
                        }
                        
                        // Capture stats from the final message
                        if (data.done && data.eval_count) {
                            stats = {
                                eval_count: data.eval_count,
                                eval_duration: data.eval_duration,
                                load_duration: data.load_duration,
                                prompt_eval_count: data.prompt_eval_count,
                                prompt_eval_duration: data.prompt_eval_duration,
                                total_duration: data.total_duration
                            };
                        }
                    } catch (e) {
                        // Ignore JSON parsing errors for incomplete chunks
                    }
                }
            });

            return new Promise((resolve, reject) => {
                response.data.on('end', () => {
                    console.log('Ollama streaming completed');
                    resolve({
                        success: true,
                        message: fullResponse,
                        model: useModel,
                        timestamp: new Date().toISOString(),
                        stats
                    });
                });

                response.data.on('error', (error) => {
                    console.error('Ollama streaming error:', error);
                    reject(error);
                });
            });

        } catch (error) {
            console.error('Ollama streaming failed:', error.message);
            throw new Error(`Streaming error: ${error.message}`);
        }
    }

    /**
     * Get model information
     */
    async getModelInfo(model = null) {
        try {
            const useModel = model || this.model;
            const response = await axios.post(`${this.baseURL}/api/show`, {
                name: useModel
            }, {
                timeout: 10000
            });
            
            return response.data;
        } catch (error) {
            console.error('Failed to get model info:', error.message);
            throw new Error(`Failed to get information for model: ${model || this.model}`);
        }
    }

    /**
     * Get current configuration
     */
    getConfiguration() {
        return {
            baseURL: this.baseURL,
            model: this.model,
            timeout: this.timeout,
            maxConversationLength: this.maxConversationLength
        };
    }
}

module.exports = new OllamaService();
