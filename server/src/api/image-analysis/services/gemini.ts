
import fs from "fs";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const analyzeImage = async (filePath: string) => {
  const { GoogleGenAI } = await import("@google/genai");
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  const base64ImageFile = fs.readFileSync(filePath, {
    encoding: "base64",
  });

  const contents = [
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64ImageFile,
      },
    },
    {
      text: "Extract the food name and estimated calories from this image in a JSON object.",
    },
  ];

  const config = {
    responseMimeType: "application/json",
    responseJsonSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        calories: { type: "number" },
      },
      required: ["name", "calories"],
    },
  };

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents,
        config,
      });

      const text = response.text;

      if (!text) {
        throw new Error("Empty response text from Gemini API");
      }

      return JSON.parse(text);
    } catch (error: any) {
      const message = String(error?.message ?? error);
      const isTemporary =
        /503|UNAVAILABLE|high demand|overloaded|429|RESOURCE_EXHAUSTED/i.test(
          message
        );

      if (!isTemporary || attempt === maxAttempts) {
        console.error("Gemini analysis failed:", message);
        throw error;
      }

      console.warn(
        `Gemini temporarily unavailable. Retry ${attempt + 1}/${maxAttempts} in ${attempt * 2}s`
      );

      await sleep(attempt * 2000);
    }
  }

  throw new Error("Gemini analysis failed after retries");
};
