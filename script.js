// ======================================================
// Global State
// ======================================================
const skillState = {};        // standard skills
const customSkillState = {};  // custom skills

// ======================================================
// Profession Data (simplified, non-copyright)
// ======================================================
const professions = {
  "Antiquarian": {
    occSkills: ["Appraise","History","Library Use","Language (Other)","Spot Hidden","Charm","Credit Rating"],
    credit: "30–70"
  },
  "Detective": {
    occSkills: ["Law","Library Use","Psychology","Spot Hidden","Stealth","Firearms","Intimidate","Credit Rating"],
    credit: "20–50"
  },
  "Doctor": {
    occSkills: ["First Aid","Medicine","Biology","Psychology","Credit Rating"],
    credit: "30–80"
  },
  "Journalist": {
    occSkills: ["Fast Talk","Persuade","Psychology","History","Library Use","Credit Rating"],
    credit: "10–40"
  },
  "Professor": {
    occSkills: ["Library Use","Language (Other)","History","Occult","Psychology","Credit Rating"],
    credit: "20–70"
  },
  "Soldier": {
    occSkills: ["Firearms","Brawl","First Aid","Stealth","Survival","Credit Rating"],
    credit: "10–40"
  }
};

// ======================================================
// Skill Data
// ======================================================
const skillCategories = {
  Social: [
    { name: "Charm", base: 15 },
    { name: "Fast Talk", base: 5 },
    { name: "Intimidate", base: 15 },
    { name: "Persuade", base: 10 },
    { name: "Credit Rating", base: 0 }
  ],
  Physical: [
    { name: "Brawl", base: 25 },
    { name: "Dodge", base: 0 }, // DEX/2
    { name: "Stealth", base: 20 },
    { name: "Climb", base: 20 },
    { name: "Drive Auto", base: 20 },
    { name: "Firearms", base: 20 },
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

// ======================================================
// Dice Utilities
// ======================================================
function d(s) { return Math.floor(Math.random() * s) + 1; }
function roll3d6() { return d(6) + d(6) + d(6); }
function roll2d6p6() { return d(6) + d(6) + 6; }
function roll3d6p3() { return d(6) + d(6) + d(6) + 3; }

function rollStatRaw(type) {
  if (type === "3d6x5") return roll3d6() * 5;
  if (type === "2d6p6x5") return roll2d6p6() * 5;
  if (type === "3d6p3x5") return roll3d6p3() * 5;
  return 0;
}

function rollStatAverage(type) {
  let total = 0;

  if (type === "3d6x5") {
    for (let i = 0; i < 3; i++) total += roll3d6();
    const avg = total / 3;
    return Math.floor(avg) * 5;
  }

  if (type === "2d6p6x5") {
    for (let i = 0; i < 3; i++) total += roll2d6p6();
    const avg = total / 3;
    return Math.floor(avg) * 5;
  }

  if (type === "3d6p3x5") {
    for (let i = 0; i < 3; i++) total += roll3d6p3();
    const avg = total / 3;
    return Math.floor(avg) * 5;
  }

  return 0;
}

// ======================================================
// Random Name Generator
// ======================================================
const namePools = {
  male: ["James","Robert","William","Charles","Edward","Hiroshi","Kenji","Takeshi"],
  female: ["Mary","Patricia","Linda","Elizabeth","Margaret","Yuki","Aiko","Haruka"],
  neutral: ["Alex","Taylor","Jordan","Casey","Rei","Makoto"],
  surnames: ["Smith","Johnson","Brown","Jones","Sato","Suzuki","Takahashi","Tanaka"]
};

function randomName() {
  const gender = document.getElementById("charGender").value;
  let pool = namePools.neutral;
  if (gender === "male") pool = namePools.male;
  if (gender === "female") pool = namePools.female;
  const first = pool[Math.floor(Math.random() * pool.length)];
  const last = namePools.surnames[Math.floor(Math.random() * namePools.surnames.length)];
  document.getElementById("charName").value = `${first} ${last}`;
}

// ======================================================
// Portrait Handling
// ======================================================
function applyPortraitFromUrl() {
  const url = document.getElementById("portraitUrl").value.trim();
  if (url) document.getElementById("portraitPreview").src = url;
}

function handlePortraitFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById("portraitPreview").src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// ======================================================
// Stats: Rolling & Derived
// ======================================================
function rollStats() {
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

  // By default, copy raw to modified until age modifiers are applied
  copyRawToModified();
  updateDodgeBase();
  updateOccupationInfo();
}

function copyRawToModified() {
  const fields = ["STR","CON","DEX","APP","POW","SIZ","INT","EDU"];
  fields.forEach(stat => {
    const raw = +document.getElementById(`stat${stat}_raw`).value || 0;
    document.getElementById(`stat${stat}_mod`).value = raw;
  });
  updateDodgeBase();
}

function calcDerived() {
  // Use modified stats if present, otherwise fall back to raw
  const getStat = stat => {
    const mod = +document.getElementById(`stat${stat}_mod`).value || 0;
    if (mod) return mod;
    return +document.getElementById(`stat${stat}_raw`).value || 0;
  };

  const STR = getStat("STR");
  const CON = getStat("CON");
  const DEX = getStat("DEX");
  const SIZ = getStat("SIZ");
  const POW = getStat("POW");
  const EDU = getStat("EDU");

  document.getElementById("derivedHP").value = Math.floor((CON + SIZ) / 10);
  document.getElementById("derivedMP").value = Math.floor(POW / 5);
  document.getElementById("derivedSAN").value = POW;
  document.getElementById("derivedLuck").value = roll3d6() * 5;

  const sum = STR + SIZ;
  let db = "", build = 0;
  if (sum <= 64) { db = "-2"; build = -2; }
  else if (sum <= 84) { db = "-1"; build = -1; }
  else if (sum <= 124) { db = "0"; build = 0; }
  else if (sum <= 164) { db = "+1d4"; build = 1; }
  else { db = "+1d6"; build = 2; }
  document.getElementById("derivedDB").value = db;
  document.getElementById("derivedBuild").value = build;

  let move = 8;
  if (DEX < STR && STR < SIZ) move = 7;
  if (DEX > STR && STR > SIZ) move = 9;
  document.getElementById("derivedMove").value = move;

  updateDodgeBase();
}

// ======================================================
// Age Modifiers
// ======================================================
function updateAgeChoiceVisibility() {
  const age = +document.getElementById("charAge").value || 0;
  const container = document.getElementById("ageChoiceContainer");
  if (age >= 15 && age <= 19) {
    container.style.display = "grid";
  } else {
    container.style.display = "none";
  }
}

function applyAgeModifiers() {
  const age = +document.getElementById("charAge").value || 0;

  // Read raw stats
  const raw = {
    STR: +document.getElementById("statSTR_raw").value || 0,
    CON: +document.getElementById("statCON_raw").value || 0,
    DEX: +document.getElementById("statDEX_raw").value || 0,
    APP: +document.getElementById("statAPP_raw").value || 0,
    POW: +document.getElementById("statPOW_raw").value || 0,
    SIZ: +document.getElementById("statSIZ_raw").value || 0,
    INT: +document.getElementById("statINT_raw").value || 0,
    EDU: +document.getElementById("statEDU_raw").value || 0
  };

  let mod = { ...raw };

  if (age >= 15 && age <= 19) {
    const penaltyTarget = document.getElementById("agePenalty").value || "STR";
    const bonusTarget = document.getElementById("ageBonus").value || "DEX";

    mod.EDU -= 5;
    if (penaltyTarget === "STR") mod.STR -= 5;
    else mod.SIZ -= 5;

    if (bonusTarget === "DEX") mod.DEX += 5;
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

  // Write modified stats
  document.getElementById("statSTR_mod").value = mod.STR;
  document.getElementById("statCON_mod").value = mod.CON;
  document.getElementById("statDEX_mod").value = mod.DEX;
  document.getElementById("statAPP_mod").value = mod.APP;
  document.getElementById("statPOW_mod").value = mod.POW;
  document.getElementById("statSIZ_mod").value = mod.SIZ;
  document.getElementById("statINT_mod").value = mod.INT;
  document.getElementById("statEDU_mod").value = mod.EDU;

  updateDodgeBase();
  updateOccupationInfo();
}

// ======================================================
// Skills UI
// ======================================================
function buildSkillsUI() {
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

    const headerRow = document.createElement("div");
    headerRow.className = "skill-row small-label";
    headerRow.innerHTML = "<span>Skill</span><span>Base</span><span>Occ</span><span>PI</span><span>Total</span>";
    body.appendChild(headerRow);

    skills.forEach(skill => {
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
    });

    header.addEventListener("click", () => {
      body.style.display = body.style.display === "block" ? "none" : "block";
    });

    catDiv.appendChild(header);
    catDiv.appendChild(body);
    container.appendChild(catDiv);
  });

  // Start expanded
  document.querySelectorAll(".skills-body").forEach(b => b.style.display = "block");
}

function updateSkillRow(name) {
  const s = skillState[name] || customSkillState[name];
  if (!s) return;
  const total = (s.base || 0) + (s.occ || 0) + (s.pi || 0);
  s.totalInput.value = total;
}

function addCustomSkill() {
  const name = document.getElementById("customSkillName").value.trim();
  const base = +document.getElementById("customSkillBase").value || 1;
  if (!name) return;

  const container = document.getElementById("customSkillsContainer");

  const row = document.createElement("div");
  row.className = "skill-row";
  row.dataset.skillName = name;

  const nameSpan = document.createElement("span");
  nameSpan.textContent = name;

  const baseInput = document.createElement("input");
  baseInput.type = "number";
  baseInput.value = base;
  baseInput.addEventListener("input", () => {
    customSkillState[name].base = +baseInput.value || 0;
    updateSkillRow(name);
  });

  const occInput = document.createElement("input");
  occInput.type = "number";
  occInput.value = 0;
  occInput.addEventListener("input", () => {
    customSkillState[name].occ = +occInput.value || 0;
    updateSkillRow(name);
  });

  const piInput = document.createElement("input");
  piInput.type = "number";
  piInput.value = 0;
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

  container.appendChild(row);

  customSkillState[name] = {
    base,
    occ: 0,
    pi: 0,
    totalInput,
    category: "Custom"
  };
  updateSkillRow(name);

  document.getElementById("customSkillName").value = "";
  document.getElementById("customSkillBase").value = 1;
}

// ======================================================
// Profession Integration
// ======================================================
function populateProfessions() {
  const sel = document.getElementById("charProfession");
  sel.innerHTML = '<option value="">-- Select Profession --</option>';
  Object.keys(professions).forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    sel.appendChild(opt);
  });
}

