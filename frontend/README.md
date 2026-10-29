# JobBoard frontend

Next.js App Router frontend for the four-role hiring workflow.

## Run locally

1. Install dependencies with `npm install`.
2. Set `NEXT_PUBLIC_API_URL` in `.env.local` (defaults to
   `http://localhost:8000/api`).
3. Start the frontend with `npm run dev`.

The backend API contract is documented in `../backend/README.md`.

## Checks

- `npm run lint`
- `npm run build`

## Application routes

- Public: `/`, `/jobs/[id]`, `/login`, `/register`
- Candidate: `/candidate/applications`
- Company admin: `/company/dashboard`, `/company/jobs`,
  `/company/jobs/new`, `/company/jobs/[id]/edit`, `/company/team`,
  `/company/profile`
- Screener: `/screener/applicants`
- HR: `/hr/candidates`, `/hr/candidates/[id]`

Screener and HR pages have separate role guards and dashboard navigation.
