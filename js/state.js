// ============================================
// STATE MANAGEMENT
// ============================================

let currentScreen = 'journeyScreen';
let currentTopic = null;
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

function setCurrentTopic(topic) {
  currentTopic = topic;
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
