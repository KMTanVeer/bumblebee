// ========================================
// Main Application Controller
// ========================================

class PortfolioApp {
  constructor() {
    this.isLoading = true;
    this.components = {};
    this.config = {
      enableAnimations: true,
      enableParticles: true,
      enableSoundEffects: false,
      performanceMode: 'auto'
    };
    
    this.init();
  }

  async init() {
    try {
      // Show loading screen
      this.showLoadingScreen();
      
      // Initialize core systems
      await this.initializeCore();
      
      // Initialize components
      await this.initializeComponents();
      
      // Setup event listeners
      this.setupGlobalEventListeners();
      
      // Perform initial setup
      this.performInitialSetup();
      
      // Hide loading screen and show content
      await this.hideLoadingScreen();
      
      console.log('Portfolio application initialized successfully');
    } catch (error) {
      console.error('Error initializing portfolio:', error);
      this.handleInitializationError(error);
    }
  }

  // ========================================
  // Core Initialization
  // ========================================
  
  async initializeCore() {
    // Detect device capabilities
    this.detectDeviceCapabilities();
    
    // Apply performance settings
    this.applyPerformanceSettings();
    
    // Initialize Google Fonts
    this.loadGoogleFonts();
    
    // Initialize service worker (if available)
    this.registerServiceWorker();
  }

  detectDeviceCapabilities() {
    const capabilities = {
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024,
      isLowEnd: navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4,
      supportsWebGL: this.checkWebGLSupport(),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      connectionSpeed: this.getConnectionSpeed()
    };
    
    this.deviceCapabilities = capabilities;
    
    // Adjust config based on capabilities
    if (capabilities.isLowEnd || capabilities.isMobile || capabilities.prefersReducedMotion) {
      this.config.enableAnimations = false;
      this.config.enableParticles = false;
      this.config.performanceMode = 'optimized';
    }
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  getConnectionSpeed() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  applyPerformanceSettings() {
    if (this.config.performanceMode === 'optimized') {
      // Reduce animation complexity
      document.documentElement.style.setProperty('--transition-normal', '0.1s');
      document.documentElement.style.setProperty('--transition-slow', '0.2s');
      
      // Add performance CSS class
      document.body.classList.add('performance-mode');
    }
  }

  loadGoogleFonts() {
    const fontLinks = [
      'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    ];

    fontLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }

  // ========================================
  // Component Initialization
  // ========================================
  
  async initializeComponents() {
    const componentPromises = [];

    // Initialize theme controller
    if (typeof ThemeController !== 'undefined') {
      this.components.theme = new ThemeController();
      componentPromises.push(Promise.resolve());
    }

    // Initialize navigation
    if (typeof NavigationController !== 'undefined') {
      this.components.navigation = new NavigationController();
      componentPromises.push(Promise.resolve());
    }

    // Initialize animations
    if (typeof AnimationController !== 'undefined' && this.config.enableAnimations) {
      this.components.animations = new AnimationController();
      componentPromises.push(Promise.resolve());
    }

    // Initialize particles
    if (typeof ParticleSystem !== 'undefined' && this.config.enableParticles) {
      const canvas = document.getElementById('particles-canvas');
      if (canvas) {
        this.components.particles = new ParticleSystem();
        componentPromises.push(Promise.resolve());
      }
    }

    // Wait for all components to initialize
    await Promise.all(componentPromises);
  }

  // ========================================
  // Event Listeners
  // ========================================
  
  setupGlobalEventListeners() {
    // Window resize
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    
    // Window focus/blur for performance optimization
    window.addEventListener('focus', this.handleWindowFocus.bind(this));
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
    
    // Visibility change for tab switching
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Error handling
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    
    // Online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  handleResize() {
    // Update device capabilities
    this.detectDeviceCapabilities();
    
    // Notify components of resize
    Object.values(this.components).forEach(component => {
      if (component.handleResize) {
        component.handleResize();
      }
    });
  }

  handleWindowFocus() {
    // Resume animations if paused
    if (this.components.particles) {
      this.components.particles.resume();
    }
  }

  handleWindowBlur() {
    // Pause animations for performance
    if (this.components.particles) {
      this.components.particles.pause();
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.handleWindowBlur();
    } else {
      this.handleWindowFocus();
    }
  }

  handleError(event) {
    console.error('Application error:', event.error);
    
    // Only redirect to LinkedIn for critical errors, not form-related errors
    const errorMessage = event.error?.message || 'Unknown error';
    const filename = event.filename || '';
    
    // Don't redirect for form validation errors or minor script errors
    if (errorMessage.includes('form') || 
        errorMessage.includes('input') || 
        errorMessage.includes('validation') ||
        filename.includes('form')) {
      console.log('Form-related error detected, not redirecting:', errorMessage);
      return;
    }
    
    // Only redirect for critical application errors
    if (errorMessage.includes('critical') || 
        errorMessage.includes('fatal') ||
        event.error?.name === 'ChunkLoadError') {
      this.redirectToLinkedInFromError('A critical error occurred');
    }
  }

  handleUnhandledRejection(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Only redirect for critical promise rejections
    const reason = event.reason?.message || event.reason || 'Unknown rejection';
    
    // Don't redirect for form or fetch errors
    if (reason.includes('form') || 
        reason.includes('fetch') || 
        reason.includes('network') ||
        reason.includes('FormData')) {
      console.log('Form/network-related rejection detected, not redirecting:', reason);
      return;
    }
    
    // Only redirect for critical system errors
    if (reason.includes('critical') || reason.includes('fatal')) {
      this.redirectToLinkedInFromError('A system error occurred');
    }
  }

  handleOnline() {
    this.showNotification('Connection restored', 'success');
  }

  handleOffline() {
    this.showNotification('No internet connection', 'warning');
  }

  // ========================================
  // Loading Screen Management
  // ========================================
  
  showLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
      this.animateLoadingProgress();
    }
  }

