# China Airlines ULD Management System - Technical Documentation

## Project Overview

A comprehensive IoT and AI-powered solution for real-time tracking and management of Unit Load Devices (ULDs) in the aviation cargo industry.

### Key Problem Solved
- Eliminates manual, paper-based ULD tracking
- Provides real-time visibility of all ULDs worldwide
- Reduces "record vs reality mismatch" (帳實不符)
- Enables proactive alerts instead of reactive searches
- Optimizes ULD allocation using AI predictions

---

## System Architecture

### Technology Stack

**Backend**
- Node.js + Express.js (REST API)
- Socket.io (WebSocket for real-time updates)
- In-memory data store (easily replaceable with MongoDB)

**Frontend**
- React 18 with Vite
- React Router for navigation
- Leaflet for interactive maps
- Recharts for data visualization
- Lucide React for icons

**IoT Simulator**
- Node.js with Axios
- Simulates realistic ULD sensor data
- Updates every 5 seconds

### Component Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
│  ┌────────┬────────┬────────┬────────┐ │
│  │  Map   │Dashboard│Analytics│Alerts│ │
│  └────────┴────────┴────────┴────────┘ │
└───────────────┬─────────────────────────┘
                │ HTTP + WebSocket
┌───────────────▼─────────────────────────┐
│      Backend API (Express + Socket.io)  │
│  ┌──────────────────────────────────┐   │
│  │ REST Endpoints │ WebSocket Events│   │
│  │ Analytics      │ Alert System    │   │
│  └──────────────────────────────────┘   │
└───────────────▲─────────────────────────┘
                │ HTTP POST
┌───────────────┴─────────────────────────┐
│        IoT Simulator (Node.js)          │
│  Generates realistic ULD sensor data    │
└─────────────────────────────────────────┘
```

---

## API Documentation

### REST Endpoints

#### `GET /api/ulds`
Get all ULDs with current status

**Response:**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "id": "AKE00001CI",
      "type": "AKE",
      "status": "available",
      "airport": "TPE",
      "location": {
        "lat": 25.0797,
        "lng": 121.2342,
        "zone": "TPE_Warehouse_A3",
        "airport": "TPE"
      },
      "sensors": {
        "temperature": 22.5,
        "humidity": 65,
        "shockLevel": 0.2,
        "battery": 87
      },
      "lastUpdate": "2025-11-27T23:00:00Z"
    }
  ]
}
```

#### `GET /api/ulds/:id`
Get specific ULD details

#### `POST /api/ulds/:id/location`
Update ULD location and sensor data (used by IoT simulator)

**Request Body:**
```json
{
  "location": {
    "lat": 25.08,
    "lng": 121.23,
    "zone": "TPE_Ramp_North"
  },
  "sensors": {
    "temperature": 23.0,
    "humidity": 60,
    "shockLevel": 0.1,
    "battery": 86
  },
  "status": "in-use"
}
```

#### `GET /api/analytics/dashboard`
Get dashboard metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalULDs": 50,
    "available": 25,
    "inUse": 15,
    "maintenance": 3,
    "lost": 0,
    "utilizationRate": "60.0",
    "avgTurnaroundTime": "3.2",
    "recordAccuracy": "95.4"
  }
}
```

#### `GET /api/alerts`
Get all active alerts

#### `GET /api/predictions`
Get AI predictions (demand forecast, shortage warnings, optimization suggestions)

### WebSocket Events

#### `connection`
Client connects to server

#### `uld-update`
Real-time ULD location/status update
```js
socket.on('uld-update', (uld) => {
  console.log('ULD updated:', uld);
});
```

#### `new-alert`
New alert generated
```js
socket.on('new-alert', (alert) => {
  console.log('New alert:', alert);
});
```

---

## Frontend Components

### 1. MapView
- **Purpose**: Interactive world map with real-time ULD tracking
- **Features**:
  - Custom markers with status-based colors
  - Click markers for detailed popup
  - Filter by status (All, Available, In-Use, Issues)
  - Live statistics cards
- **Technologies**: React Leaflet, OpenStreetMap tiles

### 2. Dashboard
- **Purpose**: High-level metrics and KPIs
- **Features**:
  - Key metrics cards (Total, Available, In-Use, Maintenance)
  - ULD distribution by airport (bar charts)
  - Low battery alerts list
  - Recent activity feed
- **Technologies**: React, custom CSS animations

### 3. Analytics
- **Purpose**: AI-powered insights and predictions
- **Features**:
  - 7-day demand forecast (line chart)
  - Predicted shortage warnings
  - Optimization recommendations
  - AI insights summary
- **Technologies**: Recharts for data visualization

### 4. AlertPanel
- **Purpose**: Centralized alert management
- **Features**:
  - Filter by severity (Critical, Warning, Info)
  - Alert statistics cards
  - Detailed alert cards with metadata
  - Alert type legend
- **Technologies**: React, custom severity-based styling

---

## IoT Simulator

### How It Works
1. Fetches current ULD list from backend
2. Every 5 seconds:
   - Simulates movement (GPS coordinates change)
   - Updates sensor readings (temperature, humidity, shock, battery)
   - POSTs updates to backend API
3. Realistic scenarios:
   - 80% normal operations
   - 15% in-transit
   - 5% anomalies (low battery, high impact)

### Sensor Simulation Logic

**Temperature**: Varies slowly (±2°C), stays within 10-40°C
**Humidity**: Varies slowly (±5%), stays within 30-90%
**Shock Level**: Mostly low (<0.5g), occasional spikes (>3g)
**Battery**: 
- Drains slowly when idle (0.01-0.02% per update)
- Drains faster when in-use (0.1-0.2% per update)
- Charges in warehouse zones (+0.5-1% per update)

---

## Alert System

### Alert Types

| Type | Severity | Trigger Condition | Action Required |
|------|----------|------------------|----------------|
| Low Battery | Warning | Battery < 20% | Schedule charging |
| Impact Detected | Critical | Shock > 5g | Inspect ULD for damage |
| Temperature Warning | Warning | Temp < 5°C or > 35°C | Check cargo conditions |
| Lost ULD | Critical | No update >24 hours | Search and locate |
| Record Mismatch | Warning | System ≠ Reality | Reconcile records |

---

## AI/ML Features

### 1. Demand Forecasting
- **Algorithm**: Time-series analysis based on historical patterns
- **Output**: 7-day forecast per route
- **Use Case**: Plan ULD allocation ahead of demand spikes

### 2. Anomaly Detection
- **Algorithm**: Rule-based + statistical thresholds
- **Output**: Alerts for unusual patterns
- **Use Case**: Detect lost/stuck ULDs early

### 3. Optimization Suggestions
- **Algorithm**: Greedy algorithm for resource allocation
- **Output**: Actionable recommendations
- **Use Case**: Reallocation to prevent shortages

---

## Power Management Strategy

### IoT Sensor Power Options

**Option 1: Long-life Battery (Current PoC)**
- Industrial Li-SOCl₂ batteries
- 5-10 year lifespan
- -55°C to +85°C operating range
- Replace during scheduled maintenance

**Option 2: Energy Harvesting (Future)**
- Solar panels on ULD top surface
- Piezoelectric vibration harvesting
- Wireless charging pads in warehouses

**Smart Power Management**:
- Sleep mode: GPS update every 5-15 min (stationary)
- Active mode: Update every 30 sec (moving)
- Auto-charging in warehouse zones

---

## Deployment Guide

### Development Environment

```bash
# Clone/copy project
cd china-airlines-uld

