const { ipcRenderer } = require('electron');

let activeProviders = new Set();
let hasGeminiKey = false;

// Initialize on load
window.addEventListener('DOMContentLoaded', async () => {
    await checkAPIKeys();
    setupEventListeners();
});

async function checkAPIKeys() {
    const keyData = await ipcRenderer.invoke('get-api-keys');
    
    // Check for Gemini key for delta analysis
    hasGeminiKey = keyData.gemini;
    
    // Update UI based on API key availability
    ['chatgpt', 'claude', 'gemini'].forEach(provider => {
        const column = document.getElementById(`${provider}-column`);
        const status = document.getElementById(`${provider}-status`);
        const hasKey = keyData[provider];
        
        if (hasKey) {
            column.classList.remove('disabled');
            status.classList.add('active');
            activeProviders.add(provider);
        } else {
            column.classList.add('disabled');
            status.classList.remove('active');
        }
    });
    
    // Update send button state
    const sendButton = document.getElementById('send-button');
    sendButton.disabled = activeProviders.size === 0;
    
    if (activeProviders.size === 0) {
        showNotification('No API keys found. Supported environment variables:\n' +
            'ChatGPT: OPENAI_API_KEY, CHATGPT_API_KEY, GPT_API_KEY, OPENAI_KEY\n' +
            'Claude: ANTHROPIC_API_KEY, CLAUDE_API_KEY, ANTHROPIC_KEY, CLAUDE_KEY\n' +
            'Gemini: GOOGLE_API_KEY, GEMINI_API_KEY, GOOGLE_GEMINI_KEY, GEMINI_KEY');
    }
}

function setupEventListeners() {
    const promptInput = document.getElementById('prompt-input');
    const sendButton = document.getElementById('send-button');
    
    sendButton.addEventListener('click', sendPrompt);
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendPrompt();
        }
    });
}

async function sendPrompt() {
    const promptInput = document.getElementById('prompt-input');
    const prompt = promptInput.value.trim();
    
    if (!prompt) return;
    
    const sendButton = document.getElementById('send-button');
    sendButton.disabled = true;
    
    // Add user message to all active columns
    activeProviders.forEach(provider => {
        addMessage(provider, prompt, 'user');
        setLoadingState(provider, true);
    });
    
    // Clear input
    promptInput.value = '';
    
    // Collect responses
    const responses = {};
    const promises = [];
    
    for (const provider of activeProviders) {
        promises.push(
            sendToProvider(provider, prompt)
                .then(response => {
                    responses[provider] = response;
                    addMessage(provider, response, 'assistant');
                    setLoadingState(provider, false);
                })
                .catch(error => {
                    console.error(`Error with ${provider}:`, error);
                    addMessage(provider, `Error: ${error.message}`, 'error');
                    setLoadingState(provider, false);
                })
        );
    }
    
    // Wait for all responses
    await Promise.allSettled(promises);
    
    // Analyze delta if we have Gemini API key and multiple responses
    if (hasGeminiKey && Object.keys(responses).length > 1) {
        await analyzeDelta(responses);
    }
    
    sendButton.disabled = false;
}

async function sendToProvider(provider, prompt) {
    try {
        const response = await ipcRenderer.invoke('send-to-ai', {
            provider,
            prompt
        });
        return response;
    } catch (error) {
        throw new Error(`Failed to get response from ${provider}: ${error.message}`);
    }
}

async function analyzeDelta(responses) {
    const deltaContent = document.getElementById('delta-content');
    const deltaIndicator = document.querySelector('.delta-indicator');
    
    // Clear previous content and show loading
    deltaContent.innerHTML = '<div class="empty-state">Analyzing differences...</div>';
    deltaIndicator.classList.add('active');
    
    try {
        const analysis = await ipcRenderer.invoke('analyze-delta', {
            responses
        });
        
        deltaContent.innerHTML = `<div class="message">${formatResponse(analysis)}</div>`;
    } catch (error) {
        deltaContent.innerHTML = `<div class="message error">Failed to analyze differences: ${error.message}</div>`;
    } finally {
        setTimeout(() => {
            deltaIndicator.classList.remove('active');
        }, 500);
    }
}

function addMessage(provider, content, type) {
    const contentDiv = document.getElementById(`${provider}-content`);
    
    // Remove empty state if present
    const emptyState = contentDiv.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = formatResponse(content);
    contentDiv.appendChild(messageDiv);
    
    // Scroll to bottom
    contentDiv.scrollTop = contentDiv.scrollHeight;
}

function setLoadingState(provider, isLoading) {
    const status = document.getElementById(`${provider}-status`);
    if (isLoading) {
        status.classList.add('loading');
    } else {
        status.classList.remove('loading');
    }
}

function formatResponse(text) {
    // Convert markdown-like formatting to HTML
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

function showNotification(message) {
    // You could implement a toast notification here
    console.log(message);
    const deltaContent = document.getElementById('delta-content');
    deltaContent.innerHTML = `<div class="message error">${message}</div>`;
}