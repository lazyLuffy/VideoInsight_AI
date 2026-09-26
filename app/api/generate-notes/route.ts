import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Set GEMINI_API_KEY in your environment before generating notes." }, { status: 500 });
  }

  const formData = await request.formData();
  const url = String(formData.get("url") ?? "").trim();
  const file = formData.get("file");

  if (!url && !(file instanceof File)) {
    return Response.json({ error: "Provide a YouTube link or upload a file." }, { status: 400 });
  }

  if (file instanceof File && file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "Files must be smaller than 20 MB." }, { status: 413 });
  }

  const preset = String(formData.get("preset") ?? "comprehensive");
  const sourceDescription = url ? `Source URL: ${url}` : `Uploaded file: ${file instanceof File ? file.name : "unknown"}`;

  let presetInstructions = "";
  if (preset === "study") {
    presetInstructions = `Create an in-depth Study Guide and Quiz.
Include:
# [Clear Title of Content]
## 🎯 Core Concepts & Definitions
## ⏱️ Section Breakdown (Include [MM:SS] timestamps for each key topic)
## 🧠 Practice Quiz (5 high-quality questions with answer explanations)
## 📝 Key Flashcard Revision Points`;
  } else if (preset === "executive") {
    presetInstructions = `Create a high-impact Executive Brief.
Include:
# [Clear Title of Content] - Executive Brief
## ⚡ Executive Summary (TL;DR)
## 🎯 Core Strategic Takeaways
## 📊 Key Numbers, Metrics & Findings
## 🚀 Recommended Action Plan & Next Steps`;
  } else if (preset === "quick") {
    presetInstructions = `Create a super concise Quick Bullets summary.
Include:
# [Clear Title of Content]
## ⚡ 60-Second Overview
## 🔹 Core Bullet Points (high-signal only)
## 💡 Single Biggest Takeaway`;
  } else {
    presetInstructions = `Create comprehensive, well-structured Markdown notes.
Include:
# [Clear Title of Content]
## 📌 Executive Summary
## 💡 Key Takeaways
## ⏱️ Detailed Breakdown (Always include [MM:SS] timestamps where applicable, e.g. [02:15] Topic name)
## 📋 Action Items & Next Steps`;
  }

  const prompt = `You are VideoInsight AI, an expert note-taking and knowledge extraction assistant.
${presetInstructions}

Formatting Guidelines:
- Whenever referencing moments in a video, format timestamps strictly as [MM:SS] or [HH:MM:SS] so they can be parsed into interactive links.
- Preserve exact terms, technical details, names, and metrics.
- Keep the formatting clean, professional, and well-spaced.

${sourceDescription}`;

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  async function callGemini(fps: number, modelName: string) {
    const ai = new GoogleGenAI({ apiKey: apiKey! });
    const parts: Array<Record<string, unknown>> = [{ text: prompt }];

    if (file instanceof File) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const isVideo = file.type?.startsWith("video/");
      parts.push({
        inlineData: { mimeType: file.type || "application/octet-stream", data: bytes.toString("base64") },
        ...(isVideo ? { videoMetadata: { fps } } : {}),
      });
    } else if (url) {
      parts.push({
        fileData: { fileUri: url },
        videoMetadata: { fps },
      });
    }

    return await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts }],
    });
  }

  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || (primaryModel === "gemini-3.6-flash" ? "gemini-3.8-flash" : "gemini-3.6-flash");

  try {
    let response;
    let currentFps = 0.2;
    let activeModel = primaryModel;
    let lastError: unknown;

    // Up to 3 attempts with backoff, token reduction, and model fallback
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await callGemini(currentFps, activeModel);
        break;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isTokenLimit = msg.includes("exceeds the maximum number of tokens") || msg.includes("token count exceeds");
        const isHighDemand = msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE");

        if (isTokenLimit && currentFps > 0.05) {
          console.warn("Token limit exceeded. Retrying with 0.05 FPS (1 frame every 20s)...");
          currentFps = 0.05;
          continue;
        }

        if (isHighDemand && attempt < 2) {
          console.warn(`Model ${activeModel} is experiencing high demand (503). Falling back to ${fallbackModel}...`);
          activeModel = activeModel === primaryModel ? fallbackModel : primaryModel;
          await sleep(1500 * (attempt + 1));
          continue;
        }

        throw err;
      }
    }

    if (!response) {
      throw lastError || new Error("Google Gemini is experiencing high demand. Please try again in a few moments.");
    }

    const notes = response.text ?? "No notes were returned.";
    const firstHeaderMatch = notes.match(/^#\s+(.+)$/m);
    const title = firstHeaderMatch ? firstHeaderMatch[1].trim() : (url ? "YouTube Notes" : (file instanceof File ? file.name : "Generated Notes"));

    return Response.json({ notes, title });
  } catch (error) {
    console.error("Note generation failed", error);
    const message = error instanceof Error ? error.message : "Gemini could not process this source.";
    return Response.json({ error: message }, { status: 502 });
  }
}