// ============================================
// AUTHENTICATION MODULE
// ============================================

const AUTH_STORAGE_KEY = 'englishApp_auth';
const APP_CONFIG_KEY = 'englishApp_appConfig';

let currentUser = null;

// ============================================
// AUTHENTICATION STATE MANAGEMENT
// ============================================

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
function isAuthenticated() {
  const authData = getAuthData();
  return authData !== null && authData.user !== null;
}

/**
 * Get stored authentication data from localStorage
 * @returns {Object|null} Authentication data or null
 */
function getAuthData() {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading auth data:', error);
    return null;
  }
}

/**
 * Get stored app configuration from localStorage
 * @returns {Object|null} App config or null
 */
function getStoredAppConfig() {
  try {
    const config = localStorage.getItem(APP_CONFIG_KEY);
    return config ? JSON.parse(config) : null;
  } catch (error) {
    console.error('Error reading app config:', error);
    return null;
  }
}

/**
 * Save authentication data to localStorage
 * @param {Object} user - User profile data
 * @param {Object} appConfig - App configuration (Firebase + additional settings)
 */
function saveAuthData(user, appConfig) {
  try {
    const authData = {
      user: user,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    localStorage.setItem(APP_CONFIG_KEY, JSON.stringify(appConfig));
    currentUser = user;
    console.log('Auth data saved successfully');
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
}

/**
 * Clear authentication data from localStorage
 */
function clearAuthData() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Keep app config for next login
    currentUser = null;
    console.log('Auth data cleared');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}

/**
 * Get current logged-in user
 * @returns {Object|null} Current user or null
 */
function getCurrentUser() {
  if (currentUser) {
    return currentUser;
  }
  
  const authData = getAuthData();
  if (authData && authData.user) {
    currentUser = authData.user;
    return currentUser;
  }
  
  return null;
}

// ============================================
// LOGIN FUNCTIONALITY
// ============================================

/**
 * Show login modal
 */
function showLoginModal() {
  const overlay = document.getElementById('loginModalOverlay');
  const modal = document.getElementById('loginModal');
  const appConfigInput = document.getElementById('firebaseConfig');
  
  // Pre-fill app config if it exists
  const storedConfig = getStoredAppConfig();
  if (storedConfig) {
    appConfigInput.value = JSON.stringify(storedConfig, null, 2);
  }
  
  overlay.classList.add('active');
  modal.classList.add('active');
}

/**
 * Hide login modal
 */
function hideLoginModal() {
  const overlay = document.getElementById('loginModalOverlay');
  const modal = document.getElementById('loginModal');
  const errorDiv = document.getElementById('loginError');
  
  overlay.classList.remove('active');
  modal.classList.remove('active');
  errorDiv.style.display = 'none';
}

/**
 * Display login error message
 * @param {string} message - Error message to display
 */
function showLoginError(message) {
  const errorDiv = document.getElementById('loginError');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

/**
 * Hide login error message
 */
function hideLoginError() {
  const errorDiv = document.getElementById('loginError');
  errorDiv.style.display = 'none';
}

/**
 * Validate app configuration JSON
 * @param {string} configStr - JSON string of app config
 * @returns {Object|null} Parsed config or null if invalid
 */
function validateAppConfig(configStr) {
  try {
    const config = JSON.parse(configStr);
    
    // Check required Firebase fields (minimum required)
    const requiredFields = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Additional fields can be added here in the future
    return config;
  } catch (error) {
    console.error('Invalid app config:', error);
    return null;
  }
}

/**
 * Authenticate user with app configuration
 * @param {string} username - Username
 * @param {string} password - Password
 * @param {Object} appConfig - App configuration (Firebase + additional settings)
 * @returns {Promise<Object|null>} User profile or null if authentication fails
 */
async function authenticateUser(username, password, appConfig) {
  try {
    // Extract only Firebase-specific fields from app config
    const firebaseConfig = {
      apiKey: appConfig.apiKey,
      authDomain: appConfig.authDomain,
      databaseURL: appConfig.databaseURL,
      projectId: appConfig.projectId,
      storageBucket: appConfig.storageBucket,
      messagingSenderId: appConfig.messagingSenderId,
      appId: appConfig.appId
    };
    
    // Initialize Firebase with extracted config
    const initialized = await initializeFirebaseWithConfig(firebaseConfig);
    if (!initialized) {
      throw new Error('Failed to initialize Firebase');
    }
    
    // Get user profiles from database
    const database = getDatabase();
    const usersRef = firebase.database().ref('user_profiles');
    
    const snapshot = await usersRef.once('value');
    const users = snapshot.val();
    
    if (!users || !Array.isArray(users)) {
      throw new Error('No user profiles found in database');
    }
    
    // Find user with matching credentials
    const user = users.find(u => 
      u && u.account === username && u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const configStr = document.getElementById('firebaseConfig').value.trim();
  const submitBtn = document.getElementById('loginSubmitBtn');
  
  // Validate inputs
  if (!username || !password || !configStr) {
    showLoginError('Please fill in all required fields');
    return;
  }
  
  // Validate app configuration
  const appConfig = validateAppConfig(configStr);
  if (!appConfig) {
    showLoginError('Invalid app configuration JSON. Please check the format.');
    return;
  }
  
  hideLoginError();
  
  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  
  try {
    // Authenticate user
    const user = await authenticateUser(username, password, appConfig);
    
    // Save auth data
    saveAuthData(user, appConfig);
    
    // Update UI
    updateUIForAuthenticatedUser(user);
    
    // Hide login modal
    hideLoginModal();
    
    // Reload data
    await loadData();
    initializeApp();
    
    console.log('Login successful:', user.name);
  } catch (error) {
    showLoginError(error.message || 'Login failed. Please try again.');
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
  }
}

// ============================================
// LOGOUT FUNCTIONALITY
// ============================================

/**
 * Handle user logout
 */
function handleLogout() {
  const confirmed = confirm('Are you sure you want to logout?');
  
  if (confirmed) {
    clearAuthData();
    
    // Hide profile menu if open
    hideProfileMenu();
    
    // Show login modal
    showLoginModal();
    
    // Clear UI
    updateUIForLoggedOutUser();
    
    console.log('User logged out successfully');
  }
}

/**
 * Show profile menu
 */
function showProfileMenu() {
  const profileMenu = document.getElementById('profileMenu');
  const user = getCurrentUser();
  
  console.log('showProfileMenu called', { profileMenu, user });
  
  if (profileMenu && user) {
    // Update profile info
    const profileName = document.getElementById('profileMenuName');
    const profileUsername = document.getElementById('profileMenuUsername');
    
    if (profileName) {
      profileName.textContent = user.name || 'User';
    }
    if (profileUsername) {
      profileUsername.textContent = '@' + (user.account || 'username');
    }
    
    profileMenu.classList.add('active');
    console.log('Profile menu activated', profileMenu.className);
    
    // Close menu when clicking outside
    setTimeout(() => {
      document.addEventListener('click', closeProfileMenuOnClickOutside);
    }, 0);
  } else {
    console.warn('Cannot show profile menu', { profileMenuExists: !!profileMenu, userExists: !!user });
  }
}

/**
 * Hide profile menu
 */
function hideProfileMenu() {
  const profileMenu = document.getElementById('profileMenu');
  if (profileMenu) {
    profileMenu.classList.remove('active');
    document.removeEventListener('click', closeProfileMenuOnClickOutside);
  }
}

/**
 * Toggle profile menu
 */
function toggleProfileMenu() {
  const profileMenu = document.getElementById('profileMenu');
  if (profileMenu && profileMenu.classList.contains('active')) {
    hideProfileMenu();
  } else {
    showProfileMenu();
  }
}

/**
 * Close profile menu when clicking outside
 */
function closeProfileMenuOnClickOutside(event) {
  const profileMenu = document.getElementById('profileMenu');
  const userProfileBtn = document.getElementById('userProfileBtn');
  
  if (profileMenu && 
      !profileMenu.contains(event.target) && 
      event.target !== userProfileBtn &&
      !userProfileBtn.contains(event.target)) {
    hideProfileMenu();
  }
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

/**
 * Update UI elements when user is authenticated
 * @param {Object} user - User profile
 */
function updateUIForAuthenticatedUser(user) {
  const userNameElement = document.getElementById('headerUserName');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (userNameElement) {
    userNameElement.textContent = user.name || user.account;
  }
  
  if (logoutBtn) {
    logoutBtn.style.display = 'block';
  }
}

/**
 * Update UI elements when user is logged out
 */
function updateUIForLoggedOutUser() {
  const userNameElement = document.getElementById('headerUserName');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (userNameElement) {
    userNameElement.textContent = '';
  }
  
  if (logoutBtn) {
    logoutBtn.style.display = 'none';
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize authentication module
 */
function initAuth() {
  const loginForm = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const userProfileBtn = document.getElementById('userProfileBtn');
  const profileLogoutBtn = document.getElementById('profileLogoutBtn');
  
  // Setup event listeners
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Profile menu toggle
  if (userProfileBtn) {
    console.log('User profile button found, adding event listener');
    userProfileBtn.addEventListener('click', (e) => {
      console.log('User profile button clicked');
      e.stopPropagation();
      toggleProfileMenu();
    });
  } else {
    console.warn('User profile button not found');
  }
  
  // Logout from profile menu
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', handleLogout);
  }
  
  // Check authentication state
  if (isAuthenticated()) {
    const user = getCurrentUser();
    updateUIForAuthenticatedUser(user);
    
    // Initialize Firebase with stored app config
    const appConfig = getStoredAppConfig();
    if (appConfig) {
      // Extract only Firebase-specific fields
      const firebaseConfig = {
        apiKey: appConfig.apiKey,
        authDomain: appConfig.authDomain,
        databaseURL: appConfig.databaseURL,
        projectId: appConfig.projectId,
        storageBucket: appConfig.storageBucket,
        messagingSenderId: appConfig.messagingSenderId,
        appId: appConfig.appId
      };
      initializeFirebaseWithConfig(firebaseConfig);
    }
  } else {
    showLoginModal();
    updateUIForLoggedOutUser();
  }
  
  console.log('Auth module initialized');
}

// Initialize auth when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
