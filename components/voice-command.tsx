"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"
import { useXP } from "./xp-provider"

export default function VoiceCommand() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [typingIndex, setTypingIndex] = useState(0)
  const { addXP } = useXP()

  // Mock transcript text
  const mockTranscript = "Find me junior developer jobs in Moscow"

  const toggleRecording = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Reset transcript when starting new recording
      setTranscript("")
      setTypingIndex(0)
      addXP(5)
    }
  }

  // Simulate typing effect when recording
  useEffect(() => {
    let typingTimer

    if (isRecording && typingIndex < mockTranscript.length) {
      typingTimer = setTimeout(() => {
        setTranscript(mockTranscript.substring(0, typingIndex + 1))
        setTypingIndex(typingIndex + 1)
      }, 50)
    }

    return () => clearTimeout(typingTimer)
  }, [isRecording, typingIndex])

  return (
    <div className="simple-card p-4 h-full">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div
            className={`w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full ${isRecording ? "bg-primary/20" : ""}`}
          >
            <Mic className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h3 className="text-lg font-bold mb-2 text-primary">Voice Command</h3>

        {transcript ? (
          <div className="w-full mb-4 min-h-[60px] relative overflow-hidden bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
            <p>{transcript}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {isRecording ? "Listening..." : "Click to start voice command"}
          </p>
        )}

        <Button onClick={toggleRecording} className={isRecording ? "bg-red-500 hover:bg-red-600" : "simple-button"}>
          {isRecording ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              Stop
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Start
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
