// ======================================================
// /js/data/stats.js
// ESM module: exports all stat + derived + age logic
// No DOM, no UI — pure logic
// ======================================================

// ------------------------------
// Dice utilities
// ------------------------------
export function d(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function roll3d6() {
  return d(6) + d(6) + d(6);
}

export function roll2d6p6() {
  return d(6) + d(6) + 6;
}

export function roll3d6p3() {
  return d(6) + d(6) + d(6) + 3;
}

// ------------------------------
// RAW stat generation
// ------------------------------
export function rollStatRaw(type) {
  switch (type) {
    case "3d6x5": return roll3d6() * 5;
    case "2d6p6x5": return roll2d6p6() * 5;
    case "3d6p3x5": return roll3d6p3() * 5;
    default: return 0;
  }
}

// ------------------------------
// Average stat generation
// ------------------------------
export function rollStatAverage(type) {
  let total = 0;

  switch (type) {
    case "3d6x5":
      for (let i = 0; i < 3; i++) total += roll3d6();
      return Math.floor(total / 3) * 5;

    case "2d6p6x5":
      for (let i = 0; i < 3; i++) total += roll2d6p6();
      return Math.floor(total / 3) * 5;

    case "3d6p3x5":
      for (let i = 0; i < 3; i++) total += roll3d6p3();
      return Math.floor(total / 3) * 5;

    default:
      return 0;
  }
}

// ------------------------------
// Derived stats
// ------------------------------
export function calcDerivedStats(modStats) {
  const STR = modStats.STR || 0;
  const CON = modStats.CON || 0;
  const DEX = modStats.DEX || 0;
  const SIZ = modStats.SIZ || 0;
  const POW = modStats.POW || 0;

  const HP = Math.floor((CON + SIZ) / 10);
  const MP = Math.floor(POW / 5);
  const SAN = POW;
  const Luck = roll3d6() * 5;

  // DB + Build
  const sum = STR + SIZ;
  let DB = "";
  let Build = 0;

  if (sum <= 64) { DB = "-2"; Build = -2; }
  else if (sum <= 84) { DB = "-1"; Build = -1; }
  else if (sum <= 124) { DB = "0"; Build = 0; }
  else if (sum <= 164) { DB = "+1d4"; Build = 1; }
  else { DB = "+1d6"; Build = 2; }

  // Movement
  let Move = 8;
  if (DEX < STR && STR < SIZ) Move = 7;
  if (DEX > STR && STR > SIZ) Move = 9;

  return { HP, MP, SAN, Luck, DB, Build, Move };
}

// ------------------------------
// Age modifiers (pure logic)
// ------------------------------
export function applyAgeModifiers(rawStats, age, penaltyChoice = "STR", bonusChoice = "DEX") {
  const mod = { ...rawStats };

  if (age >= 15 && age <= 19) {
    mod.EDU -= 5;

    if (penaltyChoice === "STR") mod.STR -= 5;
    else mod.SIZ -= 5;

    if (bonusChoice === "DEX") mod.DEX += 5;
    else mod.APP += 5;
  }

  else if (age >= 40 && age <= 49) {
    mod.STR -= 5;
    mod.CON -= 5;
    mod.DEX -= 5;
    mod.EDU += 5;
  }

  else if (age >= 50 && age <= 59) {
    mod.STR -= 10;
    mod.CON -= 10;
    mod.DEX -= 10;
    mod.EDU += 10;
  }

  else if (age >= 60 && age <= 69) {
    mod.STR -= 20;
    mod.CON -= 20;
    mod.DEX -= 20;
    mod.EDU += 20;
  }

  else if (age >= 70 && age <= 79) {
    mod.STR -= 40;
    mod.CON -= 40;
    mod.DEX -= 40;
    mod.EDU += 40;
  }

  else if (age >= 80) {
    mod.STR -= 80;
    mod.CON -= 80;
    mod.DEX -= 80;
    mod.EDU += 40;
  }

  return mod;
}