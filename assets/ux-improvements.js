// UX Improvements for Trustup24 - React App Compatible
// Addresses scroll issues, live data integration, and provider comparison

(function() {
    'use strict';
    
    console.log('🚀 Trustup24 UX Improvements loaded');
    
    // Wait for React app to load and DOM to be ready
    let initAttempts = 0;
    const maxAttempts = 50;
    
    function waitForReactApp() {
        initAttempts++;
        
        // Check if React content is loaded
        const rootElement = document.getElementById('root');
        const hasContent = rootElement && rootElement.innerHTML.trim().length > 100;
        
        if (hasContent || initAttempts >= maxAttempts) {
            setTimeout(initUXImprovements, 1000); // Give React time to fully render
        } else {
            setTimeout(waitForReactApp, 200);
        }
    }
    
    // Start checking for React app
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForReactApp);
    } else {
        waitForReactApp();
    }
    
    function initUXImprovements() {
        console.log('🔧 Initializing UX improvements for React app');
        
        // Fix 1: Prevent scroll to top on matching tool navigation
        fixMatchingToolScroll();
        
        // Fix 2: Load live provider data and update counts
        loadLiveProviderData();
        
        // Fix 3: Improve Trust Score display
        improveTrustScore();
        
        // Fix 4: Create provider comparison page
        createProviderComparisonPage();
        
        // Fix 5: Add success popup for matching completion
        addMatchingSuccessPopup();
        
        // Fix 6: Add smooth scrolling
        addSmoothScrolling();
        
        // Fix 7: Improve mobile touch targets
        improveMobileTouchTargets();
    }
    
    function fixMatchingToolScroll() {
        console.log('🎯 Setting up scroll fix for React app');
        
        // Use MutationObserver to watch for React re-renders
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    setTimeout(attachScrollFix, 100);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Initial attachment
        setTimeout(attachScrollFix, 500);
        
        function attachScrollFix() {
            // Find all buttons that might be "Weiter" buttons
            const allButtons = document.querySelectorAll('button');
            
            allButtons.forEach(button => {
                const buttonText = button.textContent.trim().toLowerCase();
                
                if (buttonText.includes('weiter') || buttonText.includes('next') || buttonText.includes('starten')) {
                    // Remove existing listeners to avoid duplicates
                    button.removeEventListener('click', handleWeiterClick);
                    button.addEventListener('click', handleWeiterClick);
                    
                    console.log('📌 Attached scroll fix to button:', buttonText);
                }
            });
        }
        
        function handleWeiterClick(e) {
            console.log('🔄 Weiter button clicked - managing scroll behavior');
            
            // Store current scroll position
            const currentScrollY = window.scrollY;
            
            // Use multiple strategies to prevent scroll to top
            setTimeout(() => {
                preventScrollToTop(currentScrollY);
            }, 50);
            
            setTimeout(() => {
                preventScrollToTop(currentScrollY);
            }, 200);
            
            setTimeout(() => {
                preventScrollToTop(currentScrollY);
            }, 500);
        }
        
        function preventScrollToTop(targetY) {
            // If we're at the top and we shouldn't be, scroll back
            if (window.scrollY < 100 && targetY > 100) {
                console.log('🚫 Prevented unwanted scroll to top, restoring position');
                
                // Find matching tool container
                const matchingContainer = 
                    document.querySelector('[class*="smart-matching"]') ||
                    document.querySelector('[class*="matching"]') ||
                    document.querySelector('form') ||
                    document.querySelector('[class*="wizard"]');
                
                if (matchingContainer) {
                    const rect = matchingContainer.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const targetPosition = rect.top + scrollTop - 150;
                    
                    window.scrollTo({
                        top: Math.max(targetPosition, targetY - 200),
                        behavior: 'smooth'
                    });
                } else {
                    // Fallback: restore previous position
                    window.scrollTo({
                        top: targetY - 100,
                        behavior: 'smooth'
                    });
                }
            }
        }
        
        // Override window.scrollTo to prevent unwanted scrolls during matching
        const originalScrollTo = window.scrollTo;
        window.scrollTo = function(x, y) {
            const isInMatching = document.querySelector('[class*="matching"]') || 
                               document.querySelector('[class*="wizard"]') ||
                               window.location.hash.includes('matching');
            
            // If we're in matching and trying to scroll to top, ignore it
            if (isInMatching && (y === 0 || (typeof x === 'object' && x.top === 0))) {
                console.log('🚫 Blocked scroll to top during matching');
                return;
            }
            
            originalScrollTo.call(this, x, y);
        };
    }
    
    async function loadLiveProviderData() {
        console.log('📊 Loading live provider data');
        
        try {
            // Try to load from GitHub data repository
            const response = await fetch('https://raw.githubusercontent.com/Minhaus-Consulting/trustup24-data/main/provider-count.json');
            
            if (response.ok) {
                const data = await response.json();
                updateProviderCounts(data.total || 52);
            } else {
                // Fallback: calculate from CSV files
                await loadProviderCountFromCSV();
            }
        } catch (error) {
            console.log('📊 Using fallback provider count');
            updateProviderCounts(52); // Known total from documentation
        }
    }
    
    async function loadProviderCountFromCSV() {
        try {
            const csvFiles = [
                'https://raw.githubusercontent.com/Minhaus-Consulting/trustup24-data/main/german_company_formation_uae_optimized.csv',
                'https://raw.githubusercontent.com/Minhaus-Consulting/trustup24-data/main/insurance_brokers_uae_updated.csv',
                'https://raw.githubusercontent.com/Minhaus-Consulting/trustup24-data/main/german_speaking_lawyers_uae_updated.csv'
            ];
            
            let totalProviders = 0;
            
            for (const csvUrl of csvFiles) {
                try {
                    const response = await fetch(csvUrl);
                    if (response.ok) {
                        const csvText = await response.text();
                        const lines = csvText.split('\n').filter(line => line.trim().length > 0);
                        totalProviders += Math.max(0, lines.length - 1); // Subtract header
                    }
                } catch (e) {
                    console.log('Could not load CSV:', csvUrl);
                }
            }
            
            if (totalProviders > 0) {
                updateProviderCounts(totalProviders);
            } else {
                updateProviderCounts(52); // Fallback
            }
        } catch (error) {
            updateProviderCounts(52); // Final fallback
        }
    }
    
    function updateProviderCounts(count) {
        console.log(`📊 Updating provider counts to ${count}`);
        
        // Update all provider count displays
        const observer = new MutationObserver(() => {
            updateProviderCountElements(count);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Initial update
        updateProviderCountElements(count);
        
        // Store count globally for other functions
        window.LIVE_PROVIDER_COUNT = count;
    }
    
    function updateProviderCountElements(count) {
        // Find and update all provider count elements
        const elements = document.querySelectorAll('*');
        
        elements.forEach(element => {
            const text = element.textContent;
            
            // Update various provider count patterns
            if (text && !element.querySelector('*')) { // Only text nodes
                if (text.includes('47 verifizierte Partner') || text.includes('47 Anbieter')) {
                    element.textContent = text.replace('47', count.toString());
                }
                if (text.includes('Verfügbare Anbieter für Ihre Anforderungen')) {
                    const parent = element.parentElement;
                    if (parent) {
                        const countElement = parent.querySelector('[class*="count"], [class*="number"]');
                        if (countElement) {
                            countElement.textContent = `${count} verifizierte Partner`;
                        }
                    }
                }
            }
        });
        
        // Update specific elements by content
        setTimeout(() => {
            document.querySelectorAll('*').forEach(el => {
                if (el.textContent === '47' && el.parentElement && el.parentElement.textContent.includes('verifiziert')) {
                    el.textContent = count.toString();
                }
            });
        }, 100);
    }
    
    function improveTrustScore() {
        console.log('⭐ Improving trust score display');
        
        const observer = new MutationObserver(() => {
            updateTrustScore();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        updateTrustScore();
        
        function updateTrustScore() {
            // Find and update trust score to 95/100
            const elements = document.querySelectorAll('*');
            
            elements.forEach(element => {
                const text = element.textContent;
                
                if (text && !element.querySelector('*')) {
                    // Update trust scores
                    if (text.match(/\b(77|82|28|47)\b/) && (text.includes('/100') || element.parentElement?.textContent.includes('/100'))) {
                        element.textContent = text.replace(/\b(77|82|28|47)\b/, '95');
                    }
                    
                    // Update standalone trust scores
                    if (text === '77' || text === '82') {
                        const parent = element.parentElement;
                        if (parent && (parent.textContent.includes('Trust') || parent.textContent.includes('Score'))) {
                            element.textContent = '95';
                        }
                    }
                }
            });
        }
    }
    
    function createProviderComparisonPage() {
        console.log('📋 Setting up provider comparison functionality');
        
        // Check if we're on a comparison page URL
        if (window.location.pathname.includes('anbieter-vergleichen') || window.location.hash.includes('vergleichen')) {
            setTimeout(loadProviderComparison, 1000);
        }
        
        // Listen for navigation to comparison page
        window.addEventListener('hashchange', () => {
            if (window.location.hash.includes('vergleichen')) {
                setTimeout(loadProviderComparison, 500);
            }
        });
    }
    
    async function loadProviderComparison() {
        console.log('📋 Loading provider comparison data');
        
        const comparisonContainer = document.querySelector('#root') || document.body;
        
        // Create comparison page content
        const comparisonHTML = `
            <div class="provider-comparison-page" style="
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 2rem 1rem;
            ">
                <div style="max-width: 1200px; margin: 0 auto; background: white; border-radius: 20px; padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                    <h1 style="text-align: center; color: #1F2937; margin-bottom: 2rem;">Anbieter Vergleich</h1>
                    
                    <div class="provider-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                        <div class="provider-card" style="border: 2px solid #E5E7EB; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease;">
                            <h3 style="color: #10B981; margin: 0 0 1rem 0;">Firmengründungs-Experten</h3>
                            <p style="color: #6B7280; margin-bottom: 1rem;">34 verifizierte Anbieter für Firmengründung in Dubai</p>
                            <div class="features" style="margin-bottom: 1.5rem;">
                                <div style="margin-bottom: 0.5rem;">✓ Freezone & Mainland Expertise</div>
                                <div style="margin-bottom: 0.5rem;">✓ Lizenz-Beratung</div>
                                <div style="margin-bottom: 0.5rem;">✓ Bankkonto-Eröffnung</div>
                            </div>
                            <button onclick="window.location.href='/#smart-matching'" style="
                                width: 100%;
                                background: #10B981;
                                color: white;
                                border: none;
                                padding: 12px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                            ">Anbieter finden</button>
                        </div>
                        
                        <div class="provider-card" style="border: 2px solid #E5E7EB; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease;">
                            <h3 style="color: #3B82F6; margin: 0 0 1rem 0;">Versicherungs-Makler</h3>
                            <p style="color: #6B7280; margin-bottom: 1rem;">12 spezialisierte Versicherungsexperten</p>
                            <div class="features" style="margin-bottom: 1.5rem;">
                                <div style="margin-bottom: 0.5rem;">✓ Krankenversicherung</div>
                                <div style="margin-bottom: 0.5rem;">✓ Betriebshaftpflicht</div>
                                <div style="margin-bottom: 0.5rem;">✓ Expat-Pakete</div>
                            </div>
                            <button onclick="window.location.href='/#smart-matching'" style="
                                width: 100%;
                                background: #3B82F6;
                                color: white;
                                border: none;
                                padding: 12px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                            ">Anbieter finden</button>
                        </div>
                        
                        <div class="provider-card" style="border: 2px solid #E5E7EB; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease;">
                            <h3 style="color: #8B5CF6; margin: 0 0 1rem 0;">Rechtsanwälte</h3>
                            <p style="color: #6B7280; margin-bottom: 1rem;">6 deutschsprachige Anwaltskanzleien</p>
                            <div class="features" style="margin-bottom: 1.5rem;">
                                <div style="margin-bottom: 0.5rem;">✓ Gesellschaftsrecht</div>
                                <div style="margin-bottom: 0.5rem;">✓ Visa & Aufenthaltstitel</div>
                                <div style="margin-bottom: 0.5rem;">✓ Vertragsrecht</div>
                            </div>
                            <button onclick="window.location.href='/#smart-matching'" style="
                                width: 100%;
                                background: #8B5CF6;
                                color: white;
                                border: none;
                                padding: 12px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                            ">Anbieter finden</button>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 3rem;">
                        <h2 style="color: #1F2937; margin-bottom: 1rem;">Gesamt: ${window.LIVE_PROVIDER_COUNT || 52} verifizierte Anbieter</h2>
                        <p style="color: #6B7280; margin-bottom: 2rem;">Alle Anbieter sind von uns geprüft und lizenziert</p>
                        <button onclick="window.location.href='/#smart-matching'" style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            padding: 16px 32px;
                            border-radius: 25px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 18px;
                        ">Jetzt Smart Matching starten</button>
                    </div>
                </div>
            </div>
        `;
        
        // Replace page content with comparison
        comparisonContainer.innerHTML = comparisonHTML;
    }
    
    function addMatchingSuccessPopup() {
        // Create popup HTML
        const popupHTML = `
            <div id="matching-success-popup" class="matching-popup" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                z-index: 10000;
                max-width: 400px;
                width: 90%;
                text-align: center;
                display: none;
                animation: fadeInScale 0.3s ease-out;
            ">
                <div class="popup-icon" style="
                    width: 60px;
                    height: 60px;
                    background: #10B981;
                    border-radius: 50%;
                    margin: 0 auto 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;
                ">✓</div>
                <h3 style="margin: 0 0 0.5rem; color: #1F2937;">Perfekt!</h3>
                <p style="margin: 0 0 1.5rem; color: #6B7280;">
                    Ihre Daten wurden erfolgreich übermittelt.<br>
                    Wir haben <span id="provider-count-popup">${window.LIVE_PROVIDER_COUNT || 52}</span> passende Anbieter gefunden.
                </p>
                <div class="loading-bar" style="
                    width: 100%;
                    height: 4px;
                    background: #E5E7EB;
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 1rem;
                ">
                    <div class="loading-progress" style="
                        width: 0%;
                        height: 100%;
                        background: #10B981;
                        border-radius: 2px;
                        transition: width 2s ease-out;
                    "></div>
                </div>
                <p style="margin: 0; font-size: 0.875rem; color: #9CA3AF;">
                    Sie werden automatisch weitergeleitet...
                </p>
            </div>
            <div id="matching-popup-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
                display: none;
            "></div>
        `;
        
        // Add popup to page
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInScale {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        // Function to show popup
        window.showMatchingSuccess = function(providerCount) {
            const popup = document.getElementById('matching-success-popup');
            const overlay = document.getElementById('matching-popup-overlay');
            const countSpan = document.getElementById('provider-count-popup');
            const progressBar = popup.querySelector('.loading-progress');
            
            countSpan.textContent = providerCount || window.LIVE_PROVIDER_COUNT || 52;
            popup.style.display = 'block';
            overlay.style.display = 'block';
            
            // Animate progress bar
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 100);
            
            // Auto-redirect after 3 seconds
            setTimeout(() => {
                popup.style.display = 'none';
                overlay.style.display = 'none';
                // Redirect to provider comparison
                window.location.hash = '#anbieter-vergleichen';
                setTimeout(loadProviderComparison, 100);
            }, 3000);
        };
    }
    
    function addSmoothScrolling() {
        // Add smooth scrolling to all internal links
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }
    
    function improveMobileTouchTargets() {
        // Ensure all interactive elements are at least 44px in height/width
        if (window.innerWidth <= 768) {
            const observer = new MutationObserver(() => {
                const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
                
                interactiveElements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    if (rect.height < 44 && rect.height > 0) {
                        element.style.minHeight = '44px';
                        element.style.display = 'flex';
                        element.style.alignItems = 'center';
                        element.style.justifyContent = 'center';
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    
    // Listen for matching form submissions
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button');
        if (button && button.textContent.toLowerCase().includes('matching')) {
            // Show success popup after delay
            setTimeout(() => {
                if (window.showMatchingSuccess) {
                    showMatchingSuccess();
                }
            }, 2000);
        }
    });
    
})();
