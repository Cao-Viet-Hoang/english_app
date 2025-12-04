// ============================================
// DATA LOADER - FIREBASE VERSION
// ============================================

let appData = null;
let currentUserId = 1; // Default user ID
let dataListeners = []; // Store active Firebase listeners

// Function to load data from Firebase Realtime Database
async function loadData() {
  try {
    // Initialize Firebase if not already initialized
    if (!getDatabase()) {
      initializeFirebase();
    }
    
    const db = getDatabase();
    
    // Create promises for all data fetches
    const userProfilesPromise = getDatabaseRef('user_profiles').once('value');
    const sharedVocabularyPromise = getDatabaseRef('shared_vocabulary').once('value');
    const userVocabularyPromise = getDatabaseRef('user_vocabulary').once('value');
    
    // Wait for all data to be fetched
    const [userProfilesSnapshot, sharedVocabularySnapshot, userVocabularySnapshot] = 
      await Promise.all([userProfilesPromise, sharedVocabularyPromise, userVocabularyPromise]);
    
    // Convert Firebase snapshots to data objects
    appData = {
      user_profiles: snapshotToArray(userProfilesSnapshot),
      shared_vocabulary: sharedVocabularySnapshot.val() || { topic: [] },
      user_vocabulary: userVocabularySnapshot.val() || {}
    };
    
    console.log('Data loaded successfully from Firebase!');
    console.log(`User Profiles: ${appData.user_profiles?.length || 0}`);
    console.log(`Shared Topics: ${appData.shared_vocabulary?.topic?.length || 0}`);
    console.log(`Current User ID: ${currentUserId}`);
    
    // Set up real-time listeners
    setupRealtimeListeners();
    
    return appData;
  } catch (error) {
    console.error('Error loading data from Firebase:', error);
    throw error;
  }
}

// Convert Firebase snapshot to array (for user_profiles)
function snapshotToArray(snapshot) {
  const result = [];
  snapshot.forEach((childSnapshot) => {
    const item = childSnapshot.val();
    result.push(item);
  });
  return result;
}

// Set up real-time listeners for data changes
function setupRealtimeListeners() {
  const db = getDatabase();
  
  // Listen for user profiles changes
  const userProfilesRef = getDatabaseRef('user_profiles');
  userProfilesRef.on('value', (snapshot) => {
    if (appData) {
      appData.user_profiles = snapshotToArray(snapshot);
      // Trigger update event if needed
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'user_profiles' } }));
    }
  });
  
  // Listen for shared vocabulary changes
  const sharedVocabRef = getDatabaseRef('shared_vocabulary');
  sharedVocabRef.on('value', (snapshot) => {
    if (appData) {
      appData.shared_vocabulary = snapshot.val() || { topic: [] };
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'shared_vocabulary' } }));
    }
  });
  
  // Listen for user vocabulary changes
  const userVocabRef = getDatabaseRef('user_vocabulary');
  userVocabRef.on('value', (snapshot) => {
    if (appData) {
      appData.user_vocabulary = snapshot.val() || {};
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'user_vocabulary' } }));
    }
  });
}

// Clean up Firebase listeners
function cleanupListeners() {
  getDatabaseRef('user_profiles').off();
  getDatabaseRef('shared_vocabulary').off();
  getDatabaseRef('user_vocabulary').off();
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
async function markWordAsLearned(topicId, wordId, isUserTopic = false) {
  const userProfile = getCurrentUserProfile();
  if (!userProfile) return;
  
  const vocabularyType = isUserTopic ? 'user_vocabulary' : 'shared_vocabulary';
  
  if (!userProfile.topic_progress[vocabularyType][topicId]) {
    userProfile.topic_progress[vocabularyType][topicId] = { learnedWordsIdList: [] };
  }
  
  const learnedWords = userProfile.topic_progress[vocabularyType][topicId].learnedWordsIdList;
  if (!learnedWords.includes(wordId)) {
    learnedWords.push(wordId);
    
    // Update Firebase
    const userIndex = appData.user_profiles.findIndex(u => u.id === currentUserId);
    if (userIndex !== -1) {
      await updateUserProfileInFirebase(userIndex, userProfile);
    }
    
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
async function updateUserStatistics() {
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
  
  // Update Firebase
  const userIndex = appData.user_profiles.findIndex(u => u.id === currentUserId);
  if (userIndex !== -1) {
    await updateUserProfileInFirebase(userIndex, userProfile);
  }
}

// Add new topic to user vocabulary
async function addUserTopic(topic) {
  const userId = currentUserId.toString();
  if (!appData.user_vocabulary[userId]) {
    appData.user_vocabulary[userId] = { topics: [] };
  }
  appData.user_vocabulary[userId].topics.push(topic);
  
  // Update Firebase
  await getDatabaseRef(`user_vocabulary/${userId}`).set(appData.user_vocabulary[userId]);
}

// Add word to existing user topic
async function addWordToUserTopic(topicId, word) {
  const userTopics = getUserTopics();
  const topic = userTopics.find(t => t.id === topicId);
  if (topic) {
    topic.vocabulary.push(word);
    topic.totalWords++;
    
    // Update Firebase
    const userId = currentUserId.toString();
    await getDatabaseRef(`user_vocabulary/${userId}`).set(appData.user_vocabulary[userId]);
  }
}

// ============================================
// FIREBASE UPDATE FUNCTIONS
// ============================================

// Update user profile in Firebase
async function updateUserProfileInFirebase(userIndex, userProfile) {
  try {
    await getDatabaseRef(`user_profiles/${userIndex}`).set(userProfile);
    console.log('User profile updated in Firebase');
  } catch (error) {
    console.error('Error updating user profile in Firebase:', error);
  }
}

// Update shared vocabulary in Firebase
async function updateSharedVocabularyInFirebase() {
  try {
    await getDatabaseRef('shared_vocabulary').set(appData.shared_vocabulary);
    console.log('Shared vocabulary updated in Firebase');
  } catch (error) {
    console.error('Error updating shared vocabulary in Firebase:', error);
  }
}

// Update user vocabulary in Firebase
async function updateUserVocabularyInFirebase(userId) {
  try {
    await getDatabaseRef(`user_vocabulary/${userId}`).set(appData.user_vocabulary[userId]);
    console.log('User vocabulary updated in Firebase');
  } catch (error) {
    console.error('Error updating user vocabulary in Firebase:', error);
  }
}


