/**
 * TRUSTUP24 UX IMPROVEMENTS V2 - WITH SUPABASE INTEGRATION
 * Enhanced version with real data integration and Trust Score system
 * Date: October 19, 2025
 */

console.log('🚀 Trustup24 UX Improvements V2 Loading...');

// Configuration
const CONFIG = {
  supabase: {
    url: 'https://your-project.supabase.co', // Will be replaced with actual URL
    key: 'your-anon-key', // Will be replaced with actual key
    enabled: false // Set to true when Supabase is configured
  },
  api: {
    fallbackData: true,
    retryAttempts: 3,
    timeout: 10000
  },
  ui: {
    animationDuration: 300,
    scrollOffset: 100,
    trustScoreUpdateInterval: 30000
  }
};

// Mock Supabase client for development
const createMockSupabaseClient = () => {
  return {
    from: (table) => ({
      select: (columns = '*') => ({
        eq: (column, value) => ({
          then: async (callback) => {
            console.log(`Mock Supabase: SELECT ${columns} FROM ${table} WHERE ${column} = ${value}`);
            
            // Return mock data based on table
            let mockData = [];
            if (table === 'providers') {
              mockData = getMockProviders().filter(p => 
                column === 'status' ? p[column] === value : true
              );
            } else if (table === 'categories') {
              mockData = getMockCategories();
            }
            
            return callback({ data: mockData, error: null });
          }
        }),
        order: (column, options = {}) => ({
          then: async (callback) => {
            console.log(`Mock Supabase: SELECT ${columns} FROM ${table} ORDER BY ${column}`);
            let mockData = [];
            if (table === 'providers') {
              mockData = getMockProviders();
              if (column === 'trust_score') {
                mockData.sort((a, b) => options.ascending ? a.trust_score - b.trust_score : b.trust_score - a.trust_score);
              }
            }
            return callback({ data: mockData, error: null });
          }
        }),
        then: async (callback) => {
          console.log(`Mock Supabase: SELECT ${columns} FROM ${table}`);
          let mockData = [];
          if (table === 'providers') {
            mockData = getMockProviders();
          } else if (table === 'categories') {
            mockData = getMockCategories();
          }
          return callback({ data: mockData, error: null });
        }
      }),
      insert: (data) => ({
        then: async (callback) => {
          console.log(`Mock Supabase: INSERT INTO ${table}:`, data);
          return callback({ data: Array.isArray(data) ? data : [data], error: null });
        }
      })
    })
  };
};

// Mock data generators
const getMockProviders = () => [
  {
    id: 'prov_001',
    name: 'Dubai Business Setup Experts',
    slug: 'dubai-business-setup-experts',
    description: 'Deutschsprachige Experten für Firmengründung in Dubai mit über 500 erfolgreichen Projekten.',
    short_description: 'Deutschsprachige Experten für Firmengründung mit 500+ erfolgreichen Projekten',
    website: 'https://dubai-business-experts.ae',
    email: 'info@dubai-business-experts.ae',
    phone: '+971 4 123 4567',
    trust_score: 92,
    google_rating: 4.8,
    google_review_count: 156,
    languages: ['Deutsch', 'English', 'العربية'],
    status: 'active',
    is_featured: true,
    is_verified: true,
    avg_response_time_hours: 2,
    response_rate_percent: 95
  },
  {
    id: 'prov_002',
    name: 'Emirates Company Formation',
    slug: 'emirates-company-formation',
    description: 'Professionelle Firmengründung in allen Dubai Freezones.',
    short_description: 'Deutsche Betreuung für Firmengründung in allen Dubai Freezones',
    website: 'https://emirates-formation.com',
    email: 'beratung@emirates-formation.com',
    phone: '+971 4 234 5678',
    trust_score: 87,
    google_rating: 4.6,
    google_review_count: 134,
    languages: ['Deutsch', 'English'],
    status: 'active',
    is_featured: true,
    is_verified: true,
    avg_response_time_hours: 3,
    response_rate_percent: 92
  },
  {
    id: 'prov_005',
    name: 'Emirates Insurance Brokers',
    slug: 'emirates-insurance-brokers',
    description: 'Umfassende Versicherungslösungen für deutsche Expats und Unternehmen.',
    short_description: 'Deutsche Versicherungsberatung für Expats und Unternehmen',
    website: 'https://emirates-insurance.ae',
    email: 'beratung@emirates-insurance.ae',
    phone: '+971 4 567 8901',
    trust_score: 86,
    google_rating: 4.6,
    google_review_count: 89,
    languages: ['Deutsch', 'English'],
    status: 'active',
    is_featured: false,
    is_verified: true,
    avg_response_time_hours: 3,
    response_rate_percent: 91
  }
];

