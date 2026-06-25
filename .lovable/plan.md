
# Ketopia — Improvements + Video Course Plan

## 1. Where the course should live

A new top-level **`/course`** route (and `/course/:moduleSlug/:lessonSlug`) — separate from `/recipes`, `/guide`, and `/challenges` so it can be marketed as its own JVZoo product without diluting existing pages.

Navigation entry: add **"Course"** link in `Header.tsx` (visible only to users whose subscription unlocks it). Public marketing/sales page lives at **`/course-sales`** (hidden header/footer, per the funnel rule in core memory) and points to a new JVZoo buy link.

### Course data model (new tables)
```text
course_modules        id, slug, title, description, sort_order, cover_url
course_lessons        id, module_id, slug, title, video_url, duration_sec,
                      description, resources_jsonb, sort_order, is_preview
course_progress       user_id, lesson_id, completed_at, watched_seconds
course_access         user_id, granted_at, source ('jvzoo'|'admin'|'vip'),
                      jvzoo_order_id
```
Access rule: a user can read lessons only if they exist in `course_access` OR have `plan_type IN ('vip','vip_lifetime')`. Admin CRUD via new **AdminCourse** tab inside `Admin.tsx`. JVZoo webhook (`jvzoo-webhook`) gets a new `PRODUCT_PLAN_MAP` entry → on `SALE` for the course product ID, insert into `course_access` (idempotent via existing `jvzoo_webhook_logs` check). Video hosting: store Vimeo/YouTube/Mux URLs in `video_url` (no file uploads).

---

## 2. Conversion & sales funnel fixes

- **Pricing page**: replace the raw JVZoo `<img>` button with a real styled CTA button (current image button breaks design system and looks like an ad). Keep the JVZoo affiliate pixel.
- **ThankYou page**: the VIP-upsell "No Thanks" link points to `https://www.jvzoo.com/nothanks/423665` — that URL only works inside JVZoo's funnel. Replace with an internal `/dashboard` route so users aren't dumped on a JVZoo error page.
- **Funnel analytics**: `funnel_events` table exists but isn't wired everywhere. Add tracking for: pricing CTA click, thank-you arrival, VIP upsell click, VIP decline, course CTA click. Surface a funnel chart in admin.
- **Abandoned-checkout email**: hook into `funnel_events` + Resend to email anyone who hit pricing but didn't reach ThankYou within 24h.

## 3. Retention & engagement

- **Welcome flow**: after first sign-in, route survey completers straight to a 3-step "set your first goal → log first meal → join community" checklist (component already partially exists in `WelcomeProgressModal`; finish it).
- **Daily streak push**: use `push_tokens` + a scheduled edge function to send a notification at the user's preferred reminder time if they haven't logged a meal that day.
- **Weekly progress email**: every Sunday send `WeeklyReport` data as an email via Resend.
- **Notifications bell**: `NotificationBell.tsx` doesn't realtime-subscribe — switch to a Supabase realtime channel on `notifications`.

## 4. Data reading — Progress & Profile

Audit findings to implement:
- **Progress page**: several charts (`WeightTrendChart`, `ExpenditureChart`, `NutritionAnalytics`) fetch with default Supabase limit of 1000 rows but never paginate. For users >1 yr old this silently drops data. Add date-range filter + explicit `.order('logged_at').limit()` per range.
- **Profile page**: today it reads `profiles` then separately reads `user_subscriptions`, `user_progress`, `user_badges`, `weight_logs` — four serial round-trips. Combine into one parallel `Promise.all` and cache via React Query.
- **Subscription status**: `useSubscription` hook re-fetches on every mount. Move to a single React Query key with a 60s stale time so Header/Progress/Profile share one request.
- **Empty states**: Progress charts render blank when there's no data — add "Log your first weight" CTAs.
- **Timezone bug**: macro/weight logs use `new Date().toISOString().slice(0,10)` (UTC) — users west of UTC see logs land on the wrong day. Switch to local-date helper.

## 5. Security & data integrity

- **RLS audit** via `supabase--linter` for all 60 tables; priorities to verify:
  - `jvzoo_webhook_logs` — should be admin-read only (currently 1 policy, confirm it's not `USING (true)`).
  - `funnel_events`, `push_tokens` — must be user-scoped.
  - `profiles` — confirm `email` column isn't readable by other users (core memory says never show emails in UI).
- **Webhook hardening**: add rate limiting (max 30 req/min per IP) to `jvzoo-webhook` to blunt signature-guessing brute force.
- **Admin gating**: `Admin.tsx` checks `is_admin` client-side; double-check every admin RPC also enforces `has_role(auth.uid(),'admin')` server-side.
- **Reconcile pending JVZoo purchases**: `grant_ketopia_subscription` returns `pending` when the buyer hasn't signed up. Add a trigger on `auth.users` insert that scans `jvzoo_webhook_logs` for matching email and grants retroactively.

## 6. Performance & SEO

- **Code-split heavy routes**: `Admin`, `Progress`, `Marketplace`, and the new `Course` route should be `React.lazy()` — currently the initial bundle pulls all admin components for every visitor.
- **Image optimization**: hero + transformation images served as full-size JPG/PNG. Convert to WebP + add `loading="lazy"` and `width`/`height` to stop CLS.
- **Per-route meta tags**: only `index.html` has SEO tags. Add `react-helmet-async` and per-page `<title>`, meta description, canonical, and JSON-LD (`Product` schema on Pricing, `Course` schema on `/course-sales`, `Recipe` schema on recipe detail pages).
- **Sitemap**: `public/sitemap.xml` is static and missing `/course`, `/course-sales`, recipe detail, and article URLs. Generate it at build time from Supabase data.

---

## Suggested build order (each step shippable on its own)
1. Course tables + admin CRUD + `/course` viewer + JVZoo product mapping.
2. Course sales page + JVZoo button + funnel-event tracking.
3. Pricing/ThankYou CTA fixes + funnel chart in admin.
4. Profile/Progress data-reading refactor + timezone fix + empty states.
5. Retention: realtime notifications, weekly email, streak push.
6. SEO: react-helmet per route, dynamic sitemap, image optimization, lazy routes.
7. Security pass: RLS lint fixes, webhook rate-limit, pending-purchase reconciliation trigger.

Tell me which step (or set of steps) to start with and I'll switch to build mode.
