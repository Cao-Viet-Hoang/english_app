// ============================================
// STREAK MANAGEMENT MODULE
// ============================================

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate the difference in days between two dates
 * @param {string} date1 - First date (YYYY-MM-DD)
 * @param {string} date2 - Second date (YYYY-MM-DD)
 * @returns {number} Number of days between dates
 */
function getDaysDifference(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Update user's streak based on their last active date
 * This should be called when:
 * - User logs in
 * - User completes a learning activity
 * @returns {Promise<Object>} Updated streak object
 */
async function updateUserStreak() {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const today = getTodayDate();
    const lastActiveDate = user.streak?.lastActiveDate || null;
    
    let currentStreak = user.streak?.currentStreak || 0;
    let longestStreak = user.streak?.longestStreak || 0;
    let shouldUpdate = false;

    // If no last active date, this is the first activity
    if (!lastActiveDate) {
      currentStreak = 1;
      longestStreak = 1;
      shouldUpdate = true;
      console.log('🔥 First time activity! Starting streak at 1 day.');
    } 
    // If last active was today, no update needed
    else if (lastActiveDate === today) {
      console.log('✅ Already active today. Streak maintained:', currentStreak);
      return user.streak;
    }
    // Calculate days since last activity
    else {
      const daysSinceLastActive = getDaysDifference(lastActiveDate, today);
      
      // If last active was yesterday, increment streak
      if (daysSinceLastActive === 1) {
        currentStreak += 1;
        shouldUpdate = true;
        console.log('🔥 Consecutive day! Streak increased to:', currentStreak);
      }
      // If more than 1 day has passed, reset streak
      else if (daysSinceLastActive > 1) {
        currentStreak = 1;
        shouldUpdate = true;
        console.log('💔 Streak broken. Resetting to 1 day. Days missed:', daysSinceLastActive - 1);
      }
    }

    // Update longest streak if current streak is higher
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
      console.log('🏆 New longest streak record:', longestStreak);
    }

    // Update streak object
    const updatedStreak = {
      currentStreak: currentStreak,
      longestStreak: longestStreak,
      lastActiveDate: today
    };

    // Update user object in memory
    user.streak = updatedStreak;
    
    // Save to localStorage
    saveAuthData(user, getStoredAppConfig());

    // Update in appData
    if (appData && appData.user_profiles && appData.user_profiles.length > 0) {
      appData.user_profiles[0].streak = updatedStreak;
      
      // Save to Firebase
      await saveUserStreakToFirebase(updatedStreak);
    }

    console.log('✨ Streak updated successfully:', updatedStreak);
    
    // Update UI if streak display exists
    updateStreakUI(updatedStreak);

    return updatedStreak;
  } catch (error) {
    console.error('❌ Error updating user streak:', error);
    throw error;
  }
}

/**
 * Save user streak to Firebase
 * @param {Object} streak - Streak object to save
 * @returns {Promise<void>}
 */
async function saveUserStreakToFirebase(streak) {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Check if Firebase is initialized
    if (!isFirebaseReady()) {
      throw new Error('Firebase is not initialized');
    }

    // Find user index in Firebase (assuming user ID matches array index)
    const userProfilesSnapshot = await getDatabaseRef('user_profiles').once('value');
    const allProfiles = snapshotToArray(userProfilesSnapshot);
    const userIndex = allProfiles.findIndex(p => p.id === user.id);

    if (userIndex === -1) {
      throw new Error('User not found in Firebase');
    }

    // Update only the streak field in Firebase
    await getDatabaseRef(`user_profiles/${userIndex}/streak`).set(streak);
    
    console.log('💾 Streak saved to Firebase successfully');
  } catch (error) {
    console.error('❌ Error saving streak to Firebase:', error);
    throw error;
  }
}

/**
 * Load user streak from Firebase
 * @returns {Promise<Object|null>} Streak object or null
 */
async function loadUserStreakFromFirebase() {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Check if Firebase is initialized
    if (!isFirebaseReady()) {
      throw new Error('Firebase is not initialized');
    }

    // Find user in Firebase
    const userProfilesSnapshot = await getDatabaseRef('user_profiles').once('value');
    const allProfiles = snapshotToArray(userProfilesSnapshot);
    const userProfile = allProfiles.find(p => p.id === user.id);

    if (!userProfile) {
      throw new Error('User not found in Firebase');
    }

    const streak = userProfile.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null
    };

    console.log('📥 Streak loaded from Firebase:', streak);
    return streak;
  } catch (error) {
    console.error('❌ Error loading streak from Firebase:', error);
    return null;
  }
}

