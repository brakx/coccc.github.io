// ======================================================
// /js/data/skills.js
// ESM module: exports skillCategories only
// ======================================================

export const skillCategories = {
  Social: [
    { name: "Charm", base: 15 },
    { name: "Fast Talk", base: 5 },
    { name: "Intimidate", base: 15 },
    { name: "Persuade", base: 10 },
    { name: "Credit Rating", base: 0 }
  ],

  Physical: [
    {
      name: "Fighting",
      base: 25,
      multi: true,
      specializations: [
        "Brawl",
        "Knife",
        "Spear",
        "Sword",
        "Whip",
        "Chainsaw"
      ]
    },

    { name: "Dodge", base: 0 },
    { name: "Stealth", base: 20 },
    { name: "Climb", base: 20 },
    { name: "Drive Auto", base: 20 },

    {
      name: "Firearms",
      base: 20,
      multi: true,
      specializations: [
        "Handgun",
        "Rifle/Shotgun",
        "SMG",
        "Bow",
        "Flamethrower"
      ]
    },

    { name: "Throw", base: 20 }
  ],

  Education: [
    { name: "Accounting", base: 5 },
    { name: "Appraise", base: 5 },
    { name: "History", base: 5 },
    { name: "Law", base: 5 },
    { name: "Library Use", base: 20 },
    { name: "Medicine", base: 1 },
    { name: "Occult", base: 5 },
    { name: "Psychology", base: 10 },
    { name: "Biology", base: 1 },
    { name: "Language (Other)", base: 1 }
  ]
};