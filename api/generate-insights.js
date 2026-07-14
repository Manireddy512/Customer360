// Vercel serverless function: POST /api/generate-insights
// Body: { accountId: "meridian" | "brightleaf" | "norwood" }
// Keeps ANTHROPIC_API_KEY server-side only — never sent to the browser.

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

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured on the server" });
    return;
  }

  const dataDump = buildDataDump(account);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: dataDump }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      res.status(response.status).json({ error: "Anthropic API error", detail });
      return;
    }

    const data = await response.json();
    const text = data.content.map((b) => b.text || "").join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error generating insights" });
  }
}
