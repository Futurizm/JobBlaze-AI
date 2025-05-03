import { NextResponse } from "next/server";
import PDFParser from "pdf2json";

export async function POST(request) {
  try {
    const pdfBuffer = Buffer.from(await request.arrayBuffer());
    const text = await extractTextFromPDF(pdfBuffer);
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Error parsing PDF:", err);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}

const extractTextFromPDF = (pdfBuffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (errData) =>
      reject(new Error(errData.parserError))
    );
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const text = pdfData.Pages.map((page) =>
        page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(" ")
      ).join("\n");
      resolve(text);
    });
    pdfParser.parseBuffer(pdfBuffer);
  });
};
