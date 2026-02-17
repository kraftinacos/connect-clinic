// Connect Clinic — Black Premium
// Intersection Observer for scroll animations

document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for reveal animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with reveal classes
  document.querySelectorAll('.reveal-fade, .reveal-up').forEach(el => {
    observer.observe(el);
  });

  // Counter animation for patient stats
  const counters = document.querySelectorAll('.counter');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const startTime = performance.now();
        const startValue = 0;

        const updateCounter = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(startValue + (target - startValue) * easeProgress);
          counter.textContent = current.toLocaleString();

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString() + '+';
          }
        };

        requestAnimationFrame(updateCounter);
        countObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => countObserver.observe(counter));

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Nav background on scroll
  const nav = document.querySelector('.nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      nav.style.background = 'rgba(0, 0, 0, 0.95)';
      nav.style.backdropFilter = 'blur(20px)';
    } else {
      nav.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)';
      nav.style.backdropFilter = 'none';
    }
    
    lastScroll = currentScroll;
  });
});
