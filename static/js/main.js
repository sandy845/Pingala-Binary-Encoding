const state = {
  currentPatterns: [],
  currentN: 3,
  lastGenerated: [],
};

const patternGrid = document.getElementById("patternGrid");
const searchInput = document.getElementById("searchInput");
const zeroFilter = document.getElementById("zeroFilter");
const oneFilter = document.getElementById("oneFilter");
const sortMode = document.getElementById("sortMode");
const visibleCount = document.getElementById("visibleCountText");
const comparisonPanel = document.getElementById("comparisonPanel");
const toggleButtons = document.querySelectorAll(".mode-btn");
const algorithmCode = document.getElementById("algorithmCode");
const patternModal = document.getElementById("patternModal");
const modalContent = document.getElementById("modalContent");

function renderPatternCards(patterns) {
  if (!patternGrid || !visibleCount) return;

  const fragment = document.createDocumentFragment();

  patterns.forEach((pattern) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "pattern-card";
    card.setAttribute("data-pattern-index", String(pattern.index));
    card.setAttribute("aria-label", `Pattern ${pattern.index}`);

    const binaryMarkup = pattern.binary
      .split("")
      .map((bit) => `<span class="bit ${bit === "0" ? "short" : "long"}">${bit}</span>`)
      .join("");

    card.innerHTML = `
      <div class="card-header">
        <span>Pattern #${pattern.index + 1}</span>
      </div>
      <div class="binary-display">${binaryMarkup}</div>
      <div class="syllable-text">${pattern.syllables.join(" ")}</div>
      <div class="decimal-text">Decimal: ${pattern.decimal}</div>
    `;

    card.addEventListener("click", () => openPatternModal(pattern));
    fragment.appendChild(card);
  });

  patternGrid.replaceChildren(fragment);
  const visible = patterns.length;
  visibleCount.textContent = `${visible} pattern${visible === 1 ? "" : "s"} visible`;
}

function renderPatternsFromState() {
  if (!searchInput || !zeroFilter || !oneFilter || !sortMode || !patternGrid) return;

  const patterns = filterPatterns(
    state.currentPatterns,
    searchInput.value,
    zeroFilter.value,
    oneFilter.value,
    sortMode.value
  );

  renderPatternCards(patterns);
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem("pingala-theme", theme);
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.innerHTML = theme === "dark" ? '<span class="theme-icon">🌙</span>' : '<span class="theme-icon">☀️</span>';
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("pingala-theme") || "light";
  setTheme(savedTheme);
}

