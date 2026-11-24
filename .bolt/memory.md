# Project memory

## Product intent & audience

- Project: **eandaaz bayan** — a modern, responsive public poetry website built with Vite + React.
- Publish and share poetry in three scripts/languages: **Urdu**, **Roman Urdu**, and **English**.
- Includes **user accounts** and an **admin dashboard**.
- Audiences: public readers, contributing poets, and site operators (admins).

## Brand personality & voice

- Multilingual-first: content and UI must gracefully support Urdu script, Roman Urdu transliteration, and English.
- Modern literary tone expected (poetry focus), but no specific copy guidelines confirmed yet.

## Visual design & UX direction

- Top navigation includes a conditional **Admin** button visible only to admin-role accounts.
- Site is responsive and intended for production-quality polish (per global instructions in `.bolt/prompt`).
- UI uses Tailwind CSS, React hooks, and Lucide React icons (explicit in `.bolt/prompt`, not restated here).

## Decisions, constraints & rationale

- **Admin promotion workflow:** grant admin by promoting a registered account's email to admin role; no password needed.
- Admin role changes take effect on next sign-in or page refresh.
- Account system tracks registered user count (currently zero as of last check).
- Build is currently clean and the full site is deployed.

## Open questions & assumptions

- No users registered yet; user must register first before admin access can be granted.
- Exact email of the requester still unknown — waiting for them to provide the registered email.
- Assumption: admin role is stored per-account and evaluated on auth/refresh; persistence mechanism not yet confirmed.