/**
 * Get current user's streak
 * @returns {Object} Current streak object
 */
function getCurrentUserStreak() {
  const user = getCurrentUser();
  if (!user || !user.streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null
    };
  }
  return user.streak;
}

/**
 * Update streak display in UI
 * @param {Object} streak - Streak object to display
 */
function updateStreakUI(streak) {
  // Update current streak display in sidebar
  const currentStreakElement = document.getElementById('currentStreak');
  if (currentStreakElement) {
    currentStreakElement.textContent = streak.currentStreak;
  }

  // Update current streak in profile menu
  const profileCurrentStreakElement = document.getElementById('profileCurrentStreak');
  if (profileCurrentStreakElement) {
    profileCurrentStreakElement.textContent = streak.currentStreak;
  }

  // Update longest streak in profile menu
  const profileLongestStreakElement = document.getElementById('profileLongestStreak');
  if (profileLongestStreakElement) {
    profileLongestStreakElement.textContent = streak.longestStreak;
  }

  // Update last active date display
  const lastActiveDateElement = document.getElementById('lastActiveDate');
  if (lastActiveDateElement) {
    if (streak.lastActiveDate) {
      const date = new Date(streak.lastActiveDate);
      lastActiveDateElement.textContent = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      lastActiveDateElement.textContent = 'Never';
    }
  }

  // Show streak milestone notification if it's a milestone
  if (streak.currentStreak > 0 && streak.currentStreak % 7 === 0) {
    showStreakMilestoneNotification(streak.currentStreak);
  }
}

/**
 * Show a notification for streak milestones
 * @param {number} days - Number of consecutive days
 */
function showStreakMilestoneNotification(days) {
  let message = '';
  let emoji = '🔥';

  if (days === 7) {
    message = `Amazing! You've maintained a 7-day streak! Keep it up!`;
    emoji = '⭐';
  } else if (days === 30) {
    message = `Incredible! 30 days in a row! You're on fire!`;
    emoji = '🏆';
  } else if (days === 100) {
    message = `Legendary! 100-day streak achieved! You're unstoppable!`;
    emoji = '👑';
  } else if (days % 30 === 0) {
    message = `Wow! ${days} days of consistent learning! Amazing dedication!`;
    emoji = '💪';
  } else if (days % 7 === 0) {
    message = `Great job! ${days} days streak and counting!`;
    emoji = '🔥';
  }

  if (message) {
    // Use existing notification system if available
    if (typeof showNotification === 'function') {
      showNotification(emoji + ' ' + message, 'success');
    } else {
      console.log(emoji, message);
    }
  }
}

/**
 * Check and update streak on user login
 * This should be called after successful login
 * @returns {Promise<Object>} Updated streak
 */
async function checkStreakOnLogin() {
  try {
    console.log('🔍 Checking streak on login...');
    
    // First, load the latest streak from Firebase
    const firebaseStreak = await loadUserStreakFromFirebase();
    
    if (firebaseStreak) {
      // Update user object with Firebase streak
      const user = getCurrentUser();
      if (user) {
        user.streak = firebaseStreak;
        saveAuthData(user, getStoredAppConfig());
      }
    }
    
    // Then update the streak based on today's date
    const updatedStreak = await updateUserStreak();
    
    return updatedStreak;
  } catch (error) {
    console.error('❌ Error checking streak on login:', error);
    throw error;
  }
}

/**
 * Track learning activity and update streak
 * Call this function when user completes:
 * - A word learning session
 * - A game
 * - A quiz
 * - Any other learning activity
 * @returns {Promise<Object>} Updated streak
 */
async function trackLearningActivity() {
  try {
    console.log('📚 Tracking learning activity...');
    return await updateUserStreak();
  } catch (error) {
    console.error('❌ Error tracking learning activity:', error);
    throw error;
  }
}

// ============================================
// EXPORTS (if using modules)
// ============================================

// If you're using ES6 modules, export these functions
// export { updateUserStreak, saveUserStreakToFirebase, loadUserStreakFromFirebase, getCurrentUserStreak, checkStreakOnLogin, trackLearningActivity };
