<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# WedPlan Client — Agent Notes

Plan first, code second. Keep this file updated with every task plan + decision so future agents can pick up context.

## Project facts (verified, do not re-discover)

- Next.js **16.4.6** App Router with `cacheComponents`, `partialPrefetching`, and `reactCompiler` enabled. Docs live in `node_modules/next/dist/docs/` — read them before using any Next API.
- React 19.3, Tailwind CSS v4 (CSS-first config in `src/app/globals.css`), TypeScript.
- UI kit: shadcn **"base-nova"** style built on `@base-ui/react` (NOT Radix). There is **no `asChild`** — use the Base UI `render={<Component />}` prop instead (e.g. `<DropdownMenuTrigger render={<Button variant="ghost" />}>`).
- `cn` is imported from the `"cn"` package (also re-exported at `@/lib/utils`) — match the existing import style in `src/components/ui/*`.
- `lucide-react` here has **no brand icons** (no Facebook/Instagram/Twitter/Youtube) — use inline SVGs for social icons.
- No auth/backend package is installed yet (no firebase / next-auth). Auth is a client-side Context placeholder until the backend step.

## Task: Layout & Page Structure — Navbar + Footer

**Requirements (assignment spec):**

1. **Navbar** — Logo/Name: WedPlan.
   - Public routes: Home, Browse Services, Sign In, Sign Up.
   - Authenticated routes: Home, Browse Services, User Profile Dropdown.
   - Profile Dropdown: user name + profile image, Dashboard, Profile Settings, Logout.
   - Navbar content must update **immediately** after auth state changes (React state via Context, not server-only session).
2. **Footer** — must contain: Logo + short description, important navigation links, contact information, social media links, copyright information.

**Plan (what was done):**

- [x] `src/config/site.ts` — single source of truth for app name, tagline, nav links, auth/profile routes, contact info, social URLs.
- [x] `src/components/providers/auth-provider.tsx` — client `AuthProvider` + `useAuth()` hook (`user`, `signIn`, `signUp`, `signOut`). Placeholder state for now; swap internals only (firebase/API) when real auth lands — navbar needs no changes.
- [x] `src/components/layout/logo.tsx` — shared logo (heart mark + "WedPlan") reused by navbar, footer, mobile menu.
- [x] `src/components/layout/navbar.tsx` — client component: sticky header; desktop links (Home, Browse Services) with active state; sign-in/sign-up buttons when logged out; avatar + name dropdown (Dashboard, Profile Settings, Logout) when logged in; mobile hamburger opens a `Sheet` menu with the same content.
- [x] `src/components/layout/footer.tsx` — server component: brand + description + socials, navigation links, contact info, copyright bar.
- [x] `src/app/layout.tsx` — renders `AuthProvider > Navbar > <main class="flex-1"> > Footer`; metadata title/description; Geist sans wired to `--font-sans` (globals.css maps `font-sans` to it).
- [x] Route scaffolds as placeholder pages: `/` (home, replaced starter template), `/services`, `/signin`, `/signup`, `/dashboard`, `/profile`, sharing one `PagePlaceholder` component.

**Route map used everywhere (keep consistent in later tasks):**

| Label | Path | Access |
| --- | --- | --- |
| Home | `/` | public |
| Browse Services | `/services` | public |
| Sign In | `/signin` | public |
| Sign Up | `/signup` | public |
| Dashboard | `/dashboard` | authenticated |
| Profile Settings | `/profile` | authenticated |

**Decisions:**

