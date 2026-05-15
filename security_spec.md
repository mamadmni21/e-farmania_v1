# Security Specification for E-Farmania

## Data Invariants
1. A Land document must have an `ownerId` matching the creator's UID.
2. Sensors and Logs are sub-collections of Lands; access is derived from the parent Land's `ownerId` or the user's `invitedBy` field.
3. Livestock groups have an `ownerId` for access control.
4. User profiles are readable by anyone (for referral lookup) but only writable by the owner.
5. Inventory and Transactions are tied to an `ownerId`.
6. `ShopProduct` is global and read-only for public, writable only by system/admin.

## The Dirty Dozen Payloads (Rejection Targets)
1. Creating a Land with a different `ownerId`.
2. Updating a Land's `ownerId` after creation.
3. Deleting a Land owned by someone else.
4. Reading inventory items of a different team without permission.
5. Injecting a 1MB string into a `Land` name field.
6. Updating a User Profile's `role` to 'Pemilik' if you are not the owner of that record.
7. Creating a Livestock entry with a negative quantity.
8. Writing to `shop_products` as a regular user.
9. Creating a Transaction without an `amount`.
10. Spoofing `createdAt` with a client timestamp instead of server timestamp.
11. Bypassing `isValidId` with a 2KB junk string as document ID.
12. Listing all users without being signed in.

## Firestore Rules Test Runner
(See `firestore.rules.test.ts` for implementation)
