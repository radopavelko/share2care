# ShareKeep.online

Share your things with people you trust, and always know who has what.

- **Frontend:** static HTML/JS (React via CDN, compiled in-browser by Babel — no build step)
- **Auth:** Firebase Authentication (Google sign-in; popup, with redirect fallback for home-screen apps)
- **Database:** Cloud Firestore (live updates)
- **Photos:** Firebase Storage (downscaled in the browser first)
- **Hosting:** Cloudflare Pages, deploying from GitHub (`main` = production, every other branch gets a preview URL)
- **Installable:** web-app manifest + Apple touch icon, so "Add to Home Screen" opens it full-screen like an app

## How it works

- **Shelf** — everything shared with you: your own things plus items in the groups you belong to. Pick a group to see just that group.
- **Who has what** — tap a thing and say *I've got it*; tap *I returned it* when it's back. Owners can also mark *Got it back*. No requests, no approvals — trust-based, one tap.
- **Loans** — what you're holding, and which of your things are out.
- **You** — your groups (create, join by link/code, invite by email) and your things.

## Files

```
index.html            host page, layout, PWA meta
manifest.webmanifest  installable web-app manifest (+ icon-*.png, apple-touch-icon.png)
firebase-init.js      Firebase setup; exposes window.S2 (ES module)
helpers.jsx           small utilities (holderOf, dates)
theme.jsx             design tokens + shared UI components
screens-browse.jsx    Shelf + item detail
screens-borrows.jsx   Loans + You
screens-lend.jsx      add / edit item sheets
screens-groups.jsx    group switcher + create / join / manage sheets
app.jsx               auth gate, data layer, actions, tabs
firestore.rules       Firestore security rules (paste into console)
storage.rules         Storage security rules (paste into console)
```

## Firebase (one-time)

Console → project **share2care-7bb3a**:
1. **Authentication → Sign-in method → Google → Enable.**
2. **Firestore → Rules** → paste `firestore.rules` → Publish. **Storage → Rules** → paste `storage.rules` → Publish.
3. **Authentication → Settings → Authorized domains** → add every domain the app is served from (`sharekeep.online`, `www.sharekeep.online`, `share2care.pages.dev`, and any `<branch>.share2care.pages.dev` you want to test sign-in on). `localhost` is included by default.

## Deploy

Push to `main` → Cloudflare Pages rebuilds production. Other branches get `https://<branch>.share2care.pages.dev`.

**Custom domain** (`sharekeep.online`, bought at Namecheap): add the site in Cloudflare (Free plan) → set Namecheap nameservers to the two Cloudflare gives you → wait for *Active* → Pages project → **Custom domains** → add `sharekeep.online` and `www.sharekeep.online` → add both to Firebase Authorized domains.

## Add to Home Screen (iPhone)

Open the site in **Safari** → Share → **Add to Home Screen**. It then opens full-screen with the ShareKeep icon. (iOS only allows this from Safari; Chrome on iPhone can only add a plain bookmark.) On Android, Chrome offers *Install app* / *Add to Home screen* from its menu.

## Run locally

Serve over HTTP (the `.jsx` files are fetched and compiled in the browser):

```bash
python3 -m http.server 8000
```

## Notes

- Visibility is enforced in the UI: you only see your things and your groups' things. The Firestore rules still allow any signed-in user to read all data — tighten them with per-group membership checks before opening the app to strangers.
- Items created by older versions (with `status`/`borrowerUid`) still work; `holderOf()` reads both shapes.
