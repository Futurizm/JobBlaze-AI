"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  MapPin,
  DollarSign,
  FileText,
  Bookmark,
  ExternalLink,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clipboard,
  Download,
  BarChart2,
  Info,
  Send,
  StopCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GOOGLE_API_KEY } from "@/constants/constants";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchPercentage: number;
  description: string;
  posted: string;
  tags: string[];
  type: string;
  experience: string;
  remote: boolean;
  url: string;
}

interface SourceInfo {
  description: string;
  links: { title: string; url: string }[];
}

interface AutoApplyResult {
  jobId: string;
  title: string;
  company: string;
  status: "pending" | "success";
  message?: string;
}

interface JobListingsGridProps {
  skills: string;
  role: string;
  roleText: string;
  experience: string;
  workFormat: string;
  searchLogic: "AND" | "OR";
}

export default function JobListingsGrid({
  skills,
  role,
  roleText,
  experience,
  workFormat,
  searchLogic,
}: JobListingsGridProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cachedJobs, setCachedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [sentApplications, setSentApplications] = useState<AutoApplyResult[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    advantages: string[];
    disadvantages: string[];
  } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [autoApplyProgress, setAutoApplyProgress] = useState(0);
  const [autoApplyResults, setAutoApplyResults] = useState<AutoApplyResult[]>([]);
  const isStopped = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("savedJobs");
      if (saved) {
        setSavedJobs(JSON.parse(saved));
      }
      const cached = localStorage.getItem("cachedJobs");
      if (cached) {
        setCachedJobs(JSON.parse(cached));
        setJobs(JSON.parse(cached));
      }
      const sent = localStorage.getItem("sentApplications");
      if (sent) {
        const parsed = JSON.parse(sent);
        if (Array.isArray(parsed)) {
          setSentApplications(parsed);
        } else {
          console.warn("Invalid sentApplications in localStorage, resetting.");
          localStorage.setItem("sentApplications", JSON.stringify([]));
          setSentApplications([]);
        }
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err);
      localStorage.setItem("sentApplications", JSON.stringify([]));
      setSentApplications([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
  }, [savedJobs]);

  useEffect(() => {
    localStorage.setItem("cachedJobs", JSON.stringify(cachedJobs));
  }, [cachedJobs]);

  useEffect(() => {
    try {
      localStorage.setItem("sentApplications", JSON.stringify(sentApplications));
    } catch (err) {
      console.error("Error saving sentApplications to localStorage:", err);
    }
  }, [sentApplications]);

  useEffect(() => {
    setCurrentPage(0);
    setJobs([]);
    setCachedJobs([]);
    setTotalPages(1);
    setHasMore(true);
  }, [skills, role, roleText, experience, searchLogic]);

  const fetchJobs = async (page: number): Promise<Job[]> => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        page: page.toString(),
        per_page: "100",
        ...(skills && { skills: skills }),
        ...(role && { role: role }),
        ...(roleText && { roleText: roleText }),
        searchLogic,
      }).toString();

      const userAgent =
        typeof navigator !== "undefined"
          ? navigator.userAgent
          : "JobBlazeAI/1.0";

      const response = await fetch(`/api/jobs?${query}`, {
        headers: {
          "User-Agent": userAgent,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch jobs");
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const skillArray = skills ? skills.split(",").map((s) => s.trim()) : [];
        const transformedJobs = data.items.map((vacancy: any) =>
          transformVacancyToJob(vacancy, skillArray)
        );

        setJobs((prev) =>
          page === 0 ? transformedJobs : [...prev, ...transformedJobs]
        );
        setCachedJobs((prev) =>
          page === 0 ? transformedJobs : [...prev, ...transformedJobs]
        );
        setTotalPages(data.pages || 1);
        setHasMore(data.items.length === 100);
        return transformedJobs;
      } else {
        setHasMore(false);
        if (page === 0) {
          setJobs([]);
          setError("No job listings found. Try adjusting your filters.");
        }
        return [];
      }
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.message || "Failed to load job listings");
      setHasMore(false);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAutoApplying) {
      fetchJobs(currentPage);
    }
  }, [currentPage, skills, role, roleText, experience, searchLogic]);

  const fetchMore = () => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const transformVacancyToJob = (vacancy: any, skills: string[]): Job => {
    let salaryText = "Salary not specified";
    if (vacancy.salary) {
      const { from, to, currency } = vacancy.salary;
      if (from && to) {
        salaryText = `${formatCurrency(from, currency)} - ${formatCurrency(
          to,
          currency
        )}`;
      } else if (from) {
        salaryText = `From ${formatCurrency(from, currency)}`;
      } else if (to) {
        salaryText = `Up to ${formatCurrency(to, currency)}`;
      }
    }

    const location =
      vacancy.address?.city || vacancy.area?.name || "Location not specified";

    const postedDate = new Date(vacancy.published_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let postedText = "";
    if (diffDays === 0) {
      postedText = "Today";
    } else if (diffDays === 1) {
      postedText = "Yesterday";
    } else if (diffDays < 7) {
      postedText = `${diffDays} days ago`;
    } else if (diffDays < 30) {
      postedText = `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      postedText = `${Math.floor(diffDays / 30)} months ago`;
    }

    const tags: string[] = [];
    vacancy.professional_roles?.forEach((role: any) => {
      if (role.name && !tags.includes(role.name)) {
        tags.push(role.name);
      }
    });
    if (vacancy.employment && !tags.includes(vacancy.employment.name)) {
      tags.push(vacancy.employment.name);
    }

    let matchPercentage = 70;
    if (skills.length > 0) {
      const jobRequirements = [
        ...(vacancy.snippet?.requirement?.toLowerCase().split(/[,.\s]+/) || []),
        ...(vacancy.snippet?.responsibility?.toLowerCase().split(/[,.\s]+/) ||
          []),
        ...tags.map((tag) => tag.toLowerCase()),
        ...(vacancy.name?.toLowerCase().split(/[,.\s]+/) || []),
      ];

      const matchedSkills = skills.filter((skill) =>
        jobRequirements.some((req) => req.includes(skill.toLowerCase()))
      );
      matchPercentage =
        skills.length > 0
          ? Math.min(
              100,
              Math.round(
                (matchedSkills.length / Math.min(skills.length, 5)) * 100
              )
            )
          : Math.floor(Math.random() * 30) + 70;
    } else {
      matchPercentage = Math.floor(Math.random() * 30) + 70;
    }

    const isRemote =
      (vacancy.schedule?.name?.toLowerCase().includes("remote") ||
        vacancy.name?.toLowerCase().includes("remote") ||
        vacancy.name?.toLowerCase().includes("удаленн") ||
        (vacancy.snippet?.responsibility &&
          (vacancy.snippet.responsibility.toLowerCase().includes("remote") ||
            vacancy.snippet.responsibility
              .toLowerCase()
              .includes("удаленн")))) ??
      false;

    return {
      id: vacancy.id || "",
      title: vacancy.name || "Untitled Job",
      company: vacancy.employer?.name || "Unknown Company",
      location,
      salary: salaryText,
      matchPercentage,
      description:
        vacancy.snippet?.responsibility ||
        vacancy.snippet?.requirement ||
        "No description provided",
      posted: postedText,
      tags,
      type: vacancy.schedule?.name || "Not specified",
      experience: vacancy.experience?.name || "Not specified",
      remote: isRemote,
      url: vacancy.alternate_url || "",
    };
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const localeMap: { [key: string]: string } = {
      RUR: "ru-RU",
      RUB: "ru-RU",
      USD: "en-US",
      EUR: "de-DE",
      KZT: "kk-KZ",
      BYR: "be-BY",
      BYN: "be-BY",
      UZS: "uz-UZ",
      KGS: "ky-KY",
    };
    const symbolMap: { [key: string]: string } = {
      RUR: "₽",
      RUB: "₽",
      USD: "$",
      EUR: "€",
      KZT: "₸",
      BYR: "Br",
      BYN: "Br",
      UZS: "UZS",
      KGS: "KGS",
    };

    const locale = localeMap[currency] || "en-US";
    const symbol = symbolMap[currency] || currency;
    return `${symbol}${amount.toLocaleString(locale, {
      minimumFractionDigits: 0,
    })}`;
  };

  const generateCoverLetter = async (job: Job) => {
    setCoverLetterLoading(true);
    setCoverLetterError(null);
    setCoverLetter(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
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
                    text: `You are a professional job applicant writing a cover letter. Write a concise, personalized cover letter for the following job vacancy. The letter should sound natural, professional, and human-written, as if it were crafted by the applicant themselves. Avoid any phrases that suggest it was generated by AI (e.g., "As an AI," "I was trained to"). Use the applicant's skills, role, and experience to highlight their fit for the job. The letter should be engaging, show enthusiasm for the role, and connect the applicant's background to the job's requirements.

                    **Job Details**:
                    - Title: ${job.title}
                    - Company: ${job.company}
                    - Description: ${job.description}
                    - Tags: ${job.tags.join(", ")}

                    **Applicant Details**:
                    - Skills: ${skills || "Not specified"}
                    - Role: ${roleText || "Not specified"}
                    - Experience: ${experience || "Not specified"}

                    **Instructions**:
                    - Address the letter to "Hiring Manager" unless a specific name is provided.
                    - Keep the tone professional but warm and enthusiastic.
                    - Highlight 2-3 relevant skills or experiences that match the job description or tags.
                    - Mention the company name and job title explicitly to show personalization.
                    - Keep the letter concise (150-250 words).
                    - Use a standard cover letter structure: greeting, introduction, body (why you're a fit), closing.
                    - Return **only** the plain text of the cover letter, without markdown, backticks, or additional explanations.
                    - If any details are missing (e.g., skills, experience), make reasonable assumptions based on the job description but keep it general.

                    Example:
                    Dear Hiring Manager,

                    I am excited to apply for the Software Developer position at TechCorp. With over three years of experience in full-stack development and a strong proficiency in JavaScript and React, I am eager to contribute to your innovative projects. At my current role with Innovate Solutions, I led the development of a scalable web application, which aligns with TechCorp's focus on cutting-edge technology. My expertise in Agile methodologies and collaborative teamwork ensures I can thrive in your dynamic environment. I am particularly inspired by TechCorp's commitment to sustainable tech solutions and would love to bring my skills to your team.

                    Thank you for considering my application. I look forward to the opportunity to discuss how my background can contribute to TechCorp's success.

                    Sincerely,
                    [Ваше Имя]

                    Generate this letter in Russian Language

                    **Now, generate the cover letter for the job and applicant details provided above.**`,
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
      if (
        !data.candidates ||
        !Array.isArray(data.candidates) ||
        data.candidates.length === 0
      ) {
        throw new Error("No valid candidates in Gemini response");
      }

      const content = data.candidates[0].content.parts[0].text.trim();
      setCoverLetter(content);
    } catch (err: any) {
      console.error("Error generating cover letter:", err);
      setCoverLetterError(
        "Не удалось сгенерировать сопроводительное письмо. Попробуйте снова."
      );
    } finally {
      setCoverLetterLoading(false);
    }
  };

  const generateJobAnalysis = async (job: Job) => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysis(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
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
                    text: `Analyze the following job vacancy and provide a list of advantages and disadvantages. The analysis should be concise, professional, and based on the provided job details. Return the response in JSON format with two arrays: "advantages" and "disadvantages", each containing 3-5 bullet points in Russian. Avoid any phrases suggesting AI generation.

                    **Job Details**:
                    - Title: ${job.title}
                    - Company: ${job.company}
                    - Location: ${job.location}
                    - Salary: ${job.salary}
                    - Description: ${job.description}
                    - Tags: ${job.tags.join(", ")}
                    - Type: ${job.type}
                    - Experience: ${job.experience}
                    - Remote: ${job.remote ? "Yes" : "No"}

                    **Instructions**:
                    - Consider factors like salary, remote work, company reputation, job responsibilities, experience requirements, and work type.
                    - Make reasonable assumptions if details are missing, but stay grounded in the provided information.
                    - Each bullet point should be a complete sentence.
                    - Return only the JSON object, without additional explanations or markdown.

                    Example:
                    {
                      "advantages": [
                        "Высокая заработная плата соответствует рыночным стандартам.",
                        "Возможность удаленной работы обеспечивает гибкость.",
                        "Работа в известной компании повышает карьерные перспективы."
                      ],
                      "disadvantages": [
                        "Высокие требования к опыту могут быть сложными для новичков.",
                        "Ограниченные возможности карьерного роста в данной роли.",
                        "Рабочий график может быть нестабильным."
                      ]
                    }

                    **Now, generate the analysis for the job details provided above in Russian.**`,
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
      if (
        !data.candidates ||
        !Array.isArray(data.candidates) ||
        data.candidates.length === 0
      ) {
        throw new Error("No valid candidates in Gemini response");
      }

      const rawText = data.candidates[0].content.parts[0].text.trim();

      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error("Failed to extract JSON from Gemini response");
      }

      const jsonString = jsonMatch[1].trim();
      const content = JSON.parse(jsonString);

      if (!content.advantages || !content.disadvantages) {
        throw new Error(
          "Invalid JSON structure: missing advantages or disadvantages"
        );
      }

      setAnalysis(content);
    } catch (err: any) {
      console.error("Error generating job analysis:", err);
      setAnalysisError(
        "Не удалось сгенерировать анализ вакансии. Попробуйте снова."
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  const simulateJobApplication = async (job: Job): Promise<AutoApplyResult> => {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));
    return {
      jobId: job.id,
      title: job.title,
      company: job.company,
      status: "success",
      message: `Успешно подали заявку на ${job.title} в ${job.company}`,
    };
  };

  const handleAutoApply = async () => {
    if (jobs.length === 0 && !hasMore) {
      alert("Нет вакансий для автоматического отклика.");
      return;
    }

    setIsAutoApplying(true);
    isStopped.current = false;
    setAutoApplyProgress(0);
    setAutoApplyResults([]);

    let page = 0;
    let allJobs: Job[] = [...jobs];
    let totalProcessed = 0;

    console.log("Starting auto-apply with", allJobs.length, "initial jobs");

    while (hasMore && !isStopped.current) {
      if (page > 0) {
        const newJobs = await fetchJobs(page);
        allJobs = [...allJobs, ...newJobs];
        console.log("Fetched page", page, "with", newJobs.length, "jobs");
      }

      const currentPageJobs = allJobs.slice(totalProcessed);
      if (currentPageJobs.length === 0) {
        console.log("No more jobs to process, exiting loop");
        break;
      }

      setAutoApplyResults((prev) => [
        ...prev,
        ...currentPageJobs.map((job) => ({
          jobId: job.id,
          title: job.title,
          company: job.company,
          status: "pending",
        })),
      ]);

      for (const job of currentPageJobs) {
        if (isStopped.current) {
          console.log("Auto-apply stopped");
          break;
        }

        console.log("Processing job:", job.title, job.id);
        const result = await simulateJobApplication(job);
        setAutoApplyResults((prev) =>
          prev.map((item) =>
            item.jobId === job.id ? result : item
          )
        );
        setSentApplications((prev) => {
          const newApplications = [...prev, result];
          try {
            localStorage.setItem("sentApplications", JSON.stringify(newApplications));
            console.log("Added application for", job.title, "Total applications:", newApplications.length);
          } catch (err) {
            console.error("Error saving to localStorage:", err);
          }
          return newApplications;
        });
        totalProcessed++;
        setAutoApplyProgress(Math.min((totalProcessed / (allJobs.length || 1)) * 100, 100));
      }

      if (!isStopped.current && hasMore) {
        page++;
      }
    }

    if (isStopped.current) {
      console.log("Auto-apply cancelled, resetting results");
      setAutoApplyResults([]);
      setAutoApplyProgress(0);
    }
    setIsAutoApplying(false);
    isStopped.current = false;
    console.log("Auto-apply finished, total applications:", sentApplications.length);
  };

  const handleStopAutoApply = () => {
    isStopped.current = true;
    setIsAutoApplying(false);
    setAutoApplyProgress(0);
    setAutoApplyResults([]);
    console.log("Stop button clicked, stopping auto-apply");
  };

  const handleResetSentApplications = () => {
    if (confirm("Вы уверены, что хотите сбросить все отправленные отклики? Это действие нельзя отменить.")) {
      setSentApplications([]);
      localStorage.setItem("sentApplications", JSON.stringify([]));
      console.log("Sent applications reset");
    }
  };

  const handleGenerateCoverLetter = (job: Job) => {
    setSelectedJob(job);
    setShowModal(true);
    setCoverLetter(null);
    setCoverLetterError(null);
    generateCoverLetter(job);
  };

  const handleAnalyzeJob = (job: Job) => {
    setSelectedJob(job);
    setShowAnalysisModal(true);
    setAnalysis(null);
    setAnalysisError(null);
    generateJobAnalysis(job);
  };

  const toggleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter((id) => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  const handleApplyNow = (job: Job) => {
    if (job.url) {
      window.open(job.url, "_blank");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "saved" && !savedJobs.includes(job.id)) return false;
    return true;
  });

  const handleCopyCoverLetter = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      alert("Cover letter copied to clipboard!");
    }
  };

  const handleDownloadCoverLetter = () => {
    if (coverLetter) {
      const blob = new Blob([coverLetter], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Cover_Letter_${selectedJob?.title}_${selectedJob?.company}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const hasHeadhunterSecret = !!process.env.NEXT_PUBLIC_HEADHUNTER_SECRET;

  return (
    <div className="w-full max-w-none !mx-0 !px-0 !my-0 mb-12">
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
          50% {
            text-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
          }
        }
        @keyframes buttonPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .shimmer-animation {
          background: linear-gradient(
            90deg,
            #3b82f6 25%,
            #60a5fa 50%,
            #3b82f6 75%
          );
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        .glow-animation {
          animation: glow 1.5s ease-in-out infinite;
        }
        .spinner-color {
          animation: colorSpin 2s linear infinite;
        }
        @keyframes colorSpin {
          0% {
            color: #3b82f6;
          }
          50% {
            color: #1d4ed8;
          }
          100% {
            color: #3b82f6;
          }
        }
        .status-transition {
          transition: all 0.4s ease-in-out;
          transform: translateY(10px) scale(0.95);
          opacity: 0;
        }
        .status-transition.show {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        .button-pulse {
          animation: buttonPulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Filters
          </Button>
          {!isAutoApplying ? (
            <Button
            variant="default"
            size="sm"
            onClick={handleAutoApply}
            disabled={jobs.length === 0 || !hasMore || !hasHeadhunterSecret}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !hasHeadhunterSecret
                ? "Авто-отклик недоступен: отсутствует конфигурация HeadHunter"
                : undefined
            }
          >
            <Send className="h-4 w-4 mr-2" />
            Авто-отклик на все
          </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopAutoApply}
              className="bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 transition-transform button-pulse"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Остановить
            </Button>
          )}
          {activeTab === "sent" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSentApplications}
              className="border-red-500 text-red-500 hover:bg-red-100"
            >
              Сбросить отклики
            </Button>
          )}
        </div>
        {skills && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Skills:</span>
            {skills.split(",").map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill.trim()}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {isAutoApplying && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Loader2 className="h-5 w-5 mr-2 spinner-color" />
            Процесс авто-отклика
          </h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
            <div
              className="h-2.5 rounded-full shimmer-animation"
              style={{ width: `${autoApplyProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Отправлено{" "}
            <span className="font-semibold text-blue-500 glow-animation transition-all duration-200">
              {autoApplyResults.filter((r) => r.status === "success").length}
            </span>{" "}
            откликов
          </p>
        </div>
      )}

      {autoApplyResults.length > 0 && !isAutoApplying && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Результаты авто-отклика</h3>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {autoApplyResults.map((result, index) => (
              <li
                key={index}
                className={`text-sm p-2 rounded flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 status-transition ${
                  result.status === "success" ? "show" : ""
                }`}
              >
                {result.status === "pending" && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-500" />
                )}
                {result.status === "success" && (
                  <svg
                    className="h-4 w-4 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                <span>
                  {result.title} в {result.company}: {result.message || "В процессе..."}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="saved">
              Saved Jobs ({savedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent Applications ({sentApplications.length})
            </TabsTrigger>
          </TabsList>

          {error && jobs.length === 0 && activeTab !== "sent" ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => fetchJobs(0)}>Retry</Button>
            </div>
          ) : (
            <>
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.map((job, index) => (
                    <JobCard
                      key={job.id + index}
                      job={job}
                      isSaved={savedJobs.includes(job.id)}
                      onSave={() => toggleSaveJob(job.id)}
                      onGenerateCoverLetter={() =>
                        handleGenerateCoverLetter(job)
                      }
                      onApply={() => handleApplyNow(job)}
                      onAnalyze={() => handleAnalyzeJob(job)}
                    />
                  ))}
                </div>

                {filteredJobs.length === 0 && (
                  <div className="text-center py-12">
                    <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No matching jobs found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Try adjusting your filters or uploading a resume for more
                      personalized results
                    </p>
                    <Button
                      onClick={() => {
                        setCurrentPage(0);
                        setJobs([]);
                        setCachedJobs([]);
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saved" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={true}
                      onSave={() => toggleSaveJob(job.id)}
                      onGenerateCoverLetter={() =>
                        handleGenerateCoverLetter(job)
                      }
                      onApply={() => handleApplyNow(job)}
                      onAnalyze={() => handleAnalyzeJob(job)}
                    />
                  ))}
                </div>

                {filteredJobs.length === 0 && (
                  <div className="text-center py-12">
                    <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No saved jobs yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Save jobs you're interested in to view them later
                    </p>
                    <Button onClick={() => setActiveTab("all")}>
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sent" className="mt-0">
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Отправленные отклики</h3>
                  {sentApplications.length > 0 ? (
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                      {sentApplications.map((application, index) => (
                        <li
                          key={index}
                          className="text-sm p-2 rounded flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        >
                          <svg
                            className="h-4 w-4 mr-2 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            {application.title} в {application.company}: {application.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12">
                      <Send className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Нет отправленных откликов
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Используйте авто-отклик или подайте заявку вручную, чтобы увидеть их здесь
                      </p>
                      <Button onClick={() => setActiveTab("all")}>
                        Найти вакансии
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {hasMore && activeTab !== "sent" && (
                <div className="flex justify-center mt-6">
                  <Button onClick={fetchMore} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </Tabs>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
        {activeTab !== "sent" && (
          <div className="flex items-center mx-2">
            <span className="text-sm font-medium">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        )}
      </div>

      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Cover Letter for {selectedJob.title}
            </h2>
            {coverLetterLoading ? (
              <div className="text-center py-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-2">Generating cover letter...</p>
              </div>
            ) : coverLetterError ? (
              <div className="text-center py-4">
                <p className="text-red-500 mb-4">{coverLetterError}</p>
                <Button onClick={() => generateCoverLetter(selectedJob)}>
                  Retry
                </Button>
              </div>
            ) : coverLetter ? (
              <div className="mb-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 p-4 rounded">
                  {coverLetter}
                </pre>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={handleCopyCoverLetter}>
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={handleDownloadCoverLetter}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mb-4">
                Generating a personalized cover letter for {selectedJob.title}{" "}
                at {selectedJob.company}...
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAnalysisModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Анализ вакансии: {selectedJob.title}
            </h2>
            {analysisLoading ? (
              <div className="text-center py-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-2">Анализируем вакансию...</p>
              </div>
            ) : analysisError ? (
              <div className="text-center py-4">
                <p className="text-red-500 mb-4">{analysisError}</p>
                <Button onClick={() => generateJobAnalysis(selectedJob)}>
                  Повторить
                </Button>
              </div>
            ) : analysis ? (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Преимущества:</h3>
                <ul className="list-disc pl-5 mb-4">
                  {analysis.advantages.map((advantage, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-800 dark:text-gray-200"
                    >
                      {advantage}
                    </li>
                  ))}
                </ul>
                <h3 className="text-lg font-semibold mb-2">Недостатки:</h3>
                <ul className="list-disc pl-5">
                  {analysis.disadvantages.map((disadvantage, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-800 dark:text-gray-200"
                    >
                      {disadvantage}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mb-4">
                Анализируем вакансию {selectedJob.title} в компании{" "}
                {selectedJob.company}...
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAnalysisModal(false)}
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onSave: () => void;
  onGenerateCoverLetter: () => void;
  onApply: () => void;
  onAnalyze: () => void;
}

function JobCard({
  job,
  isSaved,
  onSave,
  onGenerateCoverLetter,
  onApply,
  onAnalyze,
}: JobCardProps) {
  const [sourceInfo, setSourceInfo] = useState<SourceInfo | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);

  const fetchSourceInfo = async () => {
    setSourceLoading(true);
    setSourceError(null);
    setSourceInfo(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
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
                    text: `You are a job search assistant tasked with providing additional information and useful links for a job vacancy. Based on the provided job details, search for relevant information about the company, industry, or role, and provide a concise description along with 2-4 useful links (e.g., company website, LinkedIn page, industry articles, or career resources). Return the response in JSON format with a "description" field (in Russian, 50-100 words) and a "links" array containing objects with "title" and "url" fields. Ensure the links are valid and relevant. Avoid any phrases suggesting AI generation.

                    **Job Details**:
                    - Title: ${job.title}
                    - Company: ${job.company}
                    - Location: ${job.location}
                    - Description: ${job.description}
                    - Tags: ${job.tags.join(", ")}

                    **Instructions**:
                    - The description should summarize the company background, industry context, or role relevance in Russian.
                    - Links should include the company website (if available), a professional network page (e.g., LinkedIn), or relevant articles/resources.
                    - Return only the JSON object, without markdown or additional explanations.
                    - If specific details are unavailable, make reasonable assumptions but prioritize accuracy.

                    Example:
                    {
                      "description": "Компания TechCorp — лидер в разработке программного обеспечения, специализирующийся на облачных решениях. Основана в 2010 году, она активно расширяет штат разработчиков для работы над инновационными проектами.",
                      "links": [
                        { "title": "Сайт TechCorp", "url": "https://techcorp.com" },
                        { "title": "LinkedIn TechCorp", "url": "https://linkedin.com/company/techcorp" },
                        { "title": "Статья о разработке ПО", "url": "https://example.com/article" }
                      ]
                    }

                    **Now, generate the source information for the job details provided above in Russian.**`,
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
      if (
        !data.candidates ||
        !Array.isArray(data.candidates) ||
        data.candidates.length === 0
      ) {
        throw new Error("No valid candidates in Gemini response");
      }

      const rawText = data.candidates[0].content.parts[0].text.trim();
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error("Failed to extract JSON from Gemini response");
      }

      const jsonString = jsonMatch[1].trim();
      const content = JSON.parse(jsonString);

      if (!content.description || !content.links) {
        throw new Error(
          "Invalid JSON structure: missing description or links"
        );
      }

      setSourceInfo(content);
    } catch (err: any) {
      console.error("Error fetching source info:", err);
      setSourceError(
        "Не удалось загрузить дополнительную информацию. Попробуйте снова."
      );
    } finally {
      setSourceLoading(false);
    }
  };

  const toggleSourceInfo = () => {
    if (!showSource && !sourceInfo && !sourceError) {
      fetchSourceInfo();
    }
    setShowSource(!showSource);
  };

  return (
    <Card className="job-card border-2 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
        </div>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
          <Building className="h-4 w-4 mr-1" />
          <span>{job.company}</span>
        </div>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{job.location}</span>
          {job.remote && (
            <Badge variant="outline" className="ml-2 text-xs">
              Remote
            </Badge>
          )}
        </div>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <DollarSign className="h-4 w-4 mr-1" />
          <span>{job.salary}</span>
        </div>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <Clock className="h-4 w-4 mr-1" />
          <span>
            {job.type} • {job.experience}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-2 job-card-content">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
          {job.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {job.tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20"
            >
              {tag}
            </Badge>
          ))}
          {job.tags.length > 3 && (
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              +{job.tags.length - 3} more
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Posted {job.posted}
        </p>
      </CardContent>
      <CardContent className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center"
          onClick={toggleSourceInfo}
        >
          <Info className="h-4 w-4 mr-1" />
          {showSource ? "Скрыть информацию" : "Дополнительная информация"}
        </Button>
        {showSource && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
            {sourceLoading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2 text-sm">Загружаем информацию...</p>
              </div>
            ) : sourceError ? (
              <div className="text-center py-4">
                <p className="text-red-500 text-sm mb-4">{sourceError}</p>
                <Button variant="outline" size="sm" onClick={fetchSourceInfo}>
                  Повторить
                </Button>
              </div>
            ) : sourceInfo ? (
              <div>
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                  {sourceInfo.description}
                </p>
                <h4 className="text-sm font-semibold mb-2">Полезные ссылки:</h4>
                <ul className="list-disc pl-5">
                  {sourceInfo.links.map((link, index) => (
                    <li key={index} className="text-sm">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Загружаем дополнительную информацию...
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-2 job-card-footer">
        <div className="flex justify-between w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/10 flex-1"
            onClick={onSave}
          >
            {isSaved ? (
              <>
                <Bookmark className="h-4 w-4 mr-1 fill-primary" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 flex-1"
            onClick={onAnalyze}
          >
            <BarChart2 className="h-4 w-4 mr-1" />
            Анализ
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 flex-1"
            onClick={onGenerateCoverLetter}
          >
            <FileText className="h-4 w-4 mr-1" />
            Cover Letter
          </Button>
        </div>
        <Button
          className="w-full bg-secondary hover:bg-secondary/90"
          onClick={onApply}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  );
} 