import type { CSSProperties } from "react";
import { ObjectiveSelector } from "@/components/objective-selector";
import { SessionLibrary } from "@/components/session-library";
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

          <div className="session-grid">
            <div className="session-card">
              <div className="session-meta">
                <div>
                  <label>Action realisee</label>
                  <input placeholder="Ex: Redaction post LinkedIn ICP" />
                </div>
                <div>
                  <label>Intention</label>
                  <textarea rows={3} placeholder="Objectif business, cible, angle..." />
                </div>
                <div className="time-row">
                  <div>
                    <label>Duree</label>
                    <input value="02:40" readOnly />
                  </div>
                  <div>
                    <label>Date</label>
                    <input value="04 Jan 2026" readOnly />
                  </div>
                </div>
              </div>

              <ObjectiveSelector metrics={objectiveConfig.metrics} />
            </div>

            <div className="session-card accent">
              <h3>Prochaines actions (auto)</h3>
              <p>Generees selon ton objectif principal.</p>
              <div className="next-steps">
                {data.nextSteps.map((step) => (
                  <div className="next-step" key={step.metricKey}>
                    <span className={`badge ${step.metricKey === "meetings" ? "a" : "b"}`}>
                      {step.metricKey === "meetings" ? "A" : "B"}
                    </span>
                    <div>
                      <strong>{step.label}</strong>
                      <p>Signal de conversion vers le niveau superieur.</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cta-row">
                <button className="btn">Enregistrer</button>
                <button className="btn ghost">Exporter notes</button>
              </div>
            </div>
          </div>
        </section>

        <section className="panel timeline animate" style={{ "--delay": "0.18s" } as CSSProperties}>
          <div className="panel-header">
            <div>
              <h2>Outcome checks</h2>
              <p>Relances J+2 / J+7 / J+30 pour mesurer l'impact.</p>
            </div>
            <span className="pill">Auto-genere</span>
          </div>
          <div className="timeline-track">
            <div className="timeline-item">
              <div className="timeline-date">J+2</div>
              <div className="timeline-card">
                <h4>Verification rapide</h4>
                <p>Impressions + reponses faibles ? Note un signal.</p>
                <div className="outcome-levels">
                  <button className="chip">None</button>
                  <button className="chip">Low</button>
                  <button className="chip">Med</button>
                  <button className="chip">High</button>
                </div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-date">J+7</div>
              <div className="timeline-card">
                <h4>Impact tangible</h4>
                <p>Ajoute une valeur si disponible.</p>
                <div className="metric-row">
                  <input placeholder="Metric value" />
                  <button className="btn ghost">Ajouter note</button>
                </div>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-date">J+30</div>
              <div className="timeline-card">
                <h4>Validation business</h4>
                <p>Ce qui a vraiment bouge.</p>
                <div className="metric-row">
                  <input placeholder="Outcome level" />
                  <button className="btn ghost">Marquer complete</button>
                </div>
              </div>
            </div>
          </div>
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
              <h2>Detail check</h2>
              <p>Suivi d'un outcome et apprentissage Stop/Start/Continue.</p>
            </div>
            <span className="pill">J+7</span>
          </div>
          <div className="check-grid">
            <div className="check-card">
              <h4>Outcome level</h4>
              <div className="outcome-levels">
                <button className="chip">None</button>
                <button className="chip">Low</button>
                <button className="chip is-active">Med</button>
                <button className="chip">High</button>
              </div>
              <div className="metric-row">
                <input placeholder="Metric value (ex: 28)" />
                <button className="btn ghost">Ajouter note</button>
              </div>
            </div>
            <div className="check-card note">
              <h4>Notes + apprentissages</h4>
              <p>Le contenu a declenche des clics, mais le CTA etait trop discret.</p>
              <div className="decision-badges">
                <span>Stop: posts generiques</span>
                <span>Start: CTA direct sur RDV</span>
                <span>Continue: format editorial court</span>
              </div>
            </div>
            <div className="check-card timeline-mini">
              <h4>Historique</h4>
              <div className="mini-row">
                <span>J+2</span>
                <strong>Low</strong>
                <em>Impressions 1.8k</em>
              </div>
              <div className="mini-row">
                <span>J+7</span>
                <strong>Med</strong>
                <em>Clics 42</em>
              </div>
              <div className="mini-row">
                <span>J+30</span>
                <strong>--</strong>
                <em>En attente</em>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
