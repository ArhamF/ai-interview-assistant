"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Code, Settings, Brain, Sparkles, Eye, EyeOff } from "lucide-react"
import { TextOverlay } from "@/components/TextOverlay"

// Add TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default function InterviewAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [response, setResponse] = useState("")
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const codeEditorRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if ((typeof window !== "undefined" && "SpeechRecognition" in window) || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        const results = Array.from(event.results)
        let finalTranscript = ''
        let interimTranscript = ''

        results.forEach(result => {
          // Add to final transcript if result is final
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        })

        // Update with final + interim results
        setCurrentQuestion(finalTranscript + interimTranscript)
      }

      recognitionRef.current.onend = () => {
        // Only restart if we're still supposed to be listening
        if (isListening) {
          recognitionRef.current?.start()
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        if (event.error === 'no-speech') {
          // Restart on no-speech error if we're still supposed to be listening
          if (isListening && recognitionRef.current) {
            recognitionRef.current.start()
          }
        } else {
          setIsListening(false)
        }
      }
    }
  }, [isListening]) // Add isListening to dependency array

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error("Error starting recognition:", error)
        // If already started, stop and restart
        if (error instanceof Error && error.message.includes('already started')) {
          recognitionRef.current.stop()
          setTimeout(() => {
            recognitionRef.current?.start()
            setIsListening(true)
          }, 100)
        }
      }
    } else {
      console.error("Speech recognition is not supported in this browser.")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const toggleOverlay = () => {
    setIsOverlayVisible(!isOverlayVisible)
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-blue-950 text-gray-100 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Interview Assistant
            </h1>
            <p className="text-xl text-gray-400">Real-time interview support powered by AI</p>
          </div>

          {/* Main interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left panel - Interview Recording */}
            <div className="space-y-6">
              <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-purple-300">Interview Session</h2>
                  <Settings className="w-5 h-5 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" />
                </div>

                <div className="flex flex-col items-center justify-center space-y-6 py-8">
                  <div className={`relative ${isListening ? "animate-pulse" : ""}`}>
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
                    <button
                        onClick={isListening ? stopListening : startListening}
                        className="relative z-10 p-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
                    >
                      <Mic className="w-8 h-8" />
                    </button>
                  </div>
                  <p className="text-gray-400">{isListening ? "Listening..." : "Click to start recording"}</p>
                </div>
              </div>

              {/* Current Question Display */}
              <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10 min-h-[120px]">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-medium text-blue-300">Current Question</h3>
                </div>
                <p className="text-gray-300">{currentQuestion || "No question detected yet..."}</p>
              </div>
            </div>

            {/* Right panel - AI Response */}
            <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-purple-300">AI Response</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">Live Coding</span>
                </div>
              </div>

              <div ref={codeEditorRef} className="font-mono bg-gray-950/50 rounded-lg p-4 h-[400px] overflow-auto">
                {isTyping ? (
                    <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse" />
                ) : (
                    response || "Waiting for question..."
                )}
              </div>
            </div>
          </div>

          {/* Overlay toggle button */}
          <div className="fixed bottom-4 right-4">
            <button
                onClick={toggleOverlay}
                className="p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
            >
              {isOverlayVisible ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </button>
          </div>

          {/* Text Overlay */}
          <TextOverlay text={response} isVisible={isOverlayVisible} />
        </div>
      </div>
  )
}

