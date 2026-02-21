// ENDLE - Game Logic

const Game = {
  currentMode: null,
  dailyAnswer: null,
  guesses: [],
  maxGuesses: 8,
  wrongAttempts: 0, // Для emoji game

  // Seeded random for daily consistency
  getDailySeed() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  },

  seededRandom(seed, max) {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
  },

  getDailyOperator() {
    const seed = this.getDailySeed();
    const idx = this.seededRandom(seed, GAME_DATA.operators.length);
    return GAME_DATA.operators[idx];
  },



  getDailyEmojiCharacter() {
    const characters = getEmojiCharacters();
    if (characters.length === 0) return null;
    const seed = this.getDailySeed();
    const idx = this.seededRandom(seed, characters.length);
    return characters[idx];
  },

  normalize(str) {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  },

  findOperator(name) {
    const normalized = this.normalize(name);
    return GAME_DATA.operators.find(op => 
      this.normalize(op.name) === normalized || 
      (op.nameRu && this.normalize(op.nameRu) === normalized)
    );
  },

  findEmojiCharacter(name) {
    const normalized = this.normalize(name);
    const characters = getEmojiCharacters();
    return characters.find(char => 
      this.normalize(char.name) === normalized || 
      (char.nameRu && this.normalize(char.nameRu) === normalized)
    );
  },

  getDisplayName(operator, lang) {
    if (lang === 'ru' && operator.nameRu) {
      return operator.nameRu;
    }
    return operator.name;
  },

  checkOperatorGuess(guess) {
    const found = this.findOperator(guess);
    if (!found) return { valid: false };

    const answer = this.dailyAnswer;
    const result = {
      valid: true,
      correct: found.name === answer.name,
      data: found,
      hints: {
        class: found.class === answer.class ? 'correct' : 'wrong',
        weapon: found.weapon === answer.weapon ? 'correct' : 'wrong',
        element: found.element === answer.element ? 'correct' : 'wrong',
        rarity: found.rarity === answer.rarity ? 'correct' : (found.rarity > answer.rarity ? 'lower' : 'higher'),
      },
    };
    return result;
  },



  getOperatorSuggestions(partial, lang) {
    if (!partial || partial.length < 1) return [];
    const norm = this.normalize(partial);
    
    const matches = GAME_DATA.operators.filter(op => {
      const nameMatch = this.normalize(op.name).includes(norm);
      const nameRuMatch = op.nameRu && this.normalize(op.nameRu).includes(norm);
      return nameMatch || nameRuMatch;
    });
    
    const startsWith = matches.filter(op => {
      const nameStarts = this.normalize(op.name).startsWith(norm);
      const nameRuStarts = op.nameRu && this.normalize(op.nameRu).startsWith(norm);
      return nameStarts || nameRuStarts;
    });
    
    const contains = matches.filter(op => {
      const nameStarts = this.normalize(op.name).startsWith(norm);
      const nameRuStarts = op.nameRu && this.normalize(op.nameRu).startsWith(norm);
      return !nameStarts && !nameRuStarts;
    });
    
    return [...startsWith, ...contains].slice(0, 8);
  },



  getEmojiCharacterSuggestions(partial, lang) {
    if (!partial || partial.length < 1) return [];
    const characters = getEmojiCharacters();
    const norm = this.normalize(partial);
    
    const matches = characters.filter(c => {
      const nameMatch = this.normalize(c.name).includes(norm);
      const nameRuMatch = c.nameRu && this.normalize(c.nameRu).includes(norm);
      return nameMatch || nameRuMatch;
    });
    
    const startsWith = matches.filter(c => {
      const nameStarts = this.normalize(c.name).startsWith(norm);
      const nameRuStarts = c.nameRu && this.normalize(c.nameRu).startsWith(norm);
      return nameStarts || nameRuStarts;
    });
    
    const contains = matches.filter(c => {
      const nameStarts = this.normalize(c.name).startsWith(norm);
      const nameRuStarts = c.nameRu && this.normalize(c.nameRu).startsWith(norm);
      return !nameStarts && !nameRuStarts;
    });
    
    return [...startsWith, ...contains].slice(0, 8);
  },

  saveProgress(mode, answer, guesses, won) {
    const key = `endle_${mode}_${this.getDateKey()}`;
    const data = {
      answer: typeof answer === 'object' ? answer.name : answer,
      guesses,
      won,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));

    // Archive
    const archiveKey = 'endle_archive';
    let archive = JSON.parse(localStorage.getItem(archiveKey) || '{}');
    if (!archive[mode]) archive[mode] = [];
    const id = typeof answer === 'object' ? answer.name : answer;
    if (!archive[mode].includes(id)) {
      archive[mode].push(id);
    }
    localStorage.setItem(archiveKey, JSON.stringify(archive));
  },

  getDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  getArchive() {
    const archive = JSON.parse(localStorage.getItem('endle_archive') || '{}');
    return archive;
  },

  // Progressive hints (one at a time)
  getOperatorHints(lang) {
    const a = this.dailyAnswer;
    const displayName = this.getDisplayName(a, lang);
    return [
      { labelKey: 'hintFirstLetter', value: displayName.charAt(0).toUpperCase() },
      { labelKey: 'hintClass', value: a.class },
      { labelKey: 'hintRarity', value: `${a.rarity}★` },
      { labelKey: 'hintWeapon', value: a.weapon },
      { labelKey: 'hintElement', value: a.element },
    ];
  },


};
