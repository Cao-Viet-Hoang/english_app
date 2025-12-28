// ============================================
// MAIN APP INITIALIZATION
// ============================================

// Load theme immediately (even before DOM is ready) to prevent flash
(function() {
  const savedTheme = localStorage.getItem('englishAppTheme') || 'ocean';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

document.addEventListener('DOMContentLoaded', async function() {
  // Check authentication first
  if (!isAuthenticated()) {
    console.log('User not authenticated. Login required.');
    return; // Auth module will show login modal
  }

  // Load data and initialize app for authenticated users
  await loadData();
  initializeApp();
});

function initializeApp() {
  // Check if user is authenticated before initializing
  if (!isAuthenticated()) {
    console.log('Cannot initialize app: User not authenticated');
    return;
  }

  // Initialize notification styles
  initNotificationStyles();

  // Initialize theme switcher
  initThemeSwitcher();
  
  // Render initial content
  renderTopics();
  
  // Setup all event listeners
  setupNavigationListeners();
  setupFilterListeners();
  setupModalListeners();
  setupBottomSheetListeners();
  setupUtilityListeners();
  setupGamesListeners();
  setupQuizGameListeners();
  
  console.log('App initialized successfully!');
}
