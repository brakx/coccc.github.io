// ======================================================
// /js/logic/storage.js
// ESM module: save/load/export/import logic
// ======================================================

import { skillCategories } from "../data/skills.js";
import {
  skillState,
  customSkillState,
  addSpecializationRow,
  resetSkills,
  updateSkillRow
} from "../ui/skillsUI.js";

import { parseSpecialization } from "./specializations.js";

// ------------------------------------------------------
// Collect all character data into a JSON object
// ------------------------------------------------------
export function collectData() {
  const data = {
    character: {
      name: document.getElementById("charName").value,
      gender: document.getElementById("charGender").value,
      age: document.getElementById("charAge").value,
      region: document.getElementById("charRegion").value,
      profession: document.getElementById("charProfession").value,
      statMode: document.getElementById("statMode").value,

      statsRaw: {
        STR: document.getElementById("statSTR_raw").value,
        CON: document.getElementById("statCON_raw").value,
        DEX: document.getElementById("statDEX_raw").value,
        APP: document.getElementById("statAPP_raw").value,
        POW: document.getElementById("statPOW_raw").value,
        SIZ: document.getElementById("statSIZ_raw").value,
        INT: document.getElementById("statINT_raw").value,
        EDU: document.getElementById("statEDU_raw").value
      },

      statsMod: {
        STR: document.getElementById("statSTR_mod").value,
        CON: document.getElementById("statCON_mod").value,
        DEX: document.getElementById("statDEX_mod").value,
        APP: document.getElementById("statAPP_mod").value,
        POW: document.getElementById("statPOW_mod").value,
        SIZ: document.getElementById("statSIZ_mod").value,
        INT: document.getElementById("statINT_mod").value,
        EDU: document.getElementById("statEDU_mod").value
      },

      agePenalty: document.getElementById("agePenalty").value,
      ageBonus: document.getElementById("ageBonus").value,

      derived: {
        HP: document.getElementById("derivedHP").value,
        MP: document.getElementById("derivedMP").value,
        SAN: document.getElementById("derivedSAN").value,
        Luck: document.getElementById("derivedLuck").value,
        DB: document.getElementById("derivedDB").value,
        Build: document.getElementById("derivedBuild").value,
        Move: document.getElementById("derivedMove").value
      },

      portraitUrl: document.getElementById("portraitPreview").src
    },

    skills: {},
    customSkills: {},
    weapons: [],
    items: [],
    theme: document.body.classList.contains("dark") ? "dark" : "light",
    aesthetic: document.getElementById("aestheticMode").value
  };

  // Standard + specialization skills
  Object.keys(skillState).forEach(name => {
    const s = skillState[name];
    data.skills[name] = {
      base: s.base,
      occ: s.occ,
      pi: s.pi,
      category: s.category
    };
  });

  // Custom skills
  Object.keys(customSkillState).forEach(name => {
    const s = customSkillState[name];
    data.customSkills[name] = {
      base: s.base,
      occ: s.occ,
      pi: s.pi,
      category: s.category
    };
  });

  // Weapons
  document.querySelectorAll("#weaponsList .weapon-row").forEach(row => {
    const inputs = row.querySelectorAll("input,select");
    data.weapons.push({
      name: inputs[0].value,
      skill: inputs[1].value,
      damage: inputs[2].value,
      range: inputs[3].value,
      ammo: inputs[4].value,
      cost: inputs[5].value
    });
  });

  // Items
  document.querySelectorAll("#itemsList .item-row").forEach(row => {
    const inputs = row.querySelectorAll("input");
    data.items.push({
      name: inputs[0].value,
      qty: inputs[1].value,
      cost: inputs[2].value,
      notes: inputs[3].value
    });
  });

  return data;
}

