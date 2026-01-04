"use client";

import { useEffect, useMemo, useState } from "react";

type OutcomeLevel = "NONE" | "LOW" | "MED" | "HIGH";

type OutcomeCheck = {
  id: string;
  metricKey: string;
  checkWindowDays: number;
  dueAt: string;
  outcomeLevel: OutcomeLevel;
  metricValue: number | null;
  note: string | null;
};

type Session = {
  id: string;
  title: string;
  outcomeChecks: OutcomeCheck[];
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(date));

export const CheckPanel = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; message?: string }>(
    { type: "idle" },
  );

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeId) ?? sessions[0],
    [activeId, sessions],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/sessions", { cache: "no-store" });
        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload?.error ?? "Erreur chargement sessions.");
        }
        const payload = await response.json();
        const nextSessions = (payload.sessions ?? []) as Session[];
        setSessions(nextSessions);
        setActiveId(nextSessions[0]?.id ?? null);
      } catch (error) {
        setStatus({
          type: "error",
          message: error instanceof Error ? error.message : "Erreur chargement sessions.",
        });
      }
    };
    load();
  }, []);

  const updateCheck = async (check: OutcomeCheck, updates: Partial<OutcomeCheck>) => {
    setStatus({ type: "idle" });
    try {
      const response = await fetch(`/api/checks/${check.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcomeLevel: updates.outcomeLevel ?? check.outcomeLevel,
          metricValue: updates.metricValue ?? check.metricValue,
          note: updates.note ?? check.note,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error ?? "Erreur mise a jour.");
      }

      const payload = await response.json();
      const nextCheck = payload?.check as OutcomeCheck | undefined;

      setSessions((current) =>
        current.map((session) => ({
          ...session,
          outcomeChecks: session.outcomeChecks.map((item) =>
            item.id === check.id ? { ...item, ...(nextCheck ?? updates) } : item,
          ),
        })),
      );
      setStatus({ type: "success", message: "Check mis a jour." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Erreur mise a jour.",
      });
    }
  };

  return (
    <div className="check-panel">
      <div className="panel-actions" style={{ marginBottom: "16px" }}>
        <label htmlFor="check-session" className="detail-label">
          Session
        </label>
        <select
          id="check-session"
          value={activeSession?.id ?? ""}
          onChange={(event) => setActiveId(event.target.value)}
        >
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.title}
            </option>
          ))}
        </select>
        <span className="pill">
          {activeSession ? `${activeSession.outcomeChecks.length} checks` : "0 check"}
        </span>
      </div>

      {activeSession ? (
        <div className="check-grid">
          {activeSession.outcomeChecks.map((check) => (
            <div className="check-card" key={check.id}>
              <h4>
                J+{check.checkWindowDays} • {formatDate(check.dueAt)}
              </h4>
              <div className="outcome-levels">
                {(["NONE", "LOW", "MED", "HIGH"] as OutcomeLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`chip ${check.outcomeLevel === level ? "is-active" : ""}`}
                    onClick={() => updateCheck(check, { outcomeLevel: level })}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="metric-row">
                <input
                  value={check.metricValue ?? ""}
                  onChange={(event) => {
                    setSessions((current) =>
                      current.map((session) => ({
                        ...session,
                        outcomeChecks: session.outcomeChecks.map((item) =>
                          item.id === check.id
                            ? {
                                ...item,
                                metricValue: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              }
                            : item,
                        ),
                      })),
                    );
                  }}
                  placeholder="Metric value"
                />
                <input
                  value={check.note ?? ""}
                  onChange={(event) => {
                    setSessions((current) =>
                      current.map((session) => ({
                        ...session,
                        outcomeChecks: session.outcomeChecks.map((item) =>
                          item.id === check.id ? { ...item, note: event.target.value } : item,
                        ),
                      })),
                    );
                  }}
                  placeholder="Note"
                />
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => updateCheck(check, {})}
                >
                  Sauver
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Aucune session disponible.</p>
      )}

      {status.type !== "idle" ? (
        <div className={`form-status ${status.type}`}>{status.message}</div>
      ) : null}
    </div>
  );
};
