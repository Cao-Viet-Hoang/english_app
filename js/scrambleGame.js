// ============================================
// SCRAMBLE GAME MODULE
// ============================================

// Shuffle array helper function
function shuffleArrayScramble(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

let scrambleGameState = {
  word: null,
  scrambledLetters: [],
  userAnswer: [],
  currentWordIndex: 0,
  words: [],
  score: 0,
  topic: null,
  isDragging: false,
  draggedElement: null,
  draggedIndex: null
};

// ============================================
// SCRAMBLE GAME INITIALIZATION
// ============================================

function initScrambleGame(topic) {
  console.log('Initializing Scramble Game:', topic);
  
  // Get words from topic vocabulary
  const allWords = [...(topic.vocabulary || [])];
  
  if (!allWords || allWords.length === 0) {
    alert('No words available for this topic');
    switchScreen('gameTopicSelectionScreen');
    return;
  }
  
  // Shuffle words
  const shuffledWords = shuffleArrayScramble(allWords);
  
  // Initialize game state
  scrambleGameState.words = shuffledWords;
  scrambleGameState.currentWordIndex = 0;
  scrambleGameState.score = 0;
  scrambleGameState.topic = topic;
  
  // Start first round
  startScrambleRound();
}

// ============================================
// START SCRAMBLE ROUND
// ============================================

function startScrambleRound() {
  if (scrambleGameState.currentWordIndex >= scrambleGameState.words.length) {
    // Game completed
    showScrambleGameResults();
    return;
  }
  
  const word = scrambleGameState.words[scrambleGameState.currentWordIndex];
  scrambleGameState.word = word;
  scrambleGameState.userAnswer = [];
  
  // Get the English word and convert to lowercase
  const englishWord = word.english.toLowerCase().trim();
  
  // Create array of letters
  const letters = englishWord.split('');
  
  // Shuffle letters (make sure it's different from original)
  let scrambled = shuffleArrayScramble(letters);
  let attempts = 0;
  while (scrambled.join('') === englishWord && attempts < 10) {
    scrambled = shuffleArrayScramble(letters);
    attempts++;
  }
  
  scrambleGameState.scrambledLetters = scrambled;
  
  // Render game UI
  renderScrambleGame();
}

// ============================================
// RENDER SCRAMBLE GAME
// ============================================

function renderScrambleGame() {
  const container = document.getElementById('scrambleGameContent');
  if (!container) return;
  
  const word = scrambleGameState.word;
  const currentIndex = scrambleGameState.currentWordIndex;
  const totalWords = scrambleGameState.words.length;
  const progress = Math.round(((currentIndex + 1) / totalWords) * 100);
  
  container.innerHTML = `
    <!-- Game Header Info -->
    <div class="scramble-game-header">
      <div class="scramble-progress-container">
        <div class="quiz-progress-info">
          <span class="progress-text">Word ${currentIndex + 1} of ${totalWords}</span>
          <span class="progress-percentage">${progress}%</span>
        </div>
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
      <div class="scramble-score">
        <i class="fas fa-star"></i>
        <span>${scrambleGameState.score}/${totalWords}</span>
      </div>
    </div>
    
    <!-- Word Hint Section -->
    <div class="scramble-hint-section">
      <div class="scramble-hint-content">
        <div class="scramble-word-type">${word.type}</div>
        <div class="scramble-hint-text">${word.vietnameseDescription}</div>
      </div>
    </div>
    
    <!-- User Answer Area -->
    <div class="scramble-answer-section">
      <div class="scramble-section-title">Your Answer:</div>
      <div class="scramble-answer-boxes" id="scrambleAnswerBoxes">
        ${renderAnswerBoxes()}
      </div>
    </div>
    
    <!-- Scrambled Letters Area -->
    <div class="scramble-letters-section">
      <div class="scramble-section-title">Letters:</div>
      <div class="scramble-letters-boxes" id="scrambleLetterBoxes">
        ${renderLetterBoxes()}
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="scramble-actions">
      <button class="btn-icon" id="scrambleClearBtn" title="Clear">
        <i class="fas fa-undo"></i>
      </button>
      <button class="btn-icon" id="scrambleHintBtn" title="Hint">
        <i class="fas fa-lightbulb"></i>
      </button>
      <button class="btn-primary btn-check" id="scrambleCheckBtn" disabled>
        <i class="fas fa-check"></i> Check
      </button>
    </div>
    
    <!-- Feedback Section -->
    <div class="scramble-feedback" id="scrambleFeedback" style="display: none;">
      <!-- Feedback will be shown here -->
    </div>
  `;
  
  // Setup event listeners
  setupScrambleEventListeners();
}

// ============================================
// RENDER ANSWER BOXES
// ============================================

function renderAnswerBoxes() {
  const wordLength = scrambleGameState.word.english.length;
  let html = '';
  
  for (let i = 0; i < wordLength; i++) {
    const letter = scrambleGameState.userAnswer[i] || '';
    const filledClass = letter ? 'filled' : '';
    html += `
      <div class="scramble-box answer-box ${filledClass}" 
           data-answer-index="${i}"
           draggable="false">
        ${letter}
      </div>
    `;
  }
  
  return html;
}

// ============================================
// RENDER LETTER BOXES
// ============================================

function renderLetterBoxes() {
  let html = '';
  
  scrambleGameState.scrambledLetters.forEach((letter, index) => {
    const isUsed = scrambleGameState.userAnswer.includes(letter) && 
                   scrambleGameState.userAnswer.indexOf(letter) === scrambleGameState.userAnswer.lastIndexOf(letter);
    const usedClass = isUsed ? 'used' : '';
    
    html += `
      <div class="scramble-box letter-box ${usedClass}" 
           data-letter="${letter}"
           data-letter-index="${index}"
           draggable="true">
        ${letter.toUpperCase()}
      </div>
    `;
  });
  
  return html;
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function setupScrambleEventListeners() {
  // Letter boxes click
  const letterBoxes = document.querySelectorAll('.letter-box');
  letterBoxes.forEach(box => {
    box.addEventListener('click', function() {
      if (!this.classList.contains('used')) {
        addLetterToAnswer(this.dataset.letter, parseInt(this.dataset.letterIndex));
      }
    });
    
    // Drag events
    box.addEventListener('dragstart', handleDragStart);
    box.addEventListener('dragend', handleDragEnd);
  });
  
  // Answer boxes click (to remove letter)
  const answerBoxes = document.querySelectorAll('.answer-box');
  answerBoxes.forEach(box => {
    box.addEventListener('click', function() {
      const index = parseInt(this.dataset.answerIndex);
      removeLetterFromAnswer(index);
    });
    
    // Drop events
    box.addEventListener('dragover', handleDragOver);
    box.addEventListener('drop', handleDrop);
    box.addEventListener('dragenter', handleDragEnter);
    box.addEventListener('dragleave', handleDragLeave);
  });
  
  // Clear button
  const clearBtn = document.getElementById('scrambleClearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAnswer);
  }
  
  // Hint button
  const hintBtn = document.getElementById('scrambleHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', showScrambleHint);
  }
  
  // Check button
  const checkBtn = document.getElementById('scrambleCheckBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', checkScrambleAnswer);
  }
}

