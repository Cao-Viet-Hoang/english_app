// ============================================
// ADD WORD MODAL
// ============================================

function setupModalListeners() {
  const addWordBtn = document.getElementById('addWordBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('addWordModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelAddBtn = document.getElementById('cancelAddBtn');
  const addWordForm = document.getElementById('addWordForm');

  if (addWordBtn) {
    addWordBtn.addEventListener('click', openAddWordModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeAddWordModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeAddWordModal);
  }

  if (cancelAddBtn) {
    cancelAddBtn.addEventListener('click', closeAddWordModal);
  }

  if (addWordForm) {
    addWordForm.addEventListener('submit', handleAddWord);
  }
}

function openAddWordModal() {
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('addWordModal').classList.add('active');
}

function closeAddWordModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('addWordModal').classList.remove('active');
  document.getElementById('addWordForm').reset();
}

function handleAddWord(e) {
  e.preventDefault();

  const newWord = {
    id: Date.now(), // Simple ID generation
    english: document.getElementById('wordEnglish').value,
    type: document.getElementById('wordType').value,
    vietnameseMeaning: document.getElementById('wordVietnamese').value,
    vietnameseDescription: document.getElementById('wordDescription').value || '',
    category: document.getElementById('wordCategory').value,
    userNote: document.getElementById('wordNote').value || '',
    ipa: '/', // User can add later or fetch from API
    status: 'new',
    examples: []
  };

  // TODO: Implement adding word to user topic
  // For now, just show notification
  console.log('Word to add:', newWord);

  // Re-render My Words screen
  renderMyWords('all');

  // Close modal
  closeAddWordModal();

  // Show success feedback
  showNotification('Word added successfully!');
}
