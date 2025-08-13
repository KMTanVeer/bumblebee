// ========================================
// Particle Background System
// ========================================

class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = this.getParticleCount();
    this.mouse = { x: null, y: null };
    this.colors = [
      '#00f5ff',  // neon-blue
      '#bf00ff',  // neon-purple
      '#39ff14',  // neon-green
      '#ff007f',  // neon-pink
      '#ff8c00',  // neon-orange
      '#00ffaa'   // neon-teal
    ];
    
    this.init();
    this.animate();
    this.setupEventListeners();
  }

  getParticleCount() {
    // Adjust particle count based on device performance
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    
    if (isMobile || isLowEnd) {
      return 30;
    } else if (window.innerWidth < 1024) {
      return 50;
    } else {
      return 80;
    }
  }

  init() {
    this.resizeCanvas();
    this.createParticles();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        opacity: Math.random() * 0.5 + 0.3,
        pulse: Math.random() * 0.02 + 0.01
      });
    }
  }

  updateParticles() {
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Pulse effect
      particle.opacity += particle.pulse;
      if (particle.opacity > 0.8 || particle.opacity < 0.2) {
        particle.pulse *= -1;
      }

      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;

      // Mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.vx += dx * force * 0.001;
          particle.vy += dy * force * 0.001;
          
          // Limit velocity
          const maxVel = 2;
          particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
          particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));
        }
      }

      // Apply friction
      particle.vx *= 0.99;
      particle.vy *= 0.99;
    });
  }

  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw connections
    this.drawConnections();
    
    // Draw particles
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity;
      
      // Create gradient for particle
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add glow effect
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  drawConnections() {
    const maxDistance = 120;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.2;
          
          this.ctx.save();
          this.ctx.globalAlpha = opacity;
          this.ctx.strokeStyle = '#00f5ff';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }
  }

  animate() {
    this.updateParticles();
    this.drawParticles();
    requestAnimationFrame(() => this.animate());
  }

  setupEventListeners() {
    // Mouse movement
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Mouse leave
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.particleCount = this.getParticleCount();
      this.createParticles();
    });

    // Scroll effect
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollRatio = scrollY / maxScroll;
      
      // Adjust particle behavior based on scroll
      this.particles.forEach(particle => {
        particle.vy += scrollRatio * 0.001;
      });
    });

    // Visibility change (pause when tab is not active)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAnimation = true;
      } else {
        this.pauseAnimation = false;
      }
    });
  }

  // Method to add explosion effect
  createExplosion(x, y) {
    const explosionParticles = [];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = Math.random() * 5 + 2;
      
      explosionParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * 4 + 2,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        opacity: 1,
        life: 1,
        decay: Math.random() * 0.02 + 0.01
      });
    }
    
    // Animate explosion particles
    const animateExplosion = () => {
      explosionParticles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.life -= particle.decay;
        particle.opacity = particle.life;
        
        if (particle.life <= 0) {
          explosionParticles.splice(index, 1);
        }
      });
      
      // Draw explosion particles
      this.ctx.save();
      explosionParticles.forEach(particle => {
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
      });
      this.ctx.restore();
      
      if (explosionParticles.length > 0) {
        requestAnimationFrame(animateExplosion);
      }
    };
    
    animateExplosion();
  }

  // Method to change particle behavior
  setMode(mode) {
    switch (mode) {
      case 'calm':
        this.particles.forEach(particle => {
          particle.vx = (Math.random() - 0.5) * 0.2;
          particle.vy = (Math.random() - 0.5) * 0.2;
        });
        break;
      
      case 'energetic':
        this.particles.forEach(particle => {
          particle.vx = (Math.random() - 0.5) * 1.5;
          particle.vy = (Math.random() - 0.5) * 1.5;
        });
        break;
      
      case 'upward':
        this.particles.forEach(particle => {
          particle.vy = -Math.abs(particle.vy) - Math.random() * 0.5;
        });
        break;
    }
  }
}

// Floating Orb Animation
class FloatingOrbs {
  constructor() {
    this.orbs = [];
    this.createOrbs();
  }

