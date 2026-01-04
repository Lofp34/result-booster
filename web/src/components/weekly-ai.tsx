"use client";

import { useState } from "react";
import type { SessionSummary, WeeklySummary } from "@/lib/dashboard-data";

type Props = {
  weekly: WeeklySummary;
  sessions: SessionSummary[];
};

export const WeeklyAI = ({ weekly, sessions }: Props) => {
  const [status, setStatus] = useState<{ type: "idle" | "error" | "loading"; message?: string }>({
    type: "idle",
  });
  const [text, setText] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setStatus({ type: "loading", message: "Generation en cours..." });
    setText(null);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: {
            totalScore: weekly.totalScore,
            decisions: weekly.decisions,
            recommendations: weekly.recommendations,
          },
          sessions: sessions.map((session) => ({
            title: session.title,
            level: session.primaryLevel,
            scorePerHour: session.scorePerHour,
            outcomeLevel: session.outcomeLevel,
          })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error ?? "Erreur generation IA.");
      }

      const payload = await response.json();
      setText(payload?.text ?? "Aucune recommandation.");
      setStatus({ type: "idle" });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Erreur generation IA.",
      });
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-header">
        <div>
          <h4>Recommandations IA</h4>
          <p>3 actions concretes pour convertir C -&gt; B -&gt; A.</p>
        </div>
        <button type="button" className="btn ghost" onClick={fetchRecommendations}>
          Generer
        </button>
      </div>
      {status.type === "loading" ? <p className="ai-status">{status.message}</p> : null}
      {status.type === "error" ? <p className="ai-status error">{status.message}</p> : null}
      {text ? <pre className="ai-output">{text}</pre> : null}
    </div>
  );
};
