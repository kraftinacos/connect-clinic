/**
 * Connect Clinic PWA - App Logic
 * Client-side routing, page transitions, and app state management
 */

(function() {
    'use strict';

    // App Configuration
    const CONFIG = {
        transitionDuration: 200,
        cacheName: 'connect-clinic-pages',
        routes: {
            '/': 'home.html',
            '/adhd': 'adhd.html',
            '/anxiety': 'anxiety.html',
            '/depression': 'depression.html',
            '/about': 'about.html',
            '/book': 'book.html',
            '/faq': 'faq.html'
        }
    };

    // App State
    const state = {
        currentPath: window.location.pathname,
        isNavigating: false,
        offline: !navigator.onLine
    };

    // DOM Elements
    const contentEl = document.getElementById('content');
    const offlineIndicator = document.getElementById('offline-indicator');

    /**
     * Initialize the app
     */
    function init() {
        // Handle initial page load
        handleRoute(state.currentPath);

        // Setup event listeners
        setupEventListeners();

        // Setup offline detection
        setupOfflineDetection();

        // Update active navigation state
        updateActiveNav(state.currentPath);
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Handle clicks on data-link elements
        document.addEventListener('click', handleLinkClick);

        // Handle browser back/forward
        window.addEventListener('popstate', handlePopState);

        // Handle form submissions (prevent default, handle via JS)
        document.addEventListener('submit', handleFormSubmit);
    }

    /**
     * Handle clicks on internal links
     */
    function handleLinkClick(e) {
        const link = e.target.closest('[data-link]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('http')) return;

        e.preventDefault();
        navigateTo(href);
    }

    /**
     * Navigate to a new route
     */
    function navigateTo(path) {
        if (state.isNavigating || path === state.currentPath) return;

        state.isNavigating = true;

        // Update browser history
        window.history.pushState({ path }, '', path);

        // Handle the route
        handleRoute(path);
    }

    /**
     * Handle browser back/forward buttons
     */
    function handlePopState(e) {
        const path = e.state?.path || window.location.pathname;
        handleRoute(path);
    }

    /**
     * Handle routing logic
     */
    async function handleRoute(path) {
        // Normalize path
        path = path === '' ? '/' : path;
        state.currentPath = path;

        // Update active navigation
        updateActiveNav(path);

        // Get the page file for this route
        const pageFile = CONFIG.routes[path] || CONFIG.routes['/'];

        try {
            // Fetch the page content
            const html = await fetchPage(`pages/${pageFile}`);
            
            // Transition to new content
            await transitionContent(html);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Initialize page-specific scripts
            initPageScripts(path);

        } catch (error) {
            console.error('Route handling failed:', error);
            contentEl.innerHTML = `
                <div class="section">
                    <div class="container">
                        <h1>Page Not Found</h1>
                        <p>Sorry, we couldn't find the page you're looking for.</p>
                        <a href="/" class="btn btn-primary" data-link>Go Home</a>
                    </div>
                </div>
            `;
        } finally {
            state.isNavigating = false;
        }
    }

    /**
     * Fetch page content with caching
     */
    async function fetchPage(url) {
        // Try cache first
        const cache = await caches.open(CONFIG.cacheName);
        const cached = await cache.match(url);

        if (cached) {
            // Return cached version immediately
            const text = await cached.text();
            
            // Fetch fresh version in background
            fetch(url).then(response => {
                if (response.ok) {
                    cache.put(url, response.clone());
                }
            }).catch(() => {});

            return text;
        }

        // Not in cache, fetch from network
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        // Cache the response
        cache.put(url, response.clone());
        return response.text();
    }

    /**
     * Transition content with fade animation
     */
    function transitionContent(html) {
        return new Promise(resolve => {
            // Fade out
            contentEl.style.opacity = '0';
            contentEl.style.transform = 'translateY(8px)';
            contentEl.style.transition = `opacity ${CONFIG.transitionDuration}ms ease, transform ${CONFIG.transitionDuration}ms ease`;

            setTimeout(() => {
                // Update content
                contentEl.innerHTML = `<div class="page">${html}</div>`;

                // Fade in
                contentEl.style.opacity = '1';
                contentEl.style.transform = 'translateY(0)';

                setTimeout(resolve, CONFIG.transitionDuration);
            }, CONFIG.transitionDuration);
        });
    }

    /**
     * Update active navigation state
     */
    function updateActiveNav(path) {
        // Update desktop nav
        document.querySelectorAll('.desktop-menu .nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === path) {
                link.classList.add('active');
            }
        });

        // Update mobile nav
        document.querySelectorAll('.mobile-nav .tab-item').forEach(tab => {
            tab.classList.remove('active');
            const href = tab.getAttribute('href');
            if (href === path || (path.startsWith(href) && href !== '/')) {
                tab.classList.add('active');
            }
        });
    }

    /**
     * Initialize page-specific scripts
     */
    function initPageScripts(path) {
        // Initialize FAQ accordions on FAQ page
        if (path === '/faq') {
            initFAQ();
        }

        // Initialize booking form
        if (path === '/book') {
            initBookingForm();
        }
    }

    /**
     * Initialize FAQ accordion functionality
     */
    function initFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const isOpen = faqItem.classList.contains('open');

                // Close all others (optional - accordion style)
                document.querySelectorAll('.faq-item.open').forEach(item => {
                    item.classList.remove('open');
                });

                // Toggle current
                if (!isOpen) {
                    faqItem.classList.add('open');
                }
            });
        });
    }

    /**
     * Initialize booking form
     */
    function initBookingForm() {
        const form = document.getElementById('booking-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            // Collect form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Simulate form submission (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message
            contentEl.innerHTML = `
                <div class="section">
                    <div class="container" style="text-align: center; max-width: 600px;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">✓</div>
                        <h1>Thank You!</h1>
                        <p>Your booking request has been received. Our team will contact you within 24 hours to confirm your appointment.</p>
                        <a href="/" class="btn btn-primary" data-link style="margin-top: 2rem;">Return Home</a>
                    </div>
                </div>
            `;
        });
    }

    /**
     * Handle form submissions
     */
    function handleFormSubmit(e) {
        // Forms with no special handling will use default behavior
        // This is for future form handling expansion
    }

    /**
     * Setup offline detection
     */
    function setupOfflineDetection() {
        function updateOnlineStatus() {
            state.offline = !navigator.onLine;
            if (state.offline) {
                offlineIndicator.classList.add('show');
            } else {
                offlineIndicator.classList.remove('show');
            }
        }

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }

    // Expose minimal API for debugging
    window.ConnectClinic = {
        navigate: navigateTo,
        state: () => ({ ...state }),
        config: CONFIG
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();