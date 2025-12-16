// ============================================
// STATE MANAGEMENT
// ============================================

let currentScreen = 'journeyScreen';
let previousScreen = null; // Track previous screen for back navigation
let currentTopic = null;
let currentTopicIsUser = false; // Track if viewing user topic or shared topic

function getCurrentScreen() {
  return currentScreen;
}

function setCurrentScreen(screen) {
  previousScreen = currentScreen;
  currentScreen = screen;
}

function getPreviousScreen() {
  return previousScreen;
}

function getCurrentTopic() {
  return currentTopic;
}

function setCurrentTopic(topic, isUserTopic = false) {
  currentTopic = topic;
  currentTopicIsUser = isUserTopic;
}

function isCurrentTopicUserTopic() {
  return currentTopicIsUser;
}
