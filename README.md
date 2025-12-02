# English Learning App 📚

A beautiful, elegant English vocabulary learning application built with HTML, CSS, and JavaScript. Features a modern pastel design with progressive disclosure UX principles.

## ✨ Features

### 🎯 Core Functionality

- **Journey Mode**: Learn vocabulary through curated topics (A1-C1 levels)
- **My Words**: Personal vocabulary collection with custom categories
- **Detailed Word Information**: Comprehensive word details with progressive disclosure
- **Audio Pronunciation**: US and UK pronunciation support (using Web Speech API)
- **Progress Tracking**: Visual progress bars for each topic

### 📖 Word Information Includes

- English word with IPA phonetic transcription
- Word type (verb, noun, adjective, adverb)
- Grammatical forms:
  - **Verbs**: V1-V2-V3 forms, V-ing (irregular verbs highlighted)
  - **Nouns**: Plural forms, countable/uncountable markers
  - **Adjectives**: Common preposition collocations
- Vietnamese meaning (hidden by default - tap to reveal)
- Vietnamese description (always visible)
- 3 example sentences (beginner to advanced)
- Common mistakes with explanations
- Synonyms
- Collocations grouped by type (Verb+Noun, Adj+Noun, etc.)

### 🎨 Design Features

- **Elegant Pastel Color Scheme**: Soft, sophisticated colors
- **Separate Color File**: Easy to customize (colors.css)
- **Responsive Mobile-First Design**: Optimized for mobile devices
- **Smooth Animations**: Fade-ins, scale effects, progress animations
- **Bottom Sheet UI**: Modern mobile interaction pattern
- **Progressive Disclosure**: Information revealed on demand

## 📁 Project Structure

```
english_app/
├── index.html          # Main HTML structure
├── colors.css          # Centralized color palette and theme variables
├── styles.css          # All styling and layouts
├── data.js             # Sample vocabulary and topics data
├── app.js              # All JavaScript functionality
└── README.md           # This file
```

## 🚀 Getting Started

1. **Clone or download** the project files
2. **Open `index.html`** in a modern web browser
3. **Start learning!**

No build process or dependencies required - just pure HTML, CSS, and JavaScript.

## 🎨 Customizing Colors

All colors are defined in `colors.css` using CSS custom properties. You can easily customize the entire color scheme:

```css
:root {
  --primary-soft-blue: #a8d8ea;
  --primary-soft-pink: #ffd5e5;
  --primary-soft-purple: #d4c5f9;
  /* ... more colors */
}
```

## 📱 Features by Screen

### Journey Screen

- Filter topics by level (Beginner, Intermediate, Advanced)
- View progress for each topic
- Click any topic to view its vocabulary list

### Word List Screen

- Search words within a topic
- View basic word info (word, IPA, audio buttons)
- Tap to reveal Vietnamese meaning
- Click expand button for full word details

### My Words Screen

- Add custom vocabulary with the FAB button
- Organize words by category (Work, IELTS, Custom)
- Same detailed word view as Journey mode

### Word Detail (Bottom Sheet)

- Complete word information
- Toggle to show/hide Vietnamese translations
- Tap collocations to view examples
- Audio playback for pronunciations

## 🎯 UI/UX Principles Applied

1. **Progressive Disclosure**: Information revealed gradually as needed
2. **Vietnamese Meaning Strategy**: Description always visible, exact translation hidden to encourage thinking in English
3. **Mobile-First**: Optimized for touch interactions
4. **Visual Hierarchy**: Clear information structure with consistent spacing
5. **Feedback**: Visual and audio feedback for all interactions
6. **Accessibility**: High contrast ratios, clear typography

## 🔧 Technical Details

### Technologies Used

- Pure HTML5
- CSS3 with custom properties (CSS variables)
- Vanilla JavaScript (ES6+)
- Web Speech API (for text-to-speech)
- Font Awesome icons

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- Web Speech API support for audio features

## 📝 Data Structure

### Topics

```javascript
{
  id: 1,
  name: "Daily Routine",
  icon: "☀️",
  level: "A1-A2",
  totalWords: 50,
  learnedWords: 20,
  category: "beginner"
}
```

### Vocabulary

```javascript
{
  id: 1,
  english: "go",
  ipa: "/ɡoʊ/",
  type: "verb",
  vietnameseMeaning: "đi, rời đi",
  vietnameseDescription: "Hành động di chuyển...",
  irregular: { v1: "go", v2: "went", v3: "gone", ving: "going" },
  examples: [...],
  commonMistakes: [...],
  synonyms: [...],
  collocations: [...],
  status: "learning"
}
```

## 🎓 Future Enhancements

- [ ] Spaced repetition algorithm
- [ ] Flashcard review mode
- [ ] Grammar lessons section
- [ ] Reading comprehension section
- [ ] User authentication & cloud sync
- [ ] Offline support with Service Workers
- [ ] Export/Import vocabulary lists
- [ ] Statistics and learning analytics
- [ ] Dark mode toggle
- [ ] Multiple language support

## 📄 License

This project is free to use for educational purposes.

## 👥 Contributing

Feel free to fork this project and customize it for your needs. Suggestions and improvements are welcome!

## 🙏 Acknowledgments

- Font Awesome for icons
- Web Speech API for pronunciation
- Inspired by modern language learning apps like Duolingo, Memrise, and Anki

---

**Happy Learning! 🎉**
