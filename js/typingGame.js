// ============================================
// TYPING GAME MODULE
// ============================================

let typingGameState = {
  words: [],
  allWords: [], // Store all words for re-shuffling
  currentWord: null,
  score: 0,
  timeLeft: 30,
  selectedTime: 30, // Selected time duration
  timer: null,
  isPlaying: false,
  totalWords: 0
};

let currentTypingTopic = null;
let currentTypingSource = 'shared';

// ============================================
// GAME INITIALIZATION
// ============================================

function startTypingGame(topic, source = 'shared') {
  console.log('Starting Typing Game Setup:', topic.name);
  
  // Store topic for later use
  currentTypingTopic = topic;
  currentTypingSource = source;
  
  // Get words from topic - using 'vocabulary' array from schema
  let words = [];
  if (topic.vocabulary && Array.isArray(topic.vocabulary)) {
    // Extract English words from vocabulary array
    words = topic.vocabulary.map(w => w.english);
  }
  
  // Check minimum words required
  if (words.length < 5) {
    alert('This topic needs at least 5 words to play the typing game!');
    return;
  }
  
  // Show settings screen
  showTypingGameSettings(topic);
}

// ============================================
// TYPING GAME SETTINGS
// ============================================

function showTypingGameSettings(topic) {
  // Update topic name in settings
  const topicNameEl = document.getElementById('typingSettingsTopicName');
  if (topicNameEl) {
    topicNameEl.textContent = `Topic: ${topic.nameVi || topic.name}`;
  }
  
  // Setup time option buttons
  const timeOptions = document.querySelectorAll('.time-option-card');
  timeOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove active class from all
      timeOptions.forEach(opt => opt.classList.remove('active'));
      // Add active class to clicked
      this.classList.add('active');
    });
  });
  
  // Setup start button
  const startBtn = document.getElementById('startTypingGameBtn');
  if (startBtn) {
    startBtn.onclick = function() {
      // Get selected time
      const selectedOption = document.querySelector('.time-option-card.active');
      const selectedTime = selectedOption ? parseInt(selectedOption.dataset.time) : 30;
      
      // Start the actual game
      startTypingGameWithTime(selectedTime);
    };
  }
  
  // Setup back button
  const backBtn = document.getElementById('backToTopicFromTypingSettingsBtn');
  if (backBtn) {
    backBtn.onclick = function() {
      switchScreen('gameTopicSelectionScreen');
    };
  }
  
  // Show settings screen
  switchScreen('typingGameSettingsScreen');
}

function startTypingGameWithTime(selectedTime) {
  const topic = currentTypingTopic;
  
  // Get words from topic - using 'vocabulary' array from schema
  let words = [];
  if (topic.vocabulary && Array.isArray(topic.vocabulary)) {
    // Extract English words from vocabulary array
    words = topic.vocabulary.map(w => w.english);
  }
  
  // Shuffle words
  words = shuffleArray(words);
  
  // Initialize game state
  typingGameState = {
    words: [...words], // Current shuffled queue
    allWords: words, // Keep original list for re-shuffling
    currentWord: null,
    score: 0,
    timeLeft: selectedTime,
    selectedTime: selectedTime,
    timer: null,
    isPlaying: true,
    totalWords: words.length
  };
  
  // Setup UI
  setupTypingGameUI();
  
  // Show first word
  showNextWord();
  
  // Start timer
  startTypingTimer();
  
  // Show typing game screen
  switchScreen('typingGameScreen');
}

// ============================================
// GAME UI SETUP
// ============================================

function setupTypingGameUI() {
  const typingInput = document.getElementById('typingInput');
  const quitTypingBtn = document.getElementById('quitTypingBtn');
  
  // Reset input
  if (typingInput) {
    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();
    
    // Remove old event listener and add new one
    const newInput = typingInput.cloneNode(true);
    typingInput.parentNode.replaceChild(newInput, typingInput);
    
    // Add input event listener
    newInput.addEventListener('input', handleTypingInput);
    
    // Add keypress event listener for Enter key
    newInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleTypingInput.call(this);
      }
    });
  }
  
  // Quit button
  if (quitTypingBtn) {
    quitTypingBtn.onclick = quitTypingGame;
  }
  
  // Update initial UI
  updateTypingGameUI();
}

function updateTypingGameUI() {
  const timerEl = document.getElementById('typingTimer');
  const scoreEl = document.getElementById('typingScore');
  const wordDisplayEl = document.getElementById('typingWordDisplay');
  
  if (timerEl) {
    timerEl.textContent = typingGameState.timeLeft;
  }
  
  if (scoreEl) {
    scoreEl.textContent = typingGameState.score;
  }
  
  if (wordDisplayEl && typingGameState.currentWord) {
    wordDisplayEl.textContent = typingGameState.currentWord;
  }
}

// ============================================
// GAME LOGIC
// ============================================

