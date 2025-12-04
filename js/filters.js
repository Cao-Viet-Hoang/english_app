// ============================================
// FILTER & TAB LISTENERS
// ============================================

function setupFilterListeners() {
  // Journey screen filters
  const filterChips = document.querySelectorAll('.filter-chips .chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', function() {
      filterChips.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.dataset.filter;
      setCurrentFilter(filter);
      renderTopics(filter);
    });
  });

  // My Words filter chips (same as Journey)
  const myWordsChips = document.querySelectorAll('#myWordsScreen .filter-chips .chip');
  myWordsChips.forEach(chip => {
    chip.addEventListener('click', function() {
      myWordsChips.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.dataset.filter;
      renderMyWords(filter);
    });
  });

  // Search functionality
  const searchInput = document.getElementById('wordSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      filterWordCards(searchTerm);
    });
  }
}

function filterWordCards(searchTerm) {
  const wordCards = document.querySelectorAll('.word-card');
  wordCards.forEach(card => {
    const englishWord = card.querySelector('.word-english').textContent.toLowerCase();
    if (englishWord.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}