// ------------------------------------------------------
// Apply loaded data to the UI
// ------------------------------------------------------
export function applyData(data) {
  if (!data) return;

  const c = data.character || {};

  // Basic character info
  document.getElementById("charName").value = c.name || "";
  document.getElementById("charGender").value = c.gender || "male";
  document.getElementById("charAge").value = c.age || "";
  document.getElementById("charRegion").value = c.region || "";
  document.getElementById("charProfession").value = c.profession || "";
  document.getElementById("statMode").value = c.statMode || "raw";

  // Raw stats
  if (c.statsRaw) {
    for (const key in c.statsRaw) {
      document.getElementById(`stat${key}_raw`).value = c.statsRaw[key] || "";
    }
  }

  // Modified stats
  if (c.statsMod) {
    for (const key in c.statsMod) {
      document.getElementById(`stat${key}_mod`).value = c.statsMod[key] || "";
    }
  }

  // Age modifiers
  if (c.agePenalty) document.getElementById("agePenalty").value = c.agePenalty;
  if (c.ageBonus) document.getElementById("ageBonus").value = c.ageBonus;

  // Derived stats
  if (c.derived) {
    document.getElementById("derivedHP").value = c.derived.HP || "";
    document.getElementById("derivedMP").value = c.derived.MP || "";
    document.getElementById("derivedSAN").value = c.derived.SAN || "";
    document.getElementById("derivedLuck").value = c.derived.Luck || "";
    document.getElementById("derivedDB").value = c.derived.DB || "";
    document.getElementById("derivedBuild").value = c.derived.Build || "";
    document.getElementById("derivedMove").value = c.derived.Move || "";
  }

  // Portrait
  if (c.portraitUrl) {
    document.getElementById("portraitPreview").src = c.portraitUrl;
  }

  // Reset skills before rebuilding
  resetSkills();

  // Rebuild UI fresh
  const { buildSkillsUI } = await import("../ui/skillsUI.js");
  buildSkillsUI();

  // Reapply skills
  if (data.skills) {
    Object.keys(data.skills).forEach(fullName => {
      const s = data.skills[fullName];

      // Specialization?
      const parsed = parseSpecialization(fullName);

      if (parsed) {
        const { baseSkill, spec } = parsed;

        // Find the groupDiv for this base skill
        const groupDiv = [...document.querySelectorAll(".skill-group")]
          .find(div => div.dataset.baseSkill === baseSkill);

        if (groupDiv) {
          const baseValue = +groupDiv.dataset.baseValue || s.base || 0;
          const category = groupDiv.dataset.category;

          addSpecializationRow(groupDiv, baseSkill, category, baseValue, spec);

          // Apply values
          const row = document.querySelector(`.skill-row[data-skill-name="${CSS.escape(fullName)}"]`);
          if (row) {
            const inputs = row.querySelectorAll("input");
            inputs[0].value = s.base;
            inputs[1].value = s.occ;
            inputs[2].value = s.pi;

            skillState[fullName].base = s.base;
            skillState[fullName].occ = s.occ;
            skillState[fullName].pi = s.pi;

            updateSkillRow(fullName);
          }
        }
      }

      // Normal skill
      else if (skillState[fullName]) {
        const row = document.querySelector(`.skill-row[data-skill-name="${CSS.escape(fullName)}"]`);
        if (row) {
          const inputs = row.querySelectorAll("input");
          inputs[0].value = s.base;
          inputs[1].value = s.occ;
          inputs[2].value = s.pi;

          skillState[fullName].base = s.base;
          skillState[fullName].occ = s.occ;
          skillState[fullName].pi = s.pi;

          updateSkillRow(fullName);
        }
      }
    });
  }

  // Custom skills
  const customContainer = document.getElementById("customSkillsContainer");
  customContainer.innerHTML = "";
  Object.keys(customSkillState).forEach(k => delete customSkillState[k]);

  if (data.customSkills) {
    Object.keys(data.customSkills).forEach(name => {
      const s = data.customSkills[name];

      const row = document.createElement("div");
      row.className = "skill-row";
      row.dataset.skillName = name;

      const nameSpan = document.createElement("span");
      nameSpan.textContent = name;

      const baseInput = document.createElement("input");
      baseInput.type = "number";
      baseInput.value = s.base || 0;
      baseInput.addEventListener("input", () => {
        customSkillState[name].base = +baseInput.value || 0;
        updateSkillRow(name);
      });

      const occInput = document.createElement("input");
      occInput.type = "number";
      occInput.value = s.occ || 0;
      occInput.addEventListener("input", () => {
        customSkillState[name].occ = +occInput.value || 0;
        updateSkillRow(name);
      });

      const piInput = document.createElement("input");
      piInput.type = "number";
      piInput.value = s.pi || 0;
      piInput.addEventListener("input", () => {
        customSkillState[name].pi = +piInput.value || 0;
        updateSkillRow(name);
      });

      const totalInput = document.createElement("input");
      totalInput.type = "number";
      totalInput.readOnly = true;

      row.appendChild(nameSpan);
      row.appendChild(baseInput);
      row.appendChild(occInput);
      row.appendChild(piInput);
      row.appendChild(totalInput);

      customContainer.appendChild(row);

      customSkillState[name] = {
        base: s.base || 0,
        occ: s.occ || 0,
        pi: s.pi || 0,
        totalInput,
        category: s.category || "Custom"
      };

      updateSkillRow(name);
    });
  }

  // Weapons
  const weaponsList = document.getElementById("weaponsList");
  weaponsList.innerHTML = "";
  if (data.weapons) {
    data.weapons.forEach(w => {
      const row = document.createElement("div");
      row.className = "weapon-row";

      const nameInput = document.createElement("input");
      nameInput.value = w.name || "";
      nameInput.placeholder = "Name";

      const skillSelect = document.createElement("select");
      const skillNames = [...Object.keys(skillState), ...Object.keys(customSkillState)].sort();
      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "-- Skill --";
      skillSelect.appendChild(emptyOpt);
      skillNames.forEach(n => {
        const opt = document.createElement("option");
        opt.value = n;
        opt.textContent = n;
        skillSelect.appendChild(opt);
      });
      skillSelect.value = w.skill || "";

      const dmgInput = document.createElement("input");
      dmgInput.placeholder = "Damage";
      dmgInput.value = w.damage || "";

      const rangeInput = document.createElement("input");
      rangeInput.placeholder = "Range";
      rangeInput.value = w.range || "";

      const ammoInput = document.createElement("input");
      ammoInput.placeholder = "Ammo";
      ammoInput.value = w.ammo || "";

      const costInput = document.createElement("input");
      costInput.placeholder = "Cost";
      costInput.value = w.cost || "";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "X";
      removeBtn.onclick = () => row.remove();

      row.appendChild(nameInput);
      row.appendChild(skillSelect);
      row.appendChild(dmgInput);
      row.appendChild(rangeInput);
      row.appendChild(ammoInput);
      row.appendChild(costInput);
      row.appendChild(removeBtn);

      weaponsList.appendChild(row);
    });
  }

  // Items
  const itemsList = document.getElementById("itemsList");
  itemsList.innerHTML = "";
  if (data.items) {
    data.items.forEach(it => {
      const row = document.createElement("div");
      row.className = "item-row";

      const nameInput = document.createElement("input");
      nameInput.placeholder = "Name";
      nameInput.value = it.name || "";

      const qtyInput = document.createElement("input");
      qtyInput.type = "number";
      qtyInput.placeholder = "Qty";
      qtyInput.value = it.qty || 1;

      const costInput = document.createElement("input");
      costInput.placeholder = "Cost";
      costInput.value = it.cost || "";

      const notesInput = document.createElement("input");
      notesInput.placeholder = "Notes";
      notesInput.value = it.notes || "";

      const spacer = document.createElement("span");

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "X";
      removeBtn.onclick = () => row.remove();

      row.appendChild(nameInput);
      row.appendChild(qtyInput);
      row.appendChild(costInput);
      row.appendChild(notesInput);
      row.appendChild(spacer);
      row.appendChild(removeBtn);

      itemsList.appendChild(row);
    });
  }

  // Theme + aesthetic
  if (data.theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }

  if (data.aesthetic) {
    document.getElementById("aestheticMode").value = data.aesthetic;
  }
}

// ------------------------------------------------------
// Save to localStorage
// ------------------------------------------------------
export function saveToLocal() {
  const data = collectData();
  localStorage.setItem("coc_char_sheet", JSON.stringify(data));
}

// ------------------------------------------------------
// Load from localStorage
// ------------------------------------------------------
export function loadFromLocal() {
  const saved = localStorage.getItem("coc_char_sheet");
  if (!saved) {
    alert("No saved data.");
    return;
  }
  applyData(JSON.parse(saved));
}

// ------------------------------------------------------
// Export JSON file
// ------------------------------------------------------
export function exportToFile() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = (data.character.name || "character") + ".json";
  a.click();

  URL.revokeObjectURL(url);
}

// ------------------------------------------------------
// Import JSON file
// ------------------------------------------------------
export function importFromFile(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      applyData(data);
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}