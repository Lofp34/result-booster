import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const POST = async (request: Request) => {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not set. Add it to use AI recommendations." },
      { status: 501 },
    );
  }

  const body = await request.json();
  const { summary, sessions } = body ?? {};

  const prompt = [
    "Tu es un coach de performance B2B.",
    "Donne 3 recommandations actionnables pour convertir C->B->A.",
    "Reste concis et pragmatique.",
    `Resume hebdo: ${summary ?? "N/A"}`,
    `Sessions: ${JSON.stringify(sessions ?? [])}`,
  ].join("\n");

  const ai = new GoogleGenAI({});
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return NextResponse.json({ text: response.text });
};
