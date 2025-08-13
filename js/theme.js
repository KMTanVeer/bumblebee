// ========================================
// Theme Controller
// ========================================

class ThemeController {
  constructor() {
    this.currentTheme = 'dark';
    this.themeToggle = document.querySelector('.theme-toggle');
    this.prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    this.themes = {
      dark: {
        name: 'dark',
        icon: '☀️',
        label: 'Switch to Light Mode'
      },
      light: {
        name: 'light',
        icon: '🌙',
        label: 'Switch to Dark Mode'
      }
    };
    
    this.init();
  }

  init() {
    this.loadSavedTheme();
    this.setupEventListeners();
    this.updateThemeToggle();
    this.setupSystemThemeListener();
  }

  // ========================================
  // Theme Management
  // ========================================
  
  loadSavedTheme() {
    const savedTheme = localStorage.getItem('portfolio-theme');
    
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      // Use system preference
      this.currentTheme = this.prefersDarkScheme.matches ? 'dark' : 'light';
    }
    
    this.applyTheme(this.currentTheme);
  }

  applyTheme(themeName) {
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(`${themeName}-theme`);
    
    this.currentTheme = themeName;
    this.saveTheme();
    this.updateThemeToggle();
    this.updateMetaThemeColor();
    
    // Trigger theme change event
    this.triggerThemeChangeEvent();
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    
    // Add transition class for smooth theme switching
    document.body.classList.add('theme-transitioning');
    
    setTimeout(() => {
      this.applyTheme(newTheme);
      
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 300);
    }, 50);
  }

  saveTheme() {
    localStorage.setItem('portfolio-theme', this.currentTheme);
  }

  // ========================================
  // UI Updates
  // ========================================
  
  updateThemeToggle() {
    if (!this.themeToggle) return;
    
    const theme = this.themes[this.currentTheme];
    const oppositeTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    
    this.themeToggle.innerHTML = this.themes[oppositeTheme].icon;
    this.themeToggle.setAttribute('aria-label', theme.label);
    this.themeToggle.setAttribute('title', theme.label);
  }

  updateMetaThemeColor() {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    
    const themeColor = this.currentTheme === 'dark' ? '#0a0a0a' : '#ffffff';
    themeColorMeta.content = themeColor;
  }

  // ========================================
  // Event Listeners
  // ========================================
  
  setupEventListeners() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        this.toggleTheme();
        this.createThemeToggleEffect();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  setupSystemThemeListener() {
    this.prefersDarkScheme.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('portfolio-theme')) {
        const systemTheme = e.matches ? 'dark' : 'light';
        this.applyTheme(systemTheme);
      }
    });
  }

  // ========================================
  // Visual Effects
  // ========================================
  
  createThemeToggleEffect() {
    const ripple = document.createElement('div');
    ripple.className = 'theme-toggle-ripple';
    
    const toggleRect = this.themeToggle.getBoundingClientRect();
    const size = Math.max(window.innerWidth, window.innerHeight) * 2;
    
    ripple.style.cssText = `
      position: fixed;
      top: ${toggleRect.top + toggleRect.height / 2}px;
      left: ${toggleRect.left + toggleRect.width / 2}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${this.currentTheme === 'dark' ? '#ffffff' : '#0a0a0a'};
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
      z-index: 9999;
      opacity: 0.1;
    `;
    
    document.body.appendChild(ripple);
    
    // Animate the ripple
    requestAnimationFrame(() => {
      ripple.style.transform = 'translate(-50%, -50%) scale(1)';
      ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
      ripple.style.opacity = '0';
    });
    
    setTimeout(() => {
      document.body.removeChild(ripple);
    }, 600);
  }

  triggerThemeChangeEvent() {
    const event = new CustomEvent('themeChange', {
      detail: {
        theme: this.currentTheme,
        previousTheme: this.currentTheme === 'dark' ? 'light' : 'dark'
      }
    });
    
    document.dispatchEvent(event);
  }

  // ========================================
  // Advanced Theme Features
  // ========================================
  
  getThemeVariables() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    return {
      primary: computedStyle.getPropertyValue('--bg-primary').trim(),
      secondary: computedStyle.getPropertyValue('--bg-secondary').trim(),
      text: computedStyle.getPropertyValue('--text-primary').trim(),
      accent: computedStyle.getPropertyValue('--accent').trim()
    };
  }

  setCustomThemeVariables(variables) {
    const root = document.documentElement;
    
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value);
    });
  }

  // Auto theme switching based on time
  setupAutoTheme() {
    const now = new Date();
    const hour = now.getHours();
    
    // Dark theme from 6 PM to 6 AM
    const shouldBeDark = hour < 6 || hour >= 18;
    const autoTheme = shouldBeDark ? 'dark' : 'light';
    
    if (!localStorage.getItem('portfolio-theme')) {
      this.applyTheme(autoTheme);
    }
    
    // Schedule theme changes
    this.scheduleThemeChanges();
  }

  scheduleThemeChanges() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate milliseconds until next theme change
    let msUntilChange;
    
    if (currentHour < 6) {
      // Switch to light at 6 AM
      const sixAM = new Date(now);
      sixAM.setHours(6, 0, 0, 0);
      msUntilChange = sixAM.getTime() - now.getTime();
    } else if (currentHour < 18) {
      // Switch to dark at 6 PM
      const sixPM = new Date(now);
      sixPM.setHours(18, 0, 0, 0);
      msUntilChange = sixPM.getTime() - now.getTime();
    } else {
      // Switch to light at 6 AM tomorrow
      const sixAMTomorrow = new Date(now);
      sixAMTomorrow.setDate(sixAMTomorrow.getDate() + 1);
      sixAMTomorrow.setHours(6, 0, 0, 0);
      msUntilChange = sixAMTomorrow.getTime() - now.getTime();
    }
    
    setTimeout(() => {
      if (!localStorage.getItem('portfolio-theme')) {
        const newTheme = currentHour >= 6 && currentHour < 18 ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.scheduleThemeChanges(); // Schedule next change
      }
    }, msUntilChange);
  }

  // ========================================
  // Accessibility Features
  // ========================================
  
  setupAccessibilityFeatures() {
    // High contrast mode
    const highContrastToggle = document.createElement('button');
    highContrastToggle.className = 'high-contrast-toggle';
    highContrastToggle.innerHTML = '◐';
    highContrastToggle.setAttribute('aria-label', 'Toggle High Contrast');
    highContrastToggle.style.display = 'none';
    
    // Check if user prefers high contrast
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    
    if (prefersHighContrast.matches) {
      highContrastToggle.style.display = 'block';
      this.themeToggle.parentNode.appendChild(highContrastToggle);
    }
    
    highContrastToggle.addEventListener('click', () => {
      document.body.classList.toggle('high-contrast');
    });
    
    // Listen for contrast preference changes
    prefersHighContrast.addEventListener('change', (e) => {
      if (e.matches) {
        highContrastToggle.style.display = 'block';
        this.themeToggle.parentNode.appendChild(highContrastToggle);
      } else {
        highContrastToggle.style.display = 'none';
        document.body.classList.remove('high-contrast');
      }
    });
  }

  // ========================================
  // Theme Persistence
  // ========================================
  
  exportThemeSettings() {
    return {
      theme: this.currentTheme,
      customVariables: this.getThemeVariables(),
      timestamp: new Date().toISOString()
    };
  }

  importThemeSettings(settings) {
    if (settings.theme) {
      this.applyTheme(settings.theme);
    }
    
    if (settings.customVariables) {
      this.setCustomThemeVariables(settings.customVariables);
    }
  }

  resetToDefaults() {
    localStorage.removeItem('portfolio-theme');
    document.body.classList.remove('high-contrast');
    
    // Reset to system preference
    const systemTheme = this.prefersDarkScheme.matches ? 'dark' : 'light';
    this.applyTheme(systemTheme);
    
    // Reset custom variables
    const root = document.documentElement;
    const customProperties = Array.from(root.style).filter(prop => prop.startsWith('--'));
    customProperties.forEach(prop => {
      root.style.removeProperty(prop);
    });
  }

  // ========================================
  // Theme Analytics
  // ========================================
  
  trackThemeUsage() {
    const usage = JSON.parse(localStorage.getItem('theme-usage') || '{}');
    
    if (!usage[this.currentTheme]) {
      usage[this.currentTheme] = { count: 0, lastUsed: null };
    }
    
    usage[this.currentTheme].count++;
    usage[this.currentTheme].lastUsed = new Date().toISOString();
    
    localStorage.setItem('theme-usage', JSON.stringify(usage));
  }

  getThemeAnalytics() {
    return JSON.parse(localStorage.getItem('theme-usage') || '{}');
  }
}

