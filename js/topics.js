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

function openTopicWords(topicId, isUserTopic = false) {
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

  // Get words from topic's vocabulary array
  const topicWords = getTopicWords(topicId, isUserTopic);
  
  // Add learned status to each word
  const wordsWithStatus = topicWords.map(word => ({
    ...word,
    status: isWordLearned(topicId, word.id, isUserTopic) ? 'learned' : 'new'
  }));
  
  renderWordCards(wordsWithStatus, 'wordCardsList');

  // Switch to word list screen
  switchScreen('wordListScreen');
}
