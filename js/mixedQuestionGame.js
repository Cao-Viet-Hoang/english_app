// ============================================
// MIXED QUESTION GAME MODULE
// ============================================
// This module handles the mixed question game logic and UI

let mixedQuestionGameState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  totalQuestions: 0,
  isAnswered: false,
  userAnswers: [], // Track all answers for review
  topic: null
};

// ============================================
// START MIXED QUESTION GAME
// ============================================

function startMixedQuestionGame(topic) {
  console.log('Starting Mixed Question Game:', topic);
  
  // Get all words from topic
  const allWords = [...(topic.vocabulary || [])];
  
  if (!allWords || allWords.length === 0) {
    alert('No words available for this topic');
    switchScreen('gameTopicSelectionScreen');
    return;
  }

  // Generate all questions
  const questions = generateMixedQuestions(allWords);
  
  if (!questions || questions.length === 0) {
    alert('Could not generate questions for this topic');
    switchScreen('gameTopicSelectionScreen');
    return;
  }

  // Initialize game state
  mixedQuestionGameState = {
    questions: questions,
    currentIndex: 0,
    score: 0,
    totalQuestions: questions.length,
    isAnswered: false,
    userAnswers: [],
    topic: topic
  };

  // Switch to game screen
  switchScreen('mixedQuestionGameScreen');
  updateBottomNav('gamesScreen');

  // Update header
  updateMixedQuestionHeader(topic);

  // Hide complete overlay
  const completeOverlay = document.getElementById('mixedQuestionCompleteOverlay');
  if (completeOverlay) completeOverlay.style.display = 'none';

  // Render first question
  renderMixedQuestion();
}

// ============================================
// UPDATE HEADER
// ============================================

function updateMixedQuestionHeader(topic) {
  const titleEl = document.getElementById('mixedQuestionGameTitle');
  if (titleEl) {
    const topicIcon = topic.icon || '📚';
    const topicColor = topic.iconColor || topic.color || '#4A90E2';
    titleEl.innerHTML = `
      <span class="game-topic-icon" style="background: ${topicColor}">${topicIcon}</span>
      <span>${topic.nameVi || topic.name}</span>
    `;
  }

  updateMixedQuestionProgress();
}

// ============================================
// UPDATE PROGRESS
// ============================================

function updateMixedQuestionProgress() {
  const progressEl = document.getElementById('mixedQuestionProgress');
  const scoreEl = document.getElementById('mixedQuestionScore');
  const progressPercentEl = document.getElementById('mixedQuestionProgressPercent');
  const progressFillEl = document.getElementById('mixedQuestionProgressFill');
  
  if (progressEl) {
    const current = mixedQuestionGameState.currentIndex + 1;
    const total = mixedQuestionGameState.totalQuestions;
    progressEl.textContent = `Question ${current} of ${total}`;
  }
  
  if (scoreEl) {
    scoreEl.textContent = `${mixedQuestionGameState.score}/${mixedQuestionGameState.totalQuestions}`;
  }
  
  if (progressPercentEl && progressFillEl) {
    const current = mixedQuestionGameState.currentIndex + 1;
    const total = mixedQuestionGameState.totalQuestions;
    const percentage = Math.round((current / total) * 100);
    progressPercentEl.textContent = `${percentage}%`;
    progressFillEl.style.width = `${percentage}%`;
  }
}

// ============================================
// RENDER QUESTION
// ============================================

function renderMixedQuestion() {
  if (mixedQuestionGameState.currentIndex >= mixedQuestionGameState.totalQuestions) {
    showMixedQuestionComplete();
    return;
  }

  const question = mixedQuestionGameState.questions[mixedQuestionGameState.currentIndex];
  const container = document.getElementById('mixedQuestionContainer');
  
  if (!container) return;

  // Reset answered state
  mixedQuestionGameState.isAnswered = false;

  // Update progress
  updateMixedQuestionProgress();

  // Render based on question type
  if (question.type === QuestionType.EXAMPLE_FILL || 
      question.type === QuestionType.COLLOCATION_FILL) {
    renderFillQuestion(question, container);
  } else {
    renderMCQQuestion(question, container);
  }

  // Update button text
  const nextBtn = document.getElementById('mixedQuestionNextBtn');
  if (nextBtn) {
    nextBtn.textContent = 'Submit';
    nextBtn.disabled = false;
  }
}

// ============================================
// RENDER MCQ QUESTION
// ============================================

