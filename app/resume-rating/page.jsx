"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, TrendingUp, Globe, Star } from "lucide-react";
import { GOOGLE_API_KEY } from "@/constants/constants";

const ResumePage = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    totalMarkets: 0,
    avgFitScore: 0,
    topMarket: "N/A",
  });
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setResult(null);
    setError(null);
  };

  const evaluateMarketValue = async () => {
    if (!file) {
      setError("Пожалуйста, загрузите PDF-резюме!");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    let progressValue = 0;
    const progressInterval = setInterval(() => {
      progressValue = Math.min(progressValue + 10, 90);
      setProgress(progressValue);
      if (progressValue >= 90) clearInterval(progressInterval);
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const parseResponse = await fetch("/api/parse-resume", {
        method: "POST",
        body: file,
      });

      if (!parseResponse.ok) {
        throw new Error("Не удалось разобрать PDF");
      }

      const { text: resumeText } = await parseResponse.json();

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
                    text: `Вы — ведущий "Рынок" шоу "Рынок ты или не рынок?". Оцените рыночную стоимость соискателя на основе текста резюме. Предоставьте веселую, увлекательную и слегка преувеличенную оценку их "стоимости" на рынке труда в США, России, Казахстане и Европе. Включите примерные диапазоны зарплат (в местных валютах), смешной комментарий об их текущей рыночной "ценности", оценку соответствия рынку (Market Fit Score, 0-100) и причину, почему этот рынок подходит (whyThisMarket). Верните ответ в виде JSON-объекта с полями: usa, russia, kazakhstan, europe (каждое с salaryRange, comment, marketFitScore, whyThisMarket).

                      **Текст резюме**: ${
                        resumeText ||
                        "Резюме не предоставлено, предположим общие технические навыки, такие как JavaScript, React и управление проектами"
                      }

                      **Инструкции**:
                      - Используйте реалистичные, но слегка преувеличенные диапазоны зарплат на основе резюме.
                      - Добавьте игривый тон, как у ведущего шоу (например, "США кидают в вас доллары!" или "Казахстан коронует вас как короля технологий!").
                      - Market Fit Score должен отражать, насколько навыки соответствуют рынку (например, выше для технических навыков в США/Европе).
                      - Поле whyThisMarket должно содержать краткое объяснение (1-2 предложения), почему этот рынок подходит для навыков.
                      - Верните только JSON-объект, без дополнительных объяснений или Markdown.

                      Пример:
                      {
                        "usa": {
                          "salaryRange": "$100,000 - $160,000",
                          "comment": "Вы — техно-звезда! США машут долларовыми купюрами!",
                          "marketFitScore": 90,
                          "whyThisMarket": "Высокий спрос на разработчиков React в технологических хабах, таких как Кремниевая долина."
                        },
                        "russia": {
                          "salaryRange": "2,000,000 - 3,500,000 RUB",
                          "comment": "Россия говорит 'Да!' вашим навыкам — пора за икрой!",
                          "marketFitScore": 75,
                          "whyThisMarket": "Растущий рынок IT в Москве ценит универсальные технические навыки."
                        },
                        "kazakhstan": {
                          "salaryRange": "5,000,000 - 8,000,000 KZT",
                          "comment": "Казахстан склоняется перед вашим техническим мастерством!",
                          "marketFitScore": 85,
                          "whyThisMarket": "Казахстан активно развивает IT-сектор, и ваши навыки здесь востребованы."
                        },
                        "europe": {
                          "salaryRange": "€70,000 - €120,000",
                          "comment": "Европа готова расстелить красную дорожку!",
                          "marketFitScore": 88,
                          "whyThisMarket": "Европейские стартапы ищут специалистов по React для масштабирования."
                        }
                      }`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok)
        throw new Error(`API не работает: ${response.statusText}`);

      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Нет валидного ответа от API");
      }

      const rawText = data.candidates[0].content.parts[0].text.trim();
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : rawText;
      const content = JSON.parse(jsonString);

      // Calculate statistics
      const scores = Object.values(content).map((data) => data.marketFitScore);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const topMarket = Object.keys(content).reduce((a, b) =>
        content[a].marketFitScore > content[b].marketFitScore ? a : b
      );

      setStats({
        totalMarkets: Object.keys(content).length,
        avgFitScore: Math.round(avgScore),
        topMarket: topMarket.toUpperCase(),
      });

      setResult(content);
      setProgress(100);
    } catch (err) {
      console.error("Ошибка оценки рыночной стоимости:", err);
      setError("Ой! Рынок не смог оценить ваше резюме — попробуйте снова!");
      setProgress(0);
    } finally {
      setLoading(false);
      clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col py-5 px-4">
      <header className="bg-gradient-to-r from-blue-800 to-purple-900 text-white p-6 rounded-b-3xl shadow-xl">
        <h1 className="text-5xl font-extrabold text-center mb-4">
          🎉 Рынок ты или не рынок? 🎉
        </h1>
        <div className="flex justify-around flex-wrap gap-4">
          <div className="text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 animate-bounce" />
            <p className="text-lg font-semibold">Рынков оценено</p>
            <p className="text-2xl">{stats.totalMarkets}</p>
          </div>
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 animate-bounce" />
            <p className="text-lg font-semibold">Средний балл соответствия</p>
            <p className="text-2xl">{stats.avgFitScore}/100</p>
          </div>
          <div className="text-center">
            <Star className="h-8 w-8 mx-auto mb-2 animate-bounce" />
            <p className="text-lg font-semibold">Лучший рынок</p>
            <p className="text-2xl">{stats.topMarket}</p>
          </div>
        </div>
      </header>
      <div className="flex-grow flex items-center justify-center py-8">
        <Card className="w-full max-w-5xl bg-white/95 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">
          <CardContent className="p-10 space-y-8 text-center">
            <div className="flex flex-col items-center ">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="w-full max-w-xl border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all mb-2"
                placeholder="Выберите файл"
              />
              <p className="text-gray-500 text-sm">Выберите файл Resume.pdf</p>
            </div>
            <Button
              onClick={evaluateMarketValue}
              disabled={loading || !file}
              className="w-full max-w-xl bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center text-lg shadow-lg hover:shadow-xl mx-auto"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
              ) : (
                "Оценить мою ценность!"
              )}
            </Button>
            {loading && (
              <div className="w-full max-w-xl mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-6 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-base text-gray-700 mt-2">
                  Анализируем ваши навыки... {progress}%
                </p>
              </div>
            )}
            {error && (
              <p className="text-red-600 text-center text-xl">{error}</p>
            )}
            {result && (
              <div className="mt-8 space-y-6 animate-fade-in">
                <h3 className="text-3xl font-semibold text-center text-gray-800">
                  Ваша рыночная стоимость:
                </h3>
                <div className="space-y-6">
                  {Object.entries(result).map(([country, data]) => (
                    <Card
                      key={country}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-2xl transition-all rounded-2xl overflow-hidden"
                    >
                      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                        <CardTitle className="text-2xl font-bold capitalize">
                          {country === "usa"
                            ? "США"
                            : country === "russia"
                            ? "Россия"
                            : country === "kazakhstan"
                            ? "Казахстан"
                            : "Европа"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <p className="text-lg font-semibold text-gray-700">
                            Диапазон зарплаты:
                          </p>
                          <p className="text-2xl text-green-600 font-bold">
                            {data.salaryRange}
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">
                            Оценка соответствия рынку:
                          </p>
                          <p className="text-xl text-yellow-600 font-bold">
                            {data.marketFitScore}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">
                            Почему этот рынок?
                          </p>
                          <p className="text-base text-gray-600">
                            {data.whyThisMarket}
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">
                            Комментарий ведущего:
                          </p>
                          <p className="text-base text-gray-600 italic">
                            "{data.comment}"
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumePage;
