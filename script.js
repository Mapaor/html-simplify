const input = document.querySelector("#html-input");
const simplifyButton = document.querySelector("#simplify-button");
const copyButton = document.querySelector("#copy-button");
const output = document.querySelector("#html-output code");
const validationMessage = document.querySelector("#validation-message");
const outputMeta = document.querySelector("#output-meta");
let validationTimer;
const VALIDATION_DELAY = 300;

function updateInputHighlight(html, valid) {
  document.querySelector(".editor").classList.toggle("is-highlighted", valid);
  document.querySelector(".editor-highlight code").innerHTML = valid
    ? window.HtmlHighlighter.highlight(html)
    : "";
}

function setValidationState(validation) {
  validationMessage.className = `validation-message ${validation.valid ? "is-valid" : "is-invalid"}`;
  validationMessage.textContent = validation.message;
  simplifyButton.disabled = !validation.valid;
}

function updateValidation() {
  const validation = window.HtmlSimplifier.validateHtmlFragment(input.value);
  setValidationState(validation);
  updateInputHighlight(input.value, validation.valid);
}

function renderOutput(html) {
  output.innerHTML = html
    ? window.HtmlHighlighter.highlight(html)
    : "No visible HTML remained after cleanup.";
  output.classList.toggle("output-placeholder", !html);
  const lines = html ? html.split("\n").length : 0;
  outputMeta.textContent = `${lines} ${lines === 1 ? "line" : "lines"} · ${html.length} characters`;
  copyButton.disabled = !html;
}

input.addEventListener("input", () => {
  updateInputHighlight(input.value, false);
  window.clearTimeout(validationTimer);
  validationTimer = window.setTimeout(updateValidation, VALIDATION_DELAY);
});

input.addEventListener("scroll", () => {
  const highlight = document.querySelector(".editor-highlight");
  highlight.scrollTop = input.scrollTop;
  highlight.scrollLeft = input.scrollLeft;
});

simplifyButton.addEventListener("click", () => {
  const validation = window.HtmlSimplifier.validateHtmlFragment(input.value);
  if (!validation.valid) {
    setValidationState(validation);
    return;
  }
  renderOutput(window.HtmlSimplifier.simplifyHtml(input.value));
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.textContent);
    copyButton.textContent = "Copied!";
    copyButton.classList.add("is-copied");
    window.setTimeout(() => {
      copyButton.textContent = "Copy";
      copyButton.classList.remove("is-copied");
    }, 1000);
  } catch {
    validationMessage.className = "validation-message is-invalid";
    validationMessage.textContent = "Clipboard access was blocked.";
  }
});

updateValidation();
