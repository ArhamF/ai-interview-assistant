'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff } from 'lucide-react'

export default function InterviewAssistant() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:3000')

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.transcription) {
        setTranscription(data.transcription)
      }
      if (data.aiResponse) {
        setAiResponse(data.aiResponse)
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data)
        }
      }

      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Interview Session</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Transcription:</h2>
          <p className="bg-gray-100 p-4 rounded">{transcription || 'Start speaking to see transcription...'}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">AI Response:</h2>
          <p className="bg-gray-100 p-4 rounded">{aiResponse || 'AI response will appear here...'}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
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

