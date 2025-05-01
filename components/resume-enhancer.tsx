"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileUp, Download, ArrowRight, Check } from "lucide-react"
import { useXP } from "./xp-provider"
import { DEEPSEEK_API_KEY, DOCRAPTOR_KEY } from "@/constants/constants"

export default function ResumeEnhancer() {
  const [file, setFile] = useState(null)
  const [extractedText, setExtractedText] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [improvedText, setImprovedText] = useState("")
  const [error, setError] = useState("")
  const { addXP } = useXP()

  const [librariesLoaded, setLibrariesLoaded] = useState({
    pdfjs: false,
    mammoth: false,
  })

  useEffect(() => {
    const loadScript = (src, onLoad) => {
      const script = document.createElement("script")
      script.src = src
      script.async = true
      script.onload = onLoad
      script.onerror = () => setError("Ошибка загрузки библиотеки")
      document.head.appendChild(script)
      return () => document.head.removeChild(script)
    }

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.min.js", () =>
      setLibrariesLoaded((prev) => ({ ...prev, pdfjs: true }))
    )

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js", () =>
      setLibrariesLoaded((prev) => ({ ...prev, mammoth: true }))
    )
  }, [])

  const handleFileChange = useCallback(
    async (e) => {
      const selectedFile = e.target.files[0]
      if (!selectedFile) return

      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]

      if (!validTypes.includes(selectedFile.type)) {
        setError("Пожалуйста, загрузите PDF или DOCX файл")
        return
      }

      setFile(selectedFile)
      setError("")
      addXP(5)

      try {
        let text = ""
        if (selectedFile.type === "application/pdf") {
          if (!librariesLoaded.pdfjs || typeof pdfjsLib === "undefined") {
            throw new Error("pdf.js не загружен")
          }
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js"
          const arrayBuffer = await selectedFile.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item) => item.str).join(" ")
            text += pageText + "\n"
          }
        } else if (
          selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          if (!librariesLoaded.mammoth || typeof mammoth === "undefined") {
            throw new Error("mammoth.js не загружен")
          }
          const arrayBuffer = await selectedFile.arrayBuffer()
          const result = await mammoth.extractRawText({ arrayBuffer })
          text = result.value
        }

        setExtractedText(text || "Текст не найден в файле")
      } catch (err) {
        console.error("Ошибка при извлечении текста:", err)
        setError(`Ошибка при чтении файла: ${err.message}`)
        setExtractedText("")
      }
    },
    [librariesLoaded, addXP]
  )

  const handleGenerate = useCallback(async () => {
    if (!extractedText) {
      setError("Сначала загрузите файл и дождитесь обработки")
      return
    }

    setGenerating(true)
    setError("")

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen/qwen2.5-vl-3b-instruct:free",
          messages: [
            {
              role: "system",
              content: `
                Вы эксперт по составлению резюме для IT-вакансий. Проанализируйте предоставленный текст резюме и выполните следующие задачи:
                1. Предложите 5-7 конкретных улучшений для позиции фронтенд-разработчика. Для каждого предложения укажите:
                   - id (уникальный номер, начиная с 1),
                   - title (название улучшения, краткое),
                   - description (почему это важно, 1-2 предложения),
                   - example (оригинальная строка из резюме, если возможно, и улучшенная версия).
                2. Верните полную улучшенную версию резюме в виде структурированного текста, строго соответствующего следующему формату:
                   - Используйте реальные данные из предоставленного резюме, а не заполнители (например, "Название учебного заведения" замените на реальное название, например, "College of Informational Technologies").
                   - Заголовок: Имя на первой строке, контакты на второй строке, разделенные "|". Контакты должны включать: город, телефон, сайт (если есть), LinkedIn (если есть), GitHub (если есть). Не включайте email, если его нет в исходном резюме. Формат телефона должен быть как в исходном резюме (например, "+77006915267").
                   - Разделы: Education, Experience, Projects, Technologies, каждый начинается с названия раздела.
                   - Education: Учреждение, даты (в формате "Month Year - Month Year"), степень, GPA (если есть), курсы (в маркированном списке с "- ").
                   - Experience: Должность, компания, город (включая "remote", если указано), даты (в формате "Month Year - Month Year"), задачи (в маркированном списке с "- ").
                   - Projects: Название, технологии, описание (в маркированном списке с "- ").
                   - Technologies: Языки и технологии, сгруппированные по категориям (например, "Languages: ...", "Technologies: ...").
                   - Подвал: Имя и номер страницы ("Имя - Page 1 of 1") на последней строке.
                   - Пустые строки между разделами и перед подвалом.
                   - Если данных для поля нет, оставьте его пустым (например, "linkedin.com/in/").
                   Пример (на основе предоставленного резюме):
                   """
                   Zhiger Zhapar
                   Pavlodar | +77006915267 | oldfrager.xyz | linkedin.com/in/zhigerzhapar | github.com/zhaparzhiger

                   Education
                   College of Informational Technologies
                   Sept 2023 - May 2026
                   BS in Software Engineering
                   - GPA: 3.9/4.0
                   - Coursework: Algorithms, Data Structures, Software Engineering, Operating Systems, Database Systems (MS level), Computer Systems Organization, Projects in Programming and Data Science, Probability and Statistics, Linear Algebra

                   Experience
                   Backend Developer (Node.js)
                   Green API, Astana, remote
                   June 2024 - February 2025
                   - Boosted WhatsApp API performance for a platform serving 50k+ users, cutting response time by 4% by resolving 3 critical bottlenecks using JMeter for load testing and JVM optimization, while implementing scalable fixes in Node.js
                   - Built and deployed a RESTful API endpoint using Express.js to manage user authentication for WhatsApp integrations, handling 10,000+ requests daily
                   - Improved system reliability by writing automated unit tests with Jest for 3 critical backend modules

                   Projects
                   Restaurant Crepe Cafe - React.js, Golang
                   - Built a responsive order management dashboard using React and Next.js, enabling real-time tracking of customer orders and reducing order processing time
                   - Implemented a dynamic cart system on the front-end with React hooks and Zustand for state management

                   Technologies
                   Languages: Java, JavaScript, TypeScript, Golang, Python
                   Technologies: React/Next.js, Vue, Angular, Express, Nest.js, Docker/Docker-Compose, PostgreSQL, Strapi

                   Zhiger Zhapar - Page 1 of 1
                   """
                Сосредоточьтесь на:
                - Добавлении ключевых слов (React, TypeScript, Next.js, CSS, JavaScript).
                - Использовании активных глаголов (разработал, внедрил, оптимизировал).
                - Структурировании (разделы: Education, Experience, Projects, Technologies).
                - Удалении устаревших данных (опыт старше 10 лет).
                - Оптимизации для ATS (стандартные заголовки, избегать сложных форматов).
                Верните ответ строго в формате JSON:
                {
                  "suggestions": [
                    {
                      "id": 1,
                      "title": "Добавить ключевые слова",
                      "description": "Ключевые слова помогают пройти ATS и привлечь внимание.",
                      "example": "Оригинал: 'Работал с веб-технологиями'. Улучшено: 'Разработал интерфейсы с использованием React и TypeScript.'"
                    }
                  ],
                  "improved_resume": "Полный текст улучшенного резюме в указанном формате..."
                }
              `,
            },
            { role: "user", content: extractedText },
          ],
          stream: false,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API ошибка:", response.status, errorText)
        let errorMessage = `Ошибка API: ${response.status} ${response.statusText}`
        if (response.status === 401) {
          errorMessage = "Неверный API-ключ. Проверьте ваш ключ на OpenRouter."
        } else if (response.status === 429) {
          errorMessage = "Превышен лимит запросов. Попробуйте позже."
        } else if (response.status === 400) {
          errorMessage = `Неверный запрос: ${errorText}`
        }
        throw new Error(errorMessage)
      }

      
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message.content) {
      let content = data.choices[0].message.content;
      let parsedResponse;

      try {
        // Попробуем сначала распарсить как чистый JSON
        parsedResponse = JSON.parse(content);
      } catch (err) {
        console.log("Попытка парсинга как чистого JSON не удалась, пробуем извлечь JSON из Markdown");

        // Попробуем извлечь JSON из блока кода Markdown
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            parsedResponse = JSON.parse(jsonMatch[1].trim());
          } catch (innerErr) {
            console.error("Ошибка парсинга JSON из Markdown:", innerErr, jsonMatch[1]);
            throw new Error("Неверный формат ответа API: не удалось извлечь JSON из Markdown");
          }
        } else {
          throw new Error("Ответ API должен содержать JSON либо напрямую, либо в блоке кода Markdown");
        }
      }

      // Проверка структуры ответа
      if (!Array.isArray(parsedResponse?.suggestions) || !parsedResponse?.improved_resume) {
        console.error("Неверная структура ответа:", parsedResponse);
        throw new Error("Ответ API должен содержать suggestions (массив) и improved_resume (строка)");
      }

      setSuggestions(parsedResponse.suggestions);
      setImprovedText(parsedResponse.improved_resume);
      setGenerated(true);
      addXP(25);
    } else {
      throw new Error("Пустой или неверный ответ API");
    }
  } catch (err) {
    // ... обработка ошибок ...
  } finally {
    setGenerating(false);
  }
  }, [extractedText, addXP])

  const handleDownload = useCallback(async () => {
    try {
      console.log("improvedText in handleDownload:", improvedText)

      // Проверка на пустой improvedText
      if (!improvedText || improvedText.trim() === "") {
        throw new Error("improvedText пустой или не содержит данных")
      }

      // Парсинг improvedText
      const lines = improvedText.split("\n").filter(line => line.trim())
      console.log("Lines after split:", lines)

      let name = ""
      let contactInfo = []
      let currentSection = null
      let educationEntries = []
      let experienceEntries = []
      let projectEntries = []
      let skillsByCategory = {}
      let currentEntry = null

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        console.log(`Processing line ${i}:`, line)

        // Заголовок (имя)
        if (i === 0) {
          name = line
          console.log("Parsed name:", name)
          continue
        }

        // Контакты
        if (i === 1 && line.includes("|")) {
          contactInfo = line.split("|").map(item => item.trim()).filter(Boolean)
          console.log("Parsed contactInfo:", contactInfo)
          continue
        }

        // Разделы
        if (["Education", "Experience", "Projects", "Technologies"].includes(line)) {
          currentSection = line
          currentEntry = null
          console.log("New section:", currentSection)
          continue
        }

        // Подвал (игнорируем, обработаем отдельно)
        if (line.includes(" - Page ") && i === lines.length - 1) {
          console.log("Skipping footer:", line)
          continue
        }

        // Обработка данных в зависимости от секции
        if (currentSection === "Education") {
          const datePattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Oct|Nov|Dec)\s\d{4}\s-\s((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Oct|Nov|Dec)\s\d{4}|Present)\b/
          if (!currentEntry) {
            currentEntry = { school: line, startDate: "", endDate: "", degree: "", location: "", gpa: "", coursework: "" }
            console.log("New education entry:", currentEntry)
            continue
          }
          if (datePattern.test(line)) {
            const [startDate, endDate] = line.split(" - ")
            currentEntry.startDate = startDate
            currentEntry.endDate = endDate
            console.log("Parsed education dates:", startDate, endDate)
            continue
          }
          if (!currentEntry.degree && !line.startsWith("- ")) {
            currentEntry.degree = line
            console.log("Parsed education degree:", currentEntry.degree)
            continue
          }
          if (line.startsWith("- GPA:")) {
            currentEntry.gpa = line.replace("- GPA:", "").trim()
            console.log("Parsed education GPA:", currentEntry.gpa)
            continue
          }
          if (line.startsWith("- Coursework:")) {
            currentEntry.coursework = line.replace("- Coursework:", "").trim()
            console.log("Parsed education coursework:", currentEntry.coursework)
            educationEntries.push(currentEntry)
            console.log("Added education entry:", currentEntry)
            currentEntry = null
            continue
          }
        }

        if (currentSection === "Experience") {
          const datePattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Oct|Nov|Dec)\s\d{4}\s-\s((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Oct|Nov|Dec)\s\d{4}|Present)\b/
          if (!currentEntry) {
            currentEntry = { title: line, company: "", location: "", startDate: "", endDate: "", description: [] }
            console.log("New experience entry:", currentEntry)
            continue
          }
          if (!currentEntry.company && !datePattern.test(line) && !line.startsWith("- ")) {
            const parts = line.split(",");
            currentEntry.company = parts[0].trim();
            currentEntry.location = parts.slice(1).join(",").trim();
            console.log("Parsed experience company and location:", currentEntry.company, currentEntry.location)
            continue
          }
          if (datePattern.test(line)) {
            const [startDate, endDate] = line.split(" - ")
            currentEntry.startDate = startDate
            currentEntry.endDate = endDate
            console.log("Parsed experience dates:", startDate, endDate)
            continue
          }
          if (line.startsWith("- ")) {
            if (currentEntry) {
              currentEntry.description.push(line.substring(2))
              console.log("Added experience description bullet:", line.substring(2))
              if (i === lines.length - 1 || !lines[i + 1].startsWith("- ")) {
                experienceEntries.push(currentEntry)
                console.log("Added experience entry:", currentEntry)
                currentEntry = null
              }
            }
            continue
          }
        }

        if (currentSection === "Projects") {
          if (!currentEntry) {
            const parts = line.split(" - ")
            currentEntry = { name: parts[0], technologies: parts[1] || "", description: [] }
            console.log("New project entry:", currentEntry)
            continue
          }
          if (line.startsWith("- ")) {
            if (currentEntry) {
              currentEntry.description.push(line.substring(2))
              console.log("Added project description bullet:", line.substring(2))
              if (i === lines.length - 1 || !lines[i + 1].startsWith("- ")) {
                projectEntries.push(currentEntry)
                console.log("Added project entry:", currentEntry)
                currentEntry = null
              }
            }
            continue
          }
        }

        if (currentSection === "Technologies") {
          const parts = line.split(":")
          if (parts.length > 1) {
            const category = parts[0].trim()
            const values = parts[1].trim().split(",").map(v => v.trim()).filter(Boolean)
            if (!skillsByCategory[category]) {
              skillsByCategory[category] = []
            }
            skillsByCategory[category].push(...values)
            console.log(`Parsed technologies - ${category}:`, values)
          }
        }
      }

      console.log("Parsed data:", {
        educationEntries,
        experienceEntries,
        projectEntries,
        skillsByCategory
      })

      // Генерация HTML с новым дизайном
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${name || "Resume"}</title>
            <style>
              @page {
                margin: 1cm;
                size: letter;
              }
              body {
                font-family: 'Times New Roman', Times, serif;
                line-height: 1.4;
                color: #000;
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
                font-size: 16pt;
                font-weight: bold;
                border-bottom: 1px solid #000;
                margin-bottom: 0.1in;
                padding-bottom: 0.05in;
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
                <h1>${name || "Your Name"}</h1>
                <div class="contact-info">
                  ${contactInfo.join(" | ")}
                </div>
              </div>

              ${
                educationEntries.length > 0
                  ? `
              <div class="section">
                <div class="section-title">Education</div>
                ${educationEntries.map(entry => `
                  <div class="entry">
                    <div class="entry-header">
                      <div>${entry.school}</div>
                      <div>${entry.startDate} – ${entry.endDate}</div>
                    </div>
                    <div class="entry-subheader">
                      <div>${entry.degree}</div>
                    </div>
                    <div class="entry-content">
                      <div class="bullet-list">
                        ${entry.gpa ? `<div class="bullet-item">GPA: ${entry.gpa}</div>` : ""}
                        ${entry.coursework ? `<div class="bullet-item">Coursework: ${entry.coursework}</div>` : ""}
                      </div>
                    </div>
                  </div>
                `).join("")}
              </div>
            `
                  : ""
              }

              ${
                experienceEntries.length > 0
                  ? `
              <div class="section">
                <div class="section-title">Experience</div>
                ${experienceEntries.map(entry => `
                  <div class="entry">
                    <div class="entry-header">
                      <div>${entry.title}</div>
                      ${entry.location ? `<div>${entry.location}</div>` : ""}
                    </div>
                    <div class="entry-subheader">
                      <div>${entry.company}</div>
                      <div>${entry.startDate} – ${entry.endDate}</div>
                    </div>
                    ${
                      entry.description.length > 0
                        ? `
                    <div class="entry-content">
                      <div class="bullet-list">
                        ${entry.description.map(bullet => `<div class="bullet-item">${bullet.trim()}</div>`).join("")}
                      </div>
                    </div>
                    `
                        : ""
                    }
                  </div>
                `).join("")}
              </div>
            `
                  : ""
              }

              ${
                projectEntries.length > 0
                  ? `
              <div class="section">
                <div class="section-title">Projects</div>
                ${projectEntries.map(proj => `
                  <div class="entry">
                    <div class="entry-header">
                      <div>
                        ${proj.name}
                        ${proj.technologies ? ` - ${proj.technologies}` : ""}
                      </div>
                    </div>
                    ${
                      proj.description.length > 0
                        ? `
                    <div class="entry-content">
                      <div class="bullet-list">
                        ${proj.description.map(bullet => `<div class="bullet-item">${bullet.trim()}</div>`).join("")}
                      </div>
                    </div>
                    `
                        : ""
                    }
                  </div>
                `).join("")}
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
                  ${Object.entries(skillsByCategory).map(([category, values]) =>
                    values.length > 0
                      ? `
                    <div style="margin-bottom: 0.1in">
                      <span class="skill-category">${category}: </span>
                      <span class="skill-items">${values.join(", ")}</span>
                    </div>
                  `
                      : ""
                  ).join("")}
                </div>
              </div>
            `
                  : ""
              }

              <div class="last-updated">
                Last updated in ${new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
              </div>

              <div class="page-number">${name || "Resume"} - Page 1</div>
            </div>
          </body>
        </html>
      `

      console.log("Generated HTML:", htmlContent)

      // Отправка HTML в DocRaptor
      const config = {
        url: 'https://api.docraptor.com/docs',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_credentials: DOCRAPTOR_KEY,
          doc: {
            document_content: htmlContent,
            type: "pdf",
            test: false,
          }
        }),
      }

      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("DocRaptor ошибка:", response.status, errorText)
        throw new Error(`Ошибка DocRaptor: ${response.status} ${errorText}`)
      }

      const pdfBlob = await response.blob()
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "enhanced_resume.pdf"
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Ошибка при создании PDF:", err)
      setError("Не удалось создать PDF для скачивания: " + err.message)
    }
  }, [improvedText])

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div>
          <h2 className="text-xl font-bold mb-4 text-primary">Your Resume</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}
          {!file ? (
            <Card className="h-[500px] flex items-center justify-center">
              <CardContent className="text-center p-6 w-full">
                <FileUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-primary">Upload your resume</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Upload your current resume (PDF or DOCX) to get AI-powered suggestions
                </p>
                <Button
                  onClick={() => document.getElementById("resume-file").click()}
                  className="bg-primary hover:bg-primary/90"
                  disabled={!librariesLoaded.pdfjs || !librariesLoaded.mammoth}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  {librariesLoaded.pdfjs && librariesLoaded.mammoth ? "Upload File" : "Loading Libraries..."}
                </Button>
                <input
                  id="resume-file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="hidden"
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[500px] overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 flex justify-between items-center">
                  <span className="text-sm font-medium">{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                    Change
                  </Button>
                </div>
                <div className="p-4 h-[calc(100%-40px)] flex items-center justify-center bg-white dark:bg-gray-900">
                  <pre className="text-sm overflow-auto w-full h-full">{extractedText || "Обработка файла..."}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {file && generated && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4 text-primary">Before / After Comparison</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Original Resume</h4>
                      <pre className="text-sm overflow-auto h-[300px] p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        {extractedText}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Enhanced Resume</h4>
                      <pre className="text-sm overflow-auto h-[300px] p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        {improvedText || "Генерация улучшенного резюме..."}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-primary">AI Suggestions</h2>
          <Card className="h-[500px] overflow-auto">
            <CardContent className="p-6">
              {!file ? (
                <div className="h-full flex items-center justify-center text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Upload your resume to get AI-powered suggestions
                  </p>
                </div>
              ) : (
                <>
                  <ul className="space-y-4 mb-6">
                    {suggestions.length > 0 ? (
                      suggestions.map((suggestion) => (
                        <li
                          key={suggestion.id}
                          className="bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:border-primary/50 transition-all duration-300"
                        >
                          <h3 className="font-bold text-primary flex items-center">
                            <Check className="h-4 w-4 mr-2" />
                            {suggestion.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {suggestion.description}
                          </p>
                          <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm italic">
                            Example: {suggestion.example}
                          </div>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        Нажмите "Generate" для получения предложений
                      </p>
                    )}
                  </ul>

                  <div className="flex justify-center">
                    {generated ? (
                      <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                        <Download className="mr-2 h-4 w-4" />
                        Download Enhanced Resume
                      </Button>
                    ) : (
                      <Button
                        onClick={handleGenerate}
                        disabled={generating || !extractedText || !!error}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {generating ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            Generate Enhanced Resume
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {file && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4 text-primary">Skills Heatmap</h3>
              <Card className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Python</span>
                      <span className="text-sm font-bold text-primary">90%</span>
                    </div>
                    <div className="simple-progress">
                      <div className="simple-progress-bar" style={{ width: "90%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">React</span>
                      <span className="text-sm font-bold text-primary">85%</span>
                    </div>
                    <div className="simple-progress">
                      <div className="simple-progress-bar" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">TypeScript</span>
                      <span className="text-sm font-bold text-primary">75%</span>
                    </div>
                    <div className="simple-progress">
                      <div className="simple-progress-bar" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">UI/UX Design</span>
                      <span className="text-sm font-bold text-primary">60%</span>
                    </div>
                    <div className="simple-progress">
                      <div className="simple-progress-bar" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Project Management</span>
                      <span className="text-sm font-bold text-primary">70%</span>
                    </div>
                    <div className="simple-progress">
                      <div className="simple-progress-bar" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}