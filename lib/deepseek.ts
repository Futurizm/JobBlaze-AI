import { DEEPSEEK_API_KEY } from "@/constants/constants";

export async function generateQuestions(resumeText: string): Promise<string[]> {
  try {
    console.log('Отправка запроса в OpenRouter с текстом резюме:', resumeText);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'JobSync',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-zero:free',
        messages: [
          {
            role: 'system',
            content:
              'You are an experienced programming team lead conducting a technical interview. Based on the candidate\'s resume, generate 5 insightful and relevant questions focusing on the technologies, skills, and experiences listed. Tailor questions to assess both technical proficiency and practical application, including problem-solving and project experience. For example, if the resume mentions React, ask about component lifecycle or state management. Return questions as a JSON array, e.g., ["question1", "question2", ...]. Ensure the response is valid JSON without any additional text, Markdown, LaTeX, or formatting. Respond in English.',
          },
          { role: 'user', content: resumeText },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка API OpenRouter:', response.status, errorText);
      throw new Error(`Ошибка API OpenRouter: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Ответ OpenRouter:', JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('Некорректная структура ответа:', data);
      throw new Error('Некорректный ответ от OpenRouter: отсутствуют choices или content');
    }

    let content = data.choices[0].message.content;
    console.log('Необработанный контент:', JSON.stringify(content, null, 2));

    // Очистка содержимого от LaTeX, Markdown и лишних символов
    content = content
      .replace(/```json\s*|\s*```/g, '') // Удаление ```json и ```
      .replace(/```/g, '') // Удаление любых ```
      .replace(/\\boxed\{|\}/g, '') // Удаление \boxed{ и }
      .replace(/\\[a-zA-Z]+(\{.*?\})?/g, '') // Удаление LaTeX-конструкций
      .replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, '') // Удаление пустых строк
      .replace(/\s+$/, '') // Удаление пробелов в конце
      .trim();

    console.log('Очищенный контент:', JSON.stringify(content, null, 2));

    // Извлечение JSON-массива с помощью регулярного выражения
    const jsonMatch = content.match(/\[[\s\S]*?\](?!\])/);
    if (jsonMatch) {
      content = jsonMatch[0];
      console.log('Извлечённый JSON:', JSON.stringify(content, null, 2));
    } else {
      console.error('Не удалось извлечь JSON-массив:', content);
      throw new Error('Ответ OpenRouter не содержит валидный JSON-массив');
    }

    // Проверка валидности JSON перед парсингом
    try {
      JSON.parse(content);
    } catch (error) {
      console.error('Предварительная проверка JSON не удалась:', error);
      console.error('Невалидный контент:', JSON.stringify(content, null, 2));
      throw new Error(`Невалидная структура JSON: ${error}`);
    }

    try {
      const parsedContent = JSON.parse(content);
      if (!Array.isArray(parsedContent)) {
        console.error('Очищенный контент не является массивом:', parsedContent);
        throw new Error('Ответ OpenRouter не является JSON-массивом');
      }
      if (parsedContent.length === 0) {
        console.warn('Получен пустой массив вопросов');
        return [];
      }
      return parsedContent;
    } catch (parseError) {
      console.error('Ошибка парсинга JSON:', parseError);
      console.error('Проблемный контент:', JSON.stringify(content, null, 2));
      throw new Error(`Не удалось распарсить ответ OpenRouter как JSON: ${parseError}`);
    }
  } catch (error) {
    console.error('Ошибка генерации вопросов:', error);
    throw error;
  }
}

function cleanJsonString(jsonString: string): string {
  // Удаление лишних фигурных скобок
  let cleaned = jsonString.replace(/^{\s*{/, '{');
  cleaned = cleaned.replace(/}\s*}/g, '}');
  // Удаление лишних символов в конце
  cleaned = cleaned.replace(/[,;]\s*$/, '');
  // Удаление любых не-JSON символов после массива
  cleaned = cleaned.replace(/\][^\]]*$/, ']');
  // Гарантия корректных скобок
  cleaned = cleaned.trim();
  if (!cleaned.startsWith('[') && !cleaned.startsWith('{')) {
    cleaned = `[${cleaned}`;
  }
  if (!cleaned.endsWith(']') && !cleaned.endsWith('}')) {
    cleaned = `${cleaned}]`;
  }
  return cleaned;
}

export async function analyzeAnswer(question: string, answer: string) {
  const prompt = `Analyze the following candidate's answer to the interview question. And don't answer with big sentences. Provide feedback in English on the clarity and specificity of the answer, and suggest improvements. Return the feedback as a valid JSON object enclosed in curly braces {} with the fields "clarity", "specificity", and "suggestions". Return ONLY the JSON object, without any additional text, LaTeX, Markdown, or formatting (e.g., no \\boxed, no Question: ${question}
Answer: ${answer}. Answer only in English and if the question is in any language then translate it to English and answer in English.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'JobSync',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-zero:free',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка API OpenRouter:', response.status, errorText);
      throw new Error(`Ошибка API OpenRouter: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    let rawContent = data.choices[0].message.content;
    console.log('Необработанный контент обратной связи:', JSON.stringify(rawContent, null, 2));

    // Очистка от LaTeX, Markdown и лишнего текста
    rawContent = rawContent
      .replace(/```json\s*|\s*```/g, '')
      .replace(/```/g, '')
      .replace(/\\boxed\{|\}/g, '')
      .replace(/\\[a-zA-Z]+(\{.*?\})?/g, '')
      .replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, '')
      .replace(/,\s*$/, '')
      .trim();

    // Извлечение JSON-объекта
    const jsonMatch = rawContent.match(/\{[\s\S]*?\}(?!\})/);
    if (jsonMatch) {
      rawContent = jsonMatch[0];
      console.log('Извлечённый JSON:', JSON.stringify(rawContent, null, 2));
    } else {
      console.error('Не удалось извлечь JSON-объект:', rawContent);
      throw new Error('Ответ OpenRouter не содержит валидный JSON-объект');
    }

    // Проверка валидности JSON
    try {
      JSON.parse(rawContent);
    } catch (error) {
      console.error('Предварительная проверка JSON не удалась:', error);
      console.error('Невалидный контент:', JSON.stringify(rawContent, null, 2));
      throw new Error(`Невалидная структура JSON: ${error}`);
    }

    try {
      const feedback = JSON.parse(rawContent);
      if (!feedback.clarity || !feedback.specificity || !feedback.suggestions) {
        console.error('Неполная обратная связь:', feedback);
        throw new Error('Неполная обратная связь: отсутствуют обязательные поля (clarity, specificity, suggestions)');
      }
      return feedback;
    } catch (error) {
      console.error('Ошибка парсинга JSON:', error);
      console.error('Проблемный контент:', JSON.stringify(rawContent, null, 2));
      throw new Error(`Не удалось распарсить обратную связь OpenRouter как JSON: ${error}`);
    }
  } catch (error) {
    console.error('Ошибка анализа ответа:', error);
    throw error;
  }
}