# Perplexity Clone - Deployment Guide

## Prerequisites
- GitHub account
- Render account (for backend)
- Vercel account (for frontend)
- Git installed on your machine

---

## Step 1: Initialize Git Repository (if not already done)

```bash
cd c:\Users\anime\Downloads\perplexity-master
git init
git add .
git commit -m "Initial commit: Perplexity clone with all features"
```

Create a GitHub repository at https://github.com/new and then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/perplexity-master.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend on Render

### 2.1 Create a New Web Service on Render
1. Go to https://dashboard.render.com
2. Click "New Web Service"
3. Select "Build and deploy from a Git repository"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `perplexity-backend`
   - **Runtime**: Python
   - **Build Command**: `pip install -r server/requirements.txt`
   - **Start Command**: `cd server && uvicorn app:app --host 0.0.0.0 --port 10000`
   - **Root Directory**: `.` (leave blank)

### 2.2 Set Environment Variables
In Render Dashboard → Settings → Environment:

```
GOOGLE_API_KEY=AIzaSyAZV7kByRVy1FUwpg6aWhUtIip5eljCix4
TAVILY_API_KEY=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
```

### 2.3 Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note your backend URL: `https://perplexity-backend-xxxx.onrender.com`

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Deploy with Vercel CLI
```bash
npm install -g vercel
cd client
vercel
```

Or use Vercel Dashboard:

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

### 3.2 Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_BACKEND_URL=https://perplexity-backend-xxxx.onrender.com
```

Replace `perplexity-backend-xxxx.onrender.com` with your actual Render backend URL.

### 3.3 Deploy
- Click "Deploy"
- Wait for deployment
- Your frontend will be at: `https://perplexity-xxxx.vercel.app`

---

## Step 4: Update Local .env Files (Optional)

Update your local files to point to production:

### `/client/.env.local`
```env
NEXT_PUBLIC_BACKEND_URL=https://perplexity-backend-xxxx.onrender.com
```

### `/server/.env`
```env
GOOGLE_API_KEY=AIzaSyAZV7kByRVy1FUwpg6aWhUtIip5eljCix4
TAVILY_API_KEY=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
```

---

## Step 5: Deploy to Docker Hub (Optional)

### 5.1 Build Docker Image
```bash
cd server
docker build -t yourusername/perplexity:latest .
```

### 5.2 Push to Docker Hub
```bash
docker login
docker push yourusername/perplexity:latest
```

---

## Troubleshooting

### Backend Issues
- Check Render logs: Dashboard → Services → Backend → Logs
- Verify API keys are set correctly
- Test with: `https://your-backend-url/health`

### Frontend Issues
- Check Vercel logs: Dashboard → Deployments
- Verify `NEXT_PUBLIC_BACKEND_URL` is set
- Clear browser cache and refresh

### CORS Issues
- Backend should have CORS enabled (already done)
- Check network tab in browser DevTools

---

## Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend can communicate with backend
- [ ] API keys are securely stored in environment variables
- [ ] Search functionality works
- [ ] AI responses are generated correctly
- [ ] Focus modes appear in UI
- [ ] Conversation history saves

---

## Monitoring & Maintenance

### Render Dashboard
- Monitor backend logs
- Check uptime and performance
- Set up error notifications

### Vercel Dashboard
- Monitor frontend analytics
- Check deployment logs
- Set up git auto-deployment

### Regular Updates
- Pull latest code: `git pull`
- Test locally: `run.bat`
- Deploy: Push to main branch (auto-deploys)

---

## URLs After Deployment

- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-backend.onrender.com`
- **Backend Health**: `https://your-backend.onrender.com/health`

---

## Notes

- Free tier on Render spins down after 15 minutes of inactivity
- Upgrade to Paid plan for continuous uptime
- Vercel free tier includes unlimited deployments
- Both services auto-deploy when you push to main branch

