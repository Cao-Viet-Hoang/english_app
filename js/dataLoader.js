// ============================================
// DATA LOADER - FIREBASE VERSION (LAZY LOADING)
// ============================================

// 🔧 DEBUG CONFIGURATION - Set to false to disable detailed logging
let DEBUG_LAZY_LOADING = false; // Change to false to disable logs

let appData = null;
let currentUserId = null; // Will be set from authenticated user
let dataListeners = new Map(); // Store active Firebase listeners by path
let topicWordsCache = new Map(); // Cache loaded topic words
let userWordsCache = null; // Cache user vocabulary

// ============================================
// INITIAL DATA LOADING
// ============================================

// Load only essential data at startup
async function loadData() {
  try {
    // Get current authenticated user
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Set current user ID
    currentUserId = user.id;
    
    // Check if Firebase is initialized
    if (!isFirebaseReady()) {
      throw new Error('Firebase is not initialized');
    }
    
    await loadInitialData();
    
    console.log('Initial data loaded successfully!');
    console.log(`Current User: ${user.name} (ID: ${currentUserId})`);
    
    return appData;
  } catch (error) {
    console.error('Error loading data from Firebase:', error);
    throw error;
  }
}

// Load only user profile and topics metadata
async function loadInitialData() {
  const db = getDatabase();
  
  if (DEBUG_LAZY_LOADING) console.log('🔄 [LAZY LOADING] Starting initial data load...');
  const startTime = DEBUG_LAZY_LOADING ? performance.now() : 0;
  
  // Load current user profile only
  const userProfileSnapshot = await getDatabaseRef(`user_profiles`).once('value');
  const allProfiles = snapshotToArray(userProfileSnapshot);
  const currentUserProfile = allProfiles.find(p => p.id === currentUserId);
  
  // Load topics metadata (without words)
  const topicsSnapshot = await getDatabaseRef('shared_vocabulary/topic').once('value');
  const topics = snapshotToArray(topicsSnapshot);
  
  // Initialize appData with minimal structure
  appData = {
    user_profiles: [currentUserProfile], // Only current user
    shared_vocabulary: {
      topic: topics.map(topic => ({
        id: topic.id,
        name: topic.name,
        description: topic.description,
        category: topic.category,
        level: topic.level,
        icon: topic.icon,
        iconColor: topic.iconColor,
        totalWords: topic.totalWords || 0,
        vocabulary: [] // Empty initially, loaded on demand
      }))
    },
    user_vocabulary: {} // Will be loaded on demand
  };
  
  if (DEBUG_LAZY_LOADING) {
    const endTime = performance.now();
    const dataSize = JSON.stringify(appData).length;
    
    console.log('✅ [LAZY LOADING] Initial data loaded!');
    console.log(`   📊 Topics: ${appData.shared_vocabulary.topic.length}`);
    console.log(`   📦 Data size: ${(dataSize / 1024).toFixed(2)} KB`);
    console.log(`   ⏱️  Time: ${(endTime - startTime).toFixed(2)} ms`);
    console.log(`   🚫 Words loaded: 0 (will load on-demand)`);
  }
  
  // Setup listener for current user profile only
  setupUserProfileListener();
}

// ============================================
// LAZY LOADING FUNCTIONS
// ============================================

// Load words for a specific topic
async function loadTopicWords(topicId) {
  const cacheKey = `shared_${topicId}`;
  
  // Return from cache if already loaded
  if (topicWordsCache.has(cacheKey)) {
    if (DEBUG_LAZY_LOADING) console.log(`♻️  [CACHE HIT] Topic ${topicId} words loaded from cache (${topicWordsCache.get(cacheKey).length} words)`);
    return topicWordsCache.get(cacheKey);
  }
  
  try {
    if (DEBUG_LAZY_LOADING) console.log(`🔄 [LAZY LOADING] Loading words for topic ${topicId}...`);
    const startTime = DEBUG_LAZY_LOADING ? performance.now() : 0;
    
    // Find topic in appData
    const topic = appData.shared_vocabulary.topic.find(t => t.id === topicId);
    if (!topic) {
      throw new Error(`Topic ${topicId} not found`);
    }
    
    // Load words from Firebase
    const wordsSnapshot = await getDatabaseRef(`shared_vocabulary/topic/${topicId}/vocabulary`).once('value');
    const words = snapshotToArray(wordsSnapshot) || [];
    
    // Update topic's vocabulary in appData
    topic.vocabulary = words;
    
    // Cache the words
    topicWordsCache.set(cacheKey, words);
    
    if (DEBUG_LAZY_LOADING) {
      const endTime = performance.now();
      const dataSize = JSON.stringify(words).length;
      
      console.log(`✅ [LAZY LOADING] Words loaded for topic ${topicId}:`);
      console.log(`   📚 Words count: ${words.length}`);
      console.log(`   📦 Data size: ${(dataSize / 1024).toFixed(2)} KB`);
      console.log(`   ⏱️  Time: ${(endTime - startTime).toFixed(2)} ms`);
      console.log(`   💾 Cached topics: ${topicWordsCache.size}`);
    }
    
    // Setup listener for this topic's words
    setupTopicWordsListener(topicId);
    
    return words;
  } catch (error) {
    console.error(`❌ [ERROR] Loading words for topic ${topicId}:`, error);
    throw error;
  }
}

