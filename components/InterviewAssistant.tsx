'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, MicOff } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface AudioDevice {
  deviceId: string;
  label: string;
}

export default function InterviewAssistant() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:3000')

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');
      toast.success('Connected to server');
    };

    socketRef.current.onmessage = (event) => {
      console.log('Received message from server:', event.data);
      try {
        const data = JSON.parse(event.data)
        if (data.error) {
          setError(data.error);
          toast.error(data.error);
        } else {
          if (data.transcription) {
            console.log('Received transcription:', data.transcription);
            setTranscription(data.transcription)
          }
          if (data.aiResponse) {
            console.log('Received AI response:', data.aiResponse);
            setAiResponse(data.aiResponse)
          }
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error parsing server message:', error);
        toast.error('Error processing server response');
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Error connecting to server');
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      toast.error('Disconnected from server');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputs.map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${audioInputs.indexOf(device) + 1}`
        })));
        if (audioInputs.length > 0) {
          setSelectedDevice(audioInputs[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing audio devices:', error);
        toast.error('Error accessing audio devices. Please check your microphone permissions.');
      }
    };

    getAudioDevices();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          console.log('Sending audio data, size:', event.data.size);
          socketRef.current.send(event.data);
        }
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setIsProcessing(true);
      setError(null);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error(`Error accessing microphone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      streamRef.current?.getTracks().forEach(track => track.stop());
      toast.success('Recording stopped');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Interview Session
          {isProcessing && <span className="animate-pulse">Processing...</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Select Microphone:</h2>
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a microphone" />
            </SelectTrigger>
            <SelectContent>
              {audioDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Status:</h2>
          <p className="bg-gray-100 p-4 rounded">
            {isRecording ? 'Recording...' : 'Not recording'}
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold mb-2">Transcription:</h2>
          <p className="bg-gray-100 p-4 rounded min-h-[100px]">
            {transcription || 'Start speaking to see transcription...'}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">AI Response:</h2>
          <p className="bg-gray-100 p-4 rounded min-h-[100px] whitespace-pre-wrap">
            {aiResponse || 'AI response will appear here...'}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={isProcessing || !selectedDevice}
        >
          {isRecording ? (
            <>
              <MicOff className="mr-2 h-4 w-4" /> Stop Recording
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" /> Start Recording
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

