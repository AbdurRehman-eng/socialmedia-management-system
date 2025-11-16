# Provider Balance Sync System

## Overview

The SMM panel now syncs the admin's allocatable coins **directly from the SMM provider's real balance**. This ensures that the admin can only allocate what they actually have available with the provider.

## How It Works

### 1. Provider Balance API

The system fetches the real-time balance from your SMM provider:

```
POST https://viieagency.com/api/v2
Parameters:
  - key: your_api_key
  - action: balance

Response:
{
  "balance": "100.84292",
  "currency": "USD"
}
```

### 2. Currency Conversion

The provider balance (in USD) is converted to coins (PHP):

```
Conversion Formula:
Provider Balance (USD) × USD_to_PHP_Rate = Admin Coins (PHP)

Example:
$100.84 USD × 50 PHP = ₱5,042.00 coins
```

**Default Conversion Rate**: 1 USD = 50 PHP

### 3. Admin Balance Update

When you click "Sync from Provider", the system:
1. Fetches your provider balance via API
2. Converts USD to PHP using the conversion rate
3. Updates your admin coin balance in the database
4. Displays both balances on the admin dashboard

### 4. Coin Allocation

Admin can now allocate coins to users:
- Maximum allocation = Current admin coin balance
- When you allocate ₱200 to a user:
  - Your balance: ₱5,042 → ₱4,842
  - User's balance: ₱0 → ₱200

## Admin Dashboard

The admin dashboard now shows three key metrics at the top:

### Card 1: Provider Balance (Blue)
- **Shows**: Real balance from SMM provider
- **Currency**: USD (from provider)
- **Example**: USD $100.84
- **Update**: Click the refresh icon or "Sync from Provider" button

### Card 2: Your Allocatable Coins (Green)
- **Shows**: Your current coin balance in PHP
- **Currency**: PHP (coins)
- **Example**: ₱5,042.00
- **Use**: This is what you can allocate to users or use for orders

### Card 3: Conversion Info (White)
- **Shows**: Current USD to PHP conversion rate
- **Example**: 1 USD = 50 PHP
- **Calculation**: Shows how provider balance converts to coins
- **Action**: "Sync from Provider" button to update everything

## Complete Flow Example

### Initial State
```
Provider Balance: $100.84 USD
Conversion Rate: 1 USD = 50 PHP
Admin Coins: Not synced yet
```

### After First Sync
```
Provider Balance: $100.84 USD
Admin Coins: ₱5,042.00
Calculation: $100.84 × 50 = ₱5,042.00
```

### Admin Allocates ₱200 to User1
```
Admin: ₱5,042.00 → ₱4,842.00
User1: ₱0.00 → ₱200.00
```

### User1 Places Order (₱50)
```
Admin: ₱4,842.00 (unchanged)
User1: ₱200.00 → ₱150.00
```

### Admin Uses ₱100 for Own Order
```
Admin: ₱4,842.00 → ₱4,742.00
Provider: $100.84 → $98.84 (actual cost deducted by provider)
```

### Sync Again to Reflect Provider Changes
```
Click "Sync from Provider"
Provider Balance: $98.84 USD (updated from provider)
Admin Coins: ₱4,942.00 (recalculated: $98.84 × 50)
```

## API Endpoint

### `GET /api/admin/sync-provider-balance`

**Authentication**: Admin only

**Response**:
```json
{
  "success": true,
  "providerBalance": {
    "amount": 100.84292,
    "currency": "USD"
  },
  "conversionRate": 50,
  "adminCoins": 5042.146,
  "message": "Synced: $100.84 USD → ₱5,042.15 coins (rate: 1 USD = 50 PHP)"
}
```

**Error Response**:
```json
{
  "error": "Failed to fetch provider balance"
}
```

## Configuration

### USD to PHP Conversion Rate

The conversion rate is stored in the database settings table:

