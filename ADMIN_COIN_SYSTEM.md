# Admin-Controlled Coin Distribution System

## Overview

The SMM panel now uses an **admin-controlled coin distribution system** where:
- **Admin** has a master balance (coins) that they can allocate to users or use themselves
- **Users** receive coins allocated by the admin and can only use what they've been given
- All coin transfers are tracked and deducted from the admin's balance

## How It Works

### For Admin

1. **Admin Balance**: The admin account starts with a balance (default: ₱10,000)
   - This represents the total coins available for allocation and personal use
   - When admin places orders, coins are deducted from their balance
   - When admin allocates coins to users, coins are deducted from their balance

2. **Allocating Coins to Users**:
   - Go to **Admin → User Management** (`/admin/users`)
   - View all users with their current balances
   - Click "Allocate" button next to any user
   - Enter amount to transfer (must not exceed your balance)
   - Coins are immediately transferred: deducted from admin, added to user

3. **Admin Privileges**:
   - Can see the real provider balance (from SMM API)
   - Can see their own allocatable balance
   - Can allocate coins to any user
   - Can still place orders using their own balance

### For Regular Users

1. **User Balance**: Users start with ₱0.00
   - They can only use coins allocated by the admin
   - Cannot see the provider balance (restricted to admin only)
   - Can place orders up to their available balance

2. **Getting Coins**:
   - Users must contact the admin to request coins
   - Admin allocates coins through the User Management interface
   - Users can immediately see their updated balance

3. **Using Coins**:
   - Users can place orders using their available balance
   - When an order is placed, coins are deducted from their balance
   - Users cannot place orders if they have insufficient balance

## Example Scenario

```
Initial State:
- Admin Balance: ₱5,000.00
- User1 Balance: ₱0.00

Admin allocates ₱200 to User1:
- Admin Balance: ₱4,800.00  (5000 - 200)
- User1 Balance: ₱200.00    (0 + 200)

User1 places order costing ₱50:
- Admin Balance: ₱4,800.00  (unchanged)
- User1 Balance: ₱150.00    (200 - 50)

Admin places order costing ₱100:
- Admin Balance: ₱4,700.00  (4800 - 100)
- User1 Balance: ₱150.00    (unchanged)
```

## Database Schema Changes

### Updated `coin_balances` Table

