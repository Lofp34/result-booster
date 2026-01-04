"use client";

import { useMemo, useState } from "react";
import { ObjectiveMetric } from "@/lib/objective-config";

type Props = {
  metrics: ObjectiveMetric[];
};

const levels = [
  { key: "A", label: "A - Business" },
  { key: "B", label: "B - Predictif" },
  { key: "C", label: "C - Vanite" },
] as const;

export const ObjectiveSelector = ({ metrics }: Props) => {
  const [primaryKey, setPrimaryKey] = useState<string | null>(null);
  const [secondaryKeys, setSecondaryKeys] = useState<string[]>([]);
  const [secondaryMode, setSecondaryMode] = useState(false);

  const grouped = useMemo(() => {
    return levels.map((level) => ({
      ...level,
      metrics: metrics.filter((metric) => metric.level === level.key),
    }));
  }, [metrics]);

  const primaryLabel =
    metrics.find((metric) => metric.key === primaryKey)?.label ?? "Aucun";
  const secondaryLabels = secondaryKeys
    .map((key) => metrics.find((metric) => metric.key === key)?.label)
    .filter(Boolean);

  const toggleSecondary = () => setSecondaryMode((value) => !value);

  const onSelect = (key: string) => {
    if (secondaryMode) {
      if (secondaryKeys.includes(key)) {
        setSecondaryKeys((items) => items.filter((item) => item !== key));
      } else if (secondaryKeys.length < 2 && key !== primaryKey) {
        setSecondaryKeys((items) => [...items, key]);
      }
      return;
    }

    setPrimaryKey(key);
  };

  const clear = () => {
    setPrimaryKey(null);
    setSecondaryKeys([]);
  };

  return (
    <div className="ladder">
      <div className="ladder-header">
        <h3>Objective Ladder</h3>
        <p>Choisis un resultat attendu.</p>
      </div>
      <div className="panel-actions" style={{ marginBottom: "12px" }}>
        <button
          type="button"
          className={secondaryMode ? "btn" : "btn ghost"}
          onClick={toggleSecondary}
        >
          {secondaryMode ? "Secondaire actif" : "Mode secondaire"}
        </button>
        <button type="button" className="btn ghost" onClick={clear}>
          Effacer
        </button>
      </div>
      <div className="ladder-columns">
        {grouped.map((level) => (
          <div className="ladder-column" key={level.key}>
            <div className="ladder-title">{level.label}</div>
            <div className="chips">
              {level.metrics.map((metric) => (
                <button
                  type="button"
                  className={[
                    "metric-chip",
                    primaryKey === metric.key ? "is-primary" : "",
                    secondaryKeys.includes(metric.key) ? "is-secondary" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={metric.key}
                  data-level={metric.level}
                  onClick={() => onSelect(metric.key)}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="selection-summary">
        <div>
          <span>Principal</span>
          <strong>{primaryLabel}</strong>
        </div>
        <div>
          <span>Secondaires</span>
          <strong>{secondaryLabels.length ? secondaryLabels.join(", ") : "Aucun"}</strong>
        </div>
      </div>
    </div>
  );
};
