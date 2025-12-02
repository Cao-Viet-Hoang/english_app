// ============================================
// MAIN APP INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
  await loadData();
  initializeApp();
});

function initializeApp() {
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