- Navbar is one client component shown on all routes; it reacts to auth context — no route-group layouts needed yet.
- Brand color: `--primary` switched to rose (WedPlan brand) in `globals.css`; rest of the shadcn theme untouched.
- Dropdown items navigate via `router.push` inside `DropdownMenuItem` click handlers (Base UI items already close on click); the destructive "Logout" item calls `signOut()` then redirects to `/`.
- **Copyright year**: `new Date()` is a blocked value in prerendered render passes under `cacheComponents` (server AND client components), and the react-hooks `set-state-in-effect` rule rejects the usual effect-based fix. Solution: `src/components/layout/copyright-year.tsx` uses `useSyncExternalStore` with a deterministic server snapshot (`null`) and a client snapshot; a 60s re-check handles Dec 31 → Jan 1 rollover. Reuse this pattern for any other "current time" UI.
- **Pre-existing lint errors (not ours, leave alone unless tasked)**: `src/components/ui/carousel.tsx` and `src/hooks/use-mobile.ts` fail `react-hooks/set-state-in-effect` — they shipped broken with the shadcn/create-next-app scaffold. Our code passes lint clean.
- Fixed scaffold bug: `@theme inline { --font-sans: var(--font-sans) }` was self-referential (undefined var); now points at `var(--font-geist-sans)` set by the root layout.
**Next steps (future tasks):** real auth integration (replace `auth-provider.tsx` internals), protect `/dashboard` + `/profile`, feature pages (services listing/detail, add service, auth forms).

## Task: Environment variables + backend connection

**Backend:** `../wedplan-server` (Express 5 + MongoDB Atlas, port 5000, CommonJS). Only `/`, `/health`, `/test-db` exist today — auth routes are still to be built server-side. Installed server deps to be aware of: `jsonwebtoken`, `better-auth`, `stripe`, `mongodb`.

**Env decision (client .env):**

- The variables that were sitting in `wedplan-client/.env` (`PORT`, `DB_USER`, `DB_PASSWORD`, `DB_URI`, `DB_NAME`) are **server secrets** — they already live in `wedplan-server/.env` and must never be inlined into the browser bundle. The client `.env` was rewritten to contain only:
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000` — the only client variable needed for the connection. Change the value for deployment (e.g. deployed server URL); the name stays the same.
- No other env variable is required by the client right now. If the server later needs a secret, it goes in `wedplan-server/.env` (e.g. future `JWT_SECRET` — the server already ships `jsonwebtoken`).

**What was built (client):**

- `src/lib/api-client.ts` — `apiRequest<T>()` wrapper around `fetch`: base URL from `NEXT_PUBLIC_API_BASE_URL` (fallback `http://localhost:5000`), auto JSON, auto `Authorization: Bearer <token>` from the session store, `ApiError` with `status` (`0` = server unreachable) and server-provided `message` extraction.
- `src/lib/auth-session.ts` — localStorage-backed session store (`wedplan.auth` key) consumed via `useSyncExternalStore` (SSR-safe: server snapshot always `null`; cross-tab sync via `storage` event). Exports `writeSession`, `getSessionSnapshot`, `getSessionToken`, `subscribeToSession`.
- `src/components/providers/auth-provider.tsx` — `AuthProvider`/`useAuth()` now hits the real API: `signIn` → `POST /api/auth/login`, `signUp` → `POST /api/auth/register` (falls back to auto-login when the register response has no token), `signOut()` → clears session instantly. Response shape expected: `{ success, message?, token, user: { id | _id, name, email, avatarUrl? } }` — both `_id` and `id` are accepted.

**Backend contract to implement server-side** (`wedplan-server`):

- `POST /api/auth/register` `{ name, email, password }` → `{ success: true, token, user: { _id, name, email } }` (token optional — client auto-logs in without it)
- `POST /api/auth/login` `{ email, password }` → `{ success: true, token, user: { _id, name, email } }`
- Errors: non-2xx status + `{ message: "..." }` (client displays `message` directly)
- Authenticated requests send `Authorization: Bearer <jwt>`

**Verified live:** started the backend (`node index.js`) — `MongoDB Connected Successfully!`, `/health` → `200 {"success":true,...}`, `POST /api/auth/login` → `404` (client reaches the server; only the auth routes are missing server-side).

**Security note:** `.env*` is gitignored in both projects. The Atlas credentials were shared in plain text during this session — rotate the DB password in Atlas when convenient.

## Task: Module 01 — Foundation, Routing, Navigation & Dashboard Shells

Most of Module 01 was already covered by the two tasks above (root layout, Navbar, Footer, auth context, route scaffolds, rose `--primary`). This task completed the remaining pieces: dashboard shells, dashboard sub-routes, and the full wedding design direction.

