-- =====================================================
-- AuthService Database Migration Script
-- PostgreSQL Tables Creation for AWS RDS
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: users
-- Description: Stores user account information
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    deactivated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add email validation constraint
ALTER TABLE users ADD CONSTRAINT users_email_check 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- =====================================================
-- Table: user_platforms
-- Description: Stores user platform access and OAuth provider information
-- =====================================================

-- Create ENUM type for platform_type
DO $$ BEGIN
    CREATE TYPE platform_type_enum AS ENUM ('web', 'mobile');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS user_platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    platform_type platform_type_enum DEFAULT 'web' NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_user_id VARCHAR(255),
    app_slug VARCHAR(255) NOT NULL,
    access_token TEXT,
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign key constraint
    CONSTRAINT fk_user_platforms_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Create indexes for user_platforms table
CREATE INDEX IF NOT EXISTS idx_user_platforms_user_provider_app 
    ON user_platforms(user_id, provider, app_slug);

CREATE INDEX IF NOT EXISTS idx_user_platforms_provider_user_id 
    ON user_platforms(provider, provider_user_id);

CREATE INDEX IF NOT EXISTS idx_user_platforms_app_slug 
    ON user_platforms(app_slug);

-- =====================================================
-- Triggers for updated_at timestamp
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_platforms table
DROP TRIGGER IF EXISTS update_user_platforms_updated_at ON user_platforms;
CREATE TRIGGER update_user_platforms_updated_at 
    BEFORE UPDATE ON user_platforms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Verification Queries (commented out)
-- =====================================================

-- Uncomment to verify tables were created successfully:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- \d users
-- \d user_platforms

-- =====================================================
-- Sample Data (optional - commented out)
-- =====================================================

-- Uncomment to insert sample data for testing:
-- INSERT INTO users (username, email, password, is_active) 
-- VALUES ('testuser', 'test@example.com', 'hashed_password_here', true);
