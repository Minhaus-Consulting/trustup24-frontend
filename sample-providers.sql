-- TRUSTUP24 SAMPLE PROVIDER DATA
-- Based on Trust Score System & Real Dubai Market Research
-- Generated: 2025-10-19

-- First, ensure categories exist
INSERT INTO categories (id, name, slug, description, icon, color, sort_order, is_active) VALUES
('cat_formation', 'Firmengründung', 'firmengründung', 'Spezialisierte Anbieter für Firmengründung in Dubai', '🏢', '#10B981', 1, true),
('cat_insurance', 'Versicherung', 'versicherung', 'Versicherungsmakler und -berater für Expats', '🛡️', '#3B82F6', 2, true),
('cat_legal', 'Rechtsberatung', 'rechtsberatung', 'Deutschsprachige Anwaltskanzleien in Dubai', '⚖️', '#8B5CF6', 3, true),
('cat_accounting', 'Buchhaltung', 'buchhaltung', 'Buchhaltung und Steuerberatung', '📊', '#F59E0B', 4, true),
('cat_banking', 'Banking', 'banking', 'Bankkonto-Eröffnung und Banking-Services', '🏦', '#06B6D4', 5, true),
('cat_relocation', 'Relocation', 'relocation', 'Umzug und Relocation Services', '📦', '#8B5CF6', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert comprehensive provider data
INSERT INTO providers (
    id, name, slug, description, short_description, website, email, phone,
    address, city, country, legal_form, license_number, founded_year,
    team_size, revenue_class, languages, trust_score, verification_score,
    review_score, response_score, expertise_score, substance_score,
    network_score, profile_completeness, google_rating, google_review_count,
    trustpilot_rating, trustpilot_review_count, avg_response_time_hours,
    response_rate_percent, status, is_featured, is_verified, meta_title,
    meta_description, created_at, updated_at, last_activity
) VALUES

-- FIRMENGRÜNDUNG PROVIDERS (Top-Tier)
('prov_001', 'Dubai Business Setup Experts', 'dubai-business-setup-experts',
'Deutschsprachige Experten für Firmengründung in Dubai mit über 500 erfolgreichen Projekten seit 2018. Spezialisierung auf DMCC, IFZA und Mainland Gründungen für deutsche Unternehmer.',
'Deutschsprachige Experten für Firmengründung mit 500+ erfolgreichen Projekten',
'https://dubai-business-experts.ae', 'info@dubai-business-experts.ae', '+971 4 123 4567',
'Office 1205, Al Salam Tower, DMCC, Dubai', 'Dubai', 'UAE', 'FZCO', 'DMCC-123456', 2018,
'6-20', '500k-1M EUR', '["Deutsch", "English", "العربية"]'::jsonb, 92, 18, 19, 14, 15, 9, 4, 13,
4.8, 156, 4.7, 89, 2, 95, 'active', true, true,
'Dubai Business Setup Experts - Firmengründung Dubai | Trustup24',
'Deutschsprachige Experten für Firmengründung in Dubai. 500+ erfolgreiche Projekte, 92/100 Trust Score. DMCC, IFZA & Mainland Spezialist.',
NOW(), NOW(), NOW()),

('prov_002', 'Emirates Company Formation', 'emirates-company-formation',
'Professionelle Firmengründung in allen Dubai Freezones. Deutsche Betreuung von der Lizenz bis zur Bankkonto-Eröffnung. Über 8 Jahre Erfahrung im VAE-Markt.',
'Deutsche Betreuung für Firmengründung in allen Dubai Freezones',
'https://emirates-formation.com', 'beratung@emirates-formation.com', '+971 4 234 5678',
'Suite 804, Business Bay Tower, Business Bay, Dubai', 'Dubai', 'UAE', 'Mainland LLC', 'DED-789012', 2016,
'2-5', '100k-500k EUR', '["Deutsch", "English"]'::jsonb, 87, 16, 18, 13, 14, 8, 3, 15,
4.6, 134, 4.5, 67, 3, 92, 'active', true, true,
'Emirates Company Formation - Deutsche Firmengründung Dubai',
'Deutsche Betreuung für Firmengründung in Dubai. 8+ Jahre Erfahrung, alle Freezones. 87/100 Trust Score.',
NOW(), NOW(), NOW()),

('prov_003', 'IFZA Business Setup', 'ifza-business-setup',
'Spezialisiert auf IFZA Freezone Gründungen mit deutschsprachiger Beratung. Komplettservice von Lizenz über Visa bis Banking. Besonders stark bei E-Commerce und Krypto-Unternehmen.',
'IFZA Spezialist mit deutschsprachiger Beratung für E-Commerce & Krypto',
'https://ifza-setup.ae', 'info@ifza-setup.ae', '+971 4 345 6789',
'IFZA Business Park, Dubai South, Dubai', 'Dubai', 'UAE', 'FZCO', 'IFZA-345678', 2019,
'2-5', '100k-500k EUR', '["Deutsch", "English", "Русский"]'::jsonb, 84, 15, 17, 12, 13, 7, 4, 16,
4.7, 98, 4.6, 45, 4, 89, 'active', false, true,
'IFZA Business Setup - E-Commerce & Krypto Firmengründung Dubai',
'IFZA Spezialist für E-Commerce & Krypto. Deutsche Beratung, Komplettservice. 84/100 Trust Score.',
NOW(), NOW(), NOW()),

('prov_004', 'Mainland Business Solutions', 'mainland-business-solutions',
'Experten für Dubai Mainland Firmengründung. Ideal für Unternehmen mit lokalen Kunden oder Regierungsaufträgen. Deutsche Geschäftsführung mit 12 Jahren VAE-Erfahrung.',
'Dubai Mainland Experten mit 12 Jahren VAE-Erfahrung',
'https://mainland-solutions.ae', 'contact@mainland-solutions.ae', '+971 4 456 7890',
'Floor 15, Emirates Towers, Sheikh Zayed Road, Dubai', 'Dubai', 'UAE', 'Mainland LLC', 'DED-456789', 2012,
'6-20', '500k-1M EUR', '["Deutsch", "English", "العربية", "हिन्दी"]'::jsonb, 89, 17, 18, 13, 15, 9, 3, 14,
4.9, 203, 4.8, 112, 1, 97, 'active', true, true,
'Mainland Business Solutions - Dubai Mainland Firmengründung',
'Dubai Mainland Experten seit 2012. Deutsche Geschäftsführung, lokale Expertise. 89/100 Trust Score.',
NOW(), NOW(), NOW()),

-- VERSICHERUNG PROVIDERS
('prov_005', 'Emirates Insurance Brokers', 'emirates-insurance-brokers',
'Umfassende Versicherungslösungen für deutsche Expats und Unternehmen in den VAE. Spezialisiert auf Kranken-, Lebens- und Unternehmensversicherungen mit deutschsprachiger Beratung.',
'Deutsche Versicherungsberatung für Expats und Unternehmen in Dubai',
'https://emirates-insurance.ae', 'beratung@emirates-insurance.ae', '+971 4 567 8901',
'Office 702, Conrad Business Tower, Business Bay, Dubai', 'Dubai', 'UAE', 'Insurance Broker License', 'DIFC-IB-001', 2015,
'2-5', '100k-500k EUR', '["Deutsch", "English"]'::jsonb, 86, 16, 18, 14, 12, 7, 4, 15,
4.6, 89, 4.5, 56, 3, 91, 'active', true, true,
'Emirates Insurance Brokers - Deutsche Versicherungsberatung Dubai',
'Deutsche Versicherungsberatung für Expats in Dubai. Kranken-, Lebens- & Unternehmensversicherung. 86/100 Trust Score.',
NOW(), NOW(), NOW()),

('prov_006', 'Expat Insurance Dubai', 'expat-insurance-dubai',
'Spezialisierte Versicherungsberatung für deutsche Auswanderer. Komplettbetreuung von Krankenversicherung bis Kfz-Versicherung. Über 1000 zufriedene deutsche Familien betreut.',
'Versicherungsspezialist für deutsche Auswanderer - 1000+ Familien betreut',
'https://expat-insurance-dubai.com', 'info@expat-insurance-dubai.com', '+971 4 678 9012',
'Level 12, Al Attar Business Tower, Sheikh Zayed Road, Dubai', 'Dubai', 'UAE', 'Insurance Consultant', 'DED-INS-789', 2017,
'2-5', '100k-500k EUR', '["Deutsch", "English"]'::jsonb, 83, 15, 17, 13, 11, 6, 3, 18,
4.7, 145, 4.6, 78, 2, 94, 'active', false, true,
'Expat Insurance Dubai - Versicherung für deutsche Auswanderer',
'Versicherungsspezialist für deutsche Familien in Dubai. 1000+ betreute Familien. 83/100 Trust Score.',
NOW(), NOW(), NOW()),

-- RECHTSBERATUNG PROVIDERS
('prov_007', 'German Legal Consultants Dubai', 'german-legal-consultants',
'Deutschsprachige Rechtsberatung in Dubai. Spezialisiert auf Gesellschaftsrecht, Verträge und Visa-Angelegenheiten für deutsche Unternehmen. Partner der Deutsch-Emiratischen Handelskammer.',
'Deutschsprachige Anwaltskanzlei - Partner der AHK VAE',
'https://german-legal-dubai.ae', 'kanzlei@german-legal-dubai.ae', '+971 4 789 0123',
'Suite 1501, Burj Al Salam, DIFC, Dubai', 'Dubai', 'UAE', 'Legal Consultant License', 'DIFC-LC-456', 2019,
'2-5', '100k-500k EUR', '["Deutsch", "English", "العربية"]'::jsonb, 88, 17, 16, 14, 16, 8, 4, 13,
4.7, 67, 4.8, 34, 2, 96, 'active', true, true,
'German Legal Consultants - Deutsche Anwaltskanzlei Dubai',
'Deutsche Anwaltskanzlei in Dubai. Gesellschaftsrecht, Verträge, Visa. AHK Partner. 88/100 Trust Score.',
NOW(), NOW(), NOW()),

('prov_008', 'UAE Legal Partners', 'uae-legal-partners',
'Internationale Anwaltskanzlei mit deutschsprachigen Anwälten. Fokus auf Unternehmensrecht, M&A und Compliance für deutsche Investoren in den VAE.',
'Internationale Kanzlei mit deutschen Anwälten für Unternehmensrecht',
'https://uae-legal-partners.com', 'info@uae-legal-partners.com', '+971 4 890 1234',
'Floor 25, Index Tower, DIFC, Dubai', 'Dubai', 'UAE', 'Law Firm License', 'DIFC-LF-789', 2014,
'6-20', '1M+ EUR', '["Deutsch", "English", "Français"]'::jsonb, 91, 18, 17, 15, 17, 9, 5, 10,
4.8, 92, 4.9, 48, 1, 98, 'active', true, true,
'UAE Legal Partners - Deutsche Anwälte für Unternehmensrecht Dubai',
'Internationale Kanzlei mit deutschen Anwälten. M&A, Compliance, Unternehmensrecht. 91/100 Trust Score.',
NOW(), NOW(), NOW()),

-- BUCHHALTUNG PROVIDERS
('prov_009', 'Dubai Accounting Services', 'dubai-accounting-services',
'Deutsche Buchhaltung und Steuerberatung für VAE-Unternehmen. VAT-Registrierung, Jahresabschlüsse und laufende Buchhaltung. Spezialisiert auf deutsche Unternehmer.',
'Deutsche Buchhaltung und VAT-Services für VAE-Unternehmen',
'https://dubai-accounting.ae', 'info@dubai-accounting.ae', '+971 4 901 2345',
'Office 1204, Mazaya Business Avenue, JLT, Dubai', 'Dubai', 'UAE', 'Accounting License', 'DED-ACC-123', 2016,
'2-5', '100k-500k EUR', '["Deutsch", "English", "العربية"]'::jsonb, 85, 16, 17, 12, 14, 7, 4, 15,
4.5, 78, 4.4, 45, 4, 88, 'active', false, true,
'Dubai Accounting Services - Deutsche Buchhaltung VAE',
'Deutsche Buchhaltung für VAE-Unternehmen. VAT, Jahresabschlüsse, laufende Buchhaltung. 85/100 Trust Score.',
NOW(), NOW(), NOW()),

-- BANKING PROVIDERS
('prov_010', 'UAE Banking Solutions', 'uae-banking-solutions',
'Spezialisiert auf Bankkonto-Eröffnung für deutsche Unternehmen in Dubai. Partnerschaften mit allen großen VAE-Banken. 95% Erfolgsquote bei Kontoeröffnungen.',
'Bankkonto-Eröffnung Spezialist - 95% Erfolgsquote',
'https://uae-banking-solutions.com', 'banking@uae-banking-solutions.com', '+971 4 012 3456',
'Level 8, Jumeirah Business Centre 1, JLT, Dubai', 'Dubai', 'UAE', 'Financial Services', 'DFSA-FS-456', 2018,
'2-5', '100k-500k EUR', '["Deutsch", "English", "العربية"]'::jsonb, 82, 15, 16, 13, 12, 6, 4, 16,
4.6, 124, 4.5, 67, 3, 90, 'active', false, true,
'UAE Banking Solutions - Bankkonto-Eröffnung Dubai',
'Bankkonto-Eröffnung Spezialist für deutsche Unternehmen. 95% Erfolgsquote, alle VAE-Banken. 82/100 Trust Score.',
NOW(), NOW(), NOW());

-- Link providers to their primary categories
INSERT INTO provider_categories (provider_id, category_id, is_primary) VALUES
-- Firmengründung
('prov_001', 'cat_formation', true),
('prov_002', 'cat_formation', true),
('prov_003', 'cat_formation', true),
('prov_004', 'cat_formation', true),
-- Versicherung
('prov_005', 'cat_insurance', true),
('prov_006', 'cat_insurance', true),
-- Rechtsberatung
('prov_007', 'cat_legal', true),
('prov_008', 'cat_legal', true),
-- Buchhaltung
('prov_009', 'cat_accounting', true),
-- Banking
('prov_010', 'cat_banking', true),
-- Cross-category services
('prov_001', 'cat_banking', false), -- Business Setup also offers banking support
('prov_002', 'cat_banking', false),
('prov_004', 'cat_accounting', false), -- Mainland also offers accounting
('prov_005', 'cat_legal', false) -- Insurance broker also offers legal advice
ON CONFLICT (provider_id, category_id) DO NOTHING;

-- Insert sample services
INSERT INTO services (id, name, slug, description, category_id, icon, is_active) VALUES
-- Firmengründung Services
('srv_001', 'DMCC Freezone Setup', 'dmcc-setup', 'Firmengründung in der DMCC Freezone', 'cat_formation', '🏢', true),
('srv_002', 'IFZA Freezone Setup', 'ifza-setup', 'Firmengründung in der IFZA Freezone', 'cat_formation', '🏢', true),
('srv_003', 'Dubai Mainland Setup', 'mainland-setup', 'Mainland Firmengründung in Dubai', 'cat_formation', '🏢', true),
('srv_004', 'Residence Visa', 'residence-visa', 'Residence Visa und Emirates ID', 'cat_formation', '📄', true),
('srv_005', 'Banking Support', 'banking-support', 'Unterstützung bei Bankkonto-Eröffnung', 'cat_formation', '🏦', true),

-- Versicherung Services
('srv_006', 'Krankenversicherung', 'health-insurance', 'Krankenversicherung für Expats', 'cat_insurance', '🏥', true),
('srv_007', 'Kfz-Versicherung', 'car-insurance', 'Autoversicherung in den VAE', 'cat_insurance', '🚗', true),
('srv_008', 'Lebensversicherung', 'life-insurance', 'Lebens- und Unfallversicherung', 'cat_insurance', '🛡️', true),

-- Rechtsberatung Services
('srv_009', 'Gesellschaftsrecht', 'corporate-law', 'Corporate Law und Gesellschaftsrecht', 'cat_legal', '⚖️', true),
('srv_010', 'Vertragsrecht', 'contract-law', 'Vertragsgestaltung und -prüfung', 'cat_legal', '📝', true),

-- Buchhaltung Services
('srv_011', 'VAT Services', 'vat-services', 'VAT-Registrierung und -Abwicklung', 'cat_accounting', '📊', true),
('srv_012', 'Jahresabschluss', 'annual-accounts', 'Jahresabschlüsse und Audit', 'cat_accounting', '📋', true),

-- Banking Services
('srv_013', 'Geschäftskonto', 'business-account', 'Geschäftskonto-Eröffnung', 'cat_banking', '🏦', true),
('srv_014', 'Privatkonto', 'personal-account', 'Privatkonto-Eröffnung', 'cat_banking', '💳', true)
ON CONFLICT (slug) DO NOTHING;

-- Link providers to their services with pricing
INSERT INTO provider_services (provider_id, service_id, price_from, price_to, currency, description) VALUES
-- Dubai Business Setup Experts services
('prov_001', 'srv_001', 8500, 12000, 'AED', 'DMCC Freezone Komplettpaket inkl. Lizenz und Visa'),
('prov_001', 'srv_002', 7500, 10000, 'AED', 'IFZA Freezone Setup mit Banking Support'),
('prov_001', 'srv_004', 3500, 5000, 'AED', 'Residence Visa und Emirates ID Service'),
('prov_001', 'srv_005', 2000, 3500, 'AED', 'Banking Support und Kontoeröffnung'),

-- Emirates Company Formation services
('prov_002', 'srv_001', 9000, 13000, 'AED', 'DMCC Setup mit deutscher Betreuung'),
('prov_002', 'srv_003', 12000, 18000, 'AED', 'Dubai Mainland Firmengründung'),
('prov_002', 'srv_004', 3000, 4500, 'AED', 'Visa Services für Unternehmer'),

-- Insurance services
('prov_005', 'srv_006', 3000, 8000, 'AED', 'Krankenversicherung für Einzelpersonen und Familien'),
('prov_005', 'srv_007', 1500, 4000, 'AED', 'Kfz-Versicherung alle Fahrzeugtypen'),
('prov_005', 'srv_008', 2000, 6000, 'AED', 'Lebensversicherung und Vorsorge'),

-- Legal services
('prov_007', 'srv_009', 1500, 3000, 'AED', 'Gesellschaftsrecht Beratung pro Stunde'),
('prov_007', 'srv_010', 2000, 5000, 'AED', 'Vertragsgestaltung und Prüfung'),

-- Accounting services
('prov_009', 'srv_011', 2500, 4000, 'AED', 'VAT-Registrierung und monatliche Abwicklung'),
('prov_009', 'srv_012', 8000, 15000, 'AED', 'Jahresabschluss und Audit Services'),

-- Banking services
('prov_010', 'srv_013', 3000, 5000, 'AED', 'Geschäftskonto-Eröffnung alle Banken'),
('prov_010', 'srv_014', 1000, 2000, 'AED', 'Privatkonto-Eröffnung für Expats')
ON CONFLICT (provider_id, service_id) DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (provider_id, rating, title, content, reviewer_name, reviewer_company, source, status, is_featured, review_date) VALUES
('prov_001', 5, 'Excellente Beratung!', 'Sehr professionelle und deutschsprachige Betreuung bei der Firmengründung. Alles wurde schnell und unkompliziert abgewickelt. Kann ich nur weiterempfehlen!', 'Michael Schmidt', 'Schmidt Consulting FZCO', 'google', 'approved', true, NOW() - INTERVAL '2 months'),
('prov_001', 5, 'Top Service', 'DMCC Gründung lief perfekt. Banking Support war sehr hilfreich. Deutsches Team ist sehr kompetent.', 'Sarah Weber', 'Weber Digital Solutions', 'trustpilot', 'approved', false, NOW() - INTERVAL '1 month'),
('prov_002', 4, 'Gute Beratung', 'Mainland Gründung war etwas komplizierter als erwartet, aber das Team hat alles gut gemeistert.', 'Thomas Müller', 'Müller Trading LLC', 'google', 'approved', false, NOW() - INTERVAL '3 weeks'),
('prov_005', 5, 'Top Versicherungsberatung', 'Kompetente Beratung für unsere Krankenversicherung. Sehr gutes Preis-Leistungs-Verhältnis und schnelle Abwicklung.', 'Anna Hoffmann', 'Hoffmann Family', 'trustpilot', 'approved', true, NOW() - INTERVAL '1 month'),
('prov_007', 5, 'Professionelle Rechtsberatung', 'Sehr kompetente deutsche Anwälte. Gesellschaftsrecht Beratung war ausgezeichnet. Faire Preise.', 'Robert Klein', 'Klein Industries FZCO', 'google', 'approved', false, NOW() - INTERVAL '2 weeks')
ON CONFLICT DO NOTHING;

-- Create sample leads for testing
INSERT INTO leads (
    first_name, last_name, email, phone, company, service_category, 
    services_needed, budget_range, timeline, message, source, status
) VALUES
('Max', 'Mustermann', 'max.mustermann@example.com', '+49 172 123 4567', 'Mustermann GmbH', 'Firmengründung',
'["DMCC Setup", "Banking Support", "Visa Services"]'::jsonb, 'medium', 'urgent', 
'Ich möchte eine DMCC Freezone Firma gründen und benötige Unterstützung bei der Bankkonto-Eröffnung.', 'website', 'new'),

('Julia', 'Schmidt', 'julia.schmidt@example.com', '+49 151 987 6543', 'Schmidt Consulting', 'Versicherung',
'["Krankenversicherung", "Kfz-Versicherung"]'::jsonb, 'low', 'flexible',
'Suche Versicherungsberatung für meine Familie nach dem Umzug nach Dubai.', 'website', 'new'),

('Andreas', 'Weber', 'andreas.weber@example.com', '+49 160 555 1234', 'Weber Tech Solutions', 'Rechtsberatung',
'["Gesellschaftsrecht", "Vertragsrecht"]'::jsonb, 'high', 'urgent',
'Benötige rechtliche Beratung für Joint Venture in Dubai.', 'website', 'contacted')
ON CONFLICT DO NOTHING;

-- Update provider statistics
UPDATE providers SET 
    google_review_count = (SELECT COUNT(*) FROM reviews WHERE provider_id = providers.id AND source = 'google'),
    trustpilot_review_count = (SELECT COUNT(*) FROM reviews WHERE provider_id = providers.id AND source = 'trustpilot')
WHERE id IN ('prov_001', 'prov_002', 'prov_005', 'prov_007');

-- Final summary
SELECT 
    'Data Import Complete' as status,
    (SELECT COUNT(*) FROM providers WHERE status = 'active') as active_providers,
    (SELECT COUNT(*) FROM categories WHERE is_active = true) as categories,
    (SELECT COUNT(*) FROM services WHERE is_active = true) as services,
    (SELECT COUNT(*) FROM reviews WHERE status = 'approved') as approved_reviews,
    (SELECT COUNT(*) FROM leads) as total_leads;
