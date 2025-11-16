# USD to PHP Rate Configuration

## Overview

The admin can now **configure the USD to PHP conversion rate** directly from the admin dashboard. This rate is used to convert the provider's balance (in USD) to allocatable coins (in PHP).

## How It Works

### 1. Configurable Setting

The conversion rate is stored in the database and can be changed anytime by the admin:

```
Database: settings table
Key: usd_to_php_rate
Default Value: 50
```

### 2. Admin UI Location

**Admin Dashboard** (`/admin`) → **Global Settings** section → **USD to PHP Rate**

### 3. Usage in Conversion

When syncing provider balance:

```
Provider Balance (USD) × USD to PHP Rate = Admin Coins (PHP)

Example with rate = 50:
$100.84 × 50 = ₱5,042.00

Example with rate = 55:
$100.84 × 55 = ₱5,546.20
```

## Admin Dashboard UI

### Location

The setting appears in the **Global Settings** card with three fields:

1. **Default Markup** - Service pricing multiplier
2. **Coin to PHP Rate** - Internal coin system
3. **USD to PHP Rate** - Provider balance conversion ⭐ **NEW**

### UI Components

```
┌─────────────────────────────────────────────┐
│  Global Settings                            │
├─────────────────────────────────────────────┤
│                                             │
│  USD to PHP Rate                            │
│  Provider balance conversion.               │
│  Example: 50 = $1 USD = ₱50                 │
│                                             │
│  [        50         ] [Save]               │
│                                             │
└─────────────────────────────────────────────┘
```

**Features:**
- ✅ Number input field
- ✅ Editable by admin
- ✅ Saves to database
- ✅ Updates immediately on sync
- ✅ Used in all balance conversions

### Balance Cards Display

The rate is also shown in the **Conversion Info** card (top right):

```
┌─────────────────────────┐
│  💱 Conversion Rate     │
├─────────────────────────┤
│  1 USD = 50 PHP         │  ← Shows current rate
│                         │
│  $100.84 × 50          │  ← Shows calculation
│  = ₱5,042.00 coins     │
│                         │
│  [Sync from Provider]   │
└─────────────────────────┘
```

## API Endpoints

### Get Current Rate

```http
GET /api/admin/settings/usd-to-php-rate
Authorization: Admin session required

Response:
{
  "success": true,
  "rate": 50
}
```

### Set New Rate

```http
POST /api/admin/settings/usd-to-php-rate
Authorization: Admin session required
Content-Type: application/json

Body:
{
  "rate": 55
}

Response:
{
  "success": true,
  "rate": 55,
  "message": "USD to PHP rate updated to 55"
}
```

## Step-by-Step Usage

### Changing the Rate

1. **Login as admin** → Go to `/admin`
2. **Scroll to "Global Settings"** section
3. **Find "USD to PHP Rate"** field
4. **Enter new rate** (e.g., 55 for ₱55 per $1)
5. **Click "Save"** button
6. **See success message**: "USD to PHP rate saved!"

### Viewing the Effect

1. **Check Conversion Info card** (top right)
   - Should show new rate: "1 USD = 55 PHP"
2. **Click "Sync from Provider"**
   - Fetches provider balance
   - Converts using new rate
   - Updates admin coins

### Example Scenario

**Before Change:**
```
Rate: 50
Provider: $100.84 USD
Admin Coins: ₱5,042.00
```

**Admin Changes Rate to 55:**
```
1. Go to Global Settings
2. Change "50" to "55"
3. Click Save
4. Rate updated in database
```

**After Sync:**
```
Rate: 55
Provider: $100.84 USD
Admin Coins: ₱5,546.20  (increased!)
Difference: +₱504.20 more coins
```

## Why Adjust the Rate?

### 1. **Real Exchange Rate Changes**
- PHP exchange rate fluctuates
- Update to match current market rate
- Example: If PHP strengthens, adjust rate down

### 2. **Business Strategy**
- Increase rate = More coins per dollar
- Good when you want more allocatable balance
- Helps with user onboarding

### 3. **Profit Margins**
- Higher rate = More coins to allocate
- Can offer better deals to users
- Balances cost vs. competitiveness

