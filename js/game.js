// ENDLE - Game Logic

const Game = {
  currentMode: null,
  dailyAnswer: null,
  guesses: [],
  maxGuesses: 8,
  hardMode: true,

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

  getDailyWeapon() {
    const seed = this.getDailySeed();
    const idx = this.seededRandom(seed, GAME_DATA.weapons.length);
    return GAME_DATA.weapons[idx];
  },

  normalize(str) {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  },

  findOperator(name) {
    const normalized = this.normalize(name);
    return GAME_DATA.operators.find(op => this.normalize(op.name) === normalized);
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

  checkWeaponGuess(guess) {
    const normalized = this.normalize(guess);
    const found = GAME_DATA.weapons.find(w => this.normalize(w) === normalized);
    if (!found) return { valid: false };

    return {
      valid: true,
      correct: found === this.dailyAnswer,
      data: found,
    };
  },

  getOperatorSuggestions(partial) {
    if (!partial || partial.length < 1) return [];
    const norm = this.normalize(partial);
    const startsWith = GAME_DATA.operators.filter(op => this.normalize(op.name).startsWith(norm));
    const contains = GAME_DATA.operators.filter(op => this.normalize(op.name).includes(norm) && !this.normalize(op.name).startsWith(norm));
    return [...startsWith, ...contains].map(op => op.name).slice(0, 8);
  },

  getWeaponSuggestions(partial) {
    if (!partial || partial.length < 1) return [];
    const norm = this.normalize(partial);
    const startsWith = GAME_DATA.weapons.filter(w => this.normalize(w).startsWith(norm));
    const contains = GAME_DATA.weapons.filter(w => this.normalize(w).includes(norm) && !this.normalize(w).startsWith(norm));
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
  getOperatorHints() {
    const a = this.dailyAnswer;
    return [
      { labelKey: 'hintFirstLetter', value: a.name.charAt(0).toUpperCase() },
      { labelKey: 'hintClass', value: a.class },
      { labelKey: 'hintRarity', value: `${a.rarity}★` },
      { labelKey: 'hintWeapon', value: a.weapon },
      { labelKey: 'hintElement', value: a.element },
    ];
  },

  getWeaponHints() {
    const a = this.dailyAnswer;
    return [
      { labelKey: 'hintFirstLetter', value: a.charAt(0).toUpperCase() },
      { labelKey: 'hintLength', value: `${a.length} letters` },
    ];
  },
};