  createOrbs() {
    const orbContainer = document.querySelector('.floating-elements');
    if (!orbContainer) return;

    const orbCount = window.innerWidth < 768 ? 3 : 6;
    
    for (let i = 0; i < orbCount; i++) {
      const orb = document.createElement('div');
      orb.className = 'floating-orb';
      orb.style.position = 'absolute';
      orb.style.width = Math.random() * 20 + 10 + 'px';
      orb.style.height = orb.style.width;
      orb.style.borderRadius = '50%';
      orb.style.background = this.getRandomColor();
      orb.style.opacity = Math.random() * 0.6 + 0.2;
      orb.style.left = Math.random() * 100 + '%';
      orb.style.top = Math.random() * 100 + '%';
      orb.style.pointerEvents = 'none';
      orb.style.filter = 'blur(1px)';
      
      orbContainer.appendChild(orb);
      this.orbs.push({
        element: orb,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: parseInt(orb.style.width)
      });
    }
    
    this.animate();
  }

  getRandomColor() {
    const colors = [
      'linear-gradient(45deg, #00f5ff, #bf00ff)',
      'linear-gradient(45deg, #39ff14, #00f5ff)',
      'linear-gradient(45deg, #ff007f, #ff8c00)',
      'linear-gradient(45deg, #bf00ff, #39ff14)',
      'linear-gradient(45deg, #ff8c00, #00ffaa)',
      'linear-gradient(45deg, #00ffaa, #ff007f)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animate() {
    this.orbs.forEach(orb => {
      orb.x += orb.vx;
      orb.y += orb.vy;
      
      // Bounce off edges
      if (orb.x <= 0 || orb.x >= window.innerWidth - orb.size) {
        orb.vx *= -1;
        orb.x = Math.max(0, Math.min(window.innerWidth - orb.size, orb.x));
      }
      
      if (orb.y <= 0 || orb.y >= window.innerHeight - orb.size) {
        orb.vy *= -1;
        orb.y = Math.max(0, Math.min(window.innerHeight - orb.size, orb.y));
      }
      
      orb.element.style.transform = `translate(${orb.x}px, ${orb.y}px)`;
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Matrix Rain Effect (Alternative background)
class MatrixRain {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'matrix-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.opacity = '0.1';
    
    this.ctx = this.canvas.getContext('2d');
    this.characters = '01';
    this.drops = [];
    this.fontSize = 10;
    
    this.init();
  }

  init() {
    document.body.appendChild(this.canvas);
    this.resizeCanvas();
    this.createDrops();
    this.animate();
    
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createDrops();
    });
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createDrops() {
    const columns = this.canvas.width / this.fontSize;
    this.drops = [];
    
    for (let i = 0; i < columns; i++) {
      this.drops[i] = Math.random() * -100;
    }
  }

  animate() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#00f5ff';
    this.ctx.font = this.fontSize + 'px monospace';
    
    for (let i = 0; i < this.drops.length; i++) {
      const text = this.characters[Math.floor(Math.random() * this.characters.length)];
      this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
      
      if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }
    
    requestAnimationFrame(() => this.animate());
  }

  toggle(show) {
    this.canvas.style.display = show ? 'block' : 'none';
  }
}

// Initialize particle system when DOM is loaded
let particleSystem;
let floatingOrbs;
let matrixRain;

document.addEventListener('DOMContentLoaded', function() {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    // Initialize particle system
    if (document.getElementById('particles-canvas')) {
      particleSystem = new ParticleSystem();
    }
    
    // Initialize floating orbs
    floatingOrbs = new FloatingOrbs();
    
    // Optional: Initialize matrix rain (uncomment to enable)
    // matrixRain = new MatrixRain();
  }
  
  // Add click explosion effect
  document.addEventListener('click', function(e) {
    if (particleSystem && !prefersReducedMotion) {
      particleSystem.createExplosion(e.clientX, e.clientY);
    }
  });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ParticleSystem, FloatingOrbs, MatrixRain };
}
