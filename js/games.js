// ============================================
// GAMES MODULE
// ============================================

let currentGame = null;
let currentGameTopic = null;
let currentGameSource = 'shared'; // 'shared' or 'user'
let matchingGameState = {
  words: [],
  selectedWord: null,
  selectedMeaning: null,
  matchedPairs: [],
  totalPairs: 0
};

// ============================================
// GAME NAVIGATION
// ============================================

function setupGamesListeners() {
  // Game card clicks - Navigate to topic selection
  const gameCards = document.querySelectorAll('.game-card');
  gameCards.forEach(card => {
    card.addEventListener('click', function() {
      const gameType = this.dataset.game;
      currentGame = gameType;
      switchScreen('gameTopicSelectionScreen');
      updateBottomNav('gamesScreen');
      renderGameTopicsList();
    });
  });

  // Back to games button (from topic selection)
  const backToGamesBtn = document.getElementById('backToGamesBtn');
  if (backToGamesBtn) {
    backToGamesBtn.addEventListener('click', function() {
      switchScreen('gamesScreen');
      updateBottomNav('gamesScreen');
    });
  }

  // Topic source tabs
  const topicSourceTabs = document.querySelectorAll('.topic-source-tab');
  topicSourceTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      topicSourceTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentGameSource = this.dataset.source;
      renderGameTopicsList();
    });
  });

  // Back to topic selection (from game)
  const backToGameTopicSelectionBtn = document.getElementById('backToGameTopicSelectionBtn');
  if (backToGameTopicSelectionBtn) {
    backToGameTopicSelectionBtn.addEventListener('click', function() {
      switchScreen('gameTopicSelectionScreen');
      updateBottomNav('gamesScreen');
    });
  }

  // Play again button
  const playAgainBtn = document.getElementById('playAgainBtn');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', function() {
      startMatchingGame(currentGameTopic);
    });
  }

  // Back to games from complete
  const backToGamesFromCompleteBtn = document.getElementById('backToGamesFromCompleteBtn');
  if (backToGamesFromCompleteBtn) {
    backToGamesFromCompleteBtn.addEventListener('click', function() {
      switchScreen('gamesScreen');
      updateBottomNav('gamesScreen');
    });
  }
}

// ============================================
// RENDER GAME TOPICS LIST
// ============================================