// Load user vocabulary
async function loadUserWords(userId) {
  // Return from cache if already loaded
  if (userWordsCache) {
    if (DEBUG_LAZY_LOADING) console.log(`♻️  [CACHE HIT] User vocabulary loaded from cache (${userWordsCache.topics?.length || 0} topics)`);
    return userWordsCache;
  }
  
  try {
    if (DEBUG_LAZY_LOADING) console.log(`🔄 [LAZY LOADING] Loading user vocabulary...`);
    const startTime = DEBUG_LAZY_LOADING ? performance.now() : 0;
    
    const userVocabSnapshot = await getDatabaseRef(`user_vocabulary/${userId}`).once('value');
    const userVocab = userVocabSnapshot.val() || { topics: [] };
    
    // Store in appData
    appData.user_vocabulary[userId] = userVocab;
    
    // Cache it
    userWordsCache = userVocab;
    
    if (DEBUG_LAZY_LOADING) {
      const endTime = performance.now();
      const dataSize = JSON.stringify(userVocab).length;
      
      console.log(`✅ [LAZY LOADING] User vocabulary loaded:`);
      console.log(`   📚 Topics count: ${userVocab.topics?.length || 0}`);
      console.log(`   📦 Data size: ${(dataSize / 1024).toFixed(2)} KB`);
      console.log(`   ⏱️  Time: ${(endTime - startTime).toFixed(2)} ms`);
    }
    
    // Setup listener for user vocabulary
    setupUserVocabularyListener(userId);
    
    return userVocab;
  } catch (error) {
    console.error(`❌ [ERROR] Loading user vocabulary:`, error);
    throw error;
  }
}

// ============================================
// REAL-TIME LISTENERS
// ============================================

// Setup listener for current user profile
function setupUserProfileListener() {
  const path = 'user_profiles';
  
  // Remove old listener if exists
  if (dataListeners.has(path)) {
    getDatabaseRef(path).off();
  }
  
  const ref = getDatabaseRef(path);
  ref.on('value', (snapshot) => {
    if (appData) {
      const allProfiles = snapshotToArray(snapshot);
      const currentUserProfile = allProfiles.find(p => p.id === currentUserId);
      appData.user_profiles = [currentUserProfile];
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'user_profile' } }));
    }
  });
  
  dataListeners.set(path, ref);
}

// Setup listener for a specific topic's words
function setupTopicWordsListener(topicId) {
  const path = `shared_vocabulary/topic/${topicId}/vocabulary`;
  
  // Don't setup if already exists
  if (dataListeners.has(path)) return;
  
  const ref = getDatabaseRef(path);
  ref.on('value', (snapshot) => {
    if (appData) {
      const words = snapshotToArray(snapshot) || [];
      const topic = appData.shared_vocabulary.topic.find(t => t.id === topicId);
      if (topic) {
        topic.vocabulary = words;
        // Update cache
        topicWordsCache.set(`shared_${topicId}`, words);
        window.dispatchEvent(new CustomEvent('dataUpdated', { 
          detail: { type: 'topic_words', topicId } 
        }));
      }
    }
  });
  
  dataListeners.set(path, ref);
}

// Setup listener for user vocabulary
function setupUserVocabularyListener(userId) {
  const path = `user_vocabulary/${userId}`;
  
  // Remove old listener if exists
  if (dataListeners.has(path)) {
    getDatabaseRef(path).off();
  }
  
  const ref = getDatabaseRef(path);
  ref.on('value', (snapshot) => {
    if (appData) {
      const userVocab = snapshot.val() || { topics: [] };
      appData.user_vocabulary[userId] = userVocab;
      userWordsCache = userVocab;
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: 'user_vocabulary' } }));
    }
  });
  
  dataListeners.set(path, ref);
}

