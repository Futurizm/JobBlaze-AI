"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, MapPin, DollarSign, ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { useXP } from "./xp-provider"

// Mock job data
const mockJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    salary: "$90,000 - $120,000",
    matchPercentage: 92,
    description:
      "We're looking for a skilled Frontend Developer to join our team and help build amazing user experiences.",
    posted: "2 days ago",
    tags: ["React", "TypeScript", "Tailwind CSS"],
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "DesignHub",
    location: "Remote",
    salary: "$85,000 - $110,000",
    matchPercentage: 88,
    description: "Join our creative team to design intuitive and beautiful interfaces for our clients.",
    posted: "1 day ago",
    tags: ["Figma", "Adobe XD", "Prototyping"],
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "DataWorks",
    location: "New York, NY",
    salary: "$100,000 - $130,000",
    matchPercentage: 85,
    description: "Help us analyze complex data sets and build predictive models for our clients.",
    posted: "3 days ago",
    tags: ["Python", "Machine Learning", "SQL"],
  },
  {
    id: 4,
    title: "Product Manager",
    company: "ProductLabs",
    location: "Austin, TX",
    salary: "$95,000 - $125,000",
    matchPercentage: 90,
    description: "Lead product development and work with cross-functional teams to deliver amazing products.",
    posted: "Just now",
    tags: ["Agile", "Product Strategy", "User Research"],
  },
  {
    id: 5,
    title: "Full Stack Developer",
    company: "WebSolutions",
    location: "Chicago, IL",
    salary: "$95,000 - $130,000",
    matchPercentage: 87,
    description: "Build end-to-end web applications and contribute to our growing tech stack.",
    posted: "5 days ago",
    tags: ["JavaScript", "Node.js", "MongoDB"],
  },
  {
    id: 6,
    title: "Marketing Specialist",
    company: "GrowthMarketing",
    location: "Remote",
    salary: "$70,000 - $90,000",
    matchPercentage: 82,
    description: "Drive marketing campaigns and help our clients reach their target audience effectively.",
    posted: "1 week ago",
    tags: ["Digital Marketing", "SEO", "Content Strategy"],
  },
]

export default function JobCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)
  const { addXP } = useXP()

  const visibleJobs = 3
  const maxIndex = mockJobs.length - visibleJobs

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setDirection(1)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleApplyNow = (jobId) => {
    console.log(`Applied to job ${jobId}`)
    addXP(15)
  }

  // Handle touch/mouse events for swiping
  const handleDragStart = (e) => {
    setIsDragging(true)
    setStartX(e.clientX || e.touches[0].clientX)
  }

  const handleDragMove = (e) => {
    if (!isDragging) return
    const currentX = e.clientX || e.touches[0].clientX
    const diff = currentX - startX
    setOffsetX(diff)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    if (offsetX > 100 && currentIndex > 0) {
      handlePrev()
    } else if (offsetX < -100 && currentIndex < maxIndex) {
      handleNext()
    }
    setOffsetX(0)
  }

  useEffect(() => {
    controls
      .start({
        x: direction === 1 ? "-100%" : direction === -1 ? "100%" : "0%",
        opacity: 0,
        transition: { duration: 0.2 },
      })
      .then(() => {
        controls.set({ x: direction === 1 ? "100%" : direction === -1 ? "-100%" : "0%" })
        controls.start({
          x: "0%",
          opacity: 1,
          transition: { duration: 0.2 },
        })
      })
  }, [currentIndex, controls, direction])

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gradient">Featured Job Listings</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="border-accent hover:bg-accent/10 hover:text-accent-light"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="border-accent hover:bg-accent/10 hover:text-accent-light"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <motion.div
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ x: isDragging ? offsetX : 0 }}
        >
          {mockJobs.slice(currentIndex, currentIndex + visibleJobs).map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ scale: 1.03, rotateY: 5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="perspective-1000"
            >
              <Card className="cyberpunk-card h-full transform-gpu">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-gradient">{job.title}</CardTitle>
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                      <div
                        className="absolute inset-0 rounded-full border-4 border-accent neon-border"
                        style={{
                          clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                          clipPath: `path('M 50 0 A 50 50 0 ${job.matchPercentage >= 50 ? 1 : 0} 1 ${50 + 50 * Math.cos((job.matchPercentage / 100) * Math.PI * 2)} ${50 + 50 * Math.sin((job.matchPercentage / 100) * Math.PI * 2)} L 50 50 Z')`,
                        }}
                      ></div>
                      <span className="text-sm font-bold neon-text">{job.matchPercentage}%</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                    <Building className="h-4 w-4 mr-1 text-accent" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-accent" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <DollarSign className="h-4 w-4 mr-1 text-accent" />
                    <span>{job.salary}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {job.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="holographic-badge">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Posted {job.posted}</p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button className="neon-button w-full" onClick={() => handleApplyNow(job.id)}>
                    <Zap className="h-4 w-4 mr-1" />
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
