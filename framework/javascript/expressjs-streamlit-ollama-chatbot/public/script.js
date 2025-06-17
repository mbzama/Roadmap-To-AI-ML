// Chatbot JavaScript Functionality
class ChatBot {
    constructor() {
        this.chatForm = document.getElementById('chatForm');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusDot = this.statusIndicator.querySelector('.status-dot');
        this.statusText = this.statusIndicator.querySelector('.status-text');
          this.isLoading = false;
        this.apiEndpoint = '/api/chat/message';
        this.streamEndpoint = '/api/chat/stream';
        this.conversationId = 'default';
        this.useStreaming = true; // Set to false to use regular message endpoint
        
        this.init();
    }
      init() {
        // Set initial timestamp
        this.setInitialTime();
        
        // Event listeners
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.messageInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        
        // Control button listeners
        this.setupControls();
        
        // Modal listeners
        this.setupModals();
        
        // Focus on input
        this.messageInput.focus();
        
        // Set initial status
        this.updateStatus('ready', 'Ready');
    }
    
    setInitialTime() {
        const initialTimeElement = document.getElementById('initialTime');
        if (initialTimeElement) {
            initialTimeElement.textContent = this.getCurrentTime();
        }
    }
      getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    setupControls() {
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openModal('settingsModal'));
        }
        
        // Clear button
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearConversation());
        }
        
        // Help button
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.openModal('helpModal'));
        }
    }
    
    setupModals() {
        // Settings modal
        const settingsModal = document.getElementById('settingsModal');
        const closeSettings = document.getElementById('closeSettings');
        const streamingToggle = document.getElementById('streamingToggle');
        const conversationIdInput = document.getElementById('conversationId');
        
        if (closeSettings) {
            closeSettings.addEventListener('click', () => this.closeModal('settingsModal'));
        }
        
        if (streamingToggle) {
            streamingToggle.addEventListener('change', (e) => {
                this.useStreaming = e.target.checked;
                this.updateStatus('ready', this.useStreaming ? 'Streaming enabled' : 'Streaming disabled');
                setTimeout(() => this.updateStatus('ready', 'Ready'), 2000);
            });
        }
        
        if (conversationIdInput) {
            conversationIdInput.addEventListener('change', (e) => {
                this.conversationId = e.target.value || 'default';
            });
        }
        
        // Help modal
        const helpModal = document.getElementById('helpModal');
        const closeHelp = document.getElementById('closeHelp');
        
        if (closeHelp) {
            closeHelp.addEventListener('click', () => this.closeModal('helpModal'));
        }
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                this.closeModal('settingsModal');
            }
            if (e.target === helpModal) {
                this.closeModal('helpModal');
            }
        });
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSubmit(e);
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        
        // Show loading state
        this.setLoading(true);
          try {
            // Send message to server
            let response;
            if (this.useStreaming) {
                response = await this.sendStreamMessage(message);
            } else {
                response = await this.sendMessage(message);
                // Add bot response
                this.addMessage(response.response, 'bot');
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot', true);
            this.updateStatus('error', 'Connection Error');
        } finally {
            this.setLoading(false);
        }
    }
      async sendMessage(message) {
        this.updateStatus('connecting', 'Sending...');
        
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message,
                conversationId: this.conversationId
            }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Server error');
        }
        
        this.updateStatus('ready', 'Ready');
        return data;
    }
    
    async sendStreamMessage(message) {
        this.updateStatus('connecting', 'Connecting...');
        
        const response = await fetch(this.streamEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message,
                conversationId: this.conversationId
            }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Create a message element for streaming content
        const messageDiv = this.createBotMessage('');
        let fullResponse = '';
        
        this.updateStatus('connecting', 'Receiving...');
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.type === 'chunk') {
                                fullResponse += data.content;
                                this.updateMessageContent(messageDiv, fullResponse);
                            } else if (data.type === 'complete') {
                                this.updateStatus('ready', 'Ready');
                                this.addMessageTime(messageDiv);
                            } else if (data.type === 'error') {
                                throw new Error(data.error);
                            }
                        } catch (parseError) {
                            console.error('Error parsing SSE data:', parseError);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
        
        return { response: fullResponse };
    }
      addMessage(content, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        if (isError) {
            messageContent.classList.add('error-message');
        }
        
        const messageText = document.createElement('p');
        messageText.textContent = content;
        messageContent.appendChild(messageText);
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        // Remove typing indicator if exists
        this.removeTypingIndicator();
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    createBotMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = content;
        messageContent.appendChild(messageText);
        
        messageDiv.appendChild(messageContent);
        
        // Remove typing indicator if exists
        this.removeTypingIndicator();
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }
    
    updateMessageContent(messageDiv, content) {
        const messageText = messageDiv.querySelector('p');
        if (messageText) {
            messageText.textContent = content;
            this.scrollToBottom();
        }
    }
    
    addMessageTime(messageDiv) {
        const existingTime = messageDiv.querySelector('.message-time');
        if (!existingTime) {
            const messageTime = document.createElement('div');
            messageTime.className = 'message-time';
            messageTime.textContent = this.getCurrentTime();
            messageDiv.appendChild(messageTime);
        }
    }
    
    addTypingIndicator() {
        // Remove existing typing indicator
        this.removeTypingIndicator();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator-message';
        typingDiv.id = 'typingIndicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingContent.appendChild(dot);
        }
        
        typingDiv.appendChild(typingContent);
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    setLoading(isLoading) {
        this.isLoading = isLoading;
        this.sendButton.disabled = isLoading;
        this.messageInput.disabled = isLoading;
        
        if (isLoading) {
            this.addTypingIndicator();
            this.sendButton.innerHTML = '<span>...</span>';
            this.updateStatus('connecting', 'Thinking...');
        } else {
            this.removeTypingIndicator();
            this.sendButton.innerHTML = '<span>Send</span>';
            this.updateStatus('ready', 'Ready');
            this.messageInput.focus();
        }
    }
    
    updateStatus(type, text) {
        this.statusDot.className = `status-dot ${type}`;
        this.statusText.textContent = text;
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    // Utility method to format text (can be extended for markdown support)
    formatMessage(text) {
        // Basic text formatting - can be extended
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }
    
    // Method to handle connection errors
    handleConnectionError() {
        this.updateStatus('error', 'Disconnected');
        this.addMessage('Connection lost. Please check your network and try again.', 'bot', true);
    }
      // Method to retry failed requests
    async retryLastMessage() {
        const userMessages = Array.from(this.chatMessages.querySelectorAll('.user-message'));
        if (userMessages.length > 0) {
            const lastMessage = userMessages[userMessages.length - 1];
            const messageText = lastMessage.querySelector('p').textContent;
            
            this.setLoading(true);
            try {
                let response;
                if (this.useStreaming) {
                    response = await this.sendStreamMessage(messageText);
                } else {
                    response = await this.sendMessage(messageText);
                    this.addMessage(response.response, 'bot');
                }
            } catch (error) {
                this.handleConnectionError();
            } finally {
                this.setLoading(false);
            }
        }
    }
    
    // Get available models
    async getAvailableModels() {
        try {
            const response = await fetch('/api/chat/models');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.success ? data.models : [];
        } catch (error) {
            console.error('Error fetching models:', error);
            return [];
        }
    }
    
    // Clear conversation history
    async clearConversation() {
        try {
            const response = await fetch(`/api/chat/history/${this.conversationId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Clear local chat messages (keep the initial greeting)
                const initialMessage = this.chatMessages.querySelector('.message.bot-message');
                this.chatMessages.innerHTML = '';
                if (initialMessage) {
                    this.chatMessages.appendChild(initialMessage);
                }
                this.updateStatus('ready', 'Conversation cleared');
            }
        } catch (error) {
            console.error('Error clearing conversation:', error);
            this.updateStatus('error', 'Failed to clear');
        }
    }
    
    // Toggle between streaming and regular mode
    toggleStreaming() {
        this.useStreaming = !this.useStreaming;
        this.updateStatus('ready', this.useStreaming ? 'Streaming enabled' : 'Streaming disabled');
        setTimeout(() => {
            this.updateStatus('ready', 'Ready');
        }, 2000);
    }
}

// Enhanced error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Network status monitoring
window.addEventListener('online', () => {
    if (window.chatBot) {
        window.chatBot.updateStatus('ready', 'Ready');
    }
});

window.addEventListener('offline', () => {
    if (window.chatBot) {
        window.chatBot.updateStatus('error', 'Offline');
    }
});

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatBot = new ChatBot();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to retry last message
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (window.chatBot && !window.chatBot.isLoading) {
            window.chatBot.retryLastMessage();
        }
    }
    
    // Ctrl/Cmd + K to clear conversation
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (window.chatBot && !window.chatBot.isLoading) {
            window.chatBot.clearConversation();
        }
    }
    
    // Ctrl/Cmd + S to toggle streaming
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (window.chatBot) {
            window.chatBot.toggleStreaming();
        }
    }
    
    // Escape to focus input
    if (e.key === 'Escape') {
        if (window.chatBot) {
            window.chatBot.messageInput.focus();
        }
    }
});
