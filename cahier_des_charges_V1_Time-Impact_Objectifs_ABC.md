# Cahier des charges V1 — App “Time → Impact” (Objectifs A/B/C + Conversion C→B→A)

> Version : V1 (mise à jour “Objective Ladder + Conversion Rules + Scoring + Checks”)  
> Cible : usage solo (Laurent) — friction minimale, décisions hebdo actionnables.

---

## 1) Objectif produit

Construire une application de suivi du temps **orientée impact** qui relie :

- **Temps passé** (sessions)
- **Action réalisée** (description structurée)
- **Résultat attendu** (objectif principal + secondaires)
- **Résultat observé** (checks J+2 / J+7 / J+30)
- **Apprentissage** : *Stop / Start / Continue* + recommandations de conversion **C → B → A**

**Règle produit :** l’app doit te pousser à convertir les signaux **C → B → A**.

---

## 2) Hiérarchie d’objectifs (Objective Ladder)

### Niveau A — Résultats business (les vrais)
- Leads entrants qualifiés
- RDV pris
- Propositions envoyées
- Deals signés / CA
- Renouvellements / upsell

### Niveau B — Indicateurs avancés (prédictifs)
- Conversations DM initiées
- Réponses positives
- Clics vers laurencer.com
- Abonnés “ICP” (dirigeants PME ciblées)

### Niveau C — Vanité (à garder sans se raconter d’histoires)
- Vues, likes, commentaires, impressions

---

## 3) Spécifications fonctionnelles — Ajouts / mises à jour (V1)

### 3.1 Objective Ladder (A/B/C)

**But :** standardiser tes objectifs, tes métriques, et les checks (J+2/J+7/J+30).

**Règles :**
- Toute session a **1 objectif principal** (obligatoire) : `expected_primary`
- Option : 0–2 objectifs secondaires : `expected_secondary[]`
- Chaque objectif pointe vers une **metric** (ex: `meetings`, `positive_replies`, `impressions`)
- Chaque metric a :
  - `level` = A/B/C
  - `unit` = count / eur
  - `default_check_windows_days` = [2, 7, 30] (selon métrique)
  - `weight` (scoring) + bonus facultatif

**UI — fin de session (V1) :**
- Onglets/chips “Niveau **A** / **B** / **C**”
- Sous chaque niveau : chips des métriques (ex: **RDV**, **Leads qualifiés**, **DM initiés**…)
- Un clic = **objectif principal**
- Option “+” = ajouter en **secondaire**

---

### 3.2 Conversion Rules (C → B → A)

**But :** éviter de s’arrêter aux métriques de vanité et pousser mécaniquement vers le business.

**Règles :**
- Si `expected_primary.level = C`, l’app génère automatiquement :
  - une liste de **Next Steps B** (distribution / DM / clics / réponses positives)
- Si `expected_primary.level = B`, l’app génère :
  - une liste de **Next Steps A** (RDV / proposition / deal)

**Où apparaissent les “next steps” :**
- À l’enregistrement d’une session : carte “Prochaines actions (auto)”
- Dans la Weekly Review : “Tes 3 actions à exécuter la semaine prochaine”
- (V1) Les next steps sont des **suggestions** (pas besoin d’un task manager complet)

---

### 3.3 Outcome Checks (J+2 / J+7 / J+30)

**But :** créer une boucle d’apprentissage simple et régulière.

**Règles :**
- À la sauvegarde d’une session, créer automatiquement les `outcome_checks` selon la **metric principale** :
  - ex: `impressions` → checks J+2 et J+7
  - ex: `deals_signed` / `revenue_eur` → checks J+7 et J+30 (ou J+30 uniquement pour CA)
- Chaque check demande :
  1) `outcome_level` : none/low/med/high (**obligatoire**)
  2) `metric_value` (facultatif) : nombre / €
  3) note (facultatif)

---

### 3.4 Scoring (A/B/C + granularité dans A)

**But :** scorer l’impact sans “science-fiction”, en restant honnête.

#### Barème V1 (simple, modifiable)
- `level_weight` : A=5, B=2, C=1
- `outcome_level` : none=0, low=1, med=2, high=3

**Score de base :**
- `base = level_weight * outcome_level`

**Bonus (facultatif, si une valeur est fournie) :**
- `qualified_leads` : +0.3 / lead
- `meetings` : +0.5 / RDV
- `proposals_sent` : +0.7 / proposition
- `deals_signed` : +2.0 / deal
- `revenue_eur` : +1.0 par 1000€ (plafonné)
- `renewals_upsell` : +2.0 / upsell

**Score final :**
- `score = base + metric_bonus`
- `score_per_hour = score / duration_hours`

> Tu peux fonctionner en “qualitatif” (outcome_level) et ajouter les chiffres quand tu les as.

---

### 3.5 Weekly Review (funnel + décisions)

**Affichage :**
1) **A — Business** (prioritaire)
2) **B — Prédictifs**
3) **C — Vanité**

**Sorties IA (ou règles simples si IA off) :**
- 3 décisions max : **Stop / Start / Continue**
- “Doubler” : Top 2 actions par **score/heure** (niveau A en priorité)
- 1 recommandation **C→B** et 1 recommandation **B→A**

