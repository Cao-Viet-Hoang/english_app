// ============================================
// FILTER & TAB LISTENERS
// ============================================

let filterListenersInitialized = false;

function setupFilterListeners() {
  // Prevent duplicate listener setup
  if (filterListenersInitialized) {
    return;
  }
  
  // Journey screen filters
  const filterChips = document.querySelectorAll('#journeyScreen .filter-chips .chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', function() {
      filterChips.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.dataset.filter;
      const searchInput = document.getElementById('topicsSearch');
      const searchText = searchInput ? searchInput.value : '';
      renderTopics(filter, searchText);
    });
  });

  // Journey screen topics search
  const topicsSearchInput = document.getElementById('topicsSearch');
  if (topicsSearchInput) {
    topicsSearchInput.addEventListener('input', function() {
      const activeChip = document.querySelector('#journeyScreen .filter-chips .chip.active');
      const filter = activeChip ? activeChip.dataset.filter : 'all';
      renderTopics(filter, this.value);
    });
  }

  // My Words filter chips (same as Journey)
  const myWordsChips = document.querySelectorAll('#myWordsScreen .filter-chips .chip');
  myWordsChips.forEach(chip => {
    chip.addEventListener('click', function() {
      myWordsChips.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.dataset.filter;
      const searchInput = document.getElementById('myTopicsSearch');
      const searchText = searchInput ? searchInput.value : '';
      renderMyWords(filter, searchText);
    });
  });

  // My Words topics search
  const myTopicsSearchInput = document.getElementById('myTopicsSearch');
  if (myTopicsSearchInput) {
    myTopicsSearchInput.addEventListener('input', function() {
      const activeChip = document.querySelector('#myWordsScreen .filter-chips .chip.active');
      const filter = activeChip ? activeChip.dataset.filter : 'all';
      renderMyWords(filter, this.value);
    });
  }
  
  filterListenersInitialized = true;

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