const getMockCategories = () => [
  { id: 'cat_formation', name: 'Firmengründung', slug: 'firmengründung', icon: '🏢', color: '#10B981' },
  { id: 'cat_insurance', name: 'Versicherung', slug: 'versicherung', icon: '🛡️', color: '#3B82F6' },
  { id: 'cat_legal', name: 'Rechtsberatung', slug: 'rechtsberatung', icon: '⚖️', color: '#8B5CF6' }
];

// Initialize Supabase client (mock or real)
let supabaseClient;

const initializeSupabase = () => {
  if (CONFIG.supabase.enabled && window.supabase) {
    console.log('✅ Initializing real Supabase client...');
    supabaseClient = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
  } else {
    console.log('🔄 Using mock Supabase client for development...');
    supabaseClient = createMockSupabaseClient();
  }
};

// Provider service with Supabase integration
const ProviderService = {
  async getProviders(filters = {}) {
    try {
      let query = supabaseClient
        .from('providers')
        .select('*')
        .eq('status', 'active');

      if (filters.category) {
        // In real implementation, this would join with provider_categories
        console.log('Filtering by category:', filters.category);
      }

      if (filters.minTrustScore) {
        query = query.gte('trust_score', filters.minTrustScore);
      }

      const { data, error } = await query.order('trust_score', { ascending: false });

      if (error) {
        console.error('Error fetching providers:', error);
        return { providers: [], error };
      }

      return { providers: data || [], error: null };
    } catch (err) {
      console.error('Provider service error:', err);
      return { providers: [], error: err.message };
    }
  },

  async getProvidersByCategory(categorySlug) {
    try {
      const { data, error } = await supabaseClient
        .from('providers')
        .select('*')
        .eq('status', 'active')
        .order('trust_score', { ascending: false });

      if (error) throw error;

      // Filter by category (mock implementation)
      const filtered = (data || []).filter(provider => {
        if (categorySlug === 'firmengründung') return provider.id.includes('prov_001') || provider.id.includes('prov_002');
        if (categorySlug === 'versicherung') return provider.id.includes('prov_005');
        return true;
      });

      return { providers: filtered, error: null };
    } catch (err) {
      console.error('Error fetching providers by category:', err);
      return { providers: [], error: err.message };
    }
  },

  async smartMatch(criteria) {
    try {
      const { providers } = await this.getProviders();
      
      // Apply matching logic
      const matches = providers.map(provider => {
        let matchingScore = provider.trust_score;
        
        // Boost score based on criteria
        if (criteria.timeline === 'urgent' && provider.avg_response_time_hours <= 2) {
          matchingScore += 10;
        }
        
        if (criteria.language && provider.languages.includes(criteria.language)) {
          matchingScore += 5;
        }
        
        if (provider.response_rate_percent >= 95) {
          matchingScore += 3;
        }
        
        return {
          ...provider,
          matching_score: Math.min(100, matchingScore)
        };
      });

      // Sort by matching score
      matches.sort((a, b) => b.matching_score - a.matching_score);
      
      return { matches: matches.slice(0, 10), error: null };
    } catch (err) {
      console.error('Smart matching error:', err);
      return { matches: [], error: err.message };
    }
  }
};

