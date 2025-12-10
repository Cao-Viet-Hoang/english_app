// ============================================
// RENDER TOPICS
// ============================================

function updateJourneyStats() {
  const userProfile = getCurrentUserProfile();
  if (!userProfile) return;
  
  // Only count shared topics for Journey screen
  const sharedTopics = getSharedTopics();
  const totalTopics = sharedTopics.length;
  
  // Calculate progress for shared vocabulary only
  let totalSharedWords = 0;
  let learnedSharedWords = 0;
  
  sharedTopics.forEach(topic => {
    totalSharedWords += topic.totalWords;
    learnedSharedWords += getLearnedWordsCount(topic.id, false);
  });
  
  const sharedProgress = totalSharedWords > 0 
    ? Math.round((learnedSharedWords / totalSharedWords) * 100) 
    : 0;
  
  const topicCountEl = document.getElementById('topicCount');
  const progressCountEl = document.getElementById('progressCount');
  
  if (topicCountEl) {
    topicCountEl.textContent = `${totalTopics} ${totalTopics === 1 ? 'Topic' : 'Topics'}`;
  }
  
  if (progressCountEl) {
    progressCountEl.textContent = `${sharedProgress}% Complete`;
  }
}

function renderTopics(filter = 'all') {
  const topicsList = document.getElementById('topicsList');
  if (!topicsList) return;

  // Only show shared vocabulary topics in Journey screen
  const sharedTopics = getSharedTopics();
  
  const filteredTopics = filter === 'all' 
    ? sharedTopics 
    : sharedTopics.filter(topic => topic.category === filter);

  // Update journey stats
  updateJourneyStats();

  topicsList.innerHTML = filteredTopics.map(topic => {
    const learnedWords = getLearnedWordsCount(topic.id, false);
    const progress = topic.totalWords > 0 
      ? Math.round((learnedWords / topic.totalWords) * 100) 
      : 0;
    
    return `
      <div class="topic-card" data-topic-id="${topic.id}" data-is-user="false">
        <div class="topic-card-header">
          <div class="topic-icon" style="background: ${topic.iconColor};">
            ${topic.icon}
          </div>
          <div class="topic-info">
            <div class="topic-name">${topic.name}</div>
            <div class="topic-meta">
              <span class="topic-level">${topic.level}</span>
              <span>${learnedWords}/${topic.totalWords} words</span>
            </div>
          </div>
        </div>
        <div class="topic-progress-container">
          <div class="progress-info">
            <span>Progress</span>
            <span>${progress}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Add click listeners to topic cards
  const topicCards = document.querySelectorAll('.topic-card');
  topicCards.forEach(card => {
    card.addEventListener('click', function() {
      const topicId = parseInt(this.dataset.topicId);
      const isUserTopic = this.dataset.isUser === 'true';
      openTopicWords(topicId, isUserTopic);
    });
  });
}

async function openTopicWords(topicId, isUserTopic = false) {
  const topics = isUserTopic ? getUserTopics() : getSharedTopics();
  const topic = topics.find(t => t.id === topicId);
  if (!topic) return;

  setCurrentTopic(topic, isUserTopic);

  const learnedWords = getLearnedWordsCount(topicId, isUserTopic);
  
  // Update header
  const topicIconEl = document.getElementById('topicIcon');
  if (topicIconEl) {
    topicIconEl.textContent = topic.icon;
    topicIconEl.style.background = topic.iconColor;
  }
  
  document.getElementById('topicTitle').textContent = topic.name;
  document.getElementById('topicStats').textContent = 
    `${learnedWords}/${topic.totalWords} words • ${topic.level}`;

  // Switch to word list screen first
  switchScreen('wordListScreen');
  
  // Show/hide Add Word FAB button (only for user topics)
  const addWordBtn = document.getElementById('addWordToCurrentTopicBtn');
  if (addWordBtn) {
    if (isUserTopic) {
      addWordBtn.style.display = 'flex';
      addWordBtn.dataset.topicId = topicId;
      addWordBtn.dataset.topicName = topic.name;
    } else {
      addWordBtn.style.display = 'none';
    }
  }
  
  // Show loading state
  const container = document.getElementById('wordCardsList');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>Loading words...</p>
      </div>
    `;
  }

  try {
    // Load words if not already loaded
    if (!areTopicWordsLoaded(topicId, isUserTopic)) {
      if (isUserTopic) {
        await loadUserWords(currentUserId.toString());
      } else {
        await loadTopicWords(topicId);
      }
    }

    // Get words from topic's vocabulary array
    const topicWords = getTopicWords(topicId, isUserTopic);
    
    // Add learned status to each word
    const wordsWithStatus = topicWords.map(word => ({
      ...word,
      status: isWordLearned(topicId, word.id, isUserTopic) ? 'learned' : 'new'
    }));
    
    renderWordCards(wordsWithStatus, 'wordCardsList');
  } catch (error) {
    console.error('Error loading topic words:', error);
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--error);">
          <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
          <p>Error loading words. Please try again.</p>
        </div>
      `;
    }
  }
}

/**
 * Refresh word list for current topic (used after adding new word)
 */
async function refreshCurrentTopicWordList() {
  const currentTopic = getCurrentTopic();
  const isUserTopic = isCurrentTopicUserTopic();
  
  if (!currentTopic) return;

  try {
    // Force reload user words to get the latest data from appData
    if (isUserTopic) {
      // No need to reload from Firebase, just get fresh reference from appData
      const userTopics = getUserTopics();
      const updatedTopic = userTopics.find(t => t.id === currentTopic.id);
      
      if (updatedTopic) {
        // Update the topic in state
        setCurrentTopic(updatedTopic, isUserTopic);
        
        const learnedWords = getLearnedWordsCount(updatedTopic.id, isUserTopic);
        const topicStatsEl = document.getElementById('topicStats');
        if (topicStatsEl) {
          topicStatsEl.textContent = 
            `${learnedWords}/${updatedTopic.totalWords} words • ${updatedTopic.level}`;
        }
        
        // Get words from topic's vocabulary array
        const topicWords = updatedTopic.vocabulary || [];
        
        // Add learned status to each word
        const wordsWithStatus = topicWords.map(word => ({
          ...word,
          status: isWordLearned(updatedTopic.id, word.id, isUserTopic) ? 'learned' : 'new'
        }));
        
        // Re-render the word cards
        renderWordCards(wordsWithStatus, 'wordCardsList');
      }
    }
    
  } catch (error) {
    console.error('Error refreshing word list:', error);
  }
}