// ============================================
// DRAG AND DROP HANDLERS
// ============================================

function handleDragStart(e) {
  if (this.classList.contains('used')) {
    e.preventDefault();
    return;
  }
  
  scrambleGameState.isDragging = true;
  scrambleGameState.draggedElement = this;
  scrambleGameState.draggedLetter = this.dataset.letter;
  scrambleGameState.draggedIndex = parseInt(this.dataset.letterIndex);
  
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  scrambleGameState.isDragging = false;
  scrambleGameState.draggedElement = null;
  
  // Remove all drag-over classes
  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  this.classList.add('drag-over');
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  this.classList.remove('drag-over');
  
  const targetIndex = parseInt(this.dataset.answerIndex);
  const letter = scrambleGameState.draggedLetter;
  const letterIndex = scrambleGameState.draggedIndex;
  
  if (letter && targetIndex !== undefined) {
    // Add letter to specific position
    addLetterToAnswerAtPosition(letter, letterIndex, targetIndex);
  }
  
  return false;
}

// ============================================
// GAME LOGIC
// ============================================

function addLetterToAnswer(letter, letterIndex) {
  // Find first empty position
  const emptyIndex = scrambleGameState.userAnswer.indexOf('');
  
  if (emptyIndex !== -1) {
    scrambleGameState.userAnswer[emptyIndex] = letter;
  } else if (scrambleGameState.userAnswer.length < scrambleGameState.word.english.length) {
    scrambleGameState.userAnswer.push(letter);
  }
  
  updateScrambleDisplay();
}

