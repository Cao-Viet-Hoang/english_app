// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Firebase configuration object
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyBmqDdJzk6vvi4wZs5iDiIEgrHYEBzNE8s",
  authDomain: "english-app-51007.firebaseapp.com",
  databaseURL: "https://english-app-51007-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "english-app-51007",
  storageBucket: "english-app-51007.firebasestorage.app",
  messagingSenderId: "41784019566",
  appId: "1:41784019566:web:a793e28ffe43f9070eb47f"
};

// Initialize Firebase
let app;
let database;

function initializeFirebase() {
  try {
    // Initialize Firebase
    app = firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
}

// Get Firebase database reference
function getDatabase() {
  return database;
}

// Get reference to a specific path in database
function getDatabaseRef(path) {
  return firebase.database().ref(path);
}