// Lead service with Supabase integration
const LeadService = {
  async createLead(leadData) {
    try {
      const lead = {
        ...leadData,
        status: 'new',
        source: 'website',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('leads')
        .insert([lead]);

      if (error) throw error;

      console.log('✅ Lead created successfully:', lead);
      return { lead: data?.[0] || lead, error: null };
    } catch (err) {
      console.error('Error creating lead:', err);
      return { lead: null, error: err.message };
    }
  }
};

// Enhanced UI Components
const UIComponents = {
  createProviderCard(provider) {
    const getTrustScoreColor = (score) => {
      if (score >= 90) return '#10B981'; // Green
      if (score >= 80) return '#3B82F6'; // Blue
      if (score >= 70) return '#F59E0B'; // Yellow
      return '#EF4444'; // Red
    };

    const getTrustScoreLabel = (score) => {
      if (score >= 90) return 'Excellent';
      if (score >= 80) return 'Very Good';
      if (score >= 70) return 'Good';
      return 'Fair';
    };

    return `
      <div class="provider-card bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200" data-provider-id="${provider.id}">
        <!-- Header -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">${provider.name}</h3>
            <p class="text-gray-600 text-sm mb-2">${provider.short_description}</p>
          </div>
          ${provider.is_featured ? '<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Featured</span>' : ''}
        </div>

        <!-- Trust Score -->
        <div class="flex items-center mb-4">
          <div class="px-3 py-1 rounded-full text-sm font-medium text-white" style="background-color: ${getTrustScoreColor(provider.trust_score)}">
            Trust Score: ${provider.trust_score}/100
          </div>
          <span class="ml-2 text-sm text-gray-500">${getTrustScoreLabel(provider.trust_score)}</span>
          ${provider.is_verified ? `
            <div class="ml-2 flex items-center text-green-600">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs">Verified</span>
            </div>
          ` : ''}
        </div>

        <!-- Reviews -->
        ${provider.google_rating ? `
          <div class="flex items-center mb-4">
            <div class="flex items-center">
              ${Array.from({length: 5}, (_, i) => `
                <svg class="w-4 h-4 ${i < Math.floor(provider.google_rating) ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              `).join('')}
              <span class="ml-2 text-sm text-gray-600">${provider.google_rating} (${provider.google_review_count} reviews)</span>
            </div>
          </div>
        ` : ''}

        <!-- Languages -->
        <div class="mb-4">
          <div class="flex flex-wrap gap-1">
            ${provider.languages.map(lang => `
              <span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">${lang}</span>
            `).join('')}
          </div>
        </div>

        <!-- Response Time -->
        <div class="mb-4 text-sm text-gray-600">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Response time: ~${provider.avg_response_time_hours}h
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3">
          <button onclick="viewProviderDetails('${provider.id}')" class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
            View Details
          </button>
          <button onclick="contactProvider('${provider.id}')" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            Contact Now
          </button>
        </div>
      </div>
    `;
  },

  createMatchingSuccessModal(matches) {
    return `
      <div id="matching-success-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-90vh overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">🎯 Perfect Matches Found!</h2>
            <button onclick="closeMatchingModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="mb-6 p-4 bg-green-50 rounded-lg">
            <p class="text-green-800">
              We found <strong>${matches.length} providers</strong> that match your criteria, sorted by relevance and trust score.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            ${matches.map(provider => this.createProviderCard(provider)).join('')}
          </div>

          <div class="mt-8 text-center">
            <button onclick="showLeadForm()" class="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors font-medium">
              Contact Selected Providers
            </button>
          </div>
        </div>
      </div>
    `;
  },

  createLeadForm() {
    return `
      <div id="lead-form-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">📝 Contact Information</h2>
            <button onclick="closeLeadForm()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form id="lead-form" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input type="text" name="first_name" required class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input type="text" name="last_name" required class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" required class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" name="company" class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Service Category *</label>
              <select name="service_category" required class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select category</option>
                <option value="Firmengründung">Firmengründung</option>
                <option value="Versicherung">Versicherung</option>
                <option value="Rechtsberatung">Rechtsberatung</option>
                <option value="Buchhaltung">Buchhaltung</option>
                <option value="Banking">Banking</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
              <select name="budget_range" class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">Select budget</option>
                <option value="low">Up to 10,000 AED</option>
                <option value="medium">10,000 - 25,000 AED</option>
                <option value="high">25,000 - 50,000 AED</option>
                <option value="premium">50,000+ AED</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
              <select name="timeline" class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="">Flexible</option>
                <option value="urgent">Urgent (within 1 week)</option>
                <option value="fast">Fast (within 1 month)</option>
                <option value="normal">Normal (1-3 months)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea name="message" rows="4" class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Please describe your requirements..."></textarea>
            </div>

            <button type="submit" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium">
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    `;
  }
};

// Enhanced matching functionality
const SmartMatching = {
  currentCriteria: {},
  currentMatches: [],

  async handleMatchingForm() {
    const form = document.querySelector('#smart-matching-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const criteria = {
        category: formData.get('category'),
        services: formData.getAll('services'),
        budget: formData.get('budget'),
        timeline: formData.get('timeline'),
        language: formData.get('language') || 'Deutsch',
        experience: formData.get('experience')
      };

      this.currentCriteria = criteria;
      await this.findMatches(criteria);
    });
  },

  async findMatches(criteria) {
    try {
      // Show loading state
      const submitBtn = document.querySelector('#smart-matching-form button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Finding Matches...';
        submitBtn.disabled = true;
      }

      const { matches, error } = await ProviderService.smartMatch(criteria);
      
      if (error) {
        console.error('Matching error:', error);
        this.showError('Error finding matches. Please try again.');
        return;
      }

      this.currentMatches = matches;
      this.showMatches(matches);
      
    } catch (err) {
      console.error('Matching error:', err);
      this.showError('Error finding matches. Please try again.');
    } finally {
      // Reset button
      const submitBtn = document.querySelector('#smart-matching-form button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Find Perfect Matches';
        submitBtn.disabled = false;
      }
    }
  },

  showMatches(matches) {
    if (matches.length === 0) {
      this.showError('No matches found. Please try different criteria.');
      return;
    }

    // Create and show modal
    const modal = UIComponents.createMatchingSuccessModal(matches);
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // Add scroll prevention
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => {
      const modalEl = document.getElementById('matching-success-modal');
      if (modalEl) {
        modalEl.style.opacity = '1';
      }
    }, 10);
  },

  showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        ${message}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
};