function renderMCQQuestion(question, container) {
  let contextHTML = '';
  if (question.context) {
    contextHTML = `<div class="question-context">${question.context}</div>`;
  }

  // Only show word label for non-example and non-collocation questions
  const shouldShowWord = question.type !== QuestionType.EXAMPLE_MCQ && 
                         question.type !== QuestionType.COLLOCATION_MCQ;
  
  let wordLabelHTML = '';
  if (shouldShowWord) {
    wordLabelHTML = `<div class="question-word-label">Word: <strong>${question.word}</strong></div>`;
  }

  const optionsHTML = question.options.map((option, index) => `
    <button class="mixed-question-option" data-index="${index}">
      ${option.text}
    </button>
  `).join('');

  container.innerHTML = `
    <div class="mixed-question-card">
      <div class="question-type-badge">${getQuestionTypeName(question.type)}</div>
      ${wordLabelHTML}
      ${contextHTML}
      <div class="question-text">${question.question}</div>
      <div class="mixed-question-options">
        ${optionsHTML}
      </div>
      <div class="mixed-question-feedback" id="mixedQuestionFeedback"></div>
    </div>
  `;

  // Add event listeners to options
  const optionButtons = container.querySelectorAll('.mixed-question-option');
  optionButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => handleMCQAnswer(index, question));
  });
}

// ============================================
// RENDER FILL QUESTION
// ============================================

function renderFillQuestion(question, container) {
  let contextHTML = '';
  if (question.context) {
    contextHTML = `<div class="question-context">${question.context}</div>`;
  }

  // Only show word label for non-example and non-collocation questions
  const shouldShowWord = question.type !== QuestionType.EXAMPLE_FILL && 
                         question.type !== QuestionType.COLLOCATION_FILL;
  
  let wordLabelHTML = '';
  if (shouldShowWord) {
    wordLabelHTML = `<div class="question-word-label">Word: <strong>${question.word}</strong></div>`;
  }

  container.innerHTML = `
    <div class="mixed-question-card">
      <div class="question-type-badge">${getQuestionTypeName(question.type)}</div>
      ${wordLabelHTML}
      ${contextHTML}
      <div class="question-text">${question.question}</div>
      <div class="fill-answer-container">
        <input 
          type="text" 
          class="fill-answer-input" 
          id="fillAnswerInput" 
          placeholder="Type your answer..."
          autocomplete="off"
        />
        <button class="fill-submit-btn" id="fillSubmitBtn">Submit</button>
      </div>
      <div class="mixed-question-feedback" id="mixedQuestionFeedback"></div>
    </div>
  `;

  // Add event listeners
  const input = document.getElementById('fillAnswerInput');
  const submitBtn = document.getElementById('fillSubmitBtn');
  
  if (input && submitBtn) {
    // Submit on Enter key
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleFillAnswer(question);
      }
    });

    // Submit on button click
    submitBtn.addEventListener('click', () => handleFillAnswer(question));

    // Focus input
    input.focus();
  }
}

// ============================================
// HANDLE MCQ ANSWER
// ============================================

function handleMCQAnswer(selectedIndex, question) {
  if (mixedQuestionGameState.isAnswered) return;

  mixedQuestionGameState.isAnswered = true;

  const selectedOption = question.options[selectedIndex];
  const isCorrect = selectedOption.isCorrect;

  // Update score
  if (isCorrect) {
    mixedQuestionGameState.score++;
  }

  // Record answer
  mixedQuestionGameState.userAnswers.push({
    question: question,
    userAnswer: selectedOption.text,
    isCorrect: isCorrect
  });

  // Visual feedback
  const optionButtons = document.querySelectorAll('.mixed-question-option');
  optionButtons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === selectedIndex) {
      btn.classList.add(isCorrect ? 'correct' : 'incorrect');
    }
    if (question.options[index].isCorrect) {
      btn.classList.add('correct');
    }
  });

  // Show feedback
  showFeedback(isCorrect, question);

  // Update progress
  updateMixedQuestionProgress();

  // Change button to Next
  const nextBtn = document.getElementById('mixedQuestionNextBtn');
  if (nextBtn) {
    nextBtn.textContent = mixedQuestionGameState.currentIndex < mixedQuestionGameState.totalQuestions - 1 
      ? 'Next Question' 
      : 'Finish';
  }
}

// ============================================
// HANDLE FILL ANSWER
// ============================================

function handleFillAnswer(question) {
  if (mixedQuestionGameState.isAnswered) return;

  const input = document.getElementById('fillAnswerInput');
  if (!input) return;

  const userAnswer = input.value.trim();
  
  if (!userAnswer) {
    alert('Please enter your answer');
    return;
  }

  mixedQuestionGameState.isAnswered = true;

  // Check answer
  const isCorrect = checkFillAnswer(userAnswer, question.correctAnswer, question.acceptedAnswers);

  // Update score
  if (isCorrect) {
    mixedQuestionGameState.score++;
  }

  // Record answer
  mixedQuestionGameState.userAnswers.push({
    question: question,
    userAnswer: userAnswer,
    isCorrect: isCorrect
  });

  // Visual feedback
  input.disabled = true;
  input.classList.add(isCorrect ? 'correct' : 'incorrect');

  const submitBtn = document.getElementById('fillSubmitBtn');
  if (submitBtn) submitBtn.disabled = true;

  // Show feedback
  showFeedback(isCorrect, question);

  // Update progress
  updateMixedQuestionProgress();

  // Change button to Next
  const nextBtn = document.getElementById('mixedQuestionNextBtn');
  if (nextBtn) {
    nextBtn.textContent = mixedQuestionGameState.currentIndex < mixedQuestionGameState.totalQuestions - 1 
      ? 'Next Question' 
      : 'Finish';
  }
}

