// Connect Clinic PWA - Simplified Navigation
(function() {
  const contentDiv = document.getElementById('app-content');
  let currentPage = 'home';

  // Load initial page
  loadPage('home');

  // Setup click handlers for all nav items
  document.querySelectorAll('[data-page]').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const page = this.getAttribute('data-page');
      if (page && page !== currentPage) {
        loadPage(page);
      }
      return false;
    });
  });

  // Setup hash link handlers
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (!link.hasAttribute('data-page')) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const page = href.substring(1);
          if (page && page !== currentPage) {
            loadPage(page);
          }
        }
      });
    }
  });

  function loadPage(pageName) {
    if (!contentDiv) return;
    
    fetch('/pages/' + pageName + '.html')
      .then(response => {
        if (!response.ok) throw new Error('Page not found');
        return response.text();
      })
      .then(html => {
        contentDiv.innerHTML = html;
        currentPage = pageName;
        
        // Update active nav
        document.querySelectorAll('[data-page]').forEach(el => {
          el.classList.toggle('active', el.getAttribute('data-page') === pageName);
        });
        
        // Update URL
        window.history.pushState({page: pageName}, '', '#' + pageName);
        
        // Update title
        const titles = {
          home: 'Connect Clinic',
          adhd: 'ADHD Assessment',
          anxiety: 'Anxiety Support',
          depression: 'Depression Pathway',
          about: 'About',
          book: 'Book a Consult',
          faq: 'FAQ'
        };
        document.title = (titles[pageName] || 'Connect Clinic') + ' - Connect Clinic';
        
        // Setup page-specific interactions
        setupPageInteractions(pageName);
        
        // Scroll to top
        window.scrollTo(0, 0);
      })
      .catch(err => {
        console.error('Failed to load page:', err);
        contentDiv.innerHTML = '<div style="text-align:center;padding:60px 20px;"><h2>Page not found</h2><p>Sorry, we could not load that page.</p><button onclick="location.reload()" style="padding:12px 24px;margin-top:20px;background:#1A6B5A;color:white;border:none;border-radius:8px;cursor:pointer;">Reload</button></div>';
      });
  }

  function setupPageInteractions(pageName) {
    // FAQ accordions
    document.querySelectorAll('.faq-question, .expandable-header').forEach(header => {
      header.onclick = function() {
        const item = this.closest('.faq-item, .expandable-item');
        if (item) {
          item.classList.toggle('open');
        }
      };
    });

    // Booking form
    if (pageName === 'book') {
      const form = document.getElementById('booking-form');
      if (form) {
        // Service selection
        document.querySelectorAll('.service-option').forEach(opt => {
          opt.onclick = function() {
            document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            const hidden = document.getElementById('selected-service');
            if (hidden) hidden.value = this.getAttribute('data-service');
          };
        });

        // Form submit
        form.onsubmit = function(e) {
          e.preventDefault();
          const service = document.getElementById('selected-service');
          if (!service || !service.value) {
            alert('Please select a service');
            return;
          }
          
          const formData = new FormData(form);
          const subject = 'Booking Request - ' + formData.get('service');
          const body = 'Name: ' + formData.get('name') + '\n' +
                       'Email: ' + formData.get('email') + '\n' +
                       'Service: ' + formData.get('service') + '\n' +
                       'Message: ' + (formData.get('message') || 'None');
          
          window.location.href = 'mailto:francis.katoa18@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
          
          form.innerHTML = '<div style="text-align:center;padding:40px;"><h2>Malo aupito</h2><p>Thank you for reaching out. We will be in touch within 1-2 business days.</p><button onclick="window.location.reload()" style="padding:12px 24px;margin-top:20px;background:#1A6B5A;color:white;border:none;border-radius:8px;cursor:pointer;">Return Home</button></div>';
        };
      }
    }
  }

  // Handle browser back/forward
  window.onpopstate = function() {
    const page = window.location.hash.substring(1) || 'home';
    if (page !== currentPage) {
      loadPage(page);
    }
  };

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed:', err));
  }
})();