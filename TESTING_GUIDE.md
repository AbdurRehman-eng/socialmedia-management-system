# Testing Guide for SMM Reseller Platform

## 🚀 Quick Start

### 1. Start the Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

The app will be available at: **http://localhost:3000**

---

## 📋 Testing Checklist

### ✅ 1. Admin Panel Setup (Start Here!)

**Navigate to:** `/admin`

**Test Steps:**
1. ✅ Set Default Markup
   - Change default markup to `1.2` (20% markup)
   - Click "Save"
   - Should see success toast

2. ✅ Set Coin to USD Rate
   - Set rate to `1` (1 coin = 1 USD)
   - Click "Save"
   - Should see success toast

3. ✅ Set Service-Specific Pricing
   - Search for a service (e.g., "YouTube")
   - Click "Set Price" on a service
   - Enter markup (e.g., `1.5` for 50% markup) OR
   - Enter custom price (e.g., `100` coins)
   - Click "Save"
   - Should see pricing rule applied

4. ✅ Delete Pricing Rule
   - Click trash icon on a service with pricing
   - Rule should be removed

---

### ✅ 2. Service List Page

**Navigate to:** `/service-list`

**Test Steps:**
1. ✅ View Services
   - Should see all services grouped by category
   - Each service shows **coin price** (not USD)
   - Provider price shown in small text below

2. ✅ Check Pricing
   - Services with custom pricing show your coin price
   - Services without custom pricing use default markup
   - Example: If provider charges $1, with 20% markup = 1.2 coins

3. ✅ Order Now Button
   - Click "Order Now" on any service
   - Should redirect to `/new-order` with service preselected

---

### ✅ 3. Create Order

**Navigate to:** `/new-order` or click "Order Now" from service list

**Test Steps:**
1. ✅ Service Selection
   - If coming from service list, service should be preselected
   - Otherwise, select category → select service
   - Should see min/max quantities

2. ✅ Cost Calculation
   - Enter quantity (within min/max range)
   - Should see cost in **coins** (not USD)
   - Cost = (Provider price × Markup) × Quantity × Coin rate

3. ✅ Balance Check
   - Should see current coin balance below cost
   - Default balance: 1000 coins

4. ✅ Create Order (Test with small quantity first!)
   - Enter valid URL (e.g., `https://youtube.com/watch?v=test`)
   - Enter quantity (start with minimum to test)
   - Click "Submit Order"
   - Should see:
     - Success toast with order ID
     - Coins deducted from balance
     - Form reset

5. ✅ Insufficient Balance Test
   - If balance is low, try ordering more than you have
   - Should see error: "Insufficient coins"

---

### ✅ 4. Balance Page

**Navigate to:** `/balance`

**Test Steps:**
1. ✅ View Coin Balance
   - Should see current coin balance
   - Should see USD equivalent
   - Default: 1000 coins

2. ✅ View Provider Balance
   - Should see backend API balance (USD)
   - This is the actual balance with the SMM provider

3. ✅ Refresh
   - Click "Refresh" button
   - Should update both balances

---

### ✅ 5. My Orders Page

**Navigate to:** `/my-orders`

**Test Steps:**
1. ✅ View Orders
   - Should see orders created from order form
   - Orders automatically saved when created

2. ✅ Add Order ID Manually
   - Click "Add Order ID"
   - Enter an order ID (from API response)
   - Click "Add"
   - Order should appear in list

3. ✅ Check Order Status
   - Orders show status (Pending, In progress, Completed, etc.)
   - Status fetched from API

4. ✅ Refresh Orders
   - Click "Refresh" button
   - Should update all order statuses

---

### ✅ 6. Dashboard

**Navigate to:** `/dashboard` or `/`

**Test Steps:**
1. ✅ View Stats
   - Total Orders
   - Active Orders
   - Completed Orders
   - **Coin Balance** (not USD)

2. ✅ Create Order from Dashboard
   - Use the order form on dashboard
   - Should work same as `/new-order`

3. ✅ View Recent Orders
   - Should see last 3 orders in sidebar
   - Click to see full order table

