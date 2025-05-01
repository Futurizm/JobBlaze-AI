"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash } from "lucide-react"
import { useXP } from "./xp-provider"

export default function ResumeBuilder() {
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
  })

  const [experiences, setExperiences] = useState([
    { id: 1, title: "", company: "", location: "", startDate: "", endDate: "", description: "" },
  ])

  const [education, setEducation] = useState([
    { id: 1, degree: "", school: "", location: "", startDate: "", endDate: "", gpa: "" },
  ])

  const [skills, setSkills] = useState([{ id: 1, name: "" }])

  const [activeStep, setActiveStep] = useState(0)
  const [selectedStyle, setSelectedStyle] = useState("professional")
  const { addXP } = useXP()

  const steps = ["Personal Info", "Experience", "Education", "Skills"]

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target
    setPersonalInfo({ ...personalInfo, [name]: value })
  }

  const handleExperienceChange = (id, field, value) => {
    setExperiences(experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }

  const handleEducationChange = (id, field, value) => {
    setEducation(education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)))
  }

  const handleSkillChange = (id, value) => {
    setSkills(skills.map((skill) => (skill.id === id ? { ...skill, name: value } : skill)))
  }

  const addExperience = () => {
    const newId = experiences.length > 0 ? Math.max(...experiences.map((exp) => exp.id)) + 1 : 1
    setExperiences([
      ...experiences,
      {
        id: newId,
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ])
  }

  const removeExperience = (id) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((exp) => exp.id !== id))
    }
  }

  const addEducation = () => {
    const newId = education.length > 0 ? Math.max(...education.map((edu) => edu.id)) + 1 : 1
    setEducation([
      ...education,
      {
        id: newId,
        degree: "",
        school: "",
        location: "",
        startDate: "",
        endDate: "",
        gpa: "",
      },
    ])
  }

  const removeEducation = (id) => {
    if (education.length > 1) {
      setEducation(education.filter((edu) => edu.id !== id))
    }
  }

  const addSkill = () => {
    const newId = skills.length > 0 ? Math.max(...skills.map((skill) => skill.id)) + 1 : 1
    setSkills([...skills, { id: newId, name: "" }])
  }

  const removeSkill = (id) => {
    if (skills.length > 1) {
      setSkills(skills.filter((skill) => skill.id !== id))
    }
  }

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
      addXP(5)
    }
  }

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const generateResume = () => {
    addXP(30)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-primary">Resume Builder</h2>
              <div className="flex justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center" onClick={() => setActiveStep(index)}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        index === activeStep
                          ? "bg-primary text-white"
                          : index < activeStep
                            ? "bg-primary/50 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-xs mt-1">{step}</span>
                  </div>
                ))}
              </div>
              <div className="simple-progress mb-6">
                <div
                  className="simple-progress-bar"
                  style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {activeStep === 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-primary">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={personalInfo.name}
                      onChange={handlePersonalInfoChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={personalInfo.phone}
                      onChange={handlePersonalInfoChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={personalInfo.location}
                      onChange={handlePersonalInfoChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      value={personalInfo.linkedin}
                      onChange={handlePersonalInfoChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-primary">Experience</h3>
                  <Button
                    onClick={addExperience}
                    variant="outline"
                    size="sm"
                    className="border-primary hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {experiences.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Position {index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExperience(exp.id)}
                        disabled={experiences.length <= 1}
                        className="h-8 w-8 text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`job-title-${exp.id}`}>Job Title</Label>
                        <Input
                          id={`job-title-${exp.id}`}
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(exp.id, "title", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`company-${exp.id}`}>Company</Label>
                        <Input
                          id={`company-${exp.id}`}
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`location-${exp.id}`}>Location</Label>
                        <Input
                          id={`location-${exp.id}`}
                          value={exp.location}
                          onChange={(e) => handleExperienceChange(exp.id, "location", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`start-date-${exp.id}`}>Start Date</Label>
                        <Input
                          id={`start-date-${exp.id}`}
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(exp.id, "startDate", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`end-date-${exp.id}`}>End Date</Label>
                        <Input
                          id={`end-date-${exp.id}`}
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(exp.id, "endDate", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`description-${exp.id}`}>Description</Label>
                        <Input
                          id={`description-${exp.id}`}
                          value={exp.description}
                          onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-primary">Education</h3>
                  <Button
                    onClick={addEducation}
                    variant="outline"
                    size="sm"
                    className="border-primary hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {education.map((edu, index) => (
                  <div
                    key={edu.id}
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">School {index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEducation(edu.id)}
                        disabled={education.length <= 1}
                        className="h-8 w-8 text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                        <Input
                          id={`degree-${edu.id}`}
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`school-${edu.id}`}>School</Label>
                        <Input
                          id={`school-${edu.id}`}
                          value={edu.school}
                          onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`location-${edu.id}`}>Location</Label>
                        <Input
                          id={`location-${edu.id}`}
                          value={edu.location}
                          onChange={(e) => handleEducationChange(edu.id, "location", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`start-date-${edu.id}`}>Start Date</Label>
                        <Input
                          id={`start-date-${edu.id}`}
                          value={edu.startDate}
                          onChange={(e) => handleEducationChange(edu.id, "startDate", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`end-date-${edu.id}`}>End Date</Label>
                        <Input
                          id={`end-date-${edu.id}`}
                          value={edu.endDate}
                          onChange={(e) => handleEducationChange(edu.id, "endDate", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`gpa-${edu.id}`}>GPA</Label>
                        <Input
                          id={`gpa-${edu.id}`}
                          value={edu.gpa}
                          onChange={(e) => handleEducationChange(edu.id, "gpa", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-primary">Skills</h3>
                  <Button onClick={addSkill} variant="outline" size="sm" className="border-primary hover:bg-primary/10">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {skills.map((skill, index) => (
                  <div
                    key={skill.id}
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Skill {index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSkill(skill.id)}
                        disabled={skills.length <= 1}
                        className="h-8 w-8 text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor={`skill-${skill.id}`}>Skill Name</Label>
                      <Input
                        id={`skill-${skill.id}`}
                        value={skill.name}
                        onChange={(e) => handleSkillChange(skill.id, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="secondary" onClick={prevStep} disabled={activeStep === 0}>
                Previous
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button onClick={generateResume}>Generate Resume</Button>
              ) : (
                <Button onClick={nextStep}>Next</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div></div>
    </div>
  )
}
