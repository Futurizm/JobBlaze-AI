import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "0";
  const per_page = searchParams.get("per_page") || "20";
  const skills = searchParams.get("skills") || "";
  const role = searchParams.get("role") || "";
  const remote = searchParams.get("remote") === "true";
  const fullTime = searchParams.get("fullTime") === "true";
  const entry = searchParams.get("entry") === "true";
  const searchLogic = searchParams.get("searchLogic") || "AND"; // По умолчанию AND

  // Формируем запрос для навыков
  const skillArray = skills ? skills.split(",").map((s) => s.trim()) : [];
  let textQuery = "";
  if (skillArray.length > 0) {
    if (searchLogic === "OR") {
      // Для OR: объединяем навыки через OR
      textQuery = skillArray.map((s) => `"${s}"`).join(" OR ");
    } else {
      // Для AND: объединяем навыки через пробел
      textQuery = skillArray.map((s) => `"${s}"`).join(" ");
    }
  }

  // Конструируем параметры запроса
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
    ...(textQuery && { text: textQuery }), // Навыки в text с AND или OR
    ...(role && { professional_role: role }), // Роль через professional_role
    ...(remote && { schedule: "remote" }),
    ...(fullTime && { employment: "full" }),
    ...(entry && { experience: "noExperience" }),
  });

  const hhApiUrl = `https://api.hh.ru/vacancies?${params.toString()}`;

  try {
    const clientUserAgent =
      request.headers.get("user-agent") ||
      "JobBlazeAI/1.0 (+https://jobblaze.ai)";
    const userAgent = clientUserAgent.includes("JobBlazeAI")
      ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      : clientUserAgent;

    const response = await fetch(hhApiUrl, {
      headers: {
        "User-Agent": userAgent,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.description || "Failed to fetch jobs" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching jobs from hh.ru:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}