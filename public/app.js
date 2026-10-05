import { createMemorieColor } from "./memorie-color.js";

("use strict");
let tiles = null,
  tileTimer = null,
  tileBag = [];
const tileShapes = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
];
const tileColors = [
  "#5cc5c5",
  "#f2c25d",
  "#a18ddd",
  "#74bf86",
  "#ee8880",
  "#6c9ed9",
  "#e5aa72",
];
function tilesView() {
  return (
    heading(
      "Falling tiles",
      "Fit the blocks together. Fill a row to clear it.",
    ) +
    `<section class="card tiles-layout"><div class="tile-board-wrap"><canvas id="tile-board" width="300" height="540" tabindex="0" aria-label="Falling tiles game board. Use left and right to move, up to rotate, down to descend, space to drop, and P to pause."></canvas><div id="tile-overlay" class="tile-overlay"></div></div><div class="tile-info"><span class="pill">A LITTLE SPATIAL PRACTICE</span><h2 style="margin:20px 0 12px">Make room for the next one.</h2><p class="muted">Move and rotate each falling block to fill a horizontal row with no gaps. Full rows disappear. The round ends if the blocks reach the top.</p><div class="tile-stats"><div><span>Score</span><strong id="tile-score">0</strong></div><div><span>Rows cleared</span><strong id="tile-lines">0</strong></div></div><p class="muted">Next block</p><canvas id="tile-next" width="150" height="90" aria-label="Next falling block"></canvas><div class="tile-actions">${btn("Start a round", "tile-start")} ${btn("Pause", "tile-pause", "secondary")}</div><div class="tile-controls"><button class="btn secondary" data-action="tile-left" aria-label="Move block left">Left</button><button class="btn secondary" data-action="tile-rotate">Rotate</button><button class="btn secondary" data-action="tile-right" aria-label="Move block right">Right</button><button class="btn secondary" data-action="tile-down">Down</button><button class="btn" data-action="tile-drop">Drop into place</button></div><p class="note">Keyboard: left/right to move, up to rotate, down to descend, Space to drop, P to pause. The outlined block shows where your piece will land.</p><p class="note">Play for enjoyment. This game does not assess cognitive health.</p><div id="tile-status" class="note" role="status" aria-live="polite"></div></div></section>`
  );
}
function randomTile() {
  if (!tileBag.length)
    tileBag = [0, 1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
  const color = tileBag.pop();
  return { matrix: tileShapes[color].map((r) => r.slice()), color };
}
function startTiles() {
  clearInterval(tileTimer);
  tileBag = [];
  tiles = {
    board: Array.from({ length: 18 }, () => Array(10).fill(null)),
    piece: null,
    next: randomTile(),
    score: 0,
    lines: 0,
    paused: false,
    over: false,
  };
  spawnTile();
  scheduleTiles();
  drawTiles();
  document.querySelector("#tile-board")?.focus();
}
function spawnTile() {
  tiles.piece = { ...tiles.next, x: 3, y: 0 };
  tiles.next = randomTile();
  if (!validTile(tiles.piece.matrix, tiles.piece.x, tiles.piece.y)) {
    tiles.over = true;
    clearInterval(tileTimer);
  }
}
function validTile(matrix, x, y) {
  return matrix.every((r, j) =>
    r.every(
      (v, i) =>
        !v ||
        (x + i >= 0 &&
          x + i < 10 &&
          y + j >= 0 &&
          y + j < 18 &&
          tiles.board[y + j][x + i] === null),
    ),
  );
}
function scheduleTiles() {
  clearInterval(tileTimer);
  if (tiles && !tiles.over && !tiles.paused)
    tileTimer = setInterval(
      () => moveTile(0, 1),
      Math.max(450, 1100 - Math.floor(tiles.lines / 5) * 90),
    );
}
function activeTiles() {
  return tiles && !tiles.over && !tiles.paused && page === "tiles";
}
function moveTile(dx, dy) {
  if (!activeTiles()) return;
  let p = tiles.piece;
  if (validTile(p.matrix, p.x + dx, p.y + dy)) {
    p.x += dx;
    p.y += dy;
  } else if (dy) lockTile();
  drawTiles();
}
function rotateTile() {
  if (!activeTiles()) return;
  let p = tiles.piece,
    m = p.matrix[0].map((_, i) => p.matrix.map((r) => r[i]).reverse());
  for (let offset of [0, -1, 1, -2, 2])
    if (validTile(m, p.x + offset, p.y)) {
      p.matrix = m;
      p.x += offset;
      break;
    }
  drawTiles();
}
function dropTile() {
  if (!activeTiles()) return;
  let p = tiles.piece;
  while (validTile(p.matrix, p.x, p.y + 1)) {
    p.y++;
    tiles.score += 2;
  }
  lockTile();
  drawTiles();
}
function lockTile() {
  const p = tiles.piece;
  for (let j = 0; j < p.matrix.length; j++)
    for (let i = 0; i < p.matrix[j].length; i++)
      if (p.matrix[j][i]) tiles.board[p.y + j][p.x + i] = p.color;
  let remaining = tiles.board.filter((row) => row.some((c) => c === null)),
    cleared = 18 - remaining.length;
  if (cleared) {
    tiles.lines += cleared;
    tiles.score += 100 * cleared * cleared;
    while (remaining.length < 18) remaining.unshift(Array(10).fill(null));
    tiles.board = remaining;
    const status = document.querySelector("#tile-status");
    if (status)
      status.textContent = `${cleared} ${cleared === 1 ? "row" : "rows"} cleared. Nice work!`;
    scheduleTiles();
  }
  spawnTile();
}
function pauseTiles() {
  if (tiles && !tiles.over) {
    tiles.paused = true;
    clearInterval(tileTimer);
    if (typeof page !== "undefined" && page === "tiles") drawTiles();
  }
}
function toggleTiles() {
  if (!tiles || tiles.over) return;
  tiles.paused = !tiles.paused;
  scheduleTiles();
  drawTiles();
}
function drawTileCell(ctx, x, y, color, ghost = false, size = 30) {
  ctx.fillStyle = tileColors[color];
  if (ghost) {
    ctx.strokeStyle = tileColors[color];
    ctx.lineWidth = 2;
    ctx.strokeRect(x * size + 3, y * size + 3, size - 6, size - 6);
  } else {
    ctx.fillRect(x * size + 2, y * size + 2, size - 4, size - 4);
    ctx.fillStyle = "#ffffff36";
    ctx.fillRect(x * size + 4, y * size + 4, size - 8, 3);
  }
}
function drawTiles() {
  const board = document.querySelector("#tile-board");
  if (!board) return;
  const ctx = board.getContext("2d");
  ctx.fillStyle = "#173d3c";
  ctx.fillRect(0, 0, 300, 540);
  ctx.strokeStyle = "#ffffff0c";
  for (let x = 0; x <= 10; x++) {
    ctx.beginPath();
    ctx.moveTo(x * 30, 0);
    ctx.lineTo(x * 30, 540);
    ctx.stroke();
  }
  for (let y = 0; y <= 18; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * 30);
    ctx.lineTo(300, y * 30);
    ctx.stroke();
  }
  if (tiles) {
    tiles.board.forEach((row, y) =>
      row.forEach((c, x) => {
        if (c !== null) drawTileCell(ctx, x, y, c);
      }),
    );
    const p = tiles.piece;
    if (p && !tiles.over) {
      let gy = p.y;
      while (validTile(p.matrix, p.x, gy + 1)) gy++;
      p.matrix.forEach((row, j) =>
        row.forEach((v, i) => {
          if (v) {
            drawTileCell(ctx, p.x + i, gy + j, p.color, true);
            drawTileCell(ctx, p.x + i, p.y + j, p.color);
          }
        }),
      );
    }
    document.querySelector("#tile-score").textContent = tiles.score;
    document.querySelector("#tile-lines").textContent = tiles.lines;
  }
  const overlay = document.querySelector("#tile-overlay");
  overlay.innerHTML = !tiles
    ? "<h2>Ready to play?</h2><p>Build complete rows.<br>Take it one block at a time.</p>"
    : tiles.over
      ? `<h2>Round complete</h2><p>${tiles.lines} rows cleared · ${tiles.score} points</p><p>Start a new round when you’re ready.</p>`
      : tiles.paused
        ? "<h2>Paused</h2><p>Take a breath.<br>Choose Resume to continue.</p>"
        : "";
  overlay.hidden = !!tiles && !tiles.over && !tiles.paused;
  const pause = document.querySelector('[data-action="tile-pause"]');
  pause.disabled = !tiles || tiles.over;
  pause.textContent = tiles?.paused ? "Resume" : "Pause";
  document.querySelector('[data-action="tile-start"]').textContent = tiles
    ? "New round"
    : "Start a round";
  document
    .querySelectorAll(".tile-controls button")
    .forEach((b) => (b.disabled = !tiles || tiles.over || tiles.paused));
  const next = document.querySelector("#tile-next"),
    nc = next.getContext("2d");
  nc.clearRect(0, 0, 150, 90);
  if (tiles)
    tiles.next.matrix.forEach((r, j) =>
      r.forEach((v, i) => {
        if (v) drawTileCell(nc, i + 1, j, tiles.next.color, false, 25);
      }),
    );
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-action]")?.dataset.action;
  if (!a?.startsWith("tile-")) return;
  if (a === "tile-start") {
    if (
      tiles &&
      !tiles.over &&
      !confirm("Start a new round? Your current round will end.")
    )
      return;
    startTiles();
  }
  if (a === "tile-pause") toggleTiles();
  if (a === "tile-left") moveTile(-1, 0);
  if (a === "tile-right") moveTile(1, 0);
  if (a === "tile-down") moveTile(0, 1);
  if (a === "tile-rotate") rotateTile();
  if (a === "tile-drop") dropTile();
});
document.addEventListener("keydown", (e) => {
  if (
    typeof page === "undefined" ||
    page !== "tiles" ||
    document.querySelector("dialog[open]") ||
    ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(e.target.tagName)
  )
    return;
  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "p", "P"].includes(
      e.key,
    )
  )
    e.preventDefault();
  if (e.key === "ArrowLeft") moveTile(-1, 0);
  if (e.key === "ArrowRight") moveTile(1, 0);
  if (e.key === "ArrowUp") rotateTile();
  if (e.key === "ArrowDown") moveTile(0, 1);
  if (e.key === " " && !e.repeat) dropTile();
  if (["p", "P"].includes(e.key) && !e.repeat) toggleTiles();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseTiles();
});
window.addEventListener("blur", pauseTiles);

