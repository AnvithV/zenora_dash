# ZenPortal - Implementation Rules

## Roles & Permissions

### Role Hierarchy
1. **PLATFORM_ADMIN** - Highest permission. This is the property management company (us).
2. **LANDLORD** - Property owners. Can view their own properties and manage them.
3. **TENANT** - Residents. Can pay bills, communicate, view documents.

### Authorization Rules
- `isAdminRole()` returns true for PLATFORM_ADMIN and LANDLORD
- `isPlatformAdmin()` returns true ONLY for PLATFORM_ADMIN
- `canManageProperty()` returns true for PLATFORM_ADMIN and LANDLORD
- Tenant-only actions: submit maintenance requests, view own leases/documents, messaging
- Admin-only actions: create properties/units/leases, manage users, send announcements, upload user documents
- PLATFORM_ADMIN-only actions: change user roles, delete users, approve/reject pending users

### Middleware Routing
- PLATFORM_ADMIN redirected to `/admin/overview` (never sees tenant dashboard)
- LANDLORD can access `/admin/*` routes
- TENANT can only access `/dashboard/*` routes
- Unauthenticated users redirected to `/login`

## Registration Flow
- New users register with status `PENDING`
- Cannot log in until approved by PLATFORM_ADMIN
- Admins notified of new registrations
- Admin approves (status -> ACTIVE) or rejects (status -> SUSPENDED)

## Architecture Patterns

### API Routes
- Located in `src/app/api/`
- Use `requireAuth()` or `requireAdmin()` from `@/lib/auth-utils`
- Use `isPlatformAdmin()` for admin-only write operations
- Return responses via `successResponse()`, `apiError()`, `forbiddenResponse()` from `@/lib/api-response`
- Validate input with Zod schemas from `src/lib/validations/`
- Apply rate limiting from `@/lib/rate-limit` on sensitive endpoints

### Server Layer
- **Repositories** (`src/server/repositories/`): Pure Prisma queries, no business logic
- **Services** (`src/server/services/`): Business logic, validation, audit logging
- Services call repositories, never access Prisma directly
- API routes call services, never call repositories directly

### Frontend
- Pages are `'use client'` when using hooks
- Data fetching via React Query hooks in `src/hooks/`
- API calls via `fetchApi()` and `mutateApi()` from `@/lib/api-client`
- UI components from `src/components/ui/` (Shadcn/Radix)
- Layout components in `src/components/layout/`
- Styling: Tailwind CSS, consistent pattern: `rounded-lg border bg-white p-6 shadow-sm`

### Database
- Prisma ORM with PostgreSQL
- Schema at `prisma/schema.prisma`
- All models have `createdAt` and most have `updatedAt`
- Soft references via string IDs (cuid)
- Organization-scoped data via `organizationId` field

### Testing
- Vitest for unit tests
- Tests in `src/lib/__tests__/` and `src/test/__tests__/`
- Mock `@/lib/auth` in test files that import auth-utils
- Validation tests should cover valid inputs, invalid inputs, and boundary cases

## Notification System
- In-app notifications stored in `Notification` table
- Types: `new_registration`, `role_changed`, `account_approved`, `account_suspended`, `new_message`, `document_shared`
- Frontend polls via React Query `refetchInterval`
- NotificationBell component in header shows unread count

## Messaging System
- Direct messages between any two users
- Conversations grouped by partner user
- Messages marked as read when thread is opened
- Frontend polls for new messages

## Document System
- **Entity documents** (`Document` model): Attached to properties, leases, maintenance requests, applications
- **User documents** (`UserDocument` model): Assigned directly to a user by an admin
- File uploads go through `/api/upload` endpoint (max 10MB, MIME type validated)
- Files served from `/api/files/[...path]`

## Login Credentials (Development)
All passwords: `password123`
- Platform Admin: `admin@zenportal.com`
- Landlord: `owner@zenportal.com`
- Tenant 1: `tenant1@zenportal.com`
- Tenant 2: `tenant2@zenportal.com`
