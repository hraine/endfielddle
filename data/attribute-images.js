// Arknights Endfield attribute images from endfield.wiki.gg

const ATTRIBUTE_IMAGES = {
  // Classes
  classes: {
    "Guard": "https://endfield.wiki.gg/images/thumb/Guard.png/22px-Guard.png?14fa52",
    "Defender": "https://endfield.wiki.gg/images/thumb/Defender.png/22px-Defender.png?10bb03",
    "Vanguard": "https://endfield.wiki.gg/images/thumb/Vanguard.png/22px-Vanguard.png?ce78e3",
    "Striker": "https://endfield.wiki.gg/images/thumb/Striker.png/22px-Striker.png?267717",
    "Caster": "https://endfield.wiki.gg/images/thumb/Caster.png/22px-Caster.png?342ed9",
    "Supporter": "https://endfield.wiki.gg/images/thumb/Support.png/22px-Support.png?26d8eb"
  },
  
  // Weapons
  weapons: {
    "Sword": "https://endfield.wiki.gg/images/thumb/Sword.png/36px-Sword.png?8f4703",
    "Great Sword": "https://endfield.wiki.gg/images/thumb/Great_Sword.png/36px-Great_Sword.png?acdac8",
    "Polearm": "https://endfield.wiki.gg/images/thumb/Polearm.png/36px-Polearm.png?55fe3e",
    "Guns": "https://endfield.wiki.gg/images/thumb/Handcannon.png/36px-Handcannon.png?8ee8fc",
    "Arts Unit": "https://endfield.wiki.gg/images/thumb/Arts_Unit.png/36px-Arts_Unit.png?a9179b"
  },
  
  // Elements
  elements: {
    "Physical": "https://endfield.wiki.gg/images/thumb/Physical.png/22px-Physical.png?c4b390",
    "Heat": "https://endfield.wiki.gg/images/thumb/Heat.png/22px-Heat.png?e9026c",
    "Cryo": "https://endfield.wiki.gg/images/thumb/Cryo.png/22px-Cryo.png?c1cf2b",
    "Electric": "https://endfield.wiki.gg/images/thumb/Electric.png/22px-Electric.png?cf9565",
    "Nature": "https://endfield.wiki.gg/images/thumb/Nature.png/22px-Nature.png?baac89"
  },
  
  // Rarity stars
  rarity: {
    4: "★★★★",
    5: "★★★★★",
    6: "★★★★★★"
  }
};

function getClassImage(className) {
  return ATTRIBUTE_IMAGES.classes[className] || null;
}

function getWeaponImage(weaponName) {
  return ATTRIBUTE_IMAGES.weapons[weaponName] || null;
}

function getElementImage(elementName) {
  return ATTRIBUTE_IMAGES.elements[elementName] || null;
}

function getRarityImage(rarity) {
  return ATTRIBUTE_IMAGES.rarity[rarity] || null;
}
