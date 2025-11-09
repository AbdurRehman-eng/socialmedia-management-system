# Supabase Migration Guide

## ✅ Completed

1. ✅ Created Supabase client (`lib/supabase.ts`)
2. ✅ Created database schema SQL (`supabase-schema.sql`)
3. ✅ Created database service layer (`lib/db.ts`)
4. ✅ Updated `lib/coins.ts` to use async Supabase functions
5. ✅ Created `useCoinBalance` hook for React components
6. ✅ Updated `components/stat-cards.tsx`
7. ✅ Updated `app/service-list/page.tsx`
8. ✅ Created `.env.local` with Supabase credentials

## 🔄 Remaining Updates Needed

The following files need to be updated to use async Supabase functions:

### 1. `components/create-order-form.tsx`
- Update `calculateCost()` to be async
- Update `getCoinBalance()` calls to use hook or async function
- Update `deductCoins()` to be async
- Update order creation to save to Supabase

### 2. `app/balance/page.tsx`
- Use `useCoinBalance` hook
- Update all coin-related functions to async

### 3. `app/admin/page.tsx`
- Update all pricing rule functions to async
- Update settings functions to async

### 4. `app/my-orders/page.tsx`
- Replace localStorage with Supabase `getOrders()`
- Update order tracking to use Supabase

### 5. `components/dashboard-layout.tsx`
- Replace localStorage with Supabase `getOrders()`

## 📋 Database Setup Instructions

### Step 1: Run SQL Schema in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy and paste the contents of `supabase-schema.sql`
5. Click "Run" to execute the SQL

### Step 2: Verify Tables Created

You should see these tables:
- `users`
- `coin_balances`
- `pricing_rules`
- `orders`
- `settings`

### Step 3: Check Default Data

The schema creates:
- A default user (ID: `00000000-0000-0000-0000-000000000000`)
- Default coin balance (1000 coins)
- Default settings (markup: 1.2, coin rate: 1)

## 🔧 Environment Variables

Make sure `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=https://hizeqocdeenywbjgjvws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚠️ Important Notes

1. **All coin functions are now async** - Components must use `await` or hooks
2. **Default user ID** - Currently using a hardcoded default user. Replace with actual auth later
3. **Row Level Security (RLS)** - Consider enabling RLS in Supabase for production
4. **Error Handling** - All async functions should have try/catch blocks

## 🚀 Next Steps

1. Complete remaining component updates
2. Test all functionality
3. Add proper user authentication
4. Enable RLS policies in Supabase
5. Add error boundaries for better UX

