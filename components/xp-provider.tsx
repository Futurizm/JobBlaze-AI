"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

type XPContextType = {
  xp: number
  level: number
  addXP: (amount: number) => void
}

const XPContext = createContext<XPContextType | undefined>(undefined)

export function useXP() {
  const context = useContext(XPContext)
  if (!context) {
    throw new Error("useXP must be used within an XPProvider")
  }
  return context
}

export function XPProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXP] = useState(0)
  const [level, setLevel] = useState(1)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const { toast } = useToast()

  // Calculate level based on XP
  useEffect(() => {
    const newLevel = Math.floor(xp / 100) + 1
    if (newLevel > level) {
      setLevel(newLevel)
      setShowLevelUp(true)

      // Show level up toast
      toast({
        title: "Level Up!",
        description: `You've reached level ${newLevel}! Keep going!`,
        duration: 5000,
      })

      // Hide level up animation after 3 seconds
      setTimeout(() => {
        setShowLevelUp(false)
      }, 3000)
    }
  }, [xp, level, toast])

  const addXP = (amount: number) => {
    setXP((prev) => prev + amount)
  }

  return (
    <XPContext.Provider value={{ xp, level, addXP }}>
      {children}

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: -50 }}
              className="bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl shadow-lg text-center"
            >
              <h2 className="text-3xl font-bold mb-2">LEVEL UP!</h2>
              <p className="text-xl">You've reached level {level}!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </XPContext.Provider>
  )
}
