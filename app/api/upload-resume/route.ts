import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import PDFParser from "pdf2json";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

   
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, file.name);
    await fs.writeFile(filePath, buffer);

    const pdfParser = new PDFParser();
    const pdfData = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData) => reject(errData));
      pdfParser.on("pdfParser_dataReady", (pdfData) => resolve(pdfData));
      pdfParser.loadPDF(filePath);
    });

    const rawText = (pdfData as any).Pages.map((page: any) =>
      page.Texts.map((text: any) => decodeURIComponent(text.R[0].T)).join("")
    ).join("");

    const normalizedText = rawText
      .split(/\s+/)
      .map((word: any) => word.replace(/\s+/g, ""))
      .join(" ")
      .toLowerCase()
      .trim();

    console.log("Normalized resume text:", normalizedText);

    const { skills, role, roleText } = extractResumeData(normalizedText);

    console.log("Extracted skills:", skills);
    console.log("Extracted role:", role);
    console.log("Extracted role text:", roleText);

    await fs.unlink(filePath);

    return NextResponse.json(
      {
        skills: skills.join(","),
        role,
        roleText,
        experience: "", // Можно расширить логику для извлечения опыта
        workFormat: "", // Можно расширить логику для извлечения формата работы
        searchLogic: "OR", // Указываем OR для upload-resume
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}

function extractResumeData(text: string) {
  const skillKeywords = [
    "javascript",
    "python",
    "react",
    "node.js",
    "sql",
    "c++",
    "c#",
    "kotlin",
    "java",
    "typescript",
    "css",
    "html",
    "docker",
    "aws",
    "git",
    "frontend",
    "backend",
    "fullstack",
    "фронтенд",
    "бэкенд",
    "фуллстек",
    "программирование",
    "разработка",
    "hono",
    "express",
    "typeorm",
    "prisma",
    "strapi",
    "vue",
    "testing",
    "qa",
    "тестирование",
    "администрирование",
    "управление",
    "дизайн",
    "аналитика",
  ];

  const roleKeywords = [
    "developer",
    "engineer",
    "manager",
    "designer",
    "analyst",
    "architect",
    "programmer",
    "software",
    "qa",
    "tester",
    "administrator",
    "driver",
    "teacher",
    "doctor",
    "nurse",
    "программист",
    "разработчик",
    "инженер",
    "менеджер",
    "дизайнер",
    "аналитик",
    "архитектор",
    "fullstack",
    "тестировщик",
    "администратор",
    "водитель",
    "учитель",
    "врач",
    "медсестра",
  ];

  const roleMapping = {
    developer: "96",
    engineer: "25",
    manager: "70",
    designer: "34",
    analyst: "10",
    architect: "104",
    programmer: "96",
    software: "96",
    qa: "148",
    tester: "148",
    administrator: "3",
    driver: "24",
    teacher: "119",
    doctor: "29",
    nurse: "63",
    программист: "96",
    разработчик: "96",
    инженер: "25",
    менеджер: "70",
    дизайнер: "34",
    аналитик: "10",
    архитектор: "104",
    fullstack: "96",
    тестировщик: "148",
    администратор: "3",
    водитель: "24",
    учитель: "119",
    врач: "29",
    медсестра: "63",
  };

  const skills = skillKeywords.filter((keyword) => text.includes(keyword));
  const roleText =
    (roleKeywords.find((keyword) => text.includes(keyword)) as keyof typeof roleMapping) || "unknown";
  const role = roleMapping[roleText] || "unknown";

  return { skills, role, roleText };
}