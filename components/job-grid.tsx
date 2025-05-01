"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, MapPin, DollarSign, Zap } from "lucide-react"
import { useXP } from "./xp-provider"

export default function JobGrid({ jobs }: any) {
  const { addXP } = useXP()

  const handleApplyNow = (jobId: number) => {
    console.log(`Applied to job ${jobId}`)
    addXP(15)
  }

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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {jobs.map((job: any) => (
        <motion.div
          key={job.id}
          variants={item}
          whileHover={{ scale: 1.03, rotateY: 5, rotateX: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="perspective-1000"
        >
          <Card className="cyberpunk-card h-full transform-gpu">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold text-gradient">{job.name}</CardTitle>
                <span className="text-sm font-bold neon-text">{job.matchPercentage || 90}%</span>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                <Building className="h-4 w-4 mr-1 text-accent" />
                <span>{job.employer.name}</span>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <MapPin className="h-4 w-4 mr-1 text-accent" />
                <span>{job.area?.name || "Remote"}</span>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <DollarSign className="h-4 w-4 fantastic mr-1 text-accent" />
                <span>{job.salary ? `${job.salary.from || ''} - ${job.salary.to || ''} ${job.salary.currency || ''}` : "Not specified"}</span>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {job.snippet.requirement}
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                {(job.key_skills || []).map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary" className="holographic-badge">
                    {skill.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Posted {new Date(job.published_at).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                className="neon-button w-full"
                onClick={() => handleApplyNow(job.id)}
              >
                <Zap className="h-4 w-4 mr-1" />
                Apply Now
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}