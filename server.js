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
const io = new Server(server);

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

io.on('connection', (socket) => {
  console.log('A user connected');

  let audioBuffer = Buffer.alloc(0);

  socket.on('audio', async (data) => {
    audioBuffer = Buffer.concat([audioBuffer, data]);

    // Check if we have received enough audio data (e.g., 5 seconds)
    if (audioBuffer.length >= 160000) { // Assuming 16kHz, 16-bit audio
      try {
        // Transcribe audio
        const audioStream = Readable.from(audioBuffer);
        const transcription = await whisper.transcribe(audioStream);

        console.log('Transcription:', transcription);

        // Generate AI response
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are an AI interview assistant. Provide concise and helpful answers to interview questions." },
            { role: "user", content: transcription }
          ],
        });

        const aiResponse = completion.choices[0].message.content;

        // Send response back to client
        socket.emit('response', { transcription, aiResponse });

        // Clear the audio buffer
        audioBuffer = Buffer.alloc(0);
      } catch (error) {
        console.error('Error processing audio:', error);
        socket.emit('error', { message: 'Error processing audio' });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Test the server
console.log("AI Interview Assistant server is running. Connect a client to start an interview.");

