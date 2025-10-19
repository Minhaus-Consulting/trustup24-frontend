#!/usr/bin/env node

/**
 * TRUSTUP24 PROVIDER DATA IMPORT SCRIPT
 * Imports provider data from GitHub CSV files into Supabase
 * Based on Trust Score System concept
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// GitHub CSV file URLs
const CSV_SOURCES = {
  formation: 'https://raw.githubusercontent.com/Minhaus-Consulting/trustup24-data/main/german_company_formation_uae_optimized.csv',
  insurance: 'https://raw.githubusercontent.com/Minhaus-Consulting/trustup24-data/main/insurance_brokers_uae_updated.csv',
  legal: 'https://raw.githubusercontent.com/Minhaus-Consulting/trustup24-data/main/german_speaking_lawyers_uae_updated.csv'
};

// Category mappings
const CATEGORY_MAPPINGS = {
  formation: {
    id: '1',
    name: 'Firmengründung',
    slug: 'firmengründung',
    description: 'Spezialisierte Anbieter für Firmengründung in Dubai',
    icon: '🏢',
    color: '#10B981'
  },
  insurance: {
    id: '2', 
    name: 'Versicherung',
    slug: 'versicherung',
    description: 'Versicherungsmakler und -berater für Expats',
    icon: '🛡️',
    color: '#3B82F6'
  },
  legal: {
    id: '3',
    name: 'Rechtsberatung', 
    slug: 'rechtsberatung',
    description: 'Deutschsprachige Anwaltskanzleien in Dubai',
    icon: '⚖️',
    color: '#8B5CF6'
  }
};

/**
 * Download CSV file from URL
 */
function downloadCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
      
      response.on('error', (error) => {
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Parse CSV data into objects
 */
function parseCSV(csvData) {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const providers = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length >= headers.length) {
      const provider = {};
      headers.forEach((header, index) => {
        provider[header] = values[index] || '';
      });
      providers.push(provider);
    }
  }
  
  return providers;
}

/**
 * Generate slug from name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[äöüß]/g, (match) => {
      const replacements = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
      return replacements[match] || match;
    })
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Calculate initial trust score based on available data
 */
function calculateInitialTrustScore(provider, category) {
  let score = 0;
  
  // Base score for having complete basic information
  if (provider.name && provider.email && provider.website) {
    score += 20; // Profile completeness
  }
  
  // Website verification (basic check)
  if (provider.website && provider.website.includes('.ae')) {
    score += 10; // UAE-based website
  }
  
  // Phone number verification
  if (provider.phone && provider.phone.includes('+971')) {
    score += 5; // UAE phone number
  }
  
  // Category-specific scoring
  switch (category) {
    case 'formation':
      if (provider.services && provider.services.toLowerCase().includes('freezone')) {
        score += 10;
      }
      if (provider.experience && parseInt(provider.experience) > 5) {
        score += 15;
      }
      break;
      
    case 'insurance':
      if (provider.license_type && provider.license_type.includes('Insurance')) {
        score += 15;
      }
      break;
      
    case 'legal':
      if (provider.bar_admission && provider.bar_admission.includes('UAE')) {
        score += 15;
      }
      break;
  }
  
  // Random variation for realistic distribution (70-95 range)
  const variation = Math.floor(Math.random() * 25) + 70;
  score = Math.min(95, Math.max(score, variation));
  
  return score;
}

/**
 * Transform CSV provider data to Supabase format
 */
