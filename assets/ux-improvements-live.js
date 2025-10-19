/**
 * TRUSTUP24 UX IMPROVEMENTS - LIVE DATA VERSION
 * Direct integration with real provider data (526 providers)
 * Bypasses Supabase for immediate data visibility
 */

import { ALL_REAL_PROVIDERS, REAL_CATEGORIES, REAL_SERVICES, REAL_DATA_STATS } from './real-provider-data.js';

console.log('🚀 Trustup24 UX Improvements - Live Data Version Loading...');
console.log(`📊 Loading ${REAL_DATA_STATS.totalProviders} real providers...`);

// Configuration with live data
const CONFIG = {
  liveData: {
    enabled: true,
    totalProviders: REAL_DATA_STATS.totalProviders,
    verifiedProviders: REAL_DATA_STATS.verifiedProviders,
    featuredProviders: REAL_DATA_STATS.featuredProviders,
    avgTrustScore: REAL_DATA_STATS.avgTrustScore,
    categories: REAL_DATA_STATS.categories
  },
  ui: {
    animationDuration: 300,
    scrollOffset: 100,
    itemsPerPage: 12,
    maxSearchResults: 50
  }
};

// Live data service using real provider data
const LiveDataService = {
  // Get all providers
  async getProviders(filters = {}) {
    try {
      let providers = [...ALL_REAL_PROVIDERS];
      
      // Apply filters
      if (filters.category) {
        providers = providers.filter(p => p.category === filters.category);
      }
      
      if (filters.minTrustScore) {
        providers = providers.filter(p => p.trust_score >= filters.minTrustScore);
      }
      
      if (filters.isVerified) {
        providers = providers.filter(p => p.is_verified);
      }
      
      if (filters.isFeatured) {
        providers = providers.filter(p => p.is_featured);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        providers = providers.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.area.toLowerCase().includes(searchTerm) ||
          p.services.some(s => {
            const service = REAL_SERVICES.find(rs => rs.id === s);
            return service && service.name.toLowerCase().includes(searchTerm);
          })
        );
      }
      
      // Sort by trust score (default)
      if (!filters.sortBy || filters.sortBy === 'trust_score') {
        providers.sort((a, b) => b.trust_score - a.trust_score);
      } else if (filters.sortBy === 'name') {
        providers.sort((a, b) => a.name.localeCompare(b.name));
      } else if (filters.sortBy === 'founded_year') {
        providers.sort((a, b) => b.founded_year - a.founded_year);
      }
      
      return { providers, error: null, total: providers.length };
    } catch (err) {
      console.error('Error getting providers:', err);
      return { providers: [], error: err.message, total: 0 };
    }
  },

  // Get providers by category
  async getProvidersByCategory(categorySlug) {
    const category = REAL_CATEGORIES.find(c => c.slug === categorySlug);
    if (!category) {
      return { providers: [], error: 'Category not found', total: 0 };
    }
    
    return this.getProviders({ category: category.id });
  },

  // Get single provider
  async getProvider(slug) {
    const provider = ALL_REAL_PROVIDERS.find(p => p.slug === slug);
    if (!provider) {
      return { provider: null, error: 'Provider not found' };
    }
    return { provider, error: null };
  },

  // Smart matching
  async smartMatch(criteria) {
    try {
      let providers = [...ALL_REAL_PROVIDERS];
      
      // Apply matching logic
      const matches = providers.map(provider => {
        let matchingScore = provider.trust_score;
        
        // Category match
        if (criteria.category && provider.category === criteria.category) {
          matchingScore += 10;
        }
        
        // Service match
        if (criteria.services && criteria.services.length > 0) {
          const serviceMatches = criteria.services.filter(s => provider.services.includes(s)).length;
          matchingScore += serviceMatches * 5;
        }
        
        // Language match
        if (criteria.language && provider.languages.includes(criteria.language)) {
          matchingScore += 5;
        }
        
        // Timeline match
        if (criteria.timeline === 'urgent' && provider.avg_response_time_hours <= 2) {
          matchingScore += 10;
        }
        
        // Experience match
        if (criteria.experience) {
          const yearsInBusiness = new Date().getFullYear() - provider.founded_year;
          if (criteria.experience === 'senior' && yearsInBusiness >= 10) {
            matchingScore += 8;
          } else if (criteria.experience === 'experienced' && yearsInBusiness >= 5) {
            matchingScore += 5;
          }
        }
        
        // Verification bonus
        if (provider.is_verified) {
          matchingScore += 5;
        }
        
        // Featured bonus
        if (provider.is_featured) {
          matchingScore += 3;
        }
        
        // High response rate bonus
        if (provider.response_rate_percent >= 95) {
          matchingScore += 3;
        }
        
        return {
          ...provider,
          matching_score: Math.min(100, matchingScore)
        };
      });

      // Sort by matching score and return top matches
      matches.sort((a, b) => b.matching_score - a.matching_score);
      
      return { matches: matches.slice(0, 10), error: null };
    } catch (err) {
      console.error('Smart matching error:', err);
      return { matches: [], error: err.message };
    }
  },

  // Get categories
  async getCategories() {
    return { categories: REAL_CATEGORIES, error: null };
  },

  // Get services
  async getServices() {
    return { services: REAL_SERVICES, error: null };
  },

  // Create lead
  async createLead(leadData) {
    try {
      const lead = {
        ...leadData,
        id: `lead_${Date.now()}`,
        status: 'new',
        source: 'website',
        created_at: new Date().toISOString(),
        // Add real data context
        total_providers_available: CONFIG.liveData.totalProviders,
        verified_providers_available: CONFIG.liveData.verifiedProviders
      };

      console.log('✅ Lead created with live data context:', lead);
      
      // In a real implementation, this would send to a backend
      // For now, we'll store in localStorage for demo purposes
      const existingLeads = JSON.parse(localStorage.getItem('trustup24_leads') || '[]');
      existingLeads.push(lead);
      localStorage.setItem('trustup24_leads', JSON.stringify(existingLeads));
      
      return { lead, error: null };
    } catch (err) {
      console.error('Error creating lead:', err);
      return { lead: null, error: err.message };
    }
  }
};

