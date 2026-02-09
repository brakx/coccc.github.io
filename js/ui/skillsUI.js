// ======================================================
// /js/ui/skillsUI.js
// ESM module: UI for skills + specializations
// ======================================================

import { skillCategories } from "../data/skills.js";
import {
  makeSpecializationName,
  specializationExists,
  validateSpecialization,
  createSpecialization,
  computeTotal,
  parseSpecialization
} from "../logic/specializations.js";

export const skillState = {};
export const customSkillState = {};

// ------------------------------------------------------
// Update a single skill row total
// ------------------------------------------------------
export function updateSkillRow(name) {
  const s = skillState[name] || customSkillState[name];
  if (!s || !s.totalInput) return;

  const total = computeTotal(s.base, s.occ, s.pi);
  s.totalInput.value = total;
}

// ------------------------------------------------------
// Create a specialization row in the DOM
// ------------------------------------------------------
export function addSpecializationRow(parentDiv, baseSkill, category, baseValue, specName) {
  const fullName = makeSpecializationName(baseSkill, specName);

  // Prevent duplicates
  if (specializationExists(skillState, baseSkill, specName)) {
    alert(`Specialization "${specName}" already exists for ${baseSkill}.`);
    return;
  }

  // Create data entry
  createSpecialization(skillState, baseSkill, category, baseValue, specName);

  // DOM row
  const row = document.createElement("div");
  row.className = "skill-row";
  row.dataset.skillName = fullName;

  const nameSpan = document.createElement("span");
  nameSpan.textContent = fullName;

  const baseInput = document.createElement("input");
  baseInput.type = "number";
  baseInput.value = baseValue;
  baseInput.addEventListener("input", () => {
    skillState[fullName].base = +baseInput.value || 0;
    updateSkillRow(fullName);
  });

  const occInput = document.createElement("input");
  occInput.type = "number";
  occInput.value = 0;
  occInput.addEventListener("input", () => {
    skillState[fullName].occ = +occInput.value || 0;
    updateSkillRow(fullName);
  });

  const piInput = document.createElement("input");
  piInput.type = "number";
  piInput.value = 0;
  piInput.addEventListener("input", () => {
    skillState[fullName].pi = +piInput.value || 0;
    updateSkillRow(fullName);
  });

  const totalInput = document.createElement("input");
  totalInput.type = "number";
  totalInput.readOnly = true;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "X";
  removeBtn.onclick = () => {
    delete skillState[fullName];
    row.remove();
  };

  row.appendChild(nameSpan);
  row.appendChild(baseInput);
  row.appendChild(occInput);
  row.appendChild(piInput);
  row.appendChild(totalInput);
  row.appendChild(removeBtn);

  parentDiv.appendChild(row);

  // Attach DOM element to state
  skillState[fullName].totalInput = totalInput;

  updateSkillRow(fullName);
}

