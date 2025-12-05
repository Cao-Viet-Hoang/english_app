// ============================================
// MAIN APP INITIALIZATION
// ============================================

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
  
  // Render initial content
  renderTopics();
  
  // Setup all event listeners
  setupNavigationListeners();
  setupFilterListeners();
  setupModalListeners();
  setupBottomSheetListeners();
  setupUtilityListeners();
  
  console.log('App initialized successfully!');
}
