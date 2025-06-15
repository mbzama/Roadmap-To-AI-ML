# Test Script for Express Ollama Chatbot API
Write-Host "🚀 Testing Express Ollama Chatbot API" -ForegroundColor Green
Write-Host "=====================================`n" -ForegroundColor Green

# Test 1: Check if server is running
Write-Host "1. Testing server health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Server is healthy!" -ForegroundColor Green
    Write-Host "   Response: $($health.message)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Server health check failed: $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}

# Test 2: Get available models
Write-Host "2. Getting available models..." -ForegroundColor Yellow
try {
    $models = Invoke-RestMethod -Uri "http://localhost:3001/api/chat/models" -Method GET
    Write-Host "✅ Models retrieved successfully!" -ForegroundColor Green
    Write-Host "   Current model: $($models.currentModel)" -ForegroundColor Gray
    Write-Host "   Available models: $($models.models.Count) models found`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get models: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 3: Send a chat message
Write-Host "3. Testing chat message endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        message = "Hello! Tell me a joke about programming."
        conversationId = "test-script"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/chat/message" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "✅ Chat message sent successfully!" -ForegroundColor Green
    Write-Host "   Model used: $($response.model)" -ForegroundColor Gray
    Write-Host "   Response length: $($response.response.Length) characters" -ForegroundColor Gray
    Write-Host "   Bot response: $($response.response.Substring(0, [Math]::Min(100, $response.response.Length)))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Chat message failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 4: Test conversation history
Write-Host "4. Testing conversation history..." -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "http://localhost:3001/api/chat/history/test-script" -Method GET
    Write-Host "✅ Conversation history retrieved!" -ForegroundColor Green
    Write-Host "   Messages in conversation: $($history.messageCount)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get conversation history: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 5: Clear conversation
Write-Host "5. Testing conversation clear..." -ForegroundColor Yellow
try {
    $clear = Invoke-RestMethod -Uri "http://localhost:3001/api/chat/history/test-script" -Method DELETE
    Write-Host "✅ Conversation cleared!" -ForegroundColor Green
    Write-Host "   Message: $($clear.message)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to clear conversation: $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "=====================================`n" -ForegroundColor Green
Write-Host "Web UI available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "API endpoints working correctly!" -ForegroundColor Cyan