function renderGameTopicsList() {
  const gameTopicsList = document.getElementById('gameTopicsList');
  if (!gameTopicsList) return;

  const topics = currentGameSource === 'shared' ? getSharedTopics() : getUserTopics();
  
  if (!topics || topics.length === 0) {
    gameTopicsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>No topics available</p>
        ${currentGameSource === 'user' ? '<p class="empty-hint">Create your own topics in "My Words"</p>' : ''}
      </div>
    `;
    return;
  }

  let html = '';
  topics.forEach(topic => {
    const words = topic.vocabulary || [];
    const wordCount = topic.totalWords || words.length;
    const levelBadge = getLevelBadge(topic.level || topic.category);
    
    html += `
      <div class="game-topic-card" data-topic-id="${topic.id}" data-source="${currentGameSource}">
        <div class="topic-icon" style="background: ${topic.iconColor || topic.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}">
          ${topic.icon || '📚'}
        </div>
        <div class="topic-info">
          <h3 class="topic-name">${topic.nameVi || topic.name}</h3>
          <div class="topic-meta">
            ${levelBadge}
            <span class="word-count">
              <i class="fas fa-book"></i> ${wordCount} words
            </span>
          </div>
        </div>
        <div class="topic-action">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    `;
  });

  gameTopicsList.innerHTML = html;

  // Add click listeners to topic cards
  const topicCards = gameTopicsList.querySelectorAll('.game-topic-card');
  topicCards.forEach(card => {
    card.addEventListener('click', function() {
      const topicId = parseInt(this.dataset.topicId);
      const source = this.dataset.source;
      startGame(topicId, source);
    });
  });
}

// ============================================
// START GAME
// ============================================

async function startGame(topicId, source) {
  const topics = source === 'shared' ? getSharedTopics() : getUserTopics();
  const topic = topics.find(t => t.id === topicId);
  
  if (!topic) {
    showNotification('Topic not found!', 'error');
    return;
  }

  // Load words if not already loaded
  const isUserTopic = source === 'user';
  
  if (!isUserTopic) {
    // For shared topics, load words if needed
    if (!areTopicWordsLoaded(topicId, false)) {
      try {
        await loadTopicWords(topicId);
      } catch (error) {
        console.error('Error loading topic words:', error);
        showNotification('Failed to load topic words', 'error');
        return;
      }
    }
  } else {
    // For user topics, load user vocabulary if needed
    if (!userWordsCache) {
      try {
        await loadUserWords(currentUserId);
      } catch (error) {
        console.error('Error loading user words:', error);
        showNotification('Failed to load user vocabulary', 'error');
        return;
      }
    }
  }

  // Get the updated topic with words
  const updatedTopics = source === 'shared' ? getSharedTopics() : getUserTopics();
  const topicWithWords = updatedTopics.find(t => t.id === topicId);
  
  if (!topicWithWords || !topicWithWords.vocabulary || topicWithWords.vocabulary.length === 0) {
    showNotification('This topic has no words yet!', 'warning');
    return;
  }

  currentGameTopic = topicWithWords;

  // Start the appropriate game
  if (currentGame === 'matching') {
    startMatchingGame(topicWithWords);
  }
}

// ============================================
// MATCHING GAME
// ============================================

function startMatchingGame(topic) {
  // Switch to matching game screen
  switchScreen('matchingGameScreen');
  updateBottomNav('gamesScreen');

  // Update header
  const titleEl = document.getElementById('matchingGameTitle');
  const subtitleEl = document.getElementById('matchingGameSubtitle');
  if (titleEl) titleEl.textContent = `${topic.nameVi || topic.name}`;
  if (subtitleEl) subtitleEl.textContent = 'Match words with their meanings';

  // Hide complete overlay
  const completeOverlay = document.getElementById('gameCompleteOverlay');
  if (completeOverlay) completeOverlay.style.display = 'none';

  // Get words and select random subset (max 8 pairs)
  const allWords = [...(topic.vocabulary || [])];
  const maxPairs = Math.min(8, allWords.length);
  const selectedWords = shuffleArray(allWords).slice(0, maxPairs);

  // Initialize game state
  matchingGameState = {
    words: selectedWords,
    selectedWord: null,
    selectedMeaning: null,
    matchedPairs: [],
    totalPairs: selectedWords.length
  };

  // Update score
  updateMatchingGameScore();

  // Render the game board
  renderMatchingGameBoard();
}

function renderMatchingGameBoard() {
  const wordsContainer = document.getElementById('matchingWords');
  const meaningsContainer = document.getElementById('matchingMeanings');
  
  if (!wordsContainer || !meaningsContainer) return;

  // Create word items
  const wordItems = matchingGameState.words.map(word => ({
    id: word.id,
    text: word.word,
    type: 'word'
  }));

  // Create meaning items
  const meaningItems = matchingGameState.words.map(word => ({
    id: word.id,
    text: word.meaningVi || word.meaning,
    type: 'meaning'
  }));

  // Shuffle meanings
  const shuffledMeanings = shuffleArray(meaningItems);

  // Render words
  wordsContainer.innerHTML = wordItems.map(item => `
    <div class="matching-item" data-id="${item.id}" data-type="${item.type}">
      <div class="matching-item-content">${item.text}</div>
    </div>
  `).join('');

  // Render meanings
  meaningsContainer.innerHTML = shuffledMeanings.map(item => `
    <div class="matching-item" data-id="${item.id}" data-type="${item.type}">
      <div class="matching-item-content">${item.text}</div>
    </div>
  `).join('');

  // Add click listeners
  addMatchingGameListeners();
}

function addMatchingGameListeners() {
  const items = document.querySelectorAll('.matching-item');
  
  items.forEach(item => {
    item.addEventListener('click', function() {
      // Skip if already matched
      if (this.classList.contains('matched')) return;

      const id = parseInt(this.dataset.id);
      const type = this.dataset.type;

      if (type === 'word') {
        handleWordSelection(this, id);
      } else if (type === 'meaning') {
        handleMeaningSelection(this, id);
      }
    });
  });
}

function handleWordSelection(element, id) {
  // Deselect previous word
  const prevWord = document.querySelector('.matching-item[data-type="word"].selected');
  if (prevWord) prevWord.classList.remove('selected');

  // Select new word
  element.classList.add('selected');
  matchingGameState.selectedWord = { id, element };

  // Check if we have both selections
  checkMatch();
}

function handleMeaningSelection(element, id) {
  // Deselect previous meaning
  const prevMeaning = document.querySelector('.matching-item[data-type="meaning"].selected');
  if (prevMeaning) prevMeaning.classList.remove('selected');

  // Select new meaning
  element.classList.add('selected');
  matchingGameState.selectedMeaning = { id, element };

  // Check if we have both selections
  checkMatch();
}

function checkMatch() {
  const { selectedWord, selectedMeaning } = matchingGameState;

  // Need both selections
  if (!selectedWord || !selectedMeaning) return;

  // Check if IDs match
  if (selectedWord.id === selectedMeaning.id) {
    // Correct match!
    handleCorrectMatch();
  } else {
    // Wrong match
    handleWrongMatch();
  }
}

function handleCorrectMatch() {
  const { selectedWord, selectedMeaning } = matchingGameState;

  // Add matched class
  selectedWord.element.classList.remove('selected');
  selectedMeaning.element.classList.remove('selected');
  selectedWord.element.classList.add('matched');
  selectedMeaning.element.classList.add('matched');

  // Add to matched pairs
  matchingGameState.matchedPairs.push(selectedWord.id);

  // Update score
  updateMatchingGameScore();

  // Update status
  updateGameStatus('✓ Correct!', 'success');

  // Clear selections
  matchingGameState.selectedWord = null;
  matchingGameState.selectedMeaning = null;

  // Check if game is complete
  if (matchingGameState.matchedPairs.length === matchingGameState.totalPairs) {
    setTimeout(() => {
      showGameComplete();
    }, 500);
  }
}

function handleWrongMatch() {
  const { selectedWord, selectedMeaning } = matchingGameState;

  // Add wrong class for animation
  selectedWord.element.classList.add('wrong');
  selectedMeaning.element.classList.add('wrong');

  // Update status
  updateGameStatus('✗ Try again!', 'error');

  // Remove wrong class and selection after animation
  setTimeout(() => {
    selectedWord.element.classList.remove('wrong', 'selected');
    selectedMeaning.element.classList.remove('wrong', 'selected');

    // Clear selections
    matchingGameState.selectedWord = null;
    matchingGameState.selectedMeaning = null;

    // Reset status
    updateGameStatus('Click a word, then click its matching meaning', 'default');
  }, 600);
}

function updateMatchingGameScore() {
  const scoreEl = document.getElementById('matchingGameScore');
  if (scoreEl) {
    scoreEl.textContent = `${matchingGameState.matchedPairs.length}/${matchingGameState.totalPairs}`;
  }
}

function updateGameStatus(message, type = 'default') {
  const statusEl = document.getElementById('matchingGameStatus');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = 'game-status';
  
  if (type === 'success') {
    statusEl.classList.add('success');
  } else if (type === 'error') {
    statusEl.classList.add('error');
  }
}

function showGameComplete() {
  const completeOverlay = document.getElementById('gameCompleteOverlay');
  if (completeOverlay) {
    completeOverlay.style.display = 'flex';
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getLevelBadge(level) {
  const levelMap = {
    'beginner': { label: 'Beginner', color: '#10b981' },
    'intermediate': { label: 'Intermediate', color: '#f59e0b' },
    'advanced': { label: 'Advanced', color: '#ef4444' },
    'A1': { label: 'A1', color: '#10b981' },
    'A2': { label: 'A2', color: '#10b981' },
    'B1': { label: 'B1', color: '#f59e0b' },
    'B2': { label: 'B2', color: '#f59e0b' },
    'C1': { label: 'C1', color: '#ef4444' },
    'C2': { label: 'C2', color: '#ef4444' }
  };
  
  const levelInfo = levelMap[level] || { label: level || 'Basic', color: '#6366f1' };
  return `<span class="level-badge" style="background: ${levelInfo.color}">${levelInfo.label}</span>`;
}
