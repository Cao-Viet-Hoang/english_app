// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Default Firebase configuration object (can be overridden at login)
const defaultFirebaseConfig = {
  apiKey: "AIzaSyBmqDdJzk6vvi4wZs5iDiIEgrHYEBzNE8s",
  authDomain: "english-app-51007.firebaseapp.com",
  databaseURL: "https://english-app-51007-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "english-app-51007",
  storageBucket: "english-app-51007.firebasestorage.app",
  messagingSenderId: "41784019566",
  appId: "1:41784019566:web:a793e28ffe43f9070eb47f"
};

// Firebase app and database instances
let app;
let database;
let isFirebaseInitialized = false;

/**
 * Initialize Firebase with provided configuration
 * @param {Object} config - Firebase configuration object
 * @returns {Promise<boolean>} True if initialization successful
 */
async function initializeFirebaseWithConfig(config) {
  try {
    // Delete existing Firebase app if already initialized
    if (isFirebaseInitialized && app) {
      await app.delete();
      isFirebaseInitialized = false;
      console.log('Previous Firebase instance deleted');
    }
    
    // Initialize Firebase with new config
    app = firebase.initializeApp(config);
    database = firebase.database();
    isFirebaseInitialized = true;
    
    console.log('Firebase initialized successfully with custom config');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    isFirebaseInitialized = false;
    return false;
  }
}

/**
 * Initialize Firebase with default configuration
 * @returns {boolean} True if initialization successful
 */
function initializeFirebase() {
  try {
    if (isFirebaseInitialized) {
      console.log('Firebase already initialized');
      return true;
    }
    
    app = firebase.initializeApp(defaultFirebaseConfig);
    database = firebase.database();
    isFirebaseInitialized = true;
    
    console.log('Firebase initialized successfully with default config');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    isFirebaseInitialized = false;
    return false;
  }
}

/**
 * Get Firebase database reference
 * @returns {Object} Firebase database instance
 */
function getDatabase() {
  return database;
}

/**
 * Get reference to a specific path in database
 * @param {string} path - Database path
 * @returns {Object} Firebase database reference
 */
function getDatabaseRef(path) {
  return firebase.database().ref(path);
}

/**
 * Check if Firebase is initialized
 * @returns {boolean} True if Firebase is initialized
 */
function isFirebaseReady() {
  return isFirebaseInitialized && database !== null;
}