  async hideLoadingScreen() {
    return new Promise((resolve) => {
      const loadingScreen = document.querySelector('.loading-screen');
      if (loadingScreen) {
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          setTimeout(() => {
            loadingScreen.style.display = 'none';
            this.triggerEntranceAnimations();
            resolve();
          }, 500);
        }, 1000);
      } else {
        this.triggerEntranceAnimations();
        resolve();
      }
    });
  }

  animateLoadingProgress() {
    const progressBar = document.querySelector('.loading-progress');
    const barLight = document.querySelector('.loading-bar-light');
    if (!progressBar || !barLight) return;

    let progress = 0;
    const barWidth = 300; // px, matches CSS
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        // Boom flash effect
        const flash = document.querySelector('.preloader-flash');
        if (flash) {
          flash.style.display = 'block';
          flash.style.opacity = '1';
          flash.classList.remove('hide');
          flash.classList.add('show');
          flash.style.animation = 'preloader-boom 0.5s cubic-bezier(0.4,0,0.2,1) forwards';
          setTimeout(() => {
            flash.style.display = 'none';
            flash.style.opacity = '0';
            flash.classList.remove('show');
          }, 500);
        }
      }
      progressBar.style.width = progress + '%';
      // Move the light to the end of the progress
      const left = Math.max(0, Math.min(barWidth * (progress / 100) - 12, barWidth - 24));
      barLight.style.left = left + 'px';
      barLight.style.opacity = progress > 2 && progress < 100 ? '1' : '0';
    }, 150);
  }

  // ========================================
  // Initial Setup
  // ========================================
  
  performInitialSetup() {
    // Setup form handlers
    this.setupContactForm();
    
    // Initialize tooltips
    this.initializeTooltips();
    
    // Setup lazy loading
    this.setupLazyLoading();
    
    // Initialize analytics
    this.initializeAnalytics();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', this.handleContactFormSubmit.bind(this));
    }
  }

  async handleContactFormSubmit(event) {
    // Prevent any potential errors from bubbling up
    try {
      event.preventDefault();
      event.stopPropagation();
      
      const form = event.target;
      const formData = new FormData(form);
      const submitButton = form.querySelector('.form-submit');
      const btnText = submitButton.querySelector('.btn-text');
      
      // Validate form data before submission
      const requiredFields = ['firstName', 'lastName', 'email', 'subject', 'message'];
      for (const field of requiredFields) {
        if (!formData.get(field) || formData.get(field).trim() === '') {
          this.showNotification(`Please fill in the ${field} field.`, 'error');
          return;
        }
      }
      
      // Show loading state
      const originalText = btnText ? btnText.textContent : submitButton.textContent;
      if (btnText) {
        btnText.textContent = 'Sending...';
      } else {
        submitButton.textContent = 'Sending...';
      }
      submitButton.disabled = true;
      
      // Submit to Formspree
      const response = await fetch('https://formspree.io/f/xvgqggoz', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        form.reset();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Don't let form errors trigger the global error handler
      this.showNotification('Failed to send message. Please check your connection and try again.', 'error');
    } finally {
      // Reset button state
      const submitButton = event.target?.querySelector('.form-submit');
      const btnText = submitButton?.querySelector('.btn-text');
      if (submitButton) {
        if (btnText) {
          btnText.textContent = 'Send Message';
        } else {
          submitButton.textContent = 'Send Message';
        }
        submitButton.disabled = false;
      }
    }
  }

  initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      element.addEventListener('mouseenter', this.showTooltip.bind(this));
      element.addEventListener('mouseleave', this.hideTooltip.bind(this));
    });
  }

  showTooltip(event) {
    const text = event.target.getAttribute('data-tooltip');
    if (!text) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.position = 'absolute';
    tooltip.style.zIndex = '10000';
    tooltip.style.background = 'var(--bg-secondary)';
    tooltip.style.color = 'var(--text-primary)';
    tooltip.style.padding = '0.5rem 1rem';
    tooltip.style.borderRadius = '4px';
    tooltip.style.border = '1px solid var(--border)';
    tooltip.style.fontSize = '0.875rem';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(10px)';
    tooltip.style.transition = 'all 0.2s ease';
    
    document.body.appendChild(tooltip);
    
    const rect = event.target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    tooltip.style.left = rect.left + (rect.width - tooltipRect.width) / 2 + 'px';
    tooltip.style.top = rect.top - tooltipRect.height - 10 + 'px';
    
    setTimeout(() => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateY(0)';
    }, 10);
    
    event.target._tooltip = tooltip;
  }

  hideTooltip(event) {
    const tooltip = event.target._tooltip;
    if (tooltip) {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateY(10px)';
      setTimeout(() => {
        document.body.removeChild(tooltip);
      }, 200);
      delete event.target._tooltip;
    }
  }

  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyElements = document.querySelectorAll('[data-lazy]');
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadLazyElement(entry.target);
            lazyObserver.unobserve(entry.target);
          }
        });
      });

      lazyElements.forEach(element => {
        lazyObserver.observe(element);
      });
    }
  }

  loadLazyElement(element) {
    const src = element.getAttribute('data-lazy');
    if (src) {
      element.src = src;
      element.removeAttribute('data-lazy');
      element.classList.add('loaded');
    }
  }

  initializeAnalytics() {
    // Track page view
    this.trackPageView();
    
    // Track user interactions
    this.setupInteractionTracking();
  }

  trackPageView() {
    // Implementation depends on your analytics service
    console.log('Page view tracked');
  }

  setupInteractionTracking() {
    // Track button clicks, but exclude form inputs
    document.addEventListener('click', (event) => {
      // Don't track interactions on form inputs, textareas, or inside forms
      if (event.target.matches('input, textarea, select') || 
          event.target.closest('form') ||
          event.target.closest('.contact-form')) {
        return;
      }
      
      if (event.target.matches('button, .btn, a')) {
        this.trackInteraction('click', event.target.textContent || event.target.className);
      }
    });
  }

  trackInteraction(type, element) {
    // Implementation depends on your analytics service
    console.log(`Interaction tracked: ${type} on ${element}`);
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Ctrl + K or Cmd + K for search (if implemented)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Implement search functionality
      }
      
      // Escape key to close modals
      if (event.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
      modal.classList.remove('active');
    });
  }

  // ========================================
  // Animation Triggers
  // ========================================
  
  triggerEntranceAnimations() {
    const heroElements = document.querySelectorAll('.hero-section [class*="hero-"]');
    
    heroElements.forEach((element, index) => {
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 200);
    });
  }

  // ========================================
  // Notification System
  // ========================================
  
  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    `;
    
    // Style the notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    // Type-specific styling
    if (type === 'success') {
      notification.style.borderColor = 'var(--neon-green)';
    } else if (type === 'error') {
      notification.style.borderColor = 'var(--neon-pink)';
    } else if (type === 'warning') {
      notification.style.borderColor = 'var(--neon-orange)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Handle close button
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      this.hideNotification(notification);
    });
    
    // Auto hide
    if (duration > 0) {
      setTimeout(() => {
        this.hideNotification(notification);
      }, duration);
    }
    
    return notification;
  }

  hideNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }

  showErrorNotification(message) {
    this.showNotification(message, 'error');
  }

  redirectToLinkedInFromError(errorMessage) {
    // Show error message with redirect info
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.innerHTML = `
      <span class="notification-message">${errorMessage}<br>Redirecting you to Tanveer's LinkedIn...</span>
      <button class="notification-close">&times;</button>
    `;
    
    // Style the notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--neon-pink);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Handle close button
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      this.hideNotification(notification);
    });
    
    setTimeout(() => {
      // Open LinkedIn in new tab
      window.open('https://linkedin.com/in/kawsartanveer', '_blank');
      
      // Hide notification
      this.hideNotification(notification);
    }, 3000); // Wait 3 seconds to show the error message
  }

  // ========================================
  // Utility Functions
  // ========================================
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ========================================
  // Error Handling
  // ========================================
  
  handleInitializationError(error) {
    console.error('Portfolio initialization failed:', error);
    
    // Hide loading screen
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    
    // Show error message
    this.showErrorFallback();
  }

  showErrorFallback() {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        background: var(--bg-secondary);
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid var(--border);
        z-index: 10000;
      ">
        <h2 style="color: var(--text-primary); margin-bottom: 1rem;">
          Something went wrong
        </h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          The portfolio failed to load properly. Please refresh the page.
        </p>
        <button onclick="location.reload()" style="
          background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
        ">
          Refresh Page
        </button>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
  }

  // ========================================
  // Performance Monitoring
  // ========================================
  
  startPerformanceMonitoring() {
    if ('performance' in window) {
      // Monitor frame rate
      let lastTime = performance.now();
      let frameCount = 0;
      
      const monitorFPS = (currentTime) => {
        frameCount++;
        
        if (currentTime >= lastTime + 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          
          if (fps < 30 && this.config.enableAnimations) {
            console.warn('Low FPS detected, switching to performance mode');
            this.config.performanceMode = 'optimized';
            this.applyPerformanceSettings();
          }
          
          frameCount = 0;
          lastTime = currentTime;
        }
        
        requestAnimationFrame(monitorFPS);
      };
      
      requestAnimationFrame(monitorFPS);
    }
  }

  // ========================================
  // Cleanup
  // ========================================
  
  destroy() {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Destroy components
    Object.values(this.components).forEach(component => {
      if (component.destroy) {
        component.destroy();
      }
    });
    
    console.log('Portfolio application destroyed');
  }
}

// ========================================
// Initialize Application
// ========================================

let portfolioApp;

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  portfolioApp = new PortfolioApp();
  
  // Make app globally available for debugging
  window.portfolioApp = portfolioApp;
  
  // Start performance monitoring
  portfolioApp.startPerformanceMonitoring();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (portfolioApp) {
    portfolioApp.destroy();
  }
});

// ========================================
// Cursor Wave Effect for Profile Photo
// ========================================

class CursorWaveEffect {
  constructor() {
    this.profileElement = null;
    this.profileInner = null;
    this.isHovering = false;
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    setTimeout(() => {
      this.profileElement = document.querySelector('.profile-circle');
      this.profileInner = document.querySelector('.profile-inner');
      
      if (this.profileElement && this.profileInner) {
        this.setupEventListeners();
        console.log('Cursor wave effect initialized');
      } else {
        console.warn('Profile elements not found');
      }
    }, 100);
  }

  setupEventListeners() {
    // Mouse enter effect
    this.profileElement.addEventListener('mouseenter', () => {
      this.isHovering = true;
      console.log('Mouse entered profile');
    });

    // Mouse leave effect
    this.profileElement.addEventListener('mouseleave', () => {
      this.isHovering = false;
      this.profileInner.style.transform = 'translate(0px, 0px)';
      console.log('Mouse left profile');
    });

    // Mouse move effect
    this.profileElement.addEventListener('mousemove', (e) => {
      if (!this.isHovering) return;

      const rect = this.profileElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate offset from center
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      
      // Limit movement range (max 20px)
      const maxMove = 20;
      const moveX = Math.max(-maxMove, Math.min(maxMove, x * 0.1));
      const moveY = Math.max(-maxMove, Math.min(maxMove, y * 0.1));
      
      // Apply wave movement
      this.profileInner.style.transform = `translate(${moveX}px, ${moveY}px)`;
      
      // Create ripple effect
      this.createRipple(e.clientX - rect.left, e.clientY - rect.top);
    });

    // Click effect
    this.profileElement.addEventListener('click', (e) => {
      const rect = this.profileElement.getBoundingClientRect();
      this.createClickWave(e.clientX - rect.left, e.clientY - rect.top);
    });
  }

  createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      background: radial-gradient(circle, var(--neon-cyan), transparent);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      animation: ripple-effect 0.6s ease-out forwards;
      pointer-events: none;
      z-index: 15;
    `;
    
    this.profileElement.appendChild(ripple);
    
    // Remove after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove();
      }
    }, 600);
  }

  createClickWave(x, y) {
    const wave = document.createElement('div');
    wave.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 10px;
      height: 10px;
      border: 2px solid var(--neon-blue);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      animation: ripple-effect 1s ease-out forwards;
      pointer-events: none;
      z-index: 15;
    `;
    
    this.profileElement.appendChild(wave);
    
    setTimeout(() => {
      if (wave.parentNode) {
        wave.remove();
      }
    }, 1000);
  }
}

// ========================================
// Smart Animation Switcher
// ========================================

class AnimationSwitcher {
  constructor() {
    this.animations = [
      'tech-pulse',
      'holographic-border', 
      'matrix-glow',
      'neural-network',
      'orbital-motion'
    ];
    this.currentIndex = 0;
    this.profileElement = null;
    this.init();
  }

  init() {
    this.profileElement = document.querySelector('.profile-circle');
    
    // Add keyboard shortcut (Press 'A' to cycle animations)
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.altKey) {
        this.switchToNextAnimation();
      }
    });

    // Auto-switch every 30 seconds (optional)
    // setInterval(() => this.switchToNextAnimation(), 30000);
  }

  switchToNextAnimation() {
    if (!this.profileElement) return;

    // Remove current animation class
    const currentAnim = this.animations[this.currentIndex];
    this.profileElement.style.animation = 'none';
    
    // Move to next animation
    this.currentIndex = (this.currentIndex + 1) % this.animations.length;
    const nextAnim = this.animations[this.currentIndex];
    
    // Apply new animation with slight delay to ensure reset
    setTimeout(() => {
      this.profileElement.style.animation = `${nextAnim} 8s ease-in-out infinite`;
    }, 100);

    // Show notification (optional)
    this.showAnimationNotification(nextAnim);
  }

  switchToAnimation(animationName) {
    if (!this.profileElement || !this.animations.includes(animationName)) return;

    this.currentIndex = this.animations.indexOf(animationName);
    this.profileElement.style.animation = 'none';
    
    setTimeout(() => {
      this.profileElement.style.animation = `${animationName} 8s ease-in-out infinite`;
    }, 100);
  }

  showAnimationNotification(animationName) {
    // Create a subtle notification
    const notification = document.createElement('div');
    notification.className = 'animation-notification';
    notification.textContent = `Animation: ${animationName.replace('-', ' ')}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-secondary);
      color: var(--neon-cyan);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      z-index: 9999;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
      border: 1px solid var(--neon-blue);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    });
    
    // Remove after 2 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// ========================================
