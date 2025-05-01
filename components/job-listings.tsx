"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, MapPin, DollarSign, Star, FileText } from "lucide-react"
import CoverLetterModal from "@/components/cover-letter-modal"

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

export default function JobListings() {
  const [selectedJob, setSelectedJob] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const handleGenerateCoverLetter = (job: any) => {
    setSelectedJob(job)
    setShowModal(true)
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary">Featured Job Listings</h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {mockJobs.map((job) => (
          <motion.div key={job.id} variants={item}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 hover:scale-[1.02] border-2 border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                    <div
                      className="absolute inset-0 rounded-full border-4 border-primary"
                      style={{
                        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                        clipPath: `path('M 50 0 A 50 50 0 ${job.matchPercentage >= 50 ? 1 : 0} 1 ${50 + 50 * Math.cos((job.matchPercentage / 100) * Math.PI * 2)} ${50 + 50 * Math.sin((job.matchPercentage / 100) * Math.PI * 2)} L 50 50 Z')`,
                      }}
                    ></div>
                    <span className="text-sm font-bold">{job.matchPercentage}%</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                  <Building className="h-4 w-4 mr-1" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{job.salary}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{job.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {job.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-secondary/10 text-secondary hover:bg-secondary/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Posted {job.posted}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" className="hover:bg-primary/10">
                  <Star className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => handleGenerateCoverLetter(job)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Generate Cover Letter
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {showModal && selectedJob && (
        <CoverLetterModal job={selectedJob} isOpen={showModal} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
