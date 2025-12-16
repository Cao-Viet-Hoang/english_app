// ============================================
// MIXED QUESTION GENERATOR MODULE
// ============================================
// This module generates various question types based on word data
// Question types: Meaning, Example, Collocation, Common Mistakes, 
// Synonyms, Noun Grammar, Verb Forms

const QuestionType = {
  MEANING: 'meaning',
  EXAMPLE_FILL: 'example_fill',
  EXAMPLE_MCQ: 'example_mcq',
  COLLOCATION_MCQ: 'collocation_mcq',
  COLLOCATION_FILL: 'collocation_fill',
  COMMON_MISTAKE: 'common_mistake',
  SYNONYM: 'synonym',
  ODD_ONE_OUT: 'odd_one_out',
  NOUN_COUNTABILITY: 'noun_countability',
  NOUN_PLURAL: 'noun_plural',
  VERB_FORM_TENSE: 'verb_form_tense',
  VERB_FORM_MCQ: 'verb_form_mcq'
};

// ============================================
// MAIN QUESTION GENERATOR
// ============================================

/**
 * Generate all possible questions from a list of words
 * @param {Array} words - Array of word objects
 * @returns {Array} Array of question objects
 */
function generateMixedQuestions(words) {
  if (!words || words.length === 0) {
    return [];
  }

  const allQuestions = [];

  // Generate questions for each word
  words.forEach(word => {
    const questions = generateQuestionsForWord(word, words);
    allQuestions.push(...questions);
  });

  // Shuffle questions
  return shuffleArray(allQuestions);
}

/**
 * Generate all possible questions for a single word
 * @param {Object} word - Word object
 * @param {Array} allWords - All words for generating distractors
 * @returns {Array} Array of question objects
 */
function generateQuestionsForWord(word, allWords) {
  const questions = [];

  // A. Meaning questions
  if (word.vietnameseMeaning) {
    const meaningQuestion = generateMeaningQuestion(word, allWords);
    if (meaningQuestion) questions.push(meaningQuestion);
  }

  // B. Example sentence questions
  if (word.examples && word.examples.length > 0) {
    word.examples.forEach(example => {
      const fillQuestion = generateExampleFillQuestion(word, example);
      if (fillQuestion) questions.push(fillQuestion);
      
      const mcqQuestion = generateExampleMCQQuestion(word, example, allWords);
      if (mcqQuestion) questions.push(mcqQuestion);
    });
  }

  // C. Collocation questions
  if (word.collocations && word.collocations.length > 0) {
    word.collocations.forEach(collocation => {
      const collMCQ = generateCollocationMCQQuestion(word, collocation, allWords);
      if (collMCQ) questions.push(collMCQ);
      
      const collFill = generateCollocationFillQuestion(word, collocation);
      if (collFill) questions.push(collFill);
    });
  }

  // D. Common mistake questions
  if (word.commonMistakes && word.commonMistakes.length > 0) {
    word.commonMistakes.forEach(mistake => {
      const mistakeQuestion = generateCommonMistakeQuestion(word, mistake);
      if (mistakeQuestion) questions.push(mistakeQuestion);
    });
  }

  // E. Synonym questions
  if (word.synonyms && word.synonyms.length > 0) {
    const synQuestion = generateSynonymQuestion(word, allWords);
    if (synQuestion) questions.push(synQuestion);
    
    const oddOneOut = generateOddOneOutQuestion(word, allWords);
    if (oddOneOut) questions.push(oddOneOut);
  }

  // F. Noun grammar questions
  if (word.type === 'noun' && word.noun) {
    const countabilityQuestion = generateNounCountabilityQuestion(word);
    if (countabilityQuestion) questions.push(countabilityQuestion);
    
    const pluralQuestion = generateNounPluralQuestion(word);
    if (pluralQuestion) questions.push(pluralQuestion);
  }

  // G. Verb form questions
  if (word.type === 'verb' && word.irregular) {
    const verbTenseQuestion = generateVerbFormTenseQuestion(word);
    if (verbTenseQuestion) questions.push(verbTenseQuestion);
    
    const verbFormMCQ = generateVerbFormMCQQuestion(word);
    if (verbFormMCQ) questions.push(verbFormMCQ);
  }

  return questions;
}

// ============================================
// A. MEANING QUESTIONS
// ============================================

function generateMeaningQuestion(word, allWords) {
  const correctAnswer = word.vietnameseDescription || word.vietnameseMeaning;
  const distractors = generateMeaningDistractors(word, allWords, 3);
  
  if (distractors.length < 3) return null;

  const options = shuffleArray([
    { text: correctAnswer, isCorrect: true },
    ...distractors.map(d => ({ text: d, isCorrect: false }))
  ]);

  return {
    type: QuestionType.MEANING,
    word: word.english,
    question: `What is the meaning of "${word.english}"?`,
    options: options,
    correctAnswer: correctAnswer,
    explanation: word.vietnameseDescription || word.vietnameseMeaning
  };
}