// Skills Filter System
// ========================================
class SkillsFilter {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.animateOnLoad();
  }

  setupEventListeners() {
    const filters = document.querySelectorAll('.category-filter');
    
    filters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        const filterType = filter.dataset.filter;
        this.filterSkills(filterType);
        this.updateActiveFilter(filter);
      });
    });
  }

  filterSkills(category) {
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach((card, index) => {
      const cardCategory = card.dataset.category;
      const shouldShow = category === 'all' || cardCategory === category;
      
      if (shouldShow) {
        // Show with staggered animation
        setTimeout(() => {
          card.style.display = 'block';
          card.style.opacity = '0';
          card.style.transform = 'translateY(30px) scale(0.9)';
          
          requestAnimationFrame(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          });
        }, index * 100);
      } else {
        // Hide with animation
        card.style.transition = 'all 0.3s ease-out';
        card.style.opacity = '0';
        card.style.transform = 'translateY(-20px) scale(0.8)';
        
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
  }

  updateActiveFilter(activeFilter) {
    const filters = document.querySelectorAll('.category-filter');
    
    filters.forEach(filter => {
      filter.classList.remove('active');
    });
    
    activeFilter.classList.add('active');
    
    // Add click animation
    activeFilter.style.transform = 'translateY(-3px) scale(0.95)';
    setTimeout(() => {
      activeFilter.style.transform = 'translateY(-3px) scale(1.05)';
    }, 150);
  }

  animateOnLoad() {
    // Add sequential reveal animation for skill cards
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px) scale(0.9)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      }, index * 100 + 500); // Start after section loads
    });
  }
}

// ========================================
// Enhanced Skill Card Interactions
// ========================================
class SkillCardEffects {
  constructor() {
    this.init();
  }

  init() {
    this.setupHoverEffects();
    this.setupClickEffects();
  }

