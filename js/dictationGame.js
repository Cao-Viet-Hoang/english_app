// ============================================
// LISTENING DICTATION GAME
// ============================================

let dictationGameState = {
  words: [],
  currentIndex: 0,
  score: 0,
  isAnswered: false,
  currentWord: null
};

let voicesLoaded = false;
let selectedVoice = null;

// ============================================
// INITIALIZE SPEECH SYNTHESIS
// ============================================

function initializeSpeechSynthesis() {
  // Load voices
  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length > 0) {
    // Prefer US English voices
    selectedVoice = voices.find(voice => 
      voice.lang === 'en-US' && voice.name.includes('Google')
    ) || voices.find(voice => 
      voice.lang.startsWith('en-')
    ) || voices[0];
    
    voicesLoaded = true;
  }
}

// Initialize on load and on voiceschanged event
if (window.speechSynthesis) {
  initializeSpeechSynthesis();
  
  window.speechSynthesis.onvoiceschanged = () => {
    initializeSpeechSynthesis();
  };
}

// ============================================
// START DICTATION GAME
// ============================================

function startDictationGame(topic) {
  // Switch to dictation game screen
  switchScreen('dictationGameScreen');
  updateBottomNav('gamesScreen');

  // Update header with icon
  const titleEl = document.getElementById('dictationGameTitle');
  const subtitleEl = document.getElementById('dictationGameSubtitle');
  if (titleEl) {
    const topicIcon = topic.icon || '📚';
    const topicColor = topic.iconColor || topic.color || '#4A90E2';
    titleEl.innerHTML = `
      <span class="game-topic-icon" style="background: ${topicColor}">${topicIcon}</span>
      <span>${topic.nameVi || topic.name}</span>
    `;
  }
  if (subtitleEl) subtitleEl.textContent = 'Listen and type the word';

  // Hide complete overlay
  const completeOverlay = document.getElementById('dictationCompleteOverlay');
  if (completeOverlay) completeOverlay.style.display = 'none';

  // Get all words from topic and shuffle
  const allWords = [...(topic.vocabulary || [])];
  const shuffledWords = shuffleArray(allWords);

  // Initialize game state
  dictationGameState = {
    words: shuffledWords,
    currentIndex: 0,
    score: 0,
    isAnswered: false,
    currentWord: null
  };

  // Display first word
  displayDictationWord();
  
  // Initialize speech synthesis when game starts
  if (window.speechSynthesis) {
    initializeSpeechSynthesis();
  }
}

// ============================================
// DISPLAY WORD FOR DICTATION
// ============================================

function displayDictationWord() {
  const { words, currentIndex } = dictationGameState;
  
  if (currentIndex >= words.length) {
    showDictationComplete();
    return;
  }

  const word = words[currentIndex];
  dictationGameState.currentWord = word;
  dictationGameState.isAnswered = false;

  // Update progress
  updateDictationProgress();

  // Hide word display area (no hints or instructions)
  const wordDisplayEl = document.getElementById('dictationWordDisplay');
  if (wordDisplayEl) {
    wordDisplayEl.style.display = 'none';
  }

  // Clear and enable input
  const inputEl = document.getElementById('dictationInput');
  if (inputEl) {
    inputEl.value = '';
    inputEl.disabled = false;
    inputEl.classList.remove('correct', 'incorrect');
    inputEl.focus();
  }

  // Reset feedback
  const feedbackEl = document.getElementById('dictationFeedback');
  if (feedbackEl) {
    feedbackEl.style.display = 'none';
    feedbackEl.className = 'dictation-feedback';
  }

  // Enable/reset buttons
  const checkBtn = document.getElementById('checkDictationBtn');
  const nextBtn = document.getElementById('nextDictationBtn');
  const playAudioBtn = document.getElementById('playDictationAudioBtn');
  
  if (checkBtn) {
    checkBtn.disabled = false;
    checkBtn.style.display = 'inline-flex';
  }
  if (nextBtn) {
    nextBtn.style.display = 'none';
  }
  if (playAudioBtn) {
    playAudioBtn.disabled = false;
  }

  // Auto-play audio on first display
  setTimeout(() => playDictationAudio(), 300);
}

