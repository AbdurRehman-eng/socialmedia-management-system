/**
 * Script to create the first admin user
 * 
 * Usage:
 * 1. Update the credentials below
 * 2. Run: npx tsx scripts/create-admin.ts
 * 
 * Note: You may need to install tsx: npm install -D tsx
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Simple password hashing (same as in lib/auth.ts)
// For production, use bcrypt
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64')
}

async function createAdminUser() {
  // Change these credentials!
  const adminData = {
    email: 'admin@smmpanel.com',
    username: 'admin',
    password: 'admin123', // CHANGE THIS!
    role: 'admin'
  }

  console.log('Creating admin user...')
  console.log('Username:', adminData.username)
  console.log('Email:', adminData.email)
  
  const passwordHash = hashPassword(adminData.password)

  try {
    // Check if admin already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', adminData.username)
      .maybeSingle()

    if (existingUser) {
      console.log('❌ Admin user already exists!')
      console.log('If you need to reset the password, delete the user from the database first.')
      process.exit(1)
    }

    // Create admin user
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: adminData.email,
        username: adminData.username,
        password_hash: passwordHash,
        role: adminData.role,
      })
      .select('id')
      .single()

    if (error) {
      console.error('❌ Error creating admin user:', error.message)
      process.exit(1)
    }

    console.log('✅ Admin user created successfully!')
    console.log('User ID:', data.id)
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!')
    console.log('\nYou can now login at: /admin/login')
    console.log('Username:', adminData.username)
    console.log('Password:', adminData.password)
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
  }
}

createAdminUser()

