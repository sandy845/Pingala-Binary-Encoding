const API_BASE_URL = "/api";

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
  return apiRequest("/generate", {
    method: "POST",
    body: JSON.stringify({ n }),
  });
}

async function fetchHistory() {
  return apiRequest("/history");
}

async function saveHistoryEntry(payload) {
  return apiRequest("/history", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function clearHistory() {
  return apiRequest("/history", { method: "DELETE" });
}

async function fetchTestCases() {
  return apiRequest("/test-cases");
}
