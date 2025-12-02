// ============================================
// MY WORDS FUNCTIONALITY
// ============================================

function renderMyWords(tab = 'all') {
  const container = document.getElementById('myWordsList');
  if (!container) return;

  const myWords = getMyWordsData();
  const filteredWords = tab === 'all' 
    ? myWords 
    : myWords.filter(word => word.category === tab);

  if (filteredWords.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <i class="fas fa-book-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
        <p>No words yet. Add your first word!</p>
      </div>
    `;
    return;
  }

  renderWordCards(filteredWords, 'myWordsList');
}
