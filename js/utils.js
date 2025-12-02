// ============================================
// UTILITY FUNCTIONS
// ============================================

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
function setupUtilityListeners() {
  // Review All functionality
  const reviewAllBtn = document.getElementById('reviewAllBtn');
  if (reviewAllBtn) {
    reviewAllBtn.addEventListener('click', function() {
      alert('Review mode coming soon! This will start a flashcard session.');
    });
  }

  // Settings button
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
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
}
