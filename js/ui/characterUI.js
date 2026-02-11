// ======================================================
// /js/ui/characterUI.js
// Handles: region dropdown, name generator, credit rating,
//          background field, and character info bindings
// ======================================================
console.log("characterUI.js loaded");

import { professions } from "../data/professions.js";

// ------------------------------------------------------
// REGION LIST
// ------------------------------------------------------
const REGIONS = {
  north_america: "North American",
  latin_america: "Latin American",
  europe: "European",
  africa: "African",
  asia: "Asian"
};

// ------------------------------------------------------
// NAME POOLS (expand anytime)
// ------------------------------------------------------
const NAME_DATA = {
  north_america: {
    male: ["James", "Michael", "Robert", "David", "John", "William"],
    female: ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth"],
    neutral: ["Alex", "Taylor", "Jordan", "Casey", "Morgan"],
    surnames: ["Smith", "Johnson", "Brown", "Davis", "Miller"]
  },

  latin_america: {
    male: ["Carlos", "José", "Luis", "Juan", "Miguel"],
    female: ["Maria", "Sofia", "Lucia", "Camila", "Isabella"],
    neutral: ["Alex", "Cruz", "Rio", "Mar", "Sol"],
    surnames: ["Garcia", "Martinez", "Rodriguez", "Lopez", "Hernandez"]
  },

  europe: {
    male: ["Thomas", "Liam", "Arthur", "Hugo", "Oscar"],
    female: ["Emma", "Sofia", "Alice", "Clara", "Anna"],
    neutral: ["Robin", "Noel", "Sasha", "Avery", "Eden"],
    surnames: ["Dupont", "Schmidt", "Novak", "Andersen", "Murphy"]
  },

  africa: {
    male: ["Kwame", "Ade", "Jabari", "Kofi", "Amari"],
    female: ["Amina", "Zuri", "Imani", "Nia", "Makena"],
    neutral: ["Tari", "Sefu", "Lulu", "Kato", "Asa"],
    surnames: ["Okoro", "Diallo", "Mensah", "Kamau", "Abebe"]
  },

  asia: {
    male: ["Hiroshi", "Wei", "Arun", "Min-Jun", "Sanjay"],
    female: ["Yuki", "Mei", "Asha", "Hana", "Sakura"],
    neutral: ["Ren", "Kai", "Aki", "Bo", "Lin"],
    surnames: ["Tanaka", "Chen", "Singh", "Kim", "Nguyen"]
  }
};

// ------------------------------------------------------
// RANDOM PICK HELPER
// ------------------------------------------------------
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ------------------------------------------------------
// GENERATE NAME
// ------------------------------------------------------
export function generateName() {
  const region = document.getElementById("charRegion").value;
  const gender = document.getElementById("charGender").value;

  if (!region || !NAME_DATA[region]) {
    alert("Please select a valid region first.");
    return;
  }

  const pool = NAME_DATA[region];

  let first;
  if (gender === "male") first = pick(pool.male);
  else if (gender === "female") first = pick(pool.female);
  else first = pick(pool.neutral);

  const last = pick(pool.surnames);

  document.getElementById("charName").value = `${first} ${last}`;
}

// ------------------------------------------------------
// UPDATE CREDIT RATING RANGE
// ------------------------------------------------------
export function updateCreditRating() {
  const prof = document.getElementById("charProfession").value;

  if (!prof || !professions[prof]) {
    document.getElementById("creditRatingRange").value = "";
    return;
  }

  document.getElementById("creditRatingRange").value =
    professions[prof].credit || "";
}

// ------------------------------------------------------
// POPULATE REGION DROPDOWN
// ------------------------------------------------------
function populateRegions() {
  const sel = document.getElementById("charRegion");
  sel.innerHTML = '<option value="">-- Select Region --</option>';

  Object.keys(REGIONS).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = REGIONS[key];
    sel.appendChild(opt);
  });
}

// ------------------------------------------------------
// BIND UI EVENTS
// ------------------------------------------------------
export function bindCharacterUI() {
  populateRegions();

  // Name generator
  document.getElementById("btnRandomName")
    .addEventListener("click", generateName);

  // Credit rating updater
  document.getElementById("charProfession")
    .addEventListener("change", updateCreditRating);
}