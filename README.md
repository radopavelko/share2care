# Share2

Borrow and lend everyday things with people you trust. One shared circle: everyone
who signs in sees the same shelf and can ask to borrow each other's items.

- **Frontend:** static HTML/CSS/JS (React via CDN, compiled in-browser by Babel — no build step)
- **Auth:** Firebase Authentication (Google sign-in)
- **Database:** Cloud Firestore (live updates across devices)
- **Photos:** Firebase Storage (uploads are downscaled in the browser first)
- **Hosting:** Cloudflare Pages, deploying straight from GitHub

Works the same in desktop Chrome and in Chrome/Safari on iPhone and Android.

---

## Project layout

```
index.html          host page + responsive layout
firebase-init.js    Firebase setup, exposes window.S2 (ES module)
helpers.jsx         date helpers + categories
theme.jsx           design tokens + shared UI components
screens-browse.jsx  Shelf + item detail + borrow sheet
screens-borrows.jsx My Loans + Profile
screens-lend.jsx    Lend + add-item form (photo upload)
app.jsx             auth gate, Firestore data layer, tab shell
firestore.rules     Firestore security rules (paste into console)
storage.rules       Storage security rules (paste into console)
prototype/          original Claude design prototype (reference only)
```

---

## One-time Firebase setup (≈5 minutes)

Open the [Firebase console](https://console.firebase.google.com/) → project **share2care-7bb3a**.

### 1. Enable Google sign-in
Build → **Authentication** → **Get started** → **Sign-in method** →
**Google** → toggle **Enable** → pick a support email → **Save**.

### 2. Create the Firestore database
Build → **Firestore Database** → **Create database** →
**Start in production mode** → choose a location → **Enable**.
Then open the **Rules** tab, replace everything with the contents of
[`firestore.rules`](firestore.rules), and click **Publish**.

### 3. Enable Storage (for photos)
Build → **Storage** → **Get started** → accept the default location.
Then open the **Rules** tab, replace everything with the contents of
[`storage.rules`](storage.rules), and click **Publish**.

### 4. Authorize your domains
Authentication → **Settings** → **Authorized domains** → **Add domain**.
Add your live site domain, e.g. `share2care.pages.dev` (and your custom domain
if you add one later). `localhost` is already authorized for local testing.

That's it — no keys to paste anywhere. The web config in `firebase-init.js` is
public by design; access is controlled by the security rules above.

---

## Deploy on Cloudflare Pages

Your current Cloudflare project was created as a **Worker**, which is why the
deploy fails. This app is a **static site**, so use **Pages** instead.

1. Push this code to the GitHub repo (`radopavelko/share2care`, branch `main`).
2. Cloudflare dashboard → **Workers & Pages** → **Create application** →
   **Pages** → **Connect to Git** → pick `share2care`.
3. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
4. **Save and Deploy.** Cloudflare serves `index.html` from the repo root.
5. Copy the live URL (e.g. `https://share2care.pages.dev`) and add it to
   Firebase **Authorized domains** (step 4 above).

> If the old Worker project is still attached to the repo, delete it
> (its **Settings → Delete**) so it doesn't keep failing, then create the
> Pages project as above. Every push to `main` now redeploys automatically.

### Branch preview URLs (testing a branch)

Pages builds **every branch**, not just `main`, so you can share a work-in-progress
branch without touching production.

- Settings → **Builds & deployments** → **Preview deployments** must be
  **"All non-Production branches"** (the default).
- After a branch is **pushed while the Pages project is connected**, Cloudflare
  gives it a stable alias URL: `https://<branch>.<project>.pages.dev`
  (e.g. `https://less-groups.share2care.pages.dev`). Find it under the
  **Deployments** tab. Use the branch alias, not the per-commit hash URL.
- A branch created *before* the Pages project was connected won't build until
  its **next push** — push any commit to it to trigger the first preview build.
- Add each preview domain you share to Firebase **Authorized domains** (Firebase
  doesn't accept wildcards, so add the exact `<branch>.<project>.pages.dev`).

---

## Run locally

The `.jsx` files are fetched and compiled in the browser, so you need to serve
over HTTP (opening the file directly won't work):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Google sign-in works on `localhost` out of the box.

---

## Notes & possible next steps

- **Group-scoped shelf:** the app only shows you your own items plus items
  shared into groups you belong to ("All things" is the union of your groups).
  Note this is enforced in the UI, not in the security rules — any signed-in
  user can still technically read all data. Before opening the app to
  strangers, tighten `firestore.rules` with per-group membership checks.
- **Multiple groups, reminders/notifications, ratings** — all natural follow-ups
  the data model can grow into.
