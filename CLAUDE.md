# CLAUDE.md — moja-tabla

Guidance for Claude Code sessions. Read `REQUIREMENTS.md` first; it is the source of truth for scope.

## Product in one line
Serbian-only local notice board where each **street** has its own board. A practical notice board, not a social network.

Current implemented features: home page (choose city and street, or add a street); street board with active posts only (important first, then newest first), a client-side single-category filter, comment counts and a responsive 3/2/1-column layout; dedicated new-post page (category, title, body, optional house number, `Označi kao važno`, `Trajanje objave`); dedicated post detail page; flat anonymous comments on the post detail page; post expiration (default 7 days). `REQUIREMENTS.md` is the source of truth for scope and must stay in sync with the code.

## Current priority
Focus on the street-board experience: creating and reading posts, navigation and usability, visual design, categories and useful local-board features, and overall product feel. Comments are a current feature, but they stay on the post detail page.

Future accounts, authentication, membership and verification work stays deferred until the product owner explicitly prioritizes it. Do not start it, and do not let it distract from the current product.

## Stack (fixed)
Node.js, Express, SQLite (via `better-sqlite3`), HTML, CSS, vanilla JavaScript.
Not allowed without asking: React, Next.js, TypeScript, Docker, microservices, ORMs, external auth providers, bundlers/build steps, CSS frameworks.

## Architecture principles
- Simplicity first. The simplest thing that satisfies the stated requirement wins.
- One Express process serving a JSON API plus static HTML/CSS/JS files. No server-side templating engine, no build step.
- Thin layers: `src/routes/api.js` (HTTP) → `src/queries.js` (plain SQL) with `src/db.js` for the connection. No service/repository abstraction until duplication actually hurts.
- Plain SQL with parameterized queries (never string-concatenate user input). Schema lives in `db/schema.sql`, applied on startup with `CREATE ... IF NOT EXISTS`. Seed data lives in `db/seed.js`.
- Product rule (expiration): `post.expires_at` is calculated by the server from an allowlisted `lifetime` (1/3/7/14/30 days or `unlimited`, default 7); the client never sends a timestamp. NULL = unlimited, and pre-feature posts stay unlimited. Expiry is enforced in the board query at read time, so expired posts never appear on the public board (any filter, important or not). They are never physically deleted and stay viewable by direct URL with `Objava je istekla`. New comments on an expired post must be blocked in BOTH the UI and the API. Do not add archive, renewal, cleanup jobs or cron without asking.
- Product rule (important): `post.is_important` is a post property, not a category. Active important posts come before active normal posts, newest first within each group. It is temporarily settable by any anonymous poster; do not imply or build authorization, roles or permissions around it without asking.
- There is no migration framework yet. `IF NOT EXISTS` only creates missing tables; it does not alter existing ones. Any change to an existing table needs a deliberate migration step, agreed first (the one existing case is the `PRAGMA table_info` check in `src/db.js` that adds `post.is_important` and `post.expires_at` to older databases).
- Model the hierarchy honestly (city → street → post with foreign keys) so Area/Building levels and visibility scope can be added later by a migration. Do NOT add those tables/columns/code now.
- Frontend: static pages, small ES-module-free vanilla JS files, `fetch` against the API. Escape all user content (use `textContent`, never `innerHTML` with user data).
- UX shape: the street board (`board.html`) is read-first and must not embed the post form or any comments. Creating a post happens on `new-post.html?street=ID`, which redirects back to the board on success. Clicking a post opens `post.html?post=ID`, where flat anonymous comments are read and added. Board comment threads or previews must never be rendered on board cards. See `REQUIREMENTS.md` section 4.
- Board layout is responsive: one column on mobile, about two on medium widths, about three on large desktops, with a restrained notice-board look on multi-column layouts. Keep the DOM in board order (important posts first, newest first within each group; the server sorts, the client filter must not reorder) so visual and keyboard order match. The richer desktop layout must never reduce mobile usability (single column, full width, no horizontal overflow).

## Future direction (do NOT implement)
Long term the product may get user accounts and trusted local membership (see `REQUIREMENTS.md` section 9). It is documented only so today's structures do not make it needlessly hard. Everything below is FUTURE / POST-MVP and not in the backlog unless the product owner explicitly says so:
accounts, authentication, street membership records, identity verification, address verification, document verification, verified-user/verified-resident badges, membership approval/rejection, resident-only content, resident-only voting, subscriptions/payments.

Architecture notes:
- Keep these concepts separate: user identity, membership in a street, identity verification, address/membership verification. Never merge them into one flag or one column.
- If a user-to-street link is ever added, model it as `User -> Membership -> Street`, not `users.street_id`. A person may legitimately belong to several streets.
- Posts and comments are anonymous today. Do not add author fields, session handling, "owner" checks, placeholder user/membership tables, verification columns, empty APIs or UI for this ahead of time.
- Do not build features that depend on knowing who the poster is (edit/delete own post, reputation, per-user limits) without asking.
- Identity documents and addresses are sensitive personal data. Prefer storing only a verification status/result, not document images. Any such work needs a separate security/privacy/legal design phase first.

## Coding conventions
- Plain JavaScript (CommonJS unless the owner decides otherwise), 2-space indent, semicolons, `const`/`let`, `async/await`.
- Code, identifiers, comments, and API field names in **English**. All user-visible text in **Serbian**.
- Keep Serbian UI strings in one place per page/area, not scattered, so wording is easy to review. Shared helpers live in `public/js/common.js`.
- Validate input on the server; return clear JSON errors with proper status codes.
- Small files, small functions, few comments (only for non-obvious "why").
- Tests: there is no test suite yet (`npm test` is still a placeholder). Add tests only for logic that matters (validation, queries) once agreed; don't build test infrastructure unprompted.

## Requirement discipline
- Implement only what `REQUIREMENTS.md` states. If it is not there, it is not in scope.
- Do not make product decisions. If something is unclear, add it to **Open Questions** in `REQUIREMENTS.md` and ask the owner.
- When the owner answers an open question, update `REQUIREMENTS.md` in the same change.
- Never silently expand scope: no extra features, fields, categories, endpoints, "nice to haves", or speculative abstractions. Mention ideas in chat instead.
- Out-of-scope list in `REQUIREMENTS.md` is binding (no likes, messaging, auth, accounts, verification, maps, moderation, notifications, etc.).

## Ask before
- Adding any dependency (each one must be justified; prefer none). Approved dependencies so far: `express`, `better-sqlite3` (keep it on v11.x: newer majors need Node 20+ or a C++ toolchain on Node 18).
- Changing the stack, folder structure, or database schema in a non-trivial way.
- Introducing a new architectural pattern, build step, or tooling.
- Anything destructive or outward-facing (deleting data, pushing, deploying).

## Running locally
- `npm install`, then `npm run seed` (creates `data/moja-tabla.sqlite` with Niš and a few example streets and posts), then `npm start` (http://localhost:3000, or set `PORT`).
- Set `DB_PATH` to use a separate database for testing so the dev data is not changed. The `data/` folder is git-ignored.

## Workflow
- Work in small milestones; propose a plan and get review before implementing a new milestone.
- Keep commits focused. Do not commit `.sqlite`/`.db` files or `.env` (already git-ignored).
- Run the app and verify the flow in practice before declaring a milestone done.
