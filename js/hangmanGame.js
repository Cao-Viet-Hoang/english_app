// ============================================
// HANGMAN GAME MODULE
// ============================================

// Shuffle array helper function
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

let hangmanGameState = {
  word: null,
  guessedLetters: [],
  wrongGuesses: 0,
  maxWrongGuesses: 6,
  isGameOver: false,
  isWin: false,
  currentWordIndex: 0,
  words: []
};

// ============================================
// HANGMAN GAME INITIALIZATION
// ============================================

function initHangmanGame(topic) {
  console.log('Initializing Hangman Game:', topic);
  
  // Get words from topic vocabulary
  const allWords = [...(topic.vocabulary || [])];
  
  if (!allWords || allWords.length === 0) {
    alert('No words available for this topic');
    switchScreen('gameTopicSelectionScreen');
    return;
  }
  
  // Shuffle words
  const shuffledWords = shuffleArray(allWords);
  
  // Initialize game state
  hangmanGameState.words = shuffledWords;
  hangmanGameState.currentWordIndex = 0;
  hangmanGameState.topic = topic;
  
  // Start first round
  startHangmanRound();
}

// ============================================
// START NEW ROUND
// ============================================

function startHangmanRound() {
  if (hangmanGameState.currentWordIndex >= hangmanGameState.words.length) {
    // All words completed
    endHangmanGame();
    return;
  }
  
  // Get random word
  const randomIndex = Math.floor(Math.random() * hangmanGameState.words.length);
  const wordData = hangmanGameState.words[randomIndex];
  
  // Remove word from array
  hangmanGameState.words.splice(randomIndex, 1);
  
  // Reset game state for new round
  hangmanGameState.word = wordData;
  hangmanGameState.guessedLetters = [];
  hangmanGameState.wrongGuesses = 0;
  hangmanGameState.isGameOver = false;
  hangmanGameState.isWin = false;
  
  // Render game
  renderHangmanGame();
}

// ============================================
// RENDER HANGMAN GAME
// ============================================

function renderHangmanGame() {
  const gameContent = document.getElementById('hangmanGameContent');
  const wordData = hangmanGameState.word;
  const word = (wordData.english || wordData.word || '').toLowerCase();
  const wordDisplay = word.split('').map(letter => {
    if (letter === ' ' || letter === '-') return letter;
    return hangmanGameState.guessedLetters.includes(letter) ? letter : '_';
  }).join(' ');
  
  // Calculate progress
  const totalWords = hangmanGameState.currentWordIndex + hangmanGameState.words.length + 1;
  const currentProgress = hangmanGameState.currentWordIndex + 1;
  const progressPercent = Math.round((currentProgress / totalWords) * 100);
  
  gameContent.innerHTML = `
    <div class="game-progress">
      <div class="progress-info">
        <span>Progress: ${currentProgress} / ${totalWords}</span>
        <span>${progressPercent}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%"></div>
      </div>
    </div>
    
    <div class="hangman-container">
      <!-- Hangman Drawing -->
      <div class="hangman-drawing">
        <svg viewBox="0 0 200 250" class="hangman-svg">
          <!-- Base -->
          <line x1="10" y1="230" x2="150" y2="230" stroke="var(--text-primary)" stroke-width="4"/>
          <!-- Pole -->
          <line x1="50" y1="230" x2="50" y2="20" stroke="var(--text-primary)" stroke-width="4"/>
          <!-- Top bar -->
          <line x1="50" y1="20" x2="130" y2="20" stroke="var(--text-primary)" stroke-width="4"/>
          <!-- Rope -->
          <line x1="130" y1="20" x2="130" y2="50" stroke="var(--text-primary)" stroke-width="2"/>
          
          <!-- Head -->
          <circle cx="130" cy="70" r="20" stroke="var(--text-primary)" stroke-width="3" fill="none" 
                  class="hangman-part ${hangmanGameState.wrongGuesses >= 1 ? 'visible' : ''}"/>
          
          <!-- Body -->
          <line x1="130" y1="90" x2="130" y2="150" stroke="var(--text-primary)" stroke-width="3"
                class="hangman-part ${hangmanGameState.wrongGuesses >= 2 ? 'visible' : ''}"/>
          
          <!-- Left arm -->
          <line x1="130" y1="110" x2="100" y2="130" stroke="var(--text-primary)" stroke-width="3"
                class="hangman-part ${hangmanGameState.wrongGuesses >= 3 ? 'visible' : ''}"/>
          
          <!-- Right arm -->
          <line x1="130" y1="110" x2="160" y2="130" stroke="var(--text-primary)" stroke-width="3"
                class="hangman-part ${hangmanGameState.wrongGuesses >= 4 ? 'visible' : ''}"/>
          
          <!-- Left leg -->
          <line x1="130" y1="150" x2="100" y2="180" stroke="var(--text-primary)" stroke-width="3"
                class="hangman-part ${hangmanGameState.wrongGuesses >= 5 ? 'visible' : ''}"/>
          
          <!-- Right leg -->
          <line x1="130" y1="150" x2="160" y2="180" stroke="var(--text-primary)" stroke-width="3"
                class="hangman-part ${hangmanGameState.wrongGuesses >= 6 ? 'visible' : ''}"/>
        </svg>
        
        <div class="wrong-guesses-info">
          <span class="wrong-count">${hangmanGameState.wrongGuesses} / ${hangmanGameState.maxWrongGuesses}</span>
          <span class="wrong-label">Wrong Guesses</span>
        </div>
      </div>
      
      <!-- Word Display -->
      <div class="hangman-word-section">
        <div class="hangman-hint">
          <div class="hint-label">Vietnamese meaning:</div>
          <div class="hint-text">${wordData.vietnameseDescription || wordData.vietnameseMeaning || wordData.meaningVi || wordData.meaning || 'No meaning available'}</div>
        </div>
        
        <div class="hangman-word-display">
          ${wordDisplay}
        </div>
        
        <div class="hangman-word-info">
          <span class="word-type">${wordData.type || 'word'}</span>
          <span class="word-length">${word.replace(/[\s-]/g, '').length} letters</span>
        </div>
      </div>
    </div>
    
    <!-- Keyboard -->
    <div class="hangman-keyboard">
      ${renderHangmanKeyboard()}
    </div>
    
    <!-- Game Info -->
    <div class="hangman-game-info">
      <div class="info-card">
        <i class="fas fa-keyboard"></i>
        <span>Click letters or use keyboard</span>
      </div>
      <div class="info-card">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Max ${hangmanGameState.maxWrongGuesses} wrong guesses</span>
      </div>
    </div>
  `;
  
  // Add keyboard listeners
  setupHangmanKeyboardListeners();
}

