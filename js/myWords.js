// ============================================
// MY WORDS FUNCTIONALITY
// ============================================

// Global state for current topic when adding words
let currentTopicForAddingWord = null;

// ============================================
// CREATE NEW TOPIC
// ============================================

/**
 * Generate unique ID for new topic
 */
function generateTopicId() {
  const userTopics = getUserTopics();
  const sharedTopics = getSharedTopics();
  const allTopics = [...userTopics, ...sharedTopics];
  
  if (allTopics.length === 0) return 1;
  
  const maxId = Math.max(...allTopics.map(t => t.id));
  return maxId + 1;
}

/**
 * Create new topic with Firebase sync
 */
async function createNewTopic(topicData) {
  try {
    // Validate required fields
    if (!topicData.name || !topicData.nameVi || !topicData.icon || 
        !topicData.iconColor || !topicData.level || !topicData.category) {
      throw new Error('All fields are required');
    }

    // Generate unique ID
    const newTopicId = generateTopicId();

    // Create topic object following schema
    const newTopic = {
      id: newTopicId,
      name: topicData.name.trim(),
      nameVi: topicData.nameVi.trim(),
      icon: topicData.icon.trim(),
      iconColor: topicData.iconColor,
      level: topicData.level,
      totalWords: 0,
      category: topicData.category,
      vocabulary: []
    };

    // Add to local cache
    if (!appData.user_vocabulary) {
      appData.user_vocabulary = {};
    }
    if (!appData.user_vocabulary[currentUserId]) {
      appData.user_vocabulary[currentUserId] = { topics: [] };
    }
    if (!appData.user_vocabulary[currentUserId].topics) {
      appData.user_vocabulary[currentUserId].topics = [];
    }
    
    appData.user_vocabulary[currentUserId].topics.push(newTopic);

    // Update userWordsCache
    if (!userWordsCache) {
      userWordsCache = { topics: [] };
    }
    if (!userWordsCache.topics) {
      userWordsCache.topics = [];
    }
    userWordsCache.topics.push(newTopic);

    // Sync to Firebase
    const userVocabRef = database.ref(`user_vocabulary/${currentUserId}/topics`);
    await userVocabRef.set(appData.user_vocabulary[currentUserId].topics);

    console.log('✅ Topic created successfully:', newTopic.name);
    return newTopic;

  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
}

// ============================================
// ADD WORD TO TOPIC
// ============================================

/**
 * Generate unique ID for new word within a topic
 */
function generateWordId(topicId) {
  const userTopics = getUserTopics();
  const topic = userTopics.find(t => t.id === topicId);
  
  if (!topic || !topic.vocabulary || topic.vocabulary.length === 0) {
    return 1;
  }
  
  const maxId = Math.max(...topic.vocabulary.map(w => w.id));
  return maxId + 1;
}

/**
 * Validate word data against schema
 */
function validateWordData(wordData) {
  const errors = [];

  // Required fields
  if (!wordData.english) errors.push('English word is required');
  if (!wordData.ipa) errors.push('IPA pronunciation is required');
  if (!wordData.type) errors.push('Word type is required');
  if (!wordData.vietnameseMeaning) errors.push('Vietnamese meaning is required');
  if (!wordData.vietnameseDescription) errors.push('Vietnamese description is required');
  if (!wordData.examples || !Array.isArray(wordData.examples)) {
    errors.push('Examples array is required');
  }

  // Validate type enum
  const validTypes = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection'];
  if (wordData.type && !validTypes.includes(wordData.type)) {
    errors.push(`Word type must be one of: ${validTypes.join(', ')}`);
  }

  // Validate examples
  if (wordData.examples && Array.isArray(wordData.examples)) {
    wordData.examples.forEach((example, idx) => {
      if (!example.level || !example.en || !example.vi) {
        errors.push(`Example ${idx + 1} is missing required fields (level, en, vi)`);
      }
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      if (example.level && !validLevels.includes(example.level)) {
        errors.push(`Example ${idx + 1} level must be: beginner, intermediate, or advanced`);
      }
    });
  }

  // Validate frequency if present
  if (wordData.frequency) {
    const validFrequencies = ['low', 'medium', 'high'];
    if (!validFrequencies.includes(wordData.frequency)) {
      errors.push('Frequency must be: low, medium, or high');
    }
  }

  // Validate CEFR level if present
  if (wordData.cefrLevel) {
    const validCefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (!validCefrLevels.includes(wordData.cefrLevel)) {
      errors.push('CEFR level must be: A1, A2, B1, B2, C1, or C2');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Add word to topic with Firebase sync
 */
async function addWordToTopic(topicId, wordData) {
  try {
    // Validate word data
    const validation = validateWordData(wordData);
    if (!validation.isValid) {
      throw new Error(`Validation failed:\n${validation.errors.join('\n')}`);
    }

    // Generate unique word ID
    const newWordId = generateWordId(topicId);

    // Create complete word object
    const newWord = {
      id: newWordId,
      topicId: topicId,
      ...wordData
    };

    // Find the topic in user vocabulary
    const userTopics = getUserTopics();
    const topicIndex = userTopics.findIndex(t => t.id === topicId);
    
    if (topicIndex === -1) {
      throw new Error('Topic not found');
    }

    // Add word to topic
    if (!userTopics[topicIndex].vocabulary) {
      userTopics[topicIndex].vocabulary = [];
    }
    userTopics[topicIndex].vocabulary.push(newWord);
    
    // Update totalWords count
    userTopics[topicIndex].totalWords = userTopics[topicIndex].vocabulary.length;

    // Update cache
    if (userWordsCache && userWordsCache.topics) {
      const cacheTopicIndex = userWordsCache.topics.findIndex(t => t.id === topicId);
      if (cacheTopicIndex !== -1) {
        userWordsCache.topics[cacheTopicIndex] = userTopics[topicIndex];
      }
    }

    // Sync to Firebase
    const topicRef = database.ref(`user_vocabulary/${currentUserId}/topics/${topicIndex}`);
    await topicRef.set(userTopics[topicIndex]);

    console.log('✅ Word added successfully:', newWord.english);
    return newWord;

  } catch (error) {
    console.error('Error adding word to topic:', error);
    throw error;
  }
}

/**
 * Generate AI prompt for word generation
 */
function generateAIPrompt(englishWord) {
  return `Please generate complete vocabulary data for the English word "${englishWord}" in JSON format. Follow this structure exactly:

{
  "english": "${englishWord}",
  "ipa": "/IPA pronunciation here/",
  "type": "noun|verb|adjective|adverb|preposition|conjunction|pronoun|interjection",
  "vietnameseMeaning": "Vietnamese meaning",
  "vietnameseDescription": "Detailed description in Vietnamese explaining usage, context, and nuances",
  "irregular": {
    "v1": "base form",
    "v2": "past simple",
    "v3": "past participle",
    "ving": "present participle"
  },
  "noun": {
    "singular": "singular form",
    "plural": "plural form",
    "countability": "C|U|C/U"
  },
  "examples": [
    {
      "level": "beginner|intermediate|advanced",
      "en": "English example sentence",
      "vi": "Vietnamese translation"
    }
  ],
  "commonMistakes": [
    {
      "wrong": "incorrect usage",
      "correct": "correct usage",
      "explanation": "explanation in Vietnamese"
    }
  ],
  "synonyms": ["synonym1", "synonym2", "synonym3"],
  "collocations": [
    {
      "type": "Verb + Noun",
      "expression": "collocation expression",
      "example": "English example",
      "exampleVi": "Vietnamese translation"
    }
  ],
  "frequency": "low|medium|high",
  "cefrLevel": "A1|A2|B1|B2|C1|C2"
}

IMPORTANT NOTES:
1. Include "irregular" only for verbs
2. Include "noun" only for nouns
3. Provide 2-4 examples at different levels
4. Include 1-3 common mistakes
5. List 2-5 synonyms
6. Provide 2-4 collocations
7. All Vietnamese text must be in Vietnamese
8. Return ONLY the JSON object, no additional text`;
}

// ============================================
// RENDER MY WORDS
// ============================================

async function renderMyWords(filter = 'all') {
  const container = document.getElementById('myTopicsList');
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
      <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 16px;"></i>
      <p>Loading your topics...</p>
    </div>
  `;

  try {
    // Load user vocabulary if not already loaded
    if (!userWordsCache) {
      await loadUserWords(currentUserId.toString());
    }

    // Get user's personal topics only (not shared vocabulary)
    const userTopics = getUserTopics();
    
    const filteredTopics = filter === 'all' 
      ? userTopics 
      : userTopics.filter(topic => topic.category === filter);

    if (filteredTopics.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <i class="fas fa-book-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
          <p>No personal topics yet. Add your first topic!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredTopics.map(topic => {
      const learnedWords = getLearnedWordsCount(topic.id, true);
      const progress = topic.totalWords > 0 
        ? Math.round((learnedWords / topic.totalWords) * 100) 
        : 0;
      
      return `
        <div class="topic-card" data-topic-id="${topic.id}" data-is-user="true">
          <div class="topic-card-header">
            <div class="topic-icon" style="background: ${topic.iconColor};">
              ${topic.icon}
            </div>
            <div class="topic-info">
              <div class="topic-name">${topic.name}</div>
              <div class="topic-meta">
                <span class="topic-level">${topic.level}</span>
                <span>${learnedWords}/${topic.totalWords} words</span>
              </div>
            </div>
          </div>
          <div class="topic-progress-container">
            <div class="progress-info">
              <span>Progress</span>
              <span>${progress}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Add click listeners to topic cards
    const topicCards = container.querySelectorAll('.topic-card');
    topicCards.forEach(card => {
      card.addEventListener('click', function() {
        const topicId = parseInt(this.dataset.topicId);
        const isUserTopic = this.dataset.isUser === 'true';
        openTopicWords(topicId, isUserTopic);
      });
    });
  } catch (error) {
    console.error('Error loading user topics:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--error);">
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>Error loading your topics. Please try again.</p>
      </div>
    `;
  }
}
