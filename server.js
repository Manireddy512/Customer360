// Express server used for Render (or any generic Node host).
// Serves the built frontend (dist/) and exposes POST /api/generate-insights.
// Run "npm run build" first, then "npm start" (or let Render do both).

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ACCOUNTS, buildDataDump, SYSTEM_PROMPT } from "./shared/accounts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

app.post("/api/generate-insights", async (req, res) => {
  const { accountId } = req.body || {};
  const account = ACCOUNTS[accountId];
  if (!account) {
    return res.status(400).json({ error: "Unknown accountId" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured on the server" });
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
      return res.status(response.status).json({ error: "Anthropic API error", detail });
    }

    const data = await response.json();
    const text = data.content.map((b) => b.text || "").join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error generating insights" });
  }
});

// Serve the built React app
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Customer 360 listening on port ${PORT}`));
