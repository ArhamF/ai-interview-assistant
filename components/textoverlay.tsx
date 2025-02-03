import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X, ArrowLeft } from "lucide-react"

interface TextOverlayProps {
  text: string
  isVisible: boolean
  onClose: () => void
  wpm: number
}

export const TextOverlay: React.FC<TextOverlayProps> = ({ text, isVisible, onClose, wpm }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isVisible) {
      setDisplayedText("")
      setCurrentIndex(0)
      return
    }

    const animateText = () => {
      intervalRef.current = setInterval(
          () => {
            if (currentIndex < text.length) {
              setDisplayedText((prev) => prev + text[currentIndex])
              setCurrentIndex((prev) => prev + 1)
            } else {
              if (intervalRef.current) clearInterval(intervalRef.current)
            }
          },
          (60 / (wpm * 5)) * 1000,
      ) // Adjust for characters instead of words
    }

    animateText()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isVisible, text, currentIndex, wpm])

  const handleBackspace = () => {
    if (displayedText.length > 0) {
      setDisplayedText((prev) => prev.slice(0, -1))
      setCurrentIndex((prev) => prev - 1)
    }
  }

  if (!isVisible) return null

  return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-black/95 w-full h-full absolute" />
        <div className="relative w-full max-w-5xl mx-auto px-8 py-12">
          {/* Control buttons */}
          <div className="absolute top-4 right-4 flex gap-4">
            <button
                onClick={handleBackspace}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                aria-label="Backspace"
            >
              <ArrowLeft size={24} />
            </button>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                aria-label="Close overlay"
            >
              <X size={24} />
            </button>
          </div>

          {/* Text content */}
          <div className="space-y-8 overflow-y-auto max-h-[80vh]">
            <div className="text-center space-y-2 opacity-50">
              <h2 className="text-white/60 text-lg font-medium">AI Response</h2>
              <div className="h-0.5 w-16 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
            </div>

            <div className="flex flex-wrap justify-center items-baseline leading-relaxed">
              <p className="text-white text-4xl font-mono whitespace-pre-wrap tracking-tight">
                {displayedText}
                {currentIndex < text.length && (
                    <span className="inline-block w-2 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse ml-1 align-middle" />
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}

