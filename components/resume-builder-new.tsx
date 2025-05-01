"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash, Download, ArrowRight, Check, AlertCircle, Send } from "lucide-react"
import { useXP } from "./xp-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DOCRAPTOR_KEY } from "@/constants/constants"

const GOOGLE_API_KEY = "AIzaSyCLIB1yGy-lyyXbyWr5mebsmC46GCHx6Dk"

export function ResumeBuilderNew() {
  const [activeTab, setActiveTab] = useState("personal")
  const [personalInfo, setPersonalInfo] = useState({
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/janesmith",
    website: "janesmith.dev",
    summary: "",
  })

  const [experiences, setExperiences] = useState([
    {
      id: 1,
      title: "Software Engineer",
      company: "Tech Innovations Inc.",
      location: "San Francisco, CA",
      startDate: "2022-01",
      endDate: "2024-06",
      description: `Developed a scalable REST API using Node.js and Express, improving system response time by 30%\nLed a team of 4 engineers to implement a microservices architecture, reducing deployment time by 25%\nWrote comprehensive unit tests with Jest, achieving 95% code coverage`,
    },
    {
      id: 2,
      title: "Junior Developer",
      company: "Startup Solutions",
      location: "Seattle, WA",
      startDate: "2020-06",
      endDate: "2021-12",
      description: `Built responsive front-end interfaces using React and Tailwind CSS, enhancing user engagement by 20%\nIntegrated third-party APIs for payment processing, streamlining checkout flows\nCollaborated with designers to implement pixel-perfect UI components`,
    },
  ])

  const [education, setEducation] = useState([
    {
      id: 1,
      degree: "Bachelor of Science in Computer Science",
      school: "Stanford University",
      location: "Stanford, CA",
      startDate: "2016-09",
      endDate: "2020-05",
      gpa: "3.8/4.0",
      coursework: "Algorithms, Data Structures, Operating Systems, Machine Learning",
    },
  ])

  const [skills, setSkills] = useState([
    { id: 1, name: "Languages: JavaScript, TypeScript, Python, Java" },
    { id: 2, name: "Frameworks: React, Node.js, Express, Django" },
    { id: 3, name: "Tools: Git, Docker, AWS, Jest" },
  ])

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Restaurant Crepe Cafe",
      technologies: "React, Next.js, Golang",
      link: "github.com/janesmith/crepe-cafe",
      description: `Built a responsive order management dashboard using React and Next.js\nImplemented a dynamic cart system with React hooks and Zustand\nDeveloped a Golang backend with RESTful APIs for order processing`,
      period: "2024",
    },
    {
      id: 2,
      name: "Task Manager App",
      technologies: "React Native, Firebase",
      link: "github.com/janesmith/task-manager",
      description: `Created a cross-platform mobile app for task management using React Native\nIntegrated Firebase for real-time database and user authentication\nDesigned intuitive UI/UX, increasing user retention by 15%`,
      period: "2023",
    },
  ])

  const [previewReady, setPreviewReady] = useState(false)
  const { addXP } = useXP()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // DocRaptor API key management
  const [apiKey, setApiKey] = useState(DOCRAPTOR_KEY)
  const [hasKey, setHasKey] = useState(false)
  const [isKeyLoading, setIsKeyLoading] = useState(false)
  const [keyError, setKeyError] = useState("")
  const [keySuccess, setKeySuccess] = useState("")

  // Mini-chat state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)

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

  const handleProjectChange = (id, field, value) => {
    setProjects(projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)))
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

  const addProject = () => {
    const newId = projects.length > 0 ? Math.max(...projects.map((proj) => proj.id)) + 1 : 1
    setProjects([
      ...projects,
      {
        id: newId,
        name: "",
        technologies: "",
        link: "",
        description: "",
        period: "",
      },
    ])
  }

  const removeProject = (id) => {
    if (projects.length > 1) {
      setProjects(projects.filter((proj) => proj.id !== id))
    }
  }

  const saveApiKey = () => {
    try {
      setKeyError("")
      setKeySuccess("")

      if (!apiKey.trim()) {
        setKeyError("Please enter a valid API key")
        return
      }

      localStorage.setItem("docraptor_api_key", apiKey)
      setHasKey(true)
      setKeySuccess("API key saved successfully!")

      addXP(10)
    } catch (err) {
      console.error("Failed to save API key:", err)
      setKeyError("Failed to save API key. Please try again.")
    }
  }

  useEffect(() => {
    const savedKey = localStorage.getItem("docraptor_api_key")
    if (savedKey) {
      setApiKey(savedKey)
      setHasKey(true)
    }
  }, [])

  // Generate ATS-friendly resume HTML using Gemini
  const generateResumeWithGemini = async (prompt) => {
    setIsChatLoading(true)
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a professional resume writer. Generate an ATS-friendly HTML resume based on the following prompt. The resume should be visually appealing yet simple, clean, and optimized for Applicant Tracking Systems (ATS) with no complex formatting, tables, or graphics. Use a professional font (Arial, Helvetica, sans-serif), clear section headings, and a logical structure. Include minimal CSS for readability (e.g., font sizes, margins, padding, and subtle borders) while ensuring ATS compatibility. If the prompt lacks details, make reasonable assumptions to fill in missing information (e.g., company names, dates, locations) based on the context provided, ensuring a complete and professional resume.

                    **Prompt**: ${prompt}

                    **Instructions**:
                    - Return only the plain HTML content of the resume, without markdown, backticks, or additional explanations.
                    - Structure the resume with sections: Contact Information, Professional Summary, Experience, Education, Skills, and Projects (if applicable).
                    - Use semantic HTML (e.g., <h1>, <h2>, <ul>, <li>) for clarity.
                    - Format dates as "MM/YYYY" or "Present" for current roles.
                    - Keep the tone professional and avoid phrases that suggest AI generation (e.g., "As an AI").
                    - For missing details, assume a typical candidate profile for the role (e.g., a software engineer with relevant skills, experience, and education). Use generic but plausible placeholders (e.g., "Tech Solutions Inc." for company, "New York, NY" for location).
                    - Include at least two experience entries, one education entry, and relevant skills unless specified otherwise.
                    - Ensure the resume is visually appealing with consistent spacing, clear hierarchy, and subtle styling (e.g., borders under section headings, proper bullet point alignment).

                    Example:
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="utf-8">
                      <title>Resume</title>
                      <style>
                        body {
                          font-family: Arial, Helvetica, sans-serif;
                          margin: 0;
                          padding: 0.5in;
                          line-height: 1.5;
                          color: #333;
                        }
                        .container {
                          max-width: 8.5in;
                          margin: 0 auto;
                        }
                        h1 {
                          font-size: 24pt;
                          text-align: center;
                          margin: 0 0 10px 0;
                        }
                        .contact-info {
                          text-align: center;
                          font-size: 10pt;
                          margin-bottom: 20px;
                        }
                        h2 {
                          font-size: 14pt;
                          border-bottom: 1px solid #ccc;
                          padding-bottom: 5px;
                          margin: 20px 0 10px 0;
                        }
                        h3 {
                          font-size: 12pt;
                          margin: 10px 0 5px 0;
                        }
                        p, li {
                          font-size: 10pt;
                          margin: 5px 0;
                        }
                        ul {
                          margin: 10px 0;
                          padding-left: 20px;
                        }
                        li {
                          margin-bottom: 5px;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <h1>John Doe</h1>
                        <div class="contact-info">
                          Email: john.doe@example.com | Phone: +1 (555) 123-4567 | Location: New York, NY | LinkedIn: linkedin.com/in/johndoe
                        </div>
                        <h2>Professional Summary</h2>
                        <p>Experienced Software Engineer with 5 years of expertise in full-stack development...</p>
                        <h2>Experience</h2>
                        <h3>Software Engineer - TechCorp</h3>
                        <p>New York, NY | 01/2020 - Present</p>
                        <ul>
                          <li>Developed scalable REST APIs using Node.js...</li>
                        </ul>
                        <h3>Junior Developer - Innovate Solutions</h3>
                        <p>Seattle, WA | 06/2018 - 12/2019</p>
                        <ul>
                          <li>Built responsive front-end interfaces...</li>
                        </ul>
                        <h2>Education</h2>
                        <h3>Bachelor of Science in Computer Science - NYU</h3>
                        <p>New York, NY | 09/2014 - 05/2018</p>
                        <h2>Skills</h2>
                        <ul>
                          <li>JavaScript, TypeScript, Python</li>
                          <li>React, Node.js, Express</li>
                        </ul>
                        <h2>Projects</h2>
                        <h3>Task Manager App</h3>
                        <p>Developed a cross-platform mobile app...</p>
                        <ul>
                          <li>Integrated Firebase for real-time data...</li>
                        </ul>
                      </div>
                    </body>
                    </html>

                    **Now, generate the ATS-friendly HTML resume based on the prompt provided above.**`
                  },
                ],
              },
            ],
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini API failed: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        throw new Error("No valid candidates in Gemini response")
      }

      const htmlContent = data.candidates[0].content.parts[0].text.trim()
      return htmlContent
    } catch (err) {
      console.error("Error generating resume with Gemini:", err)
      throw new Error("Failed to generate resume. Please try again.")
    } finally {
      setIsChatLoading(false)
    }
  }

  // Generate PDF from Gemini-generated HTML using DocRaptor
  const generatePdfFromGemini = async (htmlContent) => {
    try {
      setIsGeneratingPdf(true)
      const docRaptorApiKey = apiKey || localStorage.getItem("docraptor_api_key")

      if (!docRaptorApiKey) {
        throw new Error("Please set your DocRaptor API key first")
      }

      const response = await fetch("https://api.docraptor.com/docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_credentials: docRaptorApiKey,
          doc: {
            document_content: htmlContent,
            type: "pdf",
            test: false,
            prince_options: {
              media: "screen",
            },
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DocRaptor API error: ${errorText}`)
      }

      const pdfBlob = await response.blob()
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = personalInfo.name
        ? personalInfo.name.replace(/\s+/g, "_").toLowerCase() + "_resume.pdf"
        : "resume.pdf"
      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      addXP(50)
    } catch (error) {
      console.error("Error generating PDF:", error)
      throw new Error(`Failed to generate PDF: ${error.message}`)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Check if the prompt is likely requesting a full resume
  const isResumeGenerationPrompt = (input) => {
    const lowerInput = input.toLowerCase()
    // Explicit keywords in English and Russian
    const explicitKeywords = [
      "generate resume",
      "create resume",
      "создать резюме",
      "сгенерировать резюме",
      "build resume",
      "make resume",
      "full resume",
      "полное резюме",
    ]
    if (explicitKeywords.some((keyword) => lowerInput.includes(keyword))) {
      return true
    }

    // Heuristic: Look for developer-related terms or experience descriptions
    const developerTerms = [
      "developer",
      "программист",
      "разработчик",
      "full-stack",
      "фулл-стек",
      "frontend",
      "backend",
      "фронтенд",
      "бэкенд",
      "years of experience",
      "лет опыта",
      "skills",
      "навыки",
      "projects",
      "проекты",
      "technologies",
      "технологии",
      // Common tech stacks
      "react",
      "node.js",
      "typescript",
      "javascript",
      "python",
      "golang",
      "docker",
      "postgresql",
      "mongodb",
      "redis",
      "tailwind",
      "vue.js",
      "angular",
      "express",
      "nestjs",
      "hono",
      "bun",
      "mysql",
      "blockchain",
      "wordpress",
      "strapi",
      "openai",
      "telegram",
    ]
    // Check for at least one developer-related term
    const hasDeveloperContext = developerTerms.some((term) => lowerInput.includes(term))

    return hasDeveloperContext
  }

  // Handle chat submission
  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return

    const userMessage = { role: "user", content: chatInput }
    setChatMessages([...chatMessages, userMessage])
    setChatInput("")
    setIsChatLoading(true)

    try {
      // Check if the prompt is requesting a full resume
      if (isResumeGenerationPrompt(chatInput)) {
        const htmlContent = await generateResumeWithGemini(chatInput)
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: {
              type: "resume",
              content: "Resume generated successfully! Click below to download the PDF.",
              html: htmlContent,
            },
          },
        ])
      } else {
        // Existing AI response logic for other prompts
        const aiResponse = await generateAIResponse(chatInput)
        setChatMessages((prev) => [...prev, { role: "assistant", content: aiResponse }])
      }
    } catch (error) {
      console.error("Error processing chat:", error)
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: { type: "error", content: error.message } },
      ])
    } finally {
      setIsChatLoading(false)
    }
  }

  // Mock AI response function for non-resume prompts
  const generateAIResponse = async (prompt) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (prompt.toLowerCase().includes("professional summary")) {
          resolve({
            type: "summary",
            content: "Results-driven Software Engineer with over 5 years of experience in designing and developing scalable web applications. Proficient in JavaScript, React, and Node.js, with a proven track record of improving system performance by 30% through optimized code and microservices architecture. Adept at leading cross-functional teams and delivering high-quality solutions under tight deadlines.",
          })
        } else if (prompt.toLowerCase().includes("experience") || prompt.toLowerCase().includes("job")) {
          resolve({
            type: "experience",
            content: {
              title: "Senior Software Engineer",
              company: "Innovate Tech Solutions",
              location: "Remote",
              startDate: "2023-01",
              endDate: "",
              description: `Spearheaded the development of a cloud-based SaaS platform using AWS and React, increasing user retention by 25%\nImplemented CI/CD pipelines with GitHub Actions, reducing deployment time by 40%\nMentored 3 junior developers, fostering a culture of code quality and collaboration`,
            },
          })
        } else if (prompt.toLowerCase().includes("skills")) {
          resolve({
            type: "skills",
            content: "Languages: JavaScript, TypeScript, Python\nFrameworks: React, Next.js, Express\nTools: AWS, Docker, Git",
          })
        } else {
          resolve({
            type: "general",
            content: "I'm not sure what you're asking for. Could you specify what part of the resume you'd like help with (e.g., summary, experience, skills)? Alternatively, describe your experience and skills to generate a full resume (e.g., 'I am a developer with 5 years of experience in React and Node.js').",
          })
        }
      }, 1000)
    })
  }

  // Apply AI-generated content to resume
  const applyAIContent = (response) => {
    if (response.type === "summary") {
      setPersonalInfo((prev) => ({ ...prev, summary: response.content }))
      addXP(20)
    } else if (response.type === "experience") {
      const newId = experiences.length > 0 ? Math.max(...experiences.map((exp) => exp.id)) + 1 : 1
      setExperiences((prev) => [...prev, { id: newId, ...response.content }])
      addXP(20)
    } else if (response.type === "skills") {
      const newSkills = response.content
        .split("\n")
        .map((skill, index) => ({
          id: skills.length > 0 ? Math.max(...skills.map((s) => s.id)) + 1 + index : 1 + index,
          name: skill,
        }))
      setSkills((prev) => [...prev, ...newSkills])
      addXP(20)
    }
  }

  // Generate resume HTML from form data
  const generateResumeHTML = () => {
    const skillsByCategory = {}
    skills.forEach((skill) => {
      if (!skill.name) return

      const parts = skill.name.split(":")
      if (parts.length > 1) {
        const category = parts[0].trim()
        const values = parts[1].trim()

        if (!skillsByCategory[category]) {
          skillsByCategory[category] = []
        }

        if (values) {
          skillsByCategory[category].push(values)
        }
      } else {
        if (!skillsByCategory["Other"]) {
          skillsByCategory["Other"] = []
        }
        skillsByCategory["Other"].push(skill.name.trim())
      }
    })

    const formatDate = (dateString) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${personalInfo.name || "Resume"}</title>
          <style>
            @page {
              margin: 1cm;
              size: letter;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              line-height: 1.5;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 8.5in;
              margin: 0 auto;
              padding: 0.5in;
            }
            .header {
              text-align: center;
              margin-bottom: 0.3in;
            }
            .header h1 {
              font-size: 24pt;
              margin: 0 0 0.1in 0;
              font-weight: bold;
            }
            .contact-info {
              font-size: 10pt;
              margin-top: 0.1in;
            }
            .section {
              margin-bottom: 0.3in;
            }
            .section-title {
              font-size: 14pt;
              font-weight: bold;
              border-bottom: 1px solid #ccc;
              padding-bottom: 0.05in;
              margin-bottom: 0.1in;
            }
            .entry {
              margin-bottom: 0.2in;
            }
            .entry-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              font-size: 12pt;
            }
            .entry-subheader {
              display: flex;
              justify-content: space-between;
              font-style: italic;
              font-size: 11pt;
            }
            .entry-content {
              margin-top: 0.05in;
            }
            .bullet-list {
              margin: 0.05in 0 0 0.2in;
              padding-left: 0.1in;
            }
            .bullet-item {
              position: relative;
              margin-bottom: 0.05in;
              padding-left: 0.15in;
            }
            .bullet-item:before {
              content: "•";
              position: absolute;
              left: 0;
            }
            .skills-list {
              margin: 0.05in 0;
            }
            .skill-category {
              font-weight: bold;
              display: inline;
            }
            .skill-items {
              display: inline;
            }
            .last-updated {
              font-size: 9pt;
              text-align: right;
              margin-top: 0.1in;
              color: #666;
            }
            .page-number {
              font-size: 9pt;
              text-align: center;
              margin-top: 0.2in;
              color: #666;
            }
            a {
              color: #000;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${personalInfo.name || "Your Name"}</h1>
              <div class="contact-info">
                ${[
                  personalInfo.location,
                  personalInfo.phone,
                  personalInfo.website,
                  personalInfo.linkedin,
                  personalInfo.email,
                ]
                  .filter(Boolean)
                  .join(" | ")}
              </div>
            </div>

            ${
              personalInfo.summary
                ? `
              <div class="section">
                <div class="section-title">Professional Summary</div>
                <div class="entry-content">
                  <p>${personalInfo.summary.replace(/\n/g, "<br>")}</p>
                </div>
              </div>
            `
                : ""
            }

            ${
              education.some((edu) => edu.school || edu.degree)
                ? `
              <div class="section">
                <div class="section-title">Education</div>
                ${education
                  .map((edu) =>
                    edu.school || edu.degree
                      ? `
                  <div class="entry">
                    <div class="entry-header">
                      <div>${edu.school || "University"}</div>
                      <div>
                        ${
                          edu.startDate || edu.endDate
                            ? `${formatDate(edu.startDate)} – ${edu.endDate ? formatDate(edu.endDate) : "Present"}`
                            : ""
                        }
                      </div>
                    </div>
                    ${
                      edu.degree
                        ? `
                    <div class="entry-subheader">
                      <div>${edu.degree}</div>
                      ${edu.location ? `<div>${edu.location}</div>` : ""}
                    </div>
                    `
                        : ""
                    }
                    <div class="entry-content">
                      <div class="bullet-list">
                        ${edu.gpa ? `<div class="bullet-item">GPA: ${edu.gpa}</div>` : ""}
                        ${edu.coursework ? `<div class="bullet-item">Coursework: ${edu.coursework}</div>` : ""}
                      </div>
                    </div>
                  </div>
                `
                      : "",
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            ${
              experiences.some((exp) => exp.title || exp.company)
                ? `
              <div class="section">
                <div class="section-title">Experience</div>
                ${experiences
                  .map((exp) =>
                    exp.title || exp.company
                      ? `
                  <div class="entry">
                    <div class="entry-header">
                      <div>${exp.title || "Position"}</div>
                      ${exp.location ? `<div>${exp.location}</div>` : ""}
                    </div>
                    <div class="entry-subheader">
                      <div>${exp.company || "Company"}</div>
                      <div>
                        ${
                          exp.startDate || exp.endDate
                            ? `${formatDate(exp.startDate)} – ${exp.endDate ? formatDate(exp.endDate) : "Present"}`
                            : ""
                        }
                      </div>
                    </div>
                    ${
                      exp.description
                        ? `
                    <div class="entry-content">
                      <div class="bullet-list">
                        ${exp.description
                          .split("\n")
                          .filter(Boolean)
                          .map((bullet) => `<div class="bullet-item">${bullet.trim()}</div>`)
                          .join("")}
                      </div>
                    </div>
                    `
                        : ""
                    }
                  </div>
                `
                      : "",
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            ${
              projects.some((proj) => proj.name)
                ? `
              <div class="section">
                <div class="section-title">Projects</div>
                ${projects
                  .map((proj) =>
                    proj.name
                      ? `
                  <div class="entry">
                    <div class="entry-header">
                      <div>
                        ${proj.name}
                        ${proj.technologies ? ` - ${proj.technologies}` : ""}
                      </div>
                      ${proj.period ? `<div>${proj.period}</div>` : ""}
                    </div>
                    ${
                      proj.link
                        ? `
                    <div class="entry-subheader">
                      <div>
                        <a href="${proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}">${proj.link}</a>
                      </div>
                    </div>
                    `
                        : ""
                    }
                    ${
                      proj.description
                        ? `
                    <div class="entry-content">
                      <div class="bullet-list">
                        ${proj.description
                          .split("\n")
                          .filter(Boolean)
                          .map((bullet) => `<div class="bullet-item">${bullet.trim()}</div>`)
                          .join("")}
                      </div>
                    </div>
                    `
                        : ""
                    }
                  </div>
                `
                      : "",
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            ${
              Object.keys(skillsByCategory).length > 0
                ? `
              <div class="section">
                <div class="section-title">Technologies</div>
                <div class="skills-list">
                  ${Object.entries(skillsByCategory)
                    .map(([category, values]) =>
                      values.length > 0
                        ? `
                    <div style="margin-bottom: 0.1in">
                      <span class="skill-category">${category}: </span>
                      <span class="skill-items">${values.join(", ")}</span>
                    </div>
                  `
                        : "",
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }

            <div class="last-updated">
              Last updated in ${new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
            </div>

            <div class="page-number">${personalInfo.name || "Resume"} - Page 1</div>
          </div>
        </body>
      </html>
    `
  }

  // Generate PDF from form data
  const generateResume = async () => {
    try {
      setIsGeneratingPdf(true)

      const docRaptorApiKey = apiKey || localStorage.getItem("docraptor_api_key")

      if (!docRaptorApiKey) {
        setIsGeneratingPdf(false)
        alert("Please set your DocRaptor API key first")
        setActiveTab("apikey")
        return
      }

      const htmlContent = generateResumeHTML()

      const response = await fetch("https://api.docraptor.com/docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_credentials: docRaptorApiKey,
          doc: {
            document_content: htmlContent,
            type: "pdf",
            test: false,
            prince_options: {
              media: "screen",
            },
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DocRaptor API error: ${errorText}`)
      }

      const pdfBlob = await response.blob()
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = personalInfo.name
        ? personalInfo.name.replace(/\s+/g, "_").toLowerCase() + "_resume.pdf"
        : "resume.pdf"
      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      addXP(50)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert(`Failed to generate PDF: ${error.message}`)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleNextTab = () => {
    if (activeTab === "personal") setActiveTab("experience")
    else if (activeTab === "experience") setActiveTab("education")
    else if (activeTab === "education") setActiveTab("projects")
    else if (activeTab === "projects") setActiveTab("skills")
    else if (activeTab === "skills") {
      setPreviewReady(true)
      setActiveTab("preview")
      addXP(30)
    }
  }

  const handlePrevTab = () => {
    if (activeTab === "experience") setActiveTab("personal")
    else if (activeTab === "education") setActiveTab("experience")
    else if (activeTab === "projects") setActiveTab("education")
    else if (activeTab === "skills") setActiveTab("projects")
    else if (activeTab === "preview") setActiveTab("skills")
    else if (activeTab === "ai") setActiveTab("preview")
  }

  return (
    <div className="w-full">
      <Card className="w-full border-0 shadow-none">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8">
              <TabsList className="w-full grid grid-cols-7 mb-2">
                <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Personal Info
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Experience
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Education
                </TabsTrigger>
                <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Projects
                </TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Skills
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  AI Assistant
                </TabsTrigger>
              </TabsList>

              <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width:
                      activeTab === "personal"
                        ? "14.29%"
                        : activeTab === "experience"
                          ? "28.57%"
                          : activeTab === "education"
                            ? "42.86%"
                            : activeTab === "projects"
                              ? "57.14%"
                              : activeTab === "skills"
                                ? "71.43%"
                                : activeTab === "preview"
                                  ? "85.71%"
                                  : "100%",
                  }}
                ></div>
              </div>
            </div>

            <TabsContent value="personal" className="mt-0">
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={personalInfo.name}
                        onChange={handlePersonalInfoChange}
                        className="mt-1"
                        placeholder="John Doe"
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
                        placeholder="john@example.com"
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
                        placeholder="+1 (555) 123-4567"
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
                        placeholder="New York, NY"
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
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website/Portfolio</Label>
                      <Input
                        id="website"
                        name="website"
                        value={personalInfo.website}
                        onChange={handlePersonalInfoChange}
                        className="mt-1"
                        placeholder="johndoe.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="summary">Professional Summary (Optional)</Label>
                      <Textarea
                        id="summary"
                        name="summary"
                        value={personalInfo.summary}
                        onChange={handlePersonalInfoChange}
                        className="mt-1"
                        rows={4}
                        placeholder="Write a brief summary of your professional background..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleNextTab} className="bg-primary hover:bg-primary/90">
                      Next: Experience
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="mt-0">
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Work Experience</h3>
                    <Button onClick={addExperience} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Experience
                    </Button>
                  </div>

                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="mb-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 relative">
                      <div className="absolute top-4 right-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(exp.id)}
                          disabled={experiences.length <= 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>

                      <h4 className="text-lg font-medium mb-4">Position {index + 1}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`job-title-${exp.id}`}>Job Title</Label>
                          <Input
                            id={`job-title-${exp.id}`}
                            value={exp.title}
                            onChange={(e) => handleExperienceChange(exp.id, "title", e.target.value)}
                            className="mt-1"
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`company-${exp.id}`}>Company</Label>
                          <Input
                            id={`company-${exp.id}`}
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                            className="mt-1"
                            placeholder="Tech Company Inc."
                          />
                        </div>
                        <div>
                          <Label htmlFor={`location-${exp.id}`}>Location</Label>
                          <Input
                            id={`location-${exp.id}`}
                            value={exp.location}
                            onChange={(e) => handleExperienceChange(exp.id, "location", e.target.value)}
                            className="mt-1"
                            placeholder="New York, NY"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`start-date-${exp.id}`}>Start Date</Label>
                            <Input
                              id={`start-date-${exp.id}`}
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => handleExperienceChange(exp.id, "startDate", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`end-date-${exp.id}`}>End Date</Label>
                            <Input
                              id={`end-date-${exp.id}`}
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => handleExperienceChange(exp.id, "endDate", e.target.value)}
                              className="mt-1"
                              placeholder="Present"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`description-${exp.id}`}>Description (use new lines for bullet points)</Label>
                          <Textarea
                            id={`description-${exp.id}`}
                            value={exp.description}
                            onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                            className="mt-1"
                            rows={4}
                            placeholder="Developed a RESTful API endpoint using Express.js to manage user authentication\nImproved system reliability by writing automated unit tests with Jest\nBoosted performance by resolving critical bottlenecks"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={handlePrevTab}>
                      Back
                    </Button>
                    <Button onClick={handleNextTab} className="bg-primary hover:bg-primary/90">
                      Next: Education
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="mt-0">
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Education</h3>
                    <Button onClick={addEducation} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Education
                    </Button>
                  </div>

                  {education.map((edu, index) => (
                    <div key={edu.id} className="mb-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 relative">
                      <div className="absolute top-4 right-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(edu.id)}
                          disabled={education.length <= 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>

                      <h4 className="text-lg font-medium mb-4">Education {index + 1}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`school-${edu.id}`}>School/University</Label>
                          <Input
                            id={`school-${edu.id}`}
                            value={edu.school}
                            onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                            className="mt-1"
                            placeholder="University Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                          <Input
                            id={`degree-${edu.id}`}
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                            className="mt-1"
                            placeholder="Bachelor of Science in Computer Science"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edu-location-${edu.id}`}>Location</Label>
                          <Input
                            id={`edu-location-${edu.id}`}
                            value={edu.location}
                            onChange={(e) => handleEducationChange(edu.id, "location", e.target.value)}
                            className="mt-1"
                            placeholder="City, State"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`edu-start-date-${edu.id}`}>Start Date</Label>
                            <Input
                              id={`edu-start-date-${edu.id}`}
                              type="month"
                              value={edu.startDate}
                              onChange={(e) => handleEducationChange(edu.id, "startDate", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edu-end-date-${edu.id}`}>End Date</Label>
                            <Input
                              id={`edu-end-date-${edu.id}`}
                              type="month"
                              value={edu.endDate}
                              onChange={(e) => handleEducationChange(edu.id, "endDate", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`gpa-${edu.id}`}>GPA (Optional)</Label>
                          <Input
                            id={`gpa-${edu.id}`}
                            value={edu.gpa}
                            onChange={(e) => handleEducationChange(edu.id, "gpa", e.target.value)}
                            className="mt-1"
                            placeholder="3.8/4.0"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`coursework-${edu.id}`}>Coursework (Optional)</Label>
                          <Input
                            id={`coursework-${edu.id}`}
                            value={edu.coursework}
                            onChange={(e) => handleEducationChange(edu.id, "coursework", e.target.value)}
                            className="mt-1"
                            placeholder="Algorithms, Data Structures, Software Engineering"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={handlePrevTab}>
                      Back
                    </Button>
                    <Button onClick={handleNextTab} className="bg-primary hover:bg-primary/90">
                      Next: Projects
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="mt-0">
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Projects</h3>
                    <Button onClick={addProject} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Project
                    </Button>
                  </div>

                  {projects.map((proj, index) => (
                    <div key={proj.id} className="mb-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800 relative">
                      <div className="absolute top-4 right-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(proj.id)}
                          disabled={projects.length <= 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>

                      <h4 className="text-lg font-medium mb-4">Project {index + 1}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`project-name-${proj.id}`}>Project Name</Label>
                          <Input
                            id={`project-name-${proj.id}`}
                            value={proj.name}
                            onChange={(e) => handleProjectChange(proj.id, "name", e.target.value)}
                            className="mt-1"
                            placeholder="Restaurant Crepe Cafe"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`project-tech-${proj.id}`}>Technologies Used</Label>
                          <Input
                            id={`project-tech-${proj.id}`}
                            value={proj.technologies}
                            onChange={(e) => handleProjectChange(proj.id, "technologies", e.target.value)}
                            className="mt-1"
                            placeholder="React.js, Golang"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`project-link-${proj.id}`}>Project Link (Optional)</Label>
                          <Input
                            id={`project-link-${proj.id}`}
                            value={proj.link}
                            onChange={(e) => handleProjectChange(proj.id, "link", e.target.value)}
                            className="mt-1"
                            placeholder="github.com/username/project"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`project-period-${proj.id}`}>Time Period (Optional)</Label>
                          <Input
                            id={`project-period-${proj.id}`}
                            value={proj.period}
                            onChange={(e) => handleProjectChange(proj.id, "period", e.target.value)}
                            className="mt-1"
                            placeholder="2024-2025"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`project-desc-${proj.id}`}>
                            Description (use new lines for bullet points)
                          </Label>
                          <Textarea
                            id={`project-desc-${proj.id}`}
                            value={proj.description}
                            onChange={(e) => handleProjectChange(proj.id, "description", e.target.value)}
                            className="mt-1"
                            rows={4}
                            placeholder="Built a responsive order management dashboard using React and Next.js\nImplemented a dynamic cart system on the front-end with React hooks and Zustand"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={handlePrevTab}>
                      Back
                    </Button>
                    <Button onClick={handleNextTab} className="bg-primary hover:bg-primary/90">
                      Next: Skills
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="mt-0">
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Skills & Technologies</h3>
                    <Button onClick={addSkill} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Skill
                    </Button>
                  </div>

                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-amber-800 text-sm">
                      Tip: For better organization, use the format "Category: Skill1, Skill2, Skill3" (e.g., "Languages:
                      Java, JavaScript, TypeScript")
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {skills.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2">
                        <Input
                          value={skill.name}
                          onChange={(e) => handleSkillChange(skill.id, e.target.value)}
                          className="flex-1"
                          placeholder="Languages: Java, JavaScript, TypeScript"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSkill(skill.id)}
                          disabled={skills.length <= 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={handlePrevTab}>
                      Back
                    </Button>
                    <Button onClick={handleNextTab} className="bg-primary hover:bg-primary/90">
                      Preview Resume
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  {previewReady ? (
                    <div className="space-y-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-3xl font-bold">{personalInfo.name || "Your Name"}</h2>
                          <div className="flex flex-wrap gap-2 mt-2 text-smگیtext-gray-600">
                            {personalInfo.location && <span>{personalInfo.location}</span>}
                            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                            {personalInfo.website && <span>• {personalInfo.website}</span>}
                            {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
                            {personalInfo.email && <span>• {personalInfo.email}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={handlePrevTab}>
                            Edit
                          </Button>
                          <Button
                            onClick={generateResume}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isGeneratingPdf}
                          >
                            {isGeneratingPdf ? (
                              <>
                                <span className="animate-spin mr-2">⏳</span>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {personalInfo.summary && (
                        <div>
                          <h3 className="text-xl font-bold border-b pb-1 mb-2">Professional Summary</h3>
                          <p className="text-gray-700">{personalInfo.summary}</p>
                        </div>
                      )}

                      {education.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold border-b pb-1 mb-2">Education</h3>
                          <div className="space-y-4">
                            {education.map((edu) => (
                              <div key={edu.id} className="mb-4">
                                <div className="flex justify-between">
                                  <h4 className="text-lg font-semibold">{edu.school || "School Name"}</h4>
                                  <span className="text-gray-600">
                                    {edu.startDate && edu.endDate
                                      ? `${new Date(edu.startDate).toLocaleDateString("en-US", {
                                          month: "short",
                                          year: "numeric",
                                        })} – ${new Date(edu.endDate).toLocaleDateString("en-US", {
                                          month: "short",
                                          year: "numeric",
                                        })}`
                                      : "Date Range"}
                                  </span>
                                </div>
                                <p className="text-gray-800 italic">{edu.degree || "Degree"}</p>
                                {edu.gpa && <p className="mt-1 text-gray-700">• GPA: {edu.gpa}</p>}
                                {edu.coursework && <p className="mt-1 text-gray-700">• Coursework: {edu.coursework}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {experiences.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold border-b pb-1 mb-2">Experience</h3>
                          <div className="space-y-4">
                            {experiences.map((exp) => (
                              <div key={exp.id} className="mb-4">
                                <div className="flex justify-between">
                                  <h4 className="text-lg font-semibold">{exp.title || "Position Title"}</h4>
                                  <span className="text-gray-600">{exp.location || "Location"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <p className="text-gray-800 italic">{exp.company || "Company Name"}</p>
                                  <span className="text-gray-600">
                                    {exp.startDate && exp.endDate
                                      ? `${new Date(exp.startDate).toLocaleDateString("en-US", {
                                          month: "short",
                                          year: "numeric",
                                        })} – ${new Date(exp.endDate).toLocaleDateString("en-US", {
                                          month: "short",
                                          year: "numeric",
                                        })}`
                                      : "Date Range"}
                                  </span>
                                </div>
                                {exp.description && (
                                  <div className="mt-2 text-gray-700">
                                    {exp.description.split("\n").map((bullet, i) =>
                                      bullet.trim() ? (
                                        <p
                                          key={i}
                                          className="ml-4 relative before:content-['•'] before:absolute before:left-[-1em]"
                                        >
                                          {bullet}
                                        </p>
                                      ) : null,
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {projects.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold border-b pb-1 mb-2">Projects</h3>
                          <div className="space-y-4">
                            {projects.map((proj) => (
                              <div key={proj.id} className="mb-4">
                                <div className="flex justify-between">
                                  <h4 className="text-lg font-semibold">
                                    {proj.name} {proj.technologies && ` - ${proj.technologies}`}
                                  </h4>
                                  {proj.link && <span className="text-blue-600">{proj.link}</span>}
                                </div>
                                {proj.period && (
                                  <div className="text-right">
                                    <span className="text-gray-600">{proj.period}</span>
                                  </div>
                                )}
                                {proj.description && (
                                  <div className="mt-2 text-gray-700">
                                    {proj.description.split("\n").map((bullet, i) =>
                                      bullet.trim() ? (
                                        <p
                                          key={i}
                                          className="ml-4 relative before:content-['•'] before:absolute before:left-[-1em]"
                                        >
                                          {bullet}
                                        </p>
                                      ) : null,
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {skills.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold border-b pb-1 mb-2">Technologies</h3>
                          <div className="space-y-2">
                            {skills.map((skill) => (
                              <div key={skill.id} className="text-gray-700">
                                {skill.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-8 flex justify-center">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-green-700">
                          <Check className="h-5 w-5" />
                          <span>Your resume is ready! Click "Download PDF" to save it.</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-xl font-bold mb-2">Complete all sections first</h3>
                      <p className="text-gray-600 mb-4">
                        Please fill out all the required sections before previewing your resume.
                      </p>
                      <Button onClick={() => setActiveTab("personal")} className="bg-primary hover:bg-primary/90">
                        Start Building
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>AI Resume Assistant</CardTitle>
                  <CardDescription>
                    Describe your experience and skills (e.g., "I am a full-stack developer with 6 years of experience in React and Node.js") to generate a full ATS-friendly resume, or ask for specific resume sections (e.g., "Generate a professional summary for a software engineer").
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    {chatMessages.length === 0 ? (
                      <p className="text-gray-500 text-center mt-20">Start by typing a prompt below...</p>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`mb-4 ${
                            msg.role === "user" ? "text-right" : "text-left"
                          }`}
                        >
                          <div
                            className={`inline-block p-3 rounded-lg ${
                              msg.role === "user"
                                ? "bg-primary text-white"
                                : msg.content.type === "error"
                                  ? "bg-red-50 text-red-800 border border-red-200"
                                  : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                            }`}
                          >
                            {msg.role === "user" ? (
                              msg.content
                            ) : msg.content.type === "error" ? (
                              msg.content.content
                            ) : msg.content.type === "resume" ? (
                              <div>
                                <p>{msg.content.content}</p>
                                <Button
                                  size="sm"
                                  className="mt-2 bg-green-600 hover:bg-green-700"
                                  onClick={() => generatePdfFromGemini(msg.content.html)}
                                  disabled={isGeneratingPdf}
                                >
                                  {isGeneratingPdf ? (
                                    <>
                                      <span className="animate-spin mr-2">⏳</span>
                                      Generating PDF...
                                    </>
                                  ) : (
                                    <>
                                      <Download className="mr-2 h-4 w-4" />
                                      Download Resume PDF
                                    </>
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <p>{typeof msg.content.content === "string" ? msg.content.content : JSON.stringify(msg.content.content)}</p>
                                {msg.content.type !== "general" && (
                                  <Button
                                    size="sm"
                                    className="mt-2 bg-green-600 hover:bg-green-700"
                                    onClick={() => applyAIContent(msg.content)}
                                  >
                                    Apply to Resume
                                    <Check className="ml-2 h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Describe your experience and skills to generate a resume..."
                      onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
                      disabled={isChatLoading}
                    />
                    <Button
                      onClick={handleChatSubmit}
                      className="bg-primary hover:bg-primary/90"
                      disabled={isChatLoading}
                    >
                      {isChatLoading ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={handlePrevTab}>
                    Back to Preview
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}