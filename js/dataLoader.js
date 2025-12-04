// ============================================
// DATA LOADER
// ============================================

let appData = null;
let currentUserId = 1; // Default user ID

// Function to load data from JSON file
async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    appData = await response.json();
    
    console.log('Data loaded successfully!');
    console.log(`User Profiles: ${appData.user_profiles?.length || 0}`);
    console.log(`Shared Topics: ${appData.shared_vocabulary?.topic?.length || 0}`);
    console.log(`Current User ID: ${currentUserId}`);
    
    return appData;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// Get current user profile
function getCurrentUserProfile() {
  if (!appData || !appData.user_profiles) return null;
  return appData.user_profiles.find(user => user.id === currentUserId);
}

// Get shared topics
function getSharedTopics() {
  return appData?.shared_vocabulary?.topic || [];
}

// Get user's personal topics
function getUserTopics() {
  const userVocab = appData?.user_vocabulary?.[currentUserId];
  return userVocab?.topics || [];
}

// Get words from a specific topic (shared or user)
function getTopicWords(topicId, isUserTopic = false) {
  const topics = isUserTopic ? getUserTopics() : getSharedTopics();
  const topic = topics.find(t => t.id === topicId);
  return topic?.vocabulary || [];
}

// Check if a word is learned by current user
function isWordLearned(topicId, wordId, isUserTopic = false) {
  const userProfile = getCurrentUserProfile();
  if (!userProfile) return false;
  
  const vocabularyType = isUserTopic ? 'user_vocabulary' : 'shared_vocabulary';
  const topicProgress = userProfile.topic_progress?.[vocabularyType]?.[topicId];
  
  return topicProgress?.learnedWordsIdList?.includes(wordId) || false;
}

// Mark word as learned
function markWordAsLearned(topicId, wordId, isUserTopic = false) {
  const userProfile = getCurrentUserProfile();
  if (!userProfile) return;
  
  const vocabularyType = isUserTopic ? 'user_vocabulary' : 'shared_vocabulary';
  
  if (!userProfile.topic_progress[vocabularyType][topicId]) {
    userProfile.topic_progress[vocabularyType][topicId] = { learnedWordsIdList: [] };
  }
  
  const learnedWords = userProfile.topic_progress[vocabularyType][topicId].learnedWordsIdList;
  if (!learnedWords.includes(wordId)) {
    learnedWords.push(wordId);
    updateUserStatistics();
  }
}

// Get count of learned words in a topic
function getLearnedWordsCount(topicId, isUserTopic = false) {
  const userProfile = getCurrentUserProfile();
  if (!userProfile) return 0;
  
  const vocabularyType = isUserTopic ? 'user_vocabulary' : 'shared_vocabulary';
  const topicProgress = userProfile.topic_progress?.[vocabularyType]?.[topicId];
  
  return topicProgress?.learnedWordsIdList?.length || 0;
}

// Update user statistics
function updateUserStatistics() {
  const userProfile = getCurrentUserProfile();
  if (!userProfile) return;
  
  let totalLearnedWords = 0;
  let totalWords = 0;
  
  // Count shared vocabulary
  const sharedTopics = getSharedTopics();
  sharedTopics.forEach(topic => {
    totalWords += topic.totalWords;
    totalLearnedWords += getLearnedWordsCount(topic.id, false);
  });
  
  // Count user vocabulary
  const userTopics = getUserTopics();
  userTopics.forEach(topic => {
    totalWords += topic.totalWords;
    totalLearnedWords += getLearnedWordsCount(topic.id, true);
  });
  
  userProfile.statistics.totalWords = totalWords;
  userProfile.statistics.totalLearnedWords = totalLearnedWords;
  userProfile.statistics.learningProgress = totalWords > 0 
    ? Math.round((totalLearnedWords / totalWords) * 100) 
    : 0;
}

// Add new topic to user vocabulary
function addUserTopic(topic) {
  const userId = currentUserId.toString();
  if (!appData.user_vocabulary[userId]) {
    appData.user_vocabulary[userId] = { topics: [] };
  }
  appData.user_vocabulary[userId].topics.push(topic);
}

// Add word to existing user topic
function addWordToUserTopic(topicId, word) {
  const userTopics = getUserTopics();
  const topic = userTopics.find(t => t.id === topicId);
  if (topic) {
    topic.vocabulary.push(word);
    topic.totalWords++;
  }
}


