# Waitlist Setup Guide

This guide will help you set up the PostgreSQL database and email notifications for the waitlist feature.

## What Was Set Up

1. ✅ **Success Screen** - Beautiful animated success screen after form submission
2. ✅ **API Route** - `/api/waitlist` endpoint to handle submissions
3. ✅ **Database Schema** - Prisma schema with `WaitlistEntry` model
4. ✅ **Email Service** - Resend integration for automatic confirmation emails

## Prerequisites

- PostgreSQL database (local or hosted)
- Resend account (for email) - https://resend.com

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @prisma/client prisma resend
```

### 2. Set Up PostgreSQL

#### Option A: Local PostgreSQL
Install PostgreSQL locally and create a database:
```sql
CREATE DATABASE lexiassist;
```

#### Option B: Hosted PostgreSQL (Recommended for Production)
Use a service like:
- **Supabase** (https://supabase.com) - Free tier available
- **Railway** (https://railway.app) - Easy setup
- **Neon** (https://neon.tech) - Serverless PostgreSQL

### 3. Configure Environment Variables

Update `.env.local` with your credentials:

```env
# Database URL
DATABASE_URL="postgresql://user:password@host:port/database"

# Resend API Key
RESEND_API_KEY=your_resend_api_key_here
```

### 4. Initialize Database

Run these commands to set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Set Up Resend for Emails

1. Create an account at https://resend.com
2. Get your API key from the dashboard
3. (Optional) Verify your domain for better email deliverability
4. Add the API key to `.env.local`

## How It Works

1. User submits the waitlist form on `/waitlist`
2. Form data is sent to `/api/waitlist` endpoint
3. API validates the data and checks for duplicate emails
4. Entry is saved to PostgreSQL database
5. Confirmation email is sent via Resend (in background)
6. Success screen is displayed to the user

## API Endpoints

### POST /api/waitlist
Add a new entry to the waitlist.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully added to waitlist",
  "entry": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error - Duplicate):**
```json
{
  "error": "This email is already on the waitlist"
}
```

### GET /api/waitlist
Get all waitlist entries (for admin purposes).

## Viewing Waitlist Data

### Option 1: Prisma Studio (Development)
```bash
npx prisma studio
```
Opens a web interface at http://localhost:5555

### Option 2: Direct Database Query
Connect to your PostgreSQL database and query:
```sql
SELECT * FROM waitlist_entries ORDER BY created_at DESC;
```

## Next Steps

1. Install the npm packages
2. Set up your PostgreSQL database
3. Get a Resend API key
4. Update environment variables
5. Run the Prisma commands
6. Test the waitlist form!

## Troubleshooting

### "Database connection error"
- Check your `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Verify the database exists

### "Prisma Client not found"
- Run `npx prisma generate`

### Emails not sending
- Check that `RESEND_API_KEY` is set correctly
- Verify the email domain is configured in Resend (for production)
- Check server logs for email errors

## File Structure

```
prisma/
  schema.prisma          # Database schema
src/
  app/
    api/
      waitlist/
        route.ts         # API endpoint
    waitlist/
      page.tsx           # Waitlist form + success screen
  lib/
    db.ts                # Prisma client
    email.ts             # Email service
.env.local               # Environment variables
```
