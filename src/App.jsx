import { useState } from "react";
import {
  Building2, TrendingUp, Mail, MessageSquare, Ticket,
  Activity, Sparkles, User, DollarSign, Calendar, ChevronRight,
  Loader2, ShieldAlert, Target, ArrowUpRight, CircleDot
} from "lucide-react";
import { ACCOUNTS, formatUSD } from "../shared/accounts.js";

const HEALTH_STYLES = {
  risk: { dot: "bg-rose-500", text: "text-rose-400", label: "At Risk" },
  opportunity: { dot: "bg-emerald-500", text: "text-emerald-400", label: "Expansion Signal" },
  steady: { dot: "bg-sky-500", text: "text-sky-400", label: "Steady" },
};

export default function App() {
  const [selectedId, setSelectedId] = useState("meridian");
  const [insights, setInsights] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [errorId, setErrorId] = useState(null);

  const account = ACCOUNTS[selectedId];
  const health = HEALTH_STYLES[account.health];
  const current = insights[selectedId];

  async function generateInsights() {
    setLoadingId(selectedId);
    setErrorId(null);
    try {
      const response = await fetch("/api/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: selectedId }),
      });
      if (!response.ok) throw new Error("Request failed");
      const parsed = await response.json();
      setInsights((prev) => ({ ...prev, [selectedId]: parsed }));
    } catch (err) {
      console.error(err);
      setErrorId(selectedId);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-2">
            <Building2 className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight">Customer 360</h1>
            <p className="text-xs text-slate-400">Unified account intelligence — CRM · Support · Email · Slack · Product usage</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3 px-1">Accounts</p>
          {Object.values(ACCOUNTS).map((a) => {
            const h = HEALTH_STYLES[a.health];
            const active = a.id === selectedId;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className={`w-full text-left rounded-lg border px-3 py-3 transition-colors ${
                  active ? "border-sky-500/50 bg-slate-900" : "border-slate-800 bg-slate-900/40 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-100">{a.name}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${active ? "text-sky-400" : "text-slate-600"}`} />
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${h.dot}`} />
                  <span className={`text-xs ${h.text}`}>{h.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="col-span-3 space-y-5">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{account.name}</h2>
                <p className="text-sm text-slate-400">{account.industry}</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-slate-700 px-2.5 py-1">
                <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
                <span className={`text-xs font-medium ${health.text}`}>{health.label}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Stat icon={<DollarSign className="w-3.5 h-3.5" />} label="ARR" value={formatUSD(account.crm.arr)} />
              <Stat icon={<User className="w-3.5 h-3.5" />} label="Owner" value={account.crm.owner.split(" (")[0]} />
              <Stat icon={<Calendar className="w-3.5 h-3.5" />} label="Renewal" value={account.crm.renewalDate} />
              <Stat icon={<Activity className="w-3.5 h-3.5" />} label="Stage" value={account.crm.stage} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SourceCard icon={<Ticket className="w-4 h-4 text-amber-400" />} title="Support Tickets">
              {account.tickets.map((t) => (
                <div key={t.id} className="text-xs py-1.5 border-b border-slate-800/60 last:border-0">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-300">{t.subject}</span>
                    <span className="text-slate-500 whitespace-nowrap">{t.priority}</span>
                  </div>
                  <span className="text-slate-500">{t.status} · {t.date}</span>
                </div>
              ))}
            </SourceCard>

            <SourceCard icon={<Mail className="w-4 h-4 text-sky-400" />} title="Email Threads">
              {account.emails.map((e, i) => (
                <div key={i} className="text-xs py-1.5 border-b border-slate-800/60 last:border-0">
                  <div className="text-slate-300">{e.subject}</div>
                  <div className="text-slate-500">{e.from} · {e.date}</div>
                </div>
              ))}
            </SourceCard>

            <SourceCard icon={<MessageSquare className="w-4 h-4 text-violet-400" />} title="Slack Notes">
              {account.slack.map((s, i) => (
                <div key={i} className="text-xs py-1.5 border-b border-slate-800/60 last:border-0">
                  <div className="text-slate-300">{s.message}</div>
                  <div className="text-slate-500">{s.author} · {s.channel} · {s.date}</div>
                </div>
              ))}
            </SourceCard>

            <SourceCard icon={<Activity className="w-4 h-4 text-emerald-400" />} title="Product Usage">
              <Row label="Active users" value={account.usage.activeUsers} />
              <Row label="Login trend" value={account.usage.loginTrend} />
              <Row label="Feature adoption" value={account.usage.featureAdoption} />
              <Row label="Last login" value={account.usage.lastLogin} />
            </SourceCard>
          </div>

          <div className="rounded-lg border border-sky-500/20 bg-gradient-to-b from-sky-500/[0.04] to-transparent p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">AI Account Brief</h3>
              </div>
              <button
                onClick={generateInsights}
                disabled={loadingId === selectedId}
                className="flex items-center gap-1.5 text-xs font-medium bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 rounded-md px-3 py-1.5 transition-colors"
              >
                {loadingId === selectedId ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5" /> {current ? "Regenerate" : "Generate Insights"}</>
                )}
              </button>
            </div>

            {errorId === selectedId && (
              <p className="text-xs text-rose-400 mb-3">Couldn't reach the AI model just now — try again.</p>
            )}

            {!current && loadingId !== selectedId && (
              <p className="text-sm text-slate-500">Click "Generate Insights" to synthesize CRM, support, email, Slack, and usage data into a summary, risk/opportunity signals, and a recommended next action.</p>
            )}

            {current && (
              <div className="space-y-4">
                <p className="text-sm text-slate-200 leading-relaxed">{current.summary}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs font-semibold text-rose-400 uppercase tracking-wide">Risks</span>
                    </div>
                    {current.risk_signals?.length ? (
                      <ul className="space-y-1.5">
                        {current.risk_signals.map((r, i) => (
                          <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                            <CircleDot className="w-3 h-3 text-rose-500 mt-0.5 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-xs text-slate-500">None identified</p>}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Opportunities</span>
                    </div>
                    {current.opportunity_signals?.length ? (
                      <ul className="space-y-1.5">
                        {current.opportunity_signals.map((o, i) => (
                          <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                            <CircleDot className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                            {o}
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-xs text-slate-500">None identified</p>}
                  </div>
                </div>

                <div className="rounded-md border border-sky-500/30 bg-sky-500/[0.06] p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Target className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-semibold text-sky-400 uppercase tracking-wide">Next Best Action</span>
                    <span className="text-[10px] text-slate-500 ml-auto flex items-center gap-1">
                      Confidence: {current.confidence} <ArrowUpRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <p className="text-sm text-slate-100">{current.next_best_action}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-slate-500 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-100 truncate">{value}</p>
    </div>
  );
}

function SourceCard({ icon, title, children }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{title}</h4>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="text-xs py-1.5 border-b border-slate-800/60 last:border-0 flex justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300 text-right">{value}</span>
    </div>
  );
}
