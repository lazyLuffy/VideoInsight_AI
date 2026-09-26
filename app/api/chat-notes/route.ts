import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Set GEMINI_API_KEY in your environment before using chat." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { notes, question, history = [], url } = body;

    if (!question || typeof question !== "string") {
      return Response.json({ error: "A question is required." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const primaryModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || (primaryModel === "gemini-3.6-flash" ? "gemini-3.8-flash" : "gemini-3.6-flash");

    const systemPrompt = `You are VideoInsight AI's interactive study and Q&A assistant.
The user is studying the following content:
${url ? `Source: ${url}\n` : ""}
---
EXISTING NOTES:
${notes || "(No prior notes generated)"}
---

Your task:
- Answer the user's question directly, accurately, and thoroughly based on the source and notes.
- Use clean Markdown with bolding, concise bullet points, and code blocks if applicable.
- If referencing specific parts of the video, use [MM:SS] timestamp formatting.
- Be friendly, encouraging, and clear.`;

    const contents: Array<{ role: string; parts: Array<Record<string, unknown>> }> = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am ready to answer any questions about this content and these notes." }],
      },
    ];

    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg.role && msg.text) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          });
        }
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: question }],
    });

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    let activeModel = primaryModel;
    let response;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: activeModel,
          contents,
        });
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if ((msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE")) && attempt < 2) {
          activeModel = activeModel === primaryModel ? fallbackModel : primaryModel;
          await sleep(1500 * (attempt + 1));
          continue;
        }
        throw err;
      }
    }

    if (!response) {
      throw new Error("Chat service is currently experiencing high demand. Please try again in a few moments.");
    }

    return Response.json({ reply: response.text ?? "I couldn't generate a response." });
  } catch (error) {
    console.error("Chat request failed", error);
    const message = error instanceof Error ? error.message : "Chat service encountered an error.";
    return Response.json({ error: message }, { status: 502 });
  }
}

