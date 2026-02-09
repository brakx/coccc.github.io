// ======================================================
// /js/main.js
// ESM module: application initializer + event bindings
// ======================================================

// ------------------------------
// Imports
// ------------------------------
import { professions } from "./data/professions.js";

import {
  buildSkillsUI,
  highlightOccupationSkills,
  skillState,
  customSkillState
} from "./ui/skillsUI.js";

import {
  rollStatsUI,
  copyRawToModifiedUI,
  applyAgeModifiersUI,
  calcDerivedUI,
  updateAgeChoiceVisibilityUI
} from "./ui/statsUI.js";

import {
  setTheme,
  toggleTheme,
  setAesthetic
} from "./ui/themeUI.js";

import {
  applyPortraitFromUrl,
  handlePortraitFile
} from "./ui/portraitUI.js";

import {
  collectData,
  applyData,
  saveToLocal,
  loadFromLocal,
  exportToFile,
  importFromFile
} from "./logic/storage.js";


// ======================================================
// Initialization
// ======================================================
window.addEventListener("DOMContentLoaded", async () => {

  // ------------------------------
  // Build skills UI
  // ------------------------------
  buildSkillsUI();

  // ------------------------------
  // Populate professions dropdown
  // ------------------------------
  const profSel = document.getElementById("charProfession");
  profSel.innerHTML = '<option value="">-- Select Profession --</option>';
  Object.keys(professions).forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    profSel.appendChild(opt);
  });

  // Highlight occupation skills when profession changes
  profSel.addEventListener("change", () => {
    highlightOccupationSkills(profSel.value, professions);
  });

  // ------------------------------
  // Stats UI bindings
  // ------------------------------
  document.getElementById("btnRollStats").addEventListener("click", rollStatsUI);
  document.getElementById("btnApplyAge").addEventListener("click", applyAgeModifiersUI);
  document.getElementById("btnCalcDerived").addEventListener("click", calcDerivedUI);
  document.getElementById("charAge").addEventListener("input", updateAgeChoiceVisibilityUI);

  // ------------------------------
  // Portrait UI bindings
  // ------------------------------
  document.getElementById("btnApplyPortrait").addEventListener("click", applyPortraitFromUrl);
  document.getElementById("portraitFile").addEventListener("change", handlePortraitFile);

  // ------------------------------
  // Theme + aesthetic
  // ------------------------------
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);

  const savedAesthetic = localStorage.getItem("aestheticMode") || "clean";
  setAesthetic(savedAesthetic);

  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  document.getElementById("aestheticMode").addEventListener("change", e => {
    setAesthetic(e.target.value);
  });

  // ------------------------------
  // Storage buttons
  // ------------------------------
  document.getElementById("btnSave").addEventListener("click", saveToLocal);
  document.getElementById("btnLoad").addEventListener("click", loadFromLocal);
  document.getElementById("btnExport").addEventListener("click", exportToFile);

  document.getElementById("btnImport").addEventListener("click", () => {
    document.getElementById("fileImport").click();
  });

  document.getElementById("fileImport").addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) importFromFile(file);
  });

  // ------------------------------
  // Attempt to load saved character
  // ------------------------------
  const saved = localStorage.getItem("coc_char_sheet");
  if (saved) {
    try {
      applyData(JSON.parse(saved));
    } catch (err) {
      console.error("Failed to load saved data:", err);
    }
  }
});