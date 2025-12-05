// ============================================
// WORD DETAIL BOTTOM SHEET
// ============================================

function setupBottomSheetListeners() {
  const overlay = document.getElementById('bottomSheetOverlay');
  const sheet = document.getElementById('wordDetailSheet');
  
  if (overlay) {
    overlay.addEventListener('click', closeBottomSheet);
  }
  
  if (sheet) {
    // Handle swipe down to close (simplified)
    const handle = sheet.querySelector('.bottom-sheet-handle');
    if (handle) {
      handle.addEventListener('click', closeBottomSheet);
    }
    
    // Add click listener to the close button in header
    sheet.addEventListener('click', function(e) {
      const header = sheet.querySelector('.detail-word-header');
      if (header && e.target === header) {
        const rect = header.getBoundingClientRect();
        // Check if click is in the top-right corner (close button area)
        if (e.clientX > rect.right - 50 && e.clientY < rect.top + 50) {
          closeBottomSheet();
        }
      }
    });
  }
}

function openWordDetail(wordId) {
  const topic = getCurrentTopic();
  const isUserTopic = isCurrentTopicUserTopic();
  
  if (!topic) return;
  
  const topicWords = getTopicWords(topic.id, isUserTopic);
  const word = topicWords.find(w => w.id === wordId);
  
  if (!word) return;

  const detailContent = document.getElementById('wordDetailContent');
  detailContent.innerHTML = generateWordDetailHTML(word);

  // Show bottom sheet
  document.getElementById('bottomSheetOverlay').classList.add('active');
  document.getElementById('wordDetailSheet').classList.add('active');

  // Setup detail listeners
  setupDetailListeners();
}

function closeBottomSheet() {
  document.getElementById('bottomSheetOverlay').classList.remove('active');
  document.getElementById('wordDetailSheet').classList.remove('active');
}

function generateWordDetailHTML(word) {
  return `
    <div class="detail-word-header">
      <button class="detail-close-btn" onclick="closeBottomSheet()">
        <i class="fas fa-times"></i>
      </button>
      <h2 class="detail-word-english">${word.english}</h2>
      <div class="detail-word-ipa">${word.ipa}</div>
      ${word.cefrLevel || word.frequency ? `
      <div class="detail-word-meta">
        ${word.cefrLevel ? `<span class="meta-badge cefr-badge cefr-${word.cefrLevel.toLowerCase()}">${word.cefrLevel}</span>` : ''}
        ${word.frequency ? `<span class="meta-badge frequency-badge frequency-${word.frequency}">
          <i class="fas fa-chart-line"></i> ${word.frequency.charAt(0).toUpperCase() + word.frequency.slice(1)}
        </span>` : ''}
      </div>` : ''}
      <div class="detail-audio-controls">
        <button class="detail-audio-btn us" onclick="playDetailAudio('${word.english}', 'us')">
          <i class="fas fa-volume-up"></i> US
        </button>
        <button class="detail-audio-btn uk" onclick="playDetailAudio('${word.english}', 'uk')">
          <i class="fas fa-volume-up"></i> UK
        </button>
      </div>
    </div>

    ${generateWordTypeSection(word)}
    ${generateMeaningSection(word)}
    ${generateExamplesSection(word)}
    ${generateMistakesSection(word)}
    ${generateSynonymsSection(word)}
    ${generateCollocationsSection(word)}
  `;
}

function generateWordTypeSection(word) {
  let typeInfo = `<span class="word-type-badge">${word.type}</span>`;
  
  if (word.type === 'verb' && word.irregular) {
    typeInfo += `<br><strong>Forms:</strong> ${word.irregular.v1} - ${word.irregular.v2} - ${word.irregular.v3} | V-ing: ${word.irregular.ving}`;
  } else if (word.type === 'noun' && word.noun) {
    typeInfo += `<br><strong>Plural:</strong> ${word.noun.plural} | <strong>Type:</strong> [${word.noun.countability}]`;
  } else if (word.type === 'adjective' && word.adjective) {
    if (word.adjective.prepositions && word.adjective.prepositions.length > 0) {
      typeInfo += `<br><strong>Common prepositions:</strong>`;
      return `
        <div class="detail-section">
          <h3 class="detail-section-title">
            <i class="fas fa-tag"></i> Word Type
          </h3>
          <div class="word-type-info">${typeInfo}</div>
          <div class="adj-preposition-tags">
            ${word.adjective.prepositions.map(prep => 
              `<span class="adj-prep-tag">${prep}</span>`
            ).join('')}
          </div>
        </div>
      `;
    }
  }
  
  return `
    <div class="detail-section">
      <h3 class="detail-section-title">
        <i class="fas fa-tag"></i> Word Type
      </h3>
      <div class="word-type-info">${typeInfo}</div>
    </div>
  `;
}

