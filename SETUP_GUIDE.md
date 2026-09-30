# Setup Guide — Step by Step

This guide assumes zero prior setup. Follow it top to bottom. Every command is meant to be copy-pasted exactly as written into your terminal, and every "click here" instruction refers to a real button on the site described.

Estimated time: 30–45 minutes for local setup, +20 minutes if you also deploy it live.

---

## Part 0 — Before you start

Install these on your computer if you don't already have them:

1. **Node.js** (version 18 or newer) — download from https://nodejs.org (choose the "LTS" version) and run the installer.
   - Verify it worked by opening a terminal (Command Prompt/PowerShell on Windows, Terminal on Mac) and typing:
     ```
     node -v
     npm -v
     ```
     You should see version numbers, e.g. `v20.11.0` and `10.2.4`.
2. **Git** — download from https://git-scm.com if you don't have it, or just unzip the project folder manually (Git is only needed if you want to push this to GitHub later).
3. **A code editor** — VS Code (https://code.visualstudio.com) is recommended.
4. **A free MongoDB Atlas account** — you'll create this in Part 1.

Unzip the project you downloaded so you have a folder called `tata-intern-management-system` with two subfolders inside: `backend` and `frontend`.

---

## Part 1 — Create your MongoDB Atlas database (free tier)

1. Go to https://www.mongodb.com/cloud/atlas/register in your browser.
2. Sign up with your email (or Google account). Verify your email if asked.
3. You'll land on a "Create a deployment" screen.
   - Choose **M0 (Free)** as the tier.
   - Pick any Cloud Provider (AWS is fine) and the region closest to you.
   - Leave the cluster name as default (`Cluster0`) or rename it if you like.
   - Click **Create Deployment**.
4. A "Security Quickstart" popup appears:
   - Under **Username and Password**, type a username (e.g. `tatamotors_admin`) and click **Autogenerate Secure Password**, then **copy the password somewhere safe** — you will need it in a moment. Click **Create User**.
   - Under **Where would you like to connect from?**, click **Add My Current IP Address**. Then, since your backend will be hosted elsewhere later (Render), also click **Add a Different IP Address**, type `0.0.0.0/0`, and click **Add Entry**. (This opens access to any IP — acceptable for a portfolio project; for a real production system you'd restrict this to your server's specific IP.)
   - Click **Finish and Close**, then **Go to Databases**.
5. Once your cluster (`Cluster0`) shows as active (may take 1-3 minutes), click the **Connect** button on the cluster card.
6. Choose **Drivers**.
7. Under "2. Install your driver" you can skip (already have Node.js). Under "3. Add your connection string into your application", copy the connection string shown. It looks like:
   ```
   mongodb+srv://tatamotors_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Replace `<password>` with the actual password you copied in step 4. Then add a database name right after `.net/` and before the `?`, like this:
   ```
   mongodb+srv://tatamotors_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tata_intern_ims?retryWrites=true&w=majority
   ```
   Keep this full string handy — this is your `MONGO_URI`.

---

## Part 2 — Configure and run the backend

1. Open a terminal and navigate into the backend folder:
   ```
   cd path/to/tata-intern-management-system/backend
   ```
2. Install all dependencies:
   ```
   npm install
   ```
   This downloads Express, Mongoose, JWT, Multer, etc. Takes 10-30 seconds.
3. Create your environment file by copying the example:
   - **Mac/Linux:** `cp .env.example .env`
   - **Windows (PowerShell):** `copy .env.example .env`
4. Open the new `.env` file in your code editor and fill it in:
   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://tatamotors_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tata_intern_ims?retryWrites=true&w=majority
   JWT_SECRET=type_any_long_random_string_here_at_least_32_characters
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   SEED_ADMIN_EMAIL=admin@tatamotors-ims.com
   SEED_ADMIN_PASSWORD=Admin@12345
   ```
   - Paste your real `MONGO_URI` from Part 1, step 8.
   - For `JWT_SECRET`, type any long, random, hard-to-guess string (you can mash your keyboard, or generate one at https://randomkeygen.com under "CodeIgniter Encryption Keys").
   - Save the file.
5. Populate the database with realistic demo data:
   ```
   npm run seed
   ```
   You should see output ending with a list of demo credentials and "Seed complete." If instead you see a MongoDB connection error, double check your `MONGO_URI` (most common mistake: forgetting to replace `<password>`, or the password itself containing special characters like `@` that need to be URL-encoded).
6. Start the backend server:
   ```
   npm run dev
   ```
   You should see:
   ```
   MongoDB connected: cluster0-shard-...
   Server running in development mode on port 5000
   ```
7. Leave this terminal window open and running. Open your browser to http://localhost:5000 — you should see a JSON response confirming the API is running.

---

## Part 3 — Configure and run the frontend

1. Open a **second, new** terminal window (leave the backend terminal running in the first one) and navigate to the frontend folder:
   ```
   cd path/to/tata-intern-management-system/frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create the environment file:
   - **Mac/Linux:** `cp .env.example .env`
   - **Windows:** `copy .env.example .env`
   The default content (`VITE_API_URL=http://localhost:5000/api`) is already correct for local development — no edits needed.
4. Start the frontend:
   ```
   npm run dev
   ```
   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```
5. Open http://localhost:5173 in your browser (Chrome recommended). You should see the login screen with the "Internship Management System — Tata Motors" branding.

---

## Part 4 — Log in and explore each role

The login page itself lists the three demo accounts, but here they are again:

| Role   | Email                                     | Password    |
|--------|--------------------------------------------|-------------|
| Admin  | admin@tatamotors-ims.com                   | Admin@12345 |
| Mentor | rahul.deshmukh@tatamotors-ims.com          | Mentor@123  |
| Intern | aditya.kulkarni@intern.tatamotors-ims.com  | Intern@123  |

**As Admin:**
1. Type the admin email and password into the two fields and click **Sign in**.
2. You land on the **Admin Dashboard** — you'll see stat cards (total interns, active interns, etc.), a department distribution bar chart, and a task-status pie chart.
3. Click **Interns** in the left sidebar. Click **Add intern** (top right) to open the form — fill in a name, email, intern ID, department, mentor, dates, and click **Save intern**.
4. Click the eye icon next to any intern row to open their full profile with tabs (Overview, Tasks, Attendance, Reports, Evaluations).
5. Click **Mentors** to see mentor workload, or **Add mentor** to create a new one.
6. Click **Departments** to add/edit/delete departments (a department with interns still linked cannot be deleted — the system will tell you why).
7. Click **Projects** → **New project** to create a project, assign a mentor, pick technologies, and check off which interns are on it.
8. Click **Log out** at the bottom of the sidebar when done.

**As Mentor:**
1. Log out, then sign in with the mentor credentials.
2. The **Mentor Dashboard** shows only interns assigned to this mentor.
3. Click **Tasks** → **Assign task**, pick one of your interns, set a priority and due date.
4. Click **Weekly Reports** to review any reports your interns have submitted — click **Review** on a submitted report, add feedback, and click **Approve** or **Request changes**.
5. Click **Evaluations**, pick an intern from the dropdown, click **New evaluation**, drag the five sliders (technical skills, problem solving, communication, teamwork, discipline), add comments, and save.

**As Intern:**
1. Log out, then sign in with the intern credentials.
2. The **Intern Dashboard** shows attendance %, pending tasks, and current project.
3. Click **Attendance** → choose "Present" (or Absent/Leave) → click **Mark attendance** to log today.
4. Click **My Tasks** → click **Start work** on a pending task, then **Submit work** to describe what you did.
5. Click **Weekly Reports** → **Submit report**, fill in the week's dates and work summary.
6. Click **Documents** → **Upload document**, choose a document type (Resume, Project Report, etc.), select a file from your computer, and upload it.

If anything doesn't load, check both terminal windows for red error text — that will tell you exactly what's wrong (usually a typo in one of the `.env` files).

---

## Part 5 — Deploying it live (optional but recommended for a portfolio)

### 5a. Push the code to GitHub

1. Go to https://github.com and sign in (or create a free account).
2. Click the **+** icon top-right → **New repository**. Name it `tata-intern-management-system`, leave it Public, and click **Create repository**.
3. Back in your terminal, from the **project root** (the folder containing both `backend` and `frontend`):
   ```
   git init
   git add .
   git commit -m "Initial commit: Tata Motors Internship Management System"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tata-intern-management-system.git
   git push -u origin main
   ```
   (The included `.gitignore` files already exclude `node_modules`, `.env`, and uploaded files, so your secrets stay off GitHub.)

### 5b. Deploy the backend on Render

1. Go to https://render.com and sign up (you can sign up with your GitHub account, which makes the next steps faster).
2. Click **New +** (top right) → **Web Service**.
3. Connect your GitHub account if prompted, then select your `tata-intern-management-system` repository.
4. Fill in the settings:
   - **Name:** `tata-intern-ims-api` (or anything you like)
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Scroll to **Environment Variables** and click **Add Environment Variable** for each of these (same values as your local `.env`, except `CLIENT_URL` which you'll update in step 5c):
   ```
   PORT=5000
   NODE_ENV=production
   MONGO_URI=<your Atlas connection string>
   JWT_SECRET=<your secret>
   JWT_EXPIRE=7d
   CLIENT_URL=https://your-frontend-url-will-go-here.vercel.app
   SEED_ADMIN_EMAIL=admin@tatamotors-ims.com
   SEED_ADMIN_PASSWORD=Admin@12345
   ```
6. Click **Create Web Service**. Wait for the build/deploy logs to finish (2-4 minutes) — you'll see "Your service is live" with a URL like `https://tata-intern-ims-api.onrender.com`. Copy this URL.
7. Note: Render's free tier spins the server down after 15 minutes of inactivity, so the first request after idling can take ~30-60 seconds to wake up. This is normal on the free tier.

### 5c. Deploy the frontend on Vercel

1. Go to https://vercel.com and sign up (again, GitHub sign-in is fastest).
2. Click **Add New...** → **Project**.
3. Import your `tata-intern-management-system` repository.
4. In the configuration screen:
   - **Root Directory:** click **Edit** and set it to `frontend`.
   - **Framework Preset:** Vercel should auto-detect "Vite".
5. Expand **Environment Variables** and add:
   ```
   VITE_API_URL=https://tata-intern-ims-api.onrender.com/api
   ```
   (using the Render URL you copied in the previous step, with `/api` appended).
6. Click **Deploy**. After 1-2 minutes you'll get a live URL like `https://tata-intern-management-system.vercel.app`.
7. Go back to Render, open your web service → **Environment**, and update `CLIENT_URL` to this real Vercel URL, then click **Save Changes** (this lets Render's CORS settings allow requests from your live frontend).

### 5d. Seed your production database (one time)

From your local machine, with your terminal in the `backend` folder and your local `.env` still pointing at the same Atlas `MONGO_URI` you used in Render:
```
npm run seed
```
This populates the same live database Render is connected to. Then visit your Vercel URL and log in with the demo credentials — you now have a fully live, deployed system.

---

## Part 6 — Common problems and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| `MongoNetworkError` or timeout when running `npm run seed` or `npm run dev` | Wrong password in `MONGO_URI`, or your IP isn't whitelisted | Re-check Part 1 step 8; re-add your IP under Atlas → Network Access |
| Frontend loads but login always fails with a network error | Backend isn't running, or `VITE_API_URL` is wrong | Confirm the backend terminal shows "Server running"; check `frontend/.env` |
| "CORS" error in the browser console | `CLIENT_URL` in the backend's `.env` doesn't match the URL you're loading the frontend from | Update `CLIENT_URL` to match exactly (including `http://` vs `https://`) |
| File upload fails with "not allowed" | Uploading a file type outside pdf/doc/docx/ppt/pptx/jpg/jpeg/png | Convert the file or use an accepted type |
| Render free instance is slow to respond the first time | Free tier auto-sleeps after 15 minutes idle | Normal — wait ~30-60 seconds on the first request |

---

## Part 7 — Presenting this project (resume / interview / GitHub)

The original project brief includes ready-to-use resume bullets, an interview talk-track, and a recommended GitHub README structure. If you'd like, I can turn those into a polished, portfolio-ready `README.md` for the GitHub repository itself (separate from this setup guide) — just ask.