```sql
-- View current rate
SELECT * FROM settings WHERE key = 'usd_to_php_rate';

-- Update rate (e.g., to 55 PHP per USD)
INSERT INTO settings (key, value) 
VALUES ('usd_to_php_rate', '55')
ON CONFLICT (key) DO UPDATE SET value = '55';
```

**Default**: 50 PHP per 1 USD

### Provider API Configuration

Located in `app/api/admin/sync-provider-balance/route.ts`:

```typescript
const PROVIDER_URL = "https://viieagency.com/api/v2"
const API_KEY = "your_api_key_here"
```

## Important Notes

### 1. Balance Accuracy
- Provider balance is the **source of truth**
- Always sync before making large allocations
- Sync regularly to track actual provider balance changes

### 2. Currency Differences
- **Provider**: Uses USD
- **Your System**: Uses PHP (coins)
- Conversion rate can be adjusted based on current exchange rates

### 3. Allocation Limits
- You can only allocate up to your current admin coin balance
- System prevents over-allocation automatically
- Sync from provider to refresh your available balance

### 4. When to Sync
- **Before allocating**: Check your current available balance
- **After orders**: See how much was actually spent
- **Regularly**: Keep balances in sync
- **If numbers look wrong**: Sync to get fresh data

## Advantages

✅ **Real-Time Accuracy**: Always know your actual provider balance  
✅ **Prevents Over-Allocation**: Can't allocate more than you have  
✅ **Transparent**: Shows both USD and PHP amounts  
✅ **Flexible**: Conversion rate is configurable  
✅ **Simple**: One-click sync updates everything  

## Workflow

### Daily Admin Tasks

1. **Morning**: Sync balance to see available coins
2. **When user requests coins**: Check balance → Allocate
3. **After allocating**: Balance automatically updated
4. **End of day**: Sync to see actual provider balance
5. **Regular maintenance**: Keep conversion rate up to date

### User Experience

1. **User**: Requests ₱500 from admin
2. **Admin**: Opens User Management → Clicks "Allocate" → Enters 500
3. **System**: Checks admin has ₱500 → Transfers coins
4. **User**: Sees ₱500 in their balance → Can place orders
5. **System**: Tracks all spending and balances

## Troubleshooting

### Balance Shows 0 After Sync
**Possible Causes**:
- Provider API is down
- API key is invalid
- Provider balance is actually $0

**Solution**: Check provider dashboard directly

### Conversion Seems Wrong
**Check**:
- Current USD to PHP exchange rate
- Your configured conversion rate in settings
- Provider balance currency (should be USD)

**Fix**: Update conversion rate in database

### Can't Sync Balance
**Check**:
- Are you logged in as admin?
- Is provider API accessible?
- Check browser console for errors

**Solution**: Try again or check API configuration

### Allocated More Than Provider Balance
**This shouldn't happen** - System prevents this

If it does:
1. Sync from provider immediately
2. Review recent allocations
3. Check if multiple admins are allocating simultaneously

## Best Practices

1. **Sync Regularly**: At least daily or before major allocations
2. **Monitor Conversion Rate**: Update when PHP exchange rate changes significantly
3. **Track Allocations**: Keep records of who gets what
4. **Set Limits**: Consider user spending limits
5. **Reserve Buffer**: Keep some coins unallocated for emergencies

## Future Enhancements

Possible improvements:

- [ ] Auto-sync on a schedule (hourly/daily)
- [ ] Configurable conversion rate in UI (not just database)
- [ ] Transaction history showing all syncs
- [ ] Alert when provider balance is low
- [ ] Multiple currency support
- [ ] Allocation approval workflow

## Summary

The Provider Balance Sync system ensures:
- **Admin's coin balance = Real provider balance (converted to PHP)**
- **One-click sync** keeps everything up to date
- **Prevents over-allocation** automatically
- **Clear visibility** of both USD and PHP amounts
- **Simple management** of user coin allocations

This creates a **transparent, accurate, and reliable** coin distribution system tied directly to your real provider balance.

