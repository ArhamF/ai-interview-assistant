import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import OpenAI from 'openai';
import { Readable } from 'stream';
import { Whisper } from 'whisper-node';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Error initializing OpenAI:', error.message);
  process.exit(1);
}

const whisper = new Whisper({
  modelName: 'base',
  whisperOptions: {
    language: 'en',
  },
});

const BUFFER_SIZE = 64000; // Reduced buffer size for faster processing

wss.on('connection', (ws) => {
  console.log('Client connected');
  let audioBuffer = Buffer.alloc(0);

  ws.on('message', async (data) => {
    audioBuffer = Buffer.concat([audioBuffer, data]);
    console.log(`Received audio data. Buffer size: ${audioBuffer.length}`);

    if (audioBuffer.length >= BUFFER_SIZE) {
      try {
        console.log('Processing audio...');
        const audioStream = Readable.from(audioBuffer);
        
        // Save audio buffer to file for debugging
        const filename = `debug_audio_${Date.now()}.webm`;
        fs.writeFileSync(filename, audioBuffer);
        console.log(`Saved debug audio to ${filename}`);

        console.log('Starting transcription...');
        const transcription = await whisper.transcribe(audioStream);
        console.log('Transcription completed:', transcription);

        if (transcription && transcription.trim()) {
          console.log('Generating AI response...');
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are an AI interview assistant. Provide concise and helpful answers to interview questions."
              },
              { role: "user", content: transcription }
            ],
            temperature: 0.7,
            max_tokens: 150,
          });

          const aiResponse = completion.choices[0].message.content;
          console.log('AI response generated:', aiResponse);

          ws.send(JSON.stringify({
            transcription,
            aiResponse,
            timestamp: Date.now()
          }));
        } else {
          console.log('No transcription generated from audio');
          ws.send(JSON.stringify({
            error: 'No speech detected in audio',
            details: 'Please speak clearly and try again'
          }));
        }

        audioBuffer = Buffer.alloc(0);
      } catch (error) {
        console.error('Error processing audio:', error);
        ws.send(JSON.stringify({
          error: 'Error processing audio',
          details: error.message
        }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("AI Interview Assistant server is running. Connect a client to start an interview.");

