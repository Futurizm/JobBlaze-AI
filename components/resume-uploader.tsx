"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FileUp, X, Check, Zap } from "lucide-react"
import confetti from "canvas-confetti"
import { useXP } from "./xp-provider"

export default function ResumeUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef(null)
  const { addXP } = useXP()

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
    }
  }

  const handleUpload = () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 5
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setUploading(false)
            setUploadComplete(true)

            // Add XP for uploading resume
            addXP(25)

            // Trigger confetti effect
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#1E40AF", "#3B82F6", "#60A5FA"],
            })
          }, 500)
          return 100
        }
        return newProgress
      })
    }, 150)
  }

  const handleReset = () => {
    setFile(null)
    setUploading(false)
    setUploadProgress(0)
    setUploadComplete(false)
  }

  const handleViewAnalysis = () => {
    addXP(10)
  }

  return (
    <div className="w-full">
      {!file ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`cyberpunk-card p-12 text-center relative overflow-hidden ${
            isDragging ? "border-accent neon-border" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="cyberpunk-grid-animated absolute inset-0 opacity-30"></div>

          <div className="relative z-10">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
              <FileUp className="mx-auto h-12 w-12 text-accent mb-4" />
            </motion.div>

            <h3 className="text-lg font-medium mb-2 text-gradient">
              {isDragging ? "Drop your resume here" : "Drag & drop your resume here"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse (PDF only)</p>

            <Button onClick={() => fileInputRef.current.click()} className="neon-button">
              <FileUp className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cyberpunk-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-accent/10 p-2 rounded-full mr-3 neon-border">
                <FileUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-medium">{file.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleReset} disabled={uploading}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {uploading && (
            <div className="mb-4">
              <div className="neon-progress mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="neon-progress-bar"
                ></motion.div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-right">{uploadProgress}%</p>
            </div>
          )}

          {uploadComplete ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full neon-border border-green-500"
                >
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </motion.div>
                <p className="ml-3 font-medium text-green-600 dark:text-green-400">Resume uploaded successfully!</p>
              </div>

              <Button className="neon-button w-full" onClick={handleViewAnalysis}>
                <Zap className="mr-2 h-4 w-4" />
                View Analysis
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="mr-2 border-accent hover:bg-accent/10"
                onClick={handleReset}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading} className="neon-button">
                {uploading ? "Uploading..." : "Upload Resume"}
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