// Enhanced lead management
const LeadManagement = {
  async handleLeadForm() {
    const form = document.getElementById('lead-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const leadData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        service_category: formData.get('service_category'),
        budget_range: formData.get('budget_range'),
        timeline: formData.get('timeline'),
        message: formData.get('message'),
        matched_providers: SmartMatching.currentMatches.map(p => p.id),
        matching_criteria: SmartMatching.currentCriteria
      };

      const result = await LeadService.createLead(leadData);
      
      if (result.error) {
        this.showError('Error sending inquiry. Please try again.');
        return;
      }

      this.showSuccess();
      this.closeLeadForm();
    });
  },

  showSuccess() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Inquiry sent successfully! Providers will contact you soon.
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  },

  showError(message) {
    SmartMatching.showError(message);
  },

  closeLeadForm() {
    const modal = document.getElementById('lead-form-modal');
    if (modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  }
};

// Global functions for UI interactions
window.viewProviderDetails = (providerId) => {
  console.log('View provider details:', providerId);
  // Implement provider details modal
};

window.contactProvider = (providerId) => {
  console.log('Contact provider:', providerId);
  // Show lead form for specific provider
  const leadFormHTML = UIComponents.createLeadForm();
  document.body.insertAdjacentHTML('beforeend', leadFormHTML);
  document.body.style.overflow = 'hidden';
  LeadManagement.handleLeadForm();
};

