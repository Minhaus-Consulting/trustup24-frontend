-- TRUSTUP24 SUPABASE DATABASE SCHEMA
-- Based on Trust Score System & Agency Listing Concept
-- Date: October 19, 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert main categories
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
('Firmengründung', 'firmengründung', 'Spezialisierte Anbieter für Firmengründung in Dubai', '🏢', '#10B981', 1),
('Versicherung', 'versicherung', 'Versicherungsmakler und -berater für Expats', '🛡️', '#3B82F6', 2),
('Rechtsberatung', 'rechtsberatung', 'Deutschsprachige Anwaltskanzleien in Dubai', '⚖️', '#8B5CF6', 3),
('Buchhaltung', 'buchhaltung', 'Buchhaltung und Steuerberatung', '📊', '#F59E0B', 4),
('Immobilien', 'immobilien', 'Immobilienmakler und -berater', '🏠', '#EF4444', 5),
('Banking', 'banking', 'Bankkonto-Eröffnung und Banking-Services', '🏦', '#06B6D4', 6);

-- =============================================
-- 2. PROVIDERS TABLE (Main Agency/Provider Table)
-- =============================================
CREATE TABLE providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic Information
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Location & Legal
    address TEXT,
    city VARCHAR(100) DEFAULT 'Dubai',
    country VARCHAR(100) DEFAULT 'UAE',
    legal_form VARCHAR(100), -- FZCO, FZE, Mainland, etc.
    license_number VARCHAR(100),
    founded_year INTEGER,
    
    -- Team & Company Size
    team_size VARCHAR(20), -- Solo, 2-5, 6-20, 20+
    revenue_class VARCHAR(50), -- <100k, 100k-500k, 500k-1M, >1M EUR
    
    -- Languages
    languages JSONB DEFAULT '[]'::jsonb, -- ["Deutsch", "English", "العربية"]
    
    -- Trust Score Components
    trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
    verification_score INTEGER DEFAULT 0,
    review_score INTEGER DEFAULT 0,
    response_score INTEGER DEFAULT 0,
    expertise_score INTEGER DEFAULT 0,
    substance_score INTEGER DEFAULT 0,
    network_score INTEGER DEFAULT 0,
    profile_completeness INTEGER DEFAULT 0,
    
    -- Reviews & Ratings
    google_rating DECIMAL(3,2),
    google_review_count INTEGER DEFAULT 0,
    trustpilot_rating DECIMAL(3,2),
    trustpilot_review_count INTEGER DEFAULT 0,
    
    -- Response Metrics
    avg_response_time_hours INTEGER,
    response_rate_percent INTEGER,
    
    -- Status & Visibility
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'suspended')),
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    
    -- SEO & Marketing
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    CONSTRAINT providers_trust_score_valid CHECK (trust_score BETWEEN 0 AND 100)
);

-- Create indexes for performance
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_trust_score ON providers(trust_score DESC);
CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_providers_featured ON providers(is_featured, trust_score DESC);

-- =============================================
-- 3. PROVIDER_CATEGORIES (Many-to-Many Relationship)
-- =============================================
CREATE TABLE provider_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider_id, category_id)
);

-- =============================================
-- 4. SERVICES TABLE
-- =============================================
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert main services
INSERT INTO services (name, slug, description, category_id) VALUES
-- Firmengründung Services
('Freezone Company Setup', 'freezone-setup', 'Gründung in Dubai Freezones (DMCC, IFZA, etc.)', (SELECT id FROM categories WHERE slug = 'firmengründung')),
('Mainland Company Setup', 'mainland-setup', 'Mainland Firmengründung in Dubai', (SELECT id FROM categories WHERE slug = 'firmengründung')),
('Visa Services', 'visa-services', 'Residence Visa und Emirates ID', (SELECT id FROM categories WHERE slug = 'firmengründung')),
('Banking Support', 'banking-support', 'Bankkonto-Eröffnung Unterstützung', (SELECT id FROM categories WHERE slug = 'firmengründung')),

-- Versicherung Services  
('Krankenversicherung', 'health-insurance', 'Krankenversicherung für Expats', (SELECT id FROM categories WHERE slug = 'versicherung')),
('Kfz-Versicherung', 'car-insurance', 'Autoversicherung in den VAE', (SELECT id FROM categories WHERE slug = 'versicherung')),
('Lebensversicherung', 'life-insurance', 'Lebens- und Unfallversicherung', (SELECT id FROM categories WHERE slug = 'versicherung')),

-- Rechtsberatung Services
('Gesellschaftsrecht', 'corporate-law', 'Corporate Law und Gesellschaftsrecht', (SELECT id FROM categories WHERE slug = 'rechtsberatung')),
('Vertragsrecht', 'contract-law', 'Vertragsgestaltung und -prüfung', (SELECT id FROM categories WHERE slug = 'rechtsberatung')),
('Arbeitsrecht', 'employment-law', 'Arbeitsrecht in den VAE', (SELECT id FROM categories WHERE slug = 'rechtsberatung'));

