/** Deterministic, on-device photo segmentation. No image leaves the browser. */
export const LEVELS = {
  gentle: { label: "Gentle", colors: 5, width: 88, minimum: 65, maximum: 28 },
  familiar: {
    label: "Familiar",
    colors: 7,
    width: 112,
    minimum: 40,
    maximum: 55,
  },
  detailed: {
    label: "Detailed",
    colors: 9,
    width: 136,
    minimum: 30,
    maximum: 90,
  },
};
const distance = (a, b) => a.reduce((sum, n, i) => sum + (n - b[i]) ** 2, 0);
const luminance = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

export async function createColoring(src, level = "gentle") {
  const config = LEVELS[level] || LEVELS.gentle;
  const image = new Image();
  image.src = src;
  await image.decode().catch(() => {
    throw new Error(
      "This photo could not be opened. Try another JPG, PNG, or WebP photo.",
    );
  });
  // Keep the entire photo, including portraits, within a bounded processing canvas.
  const scale =
    config.width / Math.max(image.naturalWidth, image.naturalHeight);
  const width = Math.max(12, Math.round(image.naturalWidth * scale));
  const height = Math.max(12, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.filter = "blur(0.65px)";
  ctx.drawImage(image, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;
  const pixels = Array.from({ length: width * height }, (_, i) => [
    data[i * 4],
    data[i * 4 + 1],
    data[i * 4 + 2],
  ]);
  // Farthest-point seeds and a fixed iteration count make progress reproducible.
  let centers = [
    pixels.reduce((a, b) => (luminance(a) < luminance(b) ? a : b)),
  ];
  for (let k = 1; k < config.colors; k++) {
    let best = pixels[0],
      farthest = 0;
    for (const pixel of pixels) {
      const d = Math.min(...centers.map((c) => distance(c, pixel)));
      if (d > farthest) {
        farthest = d;
        best = pixel;
      }
    }
    if (farthest < 64) break;
    centers.push(best);
  }
  let labels = new Int16Array(pixels.length);
  for (let iteration = 0; iteration < 12; iteration++) {
    const sums = centers.map(() => [0, 0, 0, 0]);
    pixels.forEach((pixel, i) => {
      let nearest = 0,
        best = Infinity;
      centers.forEach((center, k) => {
        const d = distance(pixel, center);
        if (d < best) {
          best = d;
          nearest = k;
        }
      });
      labels[i] = nearest;
      for (let c = 0; c < 3; c++) sums[nearest][c] += pixel[c];
      sums[nearest][3]++;
    });
    centers = centers.map((c, i) =>
      sums[i][3] ? sums[i].slice(0, 3).map((n) => n / sums[i][3]) : c,
    );
  }
  // Remove isolated noise before grouping connected areas.
  for (let pass = 0; pass < 2; pass++) {
    const next = labels.slice();
    for (let y = 1; y < height - 1; y++)
      for (let x = 1; x < width - 1; x++) {
        const counts = Array(centers.length).fill(0);
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            counts[labels[(y + dy) * width + x + dx]]++;
        const max = Math.max(...counts);
        if (max >= 5) next[y * width + x] = counts.indexOf(max);
      }
    labels = next;
  }
  const neighbors = (i) =>
    [
      i % width ? i - 1 : -1,
      i % width < width - 1 ? i + 1 : -1,
      i >= width ? i - width : -1,
      i < width * (height - 1) ? i + width : -1,
    ].filter((n) => n >= 0);
  function components() {
    const owners = new Int32Array(labels.length).fill(-1),
      regions = [];
    for (let i = 0; i < labels.length; i++) {
      if (owners[i] !== -1) continue;
      const cells = [i],
        index = regions.length;
      owners[i] = index;
      for (let q = 0; q < cells.length; q++)
        for (const n of neighbors(cells[q])) {
          if (owners[n] === -1 && labels[n] === labels[i]) {
            owners[n] = index;
            cells.push(n);
          }
        }
      regions.push({ color: labels[i], cells });
    }
    return { owners, regions };
  }
  // Merge the smallest area into a touching color, favoring a long shared edge.
  let grouped = components();
  while (grouped.regions.length > 1) {
    let smallest = grouped.regions.reduce(
      (a, r, i, rs) => (r.cells.length < rs[a].cells.length ? i : a),
      0,
    );
    const region = grouped.regions[smallest];
    if (
      region.cells.length >= config.minimum &&
      grouped.regions.length <= config.maximum
    )
      break;
    const borders = new Map();
    for (const cell of region.cells)
      for (const n of neighbors(cell)) {
        const other = grouped.owners[n];
        if (other !== smallest)
          borders.set(other, (borders.get(other) || 0) + 1);
      }
    let target = -1,
      best = Infinity;
    for (const [other, edge] of borders) {
      const score =
        (distance(
          centers[region.color],
          centers[grouped.regions[other].color],
        ) +
          1200) /
        Math.sqrt(edge);
      if (score < best) {
        target = other;
        best = score;
      }
    }
    if (target < 0) break;
    for (const cell of region.cells)
      labels[cell] = grouped.regions[target].color;
    grouped = components();
  }
  const used = [...new Set(grouped.regions.map((r) => r.color))].sort(
    (a, b) => luminance(centers[b]) - luminance(centers[a]),
  );
  const palette = used.map(
    (k) =>
      "#" +
      centers[k]
        .map((v) => Math.round(v).toString(16).padStart(2, "0"))
        .join(""),
  );
  const regions = grouped.regions.map((r, index) => {
    const edges = new Map();
    const add = (x1, y1, x2, y2) => {
      const key = `${x1},${y1}`;
      if (!edges.has(key)) edges.set(key, []);
      edges.get(key).push([x2, y2]);
    };
    const owns = (x, y) =>
      x >= 0 &&
      x < width &&
      y >= 0 &&
      y < height &&
      grouped.owners[y * width + x] === index;
    for (const cell of r.cells) {
      const x = cell % width,
        y = Math.floor(cell / width);
      if (!owns(x, y - 1)) add(x, y, x + 1, y);
      if (!owns(x + 1, y)) add(x + 1, y, x + 1, y + 1);
      if (!owns(x, y + 1)) add(x + 1, y + 1, x, y + 1);
      if (!owns(x - 1, y)) add(x, y + 1, x, y);
    }
    let path = "";
    while (edges.size) {
      const start = edges.keys().next().value;
      let key = start;
      const points = [start.split(",").map(Number)];
      do {
        const list = edges.get(key);
        if (!list?.length) break;
        const next = list.pop();
        if (!list.length) edges.delete(key);
        points.push(next);
        key = next.join(",");
      } while (key !== start);
      // Only remove collinear vertices: shared edges remain identical, without gaps.
      const simple = points.filter((p, i) => {
        if (i === 0 || i === points.length - 1) return true;
        const a = points[i - 1],
          b = points[i + 1];
        return (p[0] - a[0]) * (b[1] - p[1]) !== (p[1] - a[1]) * (b[0] - p[0]);
      });
      path +=
        simple.map((p, i) => `${i ? "L" : "M"}${p.join(" ")}`).join("") + "Z";
    }
    // Place each number inside the widest part, including concave shapes.
    const depths = new Int16Array(labels.length).fill(-1),
      queue = [];
    for (const cell of r.cells) {
      if (
        neighbors(cell).length < 4 ||
        neighbors(cell).some((n) => grouped.owners[n] !== index)
      ) {
        depths[cell] = 0;
        queue.push(cell);
      }
    }
    let labelCell = r.cells[0];
    for (let q = 0; q < queue.length; q++) {
      const cell = queue[q];
      if (depths[cell] > depths[labelCell]) labelCell = cell;
      for (const n of neighbors(cell))
        if (grouped.owners[n] === index && depths[n] < 0) {
          depths[n] = depths[cell] + 1;
          queue.push(n);
        }
    }
    return {
      id: index,
      color: used.indexOf(r.color),
      path,
      x: (labelCell % width) + 0.5,
      y: Math.floor(labelCell / width) + 0.5,
      area: r.cells.length,
    };
  });
  return { version: 1, width, height, palette, regions };
}

export function textColor(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return luminance(rgb) > 0.179 ? "#172e2a" : "#ffffff";
}
