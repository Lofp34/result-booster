import { OutcomeLevel } from "@prisma/client";
import { findMetric, objectiveConfig } from "./objective-config";

const outcomeWeights: Record<OutcomeLevel, number> = {
  NONE: 0,
  LOW: 1,
  MED: 2,
  HIGH: 3,
};

export const scoreSession = ({
  metricKey,
  outcomeLevel,
  metricValue,
  durationMinutes,
}: {
  metricKey: string;
  outcomeLevel: OutcomeLevel;
  metricValue?: number | null;
  durationMinutes: number;
}) => {
  const metric = findMetric(metricKey);
  if (!metric) {
    return { score: 0, scorePerHour: 0 };
  }

  const levelWeight = objectiveConfig.levels[metric.level].levelWeight;
  const base = levelWeight * outcomeWeights[outcomeLevel];

  let bonus = 0;
  if (metricValue && metricValue > 0) {
    if (metric.metricBonusPerUnit) {
      bonus = metricValue * metric.metricBonusPerUnit;
    } else if (metric.metricBonus?.type === "per_1000_eur") {
      bonus = (metricValue / 1000) * metric.metricBonus.value;
      if (metric.metricBonus.cap) {
        bonus = Math.min(bonus, metric.metricBonus.cap);
      }
    }
  }

  bonus = Math.min(bonus, objectiveConfig.scoring.capTotalBonusPerSession);
  const score = base + bonus;
  const hours = Math.max(durationMinutes / 60, 0.1);

  return { score, scorePerHour: Number((score / hours).toFixed(2)) };
};