---

## 4) Implémentation données — V1 (minimal)

### 4.1 Stockage configuration
- Table `user_settings` avec champ `objective_config_json` (jsonb)

### 4.2 Sessions
Dans `activity_sessions`, stocker :
- `expected_primary_metric_key` (string)
- `expected_secondary_metric_keys` (string[], optionnel)

### 4.3 Checks
Dans `outcome_checks`, stocker :
- `metric_key` (string)
- `metric_value` (numeric, nullable)
- `outcome_level` (enum)

---

## 5) Exemple de configuration JSON (prêt à stocker en base)

```json
{
  "objective_ladder": {
    "levels": {
      "A": { "name": "Business", "level_weight": 5 },
      "B": { "name": "Predictif", "level_weight": 2 },
      "C": { "name": "Vanite", "level_weight": 1 }
    },
    "metrics": [
      { "key": "qualified_leads", "label": "Leads qualifiés", "level": "A", "unit": "count", "default_check_windows_days": [7, 30], "metric_bonus_per_unit": 0.3 },
      { "key": "meetings", "label": "RDV pris", "level": "A", "unit": "count", "default_check_windows_days": [7, 30], "metric_bonus_per_unit": 0.5 },
      { "key": "proposals_sent", "label": "Propositions envoyées", "level": "A", "unit": "count", "default_check_windows_days": [7, 30], "metric_bonus_per_unit": 0.7 },
      { "key": "deals_signed", "label": "Deals signés", "level": "A", "unit": "count", "default_check_windows_days": [7, 30], "metric_bonus_per_unit": 2.0 },
      { "key": "revenue_eur", "label": "CA (€)", "level": "A", "unit": "eur", "default_check_windows_days": [30], "metric_bonus": { "type": "per_1000_eur", "value": 1.0, "cap": 10 } },
      { "key": "renewals_upsell", "label": "Renouvellements / Upsell", "level": "A", "unit": "count", "default_check_windows_days": [30], "metric_bonus_per_unit": 2.0 },

      { "key": "dm_started", "label": "DM initiés", "level": "B", "unit": "count", "default_check_windows_days": [2, 7], "metric_bonus_per_unit": 0.1 },
      { "key": "positive_replies", "label": "Réponses positives", "level": "B", "unit": "count", "default_check_windows_days": [2, 7], "metric_bonus_per_unit": 0.2 },
      { "key": "site_clicks", "label": "Clics vers laurencer.com", "level": "B", "unit": "count", "default_check_windows_days": [2, 7], "metric_bonus_per_unit": 0.05 },
      { "key": "icp_followers", "label": "Abonnés ICP", "level": "B", "unit": "count", "default_check_windows_days": [7], "metric_bonus_per_unit": 0.1 },

      { "key": "impressions", "label": "Impressions", "level": "C", "unit": "count", "default_check_windows_days": [2, 7] },
      { "key": "views", "label": "Vues", "level": "C", "unit": "count", "default_check_windows_days": [2, 7] },
      { "key": "likes", "label": "Likes", "level": "C", "unit": "count", "default_check_windows_days": [2, 7] },
      { "key": "comments", "label": "Commentaires", "level": "C", "unit": "count", "default_check_windows_days": [2, 7] }
    ],
    "outcome_levels": { "none": 0, "low": 1, "med": 2, "high": 3 }
  },

  "conversion_rules": [
    {
      "when": { "expected_level": "C" },
      "suggest_next": [
        { "metric_key": "dm_started", "default_target": 10, "label": "Initier 10 DM ciblés" },
        { "metric_key": "positive_replies", "default_target": 3, "label": "Obtenir 3 réponses positives" },
        { "metric_key": "site_clicks", "default_target": 20, "label": "Générer 20 clics vers laurencer.com" }
      ],
      "then_push": [
        { "metric_key": "meetings", "default_target": 1, "label": "Transformer en 1 RDV qualifié" }
      ]
    },
    {
      "when": { "expected_level": "B" },
      "suggest_next": [
        { "metric_key": "meetings", "default_target": 1, "label": "Obtenir 1 RDV qualifié" },
        { "metric_key": "proposals_sent", "default_target": 1, "label": "Envoyer 1 proposition" }
      ],
      "then_push": [
        { "metric_key": "deals_signed", "default_target": 1, "label": "Closer 1 deal" }
      ]
    }
  ],

  "scoring": {
    "use_metric_bonus_when_value_provided": true,
    "score_formula": "level_weight * outcome_level + metric_bonus",
    "metric_bonus_defaults": {
      "cap_total_bonus_per_session": 10
    }
  }
}
```

---

## 6) Notes de mise en œuvre (pragmatiques)

- **V1 peut être 100% manuel** : tu coches *none/low/med/high* et tu ajoutes les chiffres quand tu les as.
- La conversion C→B→A est assurée par :
  - l’UI (choix d’objectifs + next steps)
  - les relances (checks)
  - la Weekly Review (décisions + recommandations)

---

*Fin du document.*
