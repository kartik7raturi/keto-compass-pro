# Meta Pixel & Funnel Tracking — Testing Checklist

Pixel ID: **1759880568532895**

## What's instrumented

### Meta Pixel events
| Event | Where it fires | Type |
|---|---|---|
| `PageView` | Every route change (via `AnalyticsTracker`) | Standard |
| `ViewContent` | `/pricing` and `/vip-upgrade` mount | Standard |
| `AddToCart` | `/pricing` and `/vip-upgrade` mount | Standard |
| `Lead` | Onboarding signup success, pricing-section CTA click | Standard |
| `CompleteRegistration` | Email signup via `AuthContext.signUp` | Standard |
| `Login` | Email sign-in via `AuthContext.signIn` | Custom |
| `InitiateCheckout` + `BuyNowClick` | JVZoo buy buttons on `/pricing` and `/vip-upgrade` | Standard + Custom |
| `Purchase` | `/thank-you` and `/thank-you-vip` mount | Standard |

### Funnel + UTM (Supabase `funnel_events` table)
- Every Pixel event also writes a row to `funnel_events` with `session_id`, `user_id` (if logged in), `page`, and `metadata` containing `utm_first_touch`, `utm_last_touch`, `referrer`, and `user_agent`.
- UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) are captured from the URL on landing:
  - **First-touch** persisted in `localStorage` (`ketopia_utm_attribution`) — never overwritten.
  - **Last-touch** persisted in `sessionStorage` — refreshed on any new UTM landing.

### Attribution query examples
```sql
-- Signups by first-touch campaign in the last 30 days
select metadata->'utm_first_touch'->>'utm_campaign' as campaign, count(*)
from public.funnel_events
where event_name = 'signup' and created_at > now() - interval '30 days'
group by 1 order by 2 desc;

-- Full funnel by landing page
select metadata->'utm_first_touch'->>'landing_page' as landing,
       count(*) filter (where event_name = 'page_view') as views,
       count(*) filter (where event_name = 'lead') as leads,
       count(*) filter (where event_name = 'signup') as signups,
       count(*) filter (where event_name = 'buy_now_click') as buy_clicks,
       count(*) filter (where event_name = 'purchase') as purchases
from public.funnel_events
where created_at > now() - interval '30 days'
group by 1 order by views desc;
```

---

## Testing Checklist — Meta Events Manager

Use **Events Manager → Test Events** at https://business.facebook.com/events_manager2. Get your test code from the "Test Events" tab.

### 1. Browser DevTools setup
1. Install the **Meta Pixel Helper** Chrome extension.
2. Open the site, open DevTools → **Network** tab, filter by `facebook.com/tr`.
3. Every fired event will appear as a request to `https://www.facebook.com/tr/?…`. The `ev=` param is the event name.

### 2. Page-by-page verification
| Page | Action | Expect (Pixel Helper + `/tr?ev=…`) |
|---|---|---|
| `/` | Load | `PageView` |
| `/pricing` | Load | `PageView`, `ViewContent`, `AddToCart` |
| `/pricing` | Click "Get Keto Starter Plan" JVZoo button | `InitiateCheckout`, `BuyNowClick` (custom) |
| `/vip-upgrade` | Load | `PageView`, `ViewContent`, `AddToCart` |
| `/vip-upgrade` | Click "Get 12-Month VIP" | `InitiateCheckout`, `BuyNowClick` |
| `/onboarding` → signup | Complete last step | `CompleteRegistration`, `Lead` |
| `/auth` → sign in | Submit valid credentials | `Login` (custom) |
| `/thank-you?plan=basic` | Load | `PageView`, `Purchase` (value 19 USD) |
| `/thank-you-vip` | Load | `PageView`, `Purchase` (value 47 USD) |

### 3. UTM smoke test
1. Visit `/?utm_source=fb&utm_medium=cpc&utm_campaign=launch_test` in a fresh Incognito window.
2. In DevTools console:
   ```js
   JSON.parse(localStorage.getItem('ketopia_utm_attribution'))
   ```
   Should show `utm_source: "fb"`, `utm_campaign: "launch_test"`, `landing_page`, `first_seen_at`.
3. Navigate to `/pricing` → still the same first-touch record.
4. Reload with `/?utm_source=google` → `localStorage` first-touch unchanged; `sessionStorage` last-touch is now `google`.

### 4. Funnel row verification (Supabase)
Run in the SQL editor after triggering events:
```sql
select event_name, page, session_id, created_at,
       metadata->'utm_first_touch'->>'utm_source' as first_src
from public.funnel_events
order by created_at desc
limit 20;
```

### 5. Events Manager sanity
- **Test Events** tab should show each event within ~30 seconds.
- **Overview** tab: `PageView` volume matches sessions; conversion events (`Purchase`, `Lead`, `CompleteRegistration`) should trend with real activity within 20 minutes.
- **Diagnostics** tab: no "Invalid Parameter" or "Missing Purchase Value" warnings.

### 6. Common pitfalls
- Ad-blockers (uBlock, Brave shields) block `fbevents.js` → open in a clean Chrome profile.
- SPA route changes: verify DevTools shows a new `/tr?ev=PageView` request on every `<Link>` navigation (not just hard reloads).
- `Purchase` fires client-side on `/thank-you*` pages — if the redirect from JVZoo doesn't land back on our thank-you page, no `Purchase` event fires. Confirm the JVZoo "Thank you URL" is `https://<your-domain>/thank-you?plan=basic` (and `/thank-you-vip` for VIP).
