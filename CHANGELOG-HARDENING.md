# ZenPortal Production Hardening — Change Log

## Phase 1: Security & Infrastructure Foundation

### New Files Created

| File | Purpose |
|------|---------|
| `src/lib/rate-limit.ts` | In-memory sliding-window rate limiter with presets (AUTH_LOGIN, AUTH_STRICT, UPLOAD) |
| `src/lib/file-storage.ts` | File storage abstraction — saves to `uploads/` (outside `public/`), with path traversal protection |
| `src/app/api/files/[...path]/route.ts` | Auth-gated file serving endpoint with path traversal check |
| `prisma/migrate-files.ts` | One-time migration script: moves files from `public/uploads/` → `uploads/`, updates DB URLs |
| `src/lib/api-utils.ts` | Centralized `apiError()` (sanitized error responses) and `clampPageSize()` helpers |

### Security Fixes

| Fix | Severity | Files | Description |
|-----|----------|-------|-------------|
| **File access bypass** | CRITICAL | `file-storage.ts`, `files/[...path]/route.ts`, `upload/route.ts` | Files moved out of `public/` to `uploads/`. Served via auth-gated API endpoint only. MIME allowlist + file extension validation added to uploads. |
| **IDOR on detail endpoints** | HIGH | `maintenance/[id]/route.ts`, `applications/[id]/route.ts`, `documents/[id]/route.ts` | Added ownership checks: non-admin users can only access their own resources (403 otherwise). |
| **No rate limiting** | HIGH | `auth/[...nextauth]/route.ts`, `auth/register/route.ts`, `auth/change-password/route.ts`, `upload/route.ts` | Login (10/60s by IP), register (10/60s by IP), password change (5/60s by user), upload (20/60s by user). 429 with Retry-After header. |
| **Broken tenant maintenance form** | MEDIUM | `dashboard/maintenance/page.tsx` | Replaced `useUnits()` (admin-only) with `useLeases({ status: 'ACTIVE' })` so tenants see their leased units. |
| **Session staleness** | LOW | `dashboard/profile/page.tsx`, `auth.ts` | Profile name changes now update the session via `updateSession({ name })`. |

---

## Phase 2: API Hardening

| Fix | Severity | Files | Description |
|-----|----------|-------|-------------|
| **Unbounded page size (DoS)** | HIGH | All 9 list endpoints | Added `clampPageSize()` — caps `pageSize` to `MAX_PAGE_SIZE` (100). |
| **Error message leakage** | HIGH | All 22 API routes | Replaced inline catch blocks with `apiError()` — sanitizes errors, prevents stack traces and DB schema from reaching clients. |
| **Missing security headers** | MEDIUM | `next.config.ts` | Added X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy, Cache-Control: no-store for API routes. |
| **MAX_PAGE_SIZE constant** | — | `src/lib/constants.ts` | Added `MAX_PAGE_SIZE = 100`. |

---

## Phase 3: Production Hardening Pass

### Critical Auth Fixes

| Fix | Severity | File | Description |
|-----|----------|------|-------------|
| **Google OAuth broken** | CRITICAL | `src/lib/auth.ts` | signIn callback had inverted logic + didn't create organization membership. All Google users were effectively locked out. Now creates default org membership on first login. |
| **JWT update clobbering** | CRITICAL | `src/lib/auth.ts` | `updateSession({ name })` caused `token.role` and `token.organizationId` to be set to `undefined`, breaking auth for the rest of the session. Now only updates fields explicitly present. |
| **Suspended users can login** | HIGH | `src/lib/auth.ts` | Added `if (user.status !== 'ACTIVE') return null` to the authorize function. |

### Security Fixes

| Fix | Severity | File | Description |
|-----|----------|------|-------------|
| **Path traversal** | HIGH | `src/lib/file-storage.ts`, `src/app/api/files/[...path]/route.ts` | `getFile('../../etc/passwd')` would resolve outside `uploads/`. Now checks `..` and `\0` in URL segments, plus validates resolved path stays within UPLOAD_DIR. |
| **Internal comments leak** | HIGH | `src/server/services/maintenance.service.ts`, `src/app/api/maintenance/[id]/route.ts` | `getById` now accepts `filterInternalComments` option. Non-admin users' responses have `isInternal: true` comments stripped. |
| **Upload extension bypass** | MEDIUM | `src/app/api/upload/route.ts` | Added ALLOWED_EXTENSIONS check alongside MIME type check. Prevents `.exe` files with spoofed `Content-Type`. |

### Data Integrity Fixes

| Fix | Severity | File | Description |
|-----|----------|------|-------------|
| **Lease operations not transactional** | HIGH | `src/server/services/lease.service.ts` | `create`, `update`, `renew`, `terminate` all wrapped in `prisma.$transaction()`. Prevents inconsistent state (e.g., lease created but unit status not updated). |
| **Application status transitions** | MEDIUM | `src/server/services/application.service.ts` | `review()` now validates status is one of `UNDER_REVIEW`, `APPROVED`, `REJECTED`. Prevents setting to `SUBMITTED` or `WITHDRAWN` via review endpoint. |
| **Document POST unvalidated** | MEDIUM | `src/app/api/documents/route.ts` | Added Zod schema validation with proper `DocumentType` enum. |