function addLetterToAnswerAtPosition(letter, letterIndex, position) {
  // If position is already filled, don't add
  if (scrambleGameState.userAnswer[position]) {
    return;
  }
  
  scrambleGameState.userAnswer[position] = letter;
  updateScrambleDisplay();
}

function removeLetterFromAnswer(index) {
  if (scrambleGameState.userAnswer[index]) {
    scrambleGameState.userAnswer[index] = '';
    updateScrambleDisplay();
  }
}

function clearAnswer() {
  scrambleGameState.userAnswer = [];
  updateScrambleDisplay();
}

function updateScrambleDisplay() {
  // Update answer boxes
  const answerBoxes = document.querySelectorAll('.answer-box');
  answerBoxes.forEach((box, index) => {
    const letter = scrambleGameState.userAnswer[index] || '';
    box.textContent = letter.toUpperCase();
    box.classList.toggle('filled', !!letter);
  });
  
  // Update letter boxes (mark used letters)
  const letterBoxes = document.querySelectorAll('.letter-box');
  letterBoxes.forEach(box => {
    const letter = box.dataset.letter;
    const letterIndex = parseInt(box.dataset.letterIndex);
    
    // Check if this specific letter at this index is used
    const isUsed = scrambleGameState.userAnswer.includes(letter);
    box.classList.toggle('used', isUsed);
  });
  
  // Enable/disable check button
  const checkBtn = document.getElementById('scrambleCheckBtn');
  if (checkBtn) {
    const isComplete = scrambleGameState.userAnswer.length === scrambleGameState.word.english.length &&
                      scrambleGameState.userAnswer.every(l => l !== '');
    checkBtn.disabled = !isComplete;
  }
}

// ============================================
// CHECK ANSWER
// ============================================

function checkScrambleAnswer() {
  const userWord = scrambleGameState.userAnswer.join('').toLowerCase();
  const correctWord = scrambleGameState.word.english.toLowerCase();
  
  const feedbackEl = document.getElementById('scrambleFeedback');
  const checkBtn = document.getElementById('scrambleCheckBtn');
  
  if (!feedbackEl) return;
  
  const isCorrect = userWord === correctWord;
  
  if (isCorrect) {
    scrambleGameState.score++;
    
    feedbackEl.innerHTML = `
      <div class="feedback-content correct">
        <div class="feedback-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="feedback-text">
          <h3>Correct! 🎉</h3>
          <p><strong>${scrambleGameState.word.english}</strong> - ${scrambleGameState.word.vietnameseMeaning}</p>
          <p class="feedback-ipa">/${scrambleGameState.word.ipa}/</p>
        </div>
      </div>
      <button class="btn-primary" id="scrambleNextBtn">
        <i class="fas fa-arrow-right"></i> Next
      </button>
    `;
  } else {
    feedbackEl.innerHTML = `
      <div class="feedback-content incorrect">
        <div class="feedback-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="feedback-text">
          <h3>Not Quite Right</h3>
          <p>Your answer: <strong>${userWord}</strong></p>
          <p>Correct answer: <strong>${correctWord}</strong></p>
          <p>${scrambleGameState.word.vietnameseMeaning}</p>
        </div>
      </div>
      <button class="btn-primary" id="scrambleNextBtn">
        <i class="fas fa-arrow-right"></i> Next
      </button>
    `;
  }
  
  feedbackEl.style.display = 'block';
  
  // Disable buttons
  if (checkBtn) checkBtn.disabled = true;
  document.querySelectorAll('.letter-box').forEach(box => {
    box.style.pointerEvents = 'none';
    box.draggable = false;
  });
  document.querySelectorAll('.answer-box').forEach(box => {
    box.style.pointerEvents = 'none';
  });
  
  // Setup next button
  const nextBtn = document.getElementById('scrambleNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', nextScrambleWord);
  }
  
  // Play audio feedback
  playAudio(scrambleGameState.word.english);
}

