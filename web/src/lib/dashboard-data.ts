import { OutcomeLevel } from "@prisma/client";
import { getNextSteps } from "./checks";
import { findMetric, objectiveConfig } from "./objective-config";
import { prisma } from "./prisma";
import { scoreSession } from "./scoring";

export type SessionSummary = {
  id: string;
  title: string;
  durationMinutes: number;
  createdAt: string;
  primaryMetricKey: string;
  primaryLevel: "A" | "B" | "C";
  score: number;
  scorePerHour: number;
  outcomeLevel: OutcomeLevel;
  metricValue?: number | null;
  notes?: string | null;
};

export type WeeklySummary = {
  totalScore: number;
  byLevel: Record<"A" | "B" | "C", SessionSummary[]>;
  topActions: SessionSummary[];
  decisions: { stop: string; start: string; continue: string };
  recommendations: { cToB?: string; bToA?: string };
};

const sampleSessions: SessionSummary[] = [
  {
    id: "sample-1",
    title: "Post LinkedIn ICP",
    durationMinutes: 160,
    createdAt: "2026-01-04T09:30:00Z",
    primaryMetricKey: "impressions",
    primaryLevel: "C",
    score: 1.4,
    scorePerHour: 0.53,
    outcomeLevel: "LOW",
    metricValue: 1800,
    notes: "Angle revenu recurrent sur PME croissance.",
  },
  {
    id: "sample-2",
    title: "DM outreach cible",
    durationMinutes: 70,
    createdAt: "2026-01-03T11:10:00Z",
    primaryMetricKey: "positive_replies",
    primaryLevel: "B",
    score: 3.2,
    scorePerHour: 2.74,
    outcomeLevel: "MED",
    metricValue: 4,
    notes: "15 messages cibles, focus dirigeants SaaS.",
  },
  {
    id: "sample-3",
    title: "Call + proposition",
    durationMinutes: 50,
    createdAt: "2026-01-02T15:40:00Z",
    primaryMetricKey: "proposals_sent",
    primaryLevel: "A",
    score: 6.8,
    scorePerHour: 8.16,
    outcomeLevel: "HIGH",
    metricValue: 1,
    notes: "Proposition envoyee apres call discovery.",
  },
  {
    id: "sample-4",
    title: "Case study court",
    durationMinutes: 90,
    createdAt: "2025-12-31T10:00:00Z",
    primaryMetricKey: "qualified_leads",
    primaryLevel: "A",
    score: 5.1,
    scorePerHour: 3.4,
    outcomeLevel: "MED",
    metricValue: 2,
    notes: "Contenu preuve sociale, CTA RDV.",
  },
];

const sampleWeekly: WeeklySummary = {
  totalScore: 28.6,
  byLevel: {
    A: sampleSessions.filter((session) => session.primaryLevel === "A"),
    B: sampleSessions.filter((session) => session.primaryLevel === "B"),
    C: sampleSessions.filter((session) => session.primaryLevel === "C"),
  },
  topActions: sampleSessions.slice(0, 2),
  decisions: {
    stop: "Posts generiques sans CTA direct.",
    start: "Serie d'outreach cible sur 15 comptes ICP.",
    continue: "Format editorial + case studies courts.",
  },
  recommendations: {
    cToB: "Convertir impressions en DM initie sur 10 ICP.",
    bToA: "Transformer reponses positives en RDV qualifies.",
  },
};

const buildWeeklySummary = (sessions: SessionSummary[]): WeeklySummary => {
  const byLevel = { A: [], B: [], C: [] } as WeeklySummary["byLevel"];
  sessions.forEach((session) => {
    byLevel[session.primaryLevel].push(session);
  });

  const totalScore = sessions.reduce((sum, session) => sum + session.score, 0);
  const topActions = [...sessions].sort((a, b) => b.scorePerHour - a.scorePerHour).slice(0, 2);

  return {
    totalScore: Number(totalScore.toFixed(1)),
    byLevel,
    topActions,
    decisions: sampleWeekly.decisions,
    recommendations: sampleWeekly.recommendations,
  };
};

const getPrimaryLevel = (metricKey: string): "A" | "B" | "C" => {
  const metric = findMetric(metricKey);
  return metric?.level ?? "C";
};

export const getDashboardData = async () => {
  if (!process.env.DATABASE_URL) {
    return {
      sessions: sampleSessions,
      weekly: sampleWeekly,
      nextSteps: getNextSteps("C"),
    };
  }

  try {
    const sessions = await prisma.activitySession.findMany({
      orderBy: { createdAt: "desc" },
      include: { outcomeChecks: true },
    });

    const summaries: SessionSummary[] = sessions.map((session) => {
      const latestCheck = [...session.outcomeChecks].sort(
        (a, b) => b.checkWindowDays - a.checkWindowDays,
      )[0];
      const outcomeLevel = latestCheck?.outcomeLevel ?? "NONE";
      const metricValue = latestCheck?.metricValue ?? null;
      const { score, scorePerHour } = scoreSession({
        metricKey: session.expectedPrimaryMetricKey,
        outcomeLevel,
        metricValue,
        durationMinutes: session.durationMinutes,
      });

      return {
        id: session.id,
        title: session.title,
        durationMinutes: session.durationMinutes,
        createdAt: session.createdAt.toISOString(),
        primaryMetricKey: session.expectedPrimaryMetricKey,
        primaryLevel: getPrimaryLevel(session.expectedPrimaryMetricKey),
        score,
        scorePerHour,
        outcomeLevel,
        metricValue,
        notes: session.notes,
      };
    });

    const firstLevel = summaries[0]?.primaryLevel ?? "C";
    return {
      sessions: summaries,
      weekly: buildWeeklySummary(summaries),
      nextSteps: getNextSteps(firstLevel),
    };
  } catch (error) {
    console.warn("Database unavailable, using sample data.", error);
    return {
      sessions: sampleSessions,
      weekly: sampleWeekly,
      nextSteps: getNextSteps("C"),
    };
  }
};

export const getObjectiveConfig = () => objectiveConfig;
