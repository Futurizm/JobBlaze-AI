export const processTranscriptWithQwen = async (transcript: any) => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen2.5-vl-3b-instruct:free",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract job-related keywords (e.g., job title, skills, location preferences) from this transcript: "${transcript}"`,
                },
              ],
            },
          ],
        }),
      })
  
      const data = await response.json()
      const keywords = data.choices[0].message.content
      return keywords // Например, "frontend developer, React, TypeScript, remote"
    } catch (error) {
      console.error("Error processing transcript with Qwen:", error)
      return transcript // Фallback: использовать транскрипт как есть
    }
  }