("use strict");
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const paths = {
  home: "M3 10l9-7 9 7v10H3z M9 20v-7h6v7",
  photos: "M3 3h18v18H3z M3 17l5-6 5 5 3-4 5 6 M16 7h.01",
  reminders: "M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M9 21h6",
  brain:
    "M9 4a4 4 0 00-5 4 4 4 0 00-1 7 4 4 0 006 5V4 M15 4a4 4 0 015 4 4 4 0 011 7 4 4 0 01-6 5V4 M5 10h4 M15 14h5",
  trends: "M3 3v18h18 M6 16l5-6 4 3 6-8",
  alerts: "M12 3L2 21h20L12 3z M12 9v5 M12 17h.01",
  activity: "M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5",
  settings:
    "M12 8a4 4 0 100 8 4 4 0 000-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2",
};
const icon = (n) =>
  `<span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n] || paths.home}"/></svg></span>`;
const tabs = [
  ["home", "Overview"],
  ["photos", "Memorie-Color"],
  ["reminders", "Voice reminders"],
  ["brain", "Brain Check"],
  ["tiles", "Falling tiles"],
  ["trends", "Session trends"],
  ["alerts", "Help alerts"],
  ["activity", "Activity log"],
  ["settings", "Settings"],
];
let db,
  state = {
    photos: [],
    reminders: [],
    sessions: [],
    alerts: [],
    activity: [],
    settings: { name: "", volume: 70, interval: 8, large: false },
  },
  page = "home",
  game = null,
  recording = null,
  recordStream = null;
