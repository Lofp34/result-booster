"use client";

import { useMemo } from "react";
import type { SessionSummary } from "@/lib/dashboard-data";

type Props = {
  sessions: SessionSummary[];
};

type WeeklyBucket = {
  label: string;
  start: Date;
  totalScore: number;
  avgScorePerHour: number;
  counts: Record<"A" | "B" | "C", number>;
  topSessions: SessionSummary[];
};

const startOfWeek = (date: Date) => {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
};

const formatWeek = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(date);

export const WeeklyHistory = ({ sessions }: Props) => {
  const weeks = useMemo(() => {
    const buckets = new Map<string, WeeklyBucket>();

    sessions.forEach((session) => {
      const createdAt = new Date(session.createdAt);
      const weekStart = startOfWeek(createdAt);
      const key = weekStart.toISOString();

      if (!buckets.has(key)) {
        buckets.set(key, {
          label: `Semaine du ${formatWeek(weekStart)}`,
          start: weekStart,
          totalScore: 0,
          avgScorePerHour: 0,
          counts: { A: 0, B: 0, C: 0 },
          topSessions: [],
        });
      }

      const bucket = buckets.get(key)!;
      bucket.totalScore += session.score;
      bucket.counts[session.primaryLevel] += 1;
      bucket.topSessions.push(session);
    });

    const list = Array.from(buckets.values()).map((bucket) => {
      const avg =
        bucket.topSessions.reduce((sum, session) => sum + session.scorePerHour, 0) /
        Math.max(bucket.topSessions.length, 1);
      bucket.avgScorePerHour = Number(avg.toFixed(2));
      bucket.totalScore = Number(bucket.totalScore.toFixed(1));
      bucket.topSessions = [...bucket.topSessions]
        .sort((a, b) => b.scorePerHour - a.scorePerHour)
        .slice(0, 2);
      return bucket;
    });

    return list.sort((a, b) => b.start.getTime() - a.start.getTime());
  }, [sessions]);

  if (!weeks.length) {
    return <p>Aucune semaine disponible.</p>;
  }

  return (
    <div className="weekly-history">
      {weeks.map((week, index) => {
        const prev = weeks[index + 1];
        const delta = prev ? Number((week.totalScore - prev.totalScore).toFixed(1)) : 0;
        const deltaLabel = prev ? `${delta >= 0 ? "+" : ""}${delta}` : "--";
        return (
          <div className="weekly-history-card" key={week.start.toISOString()}>
            <div className="weekly-history-header">
              <div>
                <h4>{week.label}</h4>
                <p>
                  Total score: {week.totalScore} · Avg score/h: {week.avgScorePerHour}
                </p>
              </div>
              <span className="pill">Delta {deltaLabel}</span>
            </div>
            <div className="weekly-history-body">
              <div className="weekly-history-metrics">
                <div>
                  <span>A</span>
                  <strong>{week.counts.A}</strong>
                </div>
                <div>
                  <span>B</span>
                  <strong>{week.counts.B}</strong>
                </div>
                <div>
                  <span>C</span>
                  <strong>{week.counts.C}</strong>
                </div>
              </div>
              <div className="weekly-history-top">
                <span className="detail-label">Top actions</span>
                <ul>
                  {week.topSessions.map((session) => (
                    <li key={session.id}>
                      {session.title} · {session.scorePerHour} score/h
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