  setupHoverEffects() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        this.createRippleEffect(e);
        this.activateGlow(card);
      });

      card.addEventListener('mouseleave', (e) => {
        this.deactivateGlow(card);
      });
    });
  }

  setupClickEffects() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach(card => {
      card.addEventListener('click', (e) => {
        this.createClickWave(e);
        this.showSkillInfo(card);
      });
    });
  }

  createRippleEffect(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(59, 130, 246, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = x - 10 + 'px';
    ripple.style.top = y - 10 + 'px';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '1';
    
    card.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  createClickWave(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const wave = document.createElement('div');
    wave.style.position = 'absolute';
    wave.style.borderRadius = '50%';
    wave.style.background = 'rgba(0, 245, 255, 0.4)';
    wave.style.transform = 'scale(0)';
    wave.style.animation = 'clickWave 0.8s ease-out';
    wave.style.left = x - 15 + 'px';
    wave.style.top = y - 15 + 'px';
    wave.style.width = '30px';
    wave.style.height = '30px';
    wave.style.pointerEvents = 'none';
    wave.style.zIndex = '2';
    
    card.appendChild(wave);
    
    setTimeout(() => {
      wave.remove();
    }, 800);
  }

  activateGlow(card) {
    const glow = card.querySelector('.skill-glow');
    if (glow) {
      glow.style.opacity = '0.8';
      glow.style.animation = 'skillGlow 1.5s ease-in-out infinite';
    }
  }

  deactivateGlow(card) {
    const glow = card.querySelector('.skill-glow');
    if (glow) {
      glow.style.opacity = '0';
      glow.style.animation = 'skillGlow 3s ease-in-out infinite';
    }
  }

  showSkillInfo(card) {
    const skillName = card.querySelector('h3').textContent;
    
    // Create floating info bubble
    const info = document.createElement('div');
    info.textContent = `${skillName} - Professional Level`;
    info.style.position = 'fixed';
    info.style.top = '50%';
    info.style.left = '50%';
    info.style.transform = 'translate(-50%, -50%) scale(0)';
    info.style.background = 'rgba(0, 0, 0, 0.9)';
    info.style.color = 'white';
    info.style.padding = '1rem 2rem';
    info.style.borderRadius = '10px';
    info.style.fontFamily = 'var(--font-tech)';
    info.style.fontSize = '1.1rem';
    info.style.zIndex = '9999';
    info.style.border = '1px solid var(--accent)';
    info.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    info.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    document.body.appendChild(info);
    
    requestAnimationFrame(() => {
      info.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    setTimeout(() => {
      info.style.opacity = '0';
      info.style.transform = 'translate(-50%, -50%) scale(0.8)';
      setTimeout(() => {
        info.remove();
      }, 300);
    }, 2000);
  }
}

// Certificate Verification System
class CertificateVerification {
  constructor() {
    this.init();
  }

  init() {
    this.setupVerifyButtons();
    this.setupCertificateCards();
  }

  setupVerifyButtons() {
    const verifyButtons = document.querySelectorAll('.verify-btn');
    
    verifyButtons.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleVerifyClick(btn, index);
      });
      
      btn.addEventListener('mouseenter', () => {
        this.createVerifyGlow(btn);
      });
      
      btn.addEventListener('mouseleave', () => {
        this.removeVerifyGlow(btn);
      });
    });
  }

  setupCertificateCards() {
    const certificateCards = document.querySelectorAll('.certificate-card');
    
    certificateCards.forEach((card, index) => {
      this.addCardInteractivity(card, index);
    });
  }

  addCardInteractivity(card, index) {
    const image = card.querySelector('.certificate-image');
    const overlay = card.querySelector('.certificate-overlay');
    
    card.addEventListener('mouseenter', () => {
      this.createCardGlow(card);
      this.animateCardHover(card, true);
    });
    
    card.addEventListener('mouseleave', () => {
      this.removeCardGlow(card);
      this.animateCardHover(card, false);
    });
    
    // Add click to expand functionality
    if (image) {
      image.addEventListener('click', () => {
        this.expandCertificate(image, index);
      });
    }
  }

  handleVerifyClick(btn, index) {
    // Add loading state
    this.setVerifyButtonLoading(btn, true);
    
    // Simulate verification process
    setTimeout(() => {
      this.showVerificationModal(index);
      this.setVerifyButtonLoading(btn, false);
      this.createSuccessEffect(btn);
    }, 1500);
  }

  setVerifyButtonLoading(btn, loading) {
    const text = btn.querySelector('span');
    const icon = btn.querySelector('svg');
    
    if (loading) {
      text.textContent = 'Verifying...';
      icon.style.animation = 'spin 1s linear infinite';
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.7';
    } else {
      text.textContent = 'Verify Certificate';
      icon.style.animation = '';
      btn.style.pointerEvents = 'auto';
      btn.style.opacity = '1';
    }
  }

  showVerificationModal(certificateIndex) {
    const certificates = [
      {
        title: 'AI Prompt Engineering Professional',
        issuer: 'Certs365 - Advanced AI Certification',
        verified: true,
        verificationId: 'd7c3ab4001ad',
        verificationUrl: 'https://verify.certs365.io/?=d7c3ab4001ad',
        issueDate: 'July 2024',
        validUntil: 'July 2027',
        credentialType: 'Professional Certification',
        skills: ['AI Prompt Engineering', 'LLM Optimization', 'ChatGPT Mastery', 'AI Content Creation'],
        description: 'Advanced certification in AI Prompt Engineering covering LLM optimization, conversation design, and AI-powered content creation.',
        blockchainVerified: true,
        logo: '🤖',
        imagePath: 'assets/images/AIcertified.jpg'
      },
      {
        title: 'Business English Certificate',
        issuer: 'Coursera - University Partnership Program',
        verified: true,
        verificationId: 'FQRPFR4WH765',
        verificationUrl: 'https://www.coursera.org/account/accomplishments/verify/FQRPFR4WH765',
        issueDate: 'June 2024',
        validUntil: 'Lifetime',
        credentialType: 'Professional Certificate',
        skills: ['Business Communication', 'Professional Writing', 'Presentation Skills', 'International Business'],
        description: 'Comprehensive Business English certification focusing on professional communication, business writing, and international business practices.',
        blockchainVerified: false,
        logo: '🎓',
        imagePath: 'assets/images/EnglishCertification.jpeg'
      },
      {
        title: 'PLC & Mechatronics Systems Engineer',
        issuer: 'BITAC - Bangladesh Institute of Technology and Advanced Computing',
        verified: true,
        verificationId: 'BITAC-PLC-2024-KMT',
        verificationUrl: null, // Direct institutional verification
        issueDate: 'May 2024',
        validUntil: 'May 2027',
        credentialType: 'Technical Certification',
        skills: ['PLC Programming', 'Industrial Automation', 'Mechatronics Design', 'SCADA Systems', 'Motor Control'],
        description: 'Advanced technical certification in PLC programming and mechatronics systems, covering industrial automation, motor control, and SCADA implementation.',
        blockchainVerified: false,
        logo: '⚙️',
        imagePath: 'assets/images/PLCMechatronicsCertificate.jpg'
      }
    ];

    const cert = certificates[certificateIndex];
    this.createAdvancedVerificationModal(cert);
  }

  createAdvancedVerificationModal(cert) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.verification-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'verification-modal advanced-modal';
    
    const skillsHtml = cert.skills.map(skill => 
      `<span class="skill-tag">${skill}</span>`
    ).join('');

    const verificationButton = cert.verificationUrl 
      ? `<button class="verify-online-btn" onclick="window.open('${cert.verificationUrl}', '_blank')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15,3 21,3 21,9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span>Verify Online</span>
          <div class="btn-glow"></div>
        </button>`
      : `<button class="institutional-verify-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
          <span>Institutional Verification</span>
        </button>`;

    const blockchainBadge = cert.blockchainVerified 
      ? `<div class="blockchain-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Blockchain Verified
        </div>`
      : '';

    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content advanced-content">
        <div class="modal-header advanced-header">
          <div class="cert-logo">${cert.logo}</div>
          <div class="header-content">
            <div class="verification-status verified">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
              <span>Verified Certificate</span>
              ${blockchainBadge}
            </div>
            <div class="cert-type">${cert.credentialType}</div>
          </div>
          <button class="modal-close advanced-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-body advanced-body">
          <div class="cert-image-container">
            <img src="${cert.imagePath}" alt="${cert.title}" class="cert-full-image" onclick="window.open('${cert.imagePath}', '_blank')">
            <div class="image-zoom-hint">Click to view full size</div>
          </div>

          <div class="cert-title-section">
            <h3>${cert.title}</h3>
            <p class="cert-description">${cert.description}</p>
          </div>

          <div class="cert-details-grid">
            <div class="detail-card">
              <div class="detail-icon">🏢</div>
              <div class="detail-content">
                <span class="label">Issuing Organization</span>
                <span class="value">${cert.issuer}</span>
              </div>
            </div>
            
            <div class="detail-card">
              <div class="detail-icon">🆔</div>
              <div class="detail-content">
                <span class="label">Certificate ID</span>
                <span class="value" id="cert-id">${cert.verificationId}</span>
              </div>
              <button class="copy-btn" onclick="navigator.clipboard.writeText('${cert.verificationId}'); this.innerHTML='✓'; setTimeout(() => this.innerHTML='📋', 2000)">📋</button>
            </div>
            
            <div class="detail-card">
              <div class="detail-icon">📅</div>
              <div class="detail-content">
                <span class="label">Issue Date</span>
                <span class="value">${cert.issueDate}</span>
              </div>
            </div>
            
            <div class="detail-card">
              <div class="detail-icon">⏰</div>
              <div class="detail-content">
                <span class="label">Valid Until</span>
                <span class="value">${cert.validUntil}</span>
              </div>
            </div>
          </div>

          <div class="skills-section">
            <h4>Skills & Competencies</h4>
            <div class="skills-container">
              ${skillsHtml}
            </div>
          </div>

          <div class="verification-actions">
            ${verificationButton}
            <button class="share-cert-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16,6 12,2 8,6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              <span>Share Certificate</span>
            </button>
          </div>

          <div class="security-info">
            <div class="security-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>SSL Encrypted Verification</span>
            </div>
            <div class="security-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              <span>Authenticity Guaranteed</span>
            </div>
            ${cert.blockchainVerified ? `
              <div class="security-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Blockchain Immutable</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Rebind special cursor effects for new modal buttons
    if (window.modernCursorEffect) {
      window.modernCursorEffect.bindSpecialButtons();
    }
    
    // Add advanced entrance animation
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      modal.querySelector('.modal-content').style.transform = 'translate(-50%, -50%) scale(1) rotateY(0deg)';
    });

    // Setup enhanced modal events
    this.setupAdvancedModalEvents(modal, cert);
  }

  setupAdvancedModalEvents(modal, cert) {
    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');
    const shareBtn = modal.querySelector('.share-cert-btn');

    const closeModal = () => {
      modal.style.opacity = '0';
      modal.querySelector('.modal-content').style.transform = 'translate(-50%, -50%) scale(0.8) rotateY(-10deg)';
      setTimeout(() => {
        modal.remove();
      }, 400);
    };

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    
    // Enhanced share functionality
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.shareCertificate(cert);
      });
    }
    
    // Institutional verification for BITAC
    const institutionalBtn = modal.querySelector('.institutional-verify-btn');
    if (institutionalBtn) {
      institutionalBtn.addEventListener('click', () => {
        this.showInstitutionalVerification();
      });
    }
    
    // Enhanced keyboard navigation
    const handleKeyPress = (e) => {
      switch(e.key) {
        case 'Escape':
          closeModal();
          document.removeEventListener('keydown', handleKeyPress);
          break;
        case 'Enter':
          if (cert.verificationUrl) {
            window.open(cert.verificationUrl, '_blank');
          }
          break;
        case 'c':
        case 'C':
          if (e.ctrlKey || e.metaKey) {
            navigator.clipboard.writeText(cert.verificationId);
            this.showToast('Certificate ID copied to clipboard!');
          }
          break;
      }
    };
    document.addEventListener('keydown', handleKeyPress);
  }

  shareCertificate(cert) {
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Use native share API on mobile
      navigator.share({
        title: `${cert.title} - Certificate Verification`,
        text: `I've earned a ${cert.title} certification from ${cert.issuer}`,
        url: cert.verificationUrl || window.location.href
      }).catch(() => {
        this.fallbackShare(cert);
      });
    } else {
      this.fallbackShare(cert);
    }
  }

  fallbackShare(cert) {
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    shareModal.innerHTML = `
      <div class="share-backdrop"></div>
      <div class="share-content">
        <h4>Share Certificate</h4>
        <div class="share-options">
          <button class="share-option linkedin" onclick="this.shareToLinkedIn('${cert.title}', '${cert.issuer}', '${cert.verificationUrl || ''}')">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>
          <button class="share-option twitter" onclick="this.shareToTwitter('${cert.title}', '${cert.verificationUrl || ''}')">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </button>
          <button class="share-option copy-link" onclick="this.copyShareLink('${cert.verificationUrl || window.location.href}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            Copy Link
          </button>
        </div>
        <button class="share-close">&times;</button>
      </div>
    `;

    document.body.appendChild(shareModal);
    
    requestAnimationFrame(() => {
      shareModal.style.opacity = '1';
      shareModal.querySelector('.share-content').style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // Setup share modal events
    shareModal.querySelector('.share-close').addEventListener('click', () => {
      shareModal.style.opacity = '0';
      shareModal.querySelector('.share-content').style.transform = 'translate(-50%, -50%) scale(0.8)';
      setTimeout(() => shareModal.remove(), 300);
    });

    shareModal.querySelector('.share-backdrop').addEventListener('click', () => {
      shareModal.querySelector('.share-close').click();
    });
  }

  showInstitutionalVerification() {
    this.showToast('BITAC Institutional Verification: Contact BITAC directly for verification at info@bitac.edu.bd', 'info', 5000);
  }

  showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${type === 'success' ? '<path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle>' : 
            type === 'info' ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>' : 
            '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'}
        </svg>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  expandCertificate(image, index) {
    // Create full-screen certificate viewer
    const viewer = document.createElement('div');
    viewer.className = 'certificate-viewer';
    viewer.innerHTML = `
      <div class="viewer-backdrop"></div>
      <div class="viewer-content">
        <button class="viewer-close">&times;</button>
        <img src="${image.src}" alt="Certificate" class="viewer-image">
        <div class="viewer-controls">
          <button class="zoom-in">+</button>
          <button class="zoom-out">-</button>
          <button class="download-cert">Download</button>
        </div>
      </div>
    `;

    document.body.appendChild(viewer);
    
    // Animate viewer in
    requestAnimationFrame(() => {
      viewer.style.opacity = '1';
      viewer.querySelector('.viewer-content').style.transform = 'scale(1)';
    });

    this.setupViewerEvents(viewer, image.src);
  }

  setupViewerEvents(viewer, imageSrc) {
    const closeBtn = viewer.querySelector('.viewer-close');
    const backdrop = viewer.querySelector('.viewer-backdrop');
    const zoomIn = viewer.querySelector('.zoom-in');
    const zoomOut = viewer.querySelector('.zoom-out');
    const download = viewer.querySelector('.download-cert');
    const image = viewer.querySelector('.viewer-image');

    let scale = 1;

    const closeViewer = () => {
      viewer.style.opacity = '0';
      viewer.querySelector('.viewer-content').style.transform = 'scale(0.8)';
      setTimeout(() => {
        viewer.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', closeViewer);
    backdrop.addEventListener('click', closeViewer);
    
    zoomIn.addEventListener('click', () => {
      scale = Math.min(scale + 0.2, 3);
      image.style.transform = `scale(${scale})`;
    });
    
    zoomOut.addEventListener('click', () => {
      scale = Math.max(scale - 0.2, 0.5);
      image.style.transform = `scale(${scale})`;
    });

    download.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = 'certificate.jpg';
      link.click();
    });
  }

  createVerifyGlow(btn) {
    const glow = document.createElement('div');
    glow.className = 'verify-glow-effect';
    btn.appendChild(glow);
  }

  removeVerifyGlow(btn) {
    const glow = btn.querySelector('.verify-glow-effect');
    if (glow) {
      glow.remove();
    }
  }

  createCardGlow(card) {
    if (!card.querySelector('.card-interaction-glow')) {
      const glow = document.createElement('div');
      glow.className = 'card-interaction-glow';
      card.appendChild(glow);
    }
  }

  removeCardGlow(card) {
    const glow = card.querySelector('.card-interaction-glow');
    if (glow) {
      glow.remove();
    }
  }

  animateCardHover(card, isHovering) {
    const image = card.querySelector('.certificate-image');
    const info = card.querySelector('.certificate-info');
    
    if (isHovering) {
      image.style.filter = 'brightness(0.7) contrast(1.2) saturate(1.2)';
      info.style.transform = 'translateY(-5px)';
    } else {
      image.style.filter = 'brightness(0.9) contrast(1.1)';
      info.style.transform = 'translateY(0)';
    }
  }

  createSuccessEffect(btn) {
    const success = document.createElement('div');
    success.className = 'verify-success-effect';
    success.innerHTML = '✓';
    btn.appendChild(success);
    
    setTimeout(() => {
      success.remove();
    }, 1000);
  }

  // Social media sharing functions
  shareToLinkedIn(title, issuer, url) {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || window.location.href)}&title=${encodeURIComponent(`Certified: ${title}`)}&summary=${encodeURIComponent(`I've successfully completed ${title} certification from ${issuer}`)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  }

  shareToTwitter(title, url) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎓 Just earned my ${title} certification! #CertificationSuccess #ProfessionalDevelopment`)}&url=${encodeURIComponent(url || window.location.href)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  }

  copyShareLink(url) {
    navigator.clipboard.writeText(url || window.location.href).then(() => {
      this.showToast('Certificate link copied to clipboard!');
    }).catch(() => {
      this.showToast('Failed to copy link', 'error');
    });
  }
}

// Global functions for inline onclick handlers
window.shareToLinkedIn = function(title, issuer, url) {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || window.location.href)}&title=${encodeURIComponent(`Certified: ${title}`)}&summary=${encodeURIComponent(`I've successfully completed ${title} certification from ${issuer}`)}`;
  window.open(linkedInUrl, '_blank', 'width=600,height=400');
};

window.shareToTwitter = function(title, url) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎓 Just earned my ${title} certification! #CertificationSuccess #ProfessionalDevelopment`)}&url=${encodeURIComponent(url || window.location.href)}`;
  window.open(twitterUrl, '_blank', 'width=600,height=400');
};

window.copyShareLink = function(url) {
  navigator.clipboard.writeText(url || window.location.href).then(() => {
    // Create a temporary toast for this global function
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `
      <div class="toast-content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle>
        </svg>
        <span>Certificate link copied to clipboard!</span>
      </div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }).catch(() => {
    alert('Failed to copy link');
  });
};