// ============================================
// RENDER KEYBOARD
// ============================================

function renderHangmanKeyboard() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  let html = '';
  
  const wordData = hangmanGameState.word;
  const word = (wordData.english || wordData.word || '').toLowerCase();
  
  alphabet.forEach((letter, index) => {
    const isGuessed = hangmanGameState.guessedLetters.includes(letter);
    const isCorrect = word.includes(letter);
    
    let className = 'keyboard-key';
    if (isGuessed) {
      className += isCorrect ? ' correct' : ' wrong';
    }
    if (hangmanGameState.isGameOver) {
      className += ' disabled';
    }
    
    html += `<button class="${className}" data-letter="${letter}" ${isGuessed || hangmanGameState.isGameOver ? 'disabled' : ''}>${letter.toUpperCase()}</button>`;
    
    // Add line break after every 7 letters for better layout
    if ((index + 1) % 7 === 0 && index < alphabet.length - 1) {
      html += '<div class="keyboard-break"></div>';
    }
  });
  
  return html;
}

// ============================================
// SETUP KEYBOARD LISTENERS
// ============================================

function setupHangmanKeyboardListeners() {
  // Click listeners
  const keys = document.querySelectorAll('.keyboard-key');
  keys.forEach(key => {
    key.addEventListener('click', function() {
      const letter = this.dataset.letter;
      handleHangmanGuess(letter);
    });
  });
  
  // Keyboard listeners
  document.removeEventListener('keydown', handleHangmanKeyPress);
  document.addEventListener('keydown', handleHangmanKeyPress);
}

function handleHangmanKeyPress(event) {
  // Only handle if hangman game is active and not game over
  if (!document.getElementById('hangmanGameScreen').classList.contains('active') || hangmanGameState.isGameOver) {
    return;
  }
  
  const key = event.key.toLowerCase();
  
  // Check if it's a letter
  if (key.length === 1 && key >= 'a' && key <= 'z') {
    // Check if not already guessed
    if (!hangmanGameState.guessedLetters.includes(key)) {
      handleHangmanGuess(key);
    }
  }
}

// ============================================
// HANDLE GUESS
// ============================================

