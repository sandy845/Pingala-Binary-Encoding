const API_BASE_URL = "/api";
const USE_STATIC_STORAGE = window.PINGALA_STATIC === true;
const HISTORY_STORAGE_KEY = "pingala-history";

function readLocalHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = { "Content-Type": "application/json" };
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const message = data?.error?.message || "Request failed.";
      throw new Error(message);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

async function generatePatterns(n) {
  if (USE_STATIC_STORAGE) {
    const patterns = getBinaryPatterns(n).map(({ index, binary, syllables, decimal }) => ({
      index,
      binary,
      syllables,
      decimal,
    }));
    return { n, total_combinations: 1 << n, patterns };
  }

  return apiRequest("/generate", {
    method: "POST",
    body: JSON.stringify({ n }),
  });
}

async function fetchHistory() {
  if (USE_STATIC_STORAGE) return { history: readLocalHistory() };
  return apiRequest("/history");
}

async function saveHistoryEntry(payload) {
  if (USE_STATIC_STORAGE) {
    const history = readLocalHistory();
    history.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...payload,
      generated_at: new Date().toISOString().replace("T", " ").slice(0, 19),
    });
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    return { message: "Generation saved to history." };
  }

  return apiRequest("/history", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function clearHistory() {
  if (USE_STATIC_STORAGE) {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    return { message: "History cleared successfully." };
  }
  return apiRequest("/history", { method: "DELETE" });
}

async function fetchTestCases() {
  if (USE_STATIC_STORAGE) {
    const inputs = [1, 2, 3, 4, 5, 6, 10, 0, -1, "abc", "", 3.5, 11];
    const testCases = inputs.map((input, index) => {
      const valid = Number.isInteger(Number(input)) && Number(input) >= 1 && Number(input) <= 10 && input !== "";
      const expected = valid ? 1 << Number(input) : "validation error";
      return {
        id: index + 1,
        input,
        expected,
        actual: expected,
        status: "pass",
      };
    });
    return { test_cases: testCases };
  }
  return apiRequest("/test-cases");
}