function generateMeaningDistractors(word, allWords, count) {
  const distractors = [];
  const correctMeaning = word.vietnameseDescription || word.vietnameseMeaning;
  const otherWords = allWords.filter(w => w.id !== word.id && (w.vietnameseDescription || w.vietnameseMeaning));
  
  const shuffled = shuffleArray(otherWords);
  for (let i = 0; i < shuffled.length && distractors.length < count; i++) {
    const otherMeaning = shuffled[i].vietnameseDescription || shuffled[i].vietnameseMeaning;
    if (otherMeaning !== correctMeaning) {
      distractors.push(otherMeaning);
    }
  }
  
  return distractors;
}

// ============================================
// B. EXAMPLE SENTENCE QUESTIONS
// ============================================

function generateExampleFillQuestion(word, example) {
  const sentence = example.en;
  const targetWord = word.english;
  
  // Check if word exists in sentence (case insensitive)
  const regex = new RegExp(`\\b${targetWord}\\b`, 'gi');
  if (!regex.test(sentence)) return null;
  
  // Replace first occurrence with blank
  const blankedSentence = sentence.replace(regex, '____');
  
  return {
    type: QuestionType.EXAMPLE_FILL,
    word: word.english,
    question: `Fill in the blank: ${blankedSentence}`,
    userAnswer: '',
    correctAnswer: targetWord.toLowerCase(),
    acceptedAnswers: [targetWord.toLowerCase()], // Accept base form
    explanation: `Complete sentence: ${sentence}`,
    translationVi: example.vi
  };
}

function generateExampleMCQQuestion(word, example, allWords) {
  const sentence = example.en;
  const targetWord = word.english;
  
  // Check if word exists in sentence
  const regex = new RegExp(`\\b${targetWord}\\b`, 'gi');
  if (!regex.test(sentence)) return null;
  
  const blankedSentence = sentence.replace(regex, '____');
  const distractors = generateWordDistractors(word, allWords, 3);
  
  if (distractors.length < 3) return null;
  
  const options = shuffleArray([
    { text: targetWord, isCorrect: true },
    ...distractors.map(d => ({ text: d, isCorrect: false }))
  ]);
  
  return {
    type: QuestionType.EXAMPLE_MCQ,
    word: word.english,
    question: `Choose the correct word: ${blankedSentence}`,
    options: options,
    correctAnswer: targetWord,
    explanation: `Complete sentence: ${sentence}`,
    translationVi: example.vi
  };
}

function generateWordDistractors(word, allWords, count) {
  const distractors = [];
  const sameTypeWords = allWords.filter(w => 
    w.id !== word.id && 
    w.type === word.type && 
    w.english !== word.english
  );
  
  const shuffled = shuffleArray(sameTypeWords);
  for (let i = 0; i < shuffled.length && distractors.length < count; i++) {
    distractors.push(shuffled[i].english);
  }
  
  // If not enough same-type words, add any other words
  if (distractors.length < count) {
    const otherWords = allWords.filter(w => 
      w.id !== word.id && 
      !distractors.includes(w.english) &&
      w.english !== word.english
    );
    const shuffledOthers = shuffleArray(otherWords);
    for (let i = 0; i < shuffledOthers.length && distractors.length < count; i++) {
      distractors.push(shuffledOthers[i].english);
    }
  }
  
  return distractors;
}

// ============================================
// C. COLLOCATION QUESTIONS
// ============================================

function generateCollocationMCQQuestion(word, collocation, allWords) {
  const expression = collocation.expression;
  
  // Generate distractors from other words' collocations
  const distractors = generateCollocationDistractorsFromWords(word, allWords);
  
  if (distractors.length < 3) return null;
  
  const options = shuffleArray([
    { text: expression, isCorrect: true },
    ...distractors.map(d => ({ text: d, isCorrect: false }))
  ]);
  
  return {
    type: QuestionType.COLLOCATION_MCQ,
    word: word.english,
    question: `Which is the correct collocation?`,
    context: `Type: ${collocation.type}`,
    options: options,
    correctAnswer: expression,
    explanation: `Correct collocation: ${expression}`,
    translationVi: collocation.exampleVi
  };
}

function generateCollocationDistractorsFromWords(word, allWords) {
  const distractors = [];
  
  // Get collocations from other words
  const otherWords = allWords.filter(w => w.id !== word.id && w.collocations && w.collocations.length > 0);
  const shuffled = shuffleArray(otherWords);
  
  for (let i = 0; i < shuffled.length && distractors.length < 3; i++) {
    const otherCollocations = shuffled[i].collocations;
    if (otherCollocations && otherCollocations.length > 0) {
      const randomCollocation = otherCollocations[Math.floor(Math.random() * otherCollocations.length)];
      if (!distractors.includes(randomCollocation.expression)) {
        distractors.push(randomCollocation.expression);
      }
    }
  }
  
  return distractors;
}

