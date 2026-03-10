# Platform Admin System - Changelog

## 2026-03-09 - Platform Admin System Implementation

### Role Simplification
- Reduced roles from 7 (SUPER_ADMIN, PLATFORM_ADMIN, PROPERTY_MANAGER, LANDLORD, TENANT, APPLICANT, VENDOR) to 3 (PLATFORM_ADMIN, LANDLORD, TENANT)
- PLATFORM_ADMIN is the highest-permission role (property management company)
- LANDLORD views their own properties and receives payments
- TENANT pays bills, communicates, and views documents
- Updated Prisma schema, all API routes, middleware, constants, validations, tests, and seed data

### New Database Models
- **Message** - Direct messaging between users with read tracking
- **Notification** - In-app notifications with type, link, and read status
- **UserDocument** - Documents assigned directly to users by admins

### New API Endpoints
| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/messages` | GET, POST | List conversations, send messages |
| `/api/messages/[userId]` | GET | Get message thread, marks as read |
| `/api/notifications` | GET, PATCH | List notifications, mark as read |
| `/api/user-documents` | GET, POST | List/upload user-specific documents |
| `/api/user-documents/[id]` | GET, DELETE | Get/delete user documents |

### New User Registration Flow
- New users register with status `PENDING` (cannot log in)
- All PLATFORM_ADMIN users receive a notification on new registration
- Admin reviews and approves (ACTIVE) or rejects (SUSPENDED) from the Users page
- User receives notification on approval/rejection

### Automated Notifications
Notifications are created for:
- New user registration (to admins)
- Role changes (to affected user)
- Account approval/suspension (to affected user)
- New messages received (to recipient)
- Document shared with user (to recipient)

### Frontend Changes

**New Pages:**
- `/admin/messages` - Split-panel messaging with conversation list + thread view
- `/admin/notifications` - Notification center with read/unread filters
- `/admin/user-documents` - Document management with user assignment and upload
- `/dashboard/messages` - Tenant messaging interface
- `/dashboard/notifications` - Tenant notification list

**Updated Pages:**
- Admin Overview - Added pending users count, unread messages count, recent notifications
- Admin Users - Added pending users banner, approve/reject quick actions
- Header - Added notification bell with unread count dropdown

**New Navigation Items:**
- Admin sidebar: Messages, Notifications, User Documents
- Tenant sidebar: Messages, Notifications

### New React Query Hooks
- `useConversations`, `useMessageThread`, `useSendMessage`
- `useNotifications`, `useUnreadNotificationCount`, `useMarkNotificationsRead`
- `useUserDocuments`, `useCreateUserDocument`, `useDeleteUserDocument`

### Backend Services & Repositories
- `message.repository.ts` + `message.service.ts`
- `notification.repository.ts` + `notification.service.ts`
- `user-document.repository.ts` + `user-document.service.ts`

### Validation Schemas
- `sendMessageSchema` - Message content (1-5000 chars) + recipientId
- `markNotificationsReadSchema` - IDs array or mark-all
- `createUserDocumentSchema` - Document metadata + userId

### Tests Added
- **203 total tests passing** across 6 test files
- Validation schema tests (33 tests) - message, notification, user-document, user, announcement
- RBAC enforcement tests (22 tests) - role hierarchy, permission checks, removed roles
- Registration flow tests (16 tests) - validation, boundary cases

### Files Changed (Summary)
- **Schema**: `prisma/schema.prisma` (3 new models + relations)
- **Seed**: `prisma/seed.ts` (simplified to 4 users across 3 roles)
- **API Routes**: 5 new route files, 2 modified
- **Server Layer**: 6 new repository/service files
- **Validations**: 3 new schema files, 2 modified
- **Hooks**: 3 new hook files
- **Pages**: 5 new pages, 3 modified
- **Components**: 1 new component (NotificationBell), 1 modified (Header)
- **Config**: navigation.ts, constants.ts, auth-utils.ts, middleware.ts updated
- **Tests**: 3 new test files, 1 verified
