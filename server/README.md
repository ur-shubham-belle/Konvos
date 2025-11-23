# Konvos Backend Server

A Node.js/Express backend with SQLite database for the Konvos messaging application.

## Deploying to Render (Without GitHub)

### Step 1: Prepare Your Code Locally
1. Make sure you have the complete `server/` directory on your computer
2. The `.env` file is already configured with your Stream API credentials
3. Test locally first (see "Running Locally" section below)

### Step 2: Create New Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Choose "Deploy an existing image or public Git repository"
4. **IMPORTANT**: Select "Public Git repository" and enter: `https://github.com/render-examples/express-hello-world` (this is temporary)
5. OR use the "Deploy without Git" option if available

### Step 3: Configure Build Settings
- **Name**: `konvos-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `server` (important!)
- **Build Command**: `npm install && npm run init-db`
- **Start Command**: `npm start`

### Step 4: Set Environment Variables
In the "Environment" section, add:
- `STREAM_API_KEY`: `vfdtvg3uh9b3`
- `STREAM_API_SECRET`: `27sftgh8nb69pkxckazmw8e2k2kwpk5vuesupuana3x2223mevxzpsudkh5wethn`
- `PORT`: Leave blank (Render auto-assigns)

### Step 5: Upload Your Code
After creating the service:
1. Go to your service's "Settings" tab
2. Look for "Deploy Hook" or manual deployment options
3. You can use Render's CLI tool or manually zip and upload your `server/` folder
4. **Alternative**: Create a free GitHub account just for deployment (easiest option)

### Step 6: Deploy
- Click "Manual Deploy" → "Deploy latest commit" or trigger via CLI
- Wait for deployment (first build takes 2-3 minutes)
- Copy your service URL (e.g., `https://konvos-backend.onrender.com`)

### Step 7: Update Frontend
Update `src/config.ts` in your frontend:
```typescript
export const API_URL = 'https://konvos-backend.onrender.com';
```

## Running Locally

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
# Then edit .env with your actual keys

# Initialize database
npm run init-db

# Start development server
npm run dev
```

## Important Notes
- Render free tier sleeps after inactivity (cold starts ~30s)
- SQLite database persists on Render's disk
- For production, consider using Render's PostgreSQL for better reliability
