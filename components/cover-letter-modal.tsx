"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Copy, Download, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CoverLetterModal({ job, isOpen, onClose }) {
  const { toast } = useToast()
  const [generating, setGenerating] = useState(true)
  const [coverLetter, setCoverLetter] = useState("")
  const [copied, setCopied] = useState(false)

  // Mock cover letter generation
  useEffect(() => {
    if (isOpen) {
      setGenerating(true)
      const timer = setTimeout(() => {
        setCoverLetter(generateMockCoverLetter(job))
        setGenerating(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, job])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "Cover letter has been copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAsPDF = () => {
    toast({
      title: "Download started",
      description: "Your cover letter is being downloaded as PDF",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>
              Cover Letter for {job.title} at {job.company}
            </span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="my-4">
          {generating ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Generating your personalized cover letter...</p>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md"
              >
                <pre className="whitespace-pre-wrap font-sans text-sm">{coverLetter}</pre>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={copyToClipboard} disabled={generating}>
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button onClick={downloadAsPDF} disabled={generating} className="bg-primary hover:bg-primary/90 shine-effect">
            <Download className="mr-2 h-4 w-4" />
            Download as PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Mock cover letter generator
function generateMockCoverLetter(job) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  return `${date}

Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}. With my background in ${job.tags.join(", ")}, I believe I would be a valuable addition to your team.

Having reviewed the job description, I am excited about the opportunity to contribute to your company's mission. My experience aligns well with the requirements you've outlined, and I am particularly drawn to the chance to work in ${job.location}.

Throughout my career, I have developed strong skills in ${job.tags.join(", ")}, which I believe would allow me to excel in this role. I am passionate about delivering high-quality work and continuously improving my skills.

I am impressed by ${job.company}'s reputation in the industry and would welcome the opportunity to contribute to your continued success. I am confident that my skills and enthusiasm make me an ideal candidate for this position.

Thank you for considering my application. I look forward to the possibility of discussing how my background, skills, and experiences would benefit ${job.company}.

Sincerely,
[Your Name]`
}
