// Emoji Characters Database for Guessing Game
// У каждого персонажа 4 эмодзи, которые открываются постепенно

const EMOJI_CHARACTERS = [
  {
    name: "Ardelia",
    nameRu: "Арделия",
    hint: "Supporter с Nature элементом",
    emojis: ["🌿", "🎀", "🗺️", "🐑"]
  },
  {
    name: "Endministrator",
    nameRu: "Эндминистратор",
    hint: "Guard с Physical элементом",
    emojis: ["⚔️", "👸", "🛡️", "💥"]
  },
  {
    name: "Ember",
    nameRu: "Эмбер",
    hint: "Defender с Heat элементом",
    emojis: ["🛡️", "🔴", "🔥", "🍒"]
  },
  {
    name: "Gilberta",
    nameRu: "Гильберта",
    hint: "Supporter с Nature элементом",
    emojis: ["🌿", "💫", "🍃", "✨"]
  },
  {
    name: "Laevatain",
    nameRu: "Леватейн",
    hint: "Striker с Heat элементом",
    emojis: ["🗡️", "🔥", "⚡", "💥"]
  },
  {
    name: "Lifeng",
    nameRu: "Лифэн",
    hint: "Guard с Polearm",
    emojis: ["🔱", "⚔️", "🐉", "💪"]
  },
  {
    name: "Last Rite",
    nameRu: "Панихида",
    hint: "Striker с Cryo элементом",
    emojis: ["❄️", "⚔️", "🌨️", "💎"]
  },
  {
    name: "Pogranichnik",
    nameRu: "Пограничник",
    hint: "Vanguard с Physical элементом",
    emojis: ["🗡️", "❄️", "🛡️", "⚡"]
  },
  {
    name: "Yvonne",
    nameRu: "Ивонн",
    hint: "Caster с Cryo элементом",
    emojis: ["🔫", "❄️", "🌨️", "💙"]
  },
  {
    name: "Arclight",
    nameRu: "Арклайт",
    hint: "Vanguard с Electric элементом",
    emojis: ["⚡", "🏃", "🏍️", "🌠"]
  },
  {
    name: "Avywenna",
    nameRu: "Авивенна",
    hint: "Striker с Polearm",
    emojis: ["😏", "🐰", "🛡️", "⚡️"]
  },
  {
    name: "Chen Qianyu",
    nameRu: "Чэнь Цяньюй",
    hint: "Guard с Sword",
    emojis: ["😆", "⚔️", "⛩", "🐉"]
  },
  {
    name: "Da Pan",
    nameRu: "Да Пань",
    hint: "Striker с Great Sword",
    emojis: ["🚕", "🥢", "🍜", "🐼"]
  },
  {
    name: "Perlica",
    nameRu: "Перлика",
    hint: "Caster с Orbiters",
    emojis: ["🌀", "⚡", "💫", "💜"]
  },
  {
    name: "Snowshine",
    nameRu: "Сноушайн",
    hint: "Defender с Cryo",
    emojis: ["🛡️", "❄️", "🌨️", "💙"]
  },
  {
    name: "Wulfgard",
    nameRu: "Вульфгард",
    hint: "Caster с Guns",
    emojis: ["🔫", "👃", "😐", "🐺"]
  },
  {
    name: "Xaihi",
    nameRu: "Сайхи",
    hint: "Supporter с Orbiters",
    emojis: ["🌀", "❄️", "💫", "💙"]
  },
  {
    name: "Akekuri",
    nameRu: "Акекури",
    hint: "Vanguard с Heat",
    emojis: ["🔴", "💼", "😆", "🐕"]
  },
  {
    name: "Antal",
    nameRu: "Антал",
    hint: "Supporter с Electric",
    emojis: ["⚡", "🥢", "🦴", "🐉"]
  },
  {
    name: "Catcher",
    nameRu: "Кэтчер",
    hint: "Defender с Physical",
    emojis: [" 🔵", "🛡️", "🗡️", "🐕"]
  },
  {
    name: "Fluorite",
    nameRu: "Флюорит",
    hint: "Caster с Nature",
    emojis: ["🔫", "🌿", "💚", "✨"]
  },
  {
    name: "Estella",
    nameRu: "Эстелла",
    hint: "Guard с Polearm",
    emojis: ["🔱", "❄️", "⭐", "💙"]
  },
  {
    name: "Alesh",
    nameRu: "Алеш",
    hint: "Vanguard с Cryo",
    emojis: ["🕶️", "📕", "🐟", "🦝"]
  }
];

// Функция для получения всех персонажей
function getEmojiCharacters() {
  return EMOJI_CHARACTERS;
}

// Функция для получения daily персонажа
function getDailyEmojiCharacterFromPool() {
  if (EMOJI_CHARACTERS.length === 0) return null;
  
  // Используем seed для выбора персонажа
  const dateStr = new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const seed = Math.abs(hash);
  const x = Math.sin(seed) * 10000;
  const idx = Math.floor((x - Math.floor(x)) * EMOJI_CHARACTERS.length);
  
  return EMOJI_CHARACTERS[idx];
}

// Функция для получения эмодзи в зависимости от количества попыток
function getVisibleEmojis(character, wrongAttempts) {
  if (!character || !character.emojis) return "";
  
  // Показываем от 1 до 4 эмодзи в зависимости от неправильных попыток
  const visibleCount = Math.min(wrongAttempts + 1, 4);
  return character.emojis.slice(0, visibleCount).join(" ");
}
