"use client";

import { Button } from "@/components/ui/button";
import { FileUp, Zap } from "lucide-react";
import { useXP } from "./xp-provider";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface HeroSectionProps {
  onResumeParsed: (data: {
    skills: string;
    role: string;
    roleText: string;
    experience: string;
    workFormat: string;
    searchLogic: "AND" | "OR"; // Добавляем searchLogic
  }) => void;
}

export default function HeroSection({ onResumeParsed }: HeroSectionProps) {
  const { addXP } = useXP();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);

  // Функция для анализа текста через Gemini
  async function analyzeTextWithGemini(text: string) {
    try {
      console.log("Sending to Gemini:", text);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCLIB1yGy-lyyXbyWr5mebsmC46GCHx6Dk`,
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
                    text: `You are a job search assistant. Analyze the provided text and extract job search parameters in a natural language way. The text may be in Russian or English, short or long, and may contain typos or non-standard spellings (e.g., "radise" for "Redis", "Кассандра" for "Cassandra"). Correct typos where possible and extract:

                    - Skills: Programming languages, frameworks, tools, or domains (e.g., JavaScript, React, AWS, Data Science, SQL, Redis, Cassandra). Return as an array of strings.
                    - Role: Job title (e.g., developer, engineer, manager). Return as an object with "roleText" (e.g., "developer") and "roleId" based on this mapping: developer, programmer, разработчик, программист, software, fullstack: "96"; engineer, инженер: "25"; manager, менеджер: "70"; designer, дизайнер: "34"; analyst, аналитик: "10"; architect, архитектор: "104"; qa, tester, тестировщик: "148"; administrator, администратор: "3"; driver, водитель: "24"; teacher, учитель: "119"; doctor, врач: "29"; nurse, медсестра: "63". If no role is found, use {"roleText": "unknown", "roleId": "unknown"}.
                    - Experience: Years or months of experience (e.g., "1 year", "6 months"). Return as a string. If not found, use "".
                    - Work format: Remote, office, or hybrid (e.g., удалённо, в офисе, гибрид). Return as a string. If not found, use "".

                    Return **only** a valid JSON object with the following structure and nothing else:
                    {"skills": [], "role": {"roleText": "", "roleId": ""}, "experience": "", "workFormat": ""}

                    Do NOT include any markdown (e.g., \`\`\`json, \`\`\`), backticks (\`), explanations, or additional text outside the JSON object. If the text is unclear or contains errors, return the default JSON structure with empty or "unknown" values.

                    Examples:
                    - Input: "Я хочу работу C++ программиста, год опыта, удалённо"
                      Output: {"skills": ["C++"], "role": {"roleText": "developer", "roleId": "96"}, "experience": "1 year", "workFormat": "remote"}
                    - Input: "Ищу вакансию разработчика на Kotlin с опытом 2 года в офисе"
                      Output: {"skills": ["Kotlin"], "role": {"roleText": "developer", "roleId": "96"}, "experience": "2 years", "workFormat": "office"}
                    - Input: "Хочу быть TypeScript разработчиком"
                      Output: {"skills": ["TypeScript"], "role": {"roleText": "developer", "roleId": "96"}, "experience": "", "workFormat": ""}
                    - Input: "Найди мне вакансию р разработчика который владеет SQL radise и Кассандра"
                      Output: {"skills": ["SQL", "Redis", "Cassandra"], "role": {"roleText": "developer", "roleId": "96"}, "experience": "", "workFormat": ""}


                    Also if I say something like this "Ищу программиста C++ с навыками SQL, Cassandra и тд.", then it should give only those vacances that have these skills. Same goes for other skills. If I say "Ищу программиста Python с навыками Rust, ScyllaDB и тд.", then it should give only those vacances that have these skills. Same goes for other skills.

                    Text: ${text}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Raw Gemini response:", data);

      if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        console.error("Invalid Gemini response: candidates is empty or undefined");
        throw new Error("No valid candidates in Gemini response");
      }

      let content = data.candidates[0].content.parts[0].text;
      console.log("Raw Gemini response content:", content);

      content = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/`/g, "")
        .trim();
      console.log("Cleaned Gemini content:", content);

      let result;
      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[0]);
          } catch (secondParseError) {
            console.error("Second JSON parse attempt failed:", secondParseError);
            throw new Error("Invalid Gemini response format");
          }
        } else {
          throw new Error("No valid JSON found in Gemini response");
        }
      }

      if (
        Array.isArray(result.skills) &&
        result.role &&
        typeof result.role.roleText === "string" &&
        typeof result.role.roleId === "string" &&
        typeof result.experience === "string" &&
        typeof result.workFormat === "string"
      ) {
        console.log("Successfully extracted:", result);
        return result;
      } else {
        throw new Error("Invalid Gemini response structure");
      }
    } catch (error) {
      console.error("Gemini error:", error);
      setError("Failed to analyze text with AI");
      return {
        skills: [],
        role: { roleText: "unknown", roleId: "unknown" },
        experience: "",
        workFormat: "",
      };
    }
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = "ru-RU";
      recog.continuous = false;
      recog.interimResults = false;

      recog.onresult = async (event) => {
        const transcript = event.results[0][0].transcript.trim();
        setTranscript(transcript);
        console.log("Recognized speech:", transcript);

        try {
          console.log("Attempting to analyze with Gemini...");
          const result = await analyzeTextWithGemini(transcript);
          console.log("Extracted from speech:", result);

          onResumeParsed({
            skills: result.skills.join(","),
            role: result.role.roleId,
            roleText: result.role.roleText,
            experience: result.experience,
            workFormat: result.workFormat,
            searchLogic: "AND", // Voice Input использует AND
          });
          addXP(10);
        } catch (err) {
          console.error("Error analyzing speech:", err);
          setError("Failed to analyze speech");
        }
      };

      recog.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recog.onend = () => {
        console.log("Speech recognition ended");
        setIsRecording(false);
      };

      setRecognition(recog);
    } else {
      setError("Speech recognition is not supported in this browser.");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onResumeParsed, addXP]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onResumeParsed({
          skills: result.skills || "",
          role: result.role || "unknown",
          roleText: result.roleText || "unknown",
          experience: result.experience || "",
          workFormat: result.workFormat || "",
          searchLogic: "OR", // Upload Resume использует OR
        });
        addXP(10);
      } else {
        const errorText = await response.text();
        setError(errorText || "Failed to parse resume");
      }
    } catch (err) {
      setError("Failed to upload resume");
    } finally {
      setUploading(false);
      setFile(null);
      const input = document.getElementById("resume-upload") as HTMLInputElement;
      if (input) input.value = "";
    }
  };

  const toggleRecording = () => {
    if (!recognition) {
      setError("Speech recognition is not available.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        console.log("Starting speech recognition...");
        recognition.start();
        setIsRecording(true);
        setError(null);
        setTranscript(null);
      } catch (err) {
        console.error("Speech recognition start error:", err);
        setError("Failed to start speech recognition. Please check microphone permissions.");
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="hero-section">
      <div className="hero-content max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        >
          Power Up Your Career with JobBlaze AI ⚡
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300"
        >
          The cutting-edge job search platform designed for young professionals
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <label htmlFor="resume-upload" className="relative">
              <Button
                size="lg"
                disabled={uploading}
                className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                onClick={() => document.getElementById("resume-upload")?.click()}
              >
                <FileUp className="mr-2 h-5 w-5" />
                {uploading ? "Uploading..." : file ? "Upload Resume" : "Select Resume"}
              </Button>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {file && (
              <Button
                type="submit"
                size="lg"
                disabled={uploading}
                className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
              >
                Submit
              </Button>
            )}
          </form>

          <Button
            size="lg"
            variant="outline"
            className={`border-primary hover:bg-primary/10 hover:text-primary shadow-sm hover:shadow-md transition-all relative ${
              isRecording ? "animate-pulse bg-primary/20" : ""
            }`}
            onClick={toggleRecording}
            disabled={!recognition}
          >
            <Zap className={`mr-2 h-5 w-5 text-primary ${isRecording ? "animate-spin" : ""}`} />
            <span>{isRecording ? "Listening..." : "Voice Command"}</span>
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/50"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </Button>
        </motion.div>

        {transcript && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-sm text-gray-500 mt-4"
          >
            You said: {transcript}
          </motion.p>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-red-500 mt-4"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}