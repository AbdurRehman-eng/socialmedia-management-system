# Supabase Setup Instructions

## ✅ What's Been Done

1. ✅ Supabase client created (`lib/supabase.ts`)
2. ✅ Database schema SQL file (`supabase-schema.sql`)
3. ✅ Database service layer (`lib/db.ts`)
4. ✅ Updated `lib/coins.ts` to use async Supabase
5. ✅ Created `useCoinBalance` hook
6. ✅ Updated components: stat-cards, service-list, create-order-form, balance
7. ✅ Created `.env.local` with credentials

## 🚀 Setup Steps

### Step 1: Run Database Schema

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase-schema.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl+Enter)

### Step 2: Verify Tables

After running the SQL, you should see these tables in the **Table Editor**:
- ✅ `users`
- ✅ `coin_balances`
- ✅ `pricing_rules`
- ✅ `orders`
- ✅ `settings`

### Step 3: Check Default Data

The schema automatically creates:
- Default user (ID: `00000000-0000-0000-0000-000000000000`)
- Default coin balance (1000 coins)
- Default settings (markup: 1.2, coin rate: 1)

### Step 4: Test the App

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Check balance page - should show 1000 coins
4. Create a test order
5. Check orders page - order should appear

## 📝 Remaining Updates

These files still need updates to fully use Supabase:

### `app/my-orders/page.tsx`
- Replace `getStoredOrderIds()` with `db.getOrderIds()`
- Replace `saveOrderId()` with `db.createOrder()`
- Use `db.getOrders()` instead of fetching statuses separately

### `app/admin/page.tsx`
- Update all pricing rule functions to async
- Update settings functions to async

### `components/dashboard-layout.tsx`
- Replace localStorage with `db.getOrders()`

## 🔧 Environment Variables

Make sure `.env.local` exists with:
```
NEXT_PUBLIC_SUPABASE_URL=https://hizeqocdeenywbjgjvws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚠️ Important Notes

1. **All coin functions are now async** - Use `await` or hooks
2. **Default user** - Currently using hardcoded user ID. Replace with auth later
3. **RLS Policies** - Consider enabling Row Level Security for production
4. **Error Handling** - All async operations should have try/catch

## 🎯 Next Steps

1. Complete remaining component updates
2. Test all functionality
3. Add user authentication
4. Enable RLS policies
5. Add error boundaries