**What was added:**

- `src/components/layout/dashboard-sidebar.tsx` — client component rendered once inside `app/dashboard/layout.tsx`. Outputs two fragments from one grid cell: a horizontal scrollable pill `nav` (`lg:hidden`) for small screens and a sticky `aside` (`hidden lg:flex`) for desktop. Nav sections: **Planning** (Overview `/dashboard` exact-match, Budget, Checklist, Bookings — prefix match) and **Account** (Profile Settings, Browse Services). Shows the signed-in user's avatar/name/email card at the bottom via `useAuth()` when logged in.
- `src/app/dashboard/layout.tsx` — dashboard shell: `grid lg:grid-cols-[240px_1fr]`, `LayoutProps<"/dashboard">` (documented pattern in `node_modules/next/dist/docs/.../layout.md`). Every `/dashboard/*` page gets the shell automatically — feature modules only replace the `page.tsx`.
- `src/app/dashboard/page.tsx` — overview placeholder: heading + CTA to `/services` + three "Coming soon" shell cards (Budget/Checklist/Bookings) that later modules replace with real widgets.
- `src/app/dashboard/{budget,checklist,bookings}/page.tsx` — `PagePlaceholder` scaffold pages.
- `src/config/site.ts` — added `routes.budget`, `routes.checklist`, `routes.bookings` (all real links live in the sidebar only; navbar/footer route map unchanged).

**Design direction applied (globals.css + layout.tsx):**

- **Typography:** Playfair Display (serif) added via `next/font/google` as `--font-playfair`; `@theme inline` maps `--font-heading: var(--font-playfair)` so every `font-heading` utility (page h1s, logo wordmark, sheet title, card titles) renders elegant serif. Body stays Geist.
- **Palette (light):** `--foreground` dark warm charcoal `oklch(0.245 0.012 60)`; `--secondary` warm ivory `oklch(0.963 0.018 85)`; `--accent` soft gold `oklch(0.905 0.055 85)` (gold-tinted dark accent-foreground); `--muted`/`--border`/`--input` warm neutrals (hue 84–85); `--ring` rose `oklch(0.6 0.09 17.938)`. Dark mode mirrors the ivory/gold hues. `--primary` rose unchanged.
- No extra colors/gradients — gold appears only through the `--accent` token (icon chips on cards, etc.).

**Verified:** `npm run lint` — only the 2 pre-existing scaffold errors (carousel/use-mobile); our code clean. `npm run build` — all 12 routes prerender statically under `cacheComponents`. `next start` smoke test: `/`, `/dashboard`, `/dashboard/budget|checklist|bookings`, `/services`, `/signin`, `/signup`, `/profile` → all 200; SSR HTML confirmed sidebar/pills/cards/fonts.

**Decisions:**

- Hand-rolled sidebar instead of shadcn `components/ui/sidebar.tsx` — keeps style consistent with the hand-rolled navbar/footer and avoids extra provider weight for a simple 6-link nav.
- Mobile nav = horizontal pill bar (not a second Sheet) — one component, no duplicate state, works in the same grid cell.
- No route protection yet — `/dashboard/*` is public until the auth-protection task (AGENTS "Next steps").
- Route map extension (keep consistent in later tasks): Budget `/dashboard/budget`, Checklist `/dashboard/checklist`, Bookings `/dashboard/bookings`.

**Next steps (future tasks):** real auth integration, protect `/dashboard/*` + `/profile`, feature pages (services listing/detail, add service, auth forms), replace dashboard "Coming soon" cards with real widgets.

## Task: Module — Sign Up page + brand rebrand (green/gold/ivory, WP monogram)

User provided the WedPlan brand logo (WP monogram: deep-green serif W + gold serif P, gold/green leaf sprout, green swash on ivory). Everything rebranded to match; Sign Up module built.

**Rebrand (all token-level, no hardcoded colors in components):**

