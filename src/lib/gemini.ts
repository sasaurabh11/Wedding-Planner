import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const geminiModel = genAI.getGenerativeModel({ model: "gemma-4-31b-it" });
