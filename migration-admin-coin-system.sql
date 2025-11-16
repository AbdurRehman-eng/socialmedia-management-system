-- Migration SQL for Admin-Controlled Coin Distribution System
-- Run this on your existing Supabase database to upgrade to the new system

-- ============================================================================
-- STEP 1: Update Admin's Balance
-- ============================================================================
-- Set admin account balance to 10,000 coins (or your desired amount)
-- This is the amount admin can allocate to users or use themselves

UPDATE coin_balances 
SET coins = 10000.00 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- If admin doesn't have a coin_balances record yet, create it
INSERT INTO coin_balances (user_id, coins) 
VALUES ('00000000-0000-0000-0000-000000000001', 10000.00)
ON CONFLICT (user_id) DO NOTHING;


-- ============================================================================
-- STEP 2: Reset All User Balances to 0 (OPTIONAL)
-- ============================================================================
-- IMPORTANT: Only run this if you want to reset all users to 0
-- If you want users to keep their existing balances, SKIP THIS STEP

-- Uncomment the following line to reset all non-admin users to 0:
-- UPDATE coin_balances SET coins = 0.00 WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');


-- ============================================================================
-- STEP 3: Update Default Balance for New Users
-- ============================================================================
-- This changes the default balance from 1000.00 to 0.00 for future users
-- Existing users are not affected by this change

ALTER TABLE coin_balances 
ALTER COLUMN coins SET DEFAULT 0.00;


-- ============================================================================
-- STEP 4: Ensure All Existing Users Have a Coin Balance Record
-- ============================================================================
-- Create coin_balances records for any users who don't have one yet
-- New users get 0.00, as they need admin to allocate coins

INSERT INTO coin_balances (user_id, coins)
SELECT u.id, 0.00
FROM users u
LEFT JOIN coin_balances cb ON u.user_id = cb.user_id
WHERE cb.user_id IS NULL
  AND u.role != 'admin';


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the migration worked correctly

-- Check admin's balance (should be 10000.00)
-- SELECT u.username, u.role, cb.coins 
-- FROM users u 
-- JOIN coin_balances cb ON u.id = cb.user_id 
-- WHERE u.role = 'admin';

-- Check all user balances
-- SELECT u.username, u.role, cb.coins 
-- FROM users u 
-- JOIN coin_balances cb ON u.id = cb.user_id 
-- ORDER BY u.role DESC, u.username;

-- Check total coins in system
-- SELECT 
--   SUM(CASE WHEN u.role = 'admin' THEN cb.coins ELSE 0 END) as admin_total,
--   SUM(CASE WHEN u.role = 'user' THEN cb.coins ELSE 0 END) as users_total,
--   SUM(cb.coins) as grand_total
-- FROM coin_balances cb
-- JOIN users u ON cb.user_id = u.id;


-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- If you need to undo the migration, uncomment and run these:

-- Restore default balance to 1000.00
-- ALTER TABLE coin_balances ALTER COLUMN coins SET DEFAULT 1000.00;

-- Restore admin balance to original (adjust as needed)
-- UPDATE coin_balances SET coins = 1000.00 WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Restore user balances to 1000.00 (adjust as needed)
-- UPDATE coin_balances SET coins = 1000.00 WHERE user_id IN (SELECT id FROM users WHERE role != 'admin');

