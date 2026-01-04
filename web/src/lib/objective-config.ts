export type ObjectiveLevel = "A" | "B" | "C";

export type ObjectiveMetric = {
  key: string;
  label: string;
  level: ObjectiveLevel;
  unit: "count" | "eur";
  defaultCheckWindowsDays: number[];
  metricBonusPerUnit?: number;
  metricBonus?: {
    type: "per_1000_eur";
    value: number;
    cap?: number;
  };
};

export const objectiveConfig = {
  levels: {
    A: { name: "Business", levelWeight: 5 },
    B: { name: "Predictif", levelWeight: 2 },
    C: { name: "Vanite", levelWeight: 1 },
  },
  metrics: [
    {
      key: "qualified_leads",
      label: "Leads qualifies",
      level: "A",
      unit: "count",
      defaultCheckWindowsDays: [7, 30],
      metricBonusPerUnit: 0.3,
    },
    {
      key: "meetings",
      label: "RDV pris",
      level: "A",
      unit: "count",
      defaultCheckWindowsDays: [7, 30],
      metricBonusPerUnit: 0.5,
    },
    {
      key: "proposals_sent",
      label: "Propositions envoyees",
      level: "A",
      unit: "count",
      defaultCheckWindowsDays: [7, 30],
      metricBonusPerUnit: 0.7,
    },
    {
      key: "deals_signed",
      label: "Deals signes",
      level: "A",
      unit: "count",
      defaultCheckWindowsDays: [7, 30],
      metricBonusPerUnit: 2.0,
    },
    {
      key: "revenue_eur",
      label: "CA (EUR)",
      level: "A",
      unit: "eur",
      defaultCheckWindowsDays: [30],
      metricBonus: { type: "per_1000_eur", value: 1.0, cap: 10 },
    },
    {
      key: "renewals_upsell",
      label: "Renouvellements / Upsell",
      level: "A",
      unit: "count",
      defaultCheckWindowsDays: [30],
      metricBonusPerUnit: 2.0,
    },
    {
      key: "dm_started",
      label: "DM initie",
      level: "B",
      unit: "count",
      defaultCheckWindowsDays: [2, 7],
      metricBonusPerUnit: 0.1,
    },
    {
      key: "positive_replies",
      label: "Reponses positives",
      level: "B",
      unit: "count",
      defaultCheckWindowsDays: [2, 7],
      metricBonusPerUnit: 0.2,
    },
    {
      key: "site_clicks",
      label: "Clics site",
      level: "B",
      unit: "count",
      defaultCheckWindowsDays: [2, 7],
      metricBonusPerUnit: 0.05,
    },
    {
      key: "icp_followers",
      label: "Abonnes ICP",
      level: "B",
      unit: "count",
      defaultCheckWindowsDays: [7],
      metricBonusPerUnit: 0.1,
    },
    {
      key: "impressions",
      label: "Impressions",
      level: "C",
      unit: "count",
      defaultCheckWindowsDays: [2, 7],
    },
    {
      key: "views",
      label: "Vues",
      level: "C",
      unit: "count",
      defaultCheckWindowsDays: [2, 7],
    },
    {
      key: "likes",
      label: "Likes",
      level: "C",
      unit: "count",
      defaultCheckWindowsDays: [2, 7],
    },
    {
      key: "comments",
      label: "Commentaires",
      level: "C",
      unit: "count",
      defaultCheckWindowsDays: [2, 7],
    },
  ] satisfies ObjectiveMetric[],
  outcomeLevels: { none: 0, low: 1, med: 2, high: 3 },
  scoring: {
    capTotalBonusPerSession: 10,
  },
  conversionRules: [
    {
      when: { expectedLevel: "C" },
      suggestNext: [
        { metricKey: "dm_started", defaultTarget: 10, label: "Initier 10 DM cibles" },
        {
          metricKey: "positive_replies",
          defaultTarget: 3,
          label: "Obtenir 3 reponses positives",
        },
        { metricKey: "site_clicks", defaultTarget: 20, label: "Generer 20 clics site" },
      ],
      thenPush: [
        { metricKey: "meetings", defaultTarget: 1, label: "Transformer en 1 RDV" },
      ],
    },
    {
      when: { expectedLevel: "B" },
      suggestNext: [
        { metricKey: "meetings", defaultTarget: 1, label: "Obtenir 1 RDV qualifie" },
        { metricKey: "proposals_sent", defaultTarget: 1, label: "Envoyer 1 proposition" },
      ],
      thenPush: [{ metricKey: "deals_signed", defaultTarget: 1, label: "Closer 1 deal" }],
    },
  ],
};

export const findMetric = (key: string) =>
  objectiveConfig.metrics.find((metric) => metric.key === key);