const id = () => crypto.randomUUID();
const dt = (t) =>
  new Date(t).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const toast = (t) => {
  $("#toast").textContent = t;
  $("#toast").style.display = "block";
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ($("#toast").style.display = "none"), 4500);
};
const memorie = createMemorieColor({
  getState: () => state,
  save,
  log,
  toast,
  render,
  esc,
  photoDialog,
  help,
});
async function init() {
  try {
    db = await new Promise((resolve, reject) => {
      let r = indexedDB.open("mempal-local", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("data");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const saved = await new Promise((resolve, reject) => {
      let r = db.transaction("data").objectStore("data").get("state");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    if (saved) state = saved;
    state.coloring = memorie.normalize(state.coloring);
    render();
    setInterval(tick, 1000);
    tick();
  } catch (e) {
    $("#main").innerHTML =
      '<div class="card"><h1>Browser storage is unavailable</h1><p>Please allow local site storage and reload MemPal to save your photos and activity.</p></div>';
  }
}
async function save() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("data", "readwrite");
    tx.objectStore("data").put(state, "state");
    tx.oncomplete = resolve;
    tx.onerror = () => {
      toast("Unable to save. Check available browser storage.");
      reject(tx.error);
    };
  });
}
function log(text) {
  state.activity.unshift({ id: id(), time: Date.now(), text });
  state.activity = state.activity.slice(0, 500);
}
const empty = (title, copy, button = "") =>
  `<div class="empty"><strong>${title}</strong><p>${copy}</p>${button}</div>`;
const btn = (label, action, cls = "") =>
  `<button class="btn ${cls}" data-action="${action}">${label}</button>`;
function heading(title, sub, action = "") {
  return `<div class="page-title"><div><h1>${title}</h1><p>${sub}</p></div>${action}</div>`;
}
function render() {
  if (location.hash === "#color") history.replaceState(null, "", "#photos");
  page = tabs.some((t) => t[0] === location.hash.slice(1))
    ? location.hash.slice(1)
    : "home";
  document.body.classList.toggle("large", state.settings.large);
  $("#nav").innerHTML = tabs
    .map(
      ([n, l]) =>
        `<a href="#${n}" class="${page === n ? "active" : ""}" ${page === n ? 'aria-current="page"' : ""}>${icon(n)}${l}${n === "alerts" && state.alerts.some((a) => !a.ack) ? ' <span class="pill">' + state.alerts.filter((a) => !a.ack).length + "</span>" : ""}</a>`,
    )
    .join("");
  $("#page-label").textContent = tabs.find((t) => t[0] === page)[1];
  const views = {
    home: homeView,
    photos: photosView,
    reminders: remindersView,
    brain: brainView,
    trends: trendsView,
    alerts: alertsView,
    activity: activityView,
    settings: settingsView,
    tiles: tilesView,
  };
  $("#main").innerHTML = views[page]();
  if (page === "brain" && game) renderTrial();
  if (page === "tiles") drawTiles();
  if (page === "photos") memorie.mount();
  else document.body.classList.remove("color-focus");
}
function homeView() {
  const last = state.sessions.at(-1),
    pending = state.alerts.filter((a) => !a.ack).length;
  return (
    heading(
      state.settings.name
        ? `Hello, ${esc(state.settings.name)}.`
        : "A little support. A familiar day.",
      "A calm place to look after the everyday moments.",
      '<span class="tag">' +
        new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        }) +
        "</span>",
    ) +
    `<section class="hero"><div class="hero-copy"><p class="overline">YOUR EVERYDAY MEMORY COMPANION</p><h2>Small moments.<br>Meaningful connections.</h2><p>Bring a favorite photo to life with color, keep routines familiar, and make time for connection.</p><a class="btn light" href="#photos">Open Memorie-Color</a></div><div class="hero-art" aria-hidden="true"><div class="orbit"><span class="symbol">✳</span></div><div class="art-note">A familiar photo. A little color.</div><div class="art-note second">One moment at a time.</div></div></section><section class="stats">${[
      [
        "Family photos",
        state.photos.length,
        "Familiar faces, always nearby",
        "photos",
      ],
      [
        "Active reminders",
        state.reminders.filter((r) => r.enabled).length,
        "Support for daily routines",
        "reminders",
      ],
      [
        "Brain Check sessions",
        state.sessions.length,
        last
          ? "Last practice: " + dt(last.time)
          : "Start whenever you feel ready",
        "brain",
      ],
      [
        "Open help alerts",
        pending,
        pending ? "Waiting for acknowledgement" : "No alerts to acknowledge",
        "alerts",
      ],
    ]
      .map(
        ([l, v, s, i]) =>
          `<div class="stat"><div class="stat-top">${l}${icon(i)}</div><strong>${v}</strong><small>${s}</small></div>`,
      )
      .join(
        "",
      )}</section><div class="grid2"><section class="card"><div class="card-head"><h2>Today’s reminders</h2><a class="text-link" href="#reminders">Manage reminders</a></div>${
      state.reminders
        .filter((r) => r.enabled && dueDay(r))
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 3)
        .map(reminderRow)
        .join("") ||
      empty(
        "Make a routine feel familiar",
        "Add a reminder in your own words, with a voice they know.",
        btn("Add a reminder", "reminder-add", "secondary small"),
      )
    }</section><section class="card"><div class="card-head"><h2>A little brain practice</h2>${icon("brain")}</div><p class="muted">A short matching game that adjusts to your pace. No pressure, just practice.</p><div style="display:flex;gap:12px;margin:22px 0 12px"><span class="pill">3–5 minutes</span><span class="pill">Adapts as you play</span></div><a class="btn secondary" href="#brain">Open Brain Check</a></section></div><div class="practice-strip">${icon("photos")}<div><strong>A memory, in your own colors.</strong><p>Turn family photos into gentle color-by-number moments.</p></div><a class="btn secondary" href="#photos">Try Memorie-Color</a></div>`
  );
}
function photosView() {
  return memorie.view();
}
function reminderRow(r) {
  return `<div class="reminder-row"><span class="time-badge">${esc(r.time)}</span><div class="row-main"><strong>${esc(r.title)}</strong><p>${r.days === "daily" ? "Every day" : r.days === "weekdays" ? "Monday–Friday" : "Saturday–Sunday"} · ${r.audio ? "Familiar voice" : "Text reminder"} ${r.enabled ? "" : "· Paused"}</p></div><button class="text-link" data-action="reminder-play" data-id="${esc(r.id)}">Play</button></div>`;
}
function remindersView() {
  return (
    heading(
      "A familiar voice. A gentle nudge.",
      "Schedule a routine and add a voice recording.",
      btn("Add a reminder", "reminder-add"),
    ) +
    `<p class="note">Reminders play on this device while MemPal is open. Enable sound once after opening the app. Closed tabs and sleeping devices cannot deliver reminders.</p>${btn("Enable reminder sound", "sound-enable", "secondary small")}<section class="card" style="margin-top:22px">${state.reminders.length ? state.reminders.map((r) => reminderRow(r) + `<div style="display:flex;gap:16px;padding-bottom:12px"><button class="text-link" data-action="reminder-toggle" data-id="${esc(r.id)}">${r.enabled ? "Pause" : "Enable"}</button><button class="text-link" data-action="reminder-edit" data-id="${esc(r.id)}">Edit</button><button class="text-link" data-action="reminder-delete" data-id="${esc(r.id)}">Remove</button></div>`).join("") : empty("A little structure goes a long way", "Try a reminder to drink water, take a walk, or call a loved one.")}</section>`
  );
}
function brainView() {
  return (
    heading(
      "Brain Check",
      "Remember a symbol, then compare it with the next one.",
    ) +
    `<section class="card game">${game ? '<div id="game-content"></div>' : `<span class="pill">THE SORTING STUDIO</span><h2 style="font-size:1.65rem;margin-top:22px">Same as the symbol before?</h2><div class="example-sequence"><span>★<small>Remember</small></span><span>★<small>Match</small></span><span>●<small>Different</small></span><span>●<small>Match</small></span></div><p class="intro muted">At level 1, compare each new symbol with the one immediately before it. Choose <strong>Match</strong> if they are the same; choose <strong>Different</strong> if they are not. Always remember the newest symbol for the next turn.</p>${btn("Learn with a guided round", "game-start")}<p class="note">Four untimed practice decisions first, then a 24-decision session. Practice answers are not saved. Click, drag, or use the left / right keys.</p>`}</section><p class="note" style="max-width:850px;margin:auto">Brain Check is an experimental practice tool, not a validated cognitive assessment. Results reflect this task and can vary with device, vision, movement, fatigue, and familiarity. They do not diagnose dementia or measure medical risk.</p>`
  );
}
function trendsView() {
  let s = state.sessions;
  return (
    heading(
      "Your practice, over time.",
      "Explore your own session history.",
      s.length ? btn("Export session CSV", "export", "secondary") : "",
    ) +
    (s.length
      ? `<div class="stats">${[
          ["Sessions", s.length],
          ["Latest accuracy", Math.round(s.at(-1).accuracy * 100) + "%"],
          ["Latest response", Math.round(s.at(-1).latency) + " ms"],
          ["Highest level", Math.max(...s.map((x) => x.level)) + "-back"],
        ]
          .map(
            ([l, v]) =>
              `<div class="stat"><span class="muted">${l}</span><strong>${v}</strong></div>`,
          )
          .join(
            "",
          )}</div><section class="card"><div class="card-head"><h2>Response time</h2><span class="muted">Milliseconds · lower is faster</span></div>${chart(s.map((x) => x.latency))}<p class="note">Compare sessions with similar difficulty and the same device. This chart shows practice observations, without clinical thresholds.</p></section><section class="card table-wrap"><table><thead><tr><th>Session</th><th>Accuracy</th><th>Response</th><th>Hold time</th><th>Path ratio</th><th>Level</th></tr></thead><tbody>${[
          ...s,
        ]
          .reverse()
          .map(
            (x) =>
              `<tr><td>${dt(x.time)}</td><td>${Math.round(x.accuracy * 100)}%</td><td>${Math.round(x.latency)} ms</td><td>${Math.round(x.dwell)} ms</td><td>${x.pathRatio ? x.pathRatio.toFixed(2) : "—"}</td><td>${x.level}-back</td></tr>`,
          )
          .join(
            "",
          )}</tbody></table></section><p class="note">Path ratio is drag distance divided by the straight-line distance. Button and keyboard responses have no drag measurement. Raw trial data is included in the CSV.</p>`
      : empty(
          "Your story starts with one session",
          "Complete Brain Check to see accuracy, response time, and drag observations.",
          `<a class="btn secondary" href="#brain">Try Brain Check</a>`,
        ))
  );
}
function chart(values) {
  let w = 800,
    h = 180,
    max = Math.max(...values) * 1.2 || 1;
  const pts = values.map((v, i) => [
    40 + i * (720 / Math.max(values.length - 1, 1)),
    155 - (v / max) * 125,
  ]);
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Response times for ${values.length} sessions, from oldest to newest">${[0, 1, 2, 3].map((i) => `<line x1="40" y1="${30 + i * 42}" x2="770" y2="${30 + i * 42}" stroke="#e5ebe6"/>`).join("")}<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#205652" stroke-width="3"/>${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5" fill="#205652"><title>Session ${i + 1}: ${Math.round(values[i])} ms</title></circle>`).join("")}<text x="40" y="178" font-size="12" fill="#677571">First session</text><text x="695" y="178" font-size="12" fill="#677571">Latest</text></svg>`;
}
function alertsView() {
  return (
    heading(
      "Help, within reach.",
      "Review and acknowledge requests made in this browser.",
      '<a class="btn secondary" href="#photos">Open Memorie-Color</a>',
    ) +
    `<div class="help-banner"><strong>Local help requests</strong><p>The Memorie-Color help button logs a request here. It does not call, text, or notify a caregiver on another device.</p>${btn("Create a help request", "help", "danger")}</div><section class="card">${state.alerts.length ? state.alerts.map((a) => `<div class="event-row">${icon("alerts")}<div class="row-main"><strong>Help requested</strong><p>${dt(a.time)}${a.ack ? " · Acknowledged " + dt(a.ack) : ""}</p></div>${a.ack ? '<span class="pill">Acknowledged</span>' : `<button class="btn secondary small" data-action="ack" data-id="${esc(a.id)}">Acknowledge</button>`}</div>`).join("") : empty("No help requests", "Requests from Memorie-Color will appear here.")}</section>`
  );
}
function activityView() {
  return (
    heading(
      "The everyday moments.",
      "A local record of reminders, practice, and help requests.",
    ) +
    `<section class="card">${state.activity.length ? state.activity.map((a) => `<div class="event-row">${icon("activity")}<div class="row-main"><strong>${esc(a.text)}</strong><p>${dt(a.time)}</p></div></div>`).join("") : empty("Nothing logged yet", "Activity will appear as you use MemPal.")}</section>`
  );
}
function settingsView() {
  return (
    heading(
      "Make MemPal feel right.",
      "A few simple preferences for this browser.",
    ) +
    `<section class="card"><h2 style="margin-bottom:24px">Everyday preferences</h2><form id="settings-form"><div class="form-grid"><label class="field">Caregiver name<input name="name" value="${esc(state.settings.name)}" maxlength="50" placeholder="Your first name"></label><label class="field">Reminder volume<input name="volume" type="range" min="0" max="100" value="${state.settings.volume}"></label><label class="field">Game pace<select name="untimed"><option value="false">Gentle timer · 7 seconds per decision</option><option value="true" ${state.settings.untimed ? "selected" : ""}>Untimed · no response deadline</option></select></label><label class="field">Reading size<select name="large"><option value="false">Standard</option><option value="true" ${state.settings.large ? "selected" : ""}>Larger supporting text</option></select></label></div><button class="btn" type="submit">Save preferences</button></form></section><section class="card"><h2>Your data, on this device</h2><p class="muted">Photos, coloring progress, recordings, and sessions are stored locally in this browser. Clearing site data removes them. Data does not sync between devices.</p>${btn("Download a full backup", "backup", "secondary")} ${btn("Restore a backup", "restore", "secondary")}<input type="file" id="restore-file" accept="application/json" hidden><p class="note">Backups contain your photos and recordings. Keep the downloaded file somewhere private.</p></section><section class="card"><h2>Device connection</h2><p class="muted">This edition runs independently in your browser. ESP32 WiFi controls, the hardware help button, display brightness, and microSD storage need a separate firmware connection.</p><span class="pill">Hardware is not connected</span></section>`
  );
}
function showDialog(html) {
  $("#modal").innerHTML = html;
  $("#modal").showModal();
}
function closeDialog() {
  if (recording?.state === "recording") recording.stop();
  recordStream?.getTracks().forEach((t) => t.stop());
  recording = null;
  recordStream = null;
  $("#modal").close();
}
function photoDialog(p) {
  showDialog(
    `<h2>${p ? "Edit photo label" : "Add a familiar face"}</h2><form id="photo-form" data-id="${esc(p?.id || "")}">${p ? "" : `<label class="field">Family photo<input name="photo" type="file" accept="image/*" required></label>`}<label class="field">Name<input name="name" maxlength="80" required value="${esc(p?.name || "")}" placeholder="e.g. Sarah"></label><label class="field">Relationship<input name="relationship" required maxlength="100" value="${esc(p?.relationship || "")}" placeholder="e.g. Your granddaughter"></label><div class="dialog-actions">${btn("Cancel", "close", "secondary")}<button class="btn" type="submit">Save photo</button></div><p class="error" id="form-error"></p></form>`,
  );
}
function reminderDialog(r) {
  showDialog(
    `<h2>${r ? "Edit reminder" : "Add a gentle reminder"}</h2><form id="reminder-form" data-id="${esc(r?.id || "")}"><label class="field">Reminder text<input name="title" required maxlength="160" value="${esc(r?.title || "")}" placeholder="It’s time for a glass of water."></label><div class="form-grid"><label class="field">Time<input name="time" type="time" required value="${esc(r?.time || "09:00")}"></label><label class="field">Repeat<select name="days">${["daily", "weekdays", "weekends"].map((d) => `<option value="${d}" ${r?.days === d ? "selected" : ""}>${d === "daily" ? "Every day" : d === "weekdays" ? "Weekdays" : "Weekends"}</option>`).join("")}</select></label></div><label class="field">Familiar voice (optional)<input name="audio" type="file" accept="audio/*"></label><button class="btn secondary small" type="button" data-action="record">Record a voice clip</button><span class="note" id="record-status">${r?.audio ? " A saved recording is attached." : ""}</span><p class="note">Recordings can be up to 60 seconds; uploaded audio can be up to 5 MB.</p><div class="dialog-actions">${btn("Cancel", "close", "secondary")}<button class="btn" type="submit">Save reminder</button></div><p class="error" id="form-error"></p></form>`,
  );
}
async function fileData(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
async function imageData(file) {
  if (!file.type.startsWith("image/"))
    throw Error("Please choose an image file.");
  if (file.size > 20e6) throw Error("Choose an image smaller than 20 MB.");
  const src = await fileData(file);
  const img = await new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () =>
      reject(Error("This image format could not be opened. Try JPG or PNG."));
    im.src = src;
  });
  const canvas = document.createElement("canvas"),
    scale = Math.min(1, 1200 / Math.max(img.width, img.height));
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}
let audioUnlocked = false;
async function playReminder(r) {
  try {
    if (r.audio) {
      let a = new Audio(r.audio);
      a.volume = state.settings.volume / 100;
      await a.play();
    } else if ("speechSynthesis" in window) {
      let u = new SpeechSynthesisUtterance(r.title);
      u.volume = state.settings.volume / 100;
      speechSynthesis.speak(u);
    } else toast(r.title);
    log("Reminder played: " + r.title);
    await save();
    toast(r.title);
  } catch (e) {
    toast("Sound was blocked. Enable reminder sound, then try again.");
  }
}
function dueDay(r) {
  const d = new Date().getDay();
  return (
    r.days === "daily" ||
    (r.days === "weekdays" ? d > 0 && d < 6 : d === 0 || d === 6)
  );
}
const fired = new Set();
function tick() {
  $("#clock").textContent =
    new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }) +
    " · " +
    new Date().toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  if (!audioUnlocked) return;
  const now = new Date(),
    tm =
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0"),
    day = now.toLocaleDateString();
  state.reminders.forEach((r) => {
    let k = r.id + day + tm;
    if (r.enabled && dueDay(r) && r.time === tm && !fired.has(k)) {
      fired.add(k);
      playReminder(r);
    }
  });
}
async function help() {
  state.alerts.unshift({ id: id(), time: Date.now(), ack: null });
  log("Help requested in Memorie-Color");
  await save();
  toast("Your help request is saved on this device.");
  if (page !== "photos") render();
}
const symbols = ["✿", "★", "◆", "●", "☀", "♥"];
const mean = (v) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);
function startGame() {
  clearTimeout(game?.timer);
  game = {
    history: [],
    level: 1,
    trials: [],
    started: Date.now(),
    trial: null,
    warm: 1,
    block: 0,
    finished: false,
    phase: "tutorial",
    tutorialStep: 0,
  };
  render();
}
function nextStimulus() {
  const h = game.history;
  let target = h[h.length - game.level];
  let symbol =
    target && Math.random() < 0.4
      ? target
      : symbols[Math.floor(Math.random() * symbols.length)];
  if (target && symbol === target && Math.random() < 0.3)
    symbol = symbols.find((s) => s !== target);
  let warm = game.warm > 0;
  if (warm) game.warm--;
  game.trial = {
    symbol,
    expected: symbol === target,
    warm,
    start: performance.now(),
    points: [],
    touch: null,
    input: null,
  };
  h.push(symbol);
}
function renderTrial() {
  clearTimeout(game?.timer);
  if (!game || game.finished) return;
  if (game.phase === "tutorial") {
    renderTutorial();
    return;
  }
  if (game.phase === "level") {
    renderLevel();
    return;
  }
  if (!game.trial) nextStimulus();
  const t = game.trial;
  $("#game-content").innerHTML =
    `<div style="display:flex;justify-content:space-between"><span class="pill">${game.level}-back</span><button class="text-link" data-action="game-stop">End session</button></div><div class="progress"><span style="width:${(game.trials.length / 24) * 100}%"></span></div><p class="muted">${t.warm ? `Remember this symbol (${game.level - game.warm} of ${game.level}).` : `Compare with the symbol ${game.level === 1 ? "one step" : game.level + " steps"} ago.`}</p><div class="game-stage"><div class="stimulus" id="stimulus" tabindex="0" role="button" aria-label="Symbol ${esc(t.symbol)}. Drag to Match or Different.">${t.symbol}</div></div><div class="game-status" aria-live="polite">${t.warm ? "Look carefully, then continue when you’re ready." : "Drag the symbol, or choose below."}</div>${t.warm ? btn("I’ve remembered it", "warm-next", "secondary") : `<div class="zones"><button class="zone" id="different" data-action="answer-no">Different <small>(left)</small></button><button class="zone" id="match" data-action="answer-yes">Match <small>(right)</small></button></div>`}<p class="note">${game.trials.length} of 24 decisions complete</p>`;
  t.start = performance.now();
  if (!t.warm && !state.settings.untimed)
    game.timer = setTimeout(() => answer(null, "timeout"), 7000);
}
function answer(choice, method, metrics = {}) {
  if (game?.phase === "tutorial") {
    answerTutorial(choice);
    return;
  }
  if (
    !game ||
    game.phase === "level" ||
    game.finished ||
    !game.trial ||
    game.trial.warm ||
    game.locked
  )
    return;
  game.locked = true;
  clearTimeout(game.timer);
  const t = game.trial,
    correct = choice === t.expected;
  game.trials.push({
    symbol: t.symbol,
    expected: t.expected,
    choice,
    correct,
    level: game.level,
    method,
    latency: metrics.latency ?? performance.now() - t.start,
    dwell: metrics.dwell ?? 0,
    pathRatio: metrics.pathRatio ?? null,
    corrections: metrics.corrections ?? null,
  });
  game.block++;
  $(".game-status").textContent =
    choice === null
      ? "No rush. Let’s try the next one."
      : correct
        ? "That’s a match with the rule. Well done."
        : "Keep going. A fresh symbol is coming.";
  game.timer = setTimeout(() => {
    if (!game) return;
    game.locked = false;
    if (game.trials.length >= 24) {
      finishGame();
      return;
    }
    if (game.block === 8) {
      let oldLevel = game.level;
      let acc = mean(game.trials.slice(-8).map((t) => Number(t.correct)));
      if (acc >= 0.875 && game.level < 3) game.level++;
      else if (acc < 0.625 && game.level > 1) game.level--;
      game.block = 0;
      game.warm = game.level;
      game.history = [];
      if (game.level !== oldLevel) {
        game.phase = "level";
        game.previousLevel = oldLevel;
        game.trial = null;
        renderTrial();
        return;
      }
    }
    game.trial = null;
    renderTrial();
  }, 700);
}
async function finishGame() {
  const g = game;
  clearTimeout(g.timer);
  g.finished = true;
  let tr = g.trials,
    answered = tr.filter((t) => t.method !== "timeout"),
    drags = tr.filter((t) => t.method === "drag");
  const s = {
    id: id(),
    time: Date.now(),
    duration: Date.now() - g.started,
    accuracy: mean(tr.map((t) => Number(t.correct))),
    latency: mean(answered.map((t) => t.latency)),
    dwell: mean(drags.map((t) => t.dwell)),
    pathRatio: mean(
      drags.filter((t) => t.pathRatio !== null).map((t) => t.pathRatio),
    ),
    level: Math.max(...tr.map((t) => t.level)),
    untimed: !!state.settings.untimed,
    trials: tr,
  };
  state.sessions.push(s);
  log("Completed a Brain Check practice session");
  await save();
  $("#game-content").innerHTML =
    `<span class="pill">SESSION COMPLETE</span><h2 style="margin-top:25px">A little time for your mind.</h2><p class="muted">Your practice has been saved to this browser.</p><div class="metric-row"><div><span class="muted">Accuracy</span><strong>${Math.round(s.accuracy * 100)}%</strong></div><div><span class="muted">Response time</span><strong>${Math.round(s.latency)} ms</strong></div><div><span class="muted">Highest level</span><strong>${s.level}-back</strong></div></div><a class="btn" href="#trends">View session trends</a> ${btn("Practice again", "game-start", "secondary")}`;
  game = null;
}
function stopGame() {
  if (game) clearTimeout(game.timer);
  game = null;
  render();
  toast("Session ended. Incomplete sessions are not saved.");
}
document.addEventListener("pointerdown", (e) => {
  if (e.target.id !== "stimulus" || !game || game.trial.warm || game.locked)
    return;
  const t = game.trial;
  t.touch = performance.now();
  t.points = [[e.clientX, e.clientY]];
  e.target.setPointerCapture(e.pointerId);
});
document.addEventListener("pointermove", (e) => {
  if (!game?.trial.touch || game.locked) return;
  game.trial.points.push([e.clientX, e.clientY]);
  for (const z of document.querySelectorAll(".zone")) {
    const r = z.getBoundingClientRect();
    z.classList.toggle(
      "hover",
      e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom,
    );
  }
});
document.addEventListener("pointerup", (e) => {
  if (!game?.trial.touch || game.locked) return;
  const t = game.trial,
    p = t.points;
  let choice = null;
  for (const z of document.querySelectorAll(".zone")) {
    let r = z.getBoundingClientRect();
    if (
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom
    )
      choice = z.id === "match";
    z.classList.remove("hover");
  }
  if (choice === null) {
    t.touch = null;
    t.points = [];
    return;
  }
  p.push([e.clientX, e.clientY]);
  let distance = 0,
    corrections = 0,
    previousSign = 0;
  for (let i = 1; i < p.length; i++) {
    distance += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    let dx = p[i][0] - p[i - 1][0];
    if (Math.abs(dx) > 3) {
      let sign = Math.sign(dx);
      if (previousSign && sign !== previousSign) corrections++;
      previousSign = sign;
    }
  }
  const direct = Math.hypot(p.at(-1)[0] - p[0][0], p.at(-1)[1] - p[0][1]);
  answer(choice, "drag", {
    latency: t.touch - t.start,
    dwell: performance.now() - t.touch,
    pathRatio: direct > 1 ? distance / direct : null,
    corrections,
  });
});
document.addEventListener("pointercancel", () => {
  if (game?.trial) {
    game.trial.touch = null;
    game.trial.points = [];
  }
});
document.addEventListener("keydown", (e) => {
  if (
    page === "brain" &&
    game &&
    (game.phase === "tutorial"
      ? game.tutorialStep > 0 && !game.tutorialCorrect
      : game.phase !== "level" && !game.trial?.warm) &&
    ["ArrowLeft", "ArrowRight"].includes(e.key)
  ) {
    e.preventDefault();
    answer(e.key === "ArrowRight", "keyboard");
  }
});
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  let a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportCSV() {
  let rows = [
    [
      "session_id",
      "timestamp",
      "duration_ms",
      "session_accuracy",
      "untimed",
      "trial",
      "level",
      "symbol",
      "expected_match",
      "response_match",
      "correct",
      "input_method",
      "latency_ms",
      "dwell_ms",
      "drag_path_ratio",
      "direction_corrections",
    ],
  ];
  for (let s of state.sessions)
    s.trials.forEach((t, i) =>
      rows.push([
        s.id,
        new Date(s.time).toISOString(),
        s.duration,
        s.accuracy,
        s.untimed,
        i + 1,
        t.level,
        t.symbol,
        t.expected,
        t.choice,
        t.correct,
        t.method,
        t.latency,
        t.dwell,
        t.pathRatio,
        t.corrections,
      ]),
    );
  download(
    "MemPal_BrainCheck.csv",
    rows
      .map((r) =>
        r.map((v) => '"' + String(v ?? "").replace(/"/g, '""') + '"').join(","),
      )
      .join("\r\n"),
    "text/csv",
  );
}
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const action = b.dataset.action,
    k = b.dataset.id;
  try {
    if (action === "close") closeDialog();
    if (action === "photo-add") photoDialog();
    if (action === "photo-edit")
      photoDialog(state.photos.find((p) => p.id === k));
    if (action === "photo-delete") {
      if (!confirm("Remove this family photo?")) return;
      memorie.removePhoto(k);
      state.photos = state.photos.filter((p) => p.id !== k);
      log("Removed a family photo");
      await save();
      render();
    }
    if (action === "reminder-add") reminderDialog();
    if (action === "reminder-edit")
      reminderDialog(state.reminders.find((r) => r.id === k));
    if (action === "reminder-delete") {
      if (!confirm("Remove this reminder?")) return;
      state.reminders = state.reminders.filter((r) => r.id !== k);
      await save();
      render();
    }
    if (action === "reminder-toggle") {
      let r = state.reminders.find((r) => r.id === k);
      r.enabled = !r.enabled;
      await save();
      render();
    }
    if (action === "reminder-play")
      await playReminder(state.reminders.find((r) => r.id === k));
    if (action === "sound-enable") {
      audioUnlocked = true;
      if ("speechSynthesis" in window) {
        let u = new SpeechSynthesisUtterance("MemPal reminders are ready.");
        u.volume = state.settings.volume / 100;
        speechSynthesis.speak(u);
      }
      toast("Reminders enabled while MemPal stays open.");
    }
    if (action === "help") await help();
    if (action === "ack") {
      state.alerts.find((a) => a.id === k).ack = Date.now();
      log("Acknowledged a help request");
      await save();
      render();
    }
    if (action === "game-start") startGame();
    if (action === "tutorial-next") tutorialNext();
    if (action === "session-begin") beginSession();
    if (action === "level-continue") {
      game.phase = "play";
      renderTrial();
    }
    if (action === "warm-next" && game?.trial?.warm) {
      game.trial = null;
      renderTrial();
    }
    if (action === "game-stop") stopGame();
    if (action === "answer-yes") answer(true, "button");
    if (action === "answer-no") answer(false, "button");
    if (action === "export") exportCSV();
    if (action === "backup")
      download(
        "MemPal_Backup.json",
        JSON.stringify({ format: "mempal-v1", state }),
        "application/json",
      );
    if (action === "restore") $("#restore-file").click();
    if (action === "record") await recordVoice(b);
  } catch (error) {
    toast(error.message || "Something went wrong. Please try again.");
  }
});
async function recordVoice(b) {
  if (recording?.state === "recording") {
    recording.stop();
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    toast("Recording is unavailable here. Upload an audio clip instead.");
    return;
  }
  try {
    recordStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const parts = [];
    recording = new MediaRecorder(recordStream);
    const localRecorder = recording,
      localStream = recordStream,
      targetForm = $("#reminder-form");
    recording.ondataavailable = (e) => parts.push(e.data);
    recording.onstop = async () => {
      clearTimeout(recordVoice.timer);
      localStream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(parts, {
        type: localRecorder.mimeType || "audio/webm",
      });
      const audio = await fileData(blob);
      if (targetForm?.isConnected && $("#reminder-form") === targetForm) {
        targetForm.dataset.recorded = audio;
        $("#record-status").textContent = " Voice clip ready to save.";
        b.textContent = "Record again";
      }
    };
    recording.start();
    b.textContent = "Stop recording";
    $("#record-status").textContent = " Recording…";
    recordVoice.timer = setTimeout(() => {
      if (recording?.state === "recording") recording.stop();
    }, 60000);
  } catch (e) {
    toast(
      "Microphone access was unavailable. You can upload a recording instead.",
    );
  }
}
document.addEventListener("submit", async (e) => {
  e.preventDefault();
  let form = e.target,
    fd = new FormData(form),
    submit = form.querySelector('[type="submit"]');
  if (submit) submit.disabled = true;
  try {
    if (form.id === "photo-form") {
      let k = form.dataset.id,
        p = state.photos.find((p) => p.id === k);
      if (p) {
        p.name = fd.get("name").trim();
        p.relationship = fd.get("relationship").trim();
      } else {
        let src = await imageData(fd.get("photo"));
        const photoId = id();
        state.photos.push({
          id: photoId,
          name: fd.get("name").trim(),
          relationship: fd.get("relationship").trim(),
          src,
        });
        state.coloring.photoId = photoId;
      }
      log("Saved a family photo");
      await save();
      closeDialog();
      render();
      toast("Family photo saved.");
    }
    if (form.id === "reminder-form") {
      if (recording?.state === "recording")
        throw Error("Stop the recording before saving.");
      let k = form.dataset.id,
        r = state.reminders.find((r) => r.id === k),
        audio = r?.audio || null,
        file = fd.get("audio");
      if (file.size) {
        if (file.size > 5e6)
          throw Error("Choose an audio clip smaller than 5 MB.");
        if (!file.type.startsWith("audio/"))
          throw Error("Please select an audio file.");
        audio = await fileData(file);
      }
      if (form.dataset.recorded) audio = form.dataset.recorded;
      let v = {
        id: k || id(),
        title: fd.get("title").trim(),
        time: fd.get("time"),
        days: fd.get("days"),
        enabled: r?.enabled ?? true,
        audio,
      };
      if (r) Object.assign(r, v);
      else state.reminders.push(v);
      log("Saved reminder: " + v.title);
      await save();
      closeDialog();
      render();
      toast("Reminder saved.");
    }
    if (form.id === "settings-form") {
      state.settings = {
        name: fd.get("name").trim(),
        volume: Number(fd.get("volume")),
        interval: state.settings.interval || 8,
        large: fd.get("large") === "true",
        untimed: fd.get("untimed") === "true",
      };
      await save();
      render();
      toast("Preferences saved.");
    }
  } catch (e) {
    const err = $("#form-error");
    if (err) err.textContent = e.message;
    else toast(e.message);
  } finally {
    if (submit) submit.disabled = false;
  }
});
document.addEventListener("change", async (e) => {
  if (e.target.id !== "restore-file") return;
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 50e6)
      throw Error("Backup is too large. Choose a file smaller than 50 MB.");
    const parsed = JSON.parse(await file.text()),
      s = parsed.state;
    if (
      parsed.format !== "mempal-v1" ||
      !s ||
      !["photos", "sessions", "alerts", "activity", "reminders"].every((k) =>
        Array.isArray(s[k]),
      ) ||
      !s.settings
    )
      throw Error("This is not a MemPal backup.");
    if (
      !s.photos.every(
        (p) =>
          typeof p.id === "string" &&
          typeof p.name === "string" &&
          typeof p.relationship === "string" &&
          /^data:image\/(jpeg|png|webp);base64,/.test(p.src),
      ) ||
      !s.reminders.every(
        (r) =>
          typeof r.id === "string" &&
          typeof r.title === "string" &&
          /^\d\d:\d\d$/.test(r.time) &&
          ["daily", "weekdays", "weekends"].includes(r.days) &&
          (!r.audio ||
            /^data:audio\/[\w.+-]+(?:;[^,]*)?;base64,/.test(r.audio)),
      ) ||
      !s.sessions.every(
        (x) =>
          typeof x.time === "number" &&
          Array.isArray(x.trials) &&
          Number.isFinite(x.accuracy) &&
          Number.isFinite(x.latency),
      ) ||
      !s.activity.every(
        (x) => typeof x.text === "string" && typeof x.time === "number",
      ) ||
      !s.alerts.every(
        (x) => typeof x.id === "string" && typeof x.time === "number",
      )
    )
      throw Error("Backup contains invalid records.");
    s.settings = {
      name: String(s.settings.name || "").slice(0, 50),
      volume: Math.min(100, Math.max(0, Number(s.settings.volume) || 0)),
      interval: Math.min(60, Math.max(3, Number(s.settings.interval) || 8)),
      large: !!s.settings.large,
      untimed: !!s.settings.untimed,
    };
    if (
      !confirm(
        "Replace the photos, reminders, and history in this browser with this backup?",
      )
    )
      return;
    s.coloring = memorie.normalize(s.coloring);
    memorie.invalidate();
    state = s;
    fired.clear();
    await save();
    render();
    toast("Backup restored.");
  } catch (error) {
    toast(error.message || "This backup could not be restored.");
  }
});
const tutorialSymbols = ["★", "★", "●", "●", "★"];
function renderTutorial() {
  const i = game.tutorialStep;
  game.trial = { warm: true };
  $("#game-content").innerHTML =
    `<span class="pill">GUIDED PRACTICE · NOT SCORED</span><h2 style="margin:20px 0">${i === 0 ? "First, remember this star." : "Is it the same as the previous symbol?"}</h2>${i > 0 ? `<div class="tutorial-compare"><div><small>Previous symbol</small><span>${tutorialSymbols[i - 1]}</span></div><div><small>New symbol</small><span>${tutorialSymbols[i]}</span></div></div>` : `<div class="game-stage"><div class="stimulus" style="cursor:default">★</div></div>`}<p class="muted">${i === 0 ? "There is nothing to compare yet. Take your time." : `Look at the two symbols. ${tutorialSymbols[i] === tutorialSymbols[i - 1] ? "They are the same, so choose Match." : "They are different, so choose Different."}`}</p><div class="game-status" aria-live="polite">${game.tutorialCorrect ? "Correct! Remember the new symbol for the next turn." : ""}</div>${i === 0 ? btn("I’ve remembered it", "tutorial-next") : game.tutorialCorrect ? btn(i === 4 ? "Start my session" : "Next example", i === 4 ? "session-begin" : "tutorial-next") : `<div class="zones"><button class="zone" data-action="answer-no">Different (left)</button><button class="zone" data-action="answer-yes">Match (right)</button></div>`}<p class="note">${i === 0 ? "Getting ready" : `Practice decision ${i} of 4`} · No timer. In your real session, the previous symbol will be hidden.</p>`;
}
function answerTutorial(choice) {
  if (!game || game.tutorialStep === 0 || game.tutorialCorrect) return;
  let expected =
    tutorialSymbols[game.tutorialStep] ===
    tutorialSymbols[game.tutorialStep - 1];
  if (choice !== expected) {
    $(".game-status").textContent =
      `Try again: these symbols are ${expected ? "the same. Choose Match." : "different. Choose Different."}`;
    return;
  }
  game.tutorialCorrect = true;
  renderTutorial();
}
function tutorialNext() {
  if (
    !game ||
    game.phase !== "tutorial" ||
    (game.tutorialStep > 0 && !game.tutorialCorrect)
  )
    return;
  game.tutorialStep++;
  game.tutorialCorrect = false;
  renderTutorial();
}
function beginSession() {
  if (
    !game ||
    game.phase !== "tutorial" ||
    game.tutorialStep !== 4 ||
    !game.tutorialCorrect
  )
    return;
  game.phase = "play";
  game.trial = null;
  game.started = Date.now();
  renderTrial();
}
function renderLevel() {
  const n = game.level;
  const seq = ["★", ...Array(n - 1).fill("●"), "★"];
  $("#game-content").innerHTML =
    `<span class="pill">A NEW ROUND · ${n}-BACK</span><h2 style="margin-top:24px">${n === 1 ? "Back to the previous symbol." : `Now look ${n} turns back.`}</h2><p class="intro muted">${n === 1 ? "Compare the new symbol with the one immediately before it." : `Compare the new symbol with the one ${n} turns earlier. ${n === 2 ? "Skip the symbol immediately before it." : "Skip the two symbols immediately before it."}`}</p><div class="example-sequence">${seq.map((symbol, i) => `<span class="${i === 0 || i === seq.length - 1 ? "compare-target" : ""}">${symbol}<small>${i === 0 ? "Compare this" : i === seq.length - 1 ? "New: Match" : "Skip"}</small></span>`).join("")}</div><p class="muted">We’ll show ${n} starting ${n === 1 ? "symbol" : "symbols"} to remember before asking you to choose. There’s no timer on this explanation.</p>${btn("I’m ready for this round", "level-continue")}`;
}
$("#profile-button").onclick = () => (location.hash = "settings");
$("#modal").addEventListener("cancel", closeDialog);
window.addEventListener("hashchange", () => {
  pauseTiles();
  if (game) clearTimeout(game.timer);
  game = null;
  render();
});
init();
