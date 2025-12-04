// ============================================
// WORD CARDS RENDERING & INTERACTION
// ============================================

function renderWordCards(words, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = words.map(word => `
    <div class="word-card" data-word-id="${word.id}">
      <div class="word-card-header">
        <div class="word-main">
          <h3 class="word-english">${word.english}</h3>
          <div class="audio-icons">
            <button class="audio-btn us" data-audio="us" title="US pronunciation">
              <i class="fas fa-volume-up"></i>
            </button>
            <button class="audio-btn uk" data-audio="uk" title="UK pronunciation">
              <i class="fas fa-volume-up"></i>
            </button>
          </div>
        </div>
        <div class="word-status ${word.status}"></div>
      </div>
      
      <div class="word-ipa">${word.ipa}</div>
      
      <div class="word-meaning-container">
        <div class="word-meaning">
          <div class="meaning-label">Vietnamese meaning:</div>
          <div class="meaning-text" id="meaning-${word.id}">${word.vietnameseMeaning}</div>
          <div class="meaning-hidden" data-word-id="${word.id}">
            Tap to reveal
          </div>
        </div>
        <button class="expand-btn" data-word-id="${word.id}">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
    </div>
  `).join('');

  // Add event listeners
  setupWordCardListeners();
}

function setupWordCardListeners() {
  // Audio buttons
  const audioBtns = document.querySelectorAll('.audio-btn');
  audioBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      playAudio(this.dataset.audio);
      
      // Visual feedback
      this.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.style.transform = '';
      }, 200);
    });
  });

  // Meaning reveal buttons
  const meaningBtns = document.querySelectorAll('.meaning-hidden');
  meaningBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const wordId = this.dataset.wordId;
      const meaningText = document.getElementById(`meaning-${wordId}`);
      
      if (meaningText) {
        meaningText.classList.toggle('visible');
        this.textContent = meaningText.classList.contains('visible') 
          ? 'Hide' 
          : 'Tap to reveal';
      }
    });
  });

  // Expand buttons
  const expandBtns = document.querySelectorAll('.expand-btn');
  expandBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const wordId = parseInt(this.dataset.wordId);
      openWordDetail(wordId);
    });
  });
  
  // Word status toggle (mark as learned)
  const statusBtns = document.querySelectorAll('.word-status');
  statusBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const card = this.closest('.word-card');
      const wordId = parseInt(card.dataset.wordId);
      const topic = getCurrentTopic();
      const isUserTopic = isCurrentTopicUserTopic();
      
      if (this.classList.contains('learned')) {
        // Already learned, do nothing or allow unmark
        return;
      } else {
        // Mark as learned
        markWordAsLearned(topic.id, wordId, isUserTopic);
        this.classList.add('learned');
        
        // Update topic stats
        const learnedWords = getLearnedWordsCount(topic.id, isUserTopic);
        document.getElementById('topicStats').textContent = 
          `${learnedWords}/${topic.totalWords} words • ${topic.level}`;
      }
    });
  });
}