// ------------------------------------------------------
// Build the entire skills UI
// ------------------------------------------------------
export function buildSkillsUI() {
  const container = document.getElementById("skillsContainer");
  container.innerHTML = "";

  Object.entries(skillCategories).forEach(([catName, skills]) => {
    const catDiv = document.createElement("div");
    catDiv.className = "skills-category";

    const header = document.createElement("div");
    header.className = "skills-header";
    header.textContent = `${catName} Skills`;

    const body = document.createElement("div");
    body.className = "skills-body";

    // Header row
    const headerRow = document.createElement("div");
    headerRow.className = "skill-row small-label";
    headerRow.innerHTML =
      "<span>Skill</span><span>Base</span><span>Occ</span><span>PI</span><span>Total</span><span></span>";
    body.appendChild(headerRow);

    // Render each skill
    skills.forEach(skill => {
      // MULTI-SPECIALIZATION GROUP
      if (skill.multi) {
        const groupHeader = document.createElement("div");
        groupHeader.style.display = "flex";
        groupHeader.style.alignItems = "center";
        groupHeader.style.gap = "8px";

        const label = document.createElement("span");
        label.textContent = skill.name;

        const addSelect = document.createElement("select");
        addSelect.innerHTML = `
          <option value="">Add Specialization…</option>
          ${skill.specializations.map(s => `<option value="${s}">${s}</option>`).join("")}
          <option value="__custom__">Custom…</option>
        `;

        const groupDiv = document.createElement("div");
        groupDiv.className = "skill-group";
        groupDiv.dataset.baseSkill = skill.name;
        groupDiv.dataset.category = catName;
        groupDiv.dataset.baseValue = skill.base;

        addSelect.addEventListener("change", () => {
          if (!addSelect.value) return;

          if (addSelect.value === "__custom__") {
            const custom = prompt("Enter custom specialization name:");
            if (validateSpecialization(custom)) {
              addSpecializationRow(groupDiv, skill.name, catName, skill.base, custom.trim());
            }
          } else {
            addSpecializationRow(groupDiv, skill.name, catName, skill.base, addSelect.value);
          }

          addSelect.value = "";
        });

        groupHeader.appendChild(label);
        groupHeader.appendChild(addSelect);
        body.appendChild(groupHeader);
        body.appendChild(groupDiv);
      }

      // NORMAL SKILL
      else {
        const row = document.createElement("div");
        row.className = "skill-row";
        row.dataset.skillName = skill.name;

        const nameSpan = document.createElement("span");
        nameSpan.textContent = skill.name;

        const baseInput = document.createElement("input");
        baseInput.type = "number";
        baseInput.value = skill.base;
        baseInput.addEventListener("input", () => {
          skillState[skill.name].base = +baseInput.value || 0;
          updateSkillRow(skill.name);
        });

        const occInput = document.createElement("input");
        occInput.type = "number";
        occInput.value = 0;
        occInput.addEventListener("input", () => {
          skillState[skill.name].occ = +occInput.value || 0;
          updateSkillRow(skill.name);
        });

        const piInput = document.createElement("input");
        piInput.type = "number";
        piInput.value = 0;
        piInput.addEventListener("input", () => {
          skillState[skill.name].pi = +piInput.value || 0;
          updateSkillRow(skill.name);
        });

        const totalInput = document.createElement("input");
        totalInput.type = "number";
        totalInput.readOnly = true;

        row.appendChild(nameSpan);
        row.appendChild(baseInput);
        row.appendChild(occInput);
        row.appendChild(piInput);
        row.appendChild(totalInput);
        body.appendChild(row);

        skillState[skill.name] = {
          base: skill.base,
          occ: 0,
          pi: 0,
          totalInput,
          category: catName
        };

        updateSkillRow(skill.name);
      }
    });

    header.addEventListener("click", () => {
      body.style.display = body.style.display === "block" ? "none" : "block";
    });

    catDiv.appendChild(header);
    catDiv.appendChild(body);
    container.appendChild(catDiv);
  });

  // Expand all by default
  document.querySelectorAll(".skills-body").forEach(b => (b.style.display = "block"));
}

// ------------------------------------------------------
// Highlight occupation skills
// ------------------------------------------------------
export function highlightOccupationSkills(profession, professionsData) {
  const occSkills = profession ? professionsData[profession]?.occSkills || [] : [];

  Object.keys(skillState).forEach(name => {
    const row = document.querySelector(`.skill-row[data-skill-name="${CSS.escape(name)}"]`);
    if (!row) return;

    if (occSkills.includes(name)) {
      row.style.backgroundColor = "rgba(58,110,165,0.08)";
    } else {
      row.style.backgroundColor = "transparent";
    }
  });
}

// ------------------------------------------------------
// Clear all skill state (used before loading a character)
// ------------------------------------------------------
export function resetSkills() {
  Object.keys(skillState).forEach(k => delete skillState[k]);
  Object.keys(customSkillState).forEach(k => delete customSkillState[k]);
}