import PDFParser from 'pdf2json';
import { GOOGLE_API_KEY } from '@/constants/constants';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to /api/analyze-resume');

    // Проверка FormData
    const formData = await request.formData();
    const resume = formData.get('resume');

    // Проверка типа и размера файла
    if (resume.type !== 'application/pdf') {
      console.error('Invalid file type:', resume.type);
      return NextResponse.json({ error: 'Файл должен быть в формате PDF' }, { status: 400 });
    }
    if (resume.size > 5 * 1024 * 1024) { // Ограничение 5 МБ
      console.error('File size too large:', resume.size);
      return NextResponse.json({ error: 'Файл слишком большой (максимум 5 МБ)' }, { status: 400 });
    }
    if (resume.size === 0) {
      console.error('File is empty');
      return NextResponse.json({ error: 'Файл пустой' }, { status: 400 });
    }

    console.log('Processing file:', resume.name, 'Size:', resume.size);

    // Извлечение текста из PDF с помощью pdf2json
    let resumeText;
    try {
      const pdfBuffer = Buffer.from(await resume.arrayBuffer());
      console.log('PDF buffer length:', pdfBuffer.length);

      const pdfParser = new PDFParser();
      resumeText = await new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', (errData) => {
          console.error('PDF2JSON parsing error:', errData);
          reject(new Error(`Ошибка разбора PDF: ${errData.parserError}`));
        });

        pdfParser.on('pdfParser_dataReady', (pdfData) => {
          try {
            const text = pdfData.Pages.reduce((acc, page) => {
              const pageText = (page.Texts || []).map((text) =>
                (text.R || []).map((run) => decodeURIComponent(run.T)).join('')
              ).join(' ');
              return acc + pageText + ' ';
            }, '').trim();
            resolve(text);
          } catch (error) {
            console.error('Error processing PDF data:', error);
            reject(new Error('Ошибка обработки данных PDF'));
          }
        });

        pdfParser.parseBuffer(pdfBuffer);
      });

      console.log('Extracted resume text:', resumeText.substring(0, 200) + '...');
    } catch (pdfError) {
      console.error('PDF processing error:', pdfError);
      return NextResponse.json({ error: 'Ошибка при обработке PDF-файла' }, { status: 400 });
    }

    if (!resumeText) {
      console.error('Extracted text is empty');
      return NextResponse.json({ error: 'Резюме не содержит текста' }, { status: 400 });
    }

    // Проверка API-ключа
    if (!GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not defined');
      return NextResponse.json({ error: 'API-ключ не настроен' }, { status: 500 });
    }

    // Промпты для Gemini API
    const pastPrompt = `
      На основе следующего текста резюме определите ключевые навыки и опыт кандидата.
      Затем представьте, кем бы этот человек мог быть 10 лет назад (в 2015 году) с учетом технологий и рынка труда того времени.
      Опишите альтернативную карьерную реальность в стиле "что могло бы быть", учитывая их текущие навыки.
      Ответ должен быть кратким (2-3 предложения), на русском языке, в формате чистого текста.
      Не используйте Markdown (например, **, *, #), списки, заголовки или любые специальные символы форматирования.
      Текст резюме: ${resumeText}
    `;

    const futurePrompt = `
      На основе следующего текста резюме определите ключевые навыки и опыт кандидата.
      С учетом текущих трендов на рынке труда и эволюции технологий, опишите, кем этот человек может стать через 5 лет (в 2030 году).
      Укажите возможные должности или роли, которые соответствуют их навыкам, в краткой форме (2-3 предложения), на русском языке, в формате чистого текста.
      Не используйте Markdown (например, **, *, #), списки, заголовки или любые специальные символы форматирования.
      Текст резюме: ${resumeText}
    `;

    // Функция для запроса к Gemini API с таймаутом
    const fetchGeminiResponse = async (prompt: string, promptType: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Таймаут 10 секунд

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error(`Gemini API error (${promptType}):`, response.status, response.statusText);
          throw new Error(`Gemini failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Raw Gemini response (${promptType}):`, JSON.stringify(data, null, 2));

        if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
          console.error(`Invalid Gemini response (${promptType}): candidates is empty or undefined`);
          throw new Error('No valid candidates in Gemini response');
        }

        const content = data.candidates[0].content.parts[0].text;
        console.log(`Gemini response content (${promptType}):`, content);
        return content;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    // Получение ответов для прошлого и будущего
    const [past, future] = await Promise.all([
      fetchGeminiResponse(pastPrompt, 'past').catch((err) => {
        console.error('Past prompt error:', err);
        return 'Ошибка при анализе прошлого';
      }),
      fetchGeminiResponse(futurePrompt, 'future').catch((err) => {
        console.error('Future prompt error:', err);
        return 'Ошибка при анализе будущего';
      }),
    ]);

    console.log('Returning results:', { past, future });
    return NextResponse.json({ past, future });
  } catch (error: any) {
    console.error('Error processing resume:', error);
    return NextResponse.json(
      {
        past: '',
        future: '',
        error: `Failed to process resume: ${error.message}`,
      },
      { status: 500 }
    );
  }
}