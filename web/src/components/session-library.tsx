"use client";

import { useMemo, useState } from "react";
import { getNextSteps } from "@/lib/checks";
import { findMetric } from "@/lib/objective-config";
import { SessionSummary } from "@/lib/dashboard-data";

type Props = {
  sessions: SessionSummary[];
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(date),
  );

export const SessionLibrary = ({ sessions }: Props) => {
  const [activeId, setActiveId] = useState(sessions[0]?.id);
  const [levelFilter, setLevelFilter] = useState<"ALL" | "A" | "B" | "C">("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "7D" | "30D">("ALL");
  const [minScore, setMinScore] = useState("");

  const filteredSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((session) => {
      if (levelFilter !== "ALL" && session.primaryLevel !== levelFilter) return false;

      if (dateFilter !== "ALL") {
        const days = dateFilter === "7D" ? 7 : 30;
        const cutoff = new Date(now);
        cutoff.setDate(now.getDate() - days);
        if (new Date(session.createdAt) < cutoff) return false;
      }

      if (minScore) {
        const min = Number(minScore);
        if (!Number.isNaN(min) && session.scorePerHour < min) return false;
      }

      return true;
    });
  }, [sessions, levelFilter, dateFilter, minScore]);

  const active = useMemo(
    () => filteredSessions.find((session) => session.id === activeId) ?? filteredSessions[0],
    [activeId, filteredSessions],
  );

  const metric = active ? findMetric(active.primaryMetricKey) : null;
  const nextSteps = active ? getNextSteps(active.primaryLevel) : [];

  return (
    <div className="library-grid">
      <div className="library-filters">
        <div>
          <label htmlFor="filter-level">Niveau</label>
          <select
            id="filter-level"
            value={levelFilter}
            onChange={(event) => setLevelFilter(event.target.value as "ALL" | "A" | "B" | "C")}
          >
            <option value="ALL">Tous</option>
            <option value="A">A - Business</option>
            <option value="B">B - Predictif</option>
            <option value="C">C - Vanite</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-date">Periode</label>
          <select
            id="filter-date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value as "ALL" | "7D" | "30D")}
          >
            <option value="ALL">Toute</option>
            <option value="7D">7 jours</option>
            <option value="30D">30 jours</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-score">Score/h min</label>
          <input
            id="filter-score"
            value={minScore}
            onChange={(event) => setMinScore(event.target.value)}
            placeholder="Ex: 2.5"
          />
        </div>
      </div>
      <div className="session-list">
        {filteredSessions.map((session) => (
          <button
            type="button"
            key={session.id}
            className={`session-item ${session.id === active?.id ? "is-active" : ""}`}
            onClick={() => setActiveId(session.id)}
          >
            <div>
              <strong>{session.title}</strong>
              <p>
                Objectif: {findMetric(session.primaryMetricKey)?.label ?? session.primaryMetricKey} •
                Score {session.scorePerHour}
              </p>
            </div>
            <span className={`badge ${session.primaryLevel.toLowerCase()}`}>
              {session.primaryLevel}
            </span>
          </button>
        ))}
        {filteredSessions.length === 0 ? <p>Aucune session sur ce filtre.</p> : null}
      </div>
      {active ? (
        <div className="session-detail">
          <div className="detail-header">
            <div>
              <h3>{active.title}</h3>
              <p>
                {formatDate(active.createdAt)} • {active.durationMinutes} min • Niveau{" "}
                {active.primaryLevel}
              </p>
            </div>
            <span className="pill">Score {active.score.toFixed(1)}</span>
          </div>
          <div className="detail-body">
            <div>
              <span className="detail-label">Intention</span>
              <p>{active.notes ?? "Aucune note associee."}</p>
            </div>
            <div>
              <span className="detail-label">Next steps auto</span>
              <ul>
                {nextSteps.map((step) => (
                  <li key={step.metricKey}>{step.label}</li>
                ))}
              </ul>
            </div>
            <div className="detail-tags">
              <span>{metric?.label ?? "Metric"}</span>
              <span>Outcome {active.outcomeLevel}</span>
              <span>{active.scorePerHour} score/h</span>
            </div>
          </div>
          <div className="detail-actions">
            <button type="button" className="btn">
              Ouvrir checks
            </button>
            <button type="button" className="btn ghost">
              Dupliquer session
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
