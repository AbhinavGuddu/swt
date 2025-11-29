# Railway Configuration Guide for China Airlines ULD System

## 🚂 Railway Deployment Instructions

### Step 1: Create Railway Services

आपको Railway में **2 अलग services** बनानी होंगी:

#### Service 1: Backend + Simulator
- **Root Directory:** `/`
- **Start Command:** `node backend/server.js`
- **Build Command:** `cd backend && npm install`

#### Service 2: Frontend
- **Root Directory:** `frontend`
- **Start Command:** `npm run preview`
- **Build Command:** `npm install && npm run build`

---

### Step 2: Environment Variables Setup

Railway dashboard में ये environment variables add करो:

**Backend Service:**
```
PORT=3000
NODE_ENV=production
```

**Frontend Service:**
```
VITE_API_URL=https://your-backend-url.railway.app
```

---

### Step 3: Deploy Commands

```bash
# Changes commit करो
git add .
git commit -m "Add Railway configuration"
git push origin main
```

Railway automatically redeploy कर देगा!

---

## ⚠️ Important Notes

1. **Frontend → Backend connection:**
   - Frontend को backend का URL chahiye
   - Railway dashboard से backend URL copy करो
   - Frontend में environment variable add करो

2. **Separate Services क्यों:**
   - Frontend static site है (Vite build)
   - Backend Node.js server है
   - दोनों अलग run command chahiye

3. **Free Tier Limits:**
   - $5 credit per month
   - Backend ~$3/month
   - Frontend ~$1/month
   - **Total: ~$4/month (free tier में fit!)**

---

## 🎯 Quick Fix for Current Error

Railway में जाकर **Settings** > **Deploy** में:

**Start Command को change करो:**
```
node backend/server.js
```

**Build Command:**
```
cd backend && npm install
```

Save करो और redeploy!
