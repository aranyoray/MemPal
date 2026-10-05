# MemPal · Memorie-Color

MemPal’s original caregiver dashboard, with the bedside slideshow replaced by **Memorie-Color**: family photos become gentle, interactive color-by-number activities.

Based on the user-provided `MemPal_Vercel.zip`, whose `public/index.html` matched the original live app at `https://mempal-eta.vercel.app` on October 5, 2026. The original design, voice reminders, Brain Check tutorial, falling-tiles game, session trends, help alerts, activity log, and settings are preserved.

## Memorie-Color

- Upload a JPG, PNG, WebP, or another browser-supported image, with a name and relationship. Images are resized locally; uploads are limited to 20 MB.
- Photo-derived palettes and connected numbered regions, generated entirely on the device. No image API, account, or backend is needed.
- Gentle, Familiar, and Detailed settings, each with independent saved progress.
- Match numbers to colors, or turn on **Helping hand** to color any shape with its matching color.
- Keyboard-operable shapes, a large “Color a matching shape” button, undo, a reference-photo toggle, and an enlarged canvas.
- Quiet view, conversation prompts, unfilled printable sheets, and SVG artwork downloads.
- Automatic local progress saving, full backup/restore support, and compatibility with the original app’s backups.

The default image is explicitly labeled as a practice photo. Personal images are never sent to an image-processing service. [Practice photo source: Unsplash](https://images.unsplash.com/photo-1511895426328-dc8714191300).

## Run locally

Use Node.js 20 or later:

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:4173`. Choose **Memorie-Color** in the navigation, or open `/#photos` directly (`/#color` also works).

The production site has **no runtime dependencies and no build step**. The files in `public/` can be hosted by any static web server. Serve over HTTP locally or HTTPS in production; opening `index.html` through `file://` will not load JavaScript modules reliably.

## Deploy to Vercel

Import this repository into Vercel. The included `vercel.json` sets:

- Framework preset: Other
- Build command: empty
- Install command: empty
- Output directory: `public`

Connect the repository’s production branch to enable deployments on pushes. GitHub pushes alone do not configure a Vercel project. The app requires no environment variables or secrets.

## Verification

```sh
npx playwright install chromium
npm run check
npm test
```

The tests cover color matching, keyboard input, undo, original-photo viewing, reload recovery, per-detail progress, completion/export/restart, photo upload/edit/removal, invalid images, old/new backups, quiet view, help requests, printing, original reminders and games, deterministic segmentation, and mobile/text enlargement.

## Files

- `public/app.js`: original dashboard and games, integrated with Memorie-Color.
- `public/memorie-color.js`: coloring interface and activity flow.
- `public/memorie-color-engine.js`: deterministic color quantization, connected regions, contour tracing, and interior number placement.
- `public/memorie-color-state.js`: validation and migration of saved coloring data.
- `public/styles.css`: original visual system.
- `public/memorie-color.css`: coloring layout, accessibility, responsive and print styles.

## Storage and care context

Photos, recordings, coloring progress, and practice history live in IndexedDB in the current browser. Clearing site data removes them. They do not sync between browsers or devices. Use **Settings → Download a full backup** before moving to a new URL, and restore it on the new site. Browsers can reject saves when storage is full; the app shows a save error rather than claiming success.

Reminders require an open, awake tab and enabled sound. Help requests are recorded locally; they do not send messages or call a caregiver. The browser edition is not connected to ESP32 hardware.

Memorie-Color is a wellbeing activity inspired by reminiscence and creative engagement, not a clinically validated treatment or assessment. Benefits vary; this app is not shown to prevent or slow dementia. Offer familiar photos and choices, avoid testing recall, and pause if the activity causes distress. See the [Alzheimer’s Association’s reminiscence guidance](https://www.alz.org/help-support/caregiving/daily-care/reminiscence-and-reminiscence-therapy) and [NIA’s cognitive health overview](https://www.nia.nih.gov/health/brain-health/cognitive-health-and-older-adults).

The repository’s previous hardware/research proposal is preserved in `docs/original-project-proposal.md` for historical context. It contains proposed features and medical hypotheses; it is not evidence that this browser app can diagnose disease, notify remote caregivers, or deliver clinical benefits. The supplied ZIP’s deployment notes are preserved in `docs/original-vercel-readme.md`.
