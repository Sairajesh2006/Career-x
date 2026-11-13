# Career-X Firestore Security Specification

## 1. Data Invariants
1. **Strict Ownership**: A document at `/students/{userId}` and any subcollection under `/students/{userId}/**` may ONLY be read or modified by the authenticated, email-verified user whose `request.auth.uid == userId`.
2. **No Cross-Student Access**: No student can read, list, create, update, or delete another student's profile, job applications, resume analyses, mock interviews, activity logs, or AI chat messages.
3. **Master Gate Integrity**: Every subcollection operation under `/students/{userId}` verifies the existence of the parent `/students/{userId}` document (via `exists()`/`get()`) and enforces `uid == userId`.
4. **Temporal & Identity Integrity**: All `uid` fields must match `request.auth.uid` on create and remain immutable on update. All `createdAt` and `updatedAt` timestamps must match `request.time`.
5. **PII Isolation**: Private student fields (`email`, `cgpa`, `applications`, `resumeAnalyses`, `mockInterviews`, `aiChats`) are confined to `/students/{userId}`. `/leaderboard/{userId}` stores zero PII and only allows reads when `resource.data.isPublic == true`.
6. **Bounded Payloads**: All strings, numbers, and arrays are strictly bounded in size and type to prevent resource exhaustion and shadow fields (`hasOnly`).

## 2. "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Cross-Student Read**: Student B (`uid_b`) attempts `get(/students/uid_a)`.
2. **Cross-Student Subcollection Read**: Student B (`uid_b`) attempts `list(/students/uid_a/applications)`.
3. **UID Spoofing on Create**: Student B (`uid_b`) writes `/students/uid_b` with `uid: "uid_a"`.
4. **Shadow Field Injection**: Student A writes `/students/uid_a` with an extra undeclared field `isAdmin: true`.
5. **Unverified Email Write**: Newly registered Student A (`email_verified: false`) attempts `create(/students/uid_a)`.
6. **Timestamp Spoofing**: Student A writes `/students/uid_a` with backdated `createdAt: "2020-01-01T00:00:00Z"`.
7. **Immutable Field Tampering**: Student A updates `/students/uid_a` changing `uid` or `createdAt`.
8. **Oversized String Poisoning**: Student A writes `fullName` of 5,000 characters to `/students/uid_a`.
9. **Out-of-Range Readiness Score**: Student A updates `readinessScore: 999` or `cgpa: 15`.
10. **Invalid Document ID Poisoning**: Student A creates `/students/uid_a/applications/bad$id/path` or 300-char ID.
11. **Private Leaderboard Scraping**: Student B queries `/leaderboard` where `isPublic == false` or reads private entry.
12. **Subcollection Orphan Write**: Uninitialized user attempts to write `/students/uid_a/applications/app1` before `/students/uid_a` exists.

## 3. Rules Verification Checklist
- `rules_version = '2';`
- Global deny catch-all `match /{document=**} { allow read, write: if false; }`
- `isValidId()` applied to all single-doc path variables
- `isValid[Entity]()` called on both `create` and `update`
- `affectedKeys().hasOnly()` on every `update` action branch
- `request.auth.token.email_verified == true` enforced on authenticated writes/reads
- ESLint `@firebase/eslint-plugin-security-rules` clean with zero errors/warnings
