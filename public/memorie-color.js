import { createColoring, LEVELS, textColor } from "./memorie-color-engine.js";
import { normalizeColoring } from "./memorie-color-state.js";

export function createMemorieColor({
  getState,
  save,
  log,
  toast,
  render,
  esc,
  photoDialog,
  help,
}) {
  const sample = {
    id: "sample",
    src: "./assets/family-sample.jpg",
    name: "Together by the sea",
    relationship: "A practice photo. Add a moment from your own life.",
  };
  let model = null,
    modelKey = "",
    selected = 0,
    generation = 0,
    busy = false;
  let zoomed = false;
  let focusMode = false,
    reference = false,
    undo = [],
    savePending = 0;
  const cache = new Map();
  function data() {
    const s = getState();
    if (!s.coloring) s.coloring = normalizeColoring();
    return s.coloring;
  }
  function photo() {
    return getState().photos.find((p) => p.id === data().photoId) || sample;
  }
  function sessionKey() {
    return JSON.stringify([photo().id, data().level, 1]);
  }
  function session() {
    const d = data(),
      key = sessionKey();
    if (!d.sessions[key])
      d.sessions[key] = { filled: [], updatedAt: 0, celebrated: false };
    return d.sessions[key];
  }
  function filled() {
    return new Set(session().filled);
  }
  async function persist() {
    const ticket = ++savePending;
    const status = document.querySelector("#mc-save");
    if (status) status.textContent = "Saving…";
    try {
      await save();
      if (ticket === savePending && document.querySelector("#mc-save"))
        document.querySelector("#mc-save").textContent = "Saved on this device";
    } catch {
      if (document.querySelector("#mc-save"))
        document.querySelector("#mc-save").textContent =
          "Could not save. Free some browser storage and try again.";
      toast(
        "Progress could not be saved. Keep this page open and check your browser storage.",
      );
    }
  }
  const action = (label, name, cls = "secondary", extra = "") =>
    `<button class="btn ${cls}" data-action="mc-${name}" ${extra}>${label}</button>`;

  function view() {
    const p = photo(),
      d = data();
    return `<div class="page-title mc-heading"><div><div class="mc-kicker"><span class="mc-palette-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span> FAMILIAR MOMENTS, A LITTLE MORE COLOR</div><h1>Memorie-Color<span class="mc-title-dot">.</span></h1><p>A photo you love. A color at a time. Entirely at your pace.</p></div>${action("Add a family photo", "upload", "")}</div>
    <section class="mc-workspace" aria-label="Photo coloring studio">
      <div class="mc-studio">
        <div class="mc-studio-top"><div><span class="mc-small-label">YOUR COLORING MOMENT</span><h2>${esc(p.name)}</h2></div><span class="mc-pace">No timer. No score.</span></div>
        <div id="mc-instructions" class="mc-instructions"><span class="mc-step">1</span><span>Choose a color below, then tap a shape with its number.</span></div>
        <div class="mc-canvas-wrap" id="mc-canvas-wrap"><div id="mc-board" aria-busy="true"><div class="mc-loading" role="status">Preparing your coloring page…</div></div><img class="mc-reference-overlay" id="mc-reference-overlay" src="${esc(p.src)}" alt="Original photo: ${esc(p.name)}" hidden></div>
        <div class="mc-progress-row"><span id="mc-progress-label">A fresh little beginning</span><span id="mc-save">Saved on this device</span></div>
        <div class="mc-progress" role="progressbar" aria-label="Coloring progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="mc-progress-fill"></span></div>
        <div id="mc-palette" class="mc-palette" aria-label="Numbered colors"></div>
        <p id="mc-message" class="mc-message" role="status" aria-live="polite">There is no rush. Make yourself comfortable.</p>
        <div class="mc-board-actions">${action("Color a matching shape", "next", "")}${action("Undo", "undo", "secondary", "disabled")}${action("Show original", "reference", "secondary", 'aria-pressed="false"')}${action("Larger shapes", "zoom", "secondary", 'aria-pressed="false"')}</div>
        <div id="mc-complete" class="mc-complete" hidden><span aria-hidden="true">✦</span><div><h3>A moment, made colorful.</h3><p>Enjoy it together. You can return to this memory any time.</p></div>${action("Save artwork", "download", "")}</div>
      </div>
      <aside class="mc-companion" aria-label="Photo and activity options">
        <figure class="mc-memory-photo"><img src="${esc(p.src)}" alt="${esc(p.name)}" loading="eager"><figcaption><span>${p.id === "sample" ? "PRACTICE PHOTO" : "YOUR FAMILIAR FACE"}</span><strong>${esc(p.name)}</strong><p>${esc(p.relationship)}</p></figcaption></figure>
        <div class="mc-options"><label class="field">Choose your moment<select id="mc-photo">${[sample, ...getState().photos].map((item) => `<option value="${esc(item.id)}" ${item.id === p.id ? "selected" : ""}>${esc(item.name)}${item.id === "sample" ? " · practice photo" : ""}</option>`).join("")}</select></label>
        <label class="field">Amount of detail<select id="mc-level">${Object.entries(
          LEVELS,
        )
          .map(
            ([key, value]) =>
              `<option value="${key}" ${d.level === key ? "selected" : ""}>${value.label} · up to ${value.colors} colors</option>`,
          )
          .join(
            "",
          )}</select></label><p class="mc-option-note">Gentle has fewer, larger shapes. Each detail level keeps its own progress.</p>
        <label class="mc-toggle"><input type="checkbox" id="mc-assist" ${d.assist ? "checked" : ""}><span><strong>Helping hand</strong><small>Tap any shape to fill it with its matching color.</small></span></label>
        <div class="mc-tool-list">${action(focusMode ? "Leave quiet view" : "Quiet view", "focus", "secondary", `aria-pressed="${focusMode}"`)}${action("Print a coloring sheet", "print")}${action("Start this page again", "restart")}</div></div>
        <div class="mc-conversation"><span class="mc-small-label">A MOMENT TO CONNECT</span><p id="mc-prompt">“What do you enjoy about this photo?”</p>${action("Another conversation starter", "prompt", "text-link")}<small>Share a feeling or a story. There’s no need to remember a name or a date.</small></div>
      </aside>
    </section>
    <div class="mc-quiet-bar">${action("Leave quiet view", "focus", "light")}${action("I need help", "help", "danger")}<span>Help requests are saved on this device.</span></div>
    <section class="card mc-library"><div class="card-head"><div><h2>Your moments</h2><p class="muted">Choose something familiar. A face, a favorite place, a shared afternoon.</p></div>${action("Add a photo", "upload", "secondary")}</div>${
      getState().photos.length
        ? `<div class="mc-photo-grid">${getState()
            .photos.map(
              (item) =>
                `<article class="mc-photo-card"><button class="mc-photo-pick" data-action="mc-photo" data-id="${esc(item.id)}" aria-label="Color ${esc(item.name)}"><img src="${esc(item.src)}" alt="" loading="lazy"><strong>${esc(item.name)}</strong><span>${esc(item.relationship)}</span></button><div class="mc-photo-manage"><button class="text-link" data-action="photo-edit" data-id="${esc(item.id)}">Edit label</button><button class="text-link" data-action="photo-delete" data-id="${esc(item.id)}">Remove</button></div></article>`,
            )
            .join("")}</div>`
        : `<div class="mc-library-empty"><span aria-hidden="true">♡</span><p>Your family photos will live here.<br><span class="muted">Try the practice photo above, or add your own.</span></p></div>`
    }<p class="note">Photos are processed and saved in this browser. They are never sent to an image service. A backup in Settings keeps a copy of your photos and coloring progress.</p></section>
    <details class="card mc-science"><summary><span><span class="mc-small-label">THE THINKING BEHIND MEMORIE-COLOR</span><strong>Familiarity, creativity, and connection.</strong></span><span aria-hidden="true">+</span></summary><div class="mc-science-grid"><article><span>01 / FAMILIARITY</span><h3>A memory can begin with a feeling.</h3><p>Family photos can invite reminiscence and a sense of identity. Enjoy the moment together without asking the person to prove what they remember.</p></article><article><span>02 / GENTLE PRACTICE</span><h3>A little focus, at a comfortable pace.</h3><p>Matching numbers and colors offers a simple attention task. Repeating a familiar activity may feel reassuring; use Helping hand whenever matching feels tiring.</p></article><article><span>03 / DIGNITY</span><h3>Their life is the starting point.</h3><p>Personal photos give the activity adult meaning. Offer a choice, follow their interests, and pause if a photo or activity brings discomfort.</p></article><article><span>04 / THE EVIDENCE</span><h3>Designed for wellbeing.</h3><p>Memorie-Color draws inspiration from reminiscence and creative activities. This app has not been clinically tested and is not shown to build cognitive reserve, reverse brain damage, prevent dementia, or slow its progression.</p></article></div><p class="note mc-sources">Read more: <a href="https://www.alz.org/help-support/caregiving/daily-care/reminiscence-and-reminiscence-therapy" target="_blank" rel="noopener noreferrer">Alzheimer’s Association · Reminiscence</a> <a href="https://www.nia.nih.gov/health/brain-health/cognitive-health-and-older-adults" target="_blank" rel="noopener noreferrer">National Institute on Aging · Cognitive health</a></p></details>`;
  }

  function svgMarkup(print = false) {
    if (!model) return "";
    const done = print ? new Set() : filled();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${model.width} ${model.height}" class="mc-art" role="group" aria-label="Color-by-number photo. Choose a numbered shape and press Enter to color it."><rect width="100%" height="100%" fill="#fffdf7"/>${model.regions.map((r) => `<g data-region="${r.id}" ${print ? "" : `role="button" tabindex="0" aria-label="Shape ${r.id + 1}, color ${r.color + 1}${done.has(r.id) ? ", colored" : ""}" aria-disabled="${done.has(r.id)}"`} class="mc-region ${done.has(r.id) ? "is-filled" : ""} ${r.color === selected ? "is-selected" : ""}"><path d="${r.path}" fill="${done.has(r.id) ? model.palette[r.color] : "#fffdf7"}" stroke="#80918a" stroke-width=".17" stroke-linejoin="round" fill-rule="evenodd"/><text x="${r.x}" y="${r.y}" text-anchor="middle" dominant-baseline="central" font-size="${Math.max(2, model.width / 44)}" font-family="Arial,sans-serif" font-weight="600" fill="#243b35" ${done.has(r.id) ? 'visibility="hidden"' : ""}>${r.color + 1}</text></g>`).join("")}</svg>`;
  }
  async function mount() {
    const ticket = ++generation;
    resizeObserver.disconnect();
    zoomed = false;
    busy = true;
    reference = false;
    undo = [];
    selected = 0;
    document.body.classList.toggle("color-focus", focusMode);
    const key = sessionKey();
    try {
      if (key !== modelKey) {
        const src = photo().src;
        const result =
          cache.get(key) || (await createColoring(src, data().level));
        if (ticket !== generation || !document.querySelector("#mc-board"))
          return;
        model = result;
        modelKey = key;
        cache.set(key, model);
        if (cache.size > 6) cache.delete(cache.keys().next().value);
      }
      if (ticket !== generation || !document.querySelector("#mc-board")) return;
      // Filter obsolete or malformed progress; the image model is always regenerated locally.
      session().filled = session().filled.filter(
        (id) => Number.isInteger(id) && id >= 0 && id < model.regions.length,
      );
      selected = model.regions.find((r) => !filled().has(r.id))?.color || 0;
      document.querySelector("#mc-board").innerHTML = svgMarkup();
      document.querySelector("#mc-board").setAttribute("aria-busy", "false");
      busy = false;
      update();
      resizeObserver.observe(document.querySelector("#mc-board"));
      resizeLabels();
    } catch (error) {
      if (ticket !== generation || !document.querySelector("#mc-board")) return;
      busy = true;
      document.querySelector("#mc-board").setAttribute("aria-busy", "false");
      document.querySelector("#mc-board").innerHTML =
        `<div class="mc-loading"><p>${esc(error.message)}</p>${action("Try again", "retry", "")}</div>`;
      document
        .querySelectorAll(
          '[data-action="mc-next"], [data-action="mc-print"], [data-action="mc-reference"]',
        )
        .forEach((button) => (button.disabled = true));
    }
  }
  function resizeLabels() {
    const svg = document.querySelector("#mc-board svg");
    if (!svg || !model) return;
    const width = svg.getBoundingClientRect().width;
    if (!width) return;
    svg
      .querySelectorAll("text")
      .forEach((label) =>
        label.setAttribute(
          "font-size",
          Math.max(2.2, (model.width / width) * 15),
        ),
      );
  }
  const resizeObserver = new ResizeObserver(resizeLabels);
  function update() {
    if (!model || !document.querySelector("#mc-board")) return;
    const done = filled(),
      count = done.size,
      total = model.regions.length,
      percent = Math.round((count / total) * 100);
    document.querySelector("#mc-progress-label").textContent =
      `${count} of ${total} shapes colored`;
    document.querySelector("#mc-progress-fill").style.width = percent + "%";
    document
      .querySelector(".mc-progress")
      .setAttribute("aria-valuenow", percent);
    for (const r of model.regions) {
      const el = document.querySelector(`[data-region="${r.id}"]`);
      if (!el) continue;
      el.classList.toggle("is-filled", done.has(r.id));
      el.classList.toggle("is-selected", r.color === selected);
      el.setAttribute("aria-disabled", String(done.has(r.id)));
      el.setAttribute(
        "aria-label",
        `Shape ${r.id + 1}, color ${r.color + 1}${done.has(r.id) ? ", colored" : ""}`,
      );
      el.querySelector("path").setAttribute(
        "fill",
        done.has(r.id) ? model.palette[r.color] : "#fffdf7",
      );
      el.querySelector("text").setAttribute(
        "visibility",
        done.has(r.id) ? "hidden" : "visible",
      );
    }
    const palette = document.querySelector("#mc-palette");
    // Keep palette buttons in place so keyboard focus survives a color selection.
    if (palette.children.length !== model.palette.length)
      palette.innerHTML = model.palette
        .map(
          (color, i) =>
            `<button class="mc-swatch" data-action="mc-color" data-color="${i}" style="--swatch:${color};--swatch-text:${textColor(color)}"><span>${i + 1}</span><small></small></button>`,
        )
        .join("");
    model.palette.forEach((_, i) => {
      const button = palette.children[i],
        left = model.regions.filter(
          (r) => r.color === i && !done.has(r.id),
        ).length;
      button.classList.toggle("active", selected === i);
      button.setAttribute("aria-pressed", String(selected === i));
      button.setAttribute(
        "aria-label",
        `Color ${i + 1}, ${left} shapes remaining`,
      );
      button.querySelector("small").textContent = left
        ? `${left} left`
        : "Complete";
    });
    document.querySelector("#mc-instructions").innerHTML =
      `<span class="mc-step">${data().assist ? "♡" : selected + 1}</span><span>${count === total ? "Your coloring is complete. Take a moment to enjoy it." : data().assist ? "Helping hand is on. Tap any shape and its color will appear." : `Color ${selected + 1} is ready. Tap a shape marked ${selected + 1}.`}</span>`;
    document.querySelector('[data-action="mc-next"]').disabled =
      count === total || reference;
    document.querySelector('[data-action="mc-next"]').textContent = data()
      .assist
      ? "Color the next shape"
      : "Color a matching shape";
    document.querySelector('[data-action="mc-undo"]').disabled =
      !undo.length || reference;
    document.querySelector("#mc-complete").hidden = count !== total;
  }
  function message(text) {
    const el = document.querySelector("#mc-message");
    if (el) el.textContent = text;
  }
  async function colorRegion(regionId) {
    if (busy || reference || !model) return;
    const region = model.regions.find((r) => r.id === regionId);
    if (!region || filled().has(regionId)) return;
    if (!data().assist && region.color !== selected) {
      message(
        `This shape uses color ${region.color + 1}. Choose ${region.color + 1} below, or try a shape marked ${selected + 1}.`,
      );
      return;
    }
    if (data().assist) selected = region.color;
    session().filled.push(regionId);
    session().updatedAt = Date.now();
    undo.push(regionId);
    if (session().filled.length === model.regions.length) {
      message("A lovely moment, finished in your own time.");
      if (!session().celebrated) {
        log("Completed a Memorie-Color page: " + photo().name);
        session().celebrated = true;
      }
    } else
      message(
        [
          "A little more color. Take your time.",
          "A lovely little step.",
          "One shape at a time.",
        ][session().filled.length % 3],
      );
    update();
    await persist();
  }
  function selectPhoto(id) {
    if (id !== sample.id && !getState().photos.some((p) => p.id === id)) return;
    data().photoId = id;
    render();
    void persist();
  }
  function printSheet() {
    if (!model || busy) return;
    document.querySelector("#mc-print-sheet")?.remove();
    const sheet = document.createElement("section");
    sheet.id = "mc-print-sheet";
    sheet.innerHTML = `<h1>Memorie-Color</h1><h2>${esc(photo().name)}</h2><p>${esc(photo().relationship)}</p>${svgMarkup(true)}<div class="mc-print-palette">${model.palette.map((c, i) => `<span><i style="background:${c};color:${textColor(c)}">${i + 1}</i><b>${i + 1}</b></span>`).join("")}</div><p>Match a number to its color. Take your time and enjoy the moment.</p>`;
    document.body.append(sheet);
    window.print();
  }
  function downloadArt() {
    if (!model || busy) return;
    const url = URL.createObjectURL(
      new Blob([svgMarkup().replace(/tabindex="0"/g, "")], {
        type: "image/svg+xml",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "Memorie-Color.svg";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  let promptIndex = 0;
  const prompts = [
    "“What do you enjoy about this photo?”",
    "“These colors remind me of a lovely day. How do they feel to you?”",
    "“I’m happy to spend this moment with you.”",
    "“Would you like to tell a story, or just color together?”",
  ];
  document.addEventListener("click", async (event) => {
    const region = event.target.closest("[data-region]");
    if (region && region.closest("#mc-board")) {
      await colorRegion(Number(region.dataset.region));
      return;
    }
    const button = event.target.closest('[data-action^="mc-"]');
    if (!button || button.disabled) return;
    const name = button.dataset.action.slice(3);
    try {
      if (name === "upload") photoDialog();
      if (name === "photo") selectPhoto(button.dataset.id);
      if (name === "retry") await mount();
      if (name === "color" && !busy) {
        selected = Number(button.dataset.color);
        update();
        message(
          `Color ${selected + 1} selected. Matching shapes have a green outline.`,
        );
      }
      if (name === "next" && !busy) {
        let next = model.regions.find(
          (r) => !filled().has(r.id) && (data().assist || r.color === selected),
        );
        if (!next) {
          message(
            "All shapes of this color are finished. Choose another color below.",
          );
          return;
        }
        await colorRegion(next.id);
      }
      if (name === "undo" && undo.length) {
        const last = undo.pop();
        session().filled = session().filled.filter((id) => id !== last);
        session().updatedAt = Date.now();
        update();
        message("Your last shape is ready to color again.");
        await persist();
      }
      if (name === "reference" && !busy) {
        reference = !reference;
        document.querySelector("#mc-reference-overlay").hidden = !reference;
        document.querySelector("#mc-board").inert = reference;
        button.textContent = reference ? "Back to coloring" : "Show original";
        button.setAttribute("aria-pressed", String(reference));
        update();
      }
      if (name === "zoom" && !busy) {
        zoomed = !zoomed;
        document
          .querySelector("#mc-canvas-wrap")
          .classList.toggle("mc-zoomed", zoomed);
        button.textContent = zoomed ? "Fit to screen" : "Larger shapes";
        button.setAttribute("aria-pressed", String(zoomed));
        resizeLabels();
        message(
          zoomed
            ? "The shapes are larger. Scroll across the picture to explore."
            : "The whole picture is in view.",
        );
      }
      if (name === "focus") {
        focusMode = !focusMode;
        document.body.classList.toggle("color-focus", focusMode);
        const toggle = document.querySelector(
          '.mc-tool-list [data-action="mc-focus"]',
        );
        toggle.textContent = focusMode ? "Leave quiet view" : "Quiet view";
        toggle.setAttribute("aria-pressed", String(focusMode));
        if (!focusMode) toggle.focus();
      }
      if (name === "help") await help();
      if (name === "prompt") {
        promptIndex = (promptIndex + 1) % prompts.length;
        document.querySelector("#mc-prompt").textContent = prompts[promptIndex];
      }
      if (name === "print") printSheet();
      if (name === "download") downloadArt();
      if (
        name === "restart" &&
        !busy &&
        confirm(
          "Start this coloring page again? The saved coloring for this photo and detail level will be cleared.",
        )
      ) {
        session().filled = [];
        session().celebrated = false;
        session().updatedAt = Date.now();
        undo = [];
        reference = false;
        render();
        await persist();
      }
    } catch (error) {
      toast(error.message || "Please try that again.");
    }
  });
  document.addEventListener("keydown", (event) => {
    const region = event.target.closest("[data-region]");
    if (region?.closest("#mc-board") && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (!event.repeat) void colorRegion(Number(region.dataset.region));
    }
    if (
      event.key === "Escape" &&
      focusMode &&
      !document.querySelector("dialog[open]")
    ) {
      focusMode = false;
      document.body.classList.remove("color-focus");
      document.querySelector('.mc-tool-list [data-action="mc-focus"]')?.focus();
      const b = document.querySelector(
        '.mc-tool-list [data-action="mc-focus"]',
      );
      if (b) {
        b.textContent = "Quiet view";
        b.setAttribute("aria-pressed", "false");
      }
    }
  });
  document.addEventListener("change", (event) => {
    if (event.target.id === "mc-photo") selectPhoto(event.target.value);
    if (event.target.id === "mc-level" && LEVELS[event.target.value]) {
      data().level = event.target.value;
      render();
      void persist();
    }
    if (event.target.id === "mc-assist") {
      data().assist = event.target.checked;
      update();
      void persist();
    }
  });
  window.addEventListener("hashchange", () => {
    if (location.hash !== "#photos" && location.hash !== "#color") {
      generation++;
      focusMode = false;
      document.body.classList.remove("color-focus");
    }
  });
  window.addEventListener("afterprint", () =>
    document.querySelector("#mc-print-sheet")?.remove(),
  );
  return {
    view,
    mount,
    invalidate() {
      generation++;
      cache.clear();
      model = null;
      modelKey = "";
    },
    normalize: normalizeColoring,
    selectPhoto,
    removePhoto(id) {
      for (const key of Object.keys(data().sessions)) {
        try {
          if (JSON.parse(key)[0] === id) delete data().sessions[key];
        } catch {
          delete data().sessions[key];
        }
      }
      if (data().photoId === id) data().photoId = "sample";
      cache.clear();
      modelKey = "";
    },
  };
}