// ========================================
// Initialize Theme Controller
// ========================================

let themeController;

document.addEventListener('DOMContentLoaded', function() {
  themeController = new ThemeController();
  
  // Add theme transition styles
  const transitionStyles = document.createElement('style');
  transitionStyles.textContent = `
    .theme-transitioning {
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    .theme-transitioning * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    
    .high-contrast {
      filter: contrast(150%) brightness(120%);
    }
    
    .high-contrast-toggle {
      background: none;
      border: 2px solid var(--border);
      border-radius: 50%;
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-normal);
      font-size: 1.2rem;
      margin-left: 0.5rem;
    }
    
    .high-contrast-toggle:hover {
      border-color: var(--accent);
      transform: scale(1.05);
    }
  `;
  document.head.appendChild(transitionStyles);
  
  // Setup accessibility features
  themeController.setupAccessibilityFeatures();
  
  // Listen for theme change events
  document.addEventListener('themeChange', (e) => {
    console.log('Theme changed to:', e.detail.theme);
    themeController.trackThemeUsage();
    
    // Update particles color scheme if available
    if (window.particleSystem) {
      window.particleSystem.updateColorScheme(e.detail.theme);
    }
  });
  
  // Auto theme setup (uncomment to enable)
  // themeController.setupAutoTheme();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeController };
}