- `globals.css`: `--primary` → deep green `oklch(0.43 0.065 158)` (dark: `0.72 0.09 155` with dark primary-foreground); NEW token `--gold` `oklch(0.73 0.105 85)` (dark `0.8 0.105 88`) mapped via `--color-gold` in `@theme inline` → `text-gold`/`bg-gold` utilities; `--ring` → green; `--sidebar-primary` → green (was blue in dark); ivory `--secondary`/gold `--accent` from Module 01 kept — they already match the logo's palette.
- `components/layout/logo.tsx`: replaced heart-chip logo. Exports TWO components: `Monogram` — SVG recreation of the WP mark using `<text>` glyphs with `fontFamily: var(--font-playfair)` (loaded in root layout) and `fill`/`stroke` of `var(--primary)`/`var(--gold)` (auto-adapts to dark mode) + leaf/swash paths; `Logo` — Monogram in an ivory rounded-xl badge + wordmark "Wed" (green) + "Plan" (gold). **SVG glyph positions are hand-estimated — visually verify and nudge x/y/fontSize if the mark looks off.** User can also drop the original PNG in `public/` later if the vector version isn't close enough.
- `app/layout.tsx`: mounted `<Toaster position="top-right" />` (from `ui/sonner`, uses next-themes `useTheme` — safe without ThemeProvider) inside AuthProvider after Footer.
- `lib/auth-session.ts`: added `UserRole = "vendor" | "customer"`; `AuthUser.role?`. `auth-provider.tsx` `extractUser` normalizes `raw.role` to it (anything else → undefined, so admin can never enter client session shape from API).

**Sign Up page (`app/signup/page.tsx` + `components/auth/sign-up-form.tsx`):**

