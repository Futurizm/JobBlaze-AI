"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square } from "lucide-react"

export default function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [typingIndex, setTypingIndex] = useState(0)

  // Mock transcript text
  const mockTranscript =
    "I'm looking for a frontend developer position where I can use my skills in React, TypeScript, and responsive design. I have 2 years of experience building web applications and I'm passionate about creating intuitive user interfaces. I'm available to start immediately and prefer remote work, but I'm open to relocating for the right opportunity."

  const toggleRecording = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Reset transcript when starting new recording
      setTranscript("")
      setTypingIndex(0)
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
    <div className="max-w-3xl mx-auto">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center mb-6">
            <motion.div
              animate={isRecording ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ repeat: isRecording ? Number.POSITIVE_INFINITY : 0, duration: 1.5 }}
              className={`relative rounded-full p-8 ${
                isRecording ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <div
                className={`absolute inset-0 rounded-full ${
                  isRecording ? "wave-animation bg-red-200 dark:bg-red-800/30" : ""
                }`}
              ></div>
              {isRecording ? (
                <Mic className="h-12 w-12 text-red-500 dark:text-red-400 relative z-10" />
              ) : (
                <Mic className="h-12 w-12 text-gray-400 relative z-10" />
              )}
            </motion.div>

            <div className="mt-6 flex gap-4">
              <Button
                size="lg"
                onClick={toggleRecording}
                className={isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}
              >
                {isRecording ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 min-h-[200px] bg-gray-50 dark:bg-gray-800">
            {transcript ? (
              <p className="whitespace-pre-wrap">{transcript}</p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-center mt-12">
                {isRecording ? "Listening..." : "Click 'Start Recording' and speak to see transcription here"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