-- =============================================
-- 5. PROVIDER_SERVICES (Many-to-Many)
-- =============================================
CREATE TABLE provider_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    price_from DECIMAL(10,2),
    price_to DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'AED',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider_id, service_id)
);

-- =============================================
-- 6. LEADS TABLE (CRM Integration)
-- =============================================
CREATE TABLE leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Contact Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(200),
    
    -- Lead Details
    service_category VARCHAR(100),
    services_needed JSONB DEFAULT '[]'::jsonb,
    budget_range VARCHAR(50),
    timeline VARCHAR(50),
    message TEXT,
    
    -- Matching Results
    matched_providers JSONB DEFAULT '[]'::jsonb,
    matching_score INTEGER,
    
    -- Lead Source & Tracking
    source VARCHAR(100) DEFAULT 'website',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    referrer VARCHAR(500),
    
    -- Status & Assignment
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    assigned_to UUID, -- Could reference a users table
    
    -- Follow-up
    follow_up_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for CRM functionality
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);

-- =============================================
-- 7. REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    
    -- Review Details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    
    -- Reviewer Information
    reviewer_name VARCHAR(100),
    reviewer_email VARCHAR(255),
    reviewer_company VARCHAR(200),
    
    -- External Review Data
    source VARCHAR(50), -- 'google', 'trustpilot', 'internal'
    external_id VARCHAR(100),
    external_url VARCHAR(500),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN DEFAULT false,
    
    -- Timestamps
    review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. TRUST_SCORE_HISTORY TABLE
-- =============================================
CREATE TABLE trust_score_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    
    -- Score Components
    trust_score INTEGER NOT NULL,
    verification_score INTEGER DEFAULT 0,
    review_score INTEGER DEFAULT 0,
    response_score INTEGER DEFAULT 0,
    expertise_score INTEGER DEFAULT 0,
    substance_score INTEGER DEFAULT 0,
    network_score INTEGER DEFAULT 0,
    profile_completeness INTEGER DEFAULT 0,
    
    -- Calculation Details
    calculation_reason TEXT,
    calculated_by VARCHAR(100),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. PROVIDER_DOCUMENTS TABLE
-- =============================================
CREATE TABLE provider_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    
    -- Document Details
    document_type VARCHAR(100) NOT NULL, -- 'license', 'certificate', 'insurance', etc.
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_by VARCHAR(100),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 10. USERS TABLE (Admin & Provider Access)
-- =============================================
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Authentication (Supabase Auth integration)
    auth_id UUID UNIQUE, -- References auth.users.id
    
    -- Profile
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    
    -- Role & Permissions
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'provider', 'user')),
    provider_id UUID REFERENCES providers(id),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 11. FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate Trust Score
CREATE OR REPLACE FUNCTION calculate_trust_score(provider_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    verification_pts INTEGER := 0;
    review_pts INTEGER := 0;
    response_pts INTEGER := 0;
    expertise_pts INTEGER := 0;
    substance_pts INTEGER := 0;
    network_pts INTEGER := 0;
    profile_pts INTEGER := 0;
    total_score INTEGER := 0;
BEGIN
    -- Get provider data
    SELECT 
        COALESCE(verification_score, 0),
        COALESCE(review_score, 0),
        COALESCE(response_score, 0),
        COALESCE(expertise_score, 0),
        COALESCE(substance_score, 0),
        COALESCE(network_score, 0),
        COALESCE(profile_completeness, 0)
    INTO verification_pts, review_pts, response_pts, expertise_pts, substance_pts, network_pts, profile_pts
    FROM providers 
    WHERE id = provider_uuid;
    
    -- Calculate total (max 100 points)
    total_score := verification_pts + review_pts + response_pts + expertise_pts + substance_pts + network_pts + profile_pts;
    
    -- Ensure score is between 0 and 100
    total_score := GREATEST(0, LEAST(100, total_score));
    
    -- Update provider trust score
    UPDATE providers 
    SET trust_score = total_score, updated_at = NOW()
    WHERE id = provider_uuid;
    
    -- Log score history
    INSERT INTO trust_score_history (
        provider_id, trust_score, verification_score, review_score, 
        response_score, expertise_score, substance_score, network_score, 
        profile_completeness, calculation_reason, calculated_by
    ) VALUES (
        provider_uuid, total_score, verification_pts, review_pts,
        response_pts, expertise_pts, substance_pts, network_pts,
        profile_pts, 'Automatic calculation', 'system'
    );
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_documents ENABLE ROW LEVEL SECURITY;

-- Public read access for active providers
CREATE POLICY "Public providers are viewable by everyone" ON providers
    FOR SELECT USING (status = 'active');

-- Admin full access
CREATE POLICY "Admins can do everything" ON providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Provider can update their own data
CREATE POLICY "Providers can update own data" ON providers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.provider_id = providers.id
        )
    );

