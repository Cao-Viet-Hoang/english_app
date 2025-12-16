// ============================================
// MODAL MANAGEMENT
// ============================================

let modalListenersInitialized = false;

function setupModalListeners() {
  // Prevent duplicate listener setup
  if (modalListenersInitialized) {
    return;
  }
  
  setupCreateTopicModal();
  setupAddWordModal();
  
  // Modal overlay close on click
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.removeEventListener('click', closeAllModals);
    modalOverlay.addEventListener('click', closeAllModals);
  }
  
  modalListenersInitialized = true;
}

function closeAllModals() {
  document.getElementById('modalOverlay')?.classList.remove('active');
  document.getElementById('createTopicModal')?.classList.remove('active');
  document.getElementById('addWordModal')?.classList.remove('active');
}

// ============================================
// CREATE TOPIC MODAL
// ============================================

function setupCreateTopicModal() {
  const closeBtn = document.getElementById('closeCreateTopicBtn');
  const cancelBtn = document.getElementById('cancelCreateTopicBtn');
  const form = document.getElementById('createTopicForm');

  if (closeBtn) {
    closeBtn.removeEventListener('click', closeCreateTopicModal);
    closeBtn.addEventListener('click', closeCreateTopicModal);
  }

  if (cancelBtn) {
    cancelBtn.removeEventListener('click', closeCreateTopicModal);
    cancelBtn.addEventListener('click', closeCreateTopicModal);
  }

  if (form) {
    form.removeEventListener('submit', handleCreateTopic);
    form.addEventListener('submit', handleCreateTopic);
  }
}

function openCreateTopicModal() {
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('createTopicModal').classList.add('active');
  document.getElementById('topicName')?.focus();
}

function closeCreateTopicModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('createTopicModal').classList.remove('active');
  document.getElementById('createTopicForm')?.reset();
}

async function handleCreateTopic(e) {
  e.preventDefault();

  const topicData = {
    name: document.getElementById('topicName').value,
    nameVi: document.getElementById('topicNameVi').value,
    icon: document.getElementById('newTopicIcon').value,
    iconColor: document.getElementById('topicIconColor').value,
    level: document.getElementById('topicLevel').value,
    category: document.getElementById('topicCategory').value
  };

  try {
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    // Create topic
    await createNewTopic(topicData);

    // Close modal
    closeCreateTopicModal();

    // Re-render My Words screen
    await renderMyWords('all');

    // Show success message
    showNotification(`Topic "${topicData.name}" created successfully!`, 'success');

    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

  } catch (error) {
    console.error('Error creating topic:', error);
    showNotification(error.message || 'Failed to create topic', 'error');
    
    // Reset button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Create Topic';
  }
}

// ============================================
// ADD WORD TO TOPIC MODAL
// ============================================

let currentAddWordStep = 1;
let currentEnglishWord = '';

// Handler functions for step navigation (defined outside to allow proper removal)
function handleBackToStep1() { showAddWordStep(1); }
function handleContinueToStep3() { showAddWordStep(3); }
function handleBackToStep2() { showAddWordStep(2); }

function setupAddWordModal() {
  // Close button
  const closeBtn = document.getElementById('closeAddWordBtn');
  if (closeBtn) {
    closeBtn.removeEventListener('click', closeAddWordModal);
    closeBtn.addEventListener('click', closeAddWordModal);
  }

  // Step 1: Enter English word
  const enterWordForm = document.getElementById('enterWordForm');
  const cancelStep1Btn = document.getElementById('cancelAddWordStep1Btn');
  
  if (enterWordForm) {
    enterWordForm.removeEventListener('submit', handleEnterWordSubmit);
    enterWordForm.addEventListener('submit', handleEnterWordSubmit);
  }
  if (cancelStep1Btn) {
    cancelStep1Btn.removeEventListener('click', closeAddWordModal);
    cancelStep1Btn.addEventListener('click', closeAddWordModal);
  }

  // Step 2: AI Prompt
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const backToStep1Btn = document.getElementById('backToStep1Btn');
  const continueToStep3Btn = document.getElementById('continueToStep3Btn');
  
  if (copyPromptBtn) {
    copyPromptBtn.removeEventListener('click', handleCopyPrompt);
    copyPromptBtn.addEventListener('click', handleCopyPrompt);
  }
  if (backToStep1Btn) {
    backToStep1Btn.removeEventListener('click', handleBackToStep1);
    backToStep1Btn.addEventListener('click', handleBackToStep1);
  }
  if (continueToStep3Btn) {
    continueToStep3Btn.removeEventListener('click', handleContinueToStep3);
    continueToStep3Btn.addEventListener('click', handleContinueToStep3);
  }

  // Step 3: Paste JSON
  const pasteWordDataForm = document.getElementById('pasteWordDataForm');
  const backToStep2Btn = document.getElementById('backToStep2Btn');
  const validateJsonBtn = document.getElementById('validateJsonBtn');
  
  if (backToStep2Btn) {
    backToStep2Btn.removeEventListener('click', handleBackToStep2);
    backToStep2Btn.addEventListener('click', handleBackToStep2);
  }
  if (validateJsonBtn) {
    validateJsonBtn.removeEventListener('click', handleValidateJson);
    validateJsonBtn.addEventListener('click', handleValidateJson);
  }
  if (pasteWordDataForm) {
    pasteWordDataForm.removeEventListener('submit', handleSubmitWord);
    pasteWordDataForm.addEventListener('submit', handleSubmitWord);
  }
}

