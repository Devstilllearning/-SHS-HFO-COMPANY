# Berrionaire Firestore Security Specification

## Data Invariants
- A meeting must have a valid `memberId` (the user assigned to the meeting).
- A user can only access their own profile unless they have managerial roles.
- Superadmin and CEO have full read access to all collections for organizational transparency.
- Settings can only be modified by a superadmin.
- Notifications are private to the recipient.
- Activity logs are read-only for most users, append-only for active sessions.

## The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Spoofing**: Attempt to create a user profile with a different `uid` than the authenticated user.
2. **Role Escalation**: A `marketing_member` attempting to update their own role to `superadmin`.
3. **Ghost Field Injection**: Adding a `isVerified: true` field to a meeting document during creation.
4. **Settings Hijacking**: A `secretary` trying to disable `gmeetEnabled` in the global `/settings/core` document.
5. **Private Notification Breach**: `user_A` attempting to read a notification where `userId` is `user_B`.
6. **Cross-Department Snooping**: A `finance_member` trying to list all members of the `Marketing` department (if not a manager).
7. **Bypassing Invariants**: Creating a meeting with a `status: 'completed'` status directly.
8. **Resource Poisoning**: Using a 2KB string as a `deptId`.
9. **Stale Update**: Updating `updatedAt` with a client-provided timestamp instead of `request.time`.
10. **Immutable Field Change**: Attempting to change `createdAt` on an existing meeting.
11. **Admin Key Exposure**: Attempting to read `/settings/core` to get `zoomApiKey` (if permissions are too broad).
12. **Unauthenticated Write**: Any write attempt without a valid Firebase Auth token.

## Firestore Rules Test Plan
A standard test suite will verify these scenarios using the Firebase Emulator or security rule simulation.
