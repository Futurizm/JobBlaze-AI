import { GOOGLE_API_KEY } from "@/constants/constants";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid or missing text" }, { status: 400 });
    }

    console.log("Analyzing text:", text.substring(0, 200) + "...");

    // Прямой запрос к Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
        GOOGLE_API_KEY || "AIzaSyCLIB1yGy-lyyXbyWr5mebsmC46GCHx6Dk"
      }`,
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

                    Do not include any explanations, markdown, or additional text outside the JSON object. If the text is unclear or contains errors, return the default JSON structure with empty or "unknown" values.

                    Examples:
                    - Input: "Я хочу работу C++ программиста, год опыта, удалённо"
                      Output: {"skills": ["C++"], "role": {"roleText": "developer", "roleId": "96"}, "experience": "1 year", "workFormat": "remote"}
                    - Input: "Ищу вакансию разработчика на Kotlin с опытом 2 года в офисе"
                      Output: {"skills": ["Kotlin"], "role": {"roleText": "developer", "roleId": "96"}, "experience": "2 years", "workFormat": "office"}
                    - Input: "Найди мне вакансию р разработчика который владеет SQL radise и Кассандра"
                      Output: {"skills": ["SQL", "Redis", "Cassandra"], "role": {"roleText": "developer", "roleId": "96"}, "experience": "", "workFormat": ""}

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

    // Проверка структуры ответа
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error("Invalid Gemini response: candidates is empty or undefined");
      throw new Error("No valid candidates in Gemini response");
    }

    const content = data.candidates[0].content.parts[0].text;
    console.log("Raw Gemini response content:", content);

    // Попытка разобрать JSON
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

    // Проверка структуры
    if (
      Array.isArray(result.skills) &&
      result.role &&
      typeof result.role.roleText === "string" &&
      typeof result.role.roleId === "string" &&
      typeof result.experience === "string" &&
      typeof result.workFormat === "string"
    ) {
      console.log("Successfully extracted:", result);
      return NextResponse.json({
        skills: result.skills,
        roleText: result.role.roleText,
        roleId: result.role.roleId,
        experience: result.experience,
        workFormat: result.workFormat,
      });
    } else {
      throw new Error("Invalid Gemini response structure");
    }
  } catch (error: any) {
    console.error("Error analyzing skills:", error);
    return NextResponse.json({
      skills: [],
      roleText: "unknown",
      roleId: "unknown",
      experience: "",
      workFormat: "",
      error: `Failed to analyze skills: ${error.message}`,
    }, { status: 500 });
  }
}