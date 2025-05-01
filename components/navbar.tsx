"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Sun, Moon, Bell, User } from "lucide-react"
import { useXP } from "./xp-provider"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { xp, level } = useXP()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <nav className="main-navbar">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-white/80" />
          <Link href="/" className="text-xl font-bold flex items-center">
            <span className="mr-2">⚡</span>
            <span className="hidden md:inline">JobBlaze AI</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative mr-2 bg-white/10 px-3 py-1 rounded-full flex items-center">
            <div className="simple-progress w-24 h-2 mr-2">
              <div className="simple-progress-bar bg-yellow-400" style={{ width: `${xp % 100}%` }}></div>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-yellow-400 text-primary font-bold text-xs flex items-center justify-center">
                {level}
              </div>
              <span className="ml-2 text-sm">Level</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:text-white/80 hover:bg-white/10"
          >
            {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80 hover:bg-white/10 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
              3
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80 hover:bg-white/10">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
