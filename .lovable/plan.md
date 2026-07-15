
This request is large — splitting into 9 focused workstreams. I'll execute in order; each stage is independently shippable so you can pause/redirect.

## 1. RLS audit & fixes — `course_*` + `funnel_events`
- Run `supabase--linter` and inspect existing policies on `course_modules`, `course_lessons`, `course_access`, `course_progress`, `funnel_events`.
- Confirm:
  - Public can read only `is_published = true` modules/lessons (already in place per migrations — verify).
  - `course_progress` is strictly `auth.uid() = user_id` for SELECT/INSERT/UPDATE/DELETE.
  - `course_access` users see only their own row; admins manage all; service_role writes via `grant_course_access` (SECURITY DEFINER) so webhook still works.
  - `funnel_events` allows anon/auth INSERT (so funnel tracking works pre-login) but SELECT restricted to admins only.
- Migration patches any gap.

## 2. Per-route SEO meta
- Install `react-helmet-async`, wrap `<App>` in `HelmetProvider` (in `src/main.tsx`).
- Add `<Helmet>` blocks to:
  - `/course` (Course.tsx) — "Keto Course — Video Lessons | Ketopia"
  - `/course-sales` (CourseSales.tsx) — sales-focused title + OG image
  - `/course/:moduleSlug/:lessonSlug` (CourseLesson.tsx) — dynamic per-lesson title/description/OG using fetched lesson data.
- Remove duplicate canonical from `index.html` (sitewide og:* stays as fallback).

## 3. Admin Course Manager tab
- New component `src/components/admin/AdminCourse.tsx`:
  - List/create/edit/delete `course_modules` (title, description, slug, cover_url, sort_order, is_published).
  - For each module: nested lessons table with create/edit/delete (title, slug, video_url, duration_sec, sort_order, is_preview, is_published, resources JSON).
  - Video field is a URL input (YouTube/Vimeo/mp4) — no upload.
- Wire into `Admin.tsx` as new tab "Course".

## 4. Lazy-load main routes
- Convert these to `React.lazy` + `<Suspense>` in `App.tsx`:
  `Course`, `CourseLesson`, `CourseSales`, `Pricing`, `Admin`, `Progress`, `Marketplace`, `Recipes`, `Tracker`, `Profile`, `Blog`, `Community`-wrapped routes.
- Add a lightweight loading fallback (existing spinner pattern).

## 5. Realtime leaderboard — top 5 per challenge, monthly
- Refactor `ChallengeLeaderboard.tsx`:
  - Group by `challenge_id` instead of overall when category given.
  - Limit to top 5 per challenge.
  - Default timeframe to monthly; keep weekly toggle.
  - Realtime subscription already exists — verify it covers `challenge_daily_logs` too.
- Surface on `/challenges` more prominently.

## 6. Transformations / journey share section
- New page `/transformations` using existing `success_stories` table (already has 12 cols, RLS).
- Components: submission form (title, before/after photos via `community-media` bucket, story, tips), feed of approved stories, like button (reuse `community_likes` pattern).
- Add nav link under "Community" group.

## 7. Slim menu — 3–4 top categories + submenus
Restructure `Header.tsx` into:
- **Track** → Tracker, Progress, Challenges, Leaderboard
- **Eat** → Recipes, Weekly Plan, Quick Meals, Custom Plan
- **Learn** → Course, Guide, Blog, FAQ, Stories
- **Community** → Community, Transformations, Marketplace, Messages
Plus right-side: Pricing, Profile/Auth.
Use shadcn `NavigationMenu` with dropdowns; mobile uses existing Sheet.

## 8. Sitemap + robots
- Convert `public/sitemap.xml` to a generator script `scripts/generate-sitemap.ts` that includes static routes + dynamically pulls published `course_modules`/`course_lessons`/`blog` slugs at build time via Supabase REST.
- Add `predev`/`prebuild` hooks.
- Add new routes (`/course`, `/course-sales`, `/transformations`).
- Add `Sitemap: https://keto-compass-pro.lovable.app/sitemap.xml` (already present).

## 9. Light cleanup pass
- Progress bar (`src/components/ui/progress.tsx`): already uses gradient + shadow — leave; verify usage in `ProgressDashboard` shows correct values, fix any `value > 100` overflow with `Math.min(100, value)` clamp at call sites that look off.
- Remove low-value sections I notice while editing (e.g. duplicate testimonials on Index, stale advertisement slots on gated pages) — minimal, listed in final summary.
- Keep all business logic intact.

## Technical notes
- All migrations follow GRANT → ENABLE RLS → POLICY order.
- Lazy routes wrapped in single `<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>}>`.
- Helmet provider added once in `main.tsx`; per-page Helmet replaces sitewide og:title/og:description for JS crawlers, static stays as social-crawler fallback.

## Build order
1. RLS migration (needs your approval first) →
2. Helmet + SEO meta →
3. Lazy routes →
4. Header restructure →
5. Admin course tab →
6. Leaderboard refactor →
7. Transformations page (may need second migration for likes on success_stories if missing) →
8. Sitemap generator →
9. Cleanup + progress audit.

Approve and I'll start with the RLS migration.
