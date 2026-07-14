// Vercel serverless function: POST /api/generate-insights
// Body: { accountId: "meridian" | "brightleaf" | "norwood" }
// Keeps GEMINI_API_KEY server-side only — never sent to the browser.

import { ACCOUNTS, buildDataDump, SYSTEM_PROMPT } from "../shared/accounts.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { accountId } = req.body || {};
  const account = ACCOUNTS[accountId];
  if (!account) {
    res.status(400).json({ error: "Unknown accountId" });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
    return;
  }

  const dataDump = buildDataDump(account);
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: dataDump }] }],
        generationConfig: {
          maxOutputTokens: 1000,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      res.status(response.status).json({ error: "Gemini API error", detail });
      return;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error generating insights" });
  }
}
