# REQUIREMENTS — moja-tabla

Status: describes the CURRENT IMPLEMENTED state of `moja-tabla`. Approved decisions are in section 7, unresolved items in section 8, and possible near-term ideas (not approved) in section 10. Future accounts and verification are in section 9 and are not implemented.

## 1. Product vision

A Serbian-only local community notice board. Each **street** is its own small digital world where people who live there post short, practical messages: warnings about works and noise, found keys, lost pets, free items, borrowing requests, outages.

It must feel like a practical digital notice board (oglasna tabla), **not** a social network.

## Current priority

Development focuses on the street-board experience: creating and reading posts, navigation and usability, visual design, categories and useful local-board features, and the overall product feel. Accounts, verification and subscriptions (see section 9) are long-term direction only and must not distract from this.

## 2. MVP scope

1. Serbian language only (all UI text, labels, messages).
2. No map.
3. The community unit is a **street**.
4. A user can: choose a city, choose or enter a street, open that street's board, view posts, and create a post from the board via the `+ Nova objava` action (which opens a separate new-post page).
5. Post categories (fixed list):
   - Obaveštenje
   - Pomoć
   - Poklanjam / Prodajem
   - Izgubljeno / Nađeno
   - Problem u kraju
   - Događaj
6. A post contains at minimum: category, title (short headline), body, optional house/building number, created date/time.
7. Each post has a dedicated detail page, opened by clicking the post on the street board. Simple flat anonymous comments live only on that page.
8. No complex authentication, no address verification.

## 3. Explicitly out of scope (do NOT implement)

- Maps or geolocation
- Languages other than Serbian
- Accounts, login, external auth providers, identity/address/resident verification, memberships, verified badges (FUTURE / POST-MVP, see section 9)
- Subscriptions, payments (FUTURE / POST-MVP, see section 9)
- Private messaging
- Likes, followers, reactions, threaded/nested replies, editing or deleting comments, infinite-scroll feeds, or any other social-network mechanics (flat anonymous comments on the post detail page are in scope, see Flow C and FR-16 to FR-22)
- Moderation tooling
- Notifications (email/push)
- Building-level boards, area/neighborhood boards, post visibility scopes (BUILDING / STREET / AREA)
- React, Next.js, TypeScript, Docker, microservices, ORMs

Future concepts (influence architecture only, not code): City → Area → Street → Building hierarchy; visibility scope; verified residents; moderation; subscriptions; notifications. The trusted-membership direction is described in section 9.

## 4. User flows

The street board is the main product experience. It is primarily for READING notices; creating a post is a secondary action. The hierarchy is: street name → `+ Nova objava` action → existing posts, newest first.

**Flow A — Open a street board**
1. User opens the app (home page).
2. User selects a city.
3. User selects an existing street or enters a street name.
4. User lands on that street's board. The street name is shown at the top, with the `+ Nova objava` action near it, and existing posts are visible immediately, newest first.
5. The post creation form is NOT shown on the board page.

**Flow B — Create a post**
1. On a street board, user chooses `+ Nova objava`. This navigates to a dedicated new-post page for that street (`new-post.html?street=ID`).
2. The new-post page contains: category, title, body/text, optional house/building number, a submit action (`Objavi`) and a cancel/back action (`Otkaži` / `← Nazad na tablu`).
3. User submits. On success the user is redirected back to the same street board (the creation page is replaced in history, so it is not left in the back-button history). The new post appears first.
4. Cancel/back from the new-post page returns to the correct street board without creating a post.
5. If submission fails validation, the user stays on the new-post page with a Serbian error message and can correct the input.
6. If the street id is missing or unknown, the new-post page shows an error and no form.

**Flow C — Read a post and comment**
1. On a street board, user clicks a post (the card is a real link to `post.html?post=ID`).
2. The post detail page shows: a back link to the correct street board, the street name, category badge, title, full body, optional house/building number and created date/time. The post is the dominant element.
3. Below the post, a `Komentari` section lists the comments (oldest first), or `Još nema komentara.` with a short `Budi prvi koji će odgovoriti.` if there are none.
4. Below the comments, the user can write a comment (`Dodaj komentar`, `Objavi komentar`). On success the user stays on the same page and the new comment appears at the end of the list. Refreshing the page does not resubmit or duplicate the comment.
5. An empty/whitespace-only or too long comment is rejected with a Serbian error message; nothing is created.
6. If the post id is missing or unknown, the page shows `Objava nije pronađena.` and no comment form.
7. Back returns to the street board of that post. Comments are never shown on the board itself.

## 5. Functional requirements

