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
    
    // Clean up previous screen listeners
    cleanupScreenListeners(screenId);
    
    // Load data for specific screens
    if (screenId === 'myWordsScreen') {
      renderMyWords();
    }
  }
}

// Clean up listeners when leaving a screen
function cleanupScreenListeners(newScreenId) {
  const previousScreen = getCurrentScreen();
  
  // Remove topic words listener when leaving word list screen
  if (previousScreen === 'wordListScreen' && newScreenId !== 'wordListScreen') {
    const topic = getCurrentTopic();
    if (topic && !isCurrentTopicUserTopic()) {
      const topicId = topic.id;
      removeListener(`shared_vocabulary/topic/${topicId}/vocabulary`);
      console.log(`Cleaned up listener for topic ${topicId}`);
    }
  }
  
  // Remove user vocabulary listener when leaving My Words screen
  if (previousScreen === 'myWordsScreen' && newScreenId !== 'myWordsScreen') {
    // Keep user vocabulary listener active since it's lightweight
    // removeListener(`user_vocabulary/${currentUserId}`);
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