function showNextWord() {
  if (typingGameState.words.length === 0) {
    // Re-shuffle if we've gone through all words
    if (typingGameState.allWords.length > 0) {
      typingGameState.words = shuffleArray([...typingGameState.allWords]);
    }
  }
  
  if (typingGameState.words.length > 0) {
    typingGameState.currentWord = typingGameState.words.shift();
    updateTypingGameUI();
    
    // Clear and focus input
    const typingInput = document.getElementById('typingInput');
    if (typingInput) {
      typingInput.value = '';
      typingInput.focus();
    }
  }
}

function handleTypingInput() {
  if (!typingGameState.isPlaying) return;
  
  const input = this.value.trim().toLowerCase();
  const currentWord = typingGameState.currentWord?.toLowerCase();
  
  if (input === currentWord) {
    // Correct answer
    typingGameState.score++;
    
    // Visual feedback
    const wordDisplay = document.getElementById('typingWordDisplay');
    if (wordDisplay) {
      wordDisplay.classList.add('correct-flash');
      setTimeout(() => {
        wordDisplay.classList.remove('correct-flash');
      }, 300);
    }
    
    // Show next word
    showNextWord();
  }
}

function startTypingTimer() {
  // Clear any existing timer
  if (typingGameState.timer) {
    clearInterval(typingGameState.timer);
  }
  
  // Start countdown
  typingGameState.timer = setInterval(() => {
    typingGameState.timeLeft--;
    updateTypingGameUI();
    
    // Add warning class when time is running out
    const timerEl = document.getElementById('typingTimer');
    if (timerEl) {
      if (typingGameState.timeLeft <= 10) {
        timerEl.classList.add('warning');
      } else {
        timerEl.classList.remove('warning');
      }
    }
    
    // Time's up
    if (typingGameState.timeLeft <= 0) {
      endTypingGame();
    }
  }, 1000);
}

function endTypingGame() {
  typingGameState.isPlaying = false;
  
  // Clear timer
  if (typingGameState.timer) {
    clearInterval(typingGameState.timer);
    typingGameState.timer = null;
  }
  
  // Disable input
  const typingInput = document.getElementById('typingInput');
  if (typingInput) {
    typingInput.disabled = true;
  }
  
  // Show results
  showTypingGameResults();
}

function quitTypingGame() {
  // Clear timer
  if (typingGameState.timer) {
    clearInterval(typingGameState.timer);
    typingGameState.timer = null;
  }
  
  typingGameState.isPlaying = false;
  
  // Go back to games screen
  switchScreen('gamesScreen');
  updateBottomNav('gamesScreen');
}

// ============================================
// GAME RESULTS
// ============================================

function showTypingGameResults() {
  const modal = document.getElementById('gameResultModal');
  const modalTitle = document.getElementById('gameResultTitle');
  const modalScore = document.getElementById('gameResultScore');
  const modalMessage = document.getElementById('gameResultMessage');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const backToGamesFromResultBtn = document.getElementById('backToGamesFromResultBtn');
  
  if (!modal) return;
  
  // Calculate performance
  const score = typingGameState.score;
  const timeUsed = typingGameState.selectedTime;
  let message = '';
  let emoji = '';
  
  // Dynamic thresholds based on time
  const excellent = Math.floor(timeUsed * 1.33); // ~40 for 30s
  const good = Math.floor(timeUsed * 1.0);      // ~30 for 30s
  const ok = Math.floor(timeUsed * 0.67);       // ~20 for 30s
  const fair = Math.floor(timeUsed * 0.33);     // ~10 for 30s
  
  if (score >= excellent) {
    emoji = '🏆';
    message = 'Lightning Fast! You are a typing champion!';
  } else if (score >= good) {
    emoji = '🌟';
    message = 'Excellent work! Your typing speed is impressive!';
  } else if (score >= ok) {
    emoji = '👍';
    message = 'Good job! Keep practicing to improve!';
  } else if (score >= fair) {
    emoji = '💪';
    message = 'Not bad! With more practice, you will get faster!';
  } else {
    emoji = '📚';
    message = 'Keep trying! Practice makes perfect!';
  }
  
  // Update modal content
  if (modalTitle) {
    modalTitle.innerHTML = `${emoji} Time's Up!`;
  }
  
  if (modalScore) {
    modalScore.innerHTML = `
      <div class="result-score-big">${score}</div>
      <div class="result-label">Words Typed Correctly</div>
      <div class="result-stats">
        <div class="stat-item">
          <i class="fas fa-clock"></i>
          <span>${timeUsed} seconds</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-tachometer-alt"></i>
          <span>${(score * 60 / timeUsed).toFixed(1)} WPM</span>
        </div>
      </div>
    `;
  }
  
  if (modalMessage) {
    modalMessage.textContent = message;
  }
  
  // Setup buttons
  if (playAgainBtn) {
    playAgainBtn.onclick = function() {
      modal.classList.remove('active');
      // Go back to settings screen to choose time again
      showTypingGameSettings(currentTypingTopic);
    };
  }
  
  if (backToGamesFromResultBtn) {
    backToGamesFromResultBtn.onclick = function() {
      modal.classList.remove('active');
      switchScreen('gamesScreen');
      updateBottomNav('gamesScreen');
    };
  }
  
  // Show modal
  modal.classList.add('active');
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

// Make functions globally available
window.startTypingGame = startTypingGame;