window.closeMatchingModal = () => {
  const modal = document.getElementById('matching-success-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
};

window.showLeadForm = () => {
  const leadFormHTML = UIComponents.createLeadForm();
  document.body.insertAdjacentHTML('beforeend', leadFormHTML);
  LeadManagement.handleLeadForm();
};

window.closeLeadForm = () => {
  LeadManagement.closeLeadForm();
};

// Enhanced scroll fix for React app
const ScrollFix = {
  init() {
    this.preventScrollToTop();
    this.attachScrollFix();
  },

  preventScrollToTop() {
    const originalScrollTo = window.scrollTo;
    let isMatchingActive = false;

    window.scrollTo = function(x, y) {
      if (isMatchingActive && y === 0) {
        console.log('🚫 Prevented scroll to top during matching');
        return;
      }
      originalScrollTo.call(window, x, y);
    };

    // Detect matching tool activity
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const matchingElements = document.querySelectorAll('[class*="matching"], [class*="smart-matching"]');
          isMatchingActive = matchingElements.length > 0;
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  },

  attachScrollFix() {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;

      const buttonText = button.textContent.toLowerCase();
      if (buttonText.includes('weiter') || buttonText.includes('next') || buttonText.includes('continue')) {
        console.log('🔧 Weiter button clicked - preventing scroll');
        
        setTimeout(() => {
          const matchingSection = document.querySelector('[class*="matching"], [class*="smart-matching"]');
          if (matchingSection) {
            const rect = matchingSection.getBoundingClientRect();
            const scrollTop = window.pageYOffset + rect.top - CONFIG.ui.scrollOffset;
            
            window.scrollTo({
              top: scrollTop,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    });
  }
};

// Provider count updater with live data
const ProviderCountUpdater = {
  async updateCounts() {
    try {
      const { providers } = await ProviderService.getProviders();
      const totalCount = providers.length;
      
      // Update all provider count elements
      const countElements = document.querySelectorAll('[data-provider-count], .provider-count, .anbieter-count');
      countElements.forEach(el => {
        if (el.textContent.match(/\d+/)) {
          el.textContent = el.textContent.replace(/\d+/, totalCount);
        }
      });

      console.log(`✅ Updated provider count to ${totalCount}`);
    } catch (err) {
      console.error('Error updating provider counts:', err);
    }
  },

  async updateCategorySpecificCounts() {
    try {
      const categories = ['firmengründung', 'versicherung', 'rechtsberatung'];
      
      for (const category of categories) {
        const { providers } = await ProviderService.getProvidersByCategory(category);
        const count = providers.length;
        
        // Update category-specific counts
        const categoryElements = document.querySelectorAll(`[data-category="${category}"] .provider-count`);
        categoryElements.forEach(el => {
          if (el.textContent.match(/\d+/)) {
            el.textContent = el.textContent.replace(/\d+/, count);
          }
        });
      }
    } catch (err) {
      console.error('Error updating category counts:', err);
    }
  }
};

// Trust Score updater
const TrustScoreUpdater = {
  updateTrustScore() {
    // Update main trust score display to 95/100 (from UX improvements)
    const trustScoreElements = document.querySelectorAll('.trust-score, [data-trust-score]');
    trustScoreElements.forEach(el => {
      if (el.textContent.includes('/100')) {
        el.textContent = el.textContent.replace(/\d+\/100/, '95/100');
      } else if (el.textContent.match(/\d+/)) {
        el.textContent = el.textContent.replace(/\d+/, '95');
      }
    });

    console.log('✅ Updated Trust Score to 95/100');
  }
};

// Main initialization
const initUXImprovements = async () => {
  console.log('🎯 Initializing Trustup24 UX Improvements V2...');
  
  try {
    // Initialize Supabase
    initializeSupabase();
    
    // Wait for React app to load
    await waitForReactApp();
    
    // Initialize components
    ScrollFix.init();
    SmartMatching.handleMatchingForm();
    
    // Update data
    await ProviderCountUpdater.updateCounts();
    await ProviderCountUpdater.updateCategorySpecificCounts();
    TrustScoreUpdater.updateTrustScore();
    
    // Set up periodic updates
    setInterval(async () => {
      await ProviderCountUpdater.updateCounts();
      TrustScoreUpdater.updateTrustScore();
    }, CONFIG.ui.trustScoreUpdateInterval);
    
    console.log('✅ Trustup24 UX Improvements V2 initialized successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing UX improvements:', error);
  }
};

// Wait for React app to load
const waitForReactApp = () => {
  return new Promise((resolve) => {
    const checkReactApp = () => {
      const reactRoot = document.getElementById('root');
      if (reactRoot && reactRoot.children.length > 0) {
        console.log('✅ React app detected');
        resolve();
      } else {
        setTimeout(checkReactApp, 100);
      }
    };
    checkReactApp();
  });
};

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUXImprovements);
} else {
  initUXImprovements();
}

console.log('📋 Trustup24 UX Improvements V2 loaded successfully!');
