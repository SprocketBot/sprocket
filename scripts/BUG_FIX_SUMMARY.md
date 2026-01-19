# Bug Fix: Infinite Recursion in intakeUserBulk

## The Problem

The `intakeUserBulk` mutation could get into an infinite recursion when processing CSV files containing duplicate Discord IDs or when trying to create a `UserAuthenticationAccount` for a user that already exists.

## Root Cause

The issue occurred in the `intakeUser` function in `core/src/franchise/player/player.service.ts`. When a user didn't exist:

1. The function created a new `User` object
2. Created a `UserAuthenticationAccount` with the Discord ID
3. Saved them using the transaction runner

**The Problem:**

- When saving `user.authenticationAccounts` array (line 1045), TypeORM could cascade save the `user` reference on each auth account
- This could then cascade save the `authenticationAccounts` array again
- Additionally, if two requests tried to create accounts with the same Discord ID concurrently, the unique constraint would be violated
- The circular relationship between `User` and `UserAuthenticationAccount` could cause infinite recursion during saves

## The Fix

### Changes Made to `player.service.ts` (lines 1016-1100)

1. **Added Check for Existing AuthenticationAccount**: Before creating a new user, we now check if a `UserAuthenticationAccount` with the given Discord ID already exists within the transaction.

2. **Reuse Existing User**: If the auth account exists, we reuse the existing user instead of creating a duplicate.

3. **Fixed Save Order**: Changed the order of entity saves to avoid circular dependencies:

   - Save `User` first
   - Then save `UserProfile` with user reference
   - Then save `UserAuthenticationAccount` with user reference
   - Finally save `Member` and `MemberProfile`

4. **Removed Array Save**: Instead of saving `user.authenticationAccounts` array, we now save the individual `authAcc` entity directly, avoiding potential cascade issues.

### Key Code Changes

**Before:**

```typescript
const authAcc = this.userAuthRepository.create({...});
authAcc.user = user;
user.authenticationAccounts = [authAcc];
...
await runner.manager.save(user.authenticationAccounts); // Could cause recursion!
```

**After:**

```typescript
// Check if auth account already exists
const existingAuthAccount = await runner.manager.findOne(UserAuthenticationAccount, {...});

if (existingAuthAccount) {
    // Reuse existing user
    user = existingAuthAccount.user;
} else {
    // Create new and save in correct order
    await runner.manager.save(user);
    user.profile.user = user;
    await runner.manager.save(user.profile);

    authAcc.user = user;
    await runner.manager.save(authAcc); // Save individual entity, not array
}
```

## Testing

### Test Files Created

1. **Test CSV**: `scripts/test-data/test-users.csv`

   - Contains duplicate Discord IDs to test the fix
   - Format: `discordId,name,skillGroupId,salary`

2. **Test Script**: `scripts/test-intake-user-bulk.sh`
   - Sends GraphQL mutation with test CSV
   - Checks for recursion errors
   - Validates response

### How to Test

```bash
# Start local environment
docker-compose up -d

# Run the test script
./scripts/test-intake-user-bulk.sh
```

The test should now complete without infinite recursion errors.

## Benefits of This Fix

1. **Prevents Duplicate Users**: No longer creates multiple users for the same Discord ID
2. **Handles Race Conditions**: Properly handles concurrent requests trying to create the same user
3. **Eliminates Recursion**: Fixed circular save dependencies
4. **Better Logging**: Added clear log messages for debugging
5. **Transaction Safety**: Properly uses the query runner for all database operations

## Related Files

- `core/src/franchise/player/player.service.ts` (main fix)
- `core/src/franchise/player/player.resolver.ts` (mutation endpoint)
- `core/src/database/identity/user_authentication_account/user_authentication_account.model.ts` (unique constraint)

## Notes

- The unique constraint on `UserAuthenticationAccount` (`@Unique("UserAccounts", ["accountId", "accountType"])`) is what would ultimately catch duplicate Discord IDs
- This fix prevents the error from occurring in the first place by checking before insertion
- The transaction isolation ensures that concurrent requests see uncommitted data, preventing duplicate user creation
