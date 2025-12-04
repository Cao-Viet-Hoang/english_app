// ============================================
// STATE MANAGEMENT
// ============================================

let currentScreen = 'journeyScreen';
let currentTopic = null;
let currentTopicIsUser = false; // Track if viewing user topic or shared topic
let currentFilter = 'all';
let currentTab = 'all';

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

function getCurrentFilter() {
  return currentFilter;
}

function setCurrentFilter(filter) {
  currentFilter = filter;
}

function getCurrentTab() {
  return currentTab;
}

function setCurrentTab(tab) {
  currentTab = tab;
}