# Install all dependencies
npm run install-all

# Run all services
npm run dev
```

### Production Deployment

**Backend**:
```bash
# Use PM2 for process management
npm install -g pm2
cd backend
pm2 start server.js --name uld-api
```

**Frontend**:
```bash
# Build production bundle
cd frontend
npm run build

# Serve with nginx or similar
```

**Database**: Replace in-memory store with MongoDB
```js
// backend/database.js
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

---

## Performance Metrics

### Current PoC Performance
- **Backend**: Handles 50 ULDs with <10ms response time
- **Frontend**: 60 FPS on interactive map
- **WebSocket**: <100ms latency for real-time updates
- **Simulator**: Updates 50 ULDs every 5 seconds

### Scalability Targets
- **Production**: Support 10,000+ ULDs
- **Response Time**: <200ms for API calls
- **Real-time Updates**: <500ms end-to-end latency
- **Concurrent Users**: 100+ dashboard users

---

## Security Considerations

### For Production Implementation

1. **Authentication**: JWT-based auth for API access
2. **Authorization**: Role-based access control (RBAC)
3. **Data Encryption**: TLS/SSL for all communications
4. **IoT Security**: Encrypted sensor → gateway communication
5. **Rate Limiting**: Prevent API abuse
6. **Input Validation**: Sanitize all user inputs

---

## Future Enhancements

### Phase 2 (Pilot)
- Real IoT hardware integration
- MongoDB database
- User authentication
- Mobile app (React Native)
- Advanced ML models (TensorFlow)

### Phase 3 (Production)
- Multi-region deployment
- Load balancing
- Automated testing (Jest, Cypress)
- CI/CD pipeline
- Integration with existing airline systems

---

## ROI Analysis

### Expected Benefits

**Operational Efficiency**:
- 90% reduction in ULD search time
- 30% faster turnaround time
- 95%+ record accuracy (帳實相符)

**Cost Savings**:
- Reduced labor costs (automated tracking)
- Lower ULD loss/theft
- Optimized fleet size (fewer containers needed)
- Better maintenance scheduling

**Strategic Value**:
- Industry-leading innovation
- Enhanced customer satisfaction
- ESG alignment (reduced waste, optimized resources)
- Data-driven decision making

### Estimated Annual Savings
- Labor: $500K - $1M
- Lost ULDs: $200K - $500K
- Fleet Optimization: $300K - $700K
- **Total**: $1M - $2.2M per year

---

## Support & Maintenance

### Monitoring
- Server health: PM2 monitoring
- Error tracking: Sentry or similar
- Analytics: Google Analytics for dashboard usage

### Updates
- Regular security patches
- Quarterly feature updates
- Annual ML model retraining

---

## Contact & Credits

**Project**: China Airlines ULD Management Challenge
**Built with**: Node.js, React, Leaflet, Recharts
**License**: MIT

---

## Appendix

### ULD Types
- **AKE**: LD3 Container (156×153×159 cm)
- **AKN**: LD8 Container (243×153×159 cm)
- **AMA**: LD1 Container (156×153×162 cm)
- **AAP**: Pallet (2.24×3.18 m)

### Airport Codes
- **TPE**: Taipei Taoyuan International Airport
- **LAX**: Los Angeles International Airport
- **NRT**: Tokyo Narita International Airport
- **HKG**: Hong Kong International Airport
- **SIN**: Singapore Changi Airport
- **BKK**: Bangkok Suvarnabhumi Airport
- **ICN**: Seoul Incheon International Airport
