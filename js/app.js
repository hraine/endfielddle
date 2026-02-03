// ENDLE - App Logic

let currentLang = localStorage.getItem('endle_lang') || 'en';

function applyTranslations() {
  const t = LANG[currentLang] || LANG.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) el.placeholder = t[key];
  });
  document.title = `${t.title || 'ENDLE'} — Daily Arknights Endfield`;
}

const API = {
  namespace: 'endle',
  getDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
  async getPlayerCount() {
    try {
      const res = await fetch(`https://api.countapi.xyz/get/${this.namespace}/daily-${this.getDateKey()}`);
      const data = await res.json();
      if (data.value !== undefined) return data.value;
      return 0;
    } catch {
      return null;
    }
  },
  async incrementPlayerCount() {
    const key = `endle_reported_${this.getDateKey()}`;
    if (localStorage.getItem(key)) return null; // Already reported today
    try {
      const res = await fetch(`https://api.countapi.xyz/hit/${this.namespace}/daily-${this.getDateKey()}`);
      const data = await res.json();
      localStorage.setItem(key, '1');
      return data.value ?? null;
    } catch {
      return null;
    }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const mainMenu = document.getElementById('main-menu');
  const gameScreen = document.getElementById('game-screen');
  const archiveScreen = document.getElementById('archive-screen');
  const settingsModal = document.getElementById('settings-modal');

  // Navigation
  document.querySelectorAll('.gamemode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === 'archive') {
        mainMenu.classList.remove('active');
        archiveScreen.classList.add('active');
        renderArchive();
      } else {
        startGame(mode);
      }
    });
  });

  document.getElementById('back-btn').addEventListener('click', () => showMainMenu());
  document.getElementById('archive-back-btn').addEventListener('click', () => showMainMenu());
  document.getElementById('game-settings-btn')?.addEventListener('click', () => openSettings());

  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('modal-close').addEventListener('click', closeSettings);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettings();
  });

  document.getElementById('hard-mode').addEventListener('change', (e) => {
    Game.hardMode = e.target.checked;
  });

  const langSelect = document.getElementById('language-select');
  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => {
      currentLang = e.target.value;
      localStorage.setItem('endle_lang', currentLang);
      applyTranslations();
      updateMainMenuDate();
      if (document.getElementById('archive-grid').innerHTML) renderArchive();
    });
  }

  applyTranslations();

  function updateMainMenuDate() {
    const dateKey = Game.getDateKey();
    const [y, m, d] = dateKey.split('-');
    const dateObj = new Date(y, m - 1, d);
    const locale = currentLang === 'ru' ? 'ru-RU' : 'en-US';
    document.getElementById('main-daily-date').textContent =
      dateObj.toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  }
  updateMainMenuDate();

  function showMainMenu() {
    gameScreen.classList.remove('active');
    archiveScreen.classList.remove('active');
    mainMenu.classList.add('active');
  }

  async function updatePlayerCount() {
    const numEl = document.getElementById('player-count-num');
    numEl.textContent = '…';
    const count = await API.getPlayerCount();
    numEl.textContent = count !== null ? count.toLocaleString() : '—';
  }

  function openSettings() {
    settingsModal.classList.remove('hidden');
  }

  function closeSettings() {
    settingsModal.classList.add('hidden');
  }

  function startGame(mode) {
    Game.currentMode = mode;
    Game.guesses = [];

    mainMenu.classList.remove('active');
    gameScreen.classList.add('active');

    document.querySelectorAll('.game-panel').forEach(p => p.classList.add('hidden'));
    const panel = document.getElementById(`${mode}-game`);
    if (panel) panel.classList.remove('hidden');

    const modeNames = { operators: 'operators', weapons: 'weapons' };
    const t = LANG[currentLang] || LANG.en;
    document.getElementById('game-title').textContent = t[modeNames[mode]] || mode.charAt(0).toUpperCase() + mode.slice(1);

    // Daily date (seed)
    const dateEl = document.getElementById('daily-date');
    const dateKey = Game.getDateKey();
    const [y, m, d] = dateKey.split('-');
    const dateObj = new Date(y, m - 1, d);
    const locale = currentLang === 'ru' ? 'ru-RU' : 'en-US';
    dateEl.textContent = dateObj.toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    // Player count
    updatePlayerCount();

    switch (mode) {
      case 'operators':
        Game.dailyAnswer = Game.getDailyOperator();
        initOperatorsGame();
        break;
      case 'weapons':
        Game.dailyAnswer = Game.getDailyWeapon();
        initWeaponsGame();
        break;
    }
  }

  // Operators Game
  function initOperatorsGame() {
    const hintsEl = document.getElementById('operator-hints');
    const revealedEl = document.getElementById('operator-revealed-hints');
    const resultEl = document.getElementById('operator-result');
    const input = document.getElementById('operator-input');
    const guessBtn = document.getElementById('operator-guess-btn');
    const hintBtn = document.getElementById('operator-hint-btn');
    const autocompleteEl = document.getElementById('operator-autocomplete');

    hintsEl.innerHTML = '';
    revealedEl.innerHTML = '';
    resultEl.classList.add('hidden');
    input.value = '';
    input.disabled = false;
    guessBtn.disabled = false;
    hintBtn.disabled = false;
    Game.hintIndex = 0;

    // Autocomplete
    let selectedIdx = -1;
    function showAutocomplete() {
      const val = input.value.trim();
      const suggestions = Game.getOperatorSuggestions(val);
      if (suggestions.length === 0) {
        autocompleteEl.classList.add('hidden');
        return;
      }
      const getImg = (name) => typeof getOperatorImageUrl === 'function' ? getOperatorImageUrl(name) : null;
      autocompleteEl.innerHTML = suggestions.map((name, i) => {
        const img = getImg(name);
        const imgHtml = img ? `<img class="autocomplete-portrait" src="${img}" alt="" loading="lazy" onerror="this.style.display='none'">` : '';
        return `<div class="autocomplete-item ${i === selectedIdx ? 'selected' : ''}" data-name="${name}">${imgHtml}<span>${name}</span></div>`;
      }).join('');
      autocompleteEl.classList.remove('hidden');
      autocompleteEl.querySelectorAll('.autocomplete-item').forEach((el, i) => {
        el.onclick = () => { input.value = el.dataset.name; hideAutocomplete(); doGuess(); };
      });
    }
    function hideAutocomplete() {
      autocompleteEl.classList.add('hidden');
      autocompleteEl.innerHTML = '';
      selectedIdx = -1;
    }

    hintBtn.onclick = () => {
      const hints = Game.getOperatorHints();
      if (Game.hintIndex >= hints.length) return;
      const h = hints[Game.hintIndex++];
      const t = LANG[currentLang] || LANG.en;
      const label = t[h.labelKey] || h.labelKey;
      const div = document.createElement('div');
      div.className = 'revealed-hint';
      div.textContent = `${label}: ${h.value}`;
      revealedEl.appendChild(div);
      if (Game.hintIndex >= hints.length) hintBtn.disabled = true;
    };

    const doGuess = () => {
      const guess = input.value.trim();
      if (!guess) return;

      const result = Game.checkOperatorGuess(guess);
      if (!result.valid) {
        alert((LANG[currentLang] || LANG.en).unknownOperator || 'Unknown operator. Try another name!');
        return;
      }

      Game.guesses.push(result);
      renderOperatorHint(result);
      hideAutocomplete();

      if (result.correct) {
        endGame(true, Game.dailyAnswer.name, 'operators');
        return;
      }

      if (Game.guesses.length >= Game.maxGuesses) {
        endGame(false, Game.dailyAnswer.name, 'operators');
        return;
      }

      input.value = '';
      input.focus();
    };

    guessBtn.onclick = doGuess;
    input.oninput = () => { selectedIdx = -1; showAutocomplete(); };
    input.onfocus = () => { if (input.value.trim()) showAutocomplete(); };
    input.onblur = () => setTimeout(hideAutocomplete, 150);
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (autocompleteEl.classList.contains('hidden') || selectedIdx < 0) doGuess();
        else {
          const item = autocompleteEl.querySelector(`.autocomplete-item:nth-child(${selectedIdx + 1})`);
          if (item) { input.value = item.dataset.name; hideAutocomplete(); doGuess(); }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const items = autocompleteEl.querySelectorAll('.autocomplete-item');
        if (items.length) { selectedIdx = (selectedIdx + 1) % items.length; showAutocomplete(); }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const items = autocompleteEl.querySelectorAll('.autocomplete-item');
        if (items.length) { selectedIdx = (selectedIdx - 1 + items.length) % items.length; showAutocomplete(); }
      } else if (e.key === 'Escape') hideAutocomplete();
    };
    setTimeout(() => { input.focus(); input.removeAttribute('readonly'); }, 100);
  }

  function renderOperatorHint(result) {
    const hintsEl = document.getElementById('operator-hints');
    const row = document.createElement('div');
    row.className = 'guess-row';

    const t = (k) => (LANG[currentLang] && LANG[currentLang][k]) || LANG.en[k] || k;
    const h = result.hints;
    const attrCard = (label, value, status, arrow, imgUrl, iconType, attrValue) => {
      let cardClass = 'attr-card';
      if (status === 'correct') cardClass += ' attr-correct';
      else if (status === 'wrong' || status === 'higher' || status === 'lower') cardClass += ' attr-wrong';
      else if (status === 'neutral') cardClass += ' attr-neutral';
      if (imgUrl && !iconType) cardClass += ' attr-with-portrait';
      
      let arrowHtml = '';
      if (arrow === 'up') arrowHtml = '<span class="attr-arrow">↑</span>';
      else if (arrow === 'down') arrowHtml = '<span class="attr-arrow">↓</span>';
      
      const portraitHtml = (imgUrl && !iconType) ? `<img class="attr-portrait" src="${imgUrl}" alt="${value}" loading="lazy" onerror="this.style.display='none'">` : '';
      
      let iconHtml = '';
      if (iconType && attrValue) {
        const attrImg = getAttributeImage(iconType, attrValue);
        if (attrImg) {
          iconHtml = `<img class="attr-image" src="${attrImg}" alt="${value}" loading="lazy" onerror="this.style.opacity='0.3'">`;
        }
      }
      
      return `<div class="${cardClass}">${portraitHtml}${iconHtml}<span class="attr-label">${label}</span><span class="attr-value">${value}</span>${arrowHtml}</div>`;
    };

    const getAttributeImage = (type, value) => {
      if (typeof getClassImage === 'function' && type === 'class') return getClassImage(value);
      if (typeof getWeaponImage === 'function' && type === 'weapon') return getWeaponImage(value);
      if (typeof getElementImage === 'function' && type === 'element') return getElementImage(value);
      if (typeof getRarityImage === 'function' && type === 'rarity') return getRarityImage(parseInt(value));
      return null;
    };

    const rarityArrow = h.rarity === 'higher' ? 'up' : (h.rarity === 'lower' ? 'down' : '');
    const rarityStatus = h.rarity === 'correct' ? 'correct' : (h.rarity === 'higher' || h.rarity === 'lower' ? 'wrong' : 'correct');

    const opImg = typeof getOperatorImageUrl === 'function' ? getOperatorImageUrl(result.data.name) : null;
    let cardsHtml = attrCard(t('operator'), result.data.name, 'neutral', '', opImg, null, null);
    if (result.correct) {
      cardsHtml += attrCard(t('class'), result.data.class, 'correct', '', null, 'class', result.data.class);
      cardsHtml += attrCard(t('weapon'), result.data.weapon, 'correct', '', null, 'weapon', result.data.weapon);
      cardsHtml += attrCard(t('element'), result.data.element, 'correct', '', null, 'element', result.data.element);
      cardsHtml += attrCard(t('rarity'), result.data.rarity + '★', 'correct', '', null, 'rarity', result.data.rarity);
    } else {
      cardsHtml += attrCard(t('class'), result.data.class, h.class, '', null, 'class', result.data.class);
      cardsHtml += attrCard(t('weapon'), result.data.weapon, h.weapon, '', null, 'weapon', result.data.weapon);
      cardsHtml += attrCard(t('element'), result.data.element, h.element, '', null, 'element', result.data.element);
      cardsHtml += attrCard(t('rarity'), result.data.rarity + '★', rarityStatus, rarityArrow, null, 'rarity', result.data.rarity);
    }

    row.innerHTML = `<div class="guess-cards">${cardsHtml}</div>`;
    hintsEl.appendChild(row);
  }

  // Weapons Game
  function initWeaponsGame() {
    const hintsEl = document.getElementById('weapon-hints');
    const revealedEl = document.getElementById('weapon-revealed-hints');
    const resultEl = document.getElementById('weapon-result');
    const input = document.getElementById('weapon-input');
    const guessBtn = document.getElementById('weapon-guess-btn');
    const hintBtn = document.getElementById('weapon-hint-btn');
    const autocompleteEl = document.getElementById('weapon-autocomplete');

    hintsEl.innerHTML = '';
    revealedEl.innerHTML = '';
    resultEl.classList.add('hidden');
    input.value = '';
    input.disabled = false;
    guessBtn.disabled = false;
    hintBtn.disabled = false;
    Game.hintIndex = 0;

    let selectedIdx = -1;
    function showAutocomplete() {
      const val = input.value.trim();
      const suggestions = Game.getWeaponSuggestions(val);
      if (suggestions.length === 0) {
        autocompleteEl.classList.add('hidden');
        return;
      }
      autocompleteEl.innerHTML = suggestions.map((name, i) =>
        `<div class="autocomplete-item ${i === selectedIdx ? 'selected' : ''}" data-name="${name}">${name}</div>`
      ).join('');
      autocompleteEl.classList.remove('hidden');
      autocompleteEl.querySelectorAll('.autocomplete-item').forEach((el) => {
        el.onclick = () => { input.value = el.dataset.name; hideAutocomplete(); doGuess(); };
      });
    }
    function hideAutocomplete() {
      autocompleteEl.classList.add('hidden');
      autocompleteEl.innerHTML = '';
      selectedIdx = -1;
    }

    hintBtn.onclick = () => {
      const hints = Game.getWeaponHints();
      if (Game.hintIndex >= hints.length) return;
      const h = hints[Game.hintIndex++];
      const t = LANG[currentLang] || LANG.en;
      const label = t[h.labelKey] || h.labelKey;
      const div = document.createElement('div');
      div.className = 'revealed-hint';
      div.textContent = `${label}: ${h.value}`;
      revealedEl.appendChild(div);
      if (Game.hintIndex >= hints.length) hintBtn.disabled = true;
    };

    const doGuess = () => {
      const guess = input.value.trim();
      if (!guess) return;

      const result = Game.checkWeaponGuess(guess);
      if (!result.valid) {
        alert((LANG[currentLang] || LANG.en).unknownWeapon || 'Unknown weapon.');
        return;
      }

      Game.guesses.push(result);
      const row = document.createElement('div');
      row.className = 'guess-row';
      const cardClass = result.correct ? 'attr-card attr-correct' : 'attr-card attr-wrong';
      const t = LANG[currentLang] || LANG.en;
      row.innerHTML = `<div class="guess-cards"><div class="${cardClass}"><span class="attr-label">${t.weapon}</span><span class="attr-value">${result.data}</span></div></div>`;
      hintsEl.appendChild(row);
      hideAutocomplete();

      if (result.correct) {
        endGame(true, Game.dailyAnswer, 'weapons');
        return;
      }

      if (Game.guesses.length >= Game.maxGuesses) {
        endGame(false, Game.dailyAnswer, 'weapons');
        return;
      }

      input.value = '';
      input.focus();
    };

    guessBtn.onclick = doGuess;
    input.oninput = () => { selectedIdx = -1; showAutocomplete(); };
    input.onfocus = () => { if (input.value.trim()) showAutocomplete(); };
    input.onblur = () => setTimeout(hideAutocomplete, 150);
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (autocompleteEl.classList.contains('hidden') || selectedIdx < 0) doGuess();
        else {
          const item = autocompleteEl.querySelector(`.autocomplete-item:nth-child(${selectedIdx + 1})`);
          if (item) { input.value = item.dataset.name; hideAutocomplete(); doGuess(); }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const items = autocompleteEl.querySelectorAll('.autocomplete-item');
        if (items.length) { selectedIdx = (selectedIdx + 1) % items.length; showAutocomplete(); }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const items = autocompleteEl.querySelectorAll('.autocomplete-item');
        if (items.length) { selectedIdx = (selectedIdx - 1 + items.length) % items.length; showAutocomplete(); }
      } else if (e.key === 'Escape') hideAutocomplete();
    };
    setTimeout(() => {
      input.focus();
      input.removeAttribute('readonly');
    }, 100);
  }

  function endGame(won, answer, mode) {
    const suffixMap = { operators: 'operator', weapons: 'weapon' };
    const suffix = suffixMap[mode] || mode;
    const resultEl = document.getElementById(`${suffix}-result`);
    const input = document.querySelector(`#${suffix}-input`);
    const guessBtn = document.querySelector(`#${suffix}-guess-btn`);

    if (input) input.disabled = true;
    if (guessBtn) guessBtn.disabled = true;

    Game.saveProgress(mode, mode === 'operators' ? Game.dailyAnswer : answer, Game.guesses.length, won);

    if (won) {
      API.incrementPlayerCount().then(() => updatePlayerCount());
    }

    const t = LANG[currentLang] || LANG.en;
    resultEl.innerHTML = `
      <div class="result-title ${won ? 'win' : 'lose'}">${won ? t.correct : t.outOfGuesses}</div>
      <div class="result-answer">${t.todaysAnswer} ${answer}</div>
      <div class="result-stats">${t.guesses}: ${Game.guesses.length}${won ? '' : ` / ${Game.maxGuesses}`}</div>
    `;
    resultEl.className = `result-area ${won ? 'win' : 'lose'}`;
    resultEl.classList.remove('hidden');
  }

  // Archive
  function renderArchive() {
    const grid = document.getElementById('archive-grid');
    const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const archive = Game.getArchive();

    const items = [];
    if (filter === 'all' || filter === 'operators') {
      GAME_DATA.operators.forEach(op => {
        items.push({ ...op, category: 'operators', type: 'operator' });
      });
    }
    if (filter === 'all' || filter === 'weapons') {
      GAME_DATA.weapons.forEach(w => {
        items.push({ name: w, category: 'weapons', type: 'weapon' });
      });
    }

    grid.innerHTML = items.map(item => {
      const unlocked = archive[item.category]?.includes(item.name) || false;
      return `
        <div class="archive-item ${unlocked ? 'unlocked' : 'locked'}">
          ${item.name}
        </div>
      `;
    }).join('');
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderArchive();
    });
  });

  // More Games placeholder
  document.getElementById('more-games-btn').addEventListener('click', () => {
    alert('More games coming soon!');
  });
});
