// Connect Clinic PWA
const App = {
  currentPage: 'home',
  isOnline: navigator.onLine,
  
  init() {
    this.registerServiceWorker();
    this.setupNavigation();
    this.setupEventListeners();
    this.loadPage('home', false);
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered'))
        .catch((err) => console.log('SW failed:', err));
    }
  },

  setupNavigation() {
    // Handle ALL clicks on nav items
    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('[data-page]');
      if (navItem) {
        e.preventDefault();
        e.stopPropagation();
        const page = navItem.getAttribute('data-page');
        if (page && page !== this.currentPage) {
          this.loadPage(page);
        }
        return false;
      }
      
      // Handle hash links for SPA navigation
      const link = e.target.closest('a[href^="#"]');
      if (link && !link.hasAttribute('data-page')) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const page = href.substring(1);
          if (page && page !== this.currentPage) {
            this.loadPage(page);
          }
        }
      }
    });
  },

  async loadPage(pageName, updateHistory = true) {
    const contentDiv = document.getElementById('app-content');
    if (!contentDiv) return;
    
    contentDiv.style.opacity = '0';
    
    try {
      const response = await fetch(`/pages/${pageName}.html`);
      if (!response.ok) throw new Error('Page not found');
      
      const html = await response.text();
      
      setTimeout(() => {
        contentDiv.innerHTML = html;
        contentDiv.style.opacity = '1';
        
        this.currentPage = pageName;
        
        if (updateHistory) {
          window.history.pushState({ page: pageName }, '', `#${pageName}`);
        }
        
        this.updatePageTitle(pageName);
        this.updateActiveNav(pageName);
        this.setupPageInteractions(pageName);
        this.setupScrollReveal();
        
        window.scrollTo(0, 0);
      }, 150);
      
    } catch (error) {
      console.error('Failed to load page:', error);
      contentDiv.innerHTML = `
        <div style="text-align:center;padding:100px 20px;">
          <h2>Page not found</h2>
          <p>Sorry, we couldn't load that page.</p>
          <button onclick="App.loadPage('home')" class="btn btn-primary" style="margin-top:20px;">Go Home</button>
        </div>
      `;
      contentDiv.style.opacity = '1';
    }
  },

  updatePageTitle(pageName) {
    const titles = {
      home: 'Connect Clinic - Youth Mental Health',
      adhd: 'ADHD Assessment - Connect Clinic',
      anxiety: 'Anxiety Support - Connect Clinic',
      depression: 'Depression Pathway - Connect Clinic',
      about: 'About - Connect Clinic',
      book: 'Book a Consult - Connect Clinic',
      faq: 'FAQ - Connect Clinic'
    };
    document.title = titles[pageName] || 'Connect Clinic';
  },

  updateActiveNav(pageName) {
    document.querySelectorAll('[data-page]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-page') === pageName);
    });
  },

  setupPageInteractions(pageName) {
    // FAQ accordions
    document.querySelectorAll('.faq-question, .expandable-header').forEach(header => {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = header.closest('.faq-item, .expandable-item');
        if (item) {
          item.classList.toggle('open');
        }
      });
    });

    // Service option selection on booking page
    if (pageName === 'book') {
      this.setupBookingForm();
    }
  },

  setupBookingForm() {
    // Service selection
    document.querySelectorAll('.service-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        const service = option.getAttribute('data-service');
        const hiddenInput = document.getElementById('selected-service');
        if (hiddenInput) hiddenInput.value = service;
      });
    });

    // Form submission
    const form = document.getElementById('booking-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        if (!data.service) {
          alert('Please select a service');
          return;
        }
        
        const subject = `New Booking Request - ${data.service}`;
        const body = `
Name: ${data.name}
Date of Birth: ${data.dob}
Email: ${data.email}
Phone: ${data.phone}
Service: ${data.service}
Currently seeing GP: ${data.gp}
Under 18: ${data.under18}
Referral Source: ${data.referral}

Message:
${data.message || 'None provided'}
        `;
        
        window.location.href = `mailto:francis.katoa18@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Show confirmation
        form.innerHTML = `
          <div style="text-align:center;padding:2rem;">
            <div style="width:80px;height:80px;background:rgba(45,139,111,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2D8B6F" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 style="color:var(--primary-dark);margin-bottom:1rem;">Request Received</h3>
            <p style="color:#555;">We've received your request. Dr Katoa will be in touch within 1-2 business days.</p>
            <button onclick="App.loadPage('home')" class="btn btn-primary" style="margin-top:1.5rem;">Return Home</button>
          </div>
        `;
      });
    }
  },

  setupScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
  },

  setupEventListeners() {
    window.addEventListener('online', () => { this.isOnline = true; });
    window.addEventListener('offline', () => { this.isOnline = false; });
    window.addEventListener('popstate', () => {
      const page = window.location.hash.slice(1) || 'home';
      this.loadPage(page, false);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;