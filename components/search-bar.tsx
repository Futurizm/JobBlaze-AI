"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Briefcase } from "lucide-react"
import { useXP } from "./xp-provider"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { addXP } = useXP()

  const suggestions = ["Software Engineer", "UX Designer", "Data Scientist", "Product Manager", "Marketing Specialist"]
  const placeholders = ["Python jobs", "Remote internships", "Junior developer", "UX/UI designer", "Data analyst"]

  // Cycle through placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = () => {
    addXP(5)
  }

  return (
    <div className="search-bar-container">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <Input
            type="text"
            placeholder={`Search for ${placeholders[placeholderIndex]}...`}
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && query && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
              {suggestions
                .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
                .map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-primary/5 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setQuery(suggestion)
                      setShowSuggestions(false)
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="relative md:w-1/4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <Input
            type="text"
            placeholder="Location"
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="relative md:w-1/4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <Input
            type="text"
            placeholder="Job Type"
            className="pl-10 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          />
        </div>

        <Button
          className="bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all"
          onClick={handleSearch}
        >
          <Search className="mr-2 h-5 w-5" />
          Search
        </Button>
      </div>
    </div>
  )
}
