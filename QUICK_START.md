# Quick Start Guide - Authentication System

## 🚀 Getting Started in 5 Minutes

### Step 1: Update Database Schema
Run the `supabase-schema.sql` file in your Supabase SQL editor to create the authentication tables.

### Step 2: Create First Admin User

**Option A - Using the Script (Recommended)**
```bash
# Install tsx if you don't have it
npm install -D tsx

# Run the admin creation script
npx tsx scripts/create-admin.ts
```

**Option B - Manual Database Insert**
```sql
-- Password for 'admin123' encoded in base64
INSERT INTO users (email, username, password_hash, role) 
VALUES (
  'admin@smmpanel.com', 
  'admin', 
  'YWRtaW4xMjM=',  -- This is 'admin123' in base64
  'admin'
);
```

### Step 3: Login as Admin
1. Navigate to `http://localhost:3000/admin/login`
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. You'll be redirected to the admin panel

### Step 4: Create Your First User
1. In the admin panel, click "Create User"
2. Fill in the form:
   - Email: `user@example.com`
   - Username: `testuser`
   - Password: `password123`
3. Click "Create User"

### Step 5: Test User Login
1. Logout from admin panel
2. Navigate to `http://localhost:3000/login`
3. Enter user credentials:
   - Username: `testuser`
   - Password: `password123`
4. You'll be redirected to the user dashboard

## 🎯 Key URLs

- **User Login**: `/login`
- **Admin Login**: `/admin/login`
- **Admin Panel (User Management)**: `/admin/users`
- **Admin Panel (Pricing)**: `/admin`
- **User Dashboard**: `/dashboard`

## 🔐 Default Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Change these credentials immediately after first login!

## 📋 What's Included

✅ Secure authentication with session management
✅ Role-based access control (Admin/User)
✅ Protected routes with automatic redirects
✅ Admin panel for user management
✅ Separate login pages for admin and users
✅ User creation and management
✅ Account activation/deactivation
✅ Logout functionality

## 🛠️ Common Tasks

### Change Admin Password
Since there's no UI for this yet, you can update directly in Supabase:

```sql
-- First, hash your new password (use the hashPassword function in lib/auth.ts)
-- Then update:
UPDATE users 
SET password_hash = 'YOUR_NEW_HASH' 
WHERE username = 'admin';
```

### Reset User Password
Admins can delete and recreate users, or update the password directly in the database.

### Deactivate a User
Use the admin panel to toggle user status - inactive users cannot login.

### Check Current Session
The application automatically manages sessions. Sessions last 7 days.

## 🔍 Troubleshooting

**Can't login?**
- Check database connection in Supabase
- Verify user exists: `SELECT * FROM users WHERE username = 'admin'`
- Check browser console for errors

**Redirected to login immediately?**
- Session might have expired
- Clear browser cookies and try again

**Admin can't create users?**
- Verify you're logged in as admin
- Check browser console for API errors
- Verify Supabase permissions

## 📚 Next Steps

- Read `AUTH_SETUP.md` for detailed documentation
- Implement password change functionality
- Add email verification
- Set up password reset flow
- Enable two-factor authentication

## 🔒 Security Notes

**Current Implementation:**
- Uses Base64 encoding (for demo purposes)
- Session cookies with HTTP-only flag
- 7-day session duration

**For Production:**
- Install and use bcrypt for password hashing
- Enable HTTPS
- Add rate limiting to login endpoints
- Implement CSRF protection
- Add session timeout warnings
- Enable audit logging

## 💡 Tips

1. **Keep admin credentials secure** - Don't commit them to version control
2. **Use strong passwords** - Enforce password complexity
3. **Regular backups** - Backup your user database regularly
4. **Monitor sessions** - Implement session logging for security
5. **Update dependencies** - Keep packages up to date

## 🆘 Need Help?

1. Check `AUTH_SETUP.md` for detailed documentation
2. Review the code in `lib/auth.ts` for implementation details
3. Check Supabase logs for database errors
4. Review browser console for client-side errors

---

**Ready to go!** 🎉 Your authentication system is now set up and ready to use.

