import type { CSSProperties } from "react";
import { SessionComposer } from "@/components/session-composer";
import { CheckPanel } from "@/components/check-panel";
import { OutcomeChecksTimeline } from "@/components/outcome-checks";
import { SessionLibrary } from "@/components/session-library";
import { WeeklyAI } from "@/components/weekly-ai";
import { getDashboardData } from "@/lib/dashboard-data";
import { objectiveConfig } from "@/lib/objective-config";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(date);

export default async function Home() {
  const data = await getDashboardData();
  const latest = data.sessions[0];

  return (
    <>
      <div className="page" aria-hidden="true"></div>
      <header className="top">
        <div className="brand">
          <span className="brand-mark">TI</span>
          <div>
            <h1>Time -&gt; Impact</h1>
            <p>Suivi du temps oriente resultats. Conversion C -&gt; B -&gt; A integree.</p>
          </div>
        </div>
        <div className="meta">
          <div className="meta-item">
            <span>Derniere session</span>
            <strong>
              {latest
                ? `${formatDate(new Date(latest.createdAt))} · ${latest.durationMinutes} min`
                : "--"}
            </strong>
          </div>
          <div className="meta-item">
            <span>Score / heure</span>
            <strong>{latest ? latest.scorePerHour : "0.0"}</strong>
          </div>
          <button className="btn ghost">Nouvelle session</button>
        </div>
      </header>

      <main className="layout">
        <section className="panel animate" style={{ "--delay": "0.05s" } as CSSProperties}>
          <div className="panel-header">
            <div>
              <h2>Cloture de session</h2>
              <p>Selectionne un objectif principal, puis 0-2 secondaires.</p>
            </div>
            <div className="panel-actions">
              <button className="btn ghost">Importer depuis calendrier</button>
            </div>
          </div>

          <SessionComposer metrics={objectiveConfig.metrics} />
        </section>

        <section className="panel timeline animate" style={{ "--delay": "0.18s" } as CSSProperties}>
          <div className="panel-header">
            <div>
              <h2>Outcome checks — Vue timeline</h2>
              <p>
                Fenetres generees selon la metrique principale (ex: impressions = J+2/J+7).
              </p>
            </div>
            <span className="pill">Auto-genere</span>
          </div>
          <OutcomeChecksTimeline />
        </section>

        <section className="panel weekly animate" style={{ "--delay": "0.3s" } as CSSProperties}>
          <div className="panel-header">
            <div>
              <h2>Weekly review</h2>
              <p>Funnel A/B/C + decisions Stop/Start/Continue.</p>
            </div>
            <div className="score-chip">
              <span>Score global</span>
              <strong>{data.weekly.totalScore}</strong>
            </div>
          </div>

          <div className="weekly-grid">
            {(["A", "B", "C"] as const).map((level) => (
              <div className="weekly-column" key={level}>
                <div className="weekly-header">
                  <span className={`badge ${level.toLowerCase()}`}>{level}</span>
                  <h3>{objectiveConfig.levels[level].name}</h3>
                </div>
                {data.weekly.byLevel[level].map((session) => (
                  <div className="weekly-card" key={session.id}>
                    <strong>{session.title}</strong>
                    <p>
                      {session.scorePerHour} score/h • {session.durationMinutes} min
                    </p>
                    <div className="weekly-meta">
                      <span className="outcome-pill">{session.outcomeLevel}</span>
                      {session.metricValue ? (
                        <span className="outcome-pill soft">{session.metricValue}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="decisions">
            <div className="decision-card">
              <h4>Stop</h4>
              <p>{data.weekly.decisions.stop}</p>
            </div>
            <div className="decision-card">
              <h4>Start</h4>
              <p>{data.weekly.decisions.start}</p>
            </div>
            <div className="decision-card">
              <h4>Continue</h4>
              <p>{data.weekly.decisions.continue}</p>
            </div>
          </div>

          <WeeklyAI weekly={data.weekly} sessions={data.sessions} />
        </section>

        <section className="panel library animate" style={{ "--delay": "0.4s" } as CSSProperties}>
          <div className="panel-header">
            <div>
              <h2>Bibliotheque de sessions</h2>
              <p>Historique rapide, tri par niveau et impact.</p>
            </div>
            <div className="panel-actions">
              <button className="btn ghost">Filtrer A/B/C</button>
              <button className="btn ghost">Cette semaine</button>
            </div>
          </div>
          <SessionLibrary sessions={data.sessions} />
        </section>

        <section className="panel check-detail animate" style={{ "--delay": "0.5s" } as CSSProperties}>
          <div className="panel-header">
            <div>
              <h2>Outcome checks — Vue edition</h2>
              <p>Edition rapide des checks (niveau, valeur, note).</p>
            </div>
            <span className="pill">Edition</span>
          </div>
          <CheckPanel />
        </section>
      </main>
    </>
  );
}
