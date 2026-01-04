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

## Decisions prises
- UI prototype statique en HTML/CSS/JS, design editorial et contraste eleve.
- MVP dans web/ (Next.js App Router) avec Prisma + Neon et endpoints API.
- Gemini optionnel via /api/gemini, active si GEMINI_API_KEY.

## Risques / Blocages
- Migrations Prisma creees sans DB locale (a appliquer lors du branchement Neon).

## Prochaine etape (proposee)
1) Ajouter un flux weekly review avec recommandations Gemini (si cle fournie).
2) Brancher les checks dans la vue Weekly Review (scores + status).
3) Ajouter un filtre date/level sur la bibliotheque de sessions.

## Journal des evolutions
- 2026-01-04: Creation du document de statut et prototype UI initial.
- 2026-01-04: Ajout des ecrans bibliotheque sessions et detail check.
- 2026-01-04: Ajout MVP Next.js (UI + Prisma + API + Gemini optionnel).
- 2026-01-04: Wire du formulaire session vers /api/sessions.
- 2026-01-04: Wire edition des checks vers /api/checks/[id].
