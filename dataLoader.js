// Data Loader for English Learning App
// This file loads data from data.json

let topicsData = [];
let vocabularyData = [];
let myWordsData = [];

// Function to load data from JSON file
async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Assign data to global variables
    topicsData = data.topicsData || [];
    vocabularyData = data.vocabularyData || [];
    myWordsData = data.myWordsData || [];
    
    console.log('Data loaded successfully!');
    console.log(`Topics: ${topicsData.length}`);
    console.log(`Vocabulary: ${vocabularyData.length}`);
    console.log(`My Words: ${myWordsData.length}`);
    
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// Data will be loaded manually from app.js when needed

// Export for use in other modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadData,
    getTopicsData: () => topicsData,
    getVocabularyData: () => vocabularyData,
    getMyWordsData: () => myWordsData
  };
}
