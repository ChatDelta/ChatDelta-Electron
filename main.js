const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Set the application name
app.name = 'ChatDelta';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'ChatDelta',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Check for API keys in environment variables (flexible naming)
ipcMain.handle('get-api-keys', () => {
  // Check multiple possible env var names for each service
  const chatgptKey = process.env.OPENAI_API_KEY || 
                     process.env.CHATGPT_API_KEY || 
                     process.env.GPT_API_KEY ||
                     process.env.OPENAI_KEY;
  
  const claudeKey = process.env.ANTHROPIC_API_KEY || 
                    process.env.CLAUDE_API_KEY || 
                    process.env.ANTHROPIC_KEY ||
                    process.env.CLAUDE_KEY;
  
  const geminiKey = process.env.GOOGLE_API_KEY || 
                    process.env.GEMINI_API_KEY || 
                    process.env.GOOGLE_GEMINI_KEY ||
                    process.env.GEMINI_KEY;
  
  return {
    chatgpt: !!chatgptKey,
    claude: !!claudeKey,
    gemini: !!geminiKey,
    // Also return the actual keys for use in API calls
    keys: {
      chatgpt: chatgptKey,
      claude: claudeKey,
      gemini: geminiKey
    }
  };
});

// Handle API calls
ipcMain.handle('send-to-ai', async (event, { provider, prompt }) => {
  try {
    // Get the appropriate API key for the provider
    const chatgptKey = process.env.OPENAI_API_KEY || 
                       process.env.CHATGPT_API_KEY || 
                       process.env.GPT_API_KEY ||
                       process.env.OPENAI_KEY;
    
    const claudeKey = process.env.ANTHROPIC_API_KEY || 
                      process.env.CLAUDE_API_KEY || 
                      process.env.ANTHROPIC_KEY ||
                      process.env.CLAUDE_KEY;
    
    const geminiKey = process.env.GOOGLE_API_KEY || 
                      process.env.GEMINI_API_KEY || 
                      process.env.GOOGLE_GEMINI_KEY ||
                      process.env.GEMINI_KEY;
    
    switch (provider) {
      case 'chatgpt':
        return await sendToChatGPT(prompt, chatgptKey);
      case 'claude':
        return await sendToClaude(prompt, claudeKey);
      case 'gemini':
        return await sendToGemini(prompt, geminiKey);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error with ${provider}:`, error);
    throw error;
  }
});

// Handle delta analysis
ipcMain.handle('analyze-delta', async (event, { responses }) => {
  try {
    // Get Gemini API key with flexible naming
    const geminiKey = process.env.GOOGLE_API_KEY || 
                      process.env.GEMINI_API_KEY || 
                      process.env.GOOGLE_GEMINI_KEY ||
                      process.env.GEMINI_KEY;
    
    const prompt = `Analyze the differences between these AI responses and provide a succinct summary of their key differences:

ChatGPT: ${responses.chatgpt || 'No response'}

Claude: ${responses.claude || 'No response'}

Gemini: ${responses.gemini || 'No response'}

Please highlight the main differences in approach, content, style, and any unique insights each provided.`;

    return await sendToGemini(prompt, geminiKey);
  } catch (error) {
    console.error('Error analyzing delta:', error);
    throw error;
  }
});

// API implementation functions
async function sendToChatGPT(prompt, apiKey) {
  if (!apiKey) throw new Error('OpenAI API key not found');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function sendToClaude(prompt, apiKey) {
  if (!apiKey) throw new Error('Anthropic API key not found');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function sendToGemini(prompt, apiKey) {
  if (!apiKey) throw new Error('Google API key not found');
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Google API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  if (!data.candidates || !data.candidates[0]) {
    throw new Error('Invalid response from Gemini API');
  }
  return data.candidates[0].content.parts[0].text;
}