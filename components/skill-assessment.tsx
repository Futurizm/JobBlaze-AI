"use client"

import { useState } from "react"
import { Clock, Code, Database, FileText, LineChart, MessageSquare, PenTool } from "lucide-react"

const skillCategories = [
  {
    id: "technical",
    name: "Technical Skills",
    description: "Assess your programming and technical abilities",
    skills: [
      { id: "javascript", name: "JavaScript", questions: 15, time: "20 min" },
      { id: "react", name: "React", questions: 12, time: "15 min" },
      { id: "sql", name: "SQL", questions: 10, time: "12 min" },
      { id: "python", name: "Python", questions: 15, time: "20 min" },
    ],
  },
  {
    id: "soft",
    name: "Soft Skills",
    description: "Evaluate your interpersonal and communication abilities",
    skills: [
      { id: "communication", name: "Communication", questions: 10, time: "15 min" },
      { id: "teamwork", name: "Teamwork", questions: 8, time: "12 min" },
      { id: "problem-solving", name: "Problem Solving", questions: 12, time: "18 min" },
      { id: "time-management", name: "Time Management", questions: 10, time: "15 min" },
    ],
  },
  {
    id: "industry",
    name: "Industry Knowledge",
    description: "Test your knowledge in specific industries",
    skills: [
      { id: "marketing", name: "Digital Marketing", questions: 15, time: "20 min" },
      { id: "finance", name: "Finance", questions: 12, time: "18 min" },
      { id: "healthcare", name: "Healthcare", questions: 15, time: "20 min" },
      { id: "data-science", name: "Data Science", questions: 12, time: "18 min" },
    ],
  },
]

// Sample questions for JavaScript assessment
const javascriptQuestions = [
  {
    id: 1,
    question: "What will be the output of the following code?\n\nconsole.log(typeof null);",
    options: [
      { id: "a", text: "null" },
      { id: "b", text: "undefined" },
      { id: "c", text: "object" },
      { id: "d", text: "string" },
    ],
    correctAnswer: "c",
  },
  {
    id: 2,
    question: "Which of the following is not a JavaScript data type?",
    options: [
      { id: "a", text: "String" },
      { id: "b", text: "Boolean" },
      { id: "c", text: "Float" },
      { id: "d", text: "Symbol" },
    ],
    correctAnswer: "c",
  },
  {
    id: 3,
    question: "What does the '===' operator do in JavaScript?",
    options: [
      { id: "a", text: "Checks for equality of values only" },
      { id: "b", text: "Checks for equality of values and types" },
      { id: "c", text: "Assigns a value to a variable" },
      { id: "d", text: "Checks if a variable is defined" },
    ],
    correctAnswer: "b",
  },
  {
    id: 4,
    question: "Which method is used to add elements to the end of an array?",
    options: [
      { id: "a", text: "push()" },
      { id: "b", text: "pop()" },
      { id: "c", text: "shift()" },
      { id: "d", text: "unshift()" },
    ],
    correctAnswer: "a",
  },
  {
    id: 5,
    question: "What is the correct way to create a function in JavaScript?",
    options: [
      { id: "a", text: "function = myFunction() {}" },
      { id: "b", text: "function:myFunction() {}" },
      { id: "c", text: "function myFunction() {}" },
      { id: "d", text: "create myFunction() {}" },
    ],
    correctAnswer: "c",
  },
]

const getSkillIcon = (skillId: string) => {
  switch (skillId) {
    case "javascript":
    case "react":
    case "python":
      return <Code className="h-5 w-5" />
    case "sql":
      return <Database className="h-5 w-5" />
    case "communication":
    case "teamwork":
      return <MessageSquare className="h-5 w-5" />
    case "problem-solving":
    case "time-management":
      return <Clock className="h-5 w-5" />
    case "marketing":
    case "finance":
    case "data-science":
      return <LineChart className="h-5 w-5" />
    case "healthcare":
      return <FileText className="h-5 w-5" />
    default:
      return <PenTool className="h-5 w-5" />
  }
}

export function SkillAssessment() {
  const [activeTab, setActiveTab] = useState("technical")
  const [selectedSkill, setSelectedSkill] = useState("")
}