function handleHangmanGuess(letter) {
  if (hangmanGameState.isGameOver) return;
  if (hangmanGameState.guessedLetters.includes(letter)) return;
  
  // Add to guessed letters
  hangmanGameState.guessedLetters.push(letter);
  
  const wordData = hangmanGameState.word;
  const word = (wordData.english || wordData.word || '').toLowerCase();
  
  // Check if letter is in word
  if (!word.includes(letter)) {
    hangmanGameState.wrongGuesses++;
    
    // Check if game over (lose)
    if (hangmanGameState.wrongGuesses >= hangmanGameState.maxWrongGuesses) {
      hangmanGameState.isGameOver = true;
      hangmanGameState.isWin = false;
      setTimeout(() => showHangmanRoundResult(), 300);
    }
  } else {
    // Check if word is complete
    const isComplete = word.split('').every(char => {
      if (char === ' ' || char === '-') return true;
      return hangmanGameState.guessedLetters.includes(char);
    });
    
    if (isComplete) {
      hangmanGameState.isGameOver = true;
      hangmanGameState.isWin = true;
      setTimeout(() => showHangmanRoundResult(), 300);
    }
  }
  
  // Re-render game
  renderHangmanGame();
}

// ============================================
// SHOW ROUND RESULT
// ============================================

function showHangmanRoundResult() {
  const wordData = hangmanGameState.word;
  const isWin = hangmanGameState.isWin;
  
  const modalOverlay = document.getElementById('hangmanResultModalOverlay');
  const modalContent = document.getElementById('hangmanResultContent');
  
  if (!modalOverlay || !modalContent) {
    console.error('Modal elements not found');
    return;
  }
  
  // Build modal content
  const hasMoreWords = hangmanGameState.words.length > 0;
  
  modalContent.innerHTML = `
    <div class="result-content ${isWin ? 'win' : 'lose'}">
      <div class="result-icon">
        ${isWin ? '🎉' : '💔'}
      </div>
      <h3 class="result-title">${isWin ? 'Correct!' : 'Game Over!'}</h3>
      <div class="result-word-reveal">
        <div class="revealed-word">${wordData.english || wordData.word}</div>
        <div class="word-ipa">${wordData.ipa || ''}</div>
        <div class="word-meaning">${wordData.vietnameseDescription || wordData.vietnameseMeaning || wordData.meaningVi || wordData.meaning}</div>
      </div>
      <div class="result-stats">
        <div class="stat-item">
          <span class="stat-value">${hangmanGameState.guessedLetters.length}</span>
          <span class="stat-label">Guesses</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${hangmanGameState.wrongGuesses}</span>
          <span class="stat-label">Wrong</span>
        </div>
      </div>
      <div class="result-actions">
        ${hasMoreWords ? 
          '<button class="btn btn-primary" id="nextHangmanWordBtn"><i class="fas fa-arrow-right"></i> Next Word</button>' : 
          '<button class="btn btn-primary" id="finishHangmanBtn"><i class="fas fa-check"></i> Finish</button>'
        }
        <button class="btn btn-secondary" id="quitHangmanFromResultBtn"><i class="fas fa-times"></i> Quit</button>
      </div>
    </div>
  `;
  
  // Show modal
  modalOverlay.classList.add('active');
  document.getElementById('hangmanResultModal').classList.add('active');
  
  // Setup button listeners
  const nextBtn = document.getElementById('nextHangmanWordBtn');
  const finishBtn = document.getElementById('finishHangmanBtn');
  const quitBtn = document.getElementById('quitHangmanFromResultBtn');
  
  if (nextBtn) {
    nextBtn.onclick = () => {
      closeHangmanResultModal();
      hangmanGameState.currentWordIndex++;
      startHangmanRound();
    };
  }
  
  if (finishBtn) {
    finishBtn.onclick = () => {
      closeHangmanResultModal();
      endHangmanGame();
    };
  }
  
  if (quitBtn) {
    quitBtn.onclick = () => {
      closeHangmanResultModal();
      backToGameTopicSelection();
    };
  }
  
  // Close on overlay click
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) {
      if (hasMoreWords) {
        closeHangmanResultModal();
        hangmanGameState.currentWordIndex++;
        startHangmanRound();
      } else {
        closeHangmanResultModal();
        endHangmanGame();
      }
    }
  };
}

function closeHangmanResultModal() {
  const modalOverlay = document.getElementById('hangmanResultModalOverlay');
  const modal = document.getElementById('hangmanResultModal');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
  }
  if (modal) {
    modal.classList.remove('active');
  }
}

// ============================================
// END GAME
// ============================================

function endHangmanGame() {
  // Remove keyboard listener
  document.removeEventListener('keydown', handleHangmanKeyPress);
  
  // Show final results
  const totalWords = hangmanGameState.currentWordIndex;
  alert(`🎮 Game Complete!\n\nTotal words completed: ${totalWords}\n\nGreat job!`);
  
  // Return to topic selection
  backToGameTopicSelection();
}

// ============================================
// BACK TO TOPIC SELECTION
// ============================================

function backToGameTopicSelection() {
  // Remove keyboard listener
  document.removeEventListener('keydown', handleHangmanKeyPress);
  
  switchScreen('gameTopicSelectionScreen');
  updateBottomNav('gamesScreen');
}
