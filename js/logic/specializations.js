// ======================================================
// /js/logic/specializations.js
// ESM module: specialization logic (no DOM)
// ======================================================

/**
 * Create a full specialization skill name.
 * Example: Fighting + Knife → "Fighting (Knife)"
 */
export function makeSpecializationName(baseSkill, spec) {
  return `${baseSkill} (${spec})`;
}

/**
 * Check if a specialization already exists in skillState.
 * Prevents duplicates like "Fighting (Knife)" twice.
 */
export function specializationExists(skillState, baseSkill, spec) {
  const fullName = makeSpecializationName(baseSkill, spec);
  return Boolean(skillState[fullName]);
}

/**
 * Validate a specialization name.
 * RAW specializations are always valid.
 * Custom specializations must be non-empty and trimmed.
 */
export function validateSpecialization(spec) {
  if (!spec) return false;
  if (typeof spec !== "string") return false;
  return spec.trim().length > 0;
}

/**
 * Create a new specialization entry in skillState.
 * UI will handle DOM; this only manages data.
 */
export function createSpecialization(skillState, baseSkill, category, baseValue, spec) {
  const fullName = makeSpecializationName(baseSkill, spec);

  skillState[fullName] = {
    base: baseValue,
    occ: 0,
    pi: 0,
    totalInput: null, // UI will attach the DOM element later
    category,
    baseSkillName: baseSkill
  };

  return fullName;
}

/**
 * Update the total for a specialization.
 * UI passes in the DOM input values.
 */
export function computeTotal(base, occ, pi) {
  return (base || 0) + (occ || 0) + (pi || 0);
}

/**
 * Extract base skill + specialization from a full name.
 * Example: "Fighting (Knife)" → { baseSkill: "Fighting", spec: "Knife" }
 */
export function parseSpecialization(fullName) {
  if (!fullName.includes("(")) return null;

  const baseSkill = fullName.split("(")[0].trim();
  const spec = fullName.substring(
    fullName.indexOf("(") + 1,
    fullName.indexOf(")")
  ).trim();

  return { baseSkill, spec };
}