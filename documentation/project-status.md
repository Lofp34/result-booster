# Project Status (MVP)

## Objectif
Construire une V1 de suivi du temps oriente impact, avec objectifs A/B/C, checks J+2/J+7/J+30, scoring, et conversion C->B->A.

## Perimetre (scope)
- In: Sessions, objectifs A/B/C, checks outcome, scoring, weekly review, suggestions de conversion.
- Out: Task manager complet, multi-utilisateur, automatisations externes.

## Ce qui est en place
- Prototype UI initial (session + weekly review + bibliotheque sessions + detail check).
- MVP Next.js (web/) avec UI integree, API routes, Prisma schema, migration initiale.
- Formulaire session connecte a /api/sessions (creation + refresh).
- Edition des checks via /api/checks/[id] (UI connectee).
- Recommandations IA visibles dans la Weekly Review (via /api/gemini).
- Weekly Review affiche outcome level et metric value par session.
- Zone Outcome checks connectee aux checks reels (edition inline).

## Decisions prises
- UI prototype statique en HTML/CSS/JS, design editorial et contraste eleve.
- MVP dans web/ (Next.js App Router) avec Prisma + Neon et endpoints API.
- Gemini optionnel via /api/gemini, active si GEMINI_API_KEY.

## Risques / Blocages
- Migrations Prisma creees sans DB locale (a appliquer lors du branchement Neon).

## Prochaine etape (proposee)
1) Ajouter un filtre date/level sur la bibliotheque de sessions.
2) Ajouter une page historique hebdo (comparatif semaine).
3) Ajouter un tableau de bord synthese (top actions + tendances).

## Journal des evolutions
- 2026-01-04: Creation du document de statut et prototype UI initial.
- 2026-01-04: Ajout des ecrans bibliotheque sessions et detail check.
- 2026-01-04: Ajout MVP Next.js (UI + Prisma + API + Gemini optionnel).
- 2026-01-04: Wire du formulaire session vers /api/sessions.
- 2026-01-04: Wire edition des checks vers /api/checks/[id].
- 2026-01-04: Ajout widget IA Weekly Review (appel /api/gemini).
- 2026-01-04: Weekly Review enrichie avec outcome level et metric value.
- 2026-01-04: Branchements Outcome checks (timeline) sur data live.
