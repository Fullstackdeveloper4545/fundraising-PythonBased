-- Fundraising Platform Database Schema for Supabase
-- Execute these statements in your Supabase SQL Editor

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'company', 'donor')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    is_verified BOOLEAN DEFAULT FALSE,
    referral_code VARCHAR(50) UNIQUE,
    referred_by BIGINT REFERENCES users(id),
    referral_count INTEGER DEFAULT 0,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    goal_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled', 'expired')),
    duration_months VARCHAR(2) NOT NULL CHECK (duration_months IN ('1', '3', '6', '12')),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    category VARCHAR(100),
    image_url VARCHAR(1024),
    video_url VARCHAR(1024),
    story TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    referral_requirement_met BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Campaign payments table
CREATE TABLE IF NOT EXISTS campaign_payments (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    donor_id BIGINT REFERENCES users(id),
    donor_email VARCHAR(255) NOT NULL,
    donor_name VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('credit_card', 'paypal', 'bank_transfer', 'square')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    is_anonymous BOOLEAN DEFAULT FALSE,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- 4. Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    invited_email VARCHAR(255),
    invited_phone VARCHAR(50),
    token VARCHAR(36) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'expired')),
    sent_at TIMESTAMP,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Shoutouts table
CREATE TABLE IF NOT EXISTS shoutouts (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    donor_id BIGINT REFERENCES users(id),
    display_name VARCHAR(255),
    message VARCHAR(512),
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    threshold_amount DECIMAL(12,2) NOT NULL,
    achieved_at TIMESTAMP,
    is_auto BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES campaign_payments(id) ON DELETE CASCADE,
    receipt_uuid VARCHAR(36) UNIQUE NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    receipt_url VARCHAR(1024),
    data JSONB
);

-- 8. Companies table
CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    website VARCHAR(512),
    logo_url VARCHAR(1024),
    description TEXT,
    is_partner BOOLEAN DEFAULT FALSE,
    partnership_tier VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Company partnerships table
CREATE TABLE IF NOT EXISTS company_partnerships (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    partnership_type VARCHAR(50) NOT NULL CHECK (partnership_type IN ('banner_ad', 'grant_provider', 'sponsor')),
    cost DECIMAL(12,2),
    duration_months INTEGER,
    banner_url VARCHAR(1024),
    banner_position VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Student highlights table
CREATE TABLE IF NOT EXISTS student_highlights (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(1024),
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Grants table
CREATE TABLE IF NOT EXISTS grants (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    requirements TEXT,
    application_deadline TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_featured ON campaigns(is_featured);
CREATE INDEX IF NOT EXISTS idx_payments_campaign_id ON campaign_payments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_payments_donor_id ON campaign_payments(donor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON campaign_payments(status);
CREATE INDEX IF NOT EXISTS idx_referrals_campaign_id ON referrals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_referrals_token ON referrals(token);
CREATE INDEX IF NOT EXISTS idx_shoutouts_campaign_id ON shoutouts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_milestones_campaign_id ON milestones(campaign_id);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_id ON receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_companies_partner ON companies(is_partner);
CREATE INDEX IF NOT EXISTS idx_highlights_active ON student_highlights(is_active);
CREATE INDEX IF NOT EXISTS idx_grants_active ON grants(is_active);

-- Enable Row Level Security (RLS) for data protection
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoutouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - customize as needed)
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert payments" ON campaign_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert referrals" ON referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert shoutouts" ON shoutouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert milestones" ON milestones FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert receipts" ON receipts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert companies" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert partnerships" ON company_partnerships FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert highlights" ON student_highlights FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert grants" ON grants FOR INSERT WITH CHECK (true);

-- Campaigns are public for reading, but users can only modify their own
CREATE POLICY "Campaigns are viewable by everyone" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Users can create campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Payments are viewable by campaign owner and donor
CREATE POLICY "Payments viewable by campaign owner and donor" ON campaign_payments FOR SELECT USING (
    campaign_id IN (SELECT id FROM campaigns WHERE user_id::text = auth.uid()::text) OR
    donor_id::text = auth.uid()::text
);

-- 12. OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) DEFAULT 'email_verification' CHECK (purpose IN ('email_verification', 'password_reset', 'login_verification')),
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    expired_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for OTP table
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_purpose ON otp_verifications(purpose);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_used ON otp_verifications(is_used);

-- Enable RLS for OTP table
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for OTP table
CREATE POLICY "Users can insert OTPs" ON otp_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own OTPs" ON otp_verifications FOR SELECT USING (email = auth.uid()::text);

-- Insert a default admin user (replace with your details)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified) 
VALUES ('admin@fundraising.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8', 'Admin', 'User', 'admin', true)
ON CONFLICT (email) DO NOTHING;
