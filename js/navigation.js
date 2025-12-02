// ============================================
// NAVIGATION
// ============================================

function setupNavigationListeners() {
  // Bottom navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const screenId = this.dataset.screen;
      switchScreen(screenId);
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Back button
  const backBtn = document.getElementById('backToJourneyBtn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      switchScreen('journeyScreen');
      updateBottomNav('journeyScreen');
    });
  }
}

function switchScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));
  
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    setCurrentScreen(screenId);
    
    // Load data for specific screens
    if (screenId === 'myWordsScreen') {
      renderMyWords();
    }
  }
}

function updateBottomNav(screenId) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.dataset.screen === screenId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}
