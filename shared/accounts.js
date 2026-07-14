// ---------------------------------------------------------------------------
// Shared account data + prompt logic.
// Imported by BOTH the React frontend (to render the raw source cards)
// and the backend (server.js / api/generate-insights.js) to build the
// prompt sent to Claude. Keeping one source of truth avoids the frontend
// and backend drifting out of sync.
// ---------------------------------------------------------------------------

export const ACCOUNTS = {
  meridian: {
    id: "meridian",
    name: "Meridian Logistics",
    industry: "Freight & Supply Chain",
    health: "risk",
    crm: {
      owner: "Priya Nair (Account Manager)",
      stage: "Renewal — In Progress",
      arr: 84000,
      renewalDate: "2026-08-03",
      contractStart: "2023-08-03",
      seats: 65,
      lastQBR: "2026-04-11",
    },
    tickets: [
      { id: "T-4821", subject: "Bulk export failing for reconciliation reports", priority: "High", status: "Escalated", date: "2026-07-08" },
      { id: "T-4790", subject: "Approval workflow not routing to backup approver", priority: "Medium", status: "Open", date: "2026-07-02" },
      { id: "T-4712", subject: "Question on multi-entity consolidation", priority: "Low", status: "Resolved", date: "2026-06-19" },
    ],
    emails: [
      { from: "Daniel Cho (VP Finance, Meridian)", subject: "Re: Renewal terms", snippet: "Before we commit to another year, we need the export issue fixed and want to understand pricing flexibility given our seat count.", date: "2026-07-09" },
      { from: "Daniel Cho (VP Finance, Meridian)", subject: "Frustration with reporting delays", snippet: "This is the second month our close has been delayed because of export errors on our side.", date: "2026-06-30" },
    ],
    slack: [
      { author: "Priya Nair", channel: "#customer-meridian", message: "Heads up — Daniel mentioned they're evaluating a competitor as a backup option if the export bug isn't fixed before renewal.", date: "2026-07-09" },
      { author: "Support Lead", channel: "#support-escalations", message: "T-4821 root-caused to a timeout on large ledgers. Fix targeted for next release, ~2 weeks out.", date: "2026-07-10" },
    ],
    usage: {
      activeUsers: "38 / 65 seats (58%)",
      loginTrend: "down 22% over 60 days",
      featureAdoption: "Core AP/AR only — approvals & multi-entity unused",
      lastLogin: "2026-07-12",
    },
  },

  brightleaf: {
    id: "brightleaf",
    name: "Brightleaf Foods",
    industry: "CPG / Food & Beverage",
    health: "opportunity",
    crm: {
      owner: "Marcus Webb (Customer Success Manager)",
      stage: "Active — Healthy",
      arr: 46000,
      renewalDate: "2027-01-15",
      contractStart: "2025-01-15",
      seats: 24,
      lastQBR: "2026-06-02",
    },
    tickets: [
      { id: "T-5011", subject: "How to add a second business unit", priority: "Low", status: "Resolved", date: "2026-07-01" },
      { id: "T-4955", subject: "Request: multi-currency support for EU vendors", priority: "Medium", status: "Open", date: "2026-06-22" },
    ],
    emails: [
      { from: "Lena Ortiz (Controller, Brightleaf)", subject: "Expanding to EU entity in Q4", snippet: "We're standing up a European subsidiary and want to know if we can add it under the same account with multi-currency support.", date: "2026-07-05" },
    ],
    slack: [
      { author: "Marcus Webb", channel: "#customer-brightleaf", message: "Lena confirmed budget is approved for the EU entity add-on starting Q4. This is a strong upsell — roughly +18 seats.", date: "2026-07-06" },
      { author: "Marcus Webb", channel: "#customer-brightleaf", message: "Usage has been climbing steadily since their new controller joined in March — she's driving adoption hard.", date: "2026-06-15" },
    ],
    usage: {
      activeUsers: "23 / 24 seats (96%)",
      loginTrend: "up 31% over 60 days",
      featureAdoption: "AP, AR, budgeting, and approvals all active",
      lastLogin: "2026-07-13",
    },
  },

  norwood: {
    id: "norwood",
    name: "Norwood Analytics",
    industry: "Professional Services",
    health: "steady",
    crm: {
      owner: "Priya Nair (Account Manager)",
      stage: "Active — Healthy",
      arr: 29000,
      renewalDate: "2026-11-20",
      contractStart: "2024-11-20",
      seats: 18,
      lastQBR: "2026-05-14",
    },
    tickets: [
      { id: "T-4680", subject: "Minor UI question on report filters", priority: "Low", status: "Resolved", date: "2026-06-10" },
    ],
    emails: [
      { from: "Sam Petrov (Ops Manager, Norwood)", subject: "Thanks for the QBR", snippet: "Team found the QBR useful, no immediate concerns — happy with how things are running.", date: "2026-05-15" },
    ],
    slack: [
      { author: "Priya Nair", channel: "#customer-norwood", message: "Quiet account, consistent usage, no red flags. Good candidate for a case study if we need one.", date: "2026-06-20" },
    ],
    usage: {
      activeUsers: "16 / 18 seats (89%)",
      loginTrend: "flat over 60 days",
      featureAdoption: "AP, AR, and reporting active; budgeting unused",
      lastLogin: "2026-07-11",
    },
  },
};

export function formatUSD(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export const SYSTEM_PROMPT = `You are a revenue operations analyst producing a unified account brief for Sales, Customer Success, Growth, and Partnerships teams. You will be given raw records pulled from a CRM, a support desk, email, Slack, and product usage telemetry for one account.

Respond with ONLY valid JSON (no markdown fences, no preamble) in exactly this shape:
{
  "summary": "2-3 sentence plain-English summary of where this account stands right now",
  "risk_signals": ["short risk 1", "short risk 2"],
  "opportunity_signals": ["short opportunity 1", "short opportunity 2"],
  "next_best_action": "one concrete, specific recommended action, including who should own it and roughly when",
  "confidence": "High, Medium, or Low — how confident you are given the data available"
}
If there are no meaningful risks or no meaningful opportunities, return an empty array for that field rather than inventing one.`;

export function buildDataDump(account) {
  return `
ACCOUNT: ${account.name} (${account.industry})

--- CRM (Zoho) ---
Owner: ${account.crm.owner}
Stage: ${account.crm.stage}
ARR: ${formatUSD(account.crm.arr)}
Seats: ${account.crm.seats}
Contract start: ${account.crm.contractStart}
Renewal date: ${account.crm.renewalDate}
Last QBR: ${account.crm.lastQBR}

--- SUPPORT TICKETS ---
${account.tickets.map(t => `[${t.id}] (${t.priority}, ${t.status}, ${t.date}) ${t.subject}`).join("\n")}

--- EMAIL THREADS ---
${account.emails.map(e => `From ${e.from} on ${e.date} — "${e.subject}": ${e.snippet}`).join("\n")}

--- SLACK (internal team notes) ---
${account.slack.map(s => `${s.author} in ${s.channel} (${s.date}): ${s.message}`).join("\n")}

--- PRODUCT USAGE ---
Active users: ${account.usage.activeUsers}
Login trend: ${account.usage.loginTrend}
Feature adoption: ${account.usage.featureAdoption}
Last login: ${account.usage.lastLogin}
`.trim();
}
