"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(20);
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

  useEffect(() => {
    const saved = localStorage.getItem("savedJobs");
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
    const cached = localStorage.getItem("cachedJobs");
    if (cached) {
      setCachedJobs(JSON.parse(cached));
      setJobs(JSON.parse(cached));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
  }, [savedJobs]);

  useEffect(() => {
    localStorage.setItem("cachedJobs", JSON.stringify(cachedJobs));
  }, [cachedJobs]);

  useEffect(() => {
    setCurrentPage(0);
    setJobs([]);
    setCachedJobs([]);
    setTotalPages(1);
    setHasMore(true);
  }, [skills, role, roleText, experience, searchLogic]);

  const fetchJobs = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
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
        setHasMore(data.items.length === parseInt(perPage.toString()));
      } else {
        setHasMore(false);
        if (page === 0) {
          setJobs([]);
          setError("No job listings found. Try adjusting your filters.");
        }
      }
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.message || "Failed to load job listings");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage, perPage, skills, role, roleText, experience, searchLogic]);

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

      // Strip Markdown code block syntax (e.g., ```json ... ```)
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error("Failed to extract JSON from Gemini response");
      }

      const jsonString = jsonMatch[1].trim();
      const content = JSON.parse(jsonString);

      // Validate the parsed content structure
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

  return (
    <div className="w-full max-w-none !mx-0 !px-0 !my-0 mb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Filters
          </Button>
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
          </TabsList>

          {error && jobs.length === 0 ? (
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

              {hasMore && (
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Items per page:</span>
          <Select
            value={perPage.toString()}
            onValueChange={(value) => setPerPage(Number.parseInt(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={perPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-2" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center mx-2">
            <span className="text-sm font-medium">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages - 1 || !hasMore}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(totalPages - 1)}
            disabled={currentPage === totalPages - 1 || !hasMore}
          >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-2" />
          </Button>
        </div>
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
