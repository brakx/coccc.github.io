// ======================================================
// /js/ui/portraitUI.js
// ESM module: portrait upload + URL handling
// ======================================================

// ------------------------------------------------------
// Apply portrait from URL input
// ------------------------------------------------------
export function applyPortraitFromUrl() {
  const url = document.getElementById("portraitUrl").value.trim();
  if (url) {
    document.getElementById("portraitPreview").src = url;
  }
}

// ------------------------------------------------------
// Handle portrait file upload
// ------------------------------------------------------
export function handlePortraitFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById("portraitPreview").src = ev.target.result;
  };

  reader.readAsDataURL(file);
}