function generateMeaningSection(word) {
  return `
    <div class="detail-section">
      <h3 class="detail-section-title">
        <i class="fas fa-language"></i> Vietnamese Meaning
      </h3>
      <div class="vietnamese-description">
        ${word.vietnameseDescription || word.vietnameseMeaning}
      </div>
      <div class="vietnamese-reveal">
        <span>Vietnamese equivalent:</span>
        <span class="reveal-btn" onclick="toggleReveal(this)">Show</span>
        <span class="revealed-text">${word.vietnameseMeaning}</span>
      </div>
    </div>
  `;
}

function generateExamplesSection(word) {
  if (!word.examples || word.examples.length === 0) {
    return '';
  }

  return `
    <div class="detail-section">
      <h3 class="detail-section-title">
        <i class="fas fa-quote-left"></i> Example Sentences
      </h3>
      <div class="example-list">
        ${word.examples.map((ex, index) => `
          <div class="example-item">
            <div class="example-level">${ex.level}</div>
            <div class="example-en">${ex.en}</div>
            <div class="example-vi" id="example-vi-${index}">${ex.vi}</div>
            <span class="example-toggle" onclick="toggleExample(${index})">
              Show translation
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateMistakesSection(word) {
  if (!word.commonMistakes || word.commonMistakes.length === 0) {
    return '';
  }

  return `
    <div class="detail-section">
      <h3 class="detail-section-title">
        <i class="fas fa-exclamation-triangle"></i> Common Mistakes
      </h3>
      <div class="common-mistakes">
        ${word.commonMistakes.map(mistake => `
          <div class="mistake-item">
            <div class="mistake-wrong">
              <i class="fas fa-times"></i> ${mistake.wrong}
            </div>
            <div class="mistake-correct">
              <i class="fas fa-check"></i> ${mistake.correct}
            </div>
            <div class="mistake-explanation">
              ${mistake.explanation}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateSynonymsSection(word) {
  if (!word.synonyms || word.synonyms.length === 0) {
    return '';
  }

  return `
    <div class="detail-section">
      <h3 class="detail-section-title">
        <i class="fas fa-equals"></i> Synonyms
      </h3>
      <div class="synonyms-tags">
        ${word.synonyms.map(syn => 
          `<span class="synonym-tag">${syn}</span>`
        ).join('')}
      </div>
    </div>
  `;
}

function generateCollocationsSection(word) {
  if (!word.collocations || word.collocations.length === 0) {
    return '';
  }

  // Group collocations by type
  const grouped = {};
  word.collocations.forEach(col => {
    if (!grouped[col.type]) {
      grouped[col.type] = [];
    }
    grouped[col.type].push(col);
  });

  return `
    <div class="detail-section">
      <h3 class="detail-section-title">
        <i class="fas fa-link"></i> Collocations
      </h3>
      ${Object.entries(grouped).map(([type, colls]) => `
        <div class="collocations-group">
          <div class="collocation-type-title">${type}</div>
          <div class="collocation-list">
            ${colls.map((col, index) => `
              <div class="collocation-item" onclick="toggleCollocation(this)">
                <span class="collocation-expression">${col.expression}</span>
                <i class="fas fa-chevron-down"></i>
                <div class="collocation-example" data-col-index="${index}">
                  ${col.example}
                  ${col.exampleVi ? `<br><em>${col.exampleVi}</em>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ============================================
// DETAIL INTERACTION FUNCTIONS
// ============================================

function setupDetailListeners() {
  // These are now mostly handled by onclick in HTML for simplicity
}

function toggleReveal(btn) {
  const revealedText = btn.nextElementSibling;
  if (revealedText.classList.contains('visible')) {
    revealedText.classList.remove('visible');
    btn.textContent = 'Show';
  } else {
    revealedText.classList.add('visible');
    btn.textContent = 'Hide';
  }
}

function toggleExample(index) {
  const exampleVi = document.getElementById(`example-vi-${index}`);
  const toggle = event.target;
  
  if (exampleVi.classList.contains('visible')) {
    exampleVi.classList.remove('visible');
    toggle.textContent = 'Show translation';
  } else {
    exampleVi.classList.add('visible');
    toggle.textContent = 'Hide translation';
  }
}

function toggleCollocation(element) {
  const example = element.querySelector('.collocation-example');
  const icon = element.querySelector('i');
  
  if (example.classList.contains('visible')) {
    example.classList.remove('visible');
    icon.style.transform = 'rotate(0deg)';
  } else {
    example.classList.add('visible');
    icon.style.transform = 'rotate(180deg)';
  }
}