### 4. **Market Positioning**
- Match competitor rates
- Adjust based on service costs
- Optimize for your business model

## Examples by Rate

### Conservative Rate (1:45)
```
Provider: $100 USD
Admin Coins: ₱4,500
Effect: Lower coin balance, higher profit margin per coin
```

### Standard Rate (1:50) - Default
```
Provider: $100 USD
Admin Coins: ₱5,000
Effect: Balanced conversion, standard pricing
```

### Generous Rate (1:55)
```
Provider: $100 USD
Admin Coins: ₱5,500
Effect: Higher coin balance, more to allocate
```

### Very Generous Rate (1:60)
```
Provider: $100 USD
Admin Coins: ₱6,000
Effect: Maximum coins, competitive pricing
```

## Database

### View Current Rate

```sql
SELECT * FROM settings WHERE key = 'usd_to_php_rate';

-- Expected output:
-- key              | value
-- usd_to_php_rate  | 50
```

### Update Rate (Database Direct)

```sql
-- Set to 55
UPDATE settings 
SET value = '55' 
WHERE key = 'usd_to_php_rate';

-- Or use UPSERT
INSERT INTO settings (key, value) 
VALUES ('usd_to_php_rate', '55')
ON CONFLICT (key) DO UPDATE SET value = '55';
```

### Check Rate History

```sql
-- If you track updates (recommended for future):
SELECT key, value, updated_at 
FROM settings 
WHERE key = 'usd_to_php_rate'
ORDER BY updated_at DESC;
```

## Best Practices

### 1. **Check Rate Regularly**
- Review monthly
- Compare to actual PHP/USD exchange rate
- Adjust as needed

### 2. **Document Changes**
- Keep log of rate changes
- Note reason for adjustment
- Track impact on business

### 3. **Test Before Major Changes**
- Calculate impact first
- Example: $1000 provider balance at different rates
- Ensure it makes business sense

### 4. **Communicate to Users**
- If rate affects user pricing, notify them
- Explain rate adjustments
- Maintain transparency

### 5. **Monitor After Changes**
- Check allocation patterns
- Verify coin calculations
- Ensure system works correctly

## Troubleshooting

### Rate Not Saving
**Check:**
- Are you logged in as admin?
- Is the value a positive number?
- Check browser console for errors

**Solution:**
- Refresh page and try again
- Check database connection
- Verify admin permissions

### Rate Not Updating in Sync
**Issue:** Old rate still used after change

**Solution:**
1. Save the new rate
2. Click "Sync from Provider" again
3. Rate should update automatically

### Coins Seem Wrong After Rate Change
**This is expected!**

The new rate only applies to **new syncs**. To update:
1. Change the rate
2. Click "Sync from Provider"
3. Admin coins recalculate using new rate

### Need to Revert Rate
**Quick Fix:**
1. Go to Global Settings
2. Enter previous rate value
3. Click Save
4. Sync from provider

**Or via Database:**
```sql
UPDATE settings 
SET value = '50'  -- Previous value
WHERE key = 'usd_to_php_rate';
```

## Security

- ✅ **Admin-only access** - Regular users cannot see or change this
- ✅ **Validation** - Only positive numbers accepted
- ✅ **Database storage** - Persists across sessions
- ✅ **Session required** - Must be logged in as admin
- ✅ **Audit trail** - Changes logged (via updated_at)

## Integration with System

### 1. Provider Balance Sync
Uses this rate to convert USD → PHP coins

### 2. Balance Display
Shows rate in Conversion Info card

### 3. Coin Allocation
Admin allocates coins based on synced balance (which uses this rate)

### 4. User Orders
Users spend coins that were allocated from converted balance

## Summary

✅ **Configurable** - Admin can change anytime  
✅ **Simple UI** - Easy to understand and use  
✅ **Immediate Effect** - Updates on next sync  
✅ **Database Stored** - Persists forever  
✅ **Transparent** - Shows in UI and calculations  
✅ **Flexible** - Adjust for any business need  

**Result:** Complete control over how provider balance converts to allocatable coins! 💰

