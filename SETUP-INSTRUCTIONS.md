# Turgeman Outdoor Cinema — Setup Instructions

> For Adam: follow these steps in order. Every step has exact commands to copy-paste.

---

## STEP 1 — Install Node.js (if you haven't already)

Node.js is a tool that lets you run JavaScript projects on your computer.

1. Go to: **https://nodejs.org**
2. Click the big green **"LTS"** download button (the left one)
3. Open the downloaded file and follow the installer (just keep clicking Next/Continue)
4. When done, restart your computer

**To confirm it worked:** Open Terminal (press `Cmd + Space`, type "Terminal", press Enter) and type:
```
node --version
```
You should see something like `v22.0.0`. If you do, you're ready!

---

## STEP 2 — Set up your Supabase database

### 2a. Create the tables

1. Go to **https://supabase.com/dashboard** and click on your **turgeman-outdoor-cinema** project
2. In the left sidebar, click **"SQL Editor"**
3. Click **"New query"**
4. Open the file `supabase-setup.sql` from your Outdoor Cinema folder (drag it into a text editor like TextEdit, select all text, copy it)
5. Paste it into the Supabase SQL editor
6. Click the **"Run"** button (or press `Cmd + Enter`)
7. You should see "Success. No rows returned" — that means it worked!

### 2b. Get your API credentials

1. In the Supabase left sidebar, click **"Project Settings"** (gear icon at the bottom)
2. Click **"API"**
3. You'll see two things you need:
   - **Project URL** — looks like `https://abcdefghijk.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`
4. Keep this tab open — you'll need these in Step 3

---

## STEP 3 — Create your .env file

This file holds your secret API keys. It never gets uploaded to the internet.

1. Open the `turgeman-outdoor-cinema` folder inside your Outdoor Cinema folder
2. Duplicate the file called `.env.example` and rename the copy to exactly: `.env`
   > **Note:** On Mac, files starting with `.` are hidden by default. To see them in Finder: press `Cmd + Shift + .` (dot) to toggle hidden files.
3. Open `.env` in a text editor (right-click → Open With → TextEdit)
4. Replace the placeholder values with your real keys:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-full-anon-key...
VITE_TMDB_API_KEY=ccd8112d7338e343cee81725e71db780
```

5. Save the file

---

## STEP 4 — Install the app's dependencies

1. Open **Terminal** (press `Cmd + Space`, type "Terminal", press Enter)
2. Type this command to navigate to your project folder (copy and paste exactly):

```
cd ~/Desktop
```

Wait — first you need to find where your "Outdoor Cinema" folder actually is. In Finder, right-click your `turgeman-outdoor-cinema` folder and choose "Get Info". Note the location shown under "Where:". Then type:

```
cd "/path/to/your/Outdoor Cinema/turgeman-outdoor-cinema"
```

For example, if it's on your Desktop:
```
cd ~/Desktop/Outdoor\ Cinema/turgeman-outdoor-cinema
```

3. Now install dependencies (this downloads ~200 packages and takes 1–2 minutes):
```
npm install
```

You'll see lots of text scroll by — that's normal. Wait until you see your prompt again.

---

## STEP 5 — Run the app locally

In the same Terminal window, type:

```
npm run dev
```

You'll see something like:
```
  VITE v5.4.1  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

Open your browser and go to: **http://localhost:5173**

That's your app! And the admin panel is at: **http://localhost:5173/admin**

**Admin password: `1234`**

> To stop the app: press `Ctrl + C` in Terminal

---

## STEP 6 — Deploy to Netlify

### Option A: Drag-and-drop (easiest)

1. In Terminal (with the project folder still active), build the app:
```
npm run build
```
2. This creates a `dist` folder inside `turgeman-outdoor-cinema`
3. Go to **https://netlify.com** and log in
4. On your dashboard, find the area that says **"Deploy manually"** or drag a folder here
5. Drag the `dist` folder into that area
6. Netlify will give you a URL like `random-name-12345.netlify.app`

### Option B: Connect to GitHub (recommended for updates)

1. Create a free account at **https://github.com** if you don't have one
2. Create a new repository called `turgeman-outdoor-cinema`
3. In Terminal:
```
git init
git add .
git commit -m "Initial build"
git remote add origin https://github.com/YOUR-USERNAME/turgeman-outdoor-cinema.git
git push -u origin main
```
4. In Netlify, click "Add new site" → "Import an existing project" → choose GitHub
5. Select your repository — Netlify will auto-detect the build settings

### 6b. Add environment variables to Netlify

Whether you used Option A or B, you need to add your API keys to Netlify:

1. In Netlify, go to your site → **Site configuration** → **Environment variables**
2. Add these three variables (one at a time, clicking "Add variable" each time):
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
   - `VITE_TMDB_API_KEY` → `ccd8112d7338e343cee81725e71db780`
3. Click **Save** then **Trigger deploy** → **Deploy site**

### 6c. Rename your Netlify URL (optional)

1. In Netlify → Site configuration → **Site details** → **Change site name**
2. Set it to something like `turgeman-cinema`
3. Your site will be at `turgeman-cinema.netlify.app`

---

## Done! 🎬

- **Friends visit:** `https://your-site.netlify.app`
- **You (admin) visit:** `https://your-site.netlify.app/admin`
- **Admin password:** `1234`

### How to run a movie night:

1. Go to `/admin`, enter password `1234`
2. Click **⚙ Admin** → **Create Event** — set the date, suggestion deadline, voting deadline
3. Share the main URL with friends
4. Friends suggest movies during the suggestion phase
5. When ready, use **Jump to phase → Vote** (or let the timer expire)
6. Friends vote — you see results in real time
7. Click **Jump to phase → Results** to reveal the winner!
