# Authentication System Setup Guide

This document explains how to set up and use the authentication system for the SMM Panel application.

## Overview

The application now has a complete authentication system with:
- **Admin Panel**: Admins can create and manage user accounts
- **User Panel**: Users can login and access their personal dashboard
- **Role-based Access Control**: Separate interfaces for admins and users
- **Session Management**: Secure cookie-based authentication

## Database Schema Updates

The database schema has been updated with authentication fields:

### Users Table
- `id`: UUID (primary key)
- `email`: TEXT (unique, required)
- `username`: TEXT (unique, required)
- `password_hash`: TEXT (required)
- `role`: TEXT (user/admin, default: user)
- `is_active`: BOOLEAN (default: true)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## Initial Setup

### 1. Update Your Database

Run the updated `supabase-schema.sql` file in your Supabase SQL editor to create the new schema:

```sql
-- The schema includes the updated users table with authentication fields
```

### 2. Create the First Admin User

**Important**: The default admin user in the schema has a placeholder password hash. You need to create a proper admin user.

#### Option A: Through the Application (Recommended)

1. Temporarily modify `lib/auth.ts` to allow creating an admin without authentication
2. Create an admin user through a one-time setup script
3. Remove the temporary modification

#### Option B: Direct Database Insert

Use the application's password hashing to create a proper hash:

```typescript
// In a temporary Node.js script or browser console
import { hashPassword } from './lib/auth'

const password = 'your-secure-password'
const hash = await hashPassword(password)
console.log(hash)
```

Then insert into Supabase:

```sql
INSERT INTO users (email, username, password_hash, role) 
VALUES ('admin@yourdomain.com', 'admin', 'YOUR_HASH_HERE', 'admin');
```

### 3. Environment Variables

Ensure your `.env.local` file has the required Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### Admin Login

1. Navigate to `/admin/login`
2. Enter admin username and password
3. Upon successful login, you'll be redirected to `/admin/users`

**Default Admin Credentials** (if using the provided script):
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT**: Change the default password immediately after first login!

### User Login

1. Navigate to `/login`
2. Enter username and password
3. Upon successful login, you'll be redirected to `/dashboard`

### Admin Functions

After logging in as admin, you can:

1. **Create New Users**
   - Click "Create User" button
   - Enter email, username, and password
   - New users are automatically created with 1000 coins balance

2. **View All Users**
   - See list of all users with their details
   - View user status (Active/Inactive)

3. **Activate/Deactivate Users**
   - Toggle user status with a single click
   - Inactive users cannot login

4. **Delete Users**
   - Remove users from the system
   - Cannot delete your own admin account

### User Functions

Regular users can:
- Access their personal dashboard
- Create orders
- View order history
- Manage their coin balance
- Update settings

## Security Features

### Password Security

**Note**: The current implementation uses simple Base64 encoding for demonstration purposes.

**For Production**, you should:

1. Install bcrypt:
```bash
npm install bcrypt
npm install -D @types/bcrypt
```

2. Update `lib/auth.ts` to use bcrypt:

```typescript
import bcrypt from 'bcrypt'

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}
```

### Session Management

- Sessions are stored in HTTP-only cookies
- Session duration: 7 days
- Automatic session validation on protected routes
- Sessions include user ID, email, username, and role

### Route Protection

The application uses Next.js middleware (`middleware.ts`) to protect routes:

- **Public Routes**: `/login`, `/admin/login`
- **User Routes**: `/dashboard`, `/new-order`, `/my-orders`, etc.
- **Admin Routes**: `/admin/users`, `/admin/*`

Users are automatically redirected based on their role:
- Admins trying to access user routes → redirected to `/admin/users`
- Users trying to access admin routes → redirected to `/dashboard`
- Unauthenticated users → redirected to login pages

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - Login (username, password, role)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session

### Admin Endpoints

- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/users` - Create new user (admin only)
- `PATCH /api/admin/users/[id]` - Toggle user status (admin only)
- `DELETE /api/admin/users/[id]` - Delete user (admin only)

## User Flow Diagrams

### First-Time Setup
```
1. Admin installs application
2. Admin runs database migrations
3. Admin creates first admin user (directly in DB or through setup script)
4. Admin logs in at /admin/login
5. Admin creates regular users
```

### Regular User Flow
```
1. Admin creates user account with credentials
2. Admin shares credentials with user
3. User navigates to /login
4. User enters credentials
5. User accesses personal dashboard
6. User can perform all SMM panel functions
```

### Admin Flow
```
1. Admin logs in at /admin/login
2. Admin accesses /admin/users
3. Admin can:
   - Create new users
   - View all users
   - Activate/deactivate users
   - Delete users
4. Admin can also access pricing management at /admin (the existing admin page)
```

## Troubleshooting

### Cannot Login
- Verify database connection
- Check if user exists and is active
- Verify password hash is correct
- Check browser console for errors

### Session Expires Immediately
- Check cookie settings
- Verify middleware is properly configured
- Check browser cookie settings

### Admin Cannot Create Users
- Verify admin is logged in
- Check API endpoint permissions
- Verify database write permissions

### User Data Not Showing
- Verify user session is active
- Check database connection
- Verify user ID is correctly associated with data

## Best Practices

1. **Change Default Passwords**: Always change default admin passwords
2. **Use Strong Passwords**: Enforce password complexity for users
3. **Regular Backups**: Backup user data regularly
4. **Monitor Sessions**: Implement session logging for security
5. **Update Dependencies**: Keep all packages up to date
6. **Use HTTPS**: Always use HTTPS in production
7. **Implement Rate Limiting**: Add rate limiting to login endpoints
8. **Enable 2FA**: Consider adding two-factor authentication

## Future Enhancements

Consider implementing:
- Password reset functionality
- Email verification
- Two-factor authentication (2FA)
- User activity logging
- Password complexity requirements
- Account lockout after failed attempts
- Session timeout warnings
- Remember me functionality
- Social login options

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments in `lib/auth.ts`
3. Check the Supabase logs
4. Review browser console for client-side errors
5. Check server logs for API errors