function generateCollocationFillQuestion(word, collocation) {
  const expression = collocation.expression;
  const words = expression.split(' ');
  
  if (words.length < 2) return null;
  
  // Hide the main word if it's in the expression
  let blankIndex = words.findIndex(w => w.toLowerCase() === word.english.toLowerCase());
  
  // If main word not found, hide the first word
  if (blankIndex === -1) {
    blankIndex = 0;
  }
  
  const targetWord = words[blankIndex];
  const blankedExpression = words.map((w, i) => i === blankIndex ? '____' : w).join(' ');
  
  return {
    type: QuestionType.COLLOCATION_FILL,
    word: word.english,
    question: `Complete the collocation: ${blankedExpression}`,
    context: `Type: ${collocation.type}`,
    userAnswer: '',
    correctAnswer: targetWord.toLowerCase(),
    acceptedAnswers: [targetWord.toLowerCase()],
    explanation: `Correct collocation: ${expression}`,
    translationVi: collocation.exampleVi
  };
}

// ============================================
// D. COMMON MISTAKE QUESTIONS
// ============================================

function generateCommonMistakeQuestion(word, mistake) {
  const options = shuffleArray([
    { text: mistake.correct, isCorrect: true },
    { text: mistake.wrong, isCorrect: false }
  ]);
  
  return {
    type: QuestionType.COMMON_MISTAKE,
    word: word.english,
    question: `Which sentence is correct?`,
    options: options,
    correctAnswer: mistake.correct,
    wrongAnswer: mistake.wrong,
    explanation: mistake.explanation
  };
}

// ============================================
// E. SYNONYM QUESTIONS
// ============================================

function generateSynonymQuestion(word, allWords) {
  if (!word.synonyms || word.synonyms.length === 0) return null;
  
  const correctSynonym = word.synonyms[0];
  const distractors = generateSynonymDistractors(word, allWords, 3);
  
  if (distractors.length < 3) return null;
  
  const options = shuffleArray([
    { text: correctSynonym, isCorrect: true },
    ...distractors.map(d => ({ text: d, isCorrect: false }))
  ]);
  
  return {
    type: QuestionType.SYNONYM,
    word: word.english,
    question: `Which word is a synonym of "${word.english}"?`,
    options: options,
    correctAnswer: correctSynonym,
    explanation: `All synonyms: ${word.synonyms.join(', ')}`
  };
}

function generateSynonymDistractors(word, allWords, count) {
  const distractors = [];
  const otherWords = allWords.filter(w => 
    w.id !== word.id && 
    w.english !== word.english &&
    !word.synonyms.includes(w.english)
  );
  
  const shuffled = shuffleArray(otherWords);
  for (let i = 0; i < shuffled.length && distractors.length < count; i++) {
    distractors.push(shuffled[i].english);
  }
  
  return distractors;
}

function generateOddOneOutQuestion(word, allWords) {
  if (!word.synonyms || word.synonyms.length < 2) return null;
  
  // Use up to 3 synonyms
  const synonymsToUse = word.synonyms.slice(0, 3);
  
  // Find an unrelated word
  const unrelatedWords = allWords.filter(w => 
    w.id !== word.id && 
    w.english !== word.english &&
    !word.synonyms.includes(w.english) &&
    w.type === word.type // Same type for better question
  );
  
  if (unrelatedWords.length === 0) return null;
  
  const unrelatedWord = shuffleArray(unrelatedWords)[0].english;
  
  const options = shuffleArray([
    ...synonymsToUse.map(s => ({ text: s, isCorrect: false })),
    { text: unrelatedWord, isCorrect: true }
  ]);
  
  return {
    type: QuestionType.ODD_ONE_OUT,
    word: word.english,
    question: `Which word is NOT a synonym of "${word.english}"?`,
    options: options,
    correctAnswer: unrelatedWord,
    explanation: `Synonyms of "${word.english}": ${word.synonyms.join(', ')}`
  };
}

// ============================================
// F. NOUN GRAMMAR QUESTIONS
// ============================================