- FR-1 Home page lets the user choose a city from a list.
- FR-2 After a city is chosen, the user can pick an existing street of that city or enter a street name (see D-3, D-4, D-7).
- FR-3 Each street has exactly one board at a stable URL.
- FR-4 The board lists the street's posts: category, title, body, house number (if any), created date/time.
- FR-5 Post ordering: newest first (D-6).
- FR-6 Post creation is on a dedicated new-post page (not on the board), with the fields above; category from the fixed list. See Flow B.
- FR-7 Server-side validation: category valid, title and body non-empty, length limits (D-8), house number optional.
- FR-8 A created post appears on that street's board only.
- FR-9 All user-visible text is Serbian. User-provided content (titles, post bodies, comments, street names, house numbers) is inserted as text, never as raw HTML.
- FR-10 Empty board shows the Serbian empty-state message `Još nema objava u ovoj ulici.` with a `Napiši prvu objavu` action that goes to the new-post page.
- FR-11 The street board does not contain a post creation form. Its primary content is the existing posts; `+ Nova objava` is the only creation entry point on the board.
- FR-12 After a successful post, the user is redirected to the same street board, and the new post is shown first (see Flow B).
- FR-13 Cancel/back from the new-post page returns to the same street board without creating anything.
- FR-14 Invalid or missing street ids are handled gracefully on both the board and new-post pages (a Serbian "Ulica nije pronađena" message, no broken form).
- FR-15 Each post on the street board is clickable: the title is a real link and the whole card acts as its target (accessible, with visible keyboard focus). The card does not look like a button.
- FR-16 Each post has a dedicated detail page at `/post.html?post=ID` showing the content listed in Flow C. The post is visually dominant.
- FR-17 Comments exist only on the post detail page. The street board shows no comments and no comment previews.
- FR-18 Comments are flat (no replies/threads) and anonymous: no author, name, avatar or account is stored. A comment has id, post, body and created date/time. Every comment displays the fixed UI label `Anonimni komšija`; this label is a constant, not stored data and not an identity.
- FR-19 Comments are listed oldest first (conversational order, D-10). Each comment shows the `Anonimni komšija` label, its text and its date/time (same `dd.mm.yyyy. u HH:mm` format as posts), as compact separate blocks that are clearly less prominent than the post.
- FR-20 Comment creation: body required, trimmed, whitespace-only rejected, max 1000 characters; validated on the server (D-10). Success keeps the user on the post page and shows the new comment immediately.
- FR-21 Comments cannot be edited, deleted, replied to or reacted to.
- FR-22 Invalid/missing post ids and invalid comment bodies produce clear Serbian messages; user-provided text (posts and comments) is rendered without raw HTML insertion and keeps line breaks. Long unbroken text wraps and never causes horizontal scrolling.
- FR-23 The street board layout is responsive: 1 column on mobile, about 2 columns on medium widths, about 3 columns on large desktops. Cards keep their natural heights. DOM, Tab and visual order are the same and are newest first.
- FR-24 On multi-column layouts the board cards use a restrained notice-board look: warm paper-like surfaces, light borders and shadow, a small pin detail, and a tilt of at most about 0.5 degrees. Cards have no tilt on mobile. The category badge remains the primary category indicator. This is visual only and must not change behaviour or content.
- FR-25 The street board page and the post detail page are mobile-first. The desktop layouts may be richer, but mobile must stay single-column, full-width, without horizontal overflow, and with comfortably tappable controls.

## 6. Simple data model (conceptual)

- **city**: id, name
- **street**: id, city_id → city, name, normalized_name
- **post**: id, street_id → street, category, title, body, house_number (nullable), created_at
- **comment**: id, post_id → post, body, created_at (no author; flat, no parent comment)

Notes for evolvability (no extra tables/columns now): streets belong to a city via `city_id`; a future `area` level could sit between city and street; a future visibility scope would be one added column on `post`. `street` also has `normalized_name` with `UNIQUE(city_id, normalized_name)` (D-7). Categories are a fixed list of codes (D-9) enforced by the app and a CHECK constraint. The current model has no users or memberships; see section 9 for the intended future shape (do not add it now).

## 7. Decisions and assumptions

Decided by the product owner (D-1 to D-9, Milestone 1 review), and by the development side where the owner asked for a sensible value (D-10):

- D-1 Canonical project name: `moja-tabla`.
- D-2 SQLite driver: `better-sqlite3` (v11.x, which ships prebuilt binaries for Node 18). Node 18 compatibility is kept for now.
- D-3 Only one city is seeded for the MVP: `Niš`. Cities are not user-created.
- D-4 Users may create a street if it does not already exist in the city.
- D-5 Posting is anonymous; no author identity stored.
- D-6 Posts are shown newest first. No edit or delete.
- D-7 Street normalization: trim, collapse consecutive whitespace to one space, compare case-insensitively; the original display name is preserved. `street.normalized_name` with `UNIQUE(city_id, normalized_name)`. No Latin/Cyrillic transliteration: the Latin and Cyrillic spelling of a street are different streets for now. Both scripts are accepted in all user content.
- D-8 Validation: title required, max 120 chars; body required, max 1500 chars; house/building number optional, plain text, max 20 chars, no numeric-only rule (`14a`, `14/2`, `bb` are valid).
- D-9 Internal category codes: `obavestenje`, `pomoc`, `poklanjam_prodajem`, `izgubljeno_nadjeno`, `problem_u_kraju`, `dogadjaj`. Serbian labels are handled by the UI.
- D-10 Comments (flat, anonymous): maximum 1000 characters (chosen by the development side as a sensible bound, shorter than the 1500-character post body); body trimmed and required; listed oldest first; no edit, delete, reply, reaction or moderation; no pagination yet.

