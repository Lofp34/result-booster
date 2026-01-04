import { addDays } from "./dates";
import { findMetric, objectiveConfig } from "./objective-config";

export const buildOutcomeChecks = (metricKey: string, createdAt = new Date()) => {
  const metric = findMetric(metricKey);
  const windows = metric?.defaultCheckWindowsDays ?? [7];

  return windows.map((days) => ({
    metricKey,
    checkWindowDays: days,
    dueAt: addDays(createdAt, days),
  }));
};

export const getNextSteps = (expectedLevel: "A" | "B" | "C") => {
  const rule = objectiveConfig.conversionRules.find(
    (item) => item.when.expectedLevel === expectedLevel,
  );
  if (!rule) return [];

  return [...rule.suggestNext, ...rule.thenPush];
};