// Add certificate verification CSS
const certificateCSS = `
  /* Advanced Verification Modal */
  .verification-modal.advanced-modal {
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(20px);
  }
  
  .modal-content.advanced-content {
    max-width: 900px;
    width: 95vw;
    max-height: 90vh;
    overflow-y: auto;
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    border-radius: 25px;
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.6),
      0 0 100px rgba(59, 130, 246, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transform: translate(-50%, -50%) scale(0.8) rotateY(10deg);
    overflow: visible;
  }

  .modal-header.advanced-header {
    background: linear-gradient(135deg, 
      rgba(255, 215, 0, 0.15) 0%, 
      rgba(59, 130, 246, 0.15) 50%, 
      rgba(139, 92, 246, 0.15) 100%);
    border-bottom: 2px solid var(--border);
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .modal-header.advanced-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);
    animation: shimmer 3s ease-in-out infinite;
  }

  .cert-logo {
    font-size: 3rem;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    animation: float 3s ease-in-out infinite;
  }

  .header-content {
    flex: 1;
  }

  .verification-status.verified {
    color: #10b981;
    margin-bottom: 0.5rem;
  }

  .blockchain-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 1rem;
    animation: glow-pulse 2s ease-in-out infinite;
  }

  .blockchain-badge svg {
    width: 14px;
    height: 14px;
  }

  .cert-type {
    color: var(--accent);
    font-family: var(--font-tech);
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .modal-close.advanced-close {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: var(--text-secondary);
    transition: all 0.3s ease;
  }

  .modal-close.advanced-close:hover {
    background: rgba(255, 255, 255, 0.2);
    color: var(--accent);
    transform: rotate(90deg) scale(1.1);
  }

  .modal-body.advanced-body {
    padding: 2.5rem;
  }

  .cert-image-container {
    margin-bottom: 2rem;
    text-align: center;
    position: relative;
    border-radius: 15px;
    overflow: hidden;
    background: var(--bg-primary);
    border: 2px solid var(--border);
    transition: all 0.3s ease;
  }

  .cert-image-container:hover {
    border-color: var(--accent);
    box-shadow: 0 10px 30px rgba(0, 245, 255, 0.3);
  }

  .cert-full-image {
    width: 100%;
    height: auto;
    display: block;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .cert-full-image:hover {
    transform: scale(1.02);
  }

  .image-zoom-hint {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .cert-image-container:hover .image-zoom-hint {
    opacity: 1;
  }

  .cert-title-section {
    text-align: center;
    margin-bottom: 2.5rem;
    position: relative;
  }

  .cert-title-section::after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(135deg, var(--accent), var(--neon-pink));
    border-radius: 2px;
  }

  .cert-title-section h3 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .cert-description {
    color: var(--text-secondary);
    line-height: 1.6;
    max-width: 80%;
    margin: 0 auto;
  }

  .cert-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .detail-card {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 15px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
    transition: all 0.3s ease;
  }

  .detail-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    border-color: var(--accent);
  }

  .detail-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
    border-radius: 10px;
    flex-shrink: 0;
  }

  .detail-content {
    flex: 1;
  }

  .detail-content .label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  .detail-content .value {
    display: block;
    color: var(--text-primary);
    font-weight: 600;
    font-family: var(--font-tech);
  }

  .copy-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .copy-btn:hover {
    background: var(--accent);
    transform: scale(1.1);
  }

  .skills-section {
    margin-bottom: 2.5rem;
  }

  .skills-section h4 {
    font-family: var(--font-tech);
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-size: 1.1rem;
    position: relative;
    padding-left: 1rem;
  }

  .skills-section h4::before {
    content: '▶';
    position: absolute;
    left: 0;
    color: var(--accent);
  }

  .skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .skill-tag {
    background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    font-family: var(--font-tech);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .skill-tag::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .skill-tag:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  }

  .skill-tag:hover::before {
    opacity: 1;
  }

  .verification-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .verify-online-btn, .institutional-verify-btn, .share-cert-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 15px;
    font-family: var(--font-tech);
    font-weight: 600;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .verify-online-btn {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
  }

  .institutional-verify-btn {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
  }

  .share-cert-btn {
    background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
    color: white;
  }

  .verify-online-btn:hover, .institutional-verify-btn:hover, .share-cert-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  }

  .btn-glow {
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    border-radius: 15px;
    z-index: -1;
    opacity: 0;
    animation: glow-sweep 2s ease-in-out infinite;
  }

  .security-info {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 15px;
  }

  .security-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent);
    font-size: 0.85rem;
    font-weight: 500;
  }

  .security-item svg {
    width: 16px;
    height: 16px;
    color: #10b981;
  }

  /* Share Modal */
  .share-modal {
    position: fixed;
    inset: 0;
    z-index: 10001;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .share-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
  }

  .share-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    min-width: 400px;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .share-content h4 {
    font-family: var(--font-tech);
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.3rem;
  }

  .share-options {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .share-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-tech);
    font-weight: 500;
  }

  .share-option.linkedin {
    border-color: #0077b5;
  }

  .share-option.twitter {
    border-color: #1da1f2;
  }

  .share-option.copy-link {
    border-color: var(--accent);
  }

  .share-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  .share-option.linkedin:hover {
    background: #0077b5;
    color: white;
  }

  .share-option.twitter:hover {
    background: #1da1f2;
    color: white;
  }

  .share-option.copy-link:hover {
    background: var(--accent);
    color: var(--bg-primary);
  }

  .share-option svg {
    width: 24px;
    height: 24px;
  }

  .share-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 24px;
    color: var(--text-secondary);
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease;
  }

  .share-close:hover {
    color: var(--accent);
  }

  /* Toast Notifications */
  .toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    z-index: 10002;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 15px;
    padding: 1rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    max-width: 400px;
  }

  .toast.success {
    border-color: #10b981;
  }

  .toast.info {
    border-color: #3b82f6;
  }

  .toast.error {
    border-color: #ef4444;
  }

  .toast-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-primary);
    font-family: var(--font-tech);
  }

  .toast.success .toast-content svg {
    color: #10b981;
  }

  .toast.info .toast-content svg {
    color: #3b82f6;
  }

  .toast.error .toast-content svg {
    color: #ef4444;
  }

  .toast-content svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  /* Advanced Animations */
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes glow-sweep {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes pulse-glow {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); 
    }
    50% { 
      box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); 
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .modal-content.advanced-content {
      width: 95vw;
      margin: 1rem;
    }

    .modal-header.advanced-header {
      padding: 1.5rem;
      flex-direction: column;
      text-align: center;
    }

    .modal-body.advanced-body {
      padding: 1.5rem;
    }

    .cert-details-grid {
      grid-template-columns: 1fr;
    }

    .verification-actions {
      flex-direction: column;
    }

    .security-info {
      flex-direction: column;
      text-align: center;
    }

    .share-content {
      min-width: 90vw;
      margin: 1rem;
    }

    .toast {
      right: 1rem;
      left: 1rem;
      max-width: none;
    }
  }

  @media (max-width: 480px) {
    .cert-logo {
      font-size: 2rem;
    }

    .cert-title-section h3 {
      font-size: 1.4rem;
    }

    .verification-actions {
      gap: 0.75rem;
    }

    .verify-online-btn, .institutional-verify-btn, .share-cert-btn {
      padding: 0.875rem 1rem;
      font-size: 0.9rem;
    }
  }

  .verification-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
  }
  
  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 20px;
    max-width: 500px;
    width: 90vw;
    max-height: 80vh;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(59, 130, 246, 0.1));
  }
  
  .verification-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--accent);
    font-family: var(--font-tech);
    font-weight: 600;
  }
  
  .verification-status svg {
    width: 24px;
    height: 24px;
    color: #10b981;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.3s ease;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-close:hover {
    color: var(--accent);
  }
  
  .modal-body {
    padding: 2rem;
  }
  
  .modal-body h3 {
    font-family: var(--font-tech);
    font-size: 1.5rem;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, var(--accent), var(--neon-pink));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .cert-details {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--bg-primary);
    border-radius: 10px;
    border: 1px solid var(--border);
  }
  
  .detail-row .label {
    font-family: var(--font-tech);
    color: var(--text-secondary);
    font-weight: 600;
  }
  
  .detail-row .value {
    color: var(--accent);
    font-weight: 500;
    font-family: monospace;
  }
  
  .copy-verification-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
    color: white;
    border: none;
    border-radius: 10px;
    font-family: var(--font-tech);
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    justify-content: center;
  }
  
  .copy-verification-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .copy-verification-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
  
  .certificate-viewer {
    position: fixed;
    inset: 0;
    z-index: 10001;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .viewer-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
  }
  
  .viewer-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    max-width: 90vw;
    max-height: 90vh;
  }
  
  .viewer-image {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 10px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    transition: transform 0.3s ease;
  }
  
  .viewer-close {
    position: absolute;
    top: -50px;
    right: 0;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    font-size: 24px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
  }
  
  .viewer-close:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .viewer-controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
  }
  
  .viewer-controls button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--font-tech);
  }
  
  .viewer-controls button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  .verify-glow-effect {
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, var(--neon-blue), var(--neon-pink), var(--accent));
    border-radius: 50px;
    z-index: -1;
    animation: glow-pulse 2s ease-in-out infinite;
  }
  
  .verify-success-effect {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #10b981;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    animation: success-pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 10;
  }
  
  .card-interaction-glow {
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(59, 130, 246, 0.3));
    border-radius: 20px;
    z-index: -1;
    animation: card-glow 2s ease-in-out infinite;
  }
  
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  @keyframes success-pop {
    0% { transform: translate(-50%, -50%) scale(0); }
    50% { transform: translate(-50%, -50%) scale(1.2); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }
  
  @keyframes card-glow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.7; }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject certificate CSS
const certStyleSheet = document.createElement('style');
certStyleSheet.textContent = certificateCSS;
document.head.appendChild(certStyleSheet);

// Add CSS animations for ripple and wave effects
const skillsAnimationCSS = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  @keyframes clickWave {
    to {
      transform: scale(6);
      opacity: 0;
    }
  }
`;

