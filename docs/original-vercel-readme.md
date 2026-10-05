# MemPal — Vercel package

Includes the updated Brain Check tutorial and falling-tiles game.

Files:
- public/index.html: complete app, with all CSS and game JavaScript embedded.
- vercel.json: plain static-site configuration; no build or installation needed.

## Deploy using GitHub + Vercel
1. Extract this ZIP.
2. Upload the public folder and vercel.json to the root of a GitHub repository.
3. Import that repository in Vercel.
4. Framework Preset: Other. Build Command: leave empty. Output Directory: public.
5. Deploy.

## Or deploy from your computer
Install Node.js, open a terminal in the extracted folder, and run:

    npx vercel --prod

Follow the Vercel sign-in and project prompts.

Official guides:
https://vercel.com/docs/cli/deploy
https://vercel.com/docs/builds/configure-a-build

## Your data
Data is stored in IndexedDB in each browser on each website origin. A new Vercel URL will start with an empty dashboard. To transfer existing data, use Settings > Download a full backup on the existing app, then Settings > Restore a backup on the Vercel version.

Reminders require the app to remain open. Voice recording requires HTTPS and microphone permission. Help requests are logged locally and do not contact another device. Hardware is not connected. The games are practice tools, not medical assessments.

This static package does not carry over the private ChatGPT Sites access gate. Hosting access is managed through your Vercel project.

The separate MemPal.html download contains the same app as public/index.html. To host it by itself, rename it to index.html. For full recording and storage support, serve it through HTTPS rather than relying on a file:// browser URL.

Google Fonts is optional; system fonts are used when unavailable. There are no package dependencies, API keys, personal photos, recordings, or user data in this export.