- Fields: Full Name, Email, Password (show/hide Eye toggle + **live criteria checklist**: 6+ chars / uppercase / lowercase lighting up green as typed), Profile Image (optional), Account Role (Vendor/Customer). No Admin anywhere.
- RHF + zod v4 (`z.email()`, string shorthand messages, `z.enum([..], { message })`), `zodResolver`. Inline errors under fields with `aria-invalid` (Base UI Input has destructive aria-invalid styles).
- **React-compiler note:** RHF `useForm().watch` trips `react-hooks/incompatible-library` — use the `useWatch({ control, name })` hook instead; passes lint clean.
- ImgBB upload: upload-on-select (instant blob preview + upload → toast), `uploadAvatarToImgbb()` base64-POSTs to `https://api.imgbb.com/1/upload?key=...`; key from `NEXT_PUBLIC_IMGBB_API_KEY` (added to `.env`, **currently EMPTY — user must paste their free api.imgbb.com key**; without it a friendly error toast explains setup). Limits: image/* + 5 MB, enforced with toasts + input reset. Object URL revoked on replace/unmount (no setState-in-effect).
- Role selection: two selectable cards (`aria-pressed`, `setValue(..., { shouldValidate: true })`) with Store/HeartHandshake icons; green ring when active.
- Google button: standard 4-color G SVG, `toast.info("coming soon")` — mount point kept for the Better Auth module.
- Submit: simulated 900 ms latency → `writeSession()` with `local-` token placeholder → success toast → `router.push("/dashboard")` (both roles; role-specific dashboards in a later module). Loading spinner + disabled submit/Google/upload buttons during submission.
- Design: split layout — left brand panel (hidden < lg: big Monogram, Playfair headline, gold-chip highlight list, italic tagline), right form card; section bg `bg-gradient-to-b from-secondary/60 via-background to-accent/15` (subtle, allowed by this module's spec); h-10 inputs, h-11 submit; fully responsive.

**Verified:** lint clean (only the 2 pre-existing scaffold errors), build ✓ 12 static routes, live smoke test of `/signup` — all sections present. **Note:** user's own dev server occupies port 3000 — smoke-test against it or use another port for `next start`.

## Task: Sign In page + demo credential store

Mirrors the Sign Up page's design/patterns (`components/auth/sign-in-form.tsx` + `app/signin/page.tsx`):

- **Fields:** Email + Password with the same show/hide Eye toggle, inline zod errors, h-10 inputs. No criteria checklist on sign-in (only "required" validation).
- **Credential Login (frontend-only, same decision as Sign Up):** NEW `src/lib/demo-auth.ts` — the demo account registry in `localStorage` (`wedplan.users`). `registerDemoAccount()` (called from the Sign Up submit) stores accounts with the password as a **SHA-256 hash** (crypto.subtle, never plain text); `verifyDemoCredentials()` is the stand-in for `POST /api/auth/login`, returning `{ ok: false, reason: "not-found" | "wrong-password" }` → mapped to error toasts ("No account found" toast carries a **Sign Up action button**; "Incorrect password"). Replaced entirely by the backend/Better Auth module later — nothing else depends on this file.
- **Google Login:** same 4-color G + `toast.info("coming soon")` mount point.
- **Redirect by role:** `siteConfig.dashboards = { vendor: "/dashboard", customer: "/dashboard" }` — the single place to change once role-specific dashboards exist. Both sign-in and sign-up now redirect through this map (sign-up submit also registers the demo account so sign-in round-trips work: sign up → sign out → sign in with same creds → correct role landing).
- Success toasts (`Welcome back, <first name>!`) + error toasts; 700 ms simulated latency; spinner + disabled Google/submit during submission; link to `/signup` in the card footer.
- **Refactor:** shared desktop brand panel extracted to `components/auth/auth-aside.tsx` (Monogram, headline/description props, gold-chip highlight list, tagline) — Sign Up form now uses it too (its inline copy was removed; behavior unchanged, verified by smoke test).

## Task: Bug Fixes, Google Auth Redirect & Full Role-Based Professionalism

Fixed all critical auth state bugs, Google redirect loops, undefined dashboard paths, empty dashboard files, and TypeScript/linter errors while preserving WedPlan's design palette (deep green `--primary`, soft gold `--gold`, warm ivory `--secondary`) and typography (`font-heading` Playfair Display).

**Root causes identified & fixed:**
1. **Google Auth Redirect failure:**
   - In `SignInForm` and `SignUpForm`, `callbackURL` was previously pointing back to `/signin`, causing users to get stuck on `/signin` after Google OAuth instead of proceeding into their account dashboard.
   - Fixed: `callbackURL` now redirects to `/auth/callback` (and passes `?role=vendor` for vendor signups).
   - In `src/app/auth/callback/page.tsx`: handles OAuth session completion and automatically navigates users to their role-specific dashboard (`/admin/dashboard` for admin, `/vendor/dashboard` for vendor, `/dashboard` for customer).
2. **Conflicting Auth State / Navbar not updating:**
   - `Navbar` and `DashboardSidebar` were previously reading from an old context and `localStorage` (`wedplan.auth`), which was completely decoupled from Better Auth cookies. As a result, logging in via Google or Email left the Navbar thinking the user was logged out.
   - Fixed: Unified `AuthProvider` (`src/components/providers/auth-provider.tsx`) and `useAuth` (`src/hooks/use-auth.ts`) to directly bridge Better Auth's reactive `useSession()`. Navbar now updates immediately upon login or logout with user avatar, name, email, role badge ("Customer", "Vendor", "Admin"), and role-targeted Dashboard link.
3. **Empty Dashboard Files (`TS2306` compile failures):**
   - `src/app/admin/dashboard/page.tsx`, `src/app/customer/dashboard/page.tsx`, and `src/app/vendor/dashboard/page.tsx` were previously 0-byte empty files, crashing TypeScript compilation.
   - Built full, production-quality dashboard views:
     - **Admin Dashboard** (`/admin/dashboard`): Platform statistics (Users, Pending Vendors, Services), Pending Vendor Approvals queue with Approve/Reject actions (`/api/v1/admin/vendors/:id/approval`), and User registry with role promotion/demotion.
     - **Vendor Dashboard** (`/vendor/dashboard`): Status banner reflecting admin approval (`vendorApproved`), service counts, and incoming booking requests with Accept/Decline action buttons.
     - **Customer Dashboard** (`/customer/dashboard`): Seamlessly connects customer planning workflows with `/dashboard`.
4. **Profile Settings (`/profile`):**
   - Replaced placeholder with an interactive Profile Settings page: name editing, ImgBB photo upload, account role inspection, and a 1-click "Apply as a Vendor" button for customers.
5. **Backend enhancement (`wedplan-server`):**
   - Added `POST /api/v1/profile/apply-vendor` route in `wedplan-server/src/routes/profile.js` to allow new or existing users to apply for vendor onboarding (with `vendorApproved: false`, safely pending admin review).
   - Cleaned `wedplan-client/.env` to eliminate leaked server secrets and misplaced URLs.
6. **Code Quality:**
   - Added `adminClient()` and `jwtClient()` plugins in `src/lib/auth-client.ts` to support `authClient.token()` and typed admin operations.
   - Resolved React 19 `react-hooks/set-state-in-effect` in `src/hooks/use-mobile.ts` using `useSyncExternalStore` and `carousel.tsx`.
   - Verified: `npx tsc --noEmit` exits with 0 errors; `npx eslint src` exits with 0 errors.

## Task: Vendor Portal — Shared Shell (persistent sticky sidebar + fixed routes)

**Problem (user-reported):** the vendor sidebar lived only inside the overview page's JSX, so navigating to any other vendor route (e.g. Subscription) lost the sidebar entirely; sidebar links also pointed at routes that did not exist (`/vendor/subscription`, `/vendor/bookings`, `/vendor/profile`), producing 404s.

**What was built:**

- `src/components/layout/vendor-sidebar.tsx` — shared sidebar content (`VendorSidebarContent`): Workspace header (Vendor Portal + Free/Premium badge + business name), 6 nav items with active state via `usePathname` (exact match for Overview/My Services/Add Service, prefix for the rest), pending-bookings count badge fetched from `/api/v1/bookings`, and the bottom **premium plan card** (plan name, `X of 3 free service listings used` usage line from `/api/v1/services/mine`, "Explore Premium" link) — now visible on every vendor page, not just overview. Accepts `onNavigate` to close the mobile drawer.
- `src/components/layout/vendor-shell.tsx` — client shell (`VendorShell`): `ProtectedRoute allowedRoles={["vendor","admin"]}`, sticky mobile header with hamburger, Base UI `Sheet` left drawer for mobile, desktop `aside` with `sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto` (sidebar stays fixed while content scrolls), shared footer with `CopyrightYear`.
- `src/app/vendor/layout.tsx` — server layout rendering `VendorShell` around every `/vendor/*` page.
- `src/app/vendor/dashboard/page.tsx` — **rewritten**: removed the inline mobile header/aside/footer; now only page content (heading, approval alert, 4 stat cards, subscription usage card, recent bookings).
- `src/app/vendor/subscription/page.tsx` — **moved from `/vendor/dashboard/subscription`** (old dir deleted) so the sidebar href works; rewritten in overview's visual language (white `border-[#e9e1d8]` cards, gold `border-[#eadbb5]` active-plan + recommended accents), switched raw `fetch`+`NEXT_PUBLIC_API_URL` to `apiRequest`, added `ProtectedRoute`.
- `src/app/vendor/bookings/page.tsx` — **new**: full booking-request list with status filter pills (All/Pending/Accepted/Rejected/Cancelled), Accept/Decline via `PATCH /api/v1/bookings/:id/status`, empty state.
- `src/app/vendor/profile/page.tsx` — **new**: account card (avatar, name/email, Vendor + approval badges), business info tiles, plan card with Manage/Upgrade CTA, quick-action links.
- `src/app/vendor/services/page.tsx` + `src/app/vendor/services/new/page.tsx` — dropped their standalone `min-h-screen bg-[#faf9f6] px-…` + `max-w-*` chrome (shell provides it); fixed orphaned closing tags.

**Vendor route map (final):** `/vendor/dashboard` Overview · `/vendor/services` My Services · `/vendor/services/new` Add Service · `/vendor/bookings` Booking Requests · `/vendor/subscription` Subscription · `/vendor/profile` Profile Settings.

**Decisions / gotchas:**

- `react-hooks/set-state-in-effect` rejects closing the mobile drawer in a `useEffect` on pathname change. Not needed: every sidebar link already calls `onNavigate` → `setMobileOpen(false)`.
- Deleting `.next` (needed to clear stale route types for the removed `/vendor/dashboard/subscription`) also wiped Next's generated `LayoutProps` global type → `tsc` fails until `npx next typegen` is re-run. If `Cannot find name 'LayoutProps'` appears after clearing `.next`, run `npx next typegen` first.
- `src/app/page.tsx` home footer had a raw `new Date().getFullYear()` (blocked value under `cacheComponents`) that crashed `npm run build`; replaced with the documented `<CopyrightYear />` component.
- Verified: `tsc --noEmit` 0 errors, `eslint src` 0 errors (only pre-existing `<img>` warnings), `npm run build` ✓ all routes static, `next start` smoke test: all 6 `/vendor/*` routes → 200 with the ProtectedRoute shell in SSR HTML.

## Task: Home hero — real photo background + lighter green overlay

- `src/app/page.tsx` hero: replaced the hardcoded Unsplash CSS background div with `next/image` `<Image fill priority>` pointing at **`/images/hero-wedding.jpg`** (folder `public/images/` created). `onError` chains a graceful fallback: `.jpg` → `.png` → the original Unsplash URL, so the hero looks good even before the file is dropped in. The user's own photo must be saved at `public/images/hero-wedding.jpg` (or `.png`).
- Green cinematic overlay reduced per request so the photo shines through: `bg-[#102F23]/75` + `/95 via /80 to /25` + `/50…/20` → now `/40` + `from-[#102F23]/85 via-[#183D2D]/45 to-[#183D2D]/10` + `/45 via-transparent to /15` (left side stays dark enough for the white heading).
- `next.config.ts`: added `images.remotePatterns` for `https://images.unsplash.com` (needed by the fallback URL).
- Verified: `tsc --noEmit` 0 errors, `npm run build` ✓, `next start` SSR contains the hero `<img data-nimg="fill">` + reduced-opacity overlay classes.

## Task: Customer Portal & Service Booking Operations (100% Complete)

Fulfilled all customer features specified in the requirements:
1. **Browse Available Wedding Services**: `/services` with responsive grid, rich cards, real API fetching with graceful fallback.
2. **Search and Filter Services**: Enhanced both server `GET /api/v1/services` and client search/filter (keyword regex, category, location, min/max price bounds, and price sorting).
3. **View Service Details**: `/services/[id]` with high-res photo gallery, vendor verification badge, service metadata, and demo vs live listing handling.
4. **Submit Booking Requests**: Service booking form on `/services/[id]` with event date validation, guest count, and custom notes posting to `POST /api/v1/bookings`. Fixed backend user ID normalization (JWT & Better Auth cookie), vendor ID matching, and service availability checks.
5. **Track Booking Request Status**: Created full-featured `/dashboard/bookings` management page with status tabs (All, Pending, Accepted, Rejected, Cancelled), search bar, and color-coded status badges.
6. **Cancel Pending Booking Requests**: Built interactive "Cancel Request" action for pending bookings calling `PATCH /api/v1/bookings/:id/cancel` with real-time UI state update.
7. **Access Customer Dashboard**: Replaced overview placeholders on `/dashboard` with live booking count metrics, quick navigation cards, recent bookings list, plus interactive Wedding Budget Tracker (`/dashboard/budget`) and Month-by-Month Wedding Checklist (`/dashboard/checklist`).

**Backend enhancements (`wedplan-server`):**
- `src/middleware/auth.js`: Normalized `req.user.id` across both JWT Bearer and session cookie paths; updated `requireCustomer` to accept `customer` and `admin` roles.
- `src/routes/bookings.js`: Added vendor ID resolution (`$or` across string ID and ObjectId), service availability check, booking data enrichment (`serviceImage`, `serviceCategory`), and `?status=` filtering on `GET /api/v1/bookings/mine`.
- `src/routes/services.js`: Added query filters for `search`/`q`, `category`, `location`, `minPrice`/`maxPrice`, and `sort` (`price-low`, `price-high`). Sanitized `approvedVendorIds` to unique string format.
