const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Configuration, OpenAIApi } = require('openai');
const { Readable } = require('stream');
const { Whisper } = require('whisper-node');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

const whisper = new Whisper({
  modelName: 'base',
  whisperOptions: {
    language: 'en',
  },
});

wss.on('connection', (ws) => {
  console.log('Client connected');

  let audioBuffer = Buffer.alloc(0);

  ws.on('message', async (data) => {
    audioBuffer = Buffer.concat([audioBuffer, data]);

    if (audioBuffer.length >= 160000) {
      try {
        const audioStream = Readable.from(audioBuffer);
        const transcription = await whisper.transcribe(audioStream);

        console.log('Transcription:', transcription);

        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are an AI interview assistant. Provide concise and helpful answers to interview questions." },
            { role: "user", content: transcription }
          ],
        });

        const aiResponse = completion.data.choices[0].message.content;

        ws.send(JSON.stringify({ transcription, aiResponse }));

        audioBuffer = Buffer.alloc(0);
      } catch (error) {
        console.error('Error processing audio:', error);
        ws.send(JSON.stringify({ error: 'Error processing audio' }));
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

