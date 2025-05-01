"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, Zap } from "lucide-react"
import { useXP } from "./xp-provider"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"

interface VoiceInputFullProps {
  onTranscriptChange: (transcript: string) => void
}

export default function VoiceInputFull({ onTranscriptChange }: VoiceInputFullProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [typingIndex, setTypingIndex] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const { addXP } = useXP()
  const { transcript, resetTranscript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition()

  // Моковый транскрипт для эффекта набора текста
  const mockTranscript =
    "I'm looking for a frontend developer position where I can use my skills in React, TypeScript, and responsive design. I have 2 years of experience building web applications and I'm passionate about creating intuitive user interfaces. I'm available to start immediately and prefer remote work, but I'm open to relocating for the right opportunity."

  const toggleRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Speech Recognition is not supported in your browser.")
      return
    }

    if (!isRecording) {
      resetTranscript()
      SpeechRecognition.startListening({ language: "ru-RU", continuous: true })
      setIsRecording(true)
      setTypingIndex(0)
      setShowFeedback(false)
      addXP(5)
    } else {
      SpeechRecognition.stopListening()
      setIsRecording(false)
      setTimeout(() => {
        setShowFeedback(true)
        addXP(15)
      }, 1000)
    }
  }

  // Передача транскрипта родителю
  useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript)
    }
  }, [transcript, onTranscriptChange])

  // Эффект набора текста (для мокового транскрипта, опционально)
  useEffect(() => {
    let typingTimer: NodeJS.Timeout | undefined

    if (isRecording && typingIndex < mockTranscript.length && !transcript) {
      typingTimer = setTimeout(() => {
        const newTranscript = mockTranscript.substring(0, typingIndex + 1)
        setTypingIndex(typingIndex + 1)
        onTranscriptChange(newTranscript)
      }, 50)
    }

    return () => clearTimeout(typingTimer)
  }, [isRecording, typingIndex, onTranscriptChange])

  // Эффект частиц для визуализации
  const particles = Array.from({ length: 5 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute bg-accent rounded-full"
      style={{
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
      }}
      animate={
        isRecording
          ? {
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
              opacity: [1, 0],
              scale: [1, 0],
            }
          : { x: 0, y: 0, opacity: 0, scale: 0 }
      }
      transition={{
        duration: Math.random() * 1 + 1,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      }}
    />
  ))

  return (
    <div className="w-full">
      <Card className="cyberpunk-card mb-8 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center mb-6">
            <motion.div
              animate={listening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ repeat: listening ? Number.POSITIVE_INFINITY : 0, duration: 1.5 }}
              className="relative mb-6"
            >
              <div
                className={`neon-orb w-24 h-24 flex items-center justify-center ${
                  listening ? "pulse-animation" : ""
                }`}
              >
                <Mic className="h-12 w-12 text-white" />
                {listening && particles}
              </div>
              <div
                className={`absolute inset-0 rounded-full ${listening ? "wave-animation bg-accent/30" : ""}`}
              ></div>
            </motion.div>

            <div className="mb-6 flex gap-4">
              <Button
                size="lg"
                onClick={toggleRecording}
                className={listening ? "bg-red-500 hover:bg-red-600 neon-button" : "neon-button"}
              >
                {listening ? (
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

            <div className="holographic-terminal w-full min-h-[200px] relative overflow-hidden">
              <div className="absolute top-2 left-2 w-2 h-4 bg-green-500 animate-pulse"></div>
              {transcript || (isRecording && typingIndex > 0) ? (
                <p className="pl-6 whitespace-pre-wrap">
                  {transcript || mockTranscript.substring(0, typingIndex)}
                </p>
              ) : (
                <p className="pl-6 text-gray-400 dark:text-gray-500">
                  {listening ? "Listening..." : "Click 'Start Recording' and speak to see transcription here"}
                </p>
              )}
            </div>
          </div>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/30"
            >
              <div className="flex items-center mb-2">
                <Zap className="h-5 w-5 text-accent mr-2" />
                <h3 className="font-bold text-gradient">AI Voice Analysis</h3>
              </div>
              <p className="text-sm mb-2">Found 12 potential job matches based on your voice input:</p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>8 Frontend Developer positions</li>
                <li>3 React Developer positions</li>
                <li>1 UI Engineer position</li>
              </ul>
              <div className="mt-4 flex justify-end">
                <Button className="neon-button">
                  <Zap className="mr-2 h-4 w-4" />
                  View Matches
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}