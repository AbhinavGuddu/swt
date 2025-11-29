# Render.com Deployment Guide

## 🚀 Deploy China Airlines ULD System on Render.com (100% FREE)

### Why Render.com?
- ✅ **Free Tier:** Perfect for this project
- ✅ **WebSocket Support:** Socket.io काम करेगी
- ✅ **Easy Setup:** 5 minutes में deploy
- ✅ **Auto-deploy:** Git push करो, automatic deploy
- ✅ **HTTPS:** Free SSL certificate

---

## 📝 Deployment Steps

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (free account)

### Step 2: Connect GitHub Repository
1. Dashboard → **"New +"** button
2. Select **"Blueprint"**
3. **"Connect a repository"** → Select `swt` repository
4. Render will detect `render.yaml` file automatically!

### Step 3: Click Deploy! 🎉
- Render will create **2 services**:
  1. **Backend** (Node.js web service)
  2. **Frontend** (Static site)

### Step 4: Wait for Build (~3-5 minutes)
- Backend: Installing dependencies...
- Frontend: Building React app...

### Step 5: Get Your URLs
After deployment complete:
- **Backend:** `https://china-airlines-backend.onrender.com`
- **Frontend:** `https://china-airlines-frontend.onrender.com`

---

## ⚙️ Configuration Already Done!

The `render.yaml` file I created includes:

### Backend Service:
```yaml
- Node.js environment
- Free tier
- Auto-install dependencies
- Health check enabled
- Environment: production
```

### Frontend Service:
```yaml
- Static site
- Vite build
- API proxy to backend
- Client-side routing support
```

---

## 🎯 What Will Work

| Feature | Status |
|---------|--------|
| **Live Map** | ✅ Working |
| **Real-time Updates** | ✅ WebSocket working |
| **Dashboard** | ✅ All metrics |
| **Alerts** | ✅ Live notifications |
| **Sound Effects** | ✅ Working |
| **Analytics** | ✅ AI predictions |

---

## ⚠️ Important Notes

### 1. Free Tier Limitations:
- Backend may **sleep after 15 min** of inactivity
- First request **slow** (~30 seconds wake-up)
- 750 hours/month free

### 2. Keep-Alive Solution:
Use [UptimeRobot.com](https://uptimerobot.com) (free):
- Ping your backend every 5 minutes
- Keeps service awake
- 100% free monitoring

### 3. Environment Variables:
Render automatically sets:
- `PORT` → Backend port
- `NODE_ENV` → production

---

## 🔧 After Deployment

### Update Frontend API URL:
After backend deploys, update frontend to use backend URL:

1. In Render dashboard → Frontend service
2. Add Environment Variable:
   ```
   VITE_API_URL = https://china-airlines-backend.onrender.com
   ```
3. Redeploy frontend

---

## 🐛 Troubleshooting

### Backend not starting?
**Check logs:**
- Render Dashboard → Backend service → Logs
- Look for port binding errors

**Fix:**
```javascript
// backend/server.js should have:
const PORT = process.env.PORT || 3000;
```

### Frontend API calls failing?
**Update socket connection:**
```javascript
// frontend/src/App.jsx
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');
```

### CORS errors?
**Backend already configured:**
```javascript
app.use(cors()); // Allows all origins in production
```

---

## 📊 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Backend | Free Web Service | $0 |
| Frontend | Free Static Site | $0 |
| **Total** | | **$0/month** 🎉 |

---

## 🚀 Alternative: Single Service

If you want everything in one service:

1. **Don't use render.yaml**
2. Create **one Web Service**
3. Configure:
   ```
   Build: npm run build:all
   Start: npm run start:production
   ```
4. Serve frontend from backend (like we did for Railway)

---

## ✅ Deployment Checklist

- [ ] Push `render.yaml` to GitHub
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Deploy blueprint
- [ ] Wait for build completion
- [ ] Test backend URL
- [ ] Test frontend URL
- [ ] Verify WebSocket connection
- [ ] Check sound notifications
- [ ] Setup UptimeRobot (optional)

---

## 🎁 Bonus: Custom Domain

Render allows free custom domains!

1. Dashboard → Service → Settings
2. Add Custom Domain
3. Update DNS records
4. Free SSL automatically!

Example: `ULD.yourcompany.com`

---

## 📞 Support

If deployment fails:
1. Check Render build logs
2. Check GitHub commit (render.yaml exists?)
3. Verify Node version (`>=18.0.0`)

---

**Ready to deploy?** 

Just commit `render.yaml` and push! 🚀

```bash
git add render.yaml
git commit -m "Add Render.com deployment configuration"
git push origin main
```

Then go to Render.com and click **"New Blueprint"**! 🎉
