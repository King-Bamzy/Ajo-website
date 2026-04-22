# Render Deployment Guide

This app is ready for deployment as a Node web service on Render.

## What you need

- A GitHub account
- A Render account
- A MongoDB database

The easiest database option is **MongoDB Atlas** because it has a free tier. This app can also connect to a MongoDB instance hosted on Render, but Atlas is usually simpler for a first deployment.

## Files already prepared for you

- `render.yaml` tells Render how to build and start the app
- `package.json` already includes `npm start`
- `src/index.js` already listens on `process.env.PORT`

## Environment variables to set on Render

- `MONGO_URI`
- `CLIENT_URL`
- `AUTH_SECRET`
- `AUTH_SESSION_MAX_AGE_SECONDS`

Recommended values:

- `CLIENT_URL` = your final Render URL, for example `https://ajo-thrift.onrender.com`
- `AUTH_SESSION_MAX_AGE_SECONDS` = `604800`

## Before you deploy

Do not upload these to GitHub:

- `.env`
- `node_modules`

They are already ignored by `.gitignore`.

## Step 1: Put this project on GitHub

1. Create a new empty GitHub repository.
2. Upload this project to that repository.
3. Make sure these files are included:
   - `src/`
   - `views/`
   - `public/`
   - `scripts/`
   - `package.json`
   - `package-lock.json`
   - `render.yaml`

## Step 2: Create a MongoDB database

### Option A: MongoDB Atlas

1. Go to MongoDB Atlas.
2. Create a free cluster.
3. Create a database user and password.
4. In Network Access, allow access from anywhere temporarily using `0.0.0.0/0`.
5. Copy the connection string.
6. Replace the placeholder username, password, and database name in the URI.

Example format:

`mongodb+srv://USERNAME:PASSWORD@cluster-name.mongodb.net/ajo-thrift?retryWrites=true&w=majority`

### Option B: MongoDB on Render

Render's official docs also support running MongoDB as a private service, but that setup is usually more advanced and not on the free web-service path.

## Step 3: Deploy the app on Render

1. Log in to Render.
2. Click `New +`.
3. Click `Web Service`.
4. Connect your GitHub account if Render asks.
5. Select your repository.

If Render detects `render.yaml`, let it use that configuration.

If Render asks you to enter values manually, use:

- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

## Step 4: Add environment variables in Render

In the Render service settings, add:

- `MONGO_URI` = your MongoDB connection string
- `CLIENT_URL` = your Render site URL, for example `https://your-service-name.onrender.com`
- `AUTH_SECRET` = any long random secret string
- `AUTH_SESSION_MAX_AGE_SECONDS` = `604800`

Do not set `PORT` manually. Render provides it automatically.

## Step 5: Deploy

1. Click `Create Web Service`.
2. Wait for the build and deploy logs to finish.
3. Open your Render URL.
4. Visit `/health` to confirm the app is alive.

Example:

`https://your-service-name.onrender.com/health`

You should see JSON showing the service is OK.

## Step 6: Seed demo data

This project includes a seed script that creates:

- demo items
- demo collections
- an admin user
- a normal member user

Run the seed script only once against your deployed database:

`npm run seed`

You can run it:

- locally, after temporarily pointing your local `.env` to the same `MONGO_URI`
- or from a Render shell / one-off command if available in your account

Important:

The seed script deletes existing users, items, and collections before recreating them. Do not run it on a live database after real users start using the app.

## Demo login after seeding

Default seed credentials:

- Admin: `admin@ajo.local` / `Admin1234!`
- Member: `member@ajo.local` / `Member1234!`

You can change those with the optional seed environment variables before running the seed:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_MEMBER_EMAIL`
- `SEED_MEMBER_PASSWORD`

## Pages to test after deploy

- `/`
- `/auth/signup`
- `/auth/login`
- `/account`
- `/admin`

## Official docs I used

- Render web services: https://render.com/docs/web-services
- Render Blueprint reference: https://render.com/docs/blueprint-spec
- Render health checks: https://render.com/docs/health-checks
- Render + MongoDB Atlas: https://render.com/docs/connect-to-mongodb-atlas
