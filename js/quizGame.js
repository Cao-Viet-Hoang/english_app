// ============================================
// MULTIPLE CHOICE QUIZ GAME
// ============================================

let quizGameState = {
  words: [],
  currentIndex: 0,
  score: 0,
  isAnswered: false,
  correctAnswerId: null
};

// ============================================
// START QUIZ GAME
// ============================================

function startQuizGame(topic) {
  // Switch to quiz game screen
  switchScreen('quizGameScreen');
  updateBottomNav('gamesScreen');

  // Update header with icon
  const titleEl = document.getElementById('quizGameTitle');
  const subtitleEl = document.getElementById('quizGameSubtitle');
  if (titleEl) {
    const topicIcon = topic.icon || '📚';
    const topicColor = topic.iconColor || topic.color || '#4A90E2';
    titleEl.innerHTML = `
      <span class="game-topic-icon" style="background: ${topicColor}">${topicIcon}</span>
      <span>${topic.nameVi || topic.name}</span>
    `;
  }
  if (subtitleEl) subtitleEl.textContent = 'Choose the correct meaning';

  // Hide complete overlay
  const completeOverlay = document.getElementById('quizCompleteOverlay');
  if (completeOverlay) completeOverlay.style.display = 'none';

  // Get all words from topic and shuffle
  const allWords = [...(topic.vocabulary || [])];
  const shuffledWords = shuffleArray(allWords);

  // Initialize game state
  quizGameState = {
    words: shuffledWords,
    currentIndex: 0,
    score: 0,
    isAnswered: false,
    correctAnswerId: null
  };

  // Update score display
  updateQuizScore();

  // Render first question
  renderQuizQuestion();
}

// ============================================
// RENDER QUIZ QUESTION
// ============================================

function renderQuizQuestion() {
  if (quizGameState.currentIndex >= quizGameState.words.length) {
    // Game complete
    showQuizComplete();
    return;
  }

  const currentWord = quizGameState.words[quizGameState.currentIndex];
  const questionEl = document.getElementById('quizQuestion');
  const answersEl = document.getElementById('quizAnswers');
  const statusEl = document.getElementById('quizGameStatus');
  
  if (!questionEl || !answersEl) return;

  // Reset answered state
  quizGameState.isAnswered = false;

  // Display the word (question)
  questionEl.innerHTML = `
    <div class="quiz-word-card">
      <div class="quiz-word-label">Word</div>
      <div class="quiz-word-text">${currentWord.word || currentWord.english}</div>
    </div>
  `;

  // Generate answers
  const correctAnswer = currentWord.vietnameseDescription || currentWord.meaningVi || currentWord.meaning || currentWord.vietnameseMeaning;
  const wrongAnswers = generateWrongAnswers(currentWord, quizGameState.words);
  
  // Combine and shuffle answers
  const allAnswers = [
    { id: 0, text: correctAnswer, isCorrect: true },
    { id: 1, text: wrongAnswers[0], isCorrect: false },
    { id: 2, text: wrongAnswers[1], isCorrect: false },
    { id: 3, text: wrongAnswers[2], isCorrect: false }
  ];
  
  const shuffledAnswers = shuffleArray(allAnswers);
  quizGameState.correctAnswerId = shuffledAnswers.find(a => a.isCorrect).id;

  // Render answer options
  answersEl.innerHTML = shuffledAnswers.map(answer => `
    <button class="quiz-answer-btn" data-answer-id="${answer.id}" data-is-correct="${answer.isCorrect}">
      <span class="answer-text">${answer.text}</span>
      <span class="answer-icon"></span>
    </button>
  `).join('');

  // Update status and progress bar
  if (statusEl) {
    statusEl.textContent = `Question ${quizGameState.currentIndex + 1} of ${quizGameState.words.length}`;
  }
  
  // Update progress percentage and bar
  const progressPercent = document.getElementById('quizProgressPercent');
  const progressFill = document.getElementById('quizProgressFill');
  const percentage = Math.round(((quizGameState.currentIndex + 1) / quizGameState.words.length) * 100);
  
  if (progressPercent) {
    progressPercent.textContent = `${percentage}%`;
  }
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }

  // Add click listeners
  addQuizAnswerListeners();
}

// ============================================
// GENERATE WRONG ANSWERS
// ============================================

