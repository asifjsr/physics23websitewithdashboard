# Security Specification for ClassVerse

## Data Invariants
1. A user profile (`/users/{uid}`) must have a `role` (student/admin) and match the authenticated user's email.
2. Backup records (`/users/{uid}/backupRecords/{id}`) must only be accessible by the owner or an admin.
3. Personal calendar events (`/users/{uid}/calendarEvents/{id}`) are private to the user.
4. Global calendar events (`/globalCalendarEvents/{id}`) can be created/modified ONLY by admins.
5. Batchmate data and albums are publicly readable but can only be modified by admins (if we store them in Firestore - currently they are static but will be moved to Firestore in the Admin Panel part).

## The "Dirty Dozen" Payloads
1. Attempting to create a user profile for a different UID.
2. Attempting to set `role: 'admin'` as a normal user.
3. Attempting to read another user's backup records.
4. Attempting to delete a global calendar event as a student.
5. Attempting to inject a massive 1MB string into a course name field.
6. Attempting to update `createdAt` timestamp.
7. Attempting to create an event with a negative duration or invalid date.
8. Attempting to write to a collection that doesn't exist.
9. Attempting to query all users' private data without a filter.
10. Attempting to bypass `email_verified` if enforced.
11. Attempting to update another user's profile.
12. Attempting to create a backup record without required fields.

## Role-Based Access
- **Admin**: `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or matching a specific UID/email in Firestore.
- **Student**: Any authenticated user with `role: 'student'` in their profile.