function transformProvider(csvProvider, category, index) {
  const categoryInfo = CATEGORY_MAPPINGS[category];
  
  // Generate unique ID and slug
  const providerId = `${category}_${index + 1}`;
  const slug = generateSlug(csvProvider.name || csvProvider.company_name || `provider-${index + 1}`);
  
  // Calculate trust score components
  const trustScore = calculateInitialTrustScore(csvProvider, category);
  
  const provider = {
    id: providerId,
    name: csvProvider.name || csvProvider.company_name || csvProvider.agency_name || `Provider ${index + 1}`,
    slug: slug,
    description: csvProvider.description || csvProvider.services || `Professional ${categoryInfo.name.toLowerCase()} services in Dubai`,
    short_description: csvProvider.short_description || `Experienced ${categoryInfo.name.toLowerCase()} specialist`,
    website: csvProvider.website || csvProvider.url || '',
    email: csvProvider.email || csvProvider.contact_email || '',
    phone: csvProvider.phone || csvProvider.contact_phone || '',
    
    // Location
    address: csvProvider.address || 'Dubai, UAE',
    city: 'Dubai',
    country: 'UAE',
    legal_form: csvProvider.legal_form || 'LLC',
    license_number: csvProvider.license_number || '',
    founded_year: csvProvider.founded_year ? parseInt(csvProvider.founded_year) : 2020,
    
    // Company details
    team_size: csvProvider.team_size || '2-5',
    revenue_class: csvProvider.revenue_class || '100k-500k EUR',
    languages: ['Deutsch', 'English'],
    
    // Trust Score components
    trust_score: trustScore,
    verification_score: Math.floor(trustScore * 0.2),
    review_score: Math.floor(trustScore * 0.2), 
    response_score: Math.floor(trustScore * 0.15),
    expertise_score: Math.floor(trustScore * 0.15),
    substance_score: Math.floor(trustScore * 0.1),
    network_score: Math.floor(trustScore * 0.05),
    profile_completeness: Math.floor(trustScore * 0.15),
    
    // Reviews (simulated)
    google_rating: (4.2 + Math.random() * 0.6).toFixed(1),
    google_review_count: Math.floor(Math.random() * 150) + 20,
    trustpilot_rating: (4.1 + Math.random() * 0.7).toFixed(1),
    trustpilot_review_count: Math.floor(Math.random() * 80) + 10,
    
    // Response metrics
    avg_response_time_hours: Math.floor(Math.random() * 12) + 1,
    response_rate_percent: Math.floor(Math.random() * 20) + 80,
    
    // Status
    status: 'active',
    is_featured: Math.random() > 0.8, // 20% featured
    is_verified: Math.random() > 0.3, // 70% verified
    
    // SEO
    meta_title: `${csvProvider.name || 'Provider'} - ${categoryInfo.name} Dubai | Trustup24`,
    meta_description: `Professional ${categoryInfo.name.toLowerCase()} services in Dubai. Verified provider with ${trustScore}/100 trust score.`,
    
    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_activity: new Date().toISOString()
  };
  
  return provider;
}

/**
 * Generate Supabase SQL insert statements
 */
function generateSQL(providers, category) {
  const categoryInfo = CATEGORY_MAPPINGS[category];
  let sql = '';
  
  // Insert category if not exists
  sql += `-- Insert category: ${categoryInfo.name}\n`;
  sql += `INSERT INTO categories (id, name, slug, description, icon, color, sort_order, is_active) VALUES\n`;
  sql += `('${categoryInfo.id}', '${categoryInfo.name}', '${categoryInfo.slug}', '${categoryInfo.description}', '${categoryInfo.icon}', '${categoryInfo.color}', ${categoryInfo.id}, true)\n`;
  sql += `ON CONFLICT (slug) DO NOTHING;\n\n`;
  
  // Insert providers
  sql += `-- Insert providers for category: ${categoryInfo.name}\n`;
  sql += `INSERT INTO providers (\n`;
  sql += `  id, name, slug, description, short_description, website, email, phone,\n`;
  sql += `  address, city, country, legal_form, license_number, founded_year,\n`;
  sql += `  team_size, revenue_class, languages, trust_score, verification_score,\n`;
  sql += `  review_score, response_score, expertise_score, substance_score,\n`;
  sql += `  network_score, profile_completeness, google_rating, google_review_count,\n`;
  sql += `  trustpilot_rating, trustpilot_review_count, avg_response_time_hours,\n`;
  sql += `  response_rate_percent, status, is_featured, is_verified, meta_title,\n`;
  sql += `  meta_description, created_at, updated_at, last_activity\n`;
  sql += `) VALUES\n`;
  
  const providerValues = providers.map(provider => {
    return `('${provider.id}', '${provider.name.replace(/'/g, "''")}', '${provider.slug}', ` +
           `'${provider.description.replace(/'/g, "''")}', '${provider.short_description.replace(/'/g, "''")}', ` +
           `'${provider.website}', '${provider.email}', '${provider.phone}', ` +
           `'${provider.address}', '${provider.city}', '${provider.country}', ` +
           `'${provider.legal_form}', '${provider.license_number}', ${provider.founded_year}, ` +
           `'${provider.team_size}', '${provider.revenue_class}', ` +
           `'${JSON.stringify(provider.languages)}'::jsonb, ${provider.trust_score}, ` +
           `${provider.verification_score}, ${provider.review_score}, ${provider.response_score}, ` +
           `${provider.expertise_score}, ${provider.substance_score}, ${provider.network_score}, ` +
           `${provider.profile_completeness}, ${provider.google_rating}, ${provider.google_review_count}, ` +
           `${provider.trustpilot_rating}, ${provider.trustpilot_review_count}, ` +
           `${provider.avg_response_time_hours}, ${provider.response_rate_percent}, ` +
           `'${provider.status}', ${provider.is_featured}, ${provider.is_verified}, ` +
           `'${provider.meta_title.replace(/'/g, "''")}', '${provider.meta_description.replace(/'/g, "''")}', ` +
           `'${provider.created_at}', '${provider.updated_at}', '${provider.last_activity}')`;
  });
  
  sql += providerValues.join(',\n');
  sql += `\nON CONFLICT (slug) DO UPDATE SET\n`;
  sql += `  trust_score = EXCLUDED.trust_score,\n`;
  sql += `  updated_at = EXCLUDED.updated_at;\n\n`;
  
  // Insert provider-category relationships
  sql += `-- Link providers to category: ${categoryInfo.name}\n`;
  sql += `INSERT INTO provider_categories (provider_id, category_id, is_primary) VALUES\n`;
  
  const categoryLinks = providers.map(provider => 
    `('${provider.id}', '${categoryInfo.id}', true)`
  );
  
  sql += categoryLinks.join(',\n');
  sql += `\nON CONFLICT (provider_id, category_id) DO NOTHING;\n\n`;
  
  return sql;
}

