This is a large, multi-area change set. Here's how I'll approach the 15 points, grouped for efficiency. Please confirm before I start — some items need clarification.

## Group A — Admin & Content (points 1, 4, 8, 9)
- Extend the existing `AdminArticles` panel into a full rich-text editor: title, subheading, body (with formatting/fonts/headings), tags, cover image upload + replace, inline image insertion, publish/unpublish toggle.
- Add an **AI Article Generator** tab: admin enters topics + schedule (daily cadence). A new edge function `generate-daily-article` runs on a `pg_cron` schedule, calls Lovable AI Gateway (google/gemini-2.5-flash) to draft an article from the next queued topic, and inserts it as published. New table `article_topics_queue` (topic, status, scheduled_for).

## Group B — Community & Menu (points 2, 3)
- Remove the duplicate "Success Stories" entry from the community menu, keeping "Transformations" as the single page (or vice versa — I'll keep the one already wired to `/transformations`).
- Add a ⭐ icon next to "VIP Upgrade" in the header nav for non-VIP users.

## Group C — Blog & Success Story bugs (points 5, 6)
- Fix "Back to articles" button in `Blog.tsx` (likely a broken navigate call / stale route).
- Fix Success Story / Transformations flow: uploaded photo not rendering (storage URL mismatch) and full-story modal not opening (missing click handler / route).

## Group D — Payments & Webhooks (points 7, 10, 12)
- New admin tab **Payment Test** listing all checkout URLs ($39.99 VIP JVZoo, course, etc.) with "Open in new tab" + "Simulate webhook" buttons that POST a signed test payload to `jvzoo-webhook`.
- Audit `AdminWebhookLogs` + `jvzoo-webhook` function: verify signature check, retry handling, log rendering. Fix anything broken.
- After JVZoo checkout: `ThankYou`/`ThankYouVip` already refetch subscription; I'll add a polling fallback (5s × 6) in case the webhook lands slightly after redirect, plus a toast + auto-route to `/progress`.

## Group E — Analytics (point 13)
- Add `trackLead('quiz_complete')`, `trackSignup`, `trackLogin`, `trackViewContent('vip_upgrade')`, `trackBuyNowClick('vip_yearly', 39.99)`, and a server-side `Purchase` event fired from `jvzoo-webhook` via Meta Conversions API when it grants `vip`.

## Group F — VIP video from DB (point 14)
- New table `site_settings (key text pk, value jsonb)`. Admin panel writes `vip_video_url`. `VipUpgrade.tsx` reads from DB (with localStorage cache as fallback). Removes the current localStorage-only behaviour.

## Group G — Gating validation (points 11, 15)
- Audit every `RequirePlan` usage to confirm only truly VIP-only routes are wrapped.
- Ensure `AuthContext` fires `onAuthStateChange` correctly so header CTAs flip instantly on login/logout (add a subscription refetch on `SIGNED_IN`).
- Manual E2E via Playwright: signup → quiz → login → visit every non-VIP page → confirm no redirect loop.

## Questions before I start
1. **Daily article generator**: what time of day should it run (UTC)? And do you want articles auto-published, or created as drafts for you to review?
2. **AI model**: OK to use `google/gemini-2.5-flash` on the Lovable AI Gateway (already configured, no extra key needed)?
3. **Community menu**: keep "Transformations" and delete "Success Stories" (they show the same data)?
4. **Payment test panel**: do you want it to hit the real JVZoo webhook with a test payload (recorded in logs), or just open the real checkout URLs?

Once you answer these I'll implement all 15 items in one pass.