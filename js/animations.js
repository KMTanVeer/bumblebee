// ========================================
// Core Animation Controllers
// ========================================

class AnimationController {
  constructor() {
    this.observers = new Map();
    this.typingInstances = new Map();
    this.scrollAnimations = [];
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupTypingAnimations();
    this.setupProgressBars();
    this.setupStaggerAnimations();
    this.setupHoverEffects();
  }

  // ========================================
  // Scroll-triggered Animations
  // ========================================
  
  setupScrollAnimations() {
    // Create intersection observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '-50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          
          // Handle specific animation types
          this.handleSpecificAnimations(entry.target);
        }
      });
    }, observerOptions);

    // Observe all scroll-animated elements
    const scrollElements = document.querySelectorAll([
      '.scroll-animate',
      '.scroll-fade',
      '.scroll-slide-left',
      '.scroll-slide-right',
      '.scroll-scale',
      '.timeline-item',
      '.project-card',
      '.skill-category'
    ].join(','));

    scrollElements.forEach(el => {
      observer.observe(el);
    });

    this.observers.set('scroll', observer);
  }

  handleSpecificAnimations(element) {
    // Handle progress bars
    if (element.classList.contains('skill-item')) {
      this.animateProgressBar(element);
    }
    
    // Handle counter animations
    if (element.classList.contains('stat-item')) {
      this.animateCounter(element);
    }
    
    // Handle stagger animations
    if (element.classList.contains('stagger-container')) {
      this.animateStaggerChildren(element);
    }
  }

  // ========================================
  // Progress Bar Animations
  // ========================================
  
  setupProgressBars() {
    const progressBars = document.querySelectorAll('.skill-progress');
    
    progressBars.forEach(bar => {
      const percentage = bar.getAttribute('data-percentage') || '0';
      bar.style.setProperty('--progress-width', percentage + '%');
    });
  }

  animateProgressBar(skillItem) {
    const progressBar = skillItem.querySelector('.skill-progress');
    if (!progressBar) return;

    const percentage = progressBar.getAttribute('data-percentage') || '0';
    
    // Reset width
    progressBar.style.width = '0%';
    
    // Animate to target width
    setTimeout(() => {
      progressBar.style.transition = 'width 2s ease-out';
      progressBar.style.width = percentage + '%';
    }, 100);
  }

  // ========================================
  // Typing Animation
  // ========================================
  
  setupTypingAnimations() {
    const typingElements = document.querySelectorAll('.typing-text');
    
    typingElements.forEach(element => {
      const text = element.textContent;
      const speed = parseInt(element.getAttribute('data-speed')) || 50;
      const delay = parseInt(element.getAttribute('data-delay')) || 0;
      
      // Clear initial text
      element.textContent = '';
      element.style.borderRight = '2px solid var(--neon-blue)';
      
      // Start typing after delay
      setTimeout(() => {
        this.typeWriter(element, text, speed);
      }, delay);
    });
  }

  typeWriter(element, text, speed) {
    let i = 0;
    const typing = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typing, speed);
      } else {
        // Blinking cursor after typing is complete
        this.blinkCursor(element);
      }
    };
    typing();
  }

  blinkCursor(element) {
    setInterval(() => {
      element.style.borderRight = element.style.borderRight === '2px solid transparent' 
        ? '2px solid var(--neon-blue)' 
        : '2px solid transparent';
    }, 750);
  }

  // ========================================
  // Counter Animation
  // ========================================
  
  animateCounter(element) {
    const counter = element.querySelector('.stat-number') || element.querySelector('h4');
    if (!counter) return;

    const target = parseInt(counter.getAttribute('data-target') || counter.textContent.replace(/\D/g, ''));
    const suffix = counter.textContent.replace(/[0-9]/g, '');
    const duration = 2000;
    const start = Date.now();

    const updateCounter = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);
      const current = Math.floor(progress * target);
      
      counter.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }

  // ========================================
  // Stagger Animations
  // ========================================
  
  setupStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('.stagger-container');
    
    staggerContainers.forEach(container => {
      const children = container.children;
      Array.from(children).forEach((child, index) => {
        child.classList.add('stagger-item');
        child.style.animationDelay = `${index * 0.1}s`;
      });
    });
  }

  animateStaggerChildren(container) {
    const children = container.querySelectorAll('.stagger-item');
    
    children.forEach((child, index) => {
      setTimeout(() => {
        child.classList.add('animate');
      }, index * 100);
    });
  }

  // ========================================
  // Hover Effects
  // ========================================
  
  setupHoverEffects() {
    // Card hover effects
    const cards = document.querySelectorAll('.project-card, .skill-category, .timeline-content');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.createHoverParticles(card);
      });
    });

    // Button effects
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.createRippleEffect(button, e);
      });
    });
  }

  createHoverParticles(element) {
    const rect = element.getBoundingClientRect();
    const particleCount = 5;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = '4px';
      particle.style.height = '4px';
      particle.style.background = 'var(--neon-blue)';
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '1000';
      particle.style.left = rect.left + Math.random() * rect.width + 'px';
      particle.style.top = rect.top + Math.random() * rect.height + 'px';
      
      document.body.appendChild(particle);
      
      // Animate particle
      particle.animate([
        { transform: 'translateY(0px)', opacity: 1 },
        { transform: 'translateY(-20px)', opacity: 0 }
      ], {
        duration: 1000,
        easing: 'ease-out'
      }).onfinish = () => {
        document.body.removeChild(particle);
      };
    }
  }

  createRippleEffect(button, event) {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('div');
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.position = 'absolute';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.pointerEvents = 'none';
    ripple.style.transform = 'scale(0)';
    ripple.style.zIndex = '1';
    
    button.appendChild(ripple);
    
    ripple.animate([
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).onfinish = () => {
      button.removeChild(ripple);
    };
  }

  // ========================================
  // Parallax Scrolling
  // ========================================
  
  setupParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      parallaxElements.forEach(element => {
        element.style.transform = `translateY(${rate}px)`;
      });
    });
  }

  // ========================================
  // Loading Animations
  // ========================================
  
  setupLoadingAnimation() {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingProgress = document.querySelector('.loading-progress');
    
    if (!loadingScreen || !loadingProgress) return;

    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Hide loading screen after completion
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          this.triggerPageAnimations();
        }, 500);
      }
      
      loadingProgress.style.width = progress + '%';
    }, 200);
  }

  triggerPageAnimations() {
    // Trigger initial page animations
    const heroElements = document.querySelectorAll('.hero-greeting, .hero-name, .hero-title, .hero-university, .hero-description, .hero-buttons');
    
    heroElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-fade-in-up');
      }, index * 200);
    });
  }

  // ========================================
  // Page Transition Effects
  // ========================================
  
  setupPageTransitions() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        
        if (target) {
          this.smoothScrollTo(target);
        }
      });
    });
  }

  smoothScrollTo(target) {
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = this.easeInOutQuart(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }

  easeInOutQuart(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t * t + b;
    t -= 2;
    return -c / 2 * (t * t * t * t - 2) + b;
  }

  // ========================================
  // Performance Optimizations
  // ========================================
  
  optimizeAnimations() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.disableAnimations();
      return;
    }

    // Check device capabilities
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const isMobile = window.innerWidth < 768;
    
    if (isLowEnd || isMobile) {
      this.reduceAnimations();
    }
  }

  disableAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  reduceAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      .animate-float,
      .animate-pulse,
      .animate-rotate {
        animation: none;
      }
      
      .particle-effect {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // Cleanup
  // ========================================
  
  destroy() {
    // Remove all observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    
    // Clear typing instances
    this.typingInstances.clear();
    
    // Remove event listeners
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }
}

