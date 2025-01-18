import React, { useState, useEffect, useRef } from 'react';

export default function InterviewAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:3000');

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.transcription) {
        setTranscription(data.transcription);
      }
      if (data.aiResponse) {
        setAiResponse(data.aiResponse);
      }
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data);
        }
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Transcription:</h2>
        <p className="bg-gray-100 p-4 rounded">{transcription || 'Start speaking to see transcription...'}</p>
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">AI Response:</h2>
        <p className="bg-gray-100 p-4 rounded">{aiResponse || 'AI response will appear here...'}</p>
      </div>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full py-2 px-4 rounded ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        } text-white font-bold`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
}
