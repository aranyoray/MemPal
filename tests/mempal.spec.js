import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const samplePath = resolve("public/assets/family-sample.jpg");
const action = (page, name) => page.locator(`[data-action="mc-${name}"]`);
async function openColor(page) {
  await page.goto("/#photos");
  await expect(page.locator("#mc-board")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator(".mc-region").first()).toBeVisible();
}
const progress = (page) => page.locator("#mc-progress-label");

test("color matching, keyboard input, undo, and reference view work without scoring", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openColor(page);
  const first = page.locator(".mc-region").first();
  const label = await first.getAttribute("aria-label");
  const color = Number(label.match(/color (\d+)/)[1]) - 1;
  await action(page, "color")
    .nth((color + 1) % (await action(page, "color").count()))
    .click();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(progress(page)).toContainText("0 of");
  await expect(page.locator("#mc-message")).toContainText(
    "This shape uses color",
  );
  await action(page, "color").nth(color).click();
  await first.focus();
  await page.keyboard.press("Space");
  await expect(progress(page)).toContainText("1 of");
  await expect(first).toHaveAttribute("aria-disabled", "true");
  await action(page, "reference").click();
  await expect(page.locator("#mc-reference-overlay")).toBeVisible();
  await expect(action(page, "next")).toBeDisabled();
  await action(page, "reference").click();
  await action(page, "undo").click();
  await expect(progress(page)).toContainText("0 of");
  await expect(action(page, "undo")).toBeDisabled();
  expect(errors).toEqual([]);
});

test("progress survives reload and each detail level has separate progress", async ({
  page,
}) => {
  await openColor(page);
  await page.locator("#mc-assist").check();
  await action(page, "next").click();
  await action(page, "next").click();
  await expect(page.locator("#mc-save")).toHaveText("Saved on this device");
  await page.reload();
  await expect(progress(page)).toContainText("2 of");
  await expect(page.locator("#mc-assist")).toBeChecked();
  await page.selectOption("#mc-level", "detailed");
  await expect(page.locator("#mc-board")).toHaveAttribute("aria-busy", "false");
  await expect(progress(page)).toContainText("0 of");
  await action(page, "next").click();
  await page.selectOption("#mc-level", "gentle");
  await expect(page.locator("#mc-board")).toHaveAttribute("aria-busy", "false");
  await expect(progress(page)).toContainText("2 of");
});

test("completion saves a single activity, exports SVG, and restart clears the page", async ({
  page,
}) => {
  await openColor(page);
  await page.locator("#mc-assist").check();
  const count = await page.locator(".mc-region").count();
  for (let i = 0; i < count; i++) await action(page, "next").click();
  await expect(page.locator("#mc-complete")).toBeVisible();
  await expect(page.locator(".mc-progress")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  const downloading = page.waitForEvent("download");
  await action(page, "download").click();
  const file = await downloading;
  expect(await readFile(await file.path(), "utf8")).toContain("<svg");
  await page.goto("/#activity");
  await expect(
    page.getByText("Completed a Memorie-Color page:", { exact: false }),
  ).toHaveCount(1);
  await page.goto("/#photos");
  await expect(page.locator("#mc-complete")).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await action(page, "restart").click();
  await expect(progress(page)).toContainText("0 of");
});

test("family photo upload, caption editing and removal stay connected to the coloring library", async ({
  page,
}) => {
  await openColor(page);
  await action(page, "upload").first().click();
  await page.locator('input[name="photo"]').setInputFiles(samplePath);
  await page.locator('input[name="name"]').fill("Grandma & <Family>");
  await page
    .locator('input[name="relationship"]')
    .fill("Our afternoon together");
  await page.getByRole("button", { name: "Save photo", exact: true }).click();
  await expect(page.locator("dialog")).not.toBeVisible();
  await expect(page.locator(".mc-studio-top h2")).toHaveText(
    "Grandma & <Family>",
  );
  await expect(page.locator("#mc-board")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator(".mc-photo-card")).toHaveCount(1);
  await page.locator('[data-action="photo-edit"]').click();
  await page.locator('input[name="name"]').fill("Grandma");
  await page.getByRole("button", { name: "Save photo", exact: true }).click();
  await expect(page.locator(".mc-studio-top h2")).toHaveText("Grandma");
  page.once("dialog", (d) => d.accept());
  await page.locator('[data-action="photo-delete"]').click();
  await expect(page.locator(".mc-studio-top h2")).toHaveText(
    "Together by the sea",
  );
  await expect(page.locator(".mc-photo-card")).toHaveCount(0);
});

test("photo errors leave the upload form recoverable", async ({ page }) => {
  await openColor(page);
  await action(page, "upload").first().click();
  await page
    .locator('input[name="photo"]')
    .setInputFiles({
      name: "broken.png",
      mimeType: "image/png",
      buffer: Buffer.from("not an image"),
    });
  await page.locator('input[name="name"]').fill("Test");
  await page.locator('input[name="relationship"]').fill("Family");
  await page.getByRole("button", { name: "Save photo", exact: true }).click();
  await expect(page.locator("#form-error")).toContainText(
    "could not be opened",
  );
  await expect(
    page.getByRole("button", { name: "Save photo", exact: true }),
  ).toBeEnabled();
});

test("backup restores photos, reminders and coloring, including original-format backups", async ({
  page,
}) => {
  await openColor(page);
  await action(page, "next").click();
  await expect(page.locator("#mc-save")).toHaveText("Saved on this device");
  await page.goto("/#settings");
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download a full backup" }).click();
  const file = await downloading;
  const backup = JSON.parse(await readFile(await file.path(), "utf8"));
  expect(Object.values(backup.state.coloring.sessions)[0].filled).toHaveLength(
    1,
  );
  await page.goto("/#photos");
  page.once("dialog", (d) => d.accept());
  await action(page, "restart").click();
  await expect(progress(page)).toContainText("0 of");
  await page.goto("/#settings");
  page.once("dialog", (d) => d.accept());
  await page
    .locator("#restore-file")
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup)),
    });
  await expect(page.locator("#toast")).toHaveText("Backup restored.");
  await page.goto("/#photos");
  await expect(progress(page)).toContainText("1 of");
  delete backup.state.coloring;
  await page.goto("/#settings");
  page.once("dialog", (d) => d.accept());
  await page
    .locator("#restore-file")
    .setInputFiles({
      name: "old-backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup)),
    });
  await expect(page.locator("#toast")).toHaveText("Backup restored.");
  await page.goto("/#photos");
  await expect(progress(page)).toContainText("0 of");
});