function openPatternModal(pattern) {
  if (!patternModal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="detail-grid">
      <div><span class="detail-label">Pattern</span><strong>#${pattern.index + 1}</strong></div>
      <div><span class="detail-label">Binary</span><strong>${pattern.binary}</strong></div>
      <div><span class="detail-label">Short / Long</span><strong>${pattern.syllables.join(" / ")}</strong></div>
      <div><span class="detail-label">Decimal</span><strong>${pattern.decimal}</strong></div>
    </div>
  `;

  patternModal.classList.remove("hidden");
  patternModal.setAttribute("aria-hidden", "false");
}

function closePatternModal() {
  if (!patternModal) return;
  patternModal.classList.add("hidden");
  patternModal.setAttribute("aria-hidden", "true");
}

async function loadTestCases() {
  try {
    const response = await fetchTestCases();
    renderTestCases(response.test_cases || []);
  } catch (error) {
    showToast(error.message || "Unable to load test cases.", "error");
  }
}

async function loadHistory() {
  try {
    const response = await fetchHistory();
    renderHistory(response.history || []);
  } catch (error) {
    showToast(error.message || "Unable to load history.", "error");
  }
}

async function triggerGenerate() {
  const nInput = document.getElementById("nInput");
  if (!nInput) return;

  try {
    const n = validateNInput(nInput.value);
    setLoadingState(true);
    setFormMessage("Generating patterns...", "info");

    const response = await generatePatterns(n);
    state.currentPatterns = response.patterns.map((pattern) => ({
      ...pattern,
      n,
      zeros: pattern.binary.split("0").length - 1,
      ones: pattern.binary.split("1").length - 1,
    }));
    state.currentN = n;
    state.lastGenerated = response.patterns;

    renderPatternsFromState();
    updateStats({
      n,
      totalCombinations: response.total_combinations,
      generated: response.patterns.length,
      digitsPerPattern: n,
    });

    setFormMessage(`Successfully generated ${response.patterns.length} patterns.`, "success");
    showToast(`Successfully generated ${response.patterns.length} patterns.`, "success");

    try {
      await saveHistoryEntry({
        n,
        total_combinations: response.total_combinations,
      });
    } catch (error) {
      showToast("Pattern generation succeeded, but history was not saved.", "error");
    }

    await loadHistory();
  } catch (error) {
    setFormMessage(error.message || "Unable to generate patterns.", "error");
    showToast(error.message || "Unable to generate patterns.", "error");
  } finally {
    setLoadingState(false);
  }
}

function handleRandomExample() {
  const nInput = document.getElementById("nInput");
  if (!nInput) return;

  const randomN = Math.floor(Math.random() * MAX_N) + 1;
  nInput.value = randomN;
  triggerGenerate();
}

function handleClear() {
  if (!patternGrid || !visibleCount) return;

  state.currentPatterns = [];
  state.currentN = 0;
  state.lastGenerated = [];
  patternGrid.innerHTML = "";
  visibleCount.textContent = "0 patterns visible";
  updateStats({ n: 0, totalCombinations: 0, generated: 0, digitsPerPattern: 0 });
  setFormMessage("Generator cleared.", "info");
}

function handleComparisonToggle(mode) {
  if (!comparisonPanel) return;

  const panelText = {
    modern: "<strong>Modern MSB-First:</strong> Binary strings are displayed using the conventional modern representation where the leftmost position is the most significant bit.",
    historical: "<strong>Prastāra-Inspired Alignment:</strong> This visualization presents the syllable positions in a historically motivated left-to-right pattern layout. It is a conceptual visualization, not a claim that ancient notation was identical to modern binary notation.",
  };

  comparisonPanel.innerHTML = `<p class="comparison-copy">${panelText[mode]}</p>`;
  toggleButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
}

function handleAlgorithmToggle() {
  const algorithmCodeElement = document.getElementById("algorithmCode");
  const button = document.getElementById("toggleAlgorithmBtn");

  if (!algorithmCodeElement || !button) return;

  const isHidden = algorithmCodeElement.classList.toggle("hidden");
  button.textContent = isHidden ? "Show Algorithm" : "Hide Algorithm";
  button.setAttribute("aria-expanded", String(!isHidden));
}

function setupNavigation() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  setupNavigation();

  const themeToggleButton = document.getElementById("themeToggle");
  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
      const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });
  }

  const generateButton = document.getElementById("generateBtn");
  if (generateButton) {
    generateButton.addEventListener("click", triggerGenerate);
  }

  const clearButton = document.getElementById("clearBtn");
  if (clearButton) {
    clearButton.addEventListener("click", handleClear);
  }

  const randomButton = document.getElementById("randomBtn");
  if (randomButton) {
    randomButton.addEventListener("click", handleRandomExample);
  }

  const nInput = document.getElementById("nInput");
  if (nInput) {
    nInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") triggerGenerate();
    });
  }

  if (searchInput && zeroFilter && oneFilter && sortMode) {
    searchInput.addEventListener("input", renderPatternsFromState);
    zeroFilter.addEventListener("change", renderPatternsFromState);
    oneFilter.addEventListener("change", renderPatternsFromState);
    sortMode.addEventListener("change", renderPatternsFromState);

    const resetFiltersButton = document.getElementById("resetFiltersBtn");
    if (resetFiltersButton) {
      resetFiltersButton.addEventListener("click", () => {
        searchInput.value = "";
        zeroFilter.value = "all";
        oneFilter.value = "all";
        sortMode.value = "binary";
        renderPatternsFromState();
      });
    }
  }

  if (toggleButtons.length) {
    toggleButtons.forEach((button) =>
      button.addEventListener("click", () => handleComparisonToggle(button.dataset.mode))
    );
  }

  const algorithmButton = document.getElementById("toggleAlgorithmBtn");
  if (algorithmButton) {
    algorithmButton.addEventListener("click", handleAlgorithmToggle);
  }

  const modalCloseButton = document.querySelector(".modal-close");
  if (modalCloseButton) {
    modalCloseButton.addEventListener("click", closePatternModal);
  }

  if (patternModal) {
    patternModal.addEventListener("click", (event) => {
      if (event.target.dataset.close === "modal") closePatternModal();
    });
  }

  const clearHistoryButton = document.getElementById("clearHistoryBtn");
  if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", async () => {
      const confirmed = window.confirm("Clear all generation history?");
      if (!confirmed) return;

      try {
        await clearHistory();
        await loadHistory();
        showToast("History cleared successfully.", "success");
      } catch (error) {
        showToast(error.message || "Could not clear history.", "error");
      }
    });
  }

  const refreshHistoryButton = document.getElementById("refreshHistoryBtn");
  if (refreshHistoryButton) {
    refreshHistoryButton.addEventListener("click", loadHistory);
  }

  const historyList = document.getElementById("historyList");
  if (historyList) {
    historyList.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-view-history]");
      if (!button) return;
      const response = await fetchHistory();
      const historyItem = response.history.find((item) => String(item.id) === button.dataset.viewHistory);
      if (historyItem) {
        showToast(`Viewed n = ${historyItem.n} with ${historyItem.total_combinations} combinations.`, "info");
      }
    });
  }

  if (comparisonPanel) {
    handleComparisonToggle("modern");
  }

  if (patternGrid) {
    renderPatternsFromState();
    updateStats({ n: 3, totalCombinations: 8, generated: 0, digitsPerPattern: 3 });
  }

  loadTestCases();
  loadHistory();
});
