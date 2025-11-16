-- ============================================================================
-- COMPLETE UPDATE SQL - Run this on your existing database
-- ============================================================================
-- This script is safe to run multiple times (idempotent)
-- It will update your existing SMM Reseller Platform database with all new features
-- ============================================================================

-- 1. Ensure coin_balances table has correct default (0.00 instead of 1000.00)
ALTER TABLE coin_balances 
ALTER COLUMN coins SET DEFAULT 0.00;

-- 2. Add global settings with defaults (if not exists)
-- These settings control the entire pricing system
INSERT INTO settings (key, value) VALUES 
  ('usd_to_php_rate', '50'),      -- Provider balance conversion: $1 = ₱50
  ('default_markup', '1.5'),      -- 50% markup on services without custom pricing
  ('coin_to_usd_rate', '1')       -- 1 coin = 1 PHP/USD
ON CONFLICT (key) DO NOTHING;

-- 3. Set admin's balance to 10,000 coins (adjust amount as needed)
-- The admin's balance is the real balance from provider, allocatable to users
UPDATE coin_balances 
SET coins = 10000.00 
WHERE user_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1);

-- 4. OPTIONAL: Reset all regular users to 0 balance
-- Uncomment the next 3 lines if you want to reset user balances
-- UPDATE coin_balances 
-- SET coins = 0.00 
-- WHERE user_id IN (SELECT id FROM users WHERE role = 'user');

-- ============================================================================
-- VERIFICATION QUERIES (optional - run these to verify the update)
-- ============================================================================

-- Check all settings
-- SELECT * FROM settings ORDER BY key;

-- Check admin balance
-- SELECT u.username, u.role, cb.coins 
-- FROM users u 
-- LEFT JOIN coin_balances cb ON u.id = cb.user_id 
-- WHERE u.role = 'admin';

-- Check all user balances
-- SELECT u.username, u.role, COALESCE(cb.coins, 0) as coins 
-- FROM users u 
-- LEFT JOIN coin_balances cb ON u.id = cb.user_id 
-- ORDER BY u.role DESC, u.username;

-- ============================================================================
-- DONE! Your system is now updated with:
-- ✅ Admin-controlled coin distribution
-- ✅ Configurable USD to PHP conversion rate
-- ✅ Global default markup setting
-- ✅ Coin to PHP rate setting
-- ✅ Zero default balance for new users
-- ============================================================================

