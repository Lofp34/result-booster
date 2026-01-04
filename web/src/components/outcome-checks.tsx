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

type DraftState = Record<
  string,
  { outcomeLevel: OutcomeLevel; metricValue: string; note: string }
>;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(date));

export const OutcomeChecksTimeline = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftState>({});
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
        setDrafts({});
      } catch (error) {
        setStatus({
          type: "error",
          message: error instanceof Error ? error.message : "Erreur chargement sessions.",
        });
      }
    };
    load();
  }, []);

  const checks = useMemo(() => {
    return [...(activeSession?.outcomeChecks ?? [])].sort(
      (a, b) => a.checkWindowDays - b.checkWindowDays,
    );
  }, [activeSession]);

  const getDraft = (check: OutcomeCheck) => {
    return (
      drafts[check.id] ?? {
        outcomeLevel: check.outcomeLevel,
        metricValue: check.metricValue?.toString() ?? "",
        note: check.note ?? "",
      }
    );
  };

  const updateDraft = (check: OutcomeCheck, next: Partial<DraftState[string]>) => {
    setDrafts((current) => ({
      ...current,
      [check.id]: { ...getDraft(check), ...next },
    }));
  };

  const saveCheck = async (check: OutcomeCheck) => {
    setStatus({ type: "idle" });
    const draft = getDraft(check);
    try {
      const response = await fetch(`/api/checks/${check.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcomeLevel: draft.outcomeLevel,
          metricValue: draft.metricValue ? Number(draft.metricValue) : null,
          note: draft.note || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error ?? "Erreur mise a jour.");
      }

      const payload = await response.json();
      const nextCheck = payload?.check as OutcomeCheck | undefined;

      if (nextCheck) {
        setSessions((current) =>
          current.map((session) => ({
            ...session,
            outcomeChecks: session.outcomeChecks.map((item) =>
              item.id === check.id ? { ...item, ...nextCheck } : item,
            ),
          })),
        );
        setDrafts((current) => {
          const { [check.id]: _, ...rest } = current;
          return rest;
        });
      }

      setStatus({ type: "success", message: "Check mis a jour." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Erreur mise a jour.",
      });
    }
  };

  return (
    <div>
      <div className="panel-actions" style={{ marginBottom: "16px" }}>
        <label htmlFor="timeline-session" className="detail-label">
          Session
        </label>
        <select
          id="timeline-session"
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

      {checks.length ? (
        <div className="timeline-track">
          {checks.map((check) => {
            const draft = getDraft(check);
            return (
              <div className="timeline-item" key={check.id}>
                <div className="timeline-date">
                  J+{check.checkWindowDays} • {formatDate(check.dueAt)}
                </div>
                <div className="timeline-card">
                  <h4>Outcome</h4>
                  <div className="outcome-levels">
                    {(["NONE", "LOW", "MED", "HIGH"] as OutcomeLevel[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`chip ${draft.outcomeLevel === level ? "is-active" : ""}`}
                        onClick={() => updateDraft(check, { outcomeLevel: level })}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <div className="metric-row">
                    <input
                      value={draft.metricValue}
                      onChange={(event) => updateDraft(check, { metricValue: event.target.value })}
                      placeholder="Metric value"
                    />
                    <input
                      value={draft.note}
                      onChange={(event) => updateDraft(check, { note: event.target.value })}
                      placeholder="Note"
                    />
                    <button type="button" className="btn ghost" onClick={() => saveCheck(check)}>
                      Sauver
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
