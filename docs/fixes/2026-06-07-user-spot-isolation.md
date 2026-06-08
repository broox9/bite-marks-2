# User spot data isolation fix

## Problem

Saved spots, personal ratings, notes, and visit status were shared across all logged-in users. Switching Google accounts showed the same list and personal details.

## Root cause

The Appwrite adapter used the admin TablesDB client (bypassing Appwrite row permissions) and **`getUserSpots` did not filter by `user_id`** — the filter was commented out during development:

```typescript
// Query.equal("user_id", userId),
```

Read/update/delete paths also did not verify that a row belonged to the current user before returning or mutating it.

## Fix

1. **`getUserSpots`** — restored `Query.equal("user_id", userId)` so each user only loads their rows.
2. **`getUserSpot`** — after fetching a row by ID, return `null` if `user_id` does not match the session user.
3. **`updateUserSpot` / `deleteUserSpot`** — require `userId`, verify ownership via `getUserSpot` before mutating.
4. **Use case + remote handlers** — pass `user.$id` through update and delete.

## Files changed

- `src/lib/adapters/secondary/appwrite/index.ts`
- `src/lib/ports/persistence.repository.ts`
- `src/lib/use_cases/placeAndSpot.ts`
- `src/lib/adapters/primary/remote-handlers/spots.remote.ts`
- Tests in `placeAndSpot.test.ts` and `appwrite/index.test.ts`

## Verify

1. Log in as user A, save a spot with a distinct note/rating.
2. Log out, log in as user B — list should be empty (or only B’s spots).
3. As user B, try opening a spot URL from user A’s session — should show “Spot not found”.
4. Save a spot as user B and confirm it does not appear when logged in as user A.
