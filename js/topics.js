// ============================================
// RENDER TOPICS
// ============================================

function updateJourneyStats() {
  const topics = getTopicsData();
  const totalTopics = topics.length;
  
  let totalWords = 0;
  let learnedWords = 0;
  
  topics.forEach(topic => {
    totalWords += topic.totalWords;
    learnedWords += topic.learnedWords;
  });
  
  const progressPercent = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
  
  const topicCountEl = document.getElementById('topicCount');
  const progressCountEl = document.getElementById('progressCount');
  
  if (topicCountEl) {
    topicCountEl.textContent = `${totalTopics} ${totalTopics === 1 ? 'Topic' : 'Topics'}`;
  }
  
  if (progressCountEl) {
    progressCountEl.textContent = `${progressPercent}% Complete`;
  }
}

function renderTopics(filter = 'all') {
  const topicsList = document.getElementById('topicsList');
  if (!topicsList) return;

  const topics = getTopicsData();
  const filteredTopics = filter === 'all' 
    ? topics 
    : topics.filter(topic => topic.category === filter);

  // Update journey stats
  updateJourneyStats();

  topicsList.innerHTML = filteredTopics.map(topic => {
    const progress = Math.round((topic.learnedWords / topic.totalWords) * 100);
    
    return `
      <div class="topic-card" data-topic-id="${topic.id}">
        <div class="topic-card-header">
          <div class="topic-icon ${topic.iconColor}">
            ${topic.icon}
          </div>
          <div class="topic-info">
            <div class="topic-name">${topic.name}</div>
            <div class="topic-meta">
              <span class="topic-level">${topic.level}</span>
              <span>${topic.learnedWords}/${topic.totalWords} words</span>
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
      openTopicWords(topicId);
    });
  });
}

function openTopicWords(topicId) {
  const topics = getTopicsData();
  const topic = topics.find(t => t.id === topicId);
  if (!topic) return;

  setCurrentTopic(topic);

  // Update header
  document.getElementById('topicTitle').textContent = topic.name;
  document.getElementById('topicStats').textContent = 
    `${topic.learnedWords}/${topic.totalWords} words • ${topic.level}`;

  // Filter words for this topic
  const vocabulary = getVocabularyData();
  const topicWords = vocabulary.filter(word => word.topicId === topicId);
  renderWordCards(topicWords, 'wordCardsList');

  // Switch to word list screen
  switchScreen('wordListScreen');
}
