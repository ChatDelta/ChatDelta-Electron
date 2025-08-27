# ChatDelta

Compare AI responses side-by-side with a beautiful neumorphic interface.

## Overview

ChatDelta is an Electron application that allows you to send prompts to multiple AI providers simultaneously (ChatGPT, Claude, and Gemini) and see their responses side-by-side. The app then uses Gemini to analyze and summarize the differences between the responses.

## Features

- **Multi-Provider Support**: Send prompts to ChatGPT, Claude, and Gemini simultaneously
- **Side-by-Side Comparison**: View all AI responses in parallel columns
- **Delta Analysis**: Automatic analysis of response differences using Gemini
- **Neumorphic Design**: Clean, modern interface with subtle depth and shadows
- **Flexible API Key Detection**: Supports multiple environment variable naming conventions
- **Real-time Status Indicators**: Visual feedback for API availability and loading states

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ChatDelta/ChatDelta-Electron.git
cd ChatDelta-Electron
```

2. Install dependencies:
```bash
npm install
```

3. Set up your API keys as environment variables (see Configuration below)

4. Start the application:
```bash
npm start
```

## Configuration

ChatDelta automatically detects API keys from environment variables. It supports multiple naming conventions for flexibility:

### ChatGPT (OpenAI)
- `OPENAI_API_KEY`
- `CHATGPT_API_KEY`
- `GPT_API_KEY`
- `OPENAI_KEY`

### Claude (Anthropic)
- `ANTHROPIC_API_KEY`
- `CLAUDE_API_KEY`
- `ANTHROPIC_KEY`
- `CLAUDE_KEY`

### Gemini (Google)
- `GOOGLE_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_GEMINI_KEY`
- `GEMINI_KEY`

Example setup:
```bash
export OPENAI_API_KEY="your-openai-key"
export CLAUDE_API_KEY="your-anthropic-key"
export GEMINI_API_KEY="your-google-key"
npm start
```

## How It Works

1. **API Detection**: On startup, ChatDelta checks for available API keys and enables the corresponding provider columns
2. **Prompt Distribution**: When you send a prompt, it's sent to all active providers simultaneously
3. **Response Display**: Each provider's response appears in its respective column
4. **Delta Analysis**: If multiple providers respond and Gemini is available, it analyzes the differences between responses
5. **Visual Feedback**: Loading states, status indicators, and error messages keep you informed

## Version History

### v1.0.0 (2024-08-27)
- Initial release
- Core functionality: multi-provider AI chat comparison
- Neumorphic UI design
- Flexible API key detection
- Delta analysis feature
- Support for ChatGPT (GPT-3.5), Claude (Haiku), and Gemini (1.5 Flash)

## Technical Stack

- **Framework**: Electron
- **Frontend**: HTML, CSS, JavaScript
- **IPC**: Electron IPC for main-renderer communication
- **APIs**: OpenAI, Anthropic, Google Gemini

## License

MIT License - see LICENSE file for details

## Author

David Liedle <david.liedle@protonmail.com>

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.