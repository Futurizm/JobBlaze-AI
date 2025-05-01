// "use client";

// import { useState } from "react";
// import VoiceInputFull from "@/components/voice-input-full";
// import JobGrid from "@/components/job-grid";
// import { Button } from "@/components/ui/button";
// import { processTranscriptWithQwen } from "@/lib/processTranscriptWithQwen";

// export default function VoiceInputPage() {
//   const [transcript, setTranscript] = useState("");
//   const [jobs, setJobs] = useState([]);
//   const [page, setPage] = useState(0);
//   const perPage = 20;
//   const [error, setError] = useState<string | null>(null); // Добавляем состояние для ошибок

//   const fetchJobs = async (query = "", pageNum = 0) => {
//     try {
//       // Формируем URL для серверного маршрута /api/jobs
//       const response = await fetch(
//         `/api/jobs?text=${encodeURIComponent(query)}&page=${pageNum}&per_page=${perPage}`,
//         {
//           headers: {
//             "Accept": "application/json",
//           },
//           cache: "no-store", // Отключаем кэширование
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to fetch jobs");
//       }

//       const data = await response.json();
//       setJobs(data.items || []); // Устанавливаем вакансии (проверяем, что items существует)
//       setError(null); // Сбрасываем ошибку при успешном запросе
//     } catch (error) {
//       console.error("Error fetching jobs:", error);
//       setJobs([]); // Очищаем список вакансий при ошибке
//     }
//   };

//   const handleTranscriptChange = async (newTranscript: any) => {
//     setTranscript(newTranscript);
//     if (newTranscript) {
//       try {
//         // Вызываем Qwen для обработки транскрипта
//         const keywords = await processTranscriptWithQwen(newTranscript);
//         console.log("Extracted keywords:", keywords);

//         // Проверяем, что ключевые слова валидны
//         if (keywords && keywords.trim() && !keywords.includes("does not contain")) {
//           fetchJobs(keywords);
//         } else {
//           console.log("No valid keywords extracted, skipping API request.");
//           setError("No valid job-related keywords found in the transcript.");
//           setJobs([]);
//         }
//       } catch (error) {
//         console.error("Error processing transcript:", error);
//         setError("Failed to process transcript.");
//         setJobs([]);
//       }
//     }
//   };

//   const handlePageChange = (newPage: any) => {
//     if (newPage >= 0 && newPage <= 99) { // Ограничиваем пагинацию (макс. 2000 вакансий)
//       setPage(newPage);
//       fetchJobs(transcript, newPage);
//     }
//   };

//   return (
//     <div className="full-width-container">
//       <h1 className="text-3xl font-bold mb-6 text-primary">Voice Command Center</h1>
//       <VoiceInputFull onTranscriptChange={handleTranscriptChange} />
//       <div className="mt-12 w-full">
//         <h2 className="text-2xl font-bold mb-6 text-primary">Matched Jobs</h2>
//         {error && (
//           <div className="text-red-500 mb-4">
//             {error}
//           </div>
//         )}
//         <JobGrid jobs={jobs} />
//         <div className="flex justify-center mt-6">
//           <Button
//             disabled={page === 0}
//             onClick={() => handlePageChange(page - 1)}
//             className="mr-2"
//           >
//             Previous
//           </Button>
//           <Button
//             disabled={page >= 99 || jobs.length < perPage} // Отключаем "Next", если нет больше вакансий
//             onClick={() => handlePageChange(page + 1)}
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }