# Time -> Impact (V1)

MVP express pour le suivi du temps oriente impact (A/B/C + checks + conversion).

- Project status: documentation/project-status.md
- UI prototype (statique): ui/index.html
- MVP app (Next.js): web/

## Demarrage local (MVP)

```bash
cd web
npm install
npm run dev
```

## Prisma / Neon

- Variables requises: `DATABASE_URL`, `GEMINI_API_KEY` (optionnel)
- Build Vercel: `npm run build` (executera `prisma generate` + `migrate deploy` si DB)