---

## 🧪 Advanced Testing Scenarios

### Scenario 1: Test Markup System

1. Go to Admin Panel
2. Set default markup to `2.0` (100% markup)
3. Go to Service List
4. Check prices - should be double the provider price
5. Set specific service markup to `1.5` (50% markup)
6. That service should show 1.5x price, others still 2.0x

### Scenario 2: Test Custom Pricing

1. Go to Admin Panel
2. Find a service
3. Set custom price to `50` coins (ignore provider price)
4. Go to Service List
5. That service should show exactly 50 coins regardless of provider price

### Scenario 3: Test Coin Deduction

1. Check balance (should be 1000 coins)
2. Create an order costing 100 coins
3. Check balance again (should be 900 coins)
4. Create another order
5. Balance should decrease accordingly

### Scenario 4: Test Order Flow

1. Create order → Get order ID
2. Go to My Orders → Should see order
3. Click Refresh → Status should update
4. Check Dashboard → Stats should update

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to load services"
- **Solution**: Check API key in `lib/api.ts`
- **Solution**: Check internet connection
- **Solution**: API might be temporarily down

### Issue: "Insufficient coins"
- **Solution**: Add more coins (currently manual in localStorage)
- **Solution**: Check balance in `/balance` page
- **Solution**: Default is 1000 coins - create smaller orders

### Issue: Orders not showing
- **Solution**: Orders are saved to localStorage
- **Solution**: Check browser console for errors
- **Solution**: Make sure order was created successfully

### Issue: Prices showing as 0 or NaN
- **Solution**: Make sure default markup is set in Admin Panel
- **Solution**: Check coin rate is set (default: 1)
- **Solution**: Refresh the page

---

## 📊 Testing Data

### Default Values:
- **Starting Coin Balance**: 1000 coins
- **Default Markup**: 1.2 (20% markup)
- **Coin to USD Rate**: 1 (1 coin = 1 USD)
- **Provider Balance**: ~$41 USD (from API)

### Test Order Example:
- **Service**: Any YouTube service
- **Provider Price**: $1.205/unit
- **With 20% markup**: 1.446 coins/unit
- **Quantity**: 100 units
- **Total Cost**: 144.6 coins

---

## 🔍 Browser DevTools Testing

### Check localStorage:
```javascript
// In browser console
localStorage.getItem('smm_coin_balance')
localStorage.getItem('smm_pricing_rules')
localStorage.getItem('smm_order_ids')
localStorage.getItem('smm_default_markup')
localStorage.getItem('smm_coin_to_usd_rate')
```

### Manually Add Coins:
```javascript
// In browser console
const balance = JSON.parse(localStorage.getItem('smm_coin_balance') || '{"coins":1000}')
balance.coins += 1000
localStorage.setItem('smm_coin_balance', JSON.stringify(balance))
location.reload()
```

### Clear All Data:
```javascript
// In browser console
localStorage.removeItem('smm_coin_balance')
localStorage.removeItem('smm_pricing_rules')
localStorage.removeItem('smm_order_ids')
localStorage.removeItem('smm_default_markup')
localStorage.removeItem('smm_coin_to_usd_rate')
location.reload()
```

---

## ✅ Expected Results

After testing, you should see:
- ✅ Services showing coin prices (not USD)
- ✅ Orders deducting coins correctly
- ✅ Balance decreasing with each order
- ✅ Admin panel controlling prices
- ✅ Order tracking working
- ✅ All pages functional

---

## 🎯 Quick Test Flow

1. **Admin Panel** → Set markup to 1.2, save
2. **Service List** → Check prices show in coins
3. **New Order** → Create small test order (min quantity)
4. **Balance** → Verify coins deducted
5. **My Orders** → Verify order appears
6. **Dashboard** → Check stats updated

---

## 📝 Notes

- All data is stored in **localStorage** (browser storage)
- Data persists between page refreshes
- Data is **per browser** (not synced across devices)
- For production, you'll need a database

---

Happy Testing! 🚀