// ============================================
// PLAY AUDIO USING SPEECH SYNTHESIS API
// ============================================

function playDictationAudio() {
  const word = dictationGameState.currentWord;
  if (!word) {
    alert('No word available. Please restart the game.');
    return;
  }

  // Check if speech synthesis is available
  if (!window.speechSynthesis) {
    alert('Speech synthesis is not supported in your browser. Please use Chrome, Edge, or Safari.');
    return;
  }

  // Initialize voices if not loaded yet
  if (!voicesLoaded) {
    initializeSpeechSynthesis();
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Small delay to ensure cancel completes
  setTimeout(() => {
    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(word.english);
    
    // Configure speech settings
    utterance.lang = 'en-US';
    utterance.rate = 0.75; // Slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Use selected voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Visual feedback - button animation
    const playBtn = document.getElementById('playDictationAudioBtn');
    
    utterance.onstart = () => {
      if (playBtn) {
        playBtn.classList.add('playing');
        playBtn.disabled = true;
      }
    };
    
    utterance.onend = () => {
      if (playBtn) {
        playBtn.classList.remove('playing');
        playBtn.disabled = false;
      }
    };
    
    utterance.onerror = (event) => {
      if (playBtn) {
        playBtn.classList.remove('playing');
        playBtn.disabled = false;
      }
      
      // Retry once on error
      if (event.error === 'canceled') {
        setTimeout(() => window.speechSynthesis.speak(utterance), 100);
      }
    };

    // Speak the word
    window.speechSynthesis.speak(utterance);
    
    // Fallback: Check if it's actually speaking after a delay
    setTimeout(() => {
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
        window.speechSynthesis.speak(utterance);
      }
    }, 100);
  }, 100);
}

// ============================================
// CHECK USER'S ANSWER
// ============================================

