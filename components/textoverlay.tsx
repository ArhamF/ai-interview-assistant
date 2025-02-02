import type React from "react"
import { useState, useEffect } from "react"

interface TextOverlayProps {
  text: string
  isVisible: boolean
}

export const TextOverlay: React.FC<TextOverlayProps> = ({ text, isVisible }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const lines = text.split(". ")

  useEffect(() => {
    if (!isVisible) return

    const timer = setInterval(() => {
      setCurrentLineIndex((prevIndex) => (prevIndex + 1) % lines.length)
    }, 3000) // Change line every 3 seconds

    return () => clearInterval(timer)
  }, [isVisible, lines.length])

  if (!isVisible) return null

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <p className="text-white text-4xl font-bold text-center px-4">{lines[currentLineIndex]}</p>
      </div>
  )
}