// Inject CSS
const skillsStyleSheet = document.createElement('style');
skillsStyleSheet.textContent = skillsAnimationCSS;
document.head.appendChild(skillsStyleSheet);

// Initialize cursor wave effect and animation switcher
let cursorWaveEffect;
let animationSwitcher;
let skillsFilter;
let skillCardEffects;
let certificateVerification;
let geometricWaveCursor;
let futuristicHoverEffects;
let modernCursorEffect;

document.addEventListener('DOMContentLoaded', () => {
  cursorWaveEffect = new CursorWaveEffect();
  animationSwitcher = new AnimationSwitcher();
  skillsFilter = new SkillsFilter();
  skillCardEffects = new SkillCardEffects();
  certificateVerification = new CertificateVerification();
  geometricWaveCursor = new GeometricWaveCursor();
  futuristicHoverEffects = new FuturisticHoverEffects();
  modernCursorEffect = new ModernCursorEffect();
  
  // Make modernCursorEffect globally available
  window.modernCursorEffect = modernCursorEffect;
});

// ========================================
// Geometric Wave Cursor Animation
// ========================================
class GeometricWaveCursor {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.waves = [];
    this.geometricShapes = [];
    this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0 };
    this.init();
  }

  init() {
    this.createCanvas();
    this.bindEvents();
    this.createInitialShapes();
    this.animate();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      opacity: 0.7;
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', (e) => {
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.createWave();
      this.createGeometricShape();
    });
  }

  createInitialShapes() {
    // Create some ambient geometric shapes
    for (let i = 0; i < 5; i++) {
      this.geometricShapes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 50 + 20,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.3 + 0.1,
        type: Math.floor(Math.random() * 3), // 0: triangle, 1: square, 2: hexagon
        color: this.getThemeColor()
      });
    }
  }

  getThemeColor() {
    const isLightMode = document.body.classList.contains('light-theme');
    if (isLightMode) {
      return Math.random() > 0.5 ? '#374151' : '#4b5563';
    } else {
      return Math.random() > 0.5 ? '#ff6b35' : '#00f5ff';
    }
  }

  createWave() {
    const speed = Math.hypot(this.mouse.x - this.mouse.prevX, this.mouse.y - this.mouse.prevY);
    if (speed > 2) {
      const isLightMode = document.body.classList.contains('light-theme');
      this.waves.push({
        x: this.mouse.x,
        y: this.mouse.y,
        radius: 0,
        maxRadius: speed * 2 + 30,
        opacity: 0.8,
        color: isLightMode ? 
          (speed > 10 ? '#374151' : '#6b7280') : 
          (speed > 10 ? '#ff6b35' : '#00f5ff')
      });
    }
  }

  createGeometricShape() {
    if (Math.random() > 0.7) {
      this.geometricShapes.push({
        x: this.mouse.x + (Math.random() - 0.5) * 40,
        y: this.mouse.y + (Math.random() - 0.5) * 40,
        size: Math.random() * 20 + 5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        opacity: 0.6,
        life: 1,
        decay: 0.01,
        type: Math.floor(Math.random() * 3),
        color: this.getThemeColor()
      });
    }
  }

  drawGeometricShape(shape) {
    this.ctx.save();
    this.ctx.translate(shape.x, shape.y);
    this.ctx.rotate(shape.rotation);
    this.ctx.strokeStyle = shape.color + Math.floor(shape.opacity * 255).toString(16).padStart(2, '0');
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    switch (shape.type) {
      case 0: // Triangle
        this.ctx.moveTo(0, -shape.size);
        this.ctx.lineTo(-shape.size * 0.866, shape.size * 0.5);
        this.ctx.lineTo(shape.size * 0.866, shape.size * 0.5);
        this.ctx.closePath();
        break;
      case 1: // Square
        this.ctx.rect(-shape.size/2, -shape.size/2, shape.size, shape.size);
        break;
      case 2: // Hexagon
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = shape.size * Math.cos(angle);
          const y = shape.size * Math.sin(angle);
          if (i === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        break;
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  animate() {
    // Create subtle background fade with theme awareness
    const isLightMode = document.body.classList.contains('light-theme');
    this.ctx.fillStyle = isLightMode ? 
      'rgba(243, 244, 246, 0.02)' : 
      'rgba(13, 15, 23, 0.03)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Animate waves
    this.waves = this.waves.filter(wave => {
      wave.radius += 3;
      wave.opacity -= 0.01;
      
      if (wave.opacity <= 0) return false;

      this.ctx.beginPath();
      this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = wave.color + Math.floor(wave.opacity * 255).toString(16).padStart(2, '0');
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Inner wave
      if (wave.radius > 20) {
        this.ctx.beginPath();
        this.ctx.arc(wave.x, wave.y, wave.radius - 20, 0, Math.PI * 2);
        this.ctx.strokeStyle = wave.color + Math.floor(wave.opacity * 0.5 * 255).toString(16).padStart(2, '0');
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }

      return true;
    });

    // Animate geometric shapes
    this.geometricShapes = this.geometricShapes.filter(shape => {
      shape.rotation += shape.rotationSpeed;
      if (shape.life) {
        shape.life -= shape.decay;
        shape.opacity = shape.life * 0.6;
        if (shape.life <= 0) return false;
      }
      
      this.drawGeometricShape(shape);
      return true;
    });

    // Maintain ambient shapes
    if (this.geometricShapes.filter(s => !s.life).length < 3) {
      this.geometricShapes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 30 + 10,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.2 + 0.05,
        type: Math.floor(Math.random() * 3),
        color: this.getThemeColor()
      });
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ========================================
// Futuristic Hover Effects
// ========================================
class FuturisticHoverEffects {
  constructor() {
    this.init();
  }

  init() {
    this.addHoverGlow();
    this.addRippleEffect();
  }

  addHoverGlow() {
    const elements = document.querySelectorAll('button, .card, .skill-card, .project-card, .social-icon');
    elements.forEach(element => {
      element.addEventListener('mouseenter', (e) => {
        const isLightMode = document.body.classList.contains('light-theme');
        const glow = document.createElement('div');
        glow.className = 'hover-glow';
        
        // Use different glow colors based on theme
        const glowColors = isLightMode 
          ? 'linear-gradient(45deg, rgba(220, 38, 38, 0.4), rgba(234, 88, 12, 0.3))' 
          : 'linear-gradient(45deg, rgba(255, 107, 53, 0.3), rgba(0, 245, 255, 0.2))';
        
        glow.style.cssText = `
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: ${glowColors};
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          filter: blur(10px);
        `;
        
        if (element.style.position !== 'absolute' && element.style.position !== 'fixed') {
          element.style.position = 'relative';
        }
        element.appendChild(glow);
        
        setTimeout(() => glow.style.opacity = '1', 10);
      });

      element.addEventListener('mouseleave', () => {
        const glows = element.querySelectorAll('.hover-glow');
        glows.forEach(glow => {
          glow.style.opacity = '0';
          setTimeout(() => glow.remove(), 300);
        });
      });
    });
  }

  addRippleEffect() {
    document.addEventListener('click', (e) => {
      // Don't add ripple effects on form inputs or inside forms
      if (e.target.matches('input, textarea, select, label') || 
          e.target.closest('form') ||
          e.target.closest('.contact-form')) {
        return;
      }
      
      const isLightMode = document.body.classList.contains('light-theme');
      const rippleColor = isLightMode 
        ? 'radial-gradient(circle, rgba(220, 38, 38, 0.4) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 70%)';
      
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: fixed;
        border-radius: 50%;
        background: ${rippleColor};
        transform: scale(0);
        animation: rippleExpand 1s ease-out;
        pointer-events: none;
        z-index: 9999;
        width: 100px;
        height: 100px;
        left: ${e.clientX - 50}px;
        top: ${e.clientY - 50}px;
      `;
      
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    });
  }
}

// Add CSS animations
const futuristicStyles = `
@keyframes rippleExpand {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.hover-glow {
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = futuristicStyles;
document.head.appendChild(styleSheet);

// ========================================
// LinkedIn Redirect Function
// ========================================
function redirectToLinkedIn() {
  // Show redirecting message
  const notification = document.createElement('div');
  notification.className = 'notification notification-info';
  notification.innerHTML = `
    <span class="notification-message">Redirecting you to Tanveer's LinkedIn...</span>
  `;
  
  // Style the notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    padding: 1rem 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--neon-blue);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 300px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  setTimeout(() => {
    // Open LinkedIn in new tab
    window.open('https://linkedin.com/in/kawsartanveer', '_blank');
    
    // Hide notification
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 1500); // Wait 1.5 seconds to show the message
}

// ========================================
// Portfolio Redirect Function
// ========================================
function redirectToPortfolio() {
  // Show redirecting message
  const btnText = document.querySelector('.btn-modern .btn-text');
  const button = document.querySelector('.btn-modern');
  
  if (btnText && button) {
    const originalText = btnText.textContent;
    btnText.textContent = 'Redirecting you to iTanveer.tech...';
    
    // Add loading animation to button
    button.style.transition = 'all 0.3s ease';
    button.style.opacity = '0.8';
    button.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
      // Open iTanveer.tech in new tab
      window.open('https://itanveer.tech', '_blank');
      
      // Reset button after redirect
      setTimeout(() => {
        btnText.textContent = originalText;
        button.style.opacity = '1';
        button.style.transform = 'scale(1)';
      }, 500);
    }, 1500); // Wait 1.5 seconds to show the message
  }
}

// Export for use in other modules
// Modern Cursor Effect for Light Mode Only
class ModernCursorEffect {
  constructor() {
    this.cursor = null;
    this.trails = [];
    this.maxTrails = 12;
    this.mouse = { x: 0, y: 0 };
    this.isDarkMode = false;
    this.particles = [];
    this.colors = {
      dark: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'],
      light: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
    };
    
    this.init();
  }

  init() {
    this.checkTheme();
    this.createCursor();
    this.bindEvents();
    this.setupMutationObserver();
    
    // Listen for theme changes
    document.addEventListener('themeChange', () => {
      this.handleThemeChange();
    });
  }

  setupMutationObserver() {
    // Watch for new elements being added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any modal or verification elements were added
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              const hasVerificationElements = node.classList?.contains('verification-modal') ||
                                            node.querySelector?.('.verify-online-btn, button[onclick*="window.open"], a[target="_blank"]');
              
              if (hasVerificationElements) {
                setTimeout(() => this.bindSpecialButtons(), 50);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  checkTheme() {
    this.isDarkMode = !document.body.classList.contains('light-theme');
  }

  handleThemeChange() {
    this.checkTheme();
    this.updateCursorStyle();
  }

  createCursor() {
    if (this.cursor) return;
    
    // Create main cursor
    this.cursor = document.createElement('div');
    this.cursor.className = 'modern-cursor';
    document.body.appendChild(this.cursor);
    this.updateCursorStyle();
  }

  updateCursorStyle() {
    if (!this.cursor) return;
    
    if (this.isDarkMode) {
      this.cursor.classList.add('dark-mode');
      this.cursor.classList.remove('light-mode');
    } else {
      this.cursor.classList.add('light-mode');
      this.cursor.classList.remove('dark-mode');
    }
  }

  removeCursor() {
    if (this.cursor) {
      this.cursor.remove();
      this.cursor = null;
    }
    
    // Remove all trails and particles
    this.trails.forEach(trail => trail.element.remove());
    this.trails = [];
    this.particles.forEach(particle => particle.element.remove());
    this.particles = [];
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mousedown', () => this.handleMouseDown());
    document.addEventListener('mouseup', () => this.handleMouseUp());
    
    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .skill-card, .project-card, .timeline-content');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => this.handleHoverStart(el));
      el.addEventListener('mouseleave', () => this.handleHoverEnd(el));
    });
    
    // Special handling for verification and external link buttons
    this.bindSpecialButtons();
  }

  bindSpecialButtons() {
    // Re-bind when new elements are added (like modals)
    setTimeout(() => {
      const specialButtons = document.querySelectorAll('.verify-online-btn, button[onclick*="window.open"], a[target="_blank"]');
      specialButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => this.handleSpecialHover(btn));
        btn.addEventListener('mouseleave', () => this.handleSpecialLeave(btn));
      });
    }, 100);
  }

  handleSpecialHover(element) {
    // Create a visible colored cursor for special buttons
    if (this.cursor) {
      this.cursor.style.width = '15px';
      this.cursor.style.height = '15px';
      this.cursor.style.border = this.isDarkMode ? '2px solid #00f5ff' : '2px solid #3b82f6';
      this.cursor.style.background = this.isDarkMode 
        ? 'rgba(0, 245, 255, 0.3)' 
        : 'rgba(59, 130, 246, 0.3)';
      this.cursor.style.boxShadow = this.isDarkMode
        ? '0 0 20px rgba(0, 245, 255, 0.8), 0 0 40px rgba(0, 245, 255, 0.4)'
        : '0 0 15px rgba(59, 130, 246, 0.6)';
    }
  }

  handleSpecialLeave(element) {
    // Hide the cursor again
    if (this.cursor) {
      this.cursor.style.width = '0px';
      this.cursor.style.height = '0px';
      this.cursor.style.border = 'none';
      this.cursor.style.background = 'transparent';
      this.cursor.style.boxShadow = 'none';
    }
  }

  handleMouseMove(e) {
    if (!this.cursor) return;
    
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    
    // Update cursor position
    this.cursor.style.left = this.mouse.x + 'px';
    this.cursor.style.top = this.mouse.y + 'px';
    
    // Create different effects for different themes
    if (this.isDarkMode) {
      this.createColorfulTrail();
      if (Math.random() < 0.3) {
        this.createSparkle();
      }
    } else {
      this.createSimpleTrail();
      if (Math.random() < 0.2) {
        this.createLightSparkle();
      }
    }
  }

  createSimpleTrail() {
    const colors = this.colors.light;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const trail = document.createElement('div');
    trail.className = 'cursor-trail light-trail';
    trail.style.left = this.mouse.x + 'px';
    trail.style.top = this.mouse.y + 'px';
    
    // Override the CSS gradient with random colors
    trail.style.background = `radial-gradient(circle, ${color}, ${color}80)`;
    trail.style.boxShadow = `0 0 15px ${color}80, 0 0 30px ${color}40`;
    
    document.body.appendChild(trail);
    
    this.trails.push({
      element: trail,
      life: 1
    });
    
    // Remove oldest trails
    if (this.trails.length > this.maxTrails) {
      const oldTrail = this.trails.shift();
      oldTrail.element.remove();
    }
    
    // Animate trail - let CSS animation handle the effect
    setTimeout(() => {
      if (trail.parentNode) {
        trail.remove();
      }
      this.removeFromArray(this.trails, trail);
    }, 600);
  }

  createColorfulTrail() {
    const colors = this.colors.dark;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const trail = document.createElement('div');
    trail.className = 'cursor-trail dark-trail';
    trail.style.left = this.mouse.x + 'px';
    trail.style.top = this.mouse.y + 'px';
    trail.style.background = color;
    trail.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
    
    document.body.appendChild(trail);
    
    this.trails.push({
      element: trail,
      life: 1,
      color: color
    });
    
    // Remove oldest trails
    if (this.trails.length > this.maxTrails) {
      const oldTrail = this.trails.shift();
      oldTrail.element.remove();
    }
    
    // Animate colorful trail
    requestAnimationFrame(() => {
      trail.style.opacity = '0';
      trail.style.transform = 'translate(-50%, -50%) scale(0.1)';
      
      setTimeout(() => {
        if (trail.parentNode) {
          trail.remove();
        }
        this.removeFromArray(this.trails, trail);
      }, 800);
    });
  }

  createSparkle() {
    const colors = this.colors.dark;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const sparkle = document.createElement('div');
    sparkle.className = 'cursor-sparkle';
    sparkle.style.left = (this.mouse.x + (Math.random() - 0.5) * 60) + 'px';
    sparkle.style.top = (this.mouse.y + (Math.random() - 0.5) * 60) + 'px';
    sparkle.style.background = color;
    sparkle.style.boxShadow = `0 0 15px ${color}`;
    
    document.body.appendChild(sparkle);
    
    this.particles.push({
      element: sparkle,
      life: 1
    });
    
    // Animate sparkle
    requestAnimationFrame(() => {
      sparkle.style.opacity = '0';
      sparkle.style.transform = 'translate(-50%, -50%) scale(0) rotate(180deg)';
      
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.remove();
        }
        this.removeFromArray(this.particles, sparkle);
      }, 1000);
    });
  }

  createLightSparkle() {
    const colors = this.colors.light;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const sparkle = document.createElement('div');
    sparkle.className = 'cursor-sparkle light-sparkle';
    sparkle.style.left = (this.mouse.x + (Math.random() - 0.5) * 40) + 'px';
    sparkle.style.top = (this.mouse.y + (Math.random() - 0.5) * 40) + 'px';
    sparkle.style.background = color;
    sparkle.style.boxShadow = `0 0 10px ${color}80`;
    sparkle.style.width = '4px';
    sparkle.style.height = '4px';
    
    document.body.appendChild(sparkle);
    
    this.particles.push({
      element: sparkle,
      life: 1
    });
    
    // Animate light sparkle with gentler animation
    requestAnimationFrame(() => {
      sparkle.style.opacity = '0';
      sparkle.style.transform = 'translate(-50%, -50%) scale(0) rotate(90deg)';
      
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.remove();
        }
        this.removeFromArray(this.particles, sparkle);
      }, 800);
    });
  }

  removeFromArray(array, element) {
    const index = array.findIndex(item => item.element === element);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

  handleMouseDown() {
    if (!this.cursor) return;
    this.cursor.classList.add('active');
    
    if (this.isDarkMode) {
      // Create burst effect for dark mode
      for (let i = 0; i < 6; i++) {
        setTimeout(() => this.createSparkle(), i * 50);
      }
    }
  }

  handleMouseUp() {
    if (!this.cursor) return;
    this.cursor.classList.remove('active');
  }

  handleHoverStart() {
    if (!this.cursor) return;
    this.cursor.classList.add('active');
  }

  handleHoverEnd() {
    if (!this.cursor) return;
    this.cursor.classList.remove('active');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    PortfolioApp, 
    AnimationSwitcher, 
    CursorWaveEffect, 
    SkillsFilter, 
    SkillCardEffects,
    CertificateVerification,
    redirectToPortfolio,
    redirectToLinkedIn,
    ModernCursorEffect
  };
}
