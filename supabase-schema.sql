-- SMM Reseller Platform Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with authentication support
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coin balances table (one per user)
CREATE TABLE IF NOT EXISTS coin_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coins DECIMAL(15, 2) DEFAULT 1000.00 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Pricing rules table (service-specific pricing)
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id INTEGER NOT NULL,
  markup DECIMAL(10, 4),
  custom_price DECIMAL(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id)
);

-- Orders table (track all orders)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  service_name TEXT,
  link TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cost_coins DECIMAL(15, 2) NOT NULL,
  status TEXT,
  charge TEXT,
  start_count TEXT,
  remains TEXT,
  currency TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table (global settings like default markup, coin rate)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coin_balances_user_id ON coin_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_service_id ON pricing_rules(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coin_balances_updated_at BEFORE UPDATE ON coin_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
  ('default_markup', '1.5'),
  ('coin_to_usd_rate', '1')
ON CONFLICT (key) DO NOTHING;

-- Create default admin user (password: admin123)
-- Password hash is bcrypt hash of 'admin123'
-- IMPORTANT: Change this password after first login!
INSERT INTO users (id, email, username, password_hash, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@smmpanel.com', 'admin', '$2a$10$rKJ5VqLhXJZ5ZqZqZqZqZuHjFzYzKzXzXzXzXzXzXzXzXzXzXzXzX', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Note: In production, you should create the admin user through the application
-- with a properly hashed password. The above is just a placeholder.

