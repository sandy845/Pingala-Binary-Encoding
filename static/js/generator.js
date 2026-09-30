const MAX_N = 10;

function getBinaryPatterns(n) {
  const total = 1 << n;
  return Array.from({ length: total }, (_, index) => {
    const binary = index.toString(2).padStart(n, "0");
    const syllables = binary.split("").map((bit) => (bit === "0" ? "Short" : "Long"));
    return {
      index,
      binary,
      syllables,
      decimal: parseInt(binary, 2),
      zeros: binary.split("0").length - 1,
      ones: binary.split("1").length - 1,
    };
  });
}

function validateNInput(value) {
  const numeric = Number(value);

  if (!Number.isInteger(numeric) || numeric < 1 || numeric > MAX_N) {
    throw new Error("Please enter an integer between 1 and 10.");
  }

  return numeric;
}

function filterPatterns(patterns, searchTerm, zeroFilter, oneFilter, sortMode) {
  const query = searchTerm.trim().toLowerCase();

  const filtered = patterns.filter((pattern) => {
    const patternText = `${pattern.binary} ${pattern.syllables.join(" ")}`.toLowerCase();
    const matchesText = !query || patternText.includes(query);
    const matchesZeros = zeroFilter === "all" || pattern.zeros === Number(zeroFilter);
    const matchesOnes = oneFilter === "all" || pattern.ones === Number(oneFilter);
    return matchesText && matchesZeros && matchesOnes;
  });

  if (sortMode === "decimal") {
    return [...filtered].sort((a, b) => a.decimal - b.decimal);
  }

  return [...filtered].sort((a, b) => a.binary.localeCompare(b.binary));
}

function computeSummary(patterns) {
  return {
    totalPatterns: patterns.length,
    totalCombinations: 1 << patterns[0]?.n || 0,
  };
}
