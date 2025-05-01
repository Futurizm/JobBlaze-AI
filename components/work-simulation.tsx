"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Code, FileText, MessageSquare, PenTool } from "lucide-react"

const simulationTypes = [
  {
    id: "coding",
    title: "Coding Challenge",
    description: "Solve real-world programming problems",
    icon: <Code className="h-5 w-5" />,
    duration: "45 min",
    difficulty: "Intermediate",
    skills: ["JavaScript", "React", "Problem Solving"],
  },
  {
    id: "writing",
    title: "Technical Writing",
    description: "Create documentation for a software product",
    icon: <FileText className="h-5 w-5" />,
    duration: "30 min",
    difficulty: "Beginner",
    skills: ["Documentation", "Technical Writing", "Communication"],
  },
  {
    id: "design",
    title: "UI/UX Design",
    description: "Design a user interface for a mobile app",
    icon: <PenTool className="h-5 w-5" />,
    duration: "60 min",
    difficulty: "Advanced",
    skills: ["UI Design", "UX Principles", "Figma"],
  },
  {
    id: "communication",
    title: "Client Communication",
    description: "Handle a challenging client conversation",
    icon: <MessageSquare className="h-5 w-5" />,
    duration: "20 min",
    difficulty: "Intermediate",
    skills: ["Communication", "Problem Solving", "Empathy"],
  },
]

const simulationSteps = {
  coding: [
    "Set up your development environment",
    "Understand the problem requirements",
    "Write pseudocode for your solution",
    "Implement your solution",
    "Test and debug your code",
    "Optimize for performance",
    "Submit your solution",
  ],
  writing: [
    "Review the product specifications",
    "Create an outline for your documentation",
    "Write the introduction and overview",
    "Detail the technical specifications",
    "Add usage examples and code snippets",
    "Proofread and edit your document",
    "Submit your documentation",
  ],
  design: [
    "Understand the design brief",
    "Research similar applications",
    "Create wireframes for key screens",
    "Design the user interface",
    "Add interactive elements",
    "Test the user experience",
    "Submit your design files",
  ],
  communication: [
    "Review the client scenario",
    "Prepare your talking points",
    "Practice your response",
    "Record your video response",
    "Review and refine your approach",
    "Submit your response",
  ],
}

export function WorkSimulation() {
  const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleStartSimulation = (id: string) => {
    setSelectedSimulation(id)
    setIsStarted(true)
    setActiveStep(0)
    setIsCompleted(false)
  }

  const handleNextStep = () => {
    if (!selectedSimulation) return

    const steps = simulationSteps[selectedSimulation as keyof typeof simulationSteps]
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleReset = () => {
    setSelectedSimulation(null)
    setIsStarted(false)
    setActiveStep(0)
    setIsCompleted(false)
  }

  const getSimulationById = (id: string) => {
    return simulationTypes.find((sim) => sim.id === id)
  }

  const renderSimulationList = () => {
    return (
      <div className="w-full">
        {simulationTypes.map((simulation) => (
          <Card key={simulation.id} className="border border-blue-100 hover:border-blue-300 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-blue-50 text-blue-600">{simulation.icon}</div>
                  <CardTitle className="text-lg">{simulation.title}</CardTitle>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                  {simulation.difficulty}
                </Badge>
              </div>
              <CardDescription className="mt-2">{simulation.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span>{simulation.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {simulation.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-slate-100">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleStartSimulation(simulation.id)}>Start Simulation</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  const renderSimulationView = () => {
    if (!selectedSimulation) return null

    const simulation = getSimulationById(selectedSimulation)
    if (!simulation) return null

    const steps = simulationSteps[selectedSimulation as keyof typeof simulationSteps]

    return (
      <div className="w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{simulation.title}</CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                {simulation.difficulty}
              </Badge>
            </div>
            <CardDescription>{simulation.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span>{simulation.duration}</span>
              </div>
              <Progress value={((activeStep + 1) / steps.length) * 100} />
              <div className="text-sm text-muted-foreground mt-1">
                Step {activeStep + 1} of {steps.length}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-md font-semibold">Step {activeStep + 1}:</h3>
              <p>{steps[activeStep]}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleNextStep} disabled={isCompleted}>
              {isCompleted ? "Completed" : "Next Step"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full px-4">
      <Tabs defaultValue="simulations" className="w-full">
        <TabsList>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
          <TabsTrigger value="active" disabled={!selectedSimulation}>
            Active Simulation
          </TabsTrigger>
        </TabsList>
        <TabsContent value="simulations">{!isStarted && renderSimulationList()}</TabsContent>
        <TabsContent value="active">{isStarted && renderSimulationView()}</TabsContent>
      </Tabs>
    </div>
  )
}
