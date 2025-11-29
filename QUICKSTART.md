# Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Install all dependencies:
```bash
npm run install-all
```

This will install dependencies for:
- Root project
- Backend server
- Frontend app
- IoT simulator

## Running the Application

### Option 1: Run All Services Together (Recommended)

```bash
npm run dev
```

This starts:
- **Backend API**: http://localhost:3000
- **Frontend Dashboard**: http://localhost:5173
- **IoT Simulator**: Auto-generates ULD data

### Option 2: Run Services Individually

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - IoT Simulator:**
```bash
cd simulator
npm start
```

## Accessing the Dashboard

Once all services are running, open your browser and go to:

**http://localhost:5173**

You'll see:
- 🗺️ **Live Map**: Real-time ULD tracking on interactive map
- 📊 **Dashboard**: Metrics, KPIs, and distribution charts
- 📈 **Analytics**: AI predictions and demand forecasts
- 🔔 **Alerts**: Real-time notifications and warnings

## Features to Explore

1. **Interactive Map**
   - Click on ULD markers to see details
   - Filter by status (Available, In-Use, Issues)
   - Watch real-time updates as simulator moves ULDs

2. **Dashboard Metrics**
   - Total ULDs and availability
   - Utilization rates
   - Airport distribution
   - Low battery alerts

3. **AI Analytics**
   - 7-day demand forecast charts
   - Predicted shortage warnings
   - Optimization recommendations

4. **Alert System**
   - Critical, Warning, and Info alerts
   - Filter by severity
   - Real-time notifications

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

**Backend** - Edit `backend/.env`:
```
PORT=3001
```

**Frontend** - Edit `frontend/vite.config.js`:
```js
server: { port: 5174 }
```

### Dependencies Not Installing

Try installing individually:
```bash
cd backend && npm install
cd ../frontend && npm install
cd ../simulator && npm install
```

### No Data Showing

1. Make sure backend is running (check terminal)
2. Make sure simulator is running and sending data
3. Check browser console for errors (F12)

## Next Steps

- Customize ULD data in `backend/server.js`
- Add more airports or routes
- Integrate real IoT hardware
- Deploy to production server

Enjoy exploring the ULD Management System! 🚀
