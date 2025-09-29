/* ============================================
   COPY PROTECTION SYSTEM - STANDALONE JS
   ============================================ */

// Funny error messages - customize these!
const funnyMessages = [
    "🚫 Nice try, but this content is protected!",
    "🛸 Aliens are guarding this text!",
    "⚡ Zap! Copy blocked by magic!",
    "🌟 This content is star-protected!",
    "🚀 Houston, we have a copy problem!",
    "👽 ET says: No copying allowed!",
    "🌌 The universe prevents copying!",
    "💫 Stardust magic blocks copying!",
    "🔮 Mystical forces protect this!",
    "🌠 Shooting star intercepted copy!"
];

/**
 * Initialize the copy protection system
 * Call this function when your page loads
 */
function initCopyProtection() {
    // Prevent right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showFunnyFeedback(e.pageX, e.pageY);
        return false;
    });
    
    // Prevent text selection on non-input elements
    document.addEventListener('selectstart', function(e) {
        // Allow selection in input fields, textareas, and editable content
        if (!e.target.closest('input') && 
            !e.target.closest('textarea') && 
            !e.target.closest('[contenteditable="true"]') &&
            !e.target.closest('a')) {
            e.preventDefault();
            showFunnyFeedback(e.pageX || window.innerWidth/2, e.pageY || window.innerHeight/2);
            return false;
        }
    });
    
    // Prevent copy keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Block common copy shortcuts
        if (e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 's' || e.key === 'u')) {
            e.preventDefault();
            showFunnyFeedback(window.innerWidth / 2, window.innerHeight / 2);
            return false;
        }
        
        // Prevent developer tools shortcuts
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            showFunnyFeedback(window.innerWidth / 2, window.innerHeight / 2);
            return false;
        }
    });
}

/**
 * Show funny animated feedback at cursor position
 */
function showFunnyFeedback(x, y) {
    // Randomly choose between popup message or animated element
    if (Math.random() > 0.5) {
        showErrorPopup();
    } else {
        showAnimatedElement(x, y);
    }
}

/**
 * Show error popup with random funny message
 */
function showErrorPopup() {
    const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
    
    const popup = document.createElement('div');
    popup.className = 'copy-error-popup';
    popup.innerHTML = `
        <div class="error-icon">🛸</div>
        <div>${randomMessage}</div>
    `;
    
    document.body.appendChild(popup);
    
    // Remove popup after animation completes
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 2000);
}

/**
 * Show animated spinning element at cursor position
 */
function showAnimatedElement(x, y) {
    // Create animated spinning star SVG
    const starSvg = `
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,10 60,35 85,35 66,50 76,75 50,60 24,75 34,50 15,35 40,35" 
                     fill="#00ffff" opacity="0.9">
                <animateTransform attributeName="transform" type="rotate" 
                                values="0 50 50;360 50 50" dur="1s" repeatCount="3"/>
            </polygon>
        </svg>
    `;
    
    const animatedElement = document.createElement('div');
    animatedElement.innerHTML = starSvg;
    animatedElement.className = 'floating-gif';
    animatedElement.style.left = (x - 50) + 'px';
    animatedElement.style.top = (y - 50) + 'px';
    
    document.body.appendChild(animatedElement);
    
    // Remove element after animation completes
    setTimeout(() => {
        if (animatedElement.parentNode) {
            animatedElement.parentNode.removeChild(animatedElement);
        }
    }, 3000);
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initCopyProtection();
});

/* ============================================
   CUSTOMIZATION GUIDE:
   
   1. MESSAGES: Edit the funnyMessages array above
   2. COLORS: Change colors in the CSS file
   3. EXCEPTIONS: Add selectors to the selectstart condition
   4. SHORTCUTS: Modify the keydown event handler
   
   INTEGRATION EXAMPLES:
   
   // Manual initialization (if auto-init doesn't work)
   initCopyProtection();
   
   // Add exceptions for specific elements
   document.querySelectorAll('.allow-copy').forEach(el => {
       el.addEventListener('selectstart', (e) => e.stopPropagation());
   });
   
   // Disable protection temporarily
   function disableProtection() {
       document.removeEventListener('contextmenu', arguments.callee);
       // Remove other listeners as needed
   }
   ============================================ */