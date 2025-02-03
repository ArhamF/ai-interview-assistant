import type React from "react"
import { useState, useEffect } from "react"
import { X, ArrowLeft } from "lucide-react"

interface TextOverlayProps {
  text: string
  isVisible: boolean
  onClose: () => void
  wpm: number
}

export const TextOverlay: React.FC<TextOverlayProps> = ({ text, isVisible, onClose, wpm }) => {
  const [currentText, setCurrentText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setCurrentText("")
      setCurrentIndex(0)
      return
    }

    const words = text.split(" ")
    const interval = setInterval(
        () => {
          if (currentIndex < words.length) {
            setCurrentText((prev) => `${prev} ${words[currentIndex]}`)
            setCurrentIndex((prev) => prev + 1)
          } else {
            clearInterval(interval)
          }
        },
        (60 / wpm) * 1000,
    ) // Convert WPM to milliseconds per word

    return () => clearInterval(interval)
  }, [isVisible, text, currentIndex, wpm])

  const handleBackspace = () => {
    const words = currentText.trim().split(" ")
    if (words.length > 1) {
      words.pop()
      setCurrentText(words.join(" ") + " ")
      setCurrentIndex((prev) => prev - 1)
    } else {
      setCurrentText("")
      setCurrentIndex(0)
    }
  }

  if (!isVisible) return null

  return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 relative">
          <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              aria-label="Close overlay"
          >
            <X size={24} />
          </button>
          <button
              onClick={handleBackspace}
              className="absolute top-2 left-2 text-gray-400 hover:text-white"
              aria-label="Backspace"
          >
            <ArrowLeft size={24} />
          </button>
          <p className="text-white text-2xl font-bold mt-6 mb-4">AI Response:</p>
          <div className="bg-gray-900 p-4 rounded-md">
            <p className="text-white text-lg whitespace-pre-wrap">{currentText}</p>
          </div>
        </div>
      </div>
  )
}