function generateNounCountabilityQuestion(word) {
  if (!word.noun || !word.noun.countability) return null;
  
  const countability = word.noun.countability;
  let correctAnswer = '';
  let explanation = '';
  
  if (countability === 'C') {
    correctAnswer = 'Countable';
    explanation = `"${word.english}" is countable. You can say: a ${word.english}, two ${word.noun.plural || word.english + 's'}`;
  } else if (countability === 'U') {
    correctAnswer = 'Uncountable';
    explanation = `"${word.english}" is uncountable. You say: some ${word.english}, much ${word.english}`;
  } else {
    correctAnswer = 'Both countable and uncountable';
    explanation = `"${word.english}" can be both countable and uncountable depending on context`;
  }
  
  const options = shuffleArray([
    { text: 'Countable', isCorrect: countability === 'C' },
    { text: 'Uncountable', isCorrect: countability === 'U' },
    { text: 'Both countable and uncountable', isCorrect: countability === 'C/U' }
  ]);
  
  return {
    type: QuestionType.NOUN_COUNTABILITY,
    word: word.english,
    question: `Is "${word.english}" countable or uncountable?`,
    options: options,
    correctAnswer: correctAnswer,
    explanation: explanation
  };
}

function generateNounPluralQuestion(word) {
  if (!word.noun || !word.noun.plural || word.noun.countability === 'U') return null;
  
  const plural = word.noun.plural;
  const singular = word.noun.singular || word.english;
  
  // Generate wrong plural forms
  const distractors = [
    singular + 's',
    singular + 'es',
    singular + 'ies'
  ].filter(d => d !== plural);
  
  // Remove duplicates and limit to 3
  const uniqueDistractors = [...new Set(distractors)].slice(0, 3);
  
  if (uniqueDistractors.length < 2) {
    // Add more creative wrong answers
    uniqueDistractors.push(singular);
    uniqueDistractors.push(singular + 'en');
  }
  
  const options = shuffleArray([
    { text: plural, isCorrect: true },
    ...uniqueDistractors.slice(0, 3).map(d => ({ text: d, isCorrect: false }))
  ]);
  
  return {
    type: QuestionType.NOUN_PLURAL,
    word: word.english,
    question: `What is the plural form of "${singular}"?`,
    options: options,
    correctAnswer: plural,
    explanation: `The plural of "${singular}" is "${plural}"`
  };
}

// ============================================
// G. VERB FORM QUESTIONS
// ============================================

function generateVerbFormTenseQuestion(word) {
  if (!word.irregular) return null;
  
  const forms = word.irregular;
  
  // Create different tense scenarios
  const scenarios = [
    {
      context: 'Yesterday, I ____ to the store.',
      correctForm: forms.v2,
      explanation: 'Past simple requires V2 form'
    },
    {
      context: 'I have ____ there many times.',
      correctForm: forms.v3,
      explanation: 'Present perfect requires V3 form (past participle)'
    },
    {
      context: 'I am ____ now.',
      correctForm: forms.ving,
      explanation: 'Present continuous requires V-ing form'
    }
  ];
  
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  // Generate options
  const allForms = [forms.v1, forms.v2, forms.v3, forms.ving];
  const uniqueForms = [...new Set(allForms)]; // Remove duplicates
  
  if (uniqueForms.length < 3) return null; // Need at least 3 different forms
  
  const options = shuffleArray(
    uniqueForms.map(form => ({
      text: form,
      isCorrect: form === scenario.correctForm
    }))
  );
  
  return {
    type: QuestionType.VERB_FORM_TENSE,
    word: word.english,
    question: scenario.context,
    options: options,
    correctAnswer: scenario.correctForm,
    explanation: scenario.explanation
  };
}

function generateVerbFormMCQQuestion(word) {
  if (!word.irregular) return null;
  
  const forms = word.irregular;
  
  // Ask about a specific form
  const formQuestions = [
    {
      question: `What is the past simple (V2) form of "${forms.v1}"?`,
      correctForm: forms.v2
    },
    {
      question: `What is the past participle (V3) form of "${forms.v1}"?`,
      correctForm: forms.v3
    }
  ];
  
  const formQuestion = formQuestions[Math.floor(Math.random() * formQuestions.length)];
  
  // Create options from verb forms
  const allForms = [forms.v1, forms.v2, forms.v3, forms.ving];
  const uniqueForms = [...new Set(allForms)];
  
  if (uniqueForms.length < 3) return null;
  
  const options = shuffleArray(
    uniqueForms.map(form => ({
      text: form,
      isCorrect: form === formQuestion.correctForm
    }))
  );
  
  return {
    type: QuestionType.VERB_FORM_MCQ,
    word: word.english,
    question: formQuestion.question,
    options: options,
    correctAnswer: formQuestion.correctForm,
    explanation: `Forms: V1=${forms.v1}, V2=${forms.v2}, V3=${forms.v3}, V-ing=${forms.ving}`
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Check if a fill-in answer is correct (case insensitive, trimmed)
 */
function checkFillAnswer(userAnswer, correctAnswer, acceptedAnswers = []) {
  const normalized = userAnswer.trim().toLowerCase();
  const correct = correctAnswer.trim().toLowerCase();
  
  if (normalized === correct) return true;
  
  // Check accepted alternatives
  return acceptedAnswers.some(ans => ans.trim().toLowerCase() === normalized);
}
