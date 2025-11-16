-- ============================================================================
-- QUICK MIGRATION - Essential Updates Only
-- ============================================================================

-- 1. Set admin's balance to 10,000 (adjust amount as needed)
UPDATE coin_balances 
SET coins = 10000.00 
WHERE user_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1);

-- 2. Reset all regular users to 0 balance (OPTIONAL - comment out if you want users to keep their balance)
UPDATE coin_balances 
SET coins = 0.00 
WHERE user_id IN (SELECT id FROM users WHERE role = 'user');

-- 3. Change default balance for new users from 1000 to 0
ALTER TABLE coin_balances 
ALTER COLUMN coins SET DEFAULT 0.00;

-- 4. Add global settings with defaults
INSERT INTO settings (key, value) 
VALUES 
  ('usd_to_php_rate', '50'),
  ('default_markup', '1.5'),
  ('coin_to_usd_rate', '1')
ON CONFLICT (key) DO NOTHING;

-- DONE! Your system is now ready for admin-controlled coin distribution.

