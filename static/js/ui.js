function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function setFormMessage(message, type = "info") {
  const element = document.getElementById("formMessage");
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`;
}

function updateStats({ n, totalCombinations, generated, digitsPerPattern }) {
  const positions = document.getElementById("statPositions");
  const combinations = document.getElementById("statCombinations");
  const generatedEl = document.getElementById("statGenerated");
  const digits = document.getElementById("statDigits");

  if (positions) positions.textContent = String(n || 0);
  if (combinations) combinations.textContent = String(totalCombinations || 0);
  if (generatedEl) generatedEl.textContent = String(generated || 0);
  if (digits) digits.textContent = String(digitsPerPattern || 0);
}

function setLoadingState(isLoading) {
  const generateBtn = document.getElementById("generateBtn");
  if (!generateBtn) return;

  generateBtn.disabled = isLoading;
  generateBtn.textContent = isLoading ? "Generating..." : "Generate Patterns";
}

function renderHistory(records) {
  const container = document.getElementById("historyList");
  if (!container) return;

  if (!records.length) {
    container.innerHTML = '<div class="empty-state">No generation history yet.</div>';
    return;
  }

  const markup = records
    .map(
      (item) => `
        <article class="history-item">
          <div>
            <strong>${item.generated_at}</strong>
            <p>n = ${item.n} | ${item.total_combinations} combinations</p>
          </div>
          <button class="button ghost small" data-view-history="${item.id}">View</button>
        </article>
      `
    )
    .join("");

  container.innerHTML = markup;
}

function renderTestCases(testCases) {
  const tableBody = document.getElementById("testCasesTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = testCases
    .map(
      (test) => `
        <tr>
          <td>${test.id}</td>
          <td>${String(test.input)}</td>
          <td>${String(test.expected)}</td>
          <td>${String(test.actual ?? "—")}</td>
          <td><span class="status-pill ${test.status}">${test.status}</span></td>
        </tr>
      `
    )
    .join("");
}

function setupRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

window.addEventListener("DOMContentLoaded", () => {
  setupRevealAnimations();
});
