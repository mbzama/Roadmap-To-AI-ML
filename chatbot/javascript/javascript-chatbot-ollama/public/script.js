class ChatBot {
    constructor() {
        this.conversationId = this.generateId();
        this.isStreaming = true;
        this.isConnected = false;
        this.currentModel = 'Unknown';
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkStatus();
        this.adjustTextareaHeight();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    initializeElements() {
        this.elements = {
            chatMessages: document.getElementById('chatMessages'),
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            clearButton: document.getElementById('clearButton'),
            streamToggle: document.getElementById('streamToggle'),
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            currentModel: document.getElementById('currentModel'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            notification: document.getElementById('notification')
        };
    }

    attachEventListeners() {
        // Send message on button click
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());

        // Send message on Enter (but allow Shift+Enter for new lines)
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.elements.messageInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
            this.toggleSendButton();
        });

        // Clear conversation
        this.elements.clearButton.addEventListener('click', () => this.clearConversation());

        // Toggle streaming
        this.elements.streamToggle.addEventListener('click', () => this.toggleStreaming());

        // Enable send button when there's text
        this.elements.messageInput.addEventListener('input', () => this.toggleSendButton());
    }

    adjustTextareaHeight() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    toggleSendButton() {
        const hasText = this.elements.messageInput.value.trim().length > 0;
        this.elements.sendButton.disabled = !hasText || !this.isConnected;
    }

    async checkStatus() {
        try {
            const response = await fetch('/health');
            const data = await response.json();
            
            if (data.status === 'ok' && data.ollama === 'connected') {
                this.updateStatus('connected', 'Connected');
                this.isConnected = true;
                await this.loadModelInfo();
            } else {
                this.updateStatus('error', 'Ollama Disconnected');
                this.isConnected = false;
            }
        } catch (error) {
            console.error('Status check failed:', error);
            this.updateStatus('error', 'Server Error');
            this.isConnected = false;
        }
        
        this.toggleSendButton();
        
        // Check status every 30 seconds
        setTimeout(() => this.checkStatus(), 30000);
    }

    async loadModelInfo() {
        try {
            const response = await fetch('/api/chat/models');
            const data = await response.json();
            
            if (data.success && data.currentModel) {
                this.currentModel = data.currentModel;
                this.elements.currentModel.textContent = data.currentModel;
            }
        } catch (error) {
            console.error('Failed to load model info:', error);
        }
    }

    updateStatus(status, text) {
        this.elements.statusDot.className = `status-dot ${status}`;
        this.elements.statusText.textContent = text;
    }

    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message || !this.isConnected) return;

        // Clear input and disable send button
        this.elements.messageInput.value = '';
        this.adjustTextareaHeight();
        this.toggleSendButton();

        // Add user message to chat
        this.addMessage('user', message);

        // Remove welcome message if it exists
        const welcomeMessage = this.elements.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        try {
            if (this.isStreaming) {
                await this.sendStreamingMessage(message);
            } else {
                await this.sendRegularMessage(message);
            }
        } catch (error) {
            console.error('Send message error:', error);
            this.showNotification('error', 'Failed to send message: ' + error.message);
            this.removeTypingIndicator();
        }
    }

    async sendRegularMessage(message) {
        this.showTypingIndicator();

        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                conversationId: this.conversationId
            })
        });

        const data = await response.json();

        this.removeTypingIndicator();

        if (data.success) {
            this.addMessage('assistant', data.response);
        } else {
            throw new Error(data.message || 'Unknown error');
        }
    }

    async sendStreamingMessage(message) {
        this.showTypingIndicator();

        const response = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                conversationId: this.conversationId
            })
        });

        if (!response.ok) {
            throw new Error('Stream request failed');
        }

        this.removeTypingIndicator();

        const messageElement = this.addMessage('assistant', '');
        const contentElement = messageElement.querySelector('.message-content');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.type === 'chunk') {
                                contentElement.textContent += data.chunk;
                                this.scrollToBottom();
                            } else if (data.type === 'complete') {
                                // Stream completed
                                this.updateMessageTime(messageElement);
                            } else if (data.type === 'error') {
                                throw new Error(data.error);
                            }
                        } catch (e) {
                            // Ignore JSON parsing errors for incomplete chunks
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(new Date());

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        return messageDiv;
    }

    updateMessageTime(messageElement) {
        const timeElement = messageElement.querySelector('.message-time');
        if (timeElement) {
            timeElement.textContent = this.formatTime(new Date());
        }
    }

    showTypingIndicator() {
        this.removeTypingIndicator(); // Remove any existing indicator

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.id = 'typingIndicator';

        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';

        const typingText = document.createElement('span');
        typingText.textContent = 'AI is typing';

        const dotsDiv = document.createElement('div');
        dotsDiv.className = 'typing-dots';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            dotsDiv.appendChild(dot);
        }

        typingContent.appendChild(typingText);
        typingContent.appendChild(dotsDiv);
        typingDiv.appendChild(typingContent);

        this.elements.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    async clearConversation() {
        if (!confirm('Are you sure you want to clear the conversation?')) {
            return;
        }

        try {
            const response = await fetch(`/api/chat/history/${this.conversationId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Clear chat messages
                this.elements.chatMessages.innerHTML = `
                    <div class="welcome-message">
                        <div class="welcome-icon">
                            <i class="fas fa-comments"></i>
                        </div>
                        <h2>Welcome to Ollama Chatbot!</h2>
                        <p>I'm an AI assistant powered by Ollama. Feel free to ask me anything!</p>
                    </div>
                `;

                // Generate new conversation ID
                this.conversationId = this.generateId();

                this.showNotification('success', 'Conversation cleared');
            } else {
                throw new Error('Failed to clear conversation');
            }
        } catch (error) {
            console.error('Clear conversation error:', error);
            this.showNotification('error', 'Failed to clear conversation');
        }
    }

    toggleStreaming() {
        this.isStreaming = !this.isStreaming;
        
        const toggleButton = this.elements.streamToggle;
        const span = toggleButton.querySelector('span');
        
        if (this.isStreaming) {
            toggleButton.classList.add('active');
            span.textContent = 'Streaming: ON';
        } else {
            toggleButton.classList.remove('active');
            span.textContent = 'Streaming: OFF';
        }

        this.showNotification('info', `Streaming ${this.isStreaming ? 'enabled' : 'disabled'}`);
    }

    showNotification(type, message) {
        const notification = this.elements.notification;
        const icon = notification.querySelector('.notification-icon');
        const text = notification.querySelector('.notification-text');

        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        icon.className = `notification-icon ${icons[type]}`;
        text.textContent = message;
        notification.className = `notification ${type}`;

        // Show notification
        notification.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    showLoadingIndicator() {
        this.elements.loadingIndicator.style.display = 'flex';
    }

    hideLoadingIndicator() {
        this.elements.loadingIndicator.style.display = 'none';
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatBot = new ChatBot();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.chatBot) {
        // Check status when page becomes visible
        window.chatBot.checkStatus();
    }
});

// Handle online/offline events
window.addEventListener('online', () => {
    if (window.chatBot) {
        window.chatBot.checkStatus();
        window.chatBot.showNotification('info', 'Connection restored');
    }
});

window.addEventListener('offline', () => {
    if (window.chatBot) {
        window.chatBot.updateStatus('error', 'Offline');
        window.chatBot.isConnected = false;
        window.chatBot.toggleSendButton();
        window.chatBot.showNotification('error', 'Connection lost');
    }
});
