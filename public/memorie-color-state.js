/** Only restore bounded, validated activity data. Never restore HTML or generated paths. */
export function normalizeColoring(value) {
  const result = {
    photoId:
      typeof value?.photoId === "string"
        ? value.photoId.slice(0, 100)
        : "sample",
    level: ["gentle", "familiar", "detailed"].includes(value?.level)
      ? value.level
      : "gentle",
    assist: value?.assist === true,
    sessions: {},
  };
  if (value?.sessions && typeof value.sessions === "object") {
    for (const [key, entry] of Object.entries(value.sessions).slice(0, 500)) {
      let parsed;
      try {
        parsed = JSON.parse(key);
      } catch {
        continue;
      }
      if (
        !Array.isArray(parsed) ||
        parsed.length !== 3 ||
        typeof parsed[0] !== "string" ||
        parsed[0].length > 100 ||
        !["gentle", "familiar", "detailed"].includes(parsed[1]) ||
        parsed[2] !== 1 ||
        !Array.isArray(entry?.filled)
      )
        continue;
      result.sessions[key] = {
        filled: [
          ...new Set(
            entry.filled.filter(
              (n) => Number.isInteger(n) && n >= 0 && n < 500,
            ),
          ),
        ],
        updatedAt: Number.isFinite(entry.updatedAt) ? entry.updatedAt : 0,
        celebrated: entry.celebrated === true,
      };
    }
  }
  return result;
}
