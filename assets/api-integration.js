/**
 * TRUSTUP24 API INTEGRATION
 * Modifies React app to load real provider data from local API
 * Replaces "0 gefunden" with actual provider data
 */

(function() {
    'use strict';
    
    console.log('🔗 Trustup24 API Integration Loading...');
    
    // Provider API endpoint
    const API_BASE = '/api/providers.json';
    
    // Global provider data
    let providerData = null;
    
    // Load provider data from API
    async function loadProviderData() {
        try {
            console.log('📊 Loading provider data from API...');
            const response = await fetch(API_BASE);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            providerData = await response.json();
            console.log('✅ Provider data loaded:', providerData.stats);
            return providerData;
        } catch (error) {
            console.error('❌ Failed to load provider data:', error);
            return null;
        }
    }
    
    // Inject provider data into React app
    function injectProviderData() {
        if (!providerData) return;
        
        // Update provider count displays
        const countElements = document.querySelectorAll('[data-testid="provider-count"], .provider-count');
        countElements.forEach(el => {
            if (el.textContent.includes('0 gefunden') || el.textContent.includes('0 ')) {
                el.textContent = `${providerData.stats.total_providers} gefunden`;
            }
        });
        
        // Replace "Keine Anbieter gefunden" message
        const noResultsElements = document.querySelectorAll('*');
        noResultsElements.forEach(el => {
            if (el.textContent && el.textContent.includes('Keine Anbieter gefunden')) {
                el.innerHTML = createProviderList();
            }
        });
        
        // Update category counts in filters
        Object.entries(providerData.stats.categories).forEach(([category, count]) => {
            const categoryElements = document.querySelectorAll(`*[data-category="${category}"], .category-${category}`);
            categoryElements.forEach(el => {
                const countSpan = el.querySelector('.count, .category-count');
                if (countSpan) {
                    countSpan.textContent = `(${count})`;
                }
            });
        });
    }
    
    // Create provider list HTML
    function createProviderList() {
        if (!providerData || !providerData.providers) return '';
        
        const providers = providerData.providers.slice(0, 10); // Show first 10
        
        return `
            <div class="provider-results">
                <div class="results-header">
                    <h2>${providerData.stats.total_providers} Verified Providers Found</h2>
                    <p>Real data from UAE business directory • ${providerData.stats.verified_providers} verified • ${providerData.stats.featured_providers} featured</p>
                </div>
                <div class="provider-grid">
                    ${providers.map(provider => createProviderCard(provider)).join('')}
                </div>
            </div>
        `;
    }
    
    // Create individual provider card
    function createProviderCard(provider) {
        const categoryIcon = getCategoryIcon(provider.category);
        const ratingStars = provider.rating > 0 ? '★'.repeat(Math.floor(provider.rating)) + '☆'.repeat(5 - Math.floor(provider.rating)) : 'No reviews yet';
        const badges = [];
        if (provider.featured) badges.push('<span class="badge featured">Featured</span>');
        if (provider.verified) badges.push('<span class="badge verified">✓ Verified</span>');
        
        return `
            <div class="provider-card">
                <div class="provider-header">
                    <div class="provider-icon">${categoryIcon}</div>
                    <div class="provider-title">
                        <h3>${provider.name}</h3>
                        <div class="provider-badges">${badges.join('')}</div>
                    </div>
                </div>
                <div class="provider-description">
                    <p>${provider.description}</p>
                </div>
                <div class="provider-details">
                    <div class="detail-item">
                        <span class="icon">📍</span>
                        <span>${provider.location}</span>
                    </div>
                    <div class="detail-item">
                        <span class="icon">⏱️</span>
                        <span>Response: ${provider.response_time}</span>
                    </div>
                    <div class="detail-item">
                        <span class="icon">🏛️</span>
                        <span>Est. ${provider.established}</span>
                    </div>
                </div>
                <div class="trust-score">
                    <div class="score-badge trust-score-${Math.floor(provider.trust_score / 10) * 10}">
                        Trust Score: ${provider.trust_score}/100
                    </div>
                    <div class="score-label">${getTrustScoreLabel(provider.trust_score)}</div>
                </div>
                <div class="provider-rating">
                    <div class="stars">${ratingStars}</div>
                    ${provider.rating > 0 ? `<span class="rating-text">${provider.rating} (${provider.review_count} reviews)</span>` : '<span class="rating-text">New provider</span>'}
                </div>
                <div class="provider-services">
                    ${provider.services.map(service => `<span class="service-tag">${service}</span>`).join('')}
                </div>
                <div class="provider-languages">
                    ${provider.languages.map(lang => `<span class="language-tag">${lang}</span>`).join('')}
                </div>
                <div class="provider-contact">
                    <div class="contact-info">
                        <a href="tel:${provider.contact.phone}" class="contact-link">📞 ${provider.contact.phone}</a>
                        <a href="${provider.contact.website}" class="contact-link" target="_blank">🌐 Website</a>
                        <a href="mailto:${provider.contact.email}" class="contact-link">✉️ ${provider.contact.email}</a>
                    </div>
                    <div class="provider-actions">
                        <button class="btn btn-outline">View Details</button>
                        <button class="btn btn-primary">Contact Now</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get category icon
    function getCategoryIcon(category) {
        const icons = {
            'firmengründung': '🏢',
            'rechtsberatung': '⚖️',
            'buchhaltung': '📊',
            'versicherung': '🛡️',
            'steuerberatung': '💰'
        };
        return icons[category] || '🏢';
    }
    
    // Get trust score label
    function getTrustScoreLabel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        return 'Fair';
    }
    
    // Add CSS styles
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .provider-results {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .results-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .results-header h2 {
                font-size: 2rem;
                color: #1a1a1a;
                margin-bottom: 10px;
            }
            
            .results-header p {
                color: #666;
                font-size: 1rem;
            }
            
            .provider-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .provider-card {
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                padding: 20px;
                background: white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .provider-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            }
            
            .provider-header {
                display: flex;
                align-items: flex-start;
                margin-bottom: 15px;
            }
            
            .provider-icon {
                font-size: 2rem;
                margin-right: 15px;
            }
            
            .provider-title h3 {
                font-size: 1.2rem;
                color: #1a1a1a;
                margin: 0 0 8px 0;
            }
            
            .provider-badges {
                display: flex;
                gap: 8px;
            }
            
            .badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 500;
            }
            
            .badge.featured {
                background: #fef3c7;
                color: #92400e;
            }
            
            .badge.verified {
                background: #d1fae5;
                color: #065f46;
            }
            
            .provider-description {
                margin-bottom: 15px;
            }
            
            .provider-description p {
                color: #666;
                line-height: 1.5;
                margin: 0;
            }
            
            .provider-details {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .detail-item {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 0.9rem;
                color: #666;
            }
            
            .trust-score {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .score-badge {
                padding: 6px 12px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .trust-score-90, .trust-score-100 {
                background: #10b981;
                color: white;
            }
            
            .trust-score-80 {
                background: #3b82f6;
                color: white;
            }
            
            .trust-score-70 {
                background: #f59e0b;
                color: white;
            }
            
            .score-label {
                font-size: 0.9rem;
                color: #666;
            }
            
            .provider-rating {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .stars {
                color: #fbbf24;
            }
            
            .rating-text {
                font-size: 0.9rem;
                color: #666;
            }
            
            .provider-services, .provider-languages {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 15px;
            }
            
            .service-tag, .language-tag {
                padding: 4px 8px;
                background: #f3f4f6;
                border-radius: 4px;
                font-size: 0.8rem;
                color: #374151;
            }
            
            .provider-contact {
                border-top: 1px solid #e5e7eb;
                padding-top: 15px;
            }
            
            .contact-info {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .contact-link {
                color: #3b82f6;
                text-decoration: none;
                font-size: 0.9rem;
            }
            
            .contact-link:hover {
                text-decoration: underline;
            }
            
            .provider-actions {
                display: flex;
                gap: 10px;
            }
            
            .btn {
                padding: 8px 16px;
                border-radius: 6px;
                border: none;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-outline {
                background: white;
                border: 1px solid #d1d5db;
                color: #374151;
            }
            
            .btn-outline:hover {
                background: #f9fafb;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover {
                background: #2563eb;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Monitor for React app changes
    function monitorReactApp() {
        const observer = new MutationObserver((mutations) => {
            let shouldInject = false;
            
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const text = node.textContent || '';
                        if (text.includes('0 gefunden') || text.includes('Keine Anbieter gefunden')) {
                            shouldInject = true;
                        }
                    }
                });
            });
            
            if (shouldInject) {
                setTimeout(injectProviderData, 500);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Initial injection after delay
        setTimeout(injectProviderData, 2000);
        
        // Periodic injection every 5 seconds
        setInterval(injectProviderData, 5000);
    }
    
    // Initialize API integration
    async function init() {
        console.log('🚀 Initializing Trustup24 API Integration...');
        
        // Add styles
        addStyles();
        
        // Load provider data
        await loadProviderData();
        
        if (providerData) {
            // Start monitoring React app
            monitorReactApp();
            
            // Initial injection
            setTimeout(injectProviderData, 1000);
            
            console.log('✅ API Integration initialized successfully');
        } else {
            console.error('❌ Failed to initialize API Integration - no provider data');
        }
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
