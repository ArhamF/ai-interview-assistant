import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import OpenAI from 'openai';
import { Readable } from 'stream';
import { Whisper } from 'whisper-node';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize OpenAI with error handling
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Error initializing OpenAI:', error.message);
  process.exit(1);
}

// Initialize Whisper with improved settings
const whisper = new Whisper({
  modelName: 'base',
  whisperOptions: {
    language: 'en',
    task: 'transcribe',
    beam_size: 5,
    best_of: 5,
  },
});

// Buffer configuration
const BUFFER_SIZE = 64000; // Reduced buffer size for faster processing
const MAX_SILENCE_DURATION = 2000; // 2 seconds of silence before processing

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  let audioBuffer = Buffer.alloc(0);
  let lastAudioTime = Date.now();
  let processingLock = false;

  socket.on('audioData', async (data) => {
    const currentTime = Date.now();
    lastAudioTime = currentTime;
    
    // Add new audio data to buffer
    audioBuffer = Buffer.concat([audioBuffer, Buffer.from(data)]);

    // Process audio if buffer is large enough and not currently processing
    if (audioBuffer.length >= BUFFER_SIZE && !processingLock) {
      processingLock = true;
      
      try {
        // Create audio stream
        const audioStream = Readable.from(audioBuffer);
        
        // Transcribe audio
        console.log('Starting transcription...');
        const transcription = await whisper.transcribe(audioStream);
        console.log('Transcription completed:', transcription);

        if (transcription && transcription.trim()) {
          // Generate AI response
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are an AI interview assistant. You help candidates during technical interviews.
                         For coding questions, you should explain your thought process and type out the code step by step.
                         Keep responses concise but thorough. If you need to write code, explain each step as you write it.`
              },
              { role: "user", content: transcription }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          });

          const aiResponse = completion.choices[0].message.content;

          // Send response back to client
          socket.emit('interviewResponse', {
            transcription,
            aiResponse,
            timestamp: Date.now()
          });
        }

        // Clear buffer after processing
        audioBuffer = Buffer.alloc(0);
      } catch (error) {
        console.error('Error processing audio:', error);
        socket.emit('error', {
          message: 'Error processing audio',
          details: error.message
        });
      } finally {
        processingLock = false;
      }
    }
  });

  // Check for silence and process remaining audio
  const silenceCheck = setInterval(() => {
    const timeSinceLastAudio = Date.now() - lastAudioTime;
    if (timeSinceLastAudio >= MAX_SILENCE_DURATION && audioBuffer.length > 0 && !processingLock) {
      socket.emit('processingAudio');
      // Process remaining audio in buffer
      socket.emit('audioData', audioBuffer);
    }
  }, 1000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(silenceCheck);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

