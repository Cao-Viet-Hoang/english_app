// ============================================
// AUDIO FUNCTIONALITY
// ============================================

function playAudio(type) {
  // In a real app, this would play actual audio files
  console.log(`Playing ${type.toUpperCase()} pronunciation`);
  
  // Use Web Speech API
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance();
    const wordElement = event.target.closest('.word-card').querySelector('.word-english');
    utterance.text = wordElement.textContent;
    utterance.lang = type === 'us' ? 'en-US' : 'en-GB';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}

function playDetailAudio(word, type) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = type === 'us' ? 'en-US' : 'en-GB';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}
