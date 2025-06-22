// Chat.js - Enhanced chat functionality for Ollama Chatbot

class ChatBot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.querySelector('input[name="message"]');
        this.sendButton = document.querySelector('button[type="submit"]');
        this.form = document.querySelector('form');
        this.isTyping = false;
        this.sessionId = 'default';
        this.messageHistory = [];
        this.historyIndex = -1;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.initializeEventListeners();
        this.scrollToBottom();
        this.checkOllamaStatus();
        this.initializeTheme();
    }
    
    initializeEventListeners() {
        // Handle Enter key press (but not Shift+Enter for multi-line)
        if (this.messageInput) {
            this.messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateHistory(-1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateHistory(1);
                } else if (e.key === 'Escape') {
                    this.clearInput();
                }
            });
            
            // Auto-resize textarea
            this.messageInput.addEventListener('input', () => {
                this.autoResizeTextarea();
                this.updateCharacterCount();
            });
            
            // Save to message history when user types
            this.messageInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    this.saveToHistory(this.messageInput.value.trim());
                }
            });
        }
        
        // Handle form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }
        
        // Handle send button click
        if (this.sendButton) {
            this.sendButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.clearChat();
                        break;
                    case 'l':
                        e.preventDefault();
                        this.focusInput();
                        break;
                    case 's':
                        e.preventDefault();
                        this.exportChat();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.showSearchDialog();
                        break;
                    case 'i':
                        e.preventDefault();
                        this.getChatStats();
                        break;
                    case 't':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                }
            } else if (e.key === 'Escape') {
                this.clearSearchHighlights();
            }
        });
    }
    
    // Show search dialog
    showSearchDialog() {
        const query = prompt('Search messages:');
        if (query && query.trim()) {
            this.searchMessages(query.trim());
        }
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Save to history
        this.saveToHistory(message);
        
        // Show user message immediately
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.updateCharacterCount();
        this.setTyping(true);
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    model: this.getCurrentModel()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.addMessage(data.message, 'assistant', data.model);
                this.retryCount = 0; // Reset retry count on success
                this.showNotification('Message sent successfully', 'success', 2000);
            } else {
                this.addMessage(data.error || 'An error occurred', 'error');
                this.handleRetry(message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('Sorry, I encountered an error. Please check if Ollama is running locally on port 11434.', 'error');
            this.handleRetry(message);
        } finally {
            this.setTyping(false);
            this.messageInput.focus();
        }
    }
    
    addMessage(content, role, model = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `mb-3 d-flex ${role === 'user' ? 'justify-content-end' : 'justify-content-start'}`;
        
        const bubbleClass = role === 'user' 
            ? 'bg-primary text-white p-3 rounded-start rounded-bottom max-width-70'
            : role === 'error'
            ? 'bg-danger text-white p-3 rounded max-width-70'
            : 'bg-light p-3 rounded-end rounded-bottom max-width-70';
        
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let messageHTML = `<div class="${bubbleClass} chat-message" style="animation: slideIn 0.3s ease-in-out;">`;
        
        if (role === 'assistant') {
            messageHTML += `
                <div class="small text-muted mb-1">
                    <i class="fas fa-robot me-1"></i>
                    Assistant ${model ? `<span class="model-badge">${model}</span>` : ''}
                </div>
            `;
        } else if (role === 'user') {
            messageHTML += `
                <div class="small text-light mb-1">
                    <i class="fas fa-user me-1"></i>
                    You
                </div>
            `;
        } else if (role === 'error') {
            messageHTML += `
                <div class="small text-light mb-1">
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    Error
                </div>
            `;
        }
        
        messageHTML += `
                <div>${this.formatMessage(content)}</div>
                <div class="small mt-1 opacity-75">
                    ${timestamp}
                    ${role === 'assistant' ? '<button class="btn btn-sm btn-outline-secondary ms-2 copy-btn" onclick="copyToClipboard(this)" title="Copy message"><i class="fas fa-copy"></i></button>' : ''}
                </div>
            </div>
        `;
        
        messageDiv.innerHTML = messageHTML;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Add copy functionality for assistant messages
        if (role === 'assistant') {
            const copyBtn = messageDiv.querySelector('.copy-btn');
            if (copyBtn) {
                copyBtn.onclick = () => this.copyMessageToClipboard(content);
            }
        }
    }
    
    formatMessage(content) {
        // Basic formatting for code blocks and links
        let formatted = this.escapeHtml(content);
        
        // Format code blocks (```code```)
        formatted = formatted.replace(/```([^`]+)```/g, '<pre class="bg-dark text-light p-2 rounded mt-1"><code>$1</code></pre>');
        
        // Format inline code (`code`)
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-light px-1 rounded">$1</code>');
        
        // Format URLs
        formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Format bold text (**text**)
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Format italic text (*text*)
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Format line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
    
    // Message history navigation
    saveToHistory(message) {
        if (message && !this.messageHistory.includes(message)) {
            this.messageHistory.unshift(message);
            if (this.messageHistory.length > 50) {
                this.messageHistory.pop();
            }
        }
        this.historyIndex = -1;
    }
    
    navigateHistory(direction) {
        if (this.messageHistory.length === 0) return;
        
        this.historyIndex += direction;
        
        if (this.historyIndex < -1) {
            this.historyIndex = -1;
        } else if (this.historyIndex >= this.messageHistory.length) {
            this.historyIndex = this.messageHistory.length - 1;
        }
        
        if (this.historyIndex === -1) {
            this.messageInput.value = '';
        } else {
            this.messageInput.value = this.messageHistory[this.historyIndex];
        }
        
        this.autoResizeTextarea();
    }
    
    // Copy message to clipboard
    copyMessageToClipboard(content) {
        const textToCopy = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
        navigator.clipboard.writeText(textToCopy).then(() => {
            this.showNotification('Message copied to clipboard!', 'success', 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            this.showNotification('Failed to copy message', 'error', 2000);
        });
    }
    
    // Clear input
    clearInput() {
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.updateCharacterCount();
    }
    
    // Update character count
    updateCharacterCount() {
        const count = this.messageInput.value.length;
        let countElement = document.getElementById('char-count');
        if (!countElement) {
            countElement = document.createElement('small');
            countElement.id = 'char-count';
            countElement.className = 'text-muted position-absolute';
            countElement.style.cssText = 'bottom: 5px; right: 50px; font-size: 0.75rem;';
            this.messageInput.parentElement.style.position = 'relative';
            this.messageInput.parentElement.appendChild(countElement);
        }
        countElement.textContent = `${count}/2000`;
        countElement.className = count > 1800 ? 'text-warning' : count > 2000 ? 'text-danger' : 'text-muted';
    }
    
    // Retry mechanism
    handleRetry(message) {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.showRetryOption(message);
        } else {
            this.showNotification('Maximum retry attempts reached. Please check your connection.', 'error');
            this.retryCount = 0;
        }
    }
    
    showRetryOption(message) {
        const retryDiv = document.createElement('div');
        retryDiv.className = 'mb-3 d-flex justify-content-center';
        retryDiv.innerHTML = `
            <div class="alert alert-warning d-inline-flex align-items-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Message failed to send. 
                <button class="btn btn-sm btn-warning ms-2" onclick="window.chatBot.retryMessage('${message.replace(/'/g, "\\'")}')">
                    <i class="fas fa-redo me-1"></i>Retry (${this.retryCount}/${this.maxRetries})
                </button>
            </div>
        `;
        this.chatMessages.appendChild(retryDiv);
        this.scrollToBottom();
        
        // Auto-remove retry option after 30 seconds
        setTimeout(() => {
            if (retryDiv.parentElement) {
                retryDiv.remove();
            }
        }, 30000);
    }
    
    async retryMessage(message) {
        // Remove all retry options
        document.querySelectorAll('.alert-warning').forEach(el => el.parentElement?.remove());
        
        // Resend the message
        this.setTyping(true);
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    model: this.getCurrentModel()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.addMessage(data.message, 'assistant', data.model);
                this.retryCount = 0;
                this.showNotification('Message sent successfully!', 'success', 2000);
            } else {
                this.addMessage(data.error || 'Retry failed', 'error');
                this.handleRetry(message);
            }
        } catch (error) {
            console.error('Retry error:', error);
            this.addMessage('Retry failed. Please check your connection.', 'error');
            this.handleRetry(message);
        } finally {
            this.setTyping(false);
        }
    }
    
    // Theme management
    initializeTheme() {
        const savedTheme = localStorage.getItem('chatbot-theme') || 'light';
        this.setTheme(savedTheme);
    }
    
    setTheme(theme) {
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
        localStorage.setItem('chatbot-theme', theme);
    }
    
    toggleTheme() {
        const currentTheme = localStorage.getItem('chatbot-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        this.showNotification(`Switched to ${newTheme} theme`, 'info', 2000);
        
        // Update button icon
        if (typeof updateThemeIcon === 'function') {
            updateThemeIcon();
        }
    }
    
    // Advanced search functionality
    searchMessages(query) {
        const messages = this.chatMessages.querySelectorAll('.chat-message');
        let found = 0;
        
        messages.forEach(message => {
            const text = message.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                message.style.backgroundColor = '#fff3cd';
                message.style.border = '2px solid #ffc107';
                found++;
            } else {
                message.style.backgroundColor = '';
                message.style.border = '';
            }
        });
        
        this.showNotification(`Found ${found} message(s) containing "${query}"`, found > 0 ? 'success' : 'info');
        return found;
    }
    
    // Clear search highlights
    clearSearchHighlights() {
        const messages = this.chatMessages.querySelectorAll('.chat-message');
        messages.forEach(message => {
            message.style.backgroundColor = '';
            message.style.border = '';
        });
    }
    
    // Get chat statistics
    getChatStats() {
        const messages = this.chatMessages.querySelectorAll('.chat-message');
        const userMessages = this.chatMessages.querySelectorAll('.justify-content-end').length;
        const assistantMessages = this.chatMessages.querySelectorAll('.justify-content-start').length;
        
        const stats = {
            total: messages.length,
            user: userMessages,
            assistant: assistantMessages,
            sessionStart: localStorage.getItem('session-start') || 'Unknown'
        };
        
        this.showNotification(
            `Chat Stats: ${stats.total} total messages (${stats.user} sent, ${stats.assistant} received)`, 
            'info', 
            5000
        );
        
        return stats;
    }
    
    // Focus input with visual feedback
    focusInput() {
        if (this.messageInput) {
            this.messageInput.focus();
            this.messageInput.style.boxShadow = '0 0 0 0.3rem rgba(0, 123, 255, 0.5)';
            setTimeout(() => {
                this.messageInput.style.boxShadow = '';
            }, 1000);
        }
    }
    
    setTyping(typing) {
        this.isTyping = typing;
        
        if (typing) {
            this.sendButton.disabled = true;
            this.sendButton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Thinking...';
            this.showTypingIndicator();
        } else {
            this.sendButton.disabled = false;
            this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
            this.hideTypingIndicator();
        }
    }
    
    showTypingIndicator() {
        if (document.getElementById('typing-indicator')) return; // Already showing
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'mb-3 d-flex justify-content-start';
        typingDiv.innerHTML = `
            <div class="bg-light p-3 rounded-end rounded-bottom" style="animation: slideIn 0.3s ease-in-out;">
                <div class="small text-muted mb-1">
                    <i class="fas fa-robot me-1"></i>
                    Assistant is typing...
                </div>
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    autoResizeTextarea() {
        if (this.messageInput) {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        }
    }
    
    getCurrentModel() {
        const modelSelect = document.querySelector('select[name="model"]');
        const modelInput = document.querySelector('input[name="model"]');
        
        if (modelSelect) {
            return modelSelect.value;
        } else if (modelInput) {
            return modelInput.value;
        } else {
            return 'tinyllama'; // fallback to configured default
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async checkOllamaStatus() {
        try {
            const response = await fetch('/health');
            if (response.ok) {
                this.showStatusIndicator('online', 'Ollama is connected');
            } else {
                this.showStatusIndicator('offline', 'Service unavailable');
            }
        } catch (error) {
            this.showStatusIndicator('offline', 'Cannot connect to Ollama');
        }
    }
    
    showStatusIndicator(status, message) {
        const statusElement = document.getElementById('status-indicator');
        if (statusElement) {
            statusElement.className = `status-indicator status-${status}`;
            statusElement.title = message;
        }
    }
    
    async loadChatHistory() {
        try {
            const response = await fetch(`/api/chat/history?sessionId=${this.sessionId}`);
            if (response.ok) {
                const history = await response.json();
                this.chatMessages.innerHTML = '';
                
                history.forEach(message => {
                    this.addMessage(message.content, message.role, message.model);
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
    
    // Enhanced notification system
    showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 1050;
            min-width: 300px;
            animation: slideInRight 0.3s ease-in-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.innerHTML = `
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after specified duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-in-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
    
    // Clear chat with confirmation
    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            fetch(`/api/chat/history?sessionId=${this.sessionId}`, { method: 'DELETE' })
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                    this.showNotification('Chat history cleared', 'success');
                    setTimeout(() => location.reload(), 1000);
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.showNotification('Error clearing chat history', 'error');
                });
        }
    }
    
    // Export chat functionality
    exportChat() {
        fetch(`/api/chat/history?sessionId=${this.sessionId}`)
            .then(response => response.json())
            .then(history => {
                const chatText = history.map(msg => 
                    `[${msg.timestamp}] ${msg.role}: ${msg.content}`
                ).join('\n\n');
                
                const blob = new Blob([chatText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification('Chat exported successfully', 'success');
            })
            .catch(error => {
                console.error('Error exporting chat:', error);
                this.showNotification('Error exporting chat', 'error');
            });
    }
}

// Global functions for template usage
function clearChat() {
    if (window.chatBot) {
        window.chatBot.clearChat();
    }
}

function checkHealth() {
    fetch('/health')
        .then(response => response.text())
        .then(data => {
            if (window.chatBot) {
                window.chatBot.showNotification('✅ ' + data, 'success');
            }
        })
        .catch(error => {
            if (window.chatBot) {
                window.chatBot.showNotification('❌ Service unavailable', 'error');
            }
            console.error('Error:', error);
        });
}

function exportChat() {
    if (window.chatBot) {
        window.chatBot.exportChat();
    }
}

function toggleTheme() {
    if (window.chatBot) {
        window.chatBot.toggleTheme();
    }
}

function showChatStats() {
    if (window.chatBot) {
        window.chatBot.getChatStats();
    }
}

function searchChat() {
    if (window.chatBot) {
        window.chatBot.showSearchDialog();
    }
}

function copyToClipboard(button) {
    const messageDiv = button.closest('.chat-message');
    const textContent = messageDiv.querySelector('div:not(.small)').textContent;
    
    navigator.clipboard.writeText(textContent).then(() => {
        if (window.chatBot) {
            window.chatBot.showNotification('Message copied to clipboard!', 'success', 2000);
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
        if (window.chatBot) {
            window.chatBot.showNotification('Failed to copy message', 'error', 2000);
        }
    });
}

// Legacy functions for backward compatibility
function showNotification(message, type = 'info') {
    if (window.chatBot) {
        window.chatBot.showNotification(message, type);
    } else {
        // Fallback for when ChatBot isn't initialized
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the chatbot only if we're on the chat page
    if (document.getElementById('chatMessages')) {
        window.chatBot = new ChatBot();
        
        // Update theme toggle button icon based on current theme
        updateThemeIcon();
        
        // Add welcome message for first-time users
        if (!localStorage.getItem('chatbot-visited')) {
            setTimeout(() => {
                if (window.chatBot) {
                    window.chatBot.showNotification('Welcome! Press Ctrl+L to focus input, Ctrl+K to clear chat, or Ctrl+S to export.', 'info', 8000);
                    localStorage.setItem('chatbot-visited', 'true');
                }
            }, 2000);
        }
    }
});

// Update theme toggle button icon
function updateThemeIcon() {
    const themeBtn = document.querySelector('button[onclick="toggleTheme()"] i');
    const isDark = document.body.classList.contains('dark-theme');
    if (themeBtn) {
        themeBtn.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Enhanced toggle theme function
function toggleTheme() {
    if (window.chatBot) {
        window.chatBot.toggleTheme();
        updateThemeIcon();
    }
}
    
    // Add CSS animations if not already present
    if (!document.getElementById('chat-animations')) {
        const style = document.createElement('style');
        style.id = 'chat-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(100%); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideOutRight {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100%); }
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
            .typing-indicator span {
                display: inline-block;
                background-color: #007bff;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin: 0 2px;
                animation: typing 1.4s infinite ease-in-out;
            }
            .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
            .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
            @keyframes typing {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
            .model-badge {
                background: linear-gradient(45deg, #17a2b8, #138496);
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 0.7rem;
                font-weight: 500;
                margin-left: 5px;
            }
            .status-indicator {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                display: inline-block;
                margin-left: 10px;
            }
            .status-online {
                background-color: #28a745;
                animation: pulse 2s infinite;
            }
            .status-offline {
                background-color: #dc3545;
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
                100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
            }
            .copy-btn {
                opacity: 0;
                transition: opacity 0.3s ease;
                font-size: 0.7rem;
                padding: 2px 6px;
            }
            .chat-message:hover .copy-btn {
                opacity: 1;
            }
            .max-width-70 {
                max-width: 70%;
                word-wrap: break-word;
            }
            /* Dark theme styles */
            .dark-theme {
                background-color: #1a1a1a;
                color: #e0e0e0;
            }
            .dark-theme .bg-light {
                background-color: #2d2d2d !important;
                color: #e0e0e0 !important;
            }
            .dark-theme .text-muted {
                color: #b0b0b0 !important;
            }
            .dark-theme .border-top {
                border-color: #444 !important;
            }
            .dark-theme .form-control {
                background-color: #2d2d2d;
                border-color: #444;
                color: #e0e0e0;
            }
            .dark-theme .form-control:focus {
                background-color: #2d2d2d;
                border-color: #007bff;
                color: #e0e0e0;
                box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            }
            .dark-theme .alert-warning {
                background-color: #664d03;
                border-color: #b8860b;
                color: #ffecb5;
            }
            /* Improved scrollbar for dark theme */
            .dark-theme ::-webkit-scrollbar {
                width: 8px;
            }
            .dark-theme ::-webkit-scrollbar-track {
                background: #2d2d2d;
            }
            .dark-theme ::-webkit-scrollbar-thumb {
                background: #555;
                border-radius: 4px;
            }
            .dark-theme ::-webkit-scrollbar-thumb:hover {
                background: #777;
            }
            /* Animation for theme transition */
            body {
                transition: background-color 0.3s ease, color 0.3s ease;
            }
            /* Enhanced message animations */
            .chat-message {
                transform: translateY(20px);
                opacity: 0;
                animation: messageAppear 0.4s ease-out forwards;
            }
            @keyframes messageAppear {
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            /* Focus states */
            .form-control:focus {
                box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
                border-color: #007bff;
            }
            /* Button hover effects */
            .btn {
                transition: all 0.2s ease;
            }
            .btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            /* Notification enhancements */
            .notification {
                border-left: 4px solid;
                backdrop-filter: blur(10px);
            }
            .alert-success {
                border-left-color: #28a745;
            }
            .alert-danger {
                border-left-color: #dc3545;
            }
            .alert-info {
                border-left-color: #17a2b8;
            }
        `;
        document.head.appendChild(style);
    }
});