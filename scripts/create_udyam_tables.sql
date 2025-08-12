-- Create Udyam Registration Tables
-- This script sets up the database schema for storing Udyam registration form data

-- Table for storing registration applications
CREATE TABLE IF NOT EXISTS udyam_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_number VARCHAR(50) UNIQUE,
    
    -- Step 1: Aadhaar Details
    aadhaar_number VARCHAR(12) NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    aadhaar_consent BOOLEAN DEFAULT FALSE,
    mobile_number VARCHAR(15),
    otp_verified BOOLEAN DEFAULT FALSE,
    
    -- Step 2: PAN and Organization Details
    organization_type VARCHAR(50),
    pan_number VARCHAR(10),
    pan_holder_name VARCHAR(255),
    pan_dob_or_doi DATE,
    pan_consent BOOLEAN DEFAULT FALSE,
    pan_verified BOOLEAN DEFAULT FALSE,
    
    -- Application Status
    current_step INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'draft', -- draft, submitted, approved, rejected
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE
);

-- Table for storing OTP verification attempts
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id UUID REFERENCES udyam_registrations(id) ON DELETE CASCADE,
    mobile_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_udyam_aadhaar ON udyam_registrations(aadhaar_number);
CREATE INDEX IF NOT EXISTS idx_udyam_pan ON udyam_registrations(pan_number);
CREATE INDEX IF NOT EXISTS idx_udyam_status ON udyam_registrations(status);
CREATE INDEX IF NOT EXISTS idx_otp_mobile ON otp_verifications(mobile_number);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_udyam_registrations_updated_at 
    BEFORE UPDATE ON udyam_registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