function openAddWordModal(topicId, topicName) {
  currentTopicForAddingWord = topicId;
  document.getElementById('addWordTopicName').textContent = topicName;
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('addWordModal').classList.add('active');
  showAddWordStep(1);
  document.getElementById('englishWord')?.focus();
}

function closeAddWordModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('addWordModal').classList.remove('active');
  
  // Reset form
  currentAddWordStep = 1;
  currentEnglishWord = '';
  currentTopicForAddingWord = null;
  document.getElementById('enterWordForm')?.reset();
  document.getElementById('pasteWordDataForm')?.reset();
  document.getElementById('validationMessage').style.display = 'none';
  document.getElementById('submitWordBtn').disabled = true;
  
  showAddWordStep(1);
}

function showAddWordStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.modal-step').forEach(step => {
    step.classList.remove('active');
  });
  
  // Show current step
  document.getElementById(`addWordStep${stepNumber}`).classList.add('active');
  currentAddWordStep = stepNumber;
}

function handleEnterWordSubmit(e) {
  e.preventDefault();
  
  currentEnglishWord = document.getElementById('englishWord').value.trim();
  
  if (!currentEnglishWord) {
    showNotification('Please enter an English word', 'error');
    return;
  }
  
  // Generate and show AI prompt
  const prompt = generateAIPrompt(currentEnglishWord);
  document.getElementById('aiPrompt').value = prompt;
  
  showAddWordStep(2);
}

function handleCopyPrompt() {
  const promptText = document.getElementById('aiPrompt').value;
  
  navigator.clipboard.writeText(promptText).then(() => {
    const btn = document.getElementById('copyPromptBtn');
    const originalHTML = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = '<i class="fas fa-check"></i>';
    
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = originalHTML;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    showNotification('Failed to copy prompt', 'error');
  });
}

function handleValidateJson() {
  const jsonData = document.getElementById('wordJsonData').value.trim();
  const validationMsg = document.getElementById('validationMessage');
  const submitBtn = document.getElementById('submitWordBtn');
  
  if (!jsonData) {
    validationMsg.className = 'validation-message error';
    validationMsg.innerHTML = '<i class="fas fa-times-circle"></i> Please paste the JSON data';
    return;
  }
  
  try {
    // Parse JSON
    const wordData = JSON.parse(jsonData);
    
    // Validate against schema
    const validation = validateWordData(wordData);
    
    if (validation.isValid) {
      validationMsg.className = 'validation-message success';
      validationMsg.innerHTML = '<i class="fas fa-check-circle"></i> JSON is valid! You can now add the word.';
      submitBtn.disabled = false;
    } else {
      validationMsg.className = 'validation-message error';
      validationMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Validation errors:<br>' + 
        validation.errors.map(err => `• ${err}`).join('<br>');
      submitBtn.disabled = true;
    }
    
  } catch (error) {
    validationMsg.className = 'validation-message error';
    validationMsg.innerHTML = '<i class="fas fa-times-circle"></i> Invalid JSON format: ' + error.message;
    submitBtn.disabled = true;
  }
}

async function handleSubmitWord(e) {
  e.preventDefault();
  
  const jsonData = document.getElementById('wordJsonData').value.trim();
  const submitBtn = document.getElementById('submitWordBtn');
  
  try {
    // Parse and validate JSON
    const wordData = JSON.parse(jsonData);
    const validation = validateWordData(wordData);
    
    if (!validation.isValid) {
      showNotification('Please validate the JSON first', 'error');
      return;
    }
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    
    // Save topic ID before closing modal (because closeAddWordModal will reset it to null)
    const addedToTopicId = currentTopicForAddingWord;
    
    // Add word to topic
    const newWord = await addWordToTopic(addedToTopicId, wordData);
    
    // Close modal
    closeAddWordModal();
    
    // Check current screen and refresh accordingly
    const currentScreenId = getCurrentScreen();
    const currentTopic = getCurrentTopic();
    const isUserTopic = isCurrentTopicUserTopic();
    
    if (currentScreenId === 'myWordsScreen') {
      // If on My Words screen, re-render it
      await renderMyWords('all');
    } else if (currentScreenId === 'wordListScreen' && currentTopic && isUserTopic && currentTopic.id === addedToTopicId) {
      // If viewing the specific topic in word list screen, refresh the word list
      await refreshCurrentTopicWordList();
    }
    
    // Show success message
    showNotification(`Word "${wordData.english}" added successfully!`, 'success');
    
    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    
  } catch (error) {
    console.error('Error adding word:', error);
    showNotification(error.message || 'Failed to add word', 'error');
    
    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Word';
  }
}

// ============================================
// NOTIFICATION HELPER
// ============================================

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add to body
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