function generateWrongAnswers(currentWord, allWords) {
  const correctAnswer = currentWord.vietnameseDescription || currentWord.meaningVi || currentWord.meaning || currentWord.vietnameseMeaning;
  
  // Get other words' meanings as wrong answers
  const otherWords = allWords.filter(w => {
    const meaning = w.vietnameseDescription || w.meaningVi || w.meaning || w.vietnameseMeaning;
    return meaning !== correctAnswer;
  });
  
  // Shuffle and take 3 wrong answers
  const shuffled = shuffleArray(otherWords);
  const wrongAnswers = [];
  
  for (let i = 0; i < Math.min(3, shuffled.length); i++) {
    wrongAnswers.push(shuffled[i].vietnameseDescription || shuffled[i].meaningVi || shuffled[i].meaning || shuffled[i].vietnameseMeaning);
  }
  
  // If we don't have enough wrong answers (less than 3 words in topic), generate some generic ones
  while (wrongAnswers.length < 3) {
    wrongAnswers.push(`Nghĩa khác ${wrongAnswers.length + 1}`);
  }
  
  return wrongAnswers;
}

// ============================================
// ANSWER LISTENERS
// ============================================

function addQuizAnswerListeners() {
  const answerBtns = document.querySelectorAll('.quiz-answer-btn');
  
  answerBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Prevent multiple clicks on same question
      if (quizGameState.isAnswered) return;
      
      const isCorrect = this.dataset.isCorrect === 'true';
      
      // Mark as answered
      quizGameState.isAnswered = true;
      
      // Show correct/incorrect state
      if (isCorrect) {
        this.classList.add('correct');
        quizGameState.score++;
        updateQuizScore();
        
        // Play success sound (if audio is available)
        if (typeof playCorrectSound === 'function') {
          playCorrectSound();
        }
      } else {
        this.classList.add('incorrect');
        
        // Show the correct answer
        answerBtns.forEach(otherBtn => {
          if (otherBtn.dataset.isCorrect === 'true') {
            otherBtn.classList.add('correct-highlight');
          }
        });
        
        // Play error sound (if audio is available)
        if (typeof playIncorrectSound === 'function') {
          playIncorrectSound();
        }
      }
      
      // Disable all buttons
      answerBtns.forEach(b => b.style.pointerEvents = 'none');
      
      // Move to next question after a delay
      setTimeout(() => {
        quizGameState.currentIndex++;
        renderQuizQuestion();
      }, 1500);
    });
  });
}

// ============================================
// UPDATE SCORE
// ============================================

function updateQuizScore() {
  const scoreEl = document.getElementById('quizGameScore');
  if (scoreEl) {
    scoreEl.textContent = `${quizGameState.score}/${quizGameState.words.length}`;
  }
}

// ============================================
// SHOW QUIZ COMPLETE
// ============================================

function showQuizComplete() {
  const completeOverlay = document.getElementById('quizCompleteOverlay');
  const scoreEl = document.getElementById('quizFinalScore');
  const totalEl = document.getElementById('quizTotalQuestions');
  const percentageEl = document.getElementById('quizPercentage');
  const messageEl = document.getElementById('quizCompleteMessage');
  
  if (!completeOverlay) return;
  
  const percentage = Math.round((quizGameState.score / quizGameState.words.length) * 100);
  
  if (scoreEl) scoreEl.textContent = quizGameState.score;
  if (totalEl) totalEl.textContent = quizGameState.words.length;
  if (percentageEl) percentageEl.textContent = `${percentage}%`;
  
  // Set message based on score
  if (messageEl) {
    if (percentage === 100) {
      messageEl.textContent = 'Perfect! You got all answers correct! 🎉';
    } else if (percentage >= 80) {
      messageEl.textContent = 'Excellent! Keep up the great work! 👏';
    } else if (percentage >= 60) {
      messageEl.textContent = 'Good job! Practice more to improve! 💪';
    } else {
      messageEl.textContent = 'Keep practicing! You\'ll get better! 📚';
    }
  }
  
  completeOverlay.style.display = 'flex';
}

// ============================================
// SETUP QUIZ GAME LISTENERS
// ============================================

function setupQuizGameListeners() {
  // Back to topic selection button
  const backBtn = document.getElementById('backToTopicSelectionFromQuizBtn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      switchScreen('gameTopicSelectionScreen');
      updateBottomNav('gamesScreen');
    });
  }

  // Play again button
  const playAgainBtn = document.getElementById('playQuizAgainBtn');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', function() {
      if (currentGameTopic) {
        startQuizGame(currentGameTopic);
      }
    });
  }

  // Back to games button from complete overlay
  const backToGamesBtn = document.getElementById('backToGamesFromQuizCompleteBtn');
  if (backToGamesBtn) {
    backToGamesBtn.addEventListener('click', function() {
      switchScreen('gamesScreen');
      updateBottomNav('gamesScreen');
    });
  }
}

// ============================================
// SOUND EFFECTS (OPTIONAL)
// ============================================

function playCorrectSound() {
  // Simple beep using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    // Audio not supported or blocked
  }
}

function playIncorrectSound() {
  // Simple buzz using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    // Audio not supported or blocked
  }
}