// ========================================
// Text Effects
// ========================================

class TextEffects {
  static glitchText(element, duration = 1000) {
    const originalText = element.textContent;
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const iterations = 10;
    let currentIteration = 0;

    const interval = setInterval(() => {
      element.textContent = originalText
        .split('')
        .map((char, index) => {
          if (index < currentIteration) return originalText[index];
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        })
        .join('');

      currentIteration += 1/3;

      if (currentIteration >= originalText.length) {
        clearInterval(interval);
        element.textContent = originalText;
      }
    }, duration / iterations);
  }

  static typewriterEffect(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;

    const typeInterval = setInterval(() => {
      element.textContent += text[i];
      i++;

      if (i >= text.length) {
        clearInterval(typeInterval);
      }
    }, speed);
  }

  static scrambleText(element, duration = 2000) {
    const originalText = element.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let iterations = 0;

    const interval = setInterval(() => {
      element.textContent = originalText
        .split('')
        .map((char, index) => {
          if (index < iterations) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iterations >= originalText.length) {
        clearInterval(interval);
      }

      iterations += 1 / 3;
    }, 30);
  }
}

// Initialize animation controller when DOM is loaded
let animationController;

document.addEventListener('DOMContentLoaded', function() {
  animationController = new AnimationController();
  
  // Setup loading animation
  animationController.setupLoadingAnimation();
  
  // Setup page transitions
  animationController.setupPageTransitions();
  
  // Optimize animations based on device capabilities
  animationController.optimizeAnimations();
  
  // Add text effects to specific elements
  const glitchElements = document.querySelectorAll('.glitch-text');
  glitchElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      TextEffects.glitchText(el);
    });
  });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimationController, TextEffects };
}
