// ============================================
// UTILITY FUNCTIONS
// ============================================

// ============================================
// THEME SWITCHING
// ============================================

function initThemeSwitcher() {
  // Load saved theme from localStorage
  const savedTheme = localStorage.getItem('englishAppTheme') || 'ocean';
  setTheme(savedTheme);

  // Setup theme toggle button
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themePicker = document.getElementById('themePicker');

  if (themeToggleBtn && themePicker) {
    themeToggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      themePicker.classList.toggle('active');
      // Close profile menu if open
      const profileMenu = document.getElementById('profileMenu');
      if (profileMenu) profileMenu.classList.remove('active');
    });

    // Setup theme option buttons
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', function() {
        const theme = this.dataset.theme;
        setTheme(theme);

        // Update active state
        themeOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');

        // Save to localStorage
        localStorage.setItem('englishAppTheme', theme);

        // Close picker after selection
        setTimeout(() => {
          themePicker.classList.remove('active');
        }, 200);
      });
    });

    // Close theme picker when clicking outside
    document.addEventListener('click', function(e) {
      if (!themePicker.contains(e.target) && !themeToggleBtn.contains(e.target)) {
        themePicker.classList.remove('active');
      }
    });
  }
}

function setTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);

  // Update active state in picker
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    if (option.dataset.theme === themeName) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

function showNotification(message) {
  // Simple notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--gradient-green);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: var(--shadow-strong);
    z-index: 1000;
    animation: slideDown 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Add CSS animation for notification
function initNotificationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
      to {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Setup utility button listeners
let utilityListenersInitialized = false;

function setupUtilityListeners() {
  // Prevent duplicate listener setup
  if (utilityListenersInitialized) {
    return;
  }
  
  // Review All functionality
  const reviewAllBtn = document.getElementById('reviewAllBtn');
  if (reviewAllBtn) {
    reviewAllBtn.addEventListener('click', function() {
      alert('Review mode coming soon! This will start a flashcard session.');
    });
  }

  // Settings button (header - mobile)
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
      alert('Settings panel coming soon!');
    });
  }

  // Settings button (sidebar - desktop)
  const settingsBtnSidebar = document.getElementById('settingsBtnSidebar');
  if (settingsBtnSidebar) {
    settingsBtnSidebar.addEventListener('click', function() {
      alert('Settings panel coming soon!');
    });
  }

  // Filter button in word list
  const wordFilterBtn = document.getElementById('wordFilterBtn');
  if (wordFilterBtn) {
    wordFilterBtn.addEventListener('click', function() {
      alert('Advanced filters coming soon!');
    });
  }
  
  utilityListenersInitialized = true;
}