-- Leads - admin access only
CREATE POLICY "Only admins can access leads" ON leads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =============================================
-- 13. SAMPLE DATA
-- =============================================

-- Insert sample providers
INSERT INTO providers (
    name, slug, description, short_description, website, email, phone,
    legal_form, founded_year, team_size, revenue_class, languages,
    trust_score, verification_score, review_score, response_score,
    expertise_score, substance_score, network_score, profile_completeness,
    google_rating, google_review_count, status, is_verified
) VALUES 
(
    'Dubai Business Setup Experts',
    'dubai-business-setup-experts',
    'Spezialisierte Beratung für deutsche Unternehmer bei der Firmengründung in Dubai. Über 500 erfolgreiche Gründungen seit 2018.',
    'Deutschsprachige Experten für Firmengründung in Dubai mit über 500 erfolgreichen Projekten.',
    'https://dubai-business-experts.ae',
    'info@dubai-business-experts.ae',
    '+971 4 123 4567',
    'FZCO',
    2018,
    '6-20',
    '500k-1M EUR',
    '["Deutsch", "English", "العربية"]'::jsonb,
    87, 18, 19, 14, 13, 8, 4, 11,
    4.8, 156,
    'active',
    true
),
(
    'Emirates Insurance Brokers',
    'emirates-insurance-brokers',
    'Umfassende Versicherungslösungen für Expats und Unternehmen in den VAE. Spezialisiert auf Kranken-, Lebens- und Unternehmensversicherungen.',
    'Deutschsprachige Versicherungsberatung für Expats in Dubai.',
    'https://emirates-insurance.ae',
    'beratung@emirates-insurance.ae',
    '+971 4 234 5678',
    'Mainland LLC',
    2015,
    '2-5',
    '100k-500k EUR',
    '["Deutsch", "English"]'::jsonb,
    82, 16, 18, 13, 12, 6, 3, 14,
    4.6, 89,
    'active',
    true
),
(
    'German Legal Consultants Dubai',
    'german-legal-consultants',
    'Deutschsprachige Rechtsberatung in Dubai. Spezialisiert auf Gesellschaftsrecht, Verträge und Visa-Angelegenheiten für deutsche Unternehmen.',
    'Deutschsprachige Anwaltskanzlei in Dubai für Unternehmensrecht.',
    'https://german-legal-dubai.ae',
    'kanzlei@german-legal-dubai.ae',
    '+971 4 345 6789',
    'Professional License',
    2019,
    '2-5',
    '100k-500k EUR',
    '["Deutsch", "English", "العربية"]'::jsonb,
    79, 15, 16, 12, 14, 5, 3, 14,
    4.7, 67,
    'active',
    true
);

-- Link providers to categories
INSERT INTO provider_categories (provider_id, category_id, is_primary) VALUES
((SELECT id FROM providers WHERE slug = 'dubai-business-setup-experts'), (SELECT id FROM categories WHERE slug = 'firmengründung'), true),
((SELECT id FROM providers WHERE slug = 'emirates-insurance-brokers'), (SELECT id FROM categories WHERE slug = 'versicherung'), true),
((SELECT id FROM providers WHERE slug = 'german-legal-consultants'), (SELECT id FROM categories WHERE slug = 'rechtsberatung'), true);

-- Add some sample reviews
INSERT INTO reviews (provider_id, rating, title, content, reviewer_name, source, status) VALUES
(
    (SELECT id FROM providers WHERE slug = 'dubai-business-setup-experts'),
    5,
    'Excellente Beratung!',
    'Sehr professionelle und deutschsprachige Betreuung bei der Firmengründung. Alles wurde schnell und unkompliziert abgewickelt.',
    'Michael Schmidt',
    'google',
    'approved'
),
(
    (SELECT id FROM providers WHERE slug = 'emirates-insurance-brokers'),
    5,
    'Top Versicherungsberatung',
    'Kompetente Beratung für unsere Krankenversicherung. Sehr gutes Preis-Leistungs-Verhältnis.',
    'Sarah Weber',
    'trustpilot',
    'approved'
);

COMMENT ON TABLE providers IS 'Main table for service providers/agencies with Trust Score system';
COMMENT ON TABLE trust_score_history IS 'Historical tracking of Trust Score changes for transparency';
COMMENT ON TABLE leads IS 'CRM system for managing customer inquiries and matching results';
COMMENT ON COLUMN providers.trust_score IS 'Calculated Trust Score (0-100) based on verification, reviews, response time, etc.';
COMMENT ON FUNCTION calculate_trust_score IS 'Automatically calculates and updates Trust Score based on all components';