// Enhanced UI Components with live data
const LiveUIComponents = {
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

    const getServiceNames = (serviceIds) => {
      return serviceIds.map(id => {
        const service = REAL_SERVICES.find(s => s.id === id);
        return service ? service.name : id;
      }).slice(0, 3); // Show max 3 services
    };

    return `
      <div class="provider-card bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200" data-provider-id="${provider.id}">
        <!-- Header -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">${provider.name}</h3>
            <p class="text-gray-600 text-sm mb-2">${provider.short_description}</p>
            <div class="text-xs text-gray-500 mb-2">
              <span>📍 ${provider.area}, ${provider.city}</span>
              <span class="ml-2">📅 Since ${provider.founded_year}</span>
              <span class="ml-2">👥 ${provider.team_size}</span>
            </div>
          </div>
          <div class="flex flex-col items-end">
            ${provider.is_featured ? '<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-1">Featured</span>' : ''}
            ${provider.is_verified ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>' : ''}
          </div>
        </div>

        <!-- Trust Score -->
        <div class="flex items-center mb-4">
          <div class="px-3 py-1 rounded-full text-sm font-medium text-white" style="background-color: ${getTrustScoreColor(provider.trust_score)}">
            Trust Score: ${provider.trust_score}/100
          </div>
          <span class="ml-2 text-sm text-gray-500">${getTrustScoreLabel(provider.trust_score)}</span>
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
        ` : `
          <div class="flex items-center mb-4">
            <span class="text-sm text-gray-500">No reviews yet • New provider</span>
          </div>
        `}

        <!-- Services -->
        <div class="mb-4">
          <div class="flex flex-wrap gap-1">
            ${getServiceNames(provider.services).map(service => `
              <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">${service}</span>
            `).join('')}
            ${provider.services.length > 3 ? `<span class="text-xs text-gray-500">+${provider.services.length - 3} more</span>` : ''}
          </div>
        </div>

        <!-- Languages -->
        <div class="mb-4">
          <div class="flex flex-wrap gap-1">
            ${provider.languages.map(lang => `
              <span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">${lang}</span>
            `).join('')}
          </div>
        </div>

        <!-- Certifications -->
        ${provider.certifications && provider.certifications.length > 0 ? `
          <div class="mb-4">
            <div class="flex flex-wrap gap-1">
              ${provider.certifications.map(cert => `
                <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">✓ ${cert}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Response Time -->
        <div class="mb-4 text-sm text-gray-600">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Response time: ~${provider.avg_response_time_hours}h (${provider.response_rate_percent}% rate)
          </div>
        </div>

        <!-- Contact Info -->
        <div class="mb-4 text-sm text-gray-600">
          <div class="flex items-center mb-1">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href="tel:${provider.phone}" class="text-blue-600 hover:underline">${provider.phone}</a>
          </div>
          ${provider.whatsapp ? `
            <div class="flex items-center mb-1">
              <span class="text-green-600 mr-1">📱</span>
              <a href="https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, '')}" class="text-green-600 hover:underline">WhatsApp</a>
            </div>
          ` : ''}
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-5 0-9-4-9-9m9 9c5 0-9-4 9-9m-9 9v-9m0 9c-5 0-9-4-9-9" />
            </svg>
            <a href="${provider.website}" target="_blank" class="text-blue-600 hover:underline">Website</a>
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

  createProviderList(providers, containerId) {
    const container = document.getElementById(containerId) || document.querySelector(`[data-container="${containerId}"]`);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    if (providers.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No providers found</h3>
          <p class="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
          <button onclick="resetFilters()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Reset Filters
          </button>
        </div>
      `;
      return;
    }

    const providerCards = providers.map(provider => this.createProviderCard(provider)).join('');
    
    container.innerHTML = `
      <div class="mb-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-900">
            ${providers.length} Provider${providers.length !== 1 ? 's' : ''} Found
          </h2>
          <div class="text-sm text-gray-600">
            From ${CONFIG.liveData.totalProviders} total providers • ${CONFIG.liveData.verifiedProviders} verified
          </div>
        </div>
      </div>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        ${providerCards}
      </div>
    `;
  },

  updateProviderCounts() {
    // Update all provider count displays with real data
    const countElements = document.querySelectorAll('[data-provider-count], .provider-count, .anbieter-count');
    countElements.forEach(el => {
      if (el.textContent.match(/\d+/)) {
        el.textContent = el.textContent.replace(/\d+/, CONFIG.liveData.totalProviders);
      }
    });

    // Update category-specific counts
    REAL_CATEGORIES.forEach(category => {
      const categoryElements = document.querySelectorAll(`[data-category="${category.slug}"] .provider-count`);
      categoryElements.forEach(el => {
        if (el.textContent.match(/\d+/)) {
          el.textContent = el.textContent.replace(/\d+/, category.provider_count);
        }
      });
    });

    console.log(`✅ Updated provider counts: ${CONFIG.liveData.totalProviders} total`);
  },

  updateTrustScore() {
    // Update trust score displays with real average
    const trustScoreElements = document.querySelectorAll('.trust-score, [data-trust-score]');
    trustScoreElements.forEach(el => {
      if (el.textContent.includes('/100')) {
        el.textContent = el.textContent.replace(/\d+\/100/, `${CONFIG.liveData.avgTrustScore}/100`);
      } else if (el.textContent.match(/\d+/)) {
        el.textContent = el.textContent.replace(/\d+/, CONFIG.liveData.avgTrustScore);
      }
    });

    console.log(`✅ Updated Trust Score to ${CONFIG.liveData.avgTrustScore}/100`);
  }
};

// Provider page integration
const ProviderPageIntegration = {
  async initializeProviderPage() {
    // Check if we're on the provider comparison page
    const isProviderPage = window.location.pathname.includes('anbieter-vergleichen') || 
                          document.querySelector('[data-page="providers"]') ||
                          document.querySelector('.provider-list-container');

    if (!isProviderPage) {
      console.log('Not on provider page, skipping provider integration');
      return;
    }

    console.log('🔄 Initializing provider page with live data...');

    try {
      // Load all providers
      const { providers, error, total } = await LiveDataService.getProviders();
      
      if (error) {
        console.error('Error loading providers:', error);
        return;
      }

      console.log(`✅ Loaded ${total} providers for display`);

      // Find provider container
      let container = document.querySelector('.provider-list-container') ||
                     document.querySelector('[data-container="providers"]') ||
                     document.querySelector('#provider-list') ||
                     document.querySelector('.anbieter-list');

      if (!container) {
        // Create container if it doesn't exist
        const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
        container = document.createElement('div');
        container.className = 'provider-list-container mt-8';
        container.id = 'provider-list';
        mainContent.appendChild(container);
      }

      // Display providers
      LiveUIComponents.createProviderList(providers, container.id);

      // Setup filters and search
      this.setupFilters();
      this.setupSearch();

      console.log('✅ Provider page initialized successfully');

    } catch (err) {
      console.error('Error initializing provider page:', err);
    }
  },

  setupFilters() {
    // Setup category filters
    const categoryFilters = document.querySelectorAll('[data-filter="category"]');
    categoryFilters.forEach(filter => {
      filter.addEventListener('click', async (e) => {
        e.preventDefault();
        const category = filter.getAttribute('data-category');
        await this.filterProviders({ category });
      });
    });

    // Setup trust score filters
    const trustScoreFilters = document.querySelectorAll('[data-filter="trust-score"]');
    trustScoreFilters.forEach(filter => {
      filter.addEventListener('click', async (e) => {
        e.preventDefault();
        const minScore = parseInt(filter.getAttribute('data-min-score'));
        await this.filterProviders({ minTrustScore: minScore });
      });
    });

    // Setup verification filter
    const verifiedFilter = document.querySelector('[data-filter="verified"]');
    if (verifiedFilter) {
      verifiedFilter.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.filterProviders({ isVerified: true });
      });
    }
  },

  setupSearch() {
    const searchInput = document.querySelector('input[placeholder*="Anbieter"], input[placeholder*="Provider"], .provider-search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
          const searchTerm = e.target.value.trim();
          await this.filterProviders({ search: searchTerm });
        }, 300);
      });
    }
  },

  async filterProviders(filters) {
    console.log('🔍 Filtering providers:', filters);
    
    try {
      const { providers, error, total } = await LiveDataService.getProviders(filters);
      
      if (error) {
        console.error('Error filtering providers:', error);
        return;
      }

      const container = document.querySelector('#provider-list') || document.querySelector('.provider-list-container');
      if (container) {
        LiveUIComponents.createProviderList(providers, container.id);
      }

      console.log(`✅ Filtered to ${total} providers`);

    } catch (err) {
      console.error('Error filtering providers:', err);
    }
  }
};

// Smart matching integration
const SmartMatchingIntegration = {
  async handleMatchingForm() {
    const matchingForms = document.querySelectorAll('#smart-matching-form, .smart-matching-form, [data-form="matching"]');
    
    matchingForms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.processMatching(form);
      });
    });
  },

  async processMatching(form) {
    const formData = new FormData(form);
    const criteria = {
      category: formData.get('category'),
      services: formData.getAll('services'),
      budget: formData.get('budget'),
      timeline: formData.get('timeline'),
      language: formData.get('language') || 'English',
      experience: formData.get('experience')
    };

    console.log('🎯 Processing smart matching:', criteria);

    try {
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = `Finding Matches from ${CONFIG.liveData.totalProviders} Providers...`;
        submitBtn.disabled = true;
      }

      const { matches, error } = await LiveDataService.smartMatch(criteria);
      
      if (error) {
        console.error('Matching error:', error);
        this.showError('Error finding matches. Please try again.');
        return;
      }

      console.log(`✅ Found ${matches.length} matching providers`);
      this.showMatches(matches);
      
    } catch (err) {
      console.error('Matching error:', err);
      this.showError('Error finding matches. Please try again.');
    } finally {
      // Reset button
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Find Perfect Matches';
        submitBtn.disabled = false;
      }
    }
  },

  showMatches(matches) {
    if (matches.length === 0) {
      this.showError(`No matches found from our ${CONFIG.liveData.totalProviders} providers. Please try different criteria.`);
      return;
    }

    // Create and show modal with matches
    const modal = this.createMatchingModal(matches);
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // Add scroll prevention
    document.body.style.overflow = 'hidden';
  },

  createMatchingModal(matches) {
    return `
      <div id="matching-success-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-6xl w-full mx-4 max-h-90vh overflow-y-auto">
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
              We found <strong>${matches.length} providers</strong> from our database of <strong>${CONFIG.liveData.totalProviders} verified companies</strong> that match your criteria. 
              <span class="block mt-1 text-sm">
                ✅ ${CONFIG.liveData.verifiedProviders} verified providers • ⭐ Average Trust Score: ${CONFIG.liveData.avgTrustScore}/100
              </span>
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            ${matches.map(provider => LiveUIComponents.createProviderCard(provider)).join('')}
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

  showError(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
};

// Global functions for UI interactions
window.viewProviderDetails = async (providerId) => {
  console.log('View provider details:', providerId);
  const provider = ALL_REAL_PROVIDERS.find(p => p.id === providerId);
  if (provider) {
    // Create and show provider details modal
    // Implementation would go here
    console.log('Provider details:', provider);
  }
};

window.contactProvider = (providerId) => {
  console.log('Contact provider:', providerId);
  // Show lead form for specific provider
  // Implementation would go here
};

window.closeMatchingModal = () => {
  const modal = document.getElementById('matching-success-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
};

window.resetFilters = async () => {
  const { providers } = await LiveDataService.getProviders();
  const container = document.querySelector('#provider-list') || document.querySelector('.provider-list-container');
  if (container) {
    LiveUIComponents.createProviderList(providers, container.id);
  }
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

// Main initialization
const initLiveDataIntegration = async () => {
  console.log('🎯 Initializing Trustup24 Live Data Integration...');
  
  try {
    // Wait for DOM to be ready
    await waitForDOM();
    
    // Initialize components
    ScrollFix.init();
    
    // Update UI with live data
    LiveUIComponents.updateProviderCounts();
    LiveUIComponents.updateTrustScore();
    
    // Initialize provider page if applicable
    await ProviderPageIntegration.initializeProviderPage();
    
    // Setup smart matching
    SmartMatchingIntegration.handleMatchingForm();
    
    // Set up periodic updates
    setInterval(() => {
      LiveUIComponents.updateProviderCounts();
      LiveUIComponents.updateTrustScore();
    }, 30000);
    
    console.log('✅ Trustup24 Live Data Integration initialized successfully!');
    console.log(`📊 Live Data Stats: ${CONFIG.liveData.totalProviders} providers, ${CONFIG.liveData.verifiedProviders} verified, avg Trust Score ${CONFIG.liveData.avgTrustScore}/100`);
    
  } catch (error) {
    console.error('❌ Error initializing live data integration:', error);
  }
};

// Wait for DOM to be ready
const waitForDOM = () => {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });
};

// Start initialization
initLiveDataIntegration();

console.log('📋 Trustup24 Live Data Integration loaded successfully!');
