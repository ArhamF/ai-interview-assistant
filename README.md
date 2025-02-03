# Ai Interview Assistant

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Detailed File Descriptions](#detailed-file-descriptions)
6. [Installation](#installation)
7. [Usage](#usage)
8. [How It Works](#how-it-works)
9. [Future Development](#future-development)
10. [Contributing](#contributing)
11. [License](#license)

## Introduction

The **AI Interview Assistant** is a modern web application designed to help users practice and improve their interviewing skills. By leveraging real-time speech recognition and AI-powered responses, it provides an interactive platform for interview preparation with immediate feedback and support.

## Features

- Real-time speech recognition and transcription
- AI-powered interview responses
- Modern, responsive UI with dark mode support
- Live text overlay for presentation mode
- Seamless audio recording controls
- Split-screen interface showing both questions and responses

## Technology Stack

- **Frontend:**
  - `Next.js` and `React.js` for the UI framework
  - `Tailwind CSS` for styling
  - `Lucide React` for icons
  - `TypeScript` for type safety
- **Audio Processing:**
  - Web Speech API for speech recognition
  - `soundcard` and `soundfile` for audio recording
- **AI Integration:**
  - Now can use any GPT model, or any Ollama supported AI models locally
  - Whisper API for audio transcription
- **Additional Tools:**
  - `PySimpleGUI` for alternative desktop interface
  - `loguru` for logging

## Project Structure

```
Ai Interview/
│   ├── components/
│   │   └── TextOverlay.tsx
│   ├── app/
│   │   |   ├── api/
│   │   |   └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── src/
│       ├── audio.py
│       ├── constrants.py
│       ├── llm.py
│       └── simple_ui.py
```

## Detailed File Descriptions

### `page.tsx`
The main React component that implements the interview interface. Features:
- Real-time speech recognition using Web Speech API
- Split-screen layout with recording and response sections
- Modern UI with gradient backgrounds and glass-morphism effects
- Toggle-able text overlay for presentation mode

### `TextOverlay.tsx`
A React component that displays AI responses in an overlay format:
- Cycles through response sentences
- Configurable display duration
- Smooth fade transitions
- Full-screen overlay with semi-transparent background

### `audio.py`
Handles audio recording functionality:
- Microphone input capture using `soundcard`
- Configurable recording duration
- Audio file saving capabilities
- Sample rate management

### `llm.py`
Manages AI interaction and response generation:
- OpenAI API integration
- Customizable system prompts
- Audio transcription using Whisper
- Response length control (short/long formats)

### `simple_ui.py`
Provides an alternative desktop interface using PySimpleGUI:
- Dark theme matching the web interface
- Real-time recording status
- Split-panel layout
- Integrated AI response display

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-interview-assistant
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Usage

### Web Interface
1. Start the Next.js development server:
```bash
npm run dev
```

2. Open `http://localhost:3000` in your browser
3. Click the microphone button to start recording
4. Speak your interview question
5. View the AI-generated response in real-time

### Desktop Interface
1. Run the Python application:
```bash
python src/python/simple_ui.py
```

2. Use the microphone button to control recording
3. View transcriptions and responses in the interface

## How It Works

1. **Speech Recognition:**
   - Uses Web Speech API for real-time transcription
   - Continuous recording with interim results
   - Error handling and reconnection logic

2. **AI Processing:**
   - Transcribes audio using OpenAI's Whisper API
   - Generates contextual responses using a vareity of different AI models that can be selected
   - Supports both concise and detailed response modes

3. **User Interface:**
   - Real-time updates with typing animation
   - Responsive design for all screen sizes
   - Optional full-screen presentation mode

## Future Development

1. **Enhanced AI Features:**
   - Multiple interview personality types
   - Custom prompt templates
   - Response style configuration

2. **UI Improvements:**
   - More customization options
   - Additional themes
   - Keyboard shortcuts

3. **Audio Processing:**
   - Background noise reduction
   - Voice clarity enhancement
   - Multiple audio input support

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.