function updateOccupationInfo() {
  const profName = document.getElementById("charProfession").value;
  const EDU_mod = +document.getElementById("statEDU_mod").value || 0;
  const EDU_raw = +document.getElementById("statEDU_raw").value || 0;
  const EDU = EDU_mod || EDU_raw;
  const occPoints = EDU * 4;
  document.getElementById("occupationPoints").value = occPoints || "";

  if (!profName || !professions[profName]) {
    document.getElementById("creditRatingRange").value = "";
    return;
  }
  document.getElementById("creditRatingRange").value = professions[profName].credit;

  const occSkills = professions[profName].occSkills;
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

// ======================================================
// Dodge Base (from DEX)
// ======================================================
function updateDodgeBase() {
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

// ======================================================
// Weapons
// ======================================================
function addWeaponRow(data = {}) {
  const list = document.getElementById("weaponsList");
  const row = document.createElement("div");
  row.className = "weapon-row";

  const nameInput = document.createElement("input");
  nameInput.placeholder = "Name";
  nameInput.value = data.name || "";

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
  skillSelect.value = data.skill || "";

  const dmgInput = document.createElement("input");
  dmgInput.placeholder = "Damage";
  dmgInput.value = data.damage || "";

  const rangeInput = document.createElement("input");
  rangeInput.placeholder = "Range";
  rangeInput.value = data.range || "";

  const ammoInput = document.createElement("input");
  ammoInput.placeholder = "Ammo";
  ammoInput.value = data.ammo || "";

  const costInput = document.createElement("input");
  costInput.placeholder = "Cost";
  costInput.value = data.cost || "";

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

  list.appendChild(row);
}

// ======================================================
// Inventory
// ======================================================
function addItemRow(data = {}) {
  const list = document.getElementById("itemsList");
  const row = document.createElement("div");
  row.className = "item-row";

  const nameInput = document.createElement("input");
  nameInput.placeholder = "Name";
  nameInput.value = data.name || "";

  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.placeholder = "Qty";
  qtyInput.value = data.qty || 1;

  const costInput = document.createElement("input");
  costInput.placeholder = "Cost";
  costInput.value = data.cost || "";

  const notesInput = document.createElement("input");
  notesInput.placeholder = "Notes";
  notesInput.value = data.notes || "";

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

  list.appendChild(row);
}

// ======================================================
// Theme & Aesthetic
// ======================================================
function setTheme(mode) {
  const body = document.body;
  if (mode === "dark") {
    body.classList.add("dark");
    localStorage.setItem("theme", "dark");
    document.getElementById("themeToggle").textContent = "Light Mode";
  } else {
    body.classList.remove("dark");
    localStorage.setItem("theme", "light");
    document.getElementById("themeToggle").textContent = "Dark Mode";
  }
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
}

function setAesthetic(mode) {
  const body = document.body;
  body.classList.remove("aesthetic-clean","aesthetic-typewriter","aesthetic-hybrid");
  if (mode === "typewriter") body.classList.add("aesthetic-typewriter");
  else if (mode === "hybrid") body.classList.add("aesthetic-hybrid");
  else body.classList.add("aesthetic-clean");
  localStorage.setItem("aestheticMode", mode);
}

// ======================================================
// Save / Load / Import / Export
// ======================================================
function collectData() {
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

  Object.keys(skillState).forEach(name => {
    const s = skillState[name];
    data.skills[name] = {
      base: s.base,
      occ: s.occ,
      pi: s.pi,
      category: s.category
    };
  });

  Object.keys(customSkillState).forEach(name => {
    const s = customSkillState[name];
    data.customSkills[name] = {
      base: s.base,
      occ: s.occ,
      pi: s.pi,
      category: s.category
    };
  });

  document.querySelectorAll("#weaponsList .weapon-row").forEach(row => {
    const inputs = row.querySelectorAll("input,select");
    const name = inputs[0];
    const skill = inputs[1];
    const dmg = inputs[2];
    const range = inputs[3];
    const ammo = inputs[4];
    const cost = inputs[5];
    data.weapons.push({
      name: name.value,
      skill: skill.value,
      damage: dmg.value,
      range: range.value,
      ammo: ammo.value,
      cost: cost.value
    });
  });

  document.querySelectorAll("#itemsList .item-row").forEach(row => {
    const inputs = row.querySelectorAll("input");
    const name = inputs[0];
    const qty = inputs[1];
    const cost = inputs[2];
    const notes = inputs[3];
    data.items.push({
      name: name.value,
      qty: qty.value,
      cost: cost.value,
      notes: notes.value
    });
  });

  return data;
}

function applyData(data) {
  if (!data) return;
  const c = data.character || {};

  document.getElementById("charName").value = c.name || "";
  document.getElementById("charGender").value = c.gender || "male";
  document.getElementById("charAge").value = c.age || "";
  document.getElementById("charRegion").value = c.region || "";
  document.getElementById("charProfession").value = c.profession || "";
  document.getElementById("statMode").value = c.statMode || "raw";

  if (c.statsRaw) {
    document.getElementById("statSTR_raw").value = c.statsRaw.STR || "";
    document.getElementById("statCON_raw").value = c.statsRaw.CON || "";
    document.getElementById("statDEX_raw").value = c.statsRaw.DEX || "";
    document.getElementById("statAPP_raw").value = c.statsRaw.APP || "";
    document.getElementById("statPOW_raw").value = c.statsRaw.POW || "";
    document.getElementById("statSIZ_raw").value = c.statsRaw.SIZ || "";
    document.getElementById("statINT_raw").value = c.statsRaw.INT || "";
    document.getElementById("statEDU_raw").value = c.statsRaw.EDU || "";
  }

  if (c.statsMod) {
    document.getElementById("statSTR_mod").value = c.statsMod.STR || "";
    document.getElementById("statCON_mod").value = c.statsMod.CON || "";
    document.getElementById("statDEX_mod").value = c.statsMod.DEX || "";
    document.getElementById("statAPP_mod").value = c.statsMod.APP || "";
    document.getElementById("statPOW_mod").value = c.statsMod.POW || "";
    document.getElementById("statSIZ_mod").value = c.statsMod.SIZ || "";
    document.getElementById("statINT_mod").value = c.statsMod.INT || "";
    document.getElementById("statEDU_mod").value = c.statsMod.EDU || "";
  } else {
    copyRawToModified();
  }

  if (c.agePenalty) document.getElementById("agePenalty").value = c.agePenalty;
  if (c.ageBonus) document.getElementById("ageBonus").value = c.ageBonus;

  if (c.derived) {
    document.getElementById("derivedHP").value = c.derived.HP || "";
    document.getElementById("derivedMP").value = c.derived.MP || "";
    document.getElementById("derivedSAN").value = c.derived.SAN || "";
    document.getElementById("derivedLuck").value = c.derived.Luck || "";
    document.getElementById("derivedDB").value = c.derived.DB || "";
    document.getElementById("derivedBuild").value = c.derived.Build || "";
    document.getElementById("derivedMove").value = c.derived.Move || "";
  }

  if (c.portraitUrl) {
    document.getElementById("portraitPreview").src = c.portraitUrl;
  }

  // Standard skills
  if (data.skills) {
    Object.keys(data.skills).forEach(name => {
      if (!skillState[name]) return;
      const s = data.skills[name];
      skillState[name].base = s.base || 0;
      skillState[name].occ = s.occ || 0;
      skillState[name].pi = s.pi || 0;
      const row = document.querySelector(`.skill-row[data-skill-name="${CSS.escape(name)}"]`);
      if (row) {
        const inputs = row.querySelectorAll("input");
        inputs[0].value = skillState[name].base;
        inputs[1].value = skillState[name].occ;
        inputs[2].value = skillState[name].pi;
        updateSkillRow(name);
      }
    });
  }

  // Custom skills
  document.getElementById("customSkillsContainer").innerHTML = "";
  Object.keys(customSkillState).forEach(k => delete customSkillState[k]);
  if (data.customSkills) {
    Object.keys(data.customSkills).forEach(name => {
      const s = data.customSkills[name];
      const container = document.getElementById("customSkillsContainer");
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

      container.appendChild(row);

      customSkillState[name] = {
        base: s.base || 0,
        occ: s.occ || 0,
        pi: s.pi || 0,
        totalInput,
        category: "Custom"
      };
      updateSkillRow(name);
    });
  }

  // Weapons
  document.getElementById("weaponsList").innerHTML = "";
  (data.weapons || []).forEach(w => addWeaponRow(w));

  // Items
  document.getElementById("itemsList").innerHTML = "";
  (data.items || []).forEach(i => addItemRow(i));

  // Theme & aesthetic
  setTheme(data.theme || "light");
  document.getElementById("aestheticMode").value = data.aesthetic || "clean";
  setAesthetic(data.aesthetic || "clean");

  updateAgeChoiceVisibility();
  updateDodgeBase();
  updateOccupationInfo();
}

function saveToLocal() {
  const data = collectData();
  localStorage.setItem("cocCharacterSheet", JSON.stringify(data));
  alert("Character saved.");
}

function loadFromLocal() {
  const raw = localStorage.getItem("cocCharacterSheet");
  if (!raw) {
    alert("No saved character found.");
    return;
  }
  try {
    const data = JSON.parse(raw);
    applyData(data);
    alert("Character loaded.");
  } catch {
    alert("Saved data is invalid.");
  }
}

function exportJSON() {
  const data = collectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "coc_character.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJSONFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      applyData(data);
      localStorage.setItem("cocCharacterSheet", JSON.stringify(data));
      alert("Character imported.");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// ======================================================
// Init
// ======================================================
function init() {
  buildSkillsUI();
  populateProfessions();

  // Buttons
  document.getElementById("btnRandomName").onclick = randomName;
  document.getElementById("btnRollStats").onclick = rollStats;
  document.getElementById("btnApplyAge").onclick = applyAgeModifiers;
  document.getElementById("btnCalcDerived").onclick = calcDerived;

  document.getElementById("portraitFile").addEventListener("change", handlePortraitFile);
  document.getElementById("btnApplyPortrait").onclick = applyPortraitFromUrl;

  document.getElementById("charProfession").addEventListener("change", updateOccupationInfo);
  document.getElementById("statEDU_raw").addEventListener("input", updateOccupationInfo);
  document.getElementById("statEDU_mod").addEventListener("input", updateOccupationInfo);

  document.getElementById("charAge").addEventListener("input", updateAgeChoiceVisibility);

  document.getElementById("btnAddCustomSkill").onclick = addCustomSkill;
  document.getElementById("btnAddWeapon").onclick = () => addWeaponRow();
  document.getElementById("btnAddItem").onclick = () => addItemRow();

  document.getElementById("themeToggle").onclick = toggleTheme;

  document.getElementById("btnSave").onclick = saveToLocal;
  document.getElementById("btnLoad").onclick = loadFromLocal;
  document.getElementById("btnExport").onclick = exportJSON;
  document.getElementById("btnImport").onclick = () => document.getElementById("fileImport").click();
  document.getElementById("fileImport").addEventListener("change", importJSONFile);

  document.getElementById("aestheticMode").addEventListener("change", e => setAesthetic(e.target.value));

  // Defaults for age choice (15–19)
  document.getElementById("agePenalty").value = "STR";
  document.getElementById("ageBonus").value = "DEX";

  // Theme & aesthetic from storage
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
  const savedAesthetic = localStorage.getItem("aestheticMode") || "clean";
  document.getElementById("aestheticMode").value = savedAesthetic;
  setAesthetic(savedAesthetic);

  // Load saved character if present
  const raw = localStorage.getItem("cocCharacterSheet");
  if (raw) {
    try { applyData(JSON.parse(raw)); } catch {}
  } else {
    copyRawToModified();
    updateAgeChoiceVisibility();
  }
}

window.addEventListener("DOMContentLoaded", init);