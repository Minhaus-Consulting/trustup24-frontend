/**
 * TRUSTUP24 REACT-SUPABASE INTEGRATION
 * This code will be integrated into the existing React app
 * Provides provider data, matching functionality, and lead management
 */

// 1. SUPABASE CLIENT SETUP (to be added to main app)
const SUPABASE_INTEGRATION = `
// Install: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
`;

// 2. PROVIDER SERVICE HOOK
const PROVIDER_HOOK = `
import { useState, useEffect } from 'react';
import { supabase } from './supabase-client';

export const useProviders = (filters = {}) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('providers')
        .select(\`
          *,
          provider_categories!inner(
            categories(*)
          ),
          reviews(rating, content, reviewer_name, source)
        \`)
        .eq('status', 'active')
        .order('trust_score', { ascending: false });

      // Apply filters
      if (filters.category) {
        query = query.eq('provider_categories.categories.slug', filters.category);
      }
      
      if (filters.minTrustScore) {
        query = query.gte('trust_score', filters.minTrustScore);
      }
      
      if (filters.language) {
        query = query.contains('languages', [filters.language]);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setProviders(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  return { providers, loading, error, refetch: fetchProviders };
};
`;

// 3. SMART MATCHING HOOK
const MATCHING_HOOK = `
export const useSmartMatching = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findMatches = async (criteria) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('providers')
        .select(\`
          *,
          provider_categories(
            categories(*)
          ),
          provider_services(
            services(*),
            price_from,
            price_to,
            currency
          ),
          reviews(rating)
        \`)
        .eq('status', 'active');

      // Apply matching criteria
      if (criteria.category) {
        query = query.eq('provider_categories.categories.slug', criteria.category);
      }
      
      if (criteria.services && criteria.services.length > 0) {
        query = query.in('provider_services.services.slug', criteria.services);
      }
      
      if (criteria.budget) {
        const budgetRanges = {
          'low': [0, 10000],
          'medium': [10000, 25000],
          'high': [25000, 50000],
          'premium': [50000, 999999]
        };
        
        const [min, max] = budgetRanges[criteria.budget] || [0, 999999];
        query = query.gte('provider_services.price_from', min)
                     .lte('provider_services.price_to', max);
      }
      
      if (criteria.language) {
        query = query.contains('languages', [criteria.language]);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Calculate matching scores
      const scoredMatches = (data || []).map(provider => {
        let matchingScore = provider.trust_score;
        
        // Boost score based on criteria match
        if (criteria.timeline === 'urgent' && provider.avg_response_time_hours <= 2) {
          matchingScore += 10;
        }
        
        if (criteria.experience === 'high' && provider.founded_year <= 2020) {
          matchingScore += 5;
        }
        
        // Response time bonus
        if (provider.response_rate_percent >= 95) {
          matchingScore += 3;
        }
        
        return {
          ...provider,
          matching_score: Math.min(100, matchingScore)
        };
      });

      // Sort by matching score
      scoredMatches.sort((a, b) => b.matching_score - a.matching_score);
      
      setMatches(scoredMatches.slice(0, 10)); // Top 10 matches
      
    } catch (err) {
      setError(err.message);
      console.error('Error in smart matching:', err);
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, findMatches };
};
`;

// 4. LEAD MANAGEMENT HOOK
const LEAD_HOOK = `
export const useLeadManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createLead = async (leadData) => {
    try {
      setLoading(true);
      setError(null);
      
      const lead = {
        ...leadData,
        status: 'new',
        source: 'website',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select()
        .single();

      if (error) throw error;
      
      return { success: true, lead: data };
      
    } catch (err) {
      setError(err.message);
      console.error('Error creating lead:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId, status, notes = '') => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          status, 
          notes, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;
      
      return { success: true, lead: data };
      
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { createLead, updateLeadStatus, loading, error };
};
`;

// 5. PROVIDER CARD COMPONENT
const PROVIDER_CARD_COMPONENT = `
import React from 'react';

export const ProviderCard = ({ provider, onContact, onViewDetails }) => {
  const getTrustScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrustScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    return 'Fair';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {provider.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2">
            {provider.short_description}
          </p>
        </div>
        
        {provider.is_featured && (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>

      {/* Trust Score */}
      <div className="flex items-center mb-4">
        <div className={\`px-3 py-1 rounded-full text-sm font-medium \${getTrustScoreColor(provider.trust_score)}\`}>
          Trust Score: {provider.trust_score}/100
        </div>
        <span className="ml-2 text-sm text-gray-500">
          {getTrustScoreLabel(provider.trust_score)}
        </span>
        {provider.is_verified && (
          <div className="ml-2 flex items-center text-green-600">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Verified</span>
          </div>
        )}
      </div>

      {/* Reviews */}
      {provider.google_rating && (
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={\`w-4 h-4 \${i < Math.floor(provider.google_rating) ? 'text-yellow-400' : 'text-gray-300'}\`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {provider.google_rating} ({provider.google_review_count} reviews)
            </span>
          </div>
        </div>
      )}

      {/* Languages */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {provider.languages.map((lang, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Response Time */}
      <div className="mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Response time: ~{provider.avg_response_time_hours}h
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={() => onViewDetails(provider)}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          View Details
        </button>
        <button
          onClick={() => onContact(provider)}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Contact Now
        </button>
      </div>
    </div>
  );
};
`;