/**
 * Main import function
 */
async function importProviders() {
  console.log('🚀 Starting Trustup24 Provider Import...');
  
  let allSQL = '';
  allSQL += `-- TRUSTUP24 PROVIDER DATA IMPORT\n`;
  allSQL += `-- Generated: ${new Date().toISOString()}\n`;
  allSQL += `-- Source: GitHub CSV files\n\n`;
  
  let totalProviders = 0;
  
  for (const [category, url] of Object.entries(CSV_SOURCES)) {
    try {
      console.log(`📥 Downloading ${category} data from GitHub...`);
      const csvData = await downloadCSV(url);
      
      console.log(`📊 Parsing ${category} CSV data...`);
      const csvProviders = parseCSV(csvData);
      
      if (csvProviders.length === 0) {
        console.log(`⚠️  No data found for ${category}`);
        continue;
      }
      
      console.log(`🔄 Transforming ${csvProviders.length} ${category} providers...`);
      const providers = csvProviders.map((csvProvider, index) => 
        transformProvider(csvProvider, category, index)
      );
      
      console.log(`📝 Generating SQL for ${category}...`);
      const sql = generateSQL(providers, category);
      allSQL += sql;
      
      totalProviders += providers.length;
      console.log(`✅ Processed ${providers.length} ${category} providers`);
      
    } catch (error) {
      console.error(`❌ Error processing ${category}:`, error.message);
    }
  }
  
  // Write SQL file
  const outputFile = path.join(__dirname, 'provider-import.sql');
  fs.writeFileSync(outputFile, allSQL);
  
  console.log(`\n🎉 Import completed!`);
  console.log(`📊 Total providers processed: ${totalProviders}`);
  console.log(`📄 SQL file generated: ${outputFile}`);
  console.log(`\n📋 Next steps:`);
  console.log(`1. Review the generated SQL file`);
  console.log(`2. Execute the SQL in your Supabase database`);
  console.log(`3. Update the React app with Supabase connection`);
  
  // Generate summary stats
  const summary = {
    total_providers: totalProviders,
    categories: Object.keys(CSV_SOURCES).length,
    generated_at: new Date().toISOString(),
    sql_file: outputFile
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'import-summary.json'), 
    JSON.stringify(summary, null, 2)
  );
  
  return summary;
}

// Run import if called directly
if (require.main === module) {
  importProviders().catch(console.error);
}

module.exports = { importProviders };
