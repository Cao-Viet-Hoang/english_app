// ============================================
// MY WORDS FUNCTIONALITY
// ============================================

async function renderMyWords(filter = 'all') {
  const container = document.getElementById('myTopicsList');
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
      <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 16px;"></i>
      <p>Loading your topics...</p>
    </div>
  `;

  try {
    // Load user vocabulary if not already loaded
    if (!userWordsCache) {
      await loadUserWords(currentUserId.toString());
    }

    // Get user's personal topics only (not shared vocabulary)
    const userTopics = getUserTopics();
    
    const filteredTopics = filter === 'all' 
      ? userTopics 
      : userTopics.filter(topic => topic.category === filter);

    if (filteredTopics.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <i class="fas fa-book-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
          <p>No personal topics yet. Add your first topic!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredTopics.map(topic => {
      const learnedWords = getLearnedWordsCount(topic.id, true);
      const progress = topic.totalWords > 0 
        ? Math.round((learnedWords / topic.totalWords) * 100) 
        : 0;
      
      return `
        <div class="topic-card" data-topic-id="${topic.id}" data-is-user="true">
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
    const topicCards = container.querySelectorAll('.topic-card');
    topicCards.forEach(card => {
      card.addEventListener('click', function() {
        const topicId = parseInt(this.dataset.topicId);
        const isUserTopic = this.dataset.isUser === 'true';
        openTopicWords(topicId, isUserTopic);
      });
    });
  } catch (error) {
    console.error('Error loading user topics:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--error);">
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>Error loading your topics. Please try again.</p>
      </div>
    `;
  }
}