// Remove listener for a specific path
function removeListener(path) {
  if (dataListeners.has(path)) {
    getDatabaseRef(path).off();
    dataListeners.delete(path);
    console.log(`Listener removed: ${path}`);
  }
}

// Clean up all Firebase listeners
function cleanupListeners() {
  dataListeners.forEach((ref, path) => {
    getDatabaseRef(path).off();
  });
  dataListeners.clear();
  console.log('All listeners cleaned up');
}

// Convert Firebase snapshot to array
function snapshotToArray(snapshot) {
  const result = [];
  snapshot.forEach((childSnapshot) => {
    const item = childSnapshot.val();
    result.push(item);
  });
  return result;
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
// NOTE: This assumes words are already loaded. Use loadTopicWords() first if needed.
function getTopicWords(topicId, isUserTopic = false) {
  const topics = isUserTopic ? getUserTopics() : getSharedTopics();
  const topic = topics.find(t => t.id === topicId);
  return topic?.vocabulary || [];
}

// Check if topic words are already loaded
function areTopicWordsLoaded(topicId, isUserTopic = false) {
  if (isUserTopic) {
    return userWordsCache !== null;
  } else {
    return topicWordsCache.has(`shared_${topicId}`);
  }
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
  
  // Initialize topic_progress structure if not exists
  if (!userProfile.topic_progress) {
    userProfile.topic_progress = {
      shared_vocabulary: {},
      user_vocabulary: {}
    };
  }
  
  if (!userProfile.topic_progress[vocabularyType]) {
    userProfile.topic_progress[vocabularyType] = {};
  }
  
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
// DEBUG & MONITORING FUNCTIONS
// ============================================

// Get loading statistics
function getLoadingStats() {
  const totalTopics = appData?.shared_vocabulary?.topic?.length || 0;
  const loadedTopics = topicWordsCache.size;
  const userVocabLoaded = userWordsCache !== null;
  
  let totalWordsLoaded = 0;
  topicWordsCache.forEach(words => {
    totalWordsLoaded += words.length;
  });
  
  if (userWordsCache && userWordsCache.topics) {
    userWordsCache.topics.forEach(topic => {
      totalWordsLoaded += topic.vocabulary?.length || 0;
    });
  }
  
  const totalDataSize = JSON.stringify(appData).length;
  const cacheDataSize = JSON.stringify({
    topicWords: Array.from(topicWordsCache.values()),
    userWords: userWordsCache
  }).length;
  
  return {
    totalTopics,
    loadedTopics,
    userVocabLoaded,
    totalWordsLoaded,
    totalDataSize,
    cacheDataSize,
    activeListeners: dataListeners.size
  };
}

// Print loading statistics to console
function printLoadingStats() {
  const stats = getLoadingStats();
  
  console.log('\n📊 ============================================');
  console.log('📊 LAZY LOADING STATISTICS');
  console.log('📊 ============================================');
  console.log(`📚 Total Topics: ${stats.totalTopics}`);
  console.log(`✅ Loaded Topics: ${stats.loadedTopics} (${((stats.loadedTopics / stats.totalTopics) * 100).toFixed(1)}%)`);
  console.log(`👤 User Vocabulary: ${stats.userVocabLoaded ? '✅ Loaded' : '❌ Not loaded'}`);
  console.log(`📝 Total Words Loaded: ${stats.totalWordsLoaded}`);
  console.log(`📦 Total Data Size: ${(stats.totalDataSize / 1024).toFixed(2)} KB`);
  console.log(`💾 Cache Size: ${(stats.cacheDataSize / 1024).toFixed(2)} KB`);
  console.log(`👂 Active Listeners: ${stats.activeListeners}`);
  console.log('📊 ============================================\n');
}

// Toggle debug mode
function toggleDebugMode(enable) {
  if (typeof enable === 'boolean') {
    window.DEBUG_LAZY_LOADING = enable;
    console.log(`🔧 Debug mode ${enable ? 'ENABLED ✅' : 'DISABLED ❌'}`);
  } else {
    console.log(`🔧 Current debug mode: ${DEBUG_LAZY_LOADING ? 'ENABLED ✅' : 'DISABLED ❌'}`);
  }
}

// Add to window for easy console access
window.getLoadingStats = getLoadingStats;
window.printLoadingStats = printLoadingStats;
window.toggleDebugMode = toggleDebugMode;

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