// ============================================
// SHOW HINT
// ============================================

function showScrambleHint() {
  const correctWord = scrambleGameState.word.english.toLowerCase();
  const currentAnswer = scrambleGameState.userAnswer.join('');
  
  // Find first empty or wrong position
  for (let i = 0; i < correctWord.length; i++) {
    if (!scrambleGameState.userAnswer[i] || scrambleGameState.userAnswer[i] !== correctWord[i]) {
      // Find the correct letter in scrambled letters
      const correctLetter = correctWord[i];
      const letterIndex = scrambleGameState.scrambledLetters.findIndex((l, idx) => {
        return l === correctLetter && !scrambleGameState.userAnswer.includes(l);
      });
      
      if (letterIndex !== -1) {
        scrambleGameState.userAnswer[i] = correctLetter;
        updateScrambleDisplay();
        
        // Show hint notification
        showNotification(`Hint: Letter ${i + 1} is "${correctLetter.toUpperCase()}"`, 'info');
        break;
      }
    }
  }
}

// ============================================
// NEXT WORD
// ============================================

function nextScrambleWord() {
  scrambleGameState.currentWordIndex++;
  startScrambleRound();
}

// ============================================
// SHOW GAME RESULTS
// ============================================

function showScrambleGameResults() {
  const container = document.getElementById('scrambleGameContent');
  if (!container) return;
  
  const totalWords = scrambleGameState.words.length;
  const score = scrambleGameState.score;
  const percentage = Math.round((score / totalWords) * 100);
  
  let messageTitle = '';
  let messageText = '';
  let messageIcon = '';
  
  if (percentage === 100) {
    messageTitle = 'Perfect! 🏆';
    messageText = 'You got all words correct!';
    messageIcon = 'fas fa-trophy';
  } else if (percentage >= 80) {
    messageTitle = 'Excellent! 🌟';
    messageText = 'Great job on scrambling!';
    messageIcon = 'fas fa-star';
  } else if (percentage >= 60) {
    messageTitle = 'Good Work! 👍';
    messageText = 'Keep practicing!';
    messageIcon = 'fas fa-thumbs-up';
  } else {
    messageTitle = 'Keep Trying! 💪';
    messageText = 'Practice makes perfect!';
    messageIcon = 'fas fa-heartbeat';
  }
  
  container.innerHTML = `
    <div class="game-results">
      <div class="results-icon">
        <i class="${messageIcon}"></i>
      </div>
      <h2 class="results-title">${messageTitle}</h2>
      <p class="results-message">${messageText}</p>
      
      <div class="results-stats">
        <div class="result-stat">
          <div class="stat-value">${score}/${totalWords}</div>
          <div class="stat-label">Correct Words</div>
        </div>
        <div class="result-stat">
          <div class="stat-value">${percentage}%</div>
          <div class="stat-label">Accuracy</div>
        </div>
      </div>
      
      <div class="results-actions">
        <button class="btn-secondary" id="backToTopicSelectionFromScrambleBtn">
          <i class="fas fa-arrow-left"></i> Back to Topics
        </button>
        <button class="btn-primary" id="playScrambleAgainBtn">
          <i class="fas fa-redo"></i> Play Again
        </button>
      </div>
    </div>
  `;
  
  // Setup button listeners
  const backBtn = document.getElementById('backToTopicSelectionFromScrambleBtn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      switchScreen('gameTopicSelectionScreen');
    });
  }
  
  const playAgainBtn = document.getElementById('playScrambleAgainBtn');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', function() {
      initScrambleGame(scrambleGameState.topic);
    });
  }
}

// ============================================
// START SCRAMBLE GAME (Called from games.js)
// ============================================

function startScrambleGame(topic) {
  console.log('Starting Scramble Game with topic:', topic);
  
  // Switch to scramble game screen
  switchScreen('scrambleGameScreen');
  
  // Initialize game
  initScrambleGame(topic);
}