test("quiet view exits by Escape and help remains local", async ({ page }) => {
  await openColor(page);
  await page.locator('.mc-tool-list [data-action="mc-focus"]').click();
  await expect(page.locator(".sidebar")).not.toBeVisible();
  await action(page, "help").click();
  await expect(page.locator("#toast")).toContainText("saved on this device");
  await page.keyboard.press("Escape");
  await expect(page.locator(".sidebar")).toBeVisible();
  await page.goto("/#alerts");
  await expect(
    page.getByRole("button", { name: "Acknowledge", exact: true }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Acknowledge", exact: true }).click();
  await expect(page.locator(".event-row .pill")).toHaveText("Acknowledged");
});

test("printing produces an unfilled sheet and a numbered palette", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.print = () => {
      window.__printed = true;
    };
  });
  await openColor(page);
  await action(page, "next").click();
  await action(page, "print").click();
  expect(await page.evaluate(() => window.__printed)).toBe(true);
  await expect(page.locator("#mc-print-sheet svg .is-filled")).toHaveCount(0);
  expect(
    await page.locator("#mc-print-sheet .mc-print-palette i").count(),
  ).toBeGreaterThan(1);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#mc-print-sheet")).toBeVisible();
  await expect(page.locator(".shell")).not.toBeVisible();
});

test("original reminder, Brain Check and falling-tile flows still work", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#reminders");
  await page
    .getByRole("button", { name: "Add a reminder", exact: true })
    .click();
  await page.locator('input[name="title"]').fill("A glass of water");
  await page
    .getByRole("button", { name: "Save reminder", exact: true })
    .click();
  await expect(page.locator(".row-main strong")).toHaveText("A glass of water");
  await page.goto("/#brain");
  await page.getByRole("button", { name: "Learn with a guided round" }).click();
  await page.getByRole("button", { name: "I’ve remembered it" }).click();
  for (const [i, answer] of [
    "Match (right)",
    "Different (left)",
    "Match (right)",
    "Different (left)",
  ].entries()) {
    await page.getByRole("button", { name: answer, exact: true }).click();
    await page
      .getByRole("button", {
        name: i === 3 ? "Start my session" : "Next example",
        exact: true,
      })
      .click();
  }
  await expect(page.locator("#game-content")).toContainText(
    "0 of 24 decisions complete",
  );
  await page.goto("/#tiles");
  await page.getByRole("button", { name: "Start a round" }).click();
  await expect(page.locator("#tile-overlay")).not.toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.locator("#tile-overlay")).toContainText("Paused");
  expect(errors).toEqual([]);
});

test("segmentation covers every pixel, handles a single-color portrait and is deterministic", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { createColoring } = await import("/memorie-color-engine.js");
    const a = await createColoring("/assets/family-sample.jpg");
    const b = await createColoring("/assets/family-sample.jpg");
    const canvas = document.createElement("canvas");
    canvas.width = 40;
    canvas.height = 80;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#678";
    ctx.fillRect(0, 0, 40, 80);
    const flat = await createColoring(canvas.toDataURL());
    return {
      same: JSON.stringify(a) === JSON.stringify(b),
      total: a.regions.reduce((n, r) => n + r.area, 0),
      pixels: a.width * a.height,
      regions: a.regions.length,
      flatRegions: flat.regions.length,
      portrait: flat.height > flat.width,
      valid: a.regions.every(
        (r) =>
          r.path.startsWith("M") &&
          !r.path.includes("NaN") &&
          r.color < a.palette.length,
      ),
    };
  });
  expect(result).toMatchObject({
    same: true,
    valid: true,
    flatRegions: 1,
    portrait: true,
  });
  expect(result.total).toBe(result.pixels);
  expect(result.regions).toBeLessThanOrEqual(28);
});

test("mobile and enlarged text remain within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openColor(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/memorie-color-mobile.png",
    fullPage: true,
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "32px";
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(action(page, "next")).toBeVisible();
});

test("mobile shape numbers stay readable and enlarged canvas can return to fit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openColor(page);
  const labelPixels = () =>
    page.locator("#mc-board svg").evaluate((svg) => {
      const text = svg.querySelector("text");
      return (
        (Number(text.getAttribute("font-size")) *
          svg.getBoundingClientRect().width) /
        svg.viewBox.baseVal.width
      );
    });
  await expect.poll(labelPixels).toBeGreaterThanOrEqual(14.9);
  await action(page, "zoom").click();
  await expect(page.locator("#mc-canvas-wrap")).toHaveClass(/mc-zoomed/);
  await expect(action(page, "zoom")).toHaveText("Fit to screen");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await action(page, "zoom").click();
  await expect(page.locator("#mc-canvas-wrap")).not.toHaveClass(/mc-zoomed/);
});
