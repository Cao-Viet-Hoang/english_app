// ============================================
// STATE MANAGEMENT
// ============================================

let currentScreen = 'journeyScreen';
let currentTopic = null;
let currentTopicIsUser = false; // Track if viewing user topic or shared topic

function getCurrentScreen() {
  return currentScreen;
}

function setCurrentScreen(screen) {
  currentScreen = screen;
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