function checkDictationAnswer() {
  if (dictationGameState.isAnswered) return;

  const inputEl = document.getElementById('dictationInput');
  const feedbackEl = document.getElementById('dictationFeedback');
  const checkBtn = document.getElementById('checkDictationBtn');
  const nextBtn = document.getElementById('nextDictationBtn');
  
  if (!inputEl || !feedbackEl) return;

  const userAnswer = inputEl.value.trim();
  const correctAnswer = dictationGameState.currentWord.english;

  // Check answer (case-insensitive)
  const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

  dictationGameState.isAnswered = true;

  if (isCorrect) {
    // Correct answer
    dictationGameState.score++;
    inputEl.classList.add('correct');
    feedbackEl.className = 'dictation-feedback correct';
    feedbackEl.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>Correct! Well done! 🎉</span>
      <div class="correct-word-info">
        <div class="word-pronunciation">"${correctAnswer}"</div>
        <div class="word-meaning">${dictationGameState.currentWord.vietnamese || dictationGameState.currentWord.meaning || ''}</div>
      </div>
    `;
  } else {
    // Incorrect answer
    inputEl.classList.add('incorrect');
    feedbackEl.className = 'dictation-feedback incorrect';
    feedbackEl.innerHTML = `
      <i class="fas fa-times-circle"></i>
      <span>Not quite right</span>
      <div class="incorrect-answer-info">
        <div class="answer-row">
          <span class="label">Your answer:</span>
          <span class="user-answer">${userAnswer || '(empty)'}</span>
        </div>
        <div class="answer-row">
          <span class="label">Correct answer:</span>
          <span class="correct-answer">${correctAnswer}</span>
        </div>
        <div class="word-meaning">${dictationGameState.currentWord.vietnamese || dictationGameState.currentWord.meaning || ''}</div>
      </div>
    `;
  }

  feedbackEl.style.display = 'block';
  inputEl.disabled = true;

  // Update buttons
  if (checkBtn) checkBtn.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'inline-flex';

  // Update score display
  updateDictationProgress();
}

// ============================================
// MOVE TO NEXT WORD
// ============================================

function nextDictationWord() {
  dictationGameState.currentIndex++;
  displayDictationWord();
}

// ============================================
// UPDATE PROGRESS
// ============================================

function updateDictationProgress() {
  const { currentIndex, words, score } = dictationGameState;
  
  // Update score
  const scoreEl = document.getElementById('dictationGameScore');
  if (scoreEl) {
    scoreEl.textContent = `${score}/${words.length}`;
  }

  // Update progress bar
  const statusEl = document.getElementById('dictationGameStatus');
  const percentEl = document.getElementById('dictationProgressPercent');
  const fillEl = document.getElementById('dictationProgressFill');
  
  if (statusEl) {
    statusEl.textContent = `Word ${currentIndex + 1} of ${words.length}`;
  }
  
  if (percentEl && fillEl) {
    const percentage = Math.round(((currentIndex + 1) / words.length) * 100);
    percentEl.textContent = `${percentage}%`;
    fillEl.style.width = `${percentage}%`;
  }
}

// ============================================
// SHOW GAME COMPLETE
// ============================================

function showDictationComplete() {
  const { score, words } = dictationGameState;
  const percentage = Math.round((score / words.length) * 100);

  const overlay = document.getElementById('dictationCompleteOverlay');
  const finalScoreEl = document.getElementById('dictationFinalScore');
  const totalQuestionsEl = document.getElementById('dictationTotalQuestions');
  const percentageEl = document.getElementById('dictationPercentage');
  const messageEl = document.getElementById('dictationCompleteMessage');

  if (finalScoreEl) finalScoreEl.textContent = score;
  if (totalQuestionsEl) totalQuestionsEl.textContent = words.length;
  if (percentageEl) percentageEl.textContent = `${percentage}%`;

  // Set encouraging message based on score
  if (messageEl) {
    if (percentage === 100) {
      messageEl.textContent = 'Perfect score! Outstanding! 🌟';
    } else if (percentage >= 80) {
      messageEl.textContent = 'Excellent work! Keep it up! 🎉';
    } else if (percentage >= 60) {
      messageEl.textContent = 'Good job! Keep practicing! 👍';
    } else {
      messageEl.textContent = 'Keep practicing, you can do better! 💪';
    }
  }

  if (overlay) {
    overlay.style.display = 'flex';
  }
}

// ============================================
// REPLAY GAME
// ============================================

function replayDictationGame() {
  const currentTopic = currentGameTopic;
  if (currentTopic) {
    startDictationGame(currentTopic);
  }
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function setupDictationGameListeners() {
  // Back button
  const backBtn = document.getElementById('backToTopicSelectionFromDictationBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      switchScreen('gameTopicSelectionScreen');
      updateBottomNav('gamesScreen');
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
    });
  }

  // Play audio button
  const playAudioBtn = document.getElementById('playDictationAudioBtn');
  if (playAudioBtn) {
    playAudioBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      playDictationAudio();
    });
  }

  // Check answer button
  const checkBtn = document.getElementById('checkDictationBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', checkDictationAnswer);
  }

  // Next word button
  const nextBtn = document.getElementById('nextDictationBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', nextDictationWord);
  }

  // Input field - Enter key to check
  const inputEl = document.getElementById('dictationInput');
  if (inputEl) {
    inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !dictationGameState.isAnswered) {
        checkDictationAnswer();
      }
    });
  }

  // Play again from complete overlay
  const playAgainBtn = document.getElementById('playDictationAgainBtn');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', replayDictationGame);
  }

  // Back to games from complete overlay
  const backToGamesBtn = document.getElementById('backToGamesFromDictationBtn');
  if (backToGamesBtn) {
    backToGamesBtn.addEventListener('click', () => {
      switchScreen('gamesScreen');
      updateBottomNav('gamesScreen');
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
    });
  }
}

// Initialize listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupDictationGameListeners);
} else {
  setupDictationGameListeners();
}