### API Correctness

| Fix | Severity | File | Description |
|-----|----------|------|-------------|
| **Admin overview missing user stats** | BUG | `src/app/api/admin/overview/route.ts`, `src/server/repositories/user.repository.ts` | Added `userRepository.getStats()` returning `{ total, active, tenants }`. Added to admin overview API response. |

### Frontend Fixes

| Fix | Severity | File | Description |
|-----|----------|------|-------------|
| **"Total Users" shows unit count** | BUG | `src/app/(dashboard)/admin/overview/page.tsx` | Changed from `units.total` to `users?.total ?? 0`. Description shows tenant count. |
| **Admin overview null safety** | MEDIUM | `src/app/(dashboard)/admin/overview/page.tsx` | All stat values use `?.` and `?? 0` defaults to handle partial API responses gracefully. |
| **Tenant dashboard raw fetch** | MEDIUM | `src/app/(dashboard)/dashboard/overview/page.tsx` | Replaced `fetch().json()` with `fetchApi()` across TenantDashboard, OwnerDashboard, ApplicantDashboard. Added loading skeletons. |
| **Documents page raw fetch** | MEDIUM | `src/app/(dashboard)/dashboard/documents/page.tsx` | Replaced raw fetch with `fetchApi()`. |
| **Notices priority check** | MINOR | `src/app/(dashboard)/dashboard/notices/page.tsx` | Changed `ann.priority !== 'normal'` to `ann.priority !== 'LOW'` (matching enum values). |

---

## Files Modified Summary

**4 new files**, **~25 modified files**, **0 new dependencies**.

### New Files
- `src/lib/rate-limit.ts`
- `src/lib/file-storage.ts`
- `src/lib/api-utils.ts`
- `src/app/api/files/[...path]/route.ts`
- `prisma/migrate-files.ts`

### Modified Files
- `src/lib/auth.ts` — OAuth fix, JWT clobber fix, suspended user block
- `src/lib/constants.ts` — MAX_PAGE_SIZE, MAX_FILE_SIZE
- `next.config.ts` — security headers
- `.gitignore` — /uploads
- `src/app/api/upload/route.ts` — file storage, MIME + extension validation, rate limiting
- `src/app/api/auth/[...nextauth]/route.ts` — rate limiting
- `src/app/api/auth/register/route.ts` — rate limiting
- `src/app/api/auth/change-password/route.ts` — rate limiting
- `src/app/api/maintenance/[id]/route.ts` — IDOR check, internal comments filter
- `src/app/api/applications/[id]/route.ts` — IDOR check
- `src/app/api/documents/[id]/route.ts` — IDOR check, orphan file cleanup
- `src/app/api/documents/route.ts` — Zod validation
- `src/app/api/admin/overview/route.ts` — user stats
- `src/server/services/lease.service.ts` — Prisma transactions
- `src/server/services/maintenance.service.ts` — internal comments filtering
- `src/server/services/application.service.ts` — status transition validation
- `src/server/repositories/user.repository.ts` — getStats method
- `src/app/(dashboard)/admin/overview/page.tsx` — Total Users fix, null safety
- `src/app/(dashboard)/dashboard/overview/page.tsx` — fetchApi, loading states
- `src/app/(dashboard)/dashboard/maintenance/page.tsx` — tenant unit selector
- `src/app/(dashboard)/dashboard/documents/page.tsx` — fetchApi
- `src/app/(dashboard)/dashboard/notices/page.tsx` — priority check
- `src/app/(dashboard)/dashboard/profile/page.tsx` — session update
- All 9 list API routes — clampPageSize
- All 22 API routes — apiError catch blocks

---

## Remaining Risks & Known Gaps

### Still Stubbed / Not Production-Ready
1. **In-memory rate limiting** — resets on server restart, doesn't work across multiple instances. Replace with Redis for production (no code changes needed in route handlers — just swap the implementation in `rate-limit.ts`).
2. **Local file storage** — `uploads/` on disk doesn't scale horizontally. Swap `file-storage.ts` implementation for S3/GCS/R2 before deploying to multi-instance.
3. **No email verification** — registration doesn't verify email addresses.
4. **No CSRF protection** — Next.js API routes rely on SameSite cookies but have no explicit CSRF tokens.
5. **No Content-Security-Policy header** — CSP not added due to inline styles from Tailwind and dynamic script loading; needs careful configuration per deployment.

### Next Highest-Value Improvements
1. **Database indexes** — Add composite indexes for common query patterns (org + status, org + date ranges).
2. **Audit log for auth events** — Login attempts, password changes, OAuth links aren't audited.
3. **Pagination cursor-based** — Current offset pagination is inefficient for large datasets.
4. **E2E tests** — Playwright config exists but no test coverage for critical flows.
5. **API response typing** — Frontend uses `Record<string, unknown>` for API data; generate types from API schemas.
6. **Webhook/notification system** — No way to notify tenants of maintenance updates or lease changes.
7. **Payment integration** — Payment model exists in schema but has no service/API/UI.
