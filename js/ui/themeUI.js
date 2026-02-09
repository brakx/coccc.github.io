	// ======================================================
// /js/ui/themeUI.js
// ESM module: UI for theme + aesthetic mode
// ======================================================

// ------------------------------------------------------
// Set theme (light/dark)
// ------------------------------------------------------
export function setTheme(mode) {
  const body = document.body;

  if (mode === "dark") {
    body.classList.add("dark");
    localStorage.setItem("theme", "dark");
    const toggle = document.getElementById("themeToggle");
    if (toggle) toggle.textContent = "Light Mode";
  } else {
    body.classList.remove("dark");
    localStorage.setItem("theme", "light");
    const toggle = document.getElementById("themeToggle");
    if (toggle) toggle.textContent = "Dark Mode";
  }
}

// ------------------------------------------------------
// Toggle theme from button
// ------------------------------------------------------
export function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
}

// ------------------------------------------------------
// Set aesthetic mode (clean / typewriter / hybrid)
// ------------------------------------------------------
export function setAesthetic(mode) {
  const body = document.body;

  body.classList.remove("aesthetic-clean", "aesthetic-typewriter", "aesthetic-hybrid");

  if (mode === "typewriter") {
    body.classList.add("aesthetic-typewriter");
  } else if (mode === "hybrid") {
    body.classList.add("aesthetic-hybrid");
  } else {
    body.classList.add("aesthetic-clean");
  }

  localStorage.setItem("aestheticMode", mode);
}