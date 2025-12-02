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

  // My Words tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(tab => {
    tab.addEventListener('click', function() {
      tabBtns.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      const tabValue = this.dataset.tab;
      setCurrentTab(tabValue);
      renderMyWords(tabValue);
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
