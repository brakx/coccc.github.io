// ======================================================
// /js/ui/statsUI.js
// ESM module: UI for stats, derived stats, and age modifiers
// ======================================================

import {
  rollStatRaw,
  rollStatAverage,
  applyAgeModifiers,
  calcDerivedStats
} from "../data/stats.js";

import { skillState, updateSkillRow } from "./skillsUI.js";

// ------------------------------------------------------
// Roll all stats (raw or average mode)
// ------------------------------------------------------
export function rollStatsUI() {
  const mode = document.getElementById("statMode").value;
  const roller = mode === "average" ? rollStatAverage : rollStatRaw;

  const STR = roller("3d6x5");
  const CON = roller("3d6x5");
  const DEX = roller("3d6x5");
  const APP = roller("3d6x5");
  const POW = roller("3d6x5");
  const SIZ = roller("2d6p6x5");
  const INT = roller("2d6p6x5");
  const EDU = roller("3d6p3x5");

  document.getElementById("statSTR_raw").value = STR;
  document.getElementById("statCON_raw").value = CON;
  document.getElementById("statDEX_raw").value = DEX;
  document.getElementById("statAPP_raw").value = APP;
  document.getElementById("statPOW_raw").value = POW;
  document.getElementById("statSIZ_raw").value = SIZ;
  document.getElementById("statINT_raw").value = INT;
  document.getElementById("statEDU_raw").value = EDU;

  copyRawToModifiedUI();
  updateDodgeBaseUI();
}

// ------------------------------------------------------
// Copy raw stats → modified stats
// ------------------------------------------------------
export function copyRawToModifiedUI() {
  const fields = ["STR", "CON", "DEX", "APP", "POW", "SIZ", "INT", "EDU"];

  fields.forEach(stat => {
    const raw = +document.getElementById(`stat${stat}_raw`).value || 0;
    document.getElementById(`stat${stat}_mod`).value = raw;
  });

  updateDodgeBaseUI();
}

// ------------------------------------------------------
// Apply age modifiers (UI wrapper)
// ------------------------------------------------------
export function applyAgeModifiersUI() {
  const age = +document.getElementById("charAge").value || 0;

  const rawStats = {
    STR: +document.getElementById("statSTR_raw").value || 0,
    CON: +document.getElementById("statCON_raw").value || 0,
    DEX: +document.getElementById("statDEX_raw").value || 0,
    APP: +document.getElementById("statAPP_raw").value || 0,
    POW: +document.getElementById("statPOW_raw").value || 0,
    SIZ: +document.getElementById("statSIZ_raw").value || 0,
    INT: +document.getElementById("statINT_raw").value || 0,
    EDU: +document.getElementById("statEDU_raw").value || 0
  };

  const penalty = document.getElementById("agePenalty").value || "STR";
  const bonus = document.getElementById("ageBonus").value || "DEX";

  const mod = applyAgeModifiers(rawStats, age, penalty, bonus);

  // Write modified stats
  document.getElementById("statSTR_mod").value = mod.STR;
  document.getElementById("statCON_mod").value = mod.CON;
  document.getElementById("statDEX_mod").value = mod.DEX;
  document.getElementById("statAPP_mod").value = mod.APP;
  document.getElementById("statPOW_mod").value = mod.POW;
  document.getElementById("statSIZ_mod").value = mod.SIZ;
  document.getElementById("statINT_mod").value = mod.INT;
  document.getElementById("statEDU_mod").value = mod.EDU;

  updateDodgeBaseUI();
}

// ------------------------------------------------------
// Calculate derived stats (HP, MP, SAN, Luck, DB, Build, Move)
// ------------------------------------------------------
export function calcDerivedUI() {
  const modStats = {
    STR: +document.getElementById("statSTR_mod").value || 0,
    CON: +document.getElementById("statCON_mod").value || 0,
    DEX: +document.getElementById("statDEX_mod").value || 0,
    SIZ: +document.getElementById("statSIZ_mod").value || 0,
    POW: +document.getElementById("statPOW_mod").value || 0,
    EDU: +document.getElementById("statEDU_mod").value || 0
  };

  const derived = calcDerivedStats(modStats);

  document.getElementById("derivedHP").value = derived.HP;
  document.getElementById("derivedMP").value = derived.MP;
  document.getElementById("derivedSAN").value = derived.SAN;
  document.getElementById("derivedLuck").value = derived.Luck;
  document.getElementById("derivedDB").value = derived.DB;
  document.getElementById("derivedBuild").value = derived.Build;
  document.getElementById("derivedMove").value = derived.Move;

  updateDodgeBaseUI();
}

// ------------------------------------------------------
// Update Dodge base = DEX / 2
// ------------------------------------------------------
export function updateDodgeBaseUI() {
  const DEX_mod = +document.getElementById("statDEX_mod").value || 0;
  const DEX_raw = +document.getElementById("statDEX_raw").value || 0;
  const DEX = DEX_mod || DEX_raw;

  if (skillState["Dodge"]) {
    skillState["Dodge"].base = Math.floor(DEX / 2);

    const row = document.querySelector('.skill-row[data-skill-name="Dodge"]');
    if (row) {
      const inputs = row.querySelectorAll("input");
      inputs[0].value = skillState["Dodge"].base;
    }

    updateSkillRow("Dodge");
  }
}

// ------------------------------------------------------
// Show/hide age choice UI for teens
// ------------------------------------------------------
export function updateAgeChoiceVisibilityUI() {
  const age = +document.getElementById("charAge").value || 0;
  const container = document.getElementById("ageChoiceContainer");

  if (age >= 15 && age <= 19) {
    container.style.display = "grid";
  } else {
    container.style.display = "none";
  }
}