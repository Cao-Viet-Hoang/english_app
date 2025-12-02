// ============================================
// DATA LOADER
// ============================================

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

function getTopicsData() {
  return topicsData;
}

function getVocabularyData() {
  return vocabularyData;
}

function getMyWordsData() {
  return myWordsData;
}

function addToMyWords(word) {
  myWordsData.push(word);
}
