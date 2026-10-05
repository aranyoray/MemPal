import test from "node:test";
import assert from "node:assert/strict";
import { normalizeColoring } from "../public/memorie-color-state.js";
test("old backups open with safe coloring defaults", () => {
  assert.deepEqual(normalizeColoring(), {
    photoId: "sample",
    level: "gentle",
    assist: false,
    sessions: {},
  });
});
test("restored progress is bounded, unique, and cannot contain markup or prototype keys", () => {
  const key = JSON.stringify(["sample", "gentle", 1]);
  const value = JSON.parse('{"sessions":{"__proto__":{"filled":[0]}}}');
  value.sessions[key] = {
    filled: [0, 2, 2, -1, 999, "<script>", 1.2],
    updatedAt: Infinity,
  };
  value.sessions['["sample","bad",1]'] = { filled: [1] };
  const restored = normalizeColoring(value);
  assert.deepEqual(Object.keys(restored.sessions), [key]);
  assert.deepEqual(restored.sessions[key], {
    filled: [0, 2],
    updatedAt: 0,
    celebrated: false,
  });
});