Remaining assumptions (not stated by the owner):

- A-1 Street name max length is 100 characters (needed a bound; not specified).
- A-2 Single server process, single SQLite file, local/dev deployment first.
- A-3 No pagination until post volume demands it.
- A-4 Dates are stored in UTC (SQLite `datetime('now')`) and displayed in Europe/Belgrade time.

## 8. Open questions

- OQ-1 Spam/abuse protection with no auth (rate limiting, captcha, none for now)?
- OQ-2 Do posts expire or get archived (e.g. "radovi sutra" is stale next week)? No expiry assumed.
- OQ-3 Event posts (Događaj): is a separate event date/time field wanted, or is it just in the body text?
- OQ-4 Should Latin and Cyrillic spellings of the same street ever be unified (transliteration)? Deferred by D-7.
- OQ-5 Is there an official street dataset for Niš to import, or does the list grow from user entries and seed data only?
- OQ-6 Hosting/deployment target and the Node version to run in production.
- OQ-7 Date/time display: posts and comments currently show `dd.mm.yyyy. u HH:mm` in Europe/Belgrade time. Should relative forms such as "danas" or "juče" be used for recent items? (Not decided; see section 10.)
- OQ-8 (future) See section 9.6 for the open questions about accounts, membership and verification. They are not part of the current backlog.

## 9. Future direction: trusted local membership (FUTURE / POST-MVP)

Status: direction only. Nothing in this section is designed in detail, scheduled or part of the implementation backlog. It changes only if the product owner explicitly changes priority.

### 9.1 Concepts (kept separate)

1. **User identity**: who the account is.
2. **Membership** in a street/community: the relationship between a user and a street.
3. **Identity verification**: the platform has confirmed the account belongs to a real person.
4. **Address / membership verification**: the platform has confirmed the person has a legitimate relationship with a particular street/address/community.

Identity verification and address/membership verification are different trust levels and must never be treated as the same thing.

The label `Anonimni komšija` that appears on every comment today is only a fixed UI string. It is not an account, not an identity, and it must not be confused with any future verified-user or verified-resident indicator.

### 9.2 User account (future)

A user may eventually have: display name, email and/or phone, authentication credentials, account status. The authentication design is not decided.

### 9.3 Street membership (future)

The future model must NOT be simply `User -> street_id`. Conceptually it is `User -> Membership -> Street`, because one person may legitimately relate to several communities (current residence, another owned apartment/property, family property, business premises). The exact rules are not decided. Membership states such as pending / verified / rejected may exist eventually; no enum or state machine is defined now.

### 9.4 Verification (future)

- Possible public indicators, conceptually: `Potvrđen korisnik` (identity) and `Potvrđen stanar` (address/membership). Exact UI wording is not decided.
- A public representation may show limited information only, for example `Verifikovani stanar · broj 24`, without exposing unnecessary private identity information. Exact privacy rules are not decided.
- Verification exists to improve trust and quality in local communities, not to expose private personal information.
- Identity documents and address data are sensitive personal data. Do not assume `moja-tabla` permanently stores images of identity documents; prefer storing only a verification status/result and not retaining document images where possible. Provider, legal process, accepted documents, storage model and workflow are all undecided and require a separate security/privacy/legal design phase before any implementation.

### 9.5 Everything below is FUTURE / POST-MVP (not in the backlog)

- user accounts
- authentication
- street membership records
- identity verification
- address verification
- document verification
- verified-user badges
- verified-resident badges
- membership approval/rejection
- private resident-only content
- voting restricted to verified residents
- subscriptions/payments

### 9.6 Open questions (future, not blocking anything)

- Which authentication method(s): email, phone, both?
- Can one user hold memberships in multiple streets, and under which rules?
- Which membership states exist and who/what decides them?
- Which verification provider and legal/privacy process; which documents; where is any data stored?
- What exactly is shown publicly next to a verified user?
- What happens to existing anonymous posts and comments when accounts are introduced?

## 10. Possible near-term enhancements (NOT approved)

These are ideas only. None is a requirement, and none is in the current backlog. Each needs an explicit product decision and an entry in sections 4 to 7 before anyone implements it.

- Showing a comment count on board cards.
- Category filtering on the street board.
- Important or pinned notices.
- Relative time presentation, such as "danas" and "juče" (see OQ-7).