// ============================================
// SHOW FEEDBACK
// ============================================

function showFeedback(isCorrect, question) {
  const feedbackEl = document.getElementById('mixedQuestionFeedback');
  if (!feedbackEl) return;

  const icon = isCorrect ? '✓' : '✗';
  const statusClass = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
  const statusText = isCorrect ? 'Correct!' : 'Incorrect';

  let explanationHTML = '';
  if (question.explanation) {
    explanationHTML = `<div class="feedback-explanation">${question.explanation}</div>`;
  }

  let translationHTML = '';
  if (question.translationVi) {
    translationHTML = `<div class="feedback-translation">${question.translationVi}</div>`;
  }

  feedbackEl.innerHTML = `
    <div class="feedback ${statusClass}">
      <div class="feedback-header">
        <span class="feedback-icon">${icon}</span>
        <span class="feedback-status">${statusText}</span>
      </div>
      ${explanationHTML}
      ${translationHTML}
    </div>
  `;

  feedbackEl.style.display = 'block';
}

// ============================================
// HANDLE NEXT QUESTION
// ============================================

function handleMixedQuestionNext() {
  if (!mixedQuestionGameState.isAnswered) {
    alert('Please answer the question first');
    return;
  }

  mixedQuestionGameState.currentIndex++;
  renderMixedQuestion();
}

// ============================================
// SHOW COMPLETE OVERLAY
// ============================================

function showMixedQuestionComplete() {
  const overlay = document.getElementById('mixedQuestionCompleteOverlay');
  if (!overlay) return;

  const score = mixedQuestionGameState.score;
  const total = mixedQuestionGameState.totalQuestions;
  const percentage = Math.round((score / total) * 100);

  // Calculate star rating
  let stars = 0;
  if (percentage >= 90) stars = 3;
  else if (percentage >= 70) stars = 2;
  else if (percentage >= 50) stars = 1;

  const starsHTML = '⭐'.repeat(stars);

  // Update overlay content
  const scoreEl = overlay.querySelector('.complete-score');
  const messageEl = overlay.querySelector('.complete-message');
  const starsEl = overlay.querySelector('.complete-stars');

  if (scoreEl) scoreEl.textContent = `${score} / ${total}`;
  if (messageEl) {
    let message = '';
    if (percentage >= 90) message = 'Excellent! Outstanding performance! 🎉';
    else if (percentage >= 70) message = 'Great job! Keep it up! 👏';
    else if (percentage >= 50) message = 'Good effort! Practice more! 💪';
    else message = 'Keep practicing! You can do better! 📚';
    messageEl.textContent = message;
  }
  if (starsEl) starsEl.textContent = starsHTML;

  overlay.style.display = 'flex';
}

// ============================================
// GET QUESTION TYPE NAME
// ============================================

function getQuestionTypeName(type) {
  const names = {
    [QuestionType.MEANING]: 'Meaning',
    [QuestionType.EXAMPLE_FILL]: 'Fill in the Blank',
    [QuestionType.EXAMPLE_MCQ]: 'Example',
    [QuestionType.COLLOCATION_MCQ]: 'Collocation',
    [QuestionType.COLLOCATION_FILL]: 'Collocation',
    [QuestionType.COMMON_MISTAKE]: 'Common Mistake',
    [QuestionType.SYNONYM]: 'Synonym',
    [QuestionType.ODD_ONE_OUT]: 'Odd One Out',
    [QuestionType.NOUN_COUNTABILITY]: 'Noun Grammar',
    [QuestionType.NOUN_PLURAL]: 'Plural Form',
    [QuestionType.VERB_FORM_TENSE]: 'Verb Tense',
    [QuestionType.VERB_FORM_MCQ]: 'Verb Forms'
  };
  
  return names[type] || 'Question';
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function setupMixedQuestionGameListeners() {
  // Next button
  const nextBtn = document.getElementById('mixedQuestionNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', handleMixedQuestionNext);
  }

  // Back button
  const backBtn = document.getElementById('backToGameTopicSelectionFromMixed');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      switchScreen('gameTopicSelectionScreen');
      updateBottomNav('gamesScreen');
    });
  }

  // Play again button
  const playAgainBtn = document.getElementById('mixedQuestionPlayAgainBtn');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      if (mixedQuestionGameState.topic) {
        startMixedQuestionGame(mixedQuestionGameState.topic);
      }
    });
  }

  // Back to games button
  const backToGamesBtn = document.getElementById('mixedQuestionBackToGamesBtn');
  if (backToGamesBtn) {
    backToGamesBtn.addEventListener('click', () => {
      switchScreen('gamesScreen');
      updateBottomNav('gamesScreen');
    });
  }
}

// Initialize listeners when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupMixedQuestionGameListeners);
} else {
  setupMixedQuestionGameListeners();
}
