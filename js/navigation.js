// ========================================
// Navigation Controller
// ========================================

class NavigationController {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('section[id]');
    
    this.isMenuOpen = false;
    this.lastScrollY = window.pageYOffset;
    this.scrollThreshold = 100;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupSmoothScrolling();
    this.setupActiveNavigation();
    this.setupScrollEffects();
    this.setupMobileMenu();
  }

  // ========================================
  // Event Listeners
  // ========================================
  
  setupEventListeners() {
    // Scroll events
    window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 10));
    
    // Resize events
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Click outside menu to close
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.navbar.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  }

  // ========================================
  // Scroll Effects
  // ========================================
  
  handleScroll() {
    const currentScrollY = window.pageYOffset;
    
    // Add/remove scrolled class
    if (currentScrollY > 50) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
    
    // Hide/show navbar on scroll (smart hiding)
    if (currentScrollY > this.scrollThreshold) {
      if (currentScrollY > this.lastScrollY && !this.isMenuOpen && currentScrollY > 200) {
        // Scrolling down - hide navbar
        this.navbar.classList.add('hidden');
      } else {
        // Scrolling up - show navbar
        this.navbar.classList.remove('hidden');
      }
    } else {
      // Always show at top
      this.navbar.classList.remove('hidden');
    }
    
    this.lastScrollY = currentScrollY;
    
    // Update active navigation
    this.updateActiveNavigation();
    
    // Add parallax effect to navbar background
    this.updateNavbarParallax(currentScrollY);
  }

  setupScrollEffects() {
    // Initial navbar state
    this.navbar.style.transition = 'all 0.3s ease';
  }

  updateNavbarParallax(scrollY) {
    // Subtle parallax effect for navbar background
    const parallaxOffset = scrollY * 0.1;
    const opacity = Math.min(scrollY / 500, 0.8);
    
    if (this.navbar.classList.contains('scrolled')) {
      this.navbar.style.backgroundPosition = `0 ${parallaxOffset}px`;
    }
  }

  // ========================================
  // Active Navigation Highlighting
  // ========================================
  
  setupActiveNavigation() {
    // Create intersection observer for sections
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-80px 0px -50% 0px'
    };

    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.getAttribute('id');
        const navLink = document.querySelector(`a[href="#${sectionId}"]`);
        
        if (entry.isIntersecting) {
          this.setActiveNavLink(navLink);
        }
      });
    }, observerOptions);

    // Observe all sections
    this.sections.forEach(section => {
      this.sectionObserver.observe(section);
    });
  }

  updateActiveNavigation() {
    const scrollPosition = window.pageYOffset + 100;
    
    this.sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector(`a[href="#${sectionId}"]`);
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        this.setActiveNavLink(navLink);
      }
    });
  }

  setActiveNavLink(activeLink) {
    // Remove active class from all links
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      link.parentElement.classList.remove('active');
    });
    
    // Add active class to current link
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.parentElement.classList.add('active');
    }
  }

  // ========================================
  // Smooth Scrolling
  // ========================================
  
  setupSmoothScrolling() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          this.smoothScrollTo(targetSection);
          
          // Close mobile menu if open
          if (this.isMenuOpen) {
            this.closeMobileMenu();
          }
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

    // Add loading indicator
    this.showScrollLoader();

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = this.easeInOutCubic(timeElapsed, startPosition, distance, duration);
      
      window.scrollTo(0, run);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        this.hideScrollLoader();
      }
    };

    requestAnimationFrame(animation);
  }

  easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
  }

  // ========================================
  // Mobile Menu
  // ========================================
  
  setupMobileMenu() {
    if (this.hamburger && this.navMenu) {
      this.hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }
  }

  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    this.hamburger.classList.add('active');
    this.navMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Animate menu items
    this.animateMenuItems(true);
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    this.hamburger.classList.remove('active');
    this.navMenu.classList.remove('active');
    document.body.style.overflow = '';
    
    // Animate menu items
    this.animateMenuItems(false);
  }

  animateMenuItems(show) {
    const menuItems = this.navMenu.querySelectorAll('li');
    
    menuItems.forEach((item, index) => {
      if (show) {
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        }, index * 100);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
      }
    });
  }

  // ========================================
  // Responsive Handling
  // ========================================
  
  handleResize() {
    const isMobile = window.innerWidth < 768;
    
    if (!isMobile && this.isMenuOpen) {
      this.closeMobileMenu();
    }
    
    // Reset menu styles for desktop
    if (!isMobile) {
      this.navMenu.style.transform = '';
      this.navMenu.style.opacity = '';
    }
  }

  // ========================================
  // Loading Indicators
  // ========================================
  
  showScrollLoader() {
    let loader = document.querySelector('.scroll-loader');
    
    if (!loader) {
      loader = document.createElement('div');
      loader.className = 'scroll-loader';
      loader.innerHTML = `
        <div class="scroll-loader-bar"></div>
      `;
      document.body.appendChild(loader);
    }
    
    loader.style.display = 'block';
    setTimeout(() => {
      loader.classList.add('active');
    }, 10);
  }

  hideScrollLoader() {
    const loader = document.querySelector('.scroll-loader');
    if (loader) {
      loader.classList.remove('active');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }
  }

  // ========================================
  // Breadcrumb Navigation
  // ========================================
  
  setupBreadcrumbs() {
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'breadcrumb';
    breadcrumb.innerHTML = `
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item"><a href="#hero">Home</a></li>
        <li class="breadcrumb-item active">Current Section</li>
      </ol>
    `;
    
    this.navbar.appendChild(breadcrumb);
    
    // Update breadcrumb on scroll
    window.addEventListener('scroll', () => {
      this.updateBreadcrumb();
    });
  }

  updateBreadcrumb() {
    const activeSection = this.getCurrentSection();
    const breadcrumbItem = document.querySelector('.breadcrumb-item.active');
    
    if (breadcrumbItem && activeSection) {
      breadcrumbItem.textContent = this.getSectionTitle(activeSection);
    }
  }

  getCurrentSection() {
    const scrollPosition = window.pageYOffset + 100;
    
    for (let section of this.sections) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        return section;
      }
    }
    
    return null;
  }

  getSectionTitle(section) {
    const titles = {
      'hero': 'Home',
      'about': 'About Me',
      'education': 'Education',
      'skills': 'Skills',
      'projects': 'Projects',
      'contact': 'Contact'
    };
    
    return titles[section.id] || section.id.charAt(0).toUpperCase() + section.id.slice(1);
  }

  // ========================================
  // Utility Functions
  // ========================================
  
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

  // ========================================
  // Keyboard Navigation
  // ========================================
  
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
      
      // Arrow key navigation
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentSection = this.getCurrentSection();
        const currentIndex = Array.from(this.sections).indexOf(currentSection);
        
        let targetIndex;
        if (e.key === 'ArrowUp') {
          targetIndex = Math.max(0, currentIndex - 1);
        } else {
          targetIndex = Math.min(this.sections.length - 1, currentIndex + 1);
        }
        
        const targetSection = this.sections[targetIndex];
        if (targetSection) {
          this.smoothScrollTo(targetSection);
        }
      }
    });
  }

  // ========================================
  // Progress Indicator
  // ========================================
  
  setupProgressIndicator() {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(progress);
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      const progressBar = document.querySelector('.scroll-progress-bar');
      if (progressBar) {
        progressBar.style.width = scrollPercent + '%';
      }
    });
  }

  // ========================================
  // Cleanup
  // ========================================
  
  destroy() {
    // Remove all event listeners
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    
    // Disconnect observers
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
    
    // Reset body styles
    document.body.style.overflow = '';
  }
}

// ========================================
// Initialize Navigation
// ========================================

let navigationController;

document.addEventListener('DOMContentLoaded', function() {
  navigationController = new NavigationController();
  
  // Add scroll progress indicator styles
  const progressStyles = document.createElement('style');
  progressStyles.textContent = `
    .scroll-progress {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.1);
    }
    
    .scroll-progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple));
      transition: width 0.1s ease;
    }
    
    .scroll-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      z-index: 9999;
      display: none;
    }
    
    .scroll-loader-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--neon-green), var(--neon-pink));
      animation: loading-pulse 1s ease-in-out;
    }
    
    .scroll-loader.active .scroll-loader-bar {
      width: 100%;
    }
    
    @keyframes loading-pulse {
      0% { width: 0%; }
      50% { width: 70%; }
      100% { width: 100%; }
    }
    
    .nav-link.active {
      color: var(--accent);
    }
    
    .nav-link.active::after {
      width: 100%;
    }
  `;
  document.head.appendChild(progressStyles);
  
  // Setup progress indicator
  navigationController.setupProgressIndicator();
  
  // Setup keyboard navigation
  navigationController.setupKeyboardNavigation();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NavigationController };
}
