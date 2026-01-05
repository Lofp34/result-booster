"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getNextSteps } from "@/lib/checks";
import { findMetric, ObjectiveMetric } from "@/lib/objective-config";
import { ObjectiveSelector } from "./objective-selector";

type Props = {
  metrics: ObjectiveMetric[];
};

const parseDurationMinutes = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.includes(":")) {
    const [hours, minutes] = trimmed.split(":").map((part) => Number(part));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return Math.max(hours * 60 + minutes, 0);
  }

  const numeric = Number(trimmed);
  if (Number.isNaN(numeric)) return null;
  return Math.max(Math.round(numeric), 0);
};

export const SessionComposer = ({ metrics }: Props) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [durationInput, setDurationInput] = useState("02:40");
  const [selection, setSelection] = useState<{
    primaryKey: string | null;
    secondaryKeys: string[];
  }>({ primaryKey: null, secondaryKeys: [] });
  const [status, setStatus] = useState<{ type: "idle" | "error" | "success"; message?: string }>(
    { type: "idle" },
  );
  const [resetToken, setResetToken] = useState(0);

  const primaryMetric = selection.primaryKey ? findMetric(selection.primaryKey) : null;
  const nextSteps = useMemo(() => {
    if (!primaryMetric) return [];
    return getNextSteps(primaryMetric.level);
  }, [primaryMetric]);

  const onSubmit = async () => {
    setStatus({ type: "idle" });
    const durationMinutes = parseDurationMinutes(durationInput);
    if (!title.trim()) {
      setStatus({ type: "error", message: "Le titre de session est requis." });
      return;
    }
    if (!durationMinutes || durationMinutes <= 0) {
      setStatus({ type: "error", message: "La duree doit etre valide." });
      return;
    }
    if (!selection.primaryKey) {
      setStatus({ type: "error", message: "Selectionne un objectif principal." });
      return;
    }

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          notes: notes.trim() || null,
          durationMinutes,
          expectedPrimaryMetricKey: selection.primaryKey,
          expectedSecondaryMetricKeys: selection.secondaryKeys,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error ?? "Erreur lors de la creation.");
      }

      setStatus({ type: "success", message: "Session enregistree." });
      setTitle("");
      setNotes("");
      setDurationInput("02:40");
      setSelection({ primaryKey: null, secondaryKeys: [] });
      setResetToken((value) => value + 1);
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Erreur inattendue.",
      });
    }
  };

  return (
    <div className="session-grid">
      <div className="session-card">
        <div className="session-meta">
          <div>
            <label htmlFor="session-title">Action realisee</label>
            <input
              id="session-title"
              placeholder="Ex: Redaction post LinkedIn ICP"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="session-notes">Objectif business</label>
            <textarea
              id="session-notes"
              rows={3}
              placeholder="Resultat attendu, cible, angle..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
          <div className="time-row">
            <div>
              <label htmlFor="session-duration">Duree</label>
              <input
                id="session-duration"
                value={durationInput}
                onChange={(event) => setDurationInput(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="session-date">Date</label>
              <input id="session-date" value="Aujourd'hui" readOnly />
            </div>
          </div>
        </div>

        <ObjectiveSelector
          metrics={metrics}
          onChange={(nextSelection) => setSelection(nextSelection)}
          resetToken={resetToken}
        />
      </div>

      <div className="session-card accent">
        <h3>Prochaines actions (auto)</h3>
        <p>Generees selon ton objectif principal.</p>
        <div className="next-steps">
          {nextSteps.length === 0 ? (
            <div className="next-step">
              <span className="badge c">C</span>
              <div>
                <strong>Selectionne un objectif</strong>
                <p>Les prochaines actions se generent automatiquement.</p>
              </div>
            </div>
          ) : (
            nextSteps.map((step) => {
              const stepMetric = findMetric(step.metricKey);
              const level = stepMetric?.level ?? "B";
              return (
                <div className="next-step" key={step.metricKey}>
                  <span className={`badge ${level.toLowerCase()}`}>{level}</span>
                <div>
                  <strong>{step.label}</strong>
                  <p>Signal de conversion vers le niveau superieur.</p>
                </div>
                </div>
              );
            })
          )}
        </div>
        <div className="cta-row">
          <button type="button" className="btn" onClick={onSubmit}>
            Enregistrer
          </button>
          <button type="button" className="btn ghost">
            Exporter notes
          </button>
        </div>
        {status.type !== "idle" ? (
          <div className={`form-status ${status.type}`}>{status.message}</div>
        ) : null}
      </div>
    </div>
  );
};