```sql
CREATE TABLE IF NOT EXISTS coin_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coins DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,  -- Changed from 1000.00 to 0.00
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Key Changes:**
- Default balance changed from `1000.00` to `0.00` for new users
- Admin account gets `10000.00` as starting balance
- Comments added to clarify admin vs user balance meaning

## API Endpoints

### `/api/admin/allocate-coins` (POST)
Allocate coins from admin to a user.

**Authentication**: Admin only

**Request Body**:
```json
{
  "userId": "uuid-of-target-user",
  "amount": 200.00
}
```

**Response**:
```json
{
  "success": true,
  "adminBalance": 4800.00,
  "userBalance": 200.00,
  "amountTransferred": 200.00
}
```

**Error Cases**:
- Insufficient admin balance
- Invalid user ID
- Invalid amount (negative or zero)
- Not authorized (non-admin users)

## UI Changes

### 1. Admin User Management Page (`/admin/users`)

**New Features**:
- **Balance Column**: Shows current balance for each user
- **Admin Balance Display**: Shows admin's available balance at the top
- **Allocate Button**: Opens dialog to transfer coins to a user

**Allocate Coins Dialog**:
- Shows user's current balance
- Shows admin's available balance
- Input field for amount to transfer
- Real-time calculation of balances after transfer
- Validation to prevent over-allocation

### 2. Balance Page (`/balance`)

**Admin View**:
- Shows 3 cards:
  1. **Your Balance**: Admin's allocatable/usable balance
  2. **Provider Balance**: Real SMM provider API balance (admin only)
  3. **Available to Spend**: Same as Your Balance

**User View**:
- Shows 2 cards:
  1. **Your Balance**: Coins allocated by admin
  2. **Available to Spend**: Same as Your Balance
- No provider balance visible
- Message to contact admin for more coins

## Security Features

1. **Authorization**:
   - Only admin can access `/api/admin/allocate-coins`
   - Provider balance API only accessible by admin
   - Regular users cannot see or allocate coins

2. **Validation**:
   - Prevents negative transfers
   - Prevents over-allocation (checks admin balance)
   - Validates user IDs before transfer

3. **Transaction Safety**:
   - Transfers are atomic: both deduction and addition happen together
   - If transfer fails, no balances are changed

## Functions Added

### `lib/db.ts`
```typescript
transferCoins(fromUserId: string, toUserId: string, amount: number): Promise<boolean>
```
Transfers coins from one user to another.

### `lib/auth.ts`
```typescript
getAllUsersWithBalances(): Promise<(AuthUser & { balance: number })[]>
```
Gets all users with their coin balances (admin only).

## Migration Steps

If you're upgrading an existing system:

1. **Update Database Schema**:
   ```bash
   # Run the updated supabase-schema.sql
   # Or manually update existing balances if needed
   ```

2. **Set Admin Balance**:
   ```sql
   -- Give admin initial balance
   UPDATE coin_balances 
   SET coins = 10000.00 
   WHERE user_id = '00000000-0000-0000-0000-000000000001';
   ```

3. **Reset User Balances** (optional):
   ```sql
   -- Set all non-admin users to 0
   UPDATE coin_balances 
   SET coins = 0.00 
   WHERE user_id IN (
     SELECT id FROM users WHERE role != 'admin'
   );
   ```

## Best Practices

### For Administrators

1. **Monitor Your Balance**:
   - Keep track of how many coins you've allocated
   - Check provider balance regularly
   - Replenish your balance when low

2. **Allocate Responsibly**:
   - Only allocate what users need
   - Keep some balance for emergencies
   - Track allocations per user

3. **Set Reasonable Limits**:
   - Consider implementing daily/weekly allocation limits per user
   - Monitor user spending patterns
   - Adjust allocations based on usage

### For Users

1. **Budget Your Coins**:
   - Plan orders before placing them
   - Check service costs before ordering
   - Request more coins in advance if needed

2. **Contact Admin**:
   - Request coins before running out
   - Provide reason for allocation requests
   - Report any balance discrepancies

## Troubleshooting

### User Can't Place Orders
- **Check**: Does user have sufficient balance?
- **Solution**: Admin allocates more coins

### Admin Can't Allocate Coins
- **Check**: Does admin have sufficient balance?
- **Solution**: Admin needs to replenish their balance

### Balance Shows Wrong Amount
- **Check**: Refresh the page
- **Solution**: Click the "Refresh" button on balance page

### Provider Balance Not Showing
- **Check**: Is user logged in as admin?
- **Solution**: Only admins can see provider balance

## Future Enhancements

Possible improvements to consider:

1. **Transaction History**: Log all coin transfers and orders
2. **Balance Top-up**: Allow admin to add coins from provider balance
3. **User Notifications**: Notify users when they receive coins
4. **Allocation Requests**: Users can request coins through the UI
5. **Spending Limits**: Set maximum daily spending per user
6. **Reports**: Generate allocation and spending reports

## Summary

✅ **Admin Controls**: Full control over coin distribution  
✅ **User Isolation**: Users can only use allocated coins  
✅ **Transparency**: All balances visible and tracked  
✅ **Security**: Role-based access control  
✅ **Provider Balance**: Visible only to admin for reference  
✅ **Simple Workflow**: Easy allocation through UI  

This system ensures:
- Admin has complete control over coin distribution
- Users cannot spend beyond their allocation
- All transactions are tracked and accountable
- Clear separation between admin and user privileges

