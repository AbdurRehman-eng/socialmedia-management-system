# Quick Supabase Setup Guide

## ⚠️ Error: Table 'coin_balances' not found

This error means the database tables haven't been created yet. Follow these steps:

## Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Run the Schema

1. Open the file `supabase-schema.sql` in your project
2. Copy **ALL** the contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

## Step 3: Verify Tables Created

After running the SQL, go to **Table Editor** in Supabase. You should see:
- ✅ `users`
- ✅ `coin_balances`
- ✅ `pricing_rules`
- ✅ `orders`
- ✅ `settings`

## Step 4: Check Default Data

The schema automatically creates:
- Default user (ID: `00000000-0000-0000-0000-000000000000`)
- Default coin balance (1000 coins)
- Default settings (markup: 1.2, coin rate: 1)

## Step 5: Refresh Your App

After running the SQL:
1. Refresh your browser
2. The error should be gone
3. You should see 1000 coins in your balance

## Troubleshooting

### If you get permission errors:
- Make sure you're using the SQL Editor (not trying to create tables manually)
- The SQL includes all necessary permissions

### If tables still don't appear:
- Check the SQL Editor for any error messages
- Make sure you copied the ENTIRE file
- Try running sections one at a time if needed

### If you see duplicate key errors:
- That's okay! It means the data already exists
- The SQL uses `ON CONFLICT DO NOTHING` to handle this

## Need Help?

If you're still having issues:
1. Check the Supabase SQL Editor for error messages
2. Make sure your Supabase project is active
3. Verify your environment variables are set correctly

