"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileUp, Plus, Trash, ImageIcon, Zap, Download, Code } from "lucide-react"
import { useXP } from "./xp-provider"

export default function PortfolioGenerator() {
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    title: "",
    bio: "",
    email: "",
    website: "",
    github: "",
    linkedin: "",
  })

  const [projects, setProjects] = useState([
    { id: 1, title: "", description: "", technologies: "", link: "", images: [] },
  ])

  const [uploadedImages, setUploadedImages] = useState([])
  const [generating, setGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState("tech")
  const { addXP } = useXP()

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target
    setPersonalInfo({ ...personalInfo, [name]: value })
  }

  const handleProjectChange = (id, field, value) => {
    setProjects(projects.map((project) => (project.id === id ? { ...project, [field]: value } : project)))
  }

  const addProject = () => {
    const newId = projects.length > 0 ? Math.max(...projects.map((project) => project.id)) + 1 : 1
    setProjects([
      ...projects,
      {
        id: newId,
        title: "",
        description: "",
        technologies: "",
        link: "",
        images: [],
      },
    ])
  }

  const removeProject = (id) => {
    if (projects.length > 1) {
      setProjects(projects.filter((project) => project.id !== id))
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)

    if (files.length > 0) {
      const newImages = files.map((file) => ({
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        preview: URL.createObjectURL(file),
      }))

      setUploadedImages([...uploadedImages, ...newImages])
      addXP(5)
    }
  }

  const removeImage = (id) => {
    setUploadedImages(uploadedImages.filter((image) => image.id !== id))
  }

  const addImageToProject = (projectId, imageId) => {
    const image = uploadedImages.find((img) => img.id === imageId)

    setProjects(
      projects.map((project) =>
        project.id === projectId ? { ...project, images: [...project.images, image] } : project,
      ),
    )

    setUploadedImages(uploadedImages.filter((img) => img.id !== imageId))
  }

  const removeImageFromProject = (projectId, imageId) => {
    const image = projects.find((project) => project.id === projectId).images.find((img) => img.id === imageId)

    setProjects(
      projects.map((project) =>
        project.id === projectId ? { ...project, images: project.images.filter((img) => img.id !== imageId) } : project,
      ),
    )

    setUploadedImages([...uploadedImages, image])
  }

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      addXP(30)
    }, 3000)
  }

  return (
    <div className="w-full">
      <Card className="cyberpunk-card">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gradient">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={personalInfo.name}
                onChange={handlePersonalInfoChange}
                className="mt-1 neon-input"
              />
            </div>
            <div>
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                name="title"
                value={personalInfo.title}
                onChange={handlePersonalInfoChange}
                className="mt-1 neon-input"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={personalInfo.bio}
                onChange={handlePersonalInfoChange}
                className="mt-1 neon-input"
                rows={3}
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
                className="mt-1 neon-input"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={personalInfo.website}
                onChange={handlePersonalInfoChange}
                className="mt-1 neon-input"
              />
            </div>
            <div>
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                name="github"
                value={personalInfo.github}
                onChange={handlePersonalInfoChange}
                className="mt-1 neon-input"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                value={personalInfo.linkedin}
                onChange={handlePersonalInfoChange}
                className="mt-1 neon-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cyberpunk-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gradient">Image Gallery</h2>
            <Button
              onClick={() => document.getElementById("image-upload").click()}
              variant="outline"
              className="flex items-center gap-2 border-accent hover:bg-accent/10"
            >
              <FileUp className="h-4 w-4" />
              Upload Images
            </Button>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {uploadedImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedImages.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative group perspective-1000"
                >
                  <div className="cyberpunk-card p-1">
                    <img
                      src={image.preview || "/placeholder.svg"}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImage(image.id)}
                        className="text-white hover:bg-white/20"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs mt-1 truncate">{image.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="holographic-panel p-8 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-accent mb-4" />
              <h3 className="text-lg font-medium mb-2">No images uploaded</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Upload screenshots of your work to include in your portfolio
              </p>
              <Button onClick={() => document.getElementById("image-upload").click()} className="neon-button">
                <FileUp className="mr-2 h-4 w-4" />
                Upload Images
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="cyberpunk-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gradient">Projects</h2>
            <Button onClick={addProject} variant="outline" size="sm" className="border-accent hover:bg-accent/10">
              <Plus className="h-4 w-4 mr-1" />
              Add Project
            </Button>
          </div>

          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="holographic-panel p-4 rounded-lg mb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gradient">Project {index + 1}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProject(project.id)}
                  disabled={projects.length <= 1}
                  className="h-8 w-8 text-red-500"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`project-title-${project.id}`}>Project Title</Label>
                  <Input
                    id={`project-title-${project.id}`}
                    value={project.title}
                    onChange={(e) => handleProjectChange(project.id, "title", e.target.value)}
                    className="mt-1 neon-input"
                  />
                </div>
                <div>
                  <Label htmlFor={`project-link-${project.id}`}>Project Link</Label>
                  <Input
                    id={`project-link-${project.id}`}
                    value={project.link}
                    onChange={(e) => handleProjectChange(project.id, "link", e.target.value)}
                    className="mt-1 neon-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor={`project-desc-${project.id}`}>Description</Label>
                  <Textarea
                    id={`project-desc-${project.id}`}
                    value={project.description}
                    onChange={(e) => handleProjectChange(project.id, "description", e.target.value)}
                    className="mt-1 neon-input"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor={`project-tech-${project.id}`}>Technologies Used</Label>
                  <Input
                    id={`project-tech-${project.id}`}
                    value={project.technologies}
                    onChange={(e) => handleProjectChange(project.id, "technologies", e.target.value)}
                    className="mt-1 neon-input"
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="mb-2 block">Project Images</Label>
                  {project.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                      {project.images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.preview || "/placeholder.svg"}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeImageFromProject(project.id, image.id)}
                              className="text-white hover:bg-white/20"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No images added to this project yet</p>
                  )}

                  {uploadedImages.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Add from gallery</Label>
                      <div className="flex flex-wrap gap-2">
                        {uploadedImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.preview || "/placeholder.svg"}
                              alt={image.name}
                              className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                              onClick={() => addImageToProject(project.id, image.id)}
                            />
                            <div className="absolute inset-0 bg-accent/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Plus className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card className="cyberpunk-card">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gradient">Portfolio Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedStyle === "tech"
                  ? "bg-accent/20 border border-accent neon-border"
                  : "bg-gray-100 dark:bg-gray-800 border border-transparent"
              }`}
              onClick={() => setSelectedStyle("tech")}
            >
              <div className="h-40 bg-gradient-to-br from-primary to-accent rounded-md mb-2 flex items-center justify-center">
                <Code className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-center font-medium">Tech</h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Modern, sleek design with code snippets
              </p>
            </div>

            <div
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedStyle === "creative"
                  ? "bg-accent/20 border border-accent neon-border"
                  : "bg-gray-100 dark:bg-gray-800 border border-transparent"
              }`}
              onClick={() => setSelectedStyle("creative")}
            >
              <div className="h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md mb-2 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-center font-medium">Creative</h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Bold, artistic design with large images
              </p>
            </div>

            <div
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedStyle === "minimal"
                  ? "bg-accent/20 border border-accent neon-border"
                  : "bg-gray-100 dark:bg-gray-800 border border-transparent"
              }`}
              onClick={() => setSelectedStyle("minimal")}
            >
              <div className="h-40 bg-white dark:bg-gray-900 rounded-md mb-2 flex items-center justify-center">
                <div className="w-3/4 h-1 bg-gray-300 dark:bg-gray-700 mb-2"></div>
              </div>
              <h3 className="text-center font-medium">Minimal</h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Clean, simple design with focus on content
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button onClick={handleGenerate} disabled={generating} className="neon-button">
              {generating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Portfolio
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {personalInfo.name && (
        <Card className="cyberpunk-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gradient">Preview</h2>
              <Button variant="outline" className="border-accent hover:bg-accent/10">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">{personalInfo.name || "Your Name"}</h3>
                <p className="text-accent">{personalInfo.title || "Your Title"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
