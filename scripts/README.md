# Database Migration Guide

This guide explains how to create tables on your AWS PostgreSQL database using the provided SQL script.

## Prerequisites

- AWS RDS PostgreSQL instance running
- Database connection credentials (host, port, database name, username, password)
- `psql` client installed OR access to pgAdmin/DBeaver

## Method 1: Using psql Command Line

### Step 1: Connect to AWS RDS

```bash
psql -h your-rds-endpoint.region.rds.amazonaws.com \
     -p 5432 \
     -U your-username \
     -d your-database-name
```

Example:
```bash
psql -h authservice-db.abc123.us-east-1.rds.amazonaws.com \
     -p 5432 \
     -U postgres \
     -d AuthService
```

### Step 2: Execute the SQL Script

Once connected, run:
```sql
\i scripts/create-tables.sql
```

Or execute directly from your terminal:
```bash
psql -h your-rds-endpoint.region.rds.amazonaws.com \
     -p 5432 \
     -U your-username \
     -d your-database-name \
     -f scripts/create-tables.sql
```

### Step 3: Verify Tables

```sql
-- List all tables
\dt

-- Describe users table
\d users

-- Describe user_platforms table
\d user_platforms

-- Check if data can be queried
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM user_platforms;
```

## Method 2: Using pgAdmin or DBeaver

1. Open pgAdmin or DBeaver
2. Connect to your AWS RDS PostgreSQL instance
3. Open the Query Tool
4. Copy and paste the contents of `scripts/create-tables.sql`
5. Execute the script
6. Verify tables were created in the left sidebar

## Method 3: Using Environment Variable

If you have `DATABASE_URL` set in your `.env` file:

```bash
# Extract connection details from DATABASE_URL
# Format: postgresql://username:password@host:port/database

psql $DATABASE_URL -f scripts/create-tables.sql
```

## What the Script Creates

### Tables

1. **users** - Main user accounts table
   - UUID primary key
   - Username and email (unique)
   - Password (nullable for OAuth users)
   - Active/deleted status flags
   - Timestamps

2. **user_platforms** - User platform access and OAuth providers
   - Links users to applications and auth providers
   - Stores OAuth tokens and metadata
   - Platform type (web/mobile)
   - Foreign key to users table with CASCADE delete

### Additional Features

- **UUID Extension**: Enables UUID generation
- **Indexes**: Optimized for common queries
- **Constraints**: Email validation, foreign keys
- **Triggers**: Auto-update `updated_at` timestamps
- **ENUM Type**: Platform type enumeration

## Troubleshooting

### Permission Denied

If you get permission errors, ensure your database user has CREATE privileges:
```sql
GRANT CREATE ON DATABASE your_database_name TO your_username;
```

### Extension Error

If UUID extension fails, you may need superuser privileges:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Connection Refused

- Check security group rules in AWS RDS
- Ensure your IP is whitelisted
- Verify the endpoint and port are correct

## Rolling Back

To drop all tables (⚠️ **WARNING: This deletes all data**):

```sql
DROP TABLE IF EXISTS user_platforms CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS platform_type_enum;
```

## Next Steps

After creating tables:
1. Update your `.env` file with the AWS RDS `DATABASE_URL`
2. Test the connection: `npm run dev`
3. Verify the `/health` endpoint returns database connected status
4. Test user registration and login endpoints