// 6. MATCHING FORM COMPONENT
const MATCHING_FORM_COMPONENT = `
import React, { useState } from 'react';
import { useSmartMatching } from './hooks/useSmartMatching';

export const SmartMatchingForm = ({ onMatchesFound }) => {
  const { matches, loading, error, findMatches } = useSmartMatching();
  const [criteria, setCriteria] = useState({
    category: '',
    services: [],
    budget: '',
    timeline: '',
    language: 'Deutsch',
    experience: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await findMatches(criteria);
    if (matches.length > 0) {
      onMatchesFound(matches);
    }
  };

  const handleServiceToggle = (service) => {
    setCriteria(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Smart Matching</h2>
      
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Category
        </label>
        <select
          value={criteria.category}
          onChange={(e) => setCriteria(prev => ({ ...prev, category: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select a category</option>
          <option value="firmengründung">Firmengründung</option>
          <option value="versicherung">Versicherung</option>
          <option value="rechtsberatung">Rechtsberatung</option>
          <option value="buchhaltung">Buchhaltung</option>
          <option value="banking">Banking</option>
        </select>
      </div>

      {/* Services */}
      {criteria.category === 'firmengründung' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Services
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['dmcc-setup', 'ifza-setup', 'mainland-setup', 'residence-visa', 'banking-support'].map(service => (
              <label key={service} className="flex items-center">
                <input
                  type="checkbox"
                  checked={criteria.services.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                  className="mr-2"
                />
                <span className="text-sm capitalize">{service.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Budget Range
        </label>
        <select
          value={criteria.budget}
          onChange={(e) => setCriteria(prev => ({ ...prev, budget: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Any budget</option>
          <option value="low">Up to 10,000 AED</option>
          <option value="medium">10,000 - 25,000 AED</option>
          <option value="high">25,000 - 50,000 AED</option>
          <option value="premium">50,000+ AED</option>
        </select>
      </div>

      {/* Timeline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timeline
        </label>
        <select
          value={criteria.timeline}
          onChange={(e) => setCriteria(prev => ({ ...prev, timeline: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Flexible</option>
          <option value="urgent">Urgent (within 1 week)</option>
          <option value="fast">Fast (within 1 month)</option>
          <option value="normal">Normal (1-3 months)</option>
        </select>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Language
        </label>
        <select
          value={criteria.language}
          onChange={(e) => setCriteria(prev => ({ ...prev, language: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Deutsch">Deutsch</option>
          <option value="English">English</option>
          <option value="العربية">العربية</option>
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Finding Matches...' : 'Find Perfect Matches'}
      </button>

      {error && (
        <div className="text-red-600 text-sm mt-2">
          Error: {error}
        </div>
      )}
    </form>
  );
};
`;

// 7. LEAD FORM COMPONENT
const LEAD_FORM_COMPONENT = `
import React, { useState } from 'react';
import { useLeadManagement } from './hooks/useLeadManagement';

export const LeadForm = ({ selectedProviders = [], onSuccess }) => {
  const { createLead, loading, error } = useLeadManagement();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    service_category: '',
    services_needed: [],
    budget_range: '',
    timeline: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const leadData = {
      ...formData,
      matched_providers: selectedProviders.map(p => p.id),
      services_needed: formData.services_needed
    };

    const result = await createLead(leadData);
    
    if (result.success) {
      onSuccess && onSuccess(result.lead);
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        service_category: '',
        services_needed: [],
        budget_range: '',
        timeline: '',
        message: ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service Category *
        </label>
        <select
          name="service_category"
          value={formData.service_category}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select category</option>
          <option value="Firmengründung">Firmengründung</option>
          <option value="Versicherung">Versicherung</option>
          <option value="Rechtsberatung">Rechtsberatung</option>
          <option value="Buchhaltung">Buchhaltung</option>
          <option value="Banking">Banking</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Budget Range
        </label>
        <select
          name="budget_range"
          value={formData.budget_range}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select budget</option>
          <option value="low">Up to 10,000 AED</option>
          <option value="medium">10,000 - 25,000 AED</option>
          <option value="high">25,000 - 50,000 AED</option>
          <option value="premium">50,000+ AED</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timeline
        </label>
        <select
          name="timeline"
          value={formData.timeline}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Flexible</option>
          <option value="urgent">Urgent (within 1 week)</option>
          <option value="fast">Fast (within 1 month)</option>
          <option value="normal">Normal (1-3 months)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Please describe your requirements..."
        />
      </div>

      {selectedProviders.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Providers ({selectedProviders.length})
          </label>
          <div className="space-y-1">
            {selectedProviders.map(provider => (
              <div key={provider.id} className="text-sm text-gray-600">
                • {provider.name} (Trust Score: {provider.trust_score}/100)
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? 'Sending...' : 'Send Inquiry'}
      </button>

      {error && (
        <div className="text-red-600 text-sm">
          Error: {error}
        </div>
      )}
    </form>
  );
};
`;

// Write all components to separate files
const components = {
  'supabase-client.js': SUPABASE_INTEGRATION,
  'hooks/useProviders.js': PROVIDER_HOOK,
  'hooks/useSmartMatching.js': MATCHING_HOOK,
  'hooks/useLeadManagement.js': LEAD_HOOK,
  'components/ProviderCard.jsx': PROVIDER_CARD_COMPONENT,
  'components/SmartMatchingForm.jsx': MATCHING_FORM_COMPONENT,
  'components/LeadForm.jsx': LEAD_FORM_COMPONENT
};

// Export for file creation
module.exports = components;
