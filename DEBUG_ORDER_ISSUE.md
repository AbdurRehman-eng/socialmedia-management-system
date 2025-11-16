# Debugging Order Creation: "Quantity less than minimal" Error

## Current Issue
Getting error: `"Quantity less than minimal 50"` even when entering quantity 50.

## API Documentation Compliance Checklist

### ✅ API Requirements (from viieagency.com/api/v2)
- [x] HTTP Method: POST
- [x] Content-Type: application/x-www-form-urlencoded
- [x] Required params: key, action, service, link, quantity
- [x] Quantity sent as string/number

### 🔍 Debugging Steps

#### 1. Check Server Logs
When creating an order, check for these logs:
```
[API /api/smm] Request params: {action: 'add', service: 21441, link: '...', quantity: 50}
[API /api/smm] Params types: action: string, service: number, link: string, quantity: number
[API /api/smm] FormData being sent: key=xxx&action=add&service=21441&link=xxx&quantity=50
[API /api/smm] FormData entries: [["key","xxx"],["action","add"],...]
```

#### 2. Verify Service Minimum from Provider
To check the ACTUAL minimum from the provider:

**Option A: Use Debug API**
```
GET /api/debug/service?id=21441
```

**Option B: Direct Provider Check**
```bash
curl -X POST https://viieagency.com/api/v2 \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "key=610aa8dc01d8e335e4651157209de139&action=services"
```
Then search the response for service ID 21441 to see its current `min` value.

#### 3. Common Issues & Solutions

**Issue: Cached service data is outdated**
- Solution: Refresh the page to fetch latest services
- The provider's minimum might have changed from 50 to something else

**Issue: Minimum is exclusive (> 50) not inclusive (>= 50)**
- Solution: Try entering 51 instead of 50
- Some APIs require quantity to be GREATER than minimum, not equal

**Issue: Decimal values**
- Solution: Code now ensures integers using `Math.floor()`
- Provider expects whole numbers

**Issue: Wrong service selected**
- Solution: Check service ID in dropdown - now shows `[Min: X]`
- Verify you're using the correct service

### 📊 Enhanced Logging Added

1. **Client Side (Browser Console)**
   - Quantity value and type
   - Service min/max and their types
   - Order params before sending

2. **Server Side (Console/Logs)**
   - All parameter types
   - Exact FormData string
   - FormData as array for inspection
   - Provider's exact response

### 🎯 Next Steps to Diagnose

1. Create an order with quantity 50
2. Open browser DevTools Console (F12)
3. Check Network tab → Look for `/api/smm` request
4. Check Console tab → Look for all `[API /api/smm]` logs
5. Compare what's being sent vs what the service minimum actually is

### 💡 Quick Test

If service minimum is truly 50, try these quantities:
- 50 → Should fail if minimum is exclusive
- 51 → Should succeed if minimum is exclusive
- 100 → Should definitely succeed if min is 50

This will tell us if the issue is:
- A) Minimum has changed on provider side
- B) Minimum is exclusive (must be > 50, not >= 50)
- C) Something else in the request format

