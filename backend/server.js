const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? true : "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// In-memory data store (replace with MongoDB in production)
let uldsData = [];
let alertsData = [];
let analyticsData = {
  totalULDs: 0,
  available: 0,
  inUse: 0,
  maintenance: 0,
  lost: 0,
  utilizationRate: 0,
  avgTurnaroundTime: 0,
  recordAccuracy: 0
};

// Initialize sample ULDs
function initializeSampleData() {
  const airports = ['TPE', 'LAX', 'NRT', 'HKG', 'SIN', 'BKK', 'ICN'];
  const types = ['AKE', 'AKN', 'AMA', 'AAP'];
  const statuses = ['available', 'in-use', 'in-transit', 'maintenance'];

  for (let i = 1; i <= 50; i++) {
    const airport = airports[Math.floor(Math.random() * airports.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    uldsData.push({
      id: `${type}${String(i).padStart(5, '0')}CI`,
      type: type,
      status: status,
      airport: airport,
      location: {
        lat: 25.0797 + (Math.random() - 0.5) * 50,
        lng: 121.2342 + (Math.random() - 0.5) * 100,
        zone: `${airport}_Warehouse_${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 10)}`,
        airport: airport
      },
      sensors: {
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        shockLevel: Math.random() * 2,
        battery: 60 + Math.random() * 40
      },
      lastUpdate: new Date(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    });
  }

  updateAnalytics();
}

function updateAnalytics() {
  analyticsData.totalULDs = uldsData.length;
  analyticsData.available = uldsData.filter(u => u.status === 'available').length;
  analyticsData.inUse = uldsData.filter(u => u.status === 'in-use').length;
  analyticsData.maintenance = uldsData.filter(u => u.status === 'maintenance').length;
  analyticsData.lost = uldsData.filter(u => u.status === 'lost').length;
  analyticsData.utilizationRate = ((analyticsData.inUse / analyticsData.totalULDs) * 100).toFixed(1);
  analyticsData.avgTurnaroundTime = (2.5 + Math.random() * 2).toFixed(1);
  analyticsData.recordAccuracy = (92 + Math.random() * 6).toFixed(1);
}

// Routes

// Get all ULDs
app.get('/api/ulds', (req, res) => {
  res.json({
    success: true,
    count: uldsData.length,
    data: uldsData
  });
});

// Get specific ULD
app.get('/api/ulds/:id', (req, res) => {
  const uld = uldsData.find(u => u.id === req.params.id);
  if (!uld) {
    return res.status(404).json({
      success: false,
      message: 'ULD not found'
    });
  }
  res.json({
    success: true,
    data: uld
  });
});

// Update ULD location (from IoT simulator)
app.post('/api/ulds/:id/location', (req, res) => {
  const uld = uldsData.find(u => u.id === req.params.id);
  if (!uld) {
    return res.status(404).json({
      success: false,
      message: 'ULD not found'
    });
  }

  // Update location and sensors
  if (req.body.location) uld.location = req.body.location;
  if (req.body.sensors) uld.sensors = req.body.sensors;
  if (req.body.status) uld.status = req.body.status;
  uld.lastUpdate = new Date();

  // Emit real-time update via WebSocket
  io.emit('uld-update', uld);

  // Check for alerts
  checkAlerts(uld);
  updateAnalytics();

  res.json({
    success: true,
    data: uld
  });
});

// Get dashboard analytics
app.get('/api/analytics/dashboard', (req, res) => {
  updateAnalytics();
  res.json({
    success: true,
    data: analyticsData
  });
});

// Get alerts
app.get('/api/alerts', (req, res) => {
  res.json({
    success: true,
    count: alertsData.length,
    data: alertsData
  });
});

// Get AI predictions
app.get('/api/predictions', (req, res) => {
  // Mock AI predictions
  const predictions = {
    demandForecast: generateDemandForecast(),
    shortageWarnings: generateShortageWarnings(),
    optimizationSuggestions: generateOptimizationSuggestions()
  };

  res.json({
    success: true,
    data: predictions
  });
});

// Helper functions

function checkAlerts(uld) {
  // Low battery alert
  if (uld.sensors.battery < 20) {
    addAlert({
      type: 'warning',
      severity: 'medium',
      title: 'Low Battery',
      message: `ULD ${uld.id} battery at ${uld.sensors.battery.toFixed(1)}%`,
      uldId: uld.id,
      timestamp: new Date()
    });
  }

  // High shock level
  if (uld.sensors.shockLevel > 5) {
    addAlert({
      type: 'critical',
      severity: 'high',
      title: 'Impact Detected',
      message: `ULD ${uld.id} experienced high impact (${uld.sensors.shockLevel.toFixed(1)}g)`,
      uldId: uld.id,
      timestamp: new Date()
    });
  }

  // Temperature out of range
  if (uld.sensors.temperature < 5 || uld.sensors.temperature > 35) {
    addAlert({
      type: 'warning',
      severity: 'medium',
      title: 'Temperature Warning',
      message: `ULD ${uld.id} temperature at ${uld.sensors.temperature.toFixed(1)}°C`,
      uldId: uld.id,
      timestamp: new Date()
    });
  }
}

function addAlert(alert) {
  alert.id = `ALERT${Date.now()}`;
  alertsData.unshift(alert);

  // Keep only last 100 alerts
  if (alertsData.length > 100) {
    alertsData = alertsData.slice(0, 100);
  }

  // Emit alert via WebSocket
  io.emit('new-alert', alert);
}

function generateDemandForecast() {
  const forecast = [];
  const routes = ['TPE-LAX', 'TPE-NRT', 'TPE-SIN', 'LAX-TPE', 'NRT-TPE'];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const routeData = {};
    routes.forEach(route => {
      routeData[route] = Math.floor(5 + Math.random() * 15);
    });

    forecast.push({
      date: date.toISOString().split('T')[0],
      ...routeData
    });
  }

  return forecast;
}

function generateShortageWarnings() {
  const warnings = [];
  const airports = ['LAX', 'NRT', 'SIN'];

  airports.forEach(airport => {
    if (Math.random() > 0.5) {
      warnings.push({
        airport: airport,
        predictedShortage: Math.floor(3 + Math.random() * 7),
        timeframe: '48 hours',
        confidence: (85 + Math.random() * 10).toFixed(1) + '%'
      });
    }
  });

  return warnings;
}

function generateOptimizationSuggestions() {
  return [
    {
      type: 'reallocation',
      priority: 'high',
      suggestion: 'Move 5 ULDs from TPE to LAX to prevent shortage',
      estimatedImpact: 'Reduce turnaround time by 1.2 hours'
    },
    {
      type: 'maintenance',
      priority: 'medium',
      suggestion: 'Schedule maintenance for 8 ULDs with high usage',
      estimatedImpact: 'Prevent potential equipment failure'
    },
    {
      type: 'efficiency',
      priority: 'low',
      suggestion: 'Optimize warehouse layout at NRT',
      estimatedImpact: 'Save 15 minutes per ULD retrieval'
    }
  ];
}

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Root route for health check (Must be before wildcard)
app.get('/', (req, res) => {
  res.send('🚀 China Airlines ULD Backend is Running!');
});

// Serve frontend for all other routes (client-side routing)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Check if file exists before sending, otherwise 404
    const indexPath = path.join(__dirname, '../frontend/dist/index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend build not found on backend server. Use the Frontend URL.');
    }
  });
}

// Update ULD location and status
app.post('/api/ulds/:id/location', (req, res) => {
  const uld = uldsData.find(u => u.id === req.params.id);

  if (!uld) {
    return res.status(404).json({
      success: false,
      message: 'ULD not found'
    });
  }

  // Update location and sensors
  if (req.body.location) uld.location = req.body.location;
  if (req.body.sensors) uld.sensors = req.body.sensors;
  if (req.body.status) uld.status = req.body.status;
  uld.lastUpdate = new Date();

  // Emit real-time update via WebSocket
  io.emit('uld-update', uld);

  // Check for alerts
  checkAlerts(uld);
  updateAnalytics();

  res.json({
    success: true,
    data: uld
  });
});

// --- Internal Simulator for Live Updates (Render Compatible) ---
function startInternalSimulator() {
  console.log('🚀 Starting Internal Simulator...');

  const AIRPORTS = {
    TPE: { lat: 25.0797, lng: 121.2342 },
    LAX: { lat: 33.9416, lng: -118.4085 },
    NRT: { lat: 35.7647, lng: 140.3864 },
    HKG: { lat: 22.3080, lng: 113.9185 },
    SIN: { lat: 1.3644, lng: 103.9915 },
    BKK: { lat: 13.6900, lng: 100.7501 },
    ICN: { lat: 37.4602, lng: 126.4407 }
  };

  setInterval(() => {
    let updatesCount = 0;

    uldsData.forEach(uld => {
      // Update 40% of ULDs each tick
      if (Math.random() < 0.4) {
        updatesCount++;

        // 1. Simulate Movement
        const airport = AIRPORTS[uld.airport];
        if (airport) {
          uld.location.lat = airport.lat + (Math.random() - 0.5) * 0.05;
          uld.location.lng = airport.lng + (Math.random() - 0.5) * 0.05;
        }

        // 2. Simulate Sensors
        uld.sensors.temperature = Math.max(10, Math.min(40, uld.sensors.temperature + (Math.random() - 0.5) * 2));
        uld.sensors.humidity = Math.max(30, Math.min(90, uld.sensors.humidity + (Math.random() - 0.5) * 5));

        // Battery drain
        if (uld.status === 'in-use') uld.sensors.battery -= 0.1;
        if (uld.sensors.battery < 0) uld.sensors.battery = 0;

        // 3. Generate Alerts
        if (uld.sensors.temperature > 35) {
          const alert = {
            id: Date.now() + Math.random(),
            uldId: uld.id,
            type: 'Temperature',
            message: `High temperature detected: ${uld.sensors.temperature.toFixed(1)}°C`,
            severity: 'warning',
            timestamp: new Date()
          };
          alertsData.unshift(alert);
          if (alertsData.length > 50) alertsData.pop();
          io.emit('new-alert', alert);
        }

        if (uld.sensors.battery < 15 && uld.sensors.battery > 14.8) { // Trigger once around 15%
          const alert = {
            id: Date.now() + Math.random(),
            uldId: uld.id,
            type: 'Battery',
            message: `Low battery: ${uld.sensors.battery.toFixed(1)}%`,
            severity: 'critical',
            timestamp: new Date()
          };
          alertsData.unshift(alert);
          io.emit('new-alert', alert);
        }

        // Emit update
        io.emit('uld-updated', uld);
      }
    });

    // Broadcast dashboard stats update occasionally
    if (Math.random() < 0.2) {
      updateAnalytics();
      io.emit('dashboard-update', analyticsData);
    }

  }, 5000); // Run every 5 seconds
}

// Start the simulator
startInternalSimulator();

// Get dashboard analytics
app.get('/api/analytics/dashboard', (req, res) => {
  updateAnalytics();
  res.json({
    success: true,
    data: analyticsData
  });
});

// Get alerts
app.get('/api/alerts', (req, res) => {
  res.json({
    success: true,
    count: alertsData.length,
    data: alertsData
  });
});

// Get AI predictions
app.get('/api/predictions', (req, res) => {
  // Mock AI predictions
  const predictions = {
    demandForecast: generateDemandForecast(),
    shortageWarnings: generateShortageWarnings(),
    optimizationSuggestions: generateOptimizationSuggestions()
  };

  res.json({
    success: true,
    data: predictions
  });
});

// Helper functions

function updateAnalytics() {
  const total = uldsData.length;
  const available = uldsData.filter(u => u.status === 'available').length;
  const inUse = uldsData.filter(u => u.status === 'in-use').length;
  const maintenance = uldsData.filter(u => u.status === 'maintenance').length;
  const lost = uldsData.filter(u => u.status === 'lost').length;

  analyticsData = {
    totalULDs: total,
    available: available,
    inUse: inUse,
    maintenance: maintenance,
    lost: lost,
    utilizationRate: total > 0 ? ((inUse / total) * 100).toFixed(1) : 0,
    avgTurnaroundTime: Math.floor(12 + Math.random() * 4), // Mock data
    recordAccuracy: (98 + Math.random()).toFixed(1) // Mock data
  };
}

function checkAlerts(uld) {
  // Low battery alert
  if (uld.sensors.battery < 20) {
    addAlert({
      type: 'warning',
      severity: 'medium',
      title: 'Low Battery',
      message: `ULD ${uld.id} battery at ${uld.sensors.battery.toFixed(1)}%`,
      uldId: uld.id,
      timestamp: new Date()
    });
  }

  // High shock level
  if (uld.sensors.shockLevel > 5) {
    addAlert({
      type: 'critical',
      severity: 'high',
      title: 'Impact Detected',
      message: `ULD ${uld.id} experienced high impact (${uld.sensors.shockLevel.toFixed(1)}g)`,
      uldId: uld.id,
      timestamp: new Date()
    });
  }

  // Temperature out of range
  if (uld.sensors.temperature < 5 || uld.sensors.temperature > 35) {
    addAlert({
      type: 'warning',
      severity: 'medium',
      title: 'Temperature Warning',
      message: `ULD ${uld.id} temperature at ${uld.sensors.temperature.toFixed(1)}°C`,
      uldId: uld.id,
      timestamp: new Date()
    });
  }
}

function addAlert(alert) {
  alert.id = `ALERT${Date.now()}`;
  alertsData.unshift(alert);

  // Keep only last 100 alerts
  if (alertsData.length > 100) {
    alertsData = alertsData.slice(0, 100);
  }

  // Emit alert via WebSocket
  io.emit('new-alert', alert);
}

function generateDemandForecast() {
  const forecast = [];
  const routes = ['TPE-LAX', 'TPE-NRT', 'TPE-SIN', 'LAX-TPE', 'NRT-TPE'];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const routeData = {};
    routes.forEach(route => {
      routeData[route] = Math.floor(5 + Math.random() * 15);
    });

    forecast.push({
      date: date.toISOString().split('T')[0],
      ...routeData
    });
  }

  return forecast;
}

function generateShortageWarnings() {
  const warnings = [];
  const airports = ['LAX', 'NRT', 'SIN'];

  airports.forEach(airport => {
    if (Math.random() > 0.5) {
      warnings.push({
        airport: airport,
        predictedShortage: Math.floor(3 + Math.random() * 7),
        timeframe: '48 hours',
        confidence: (85 + Math.random() * 10).toFixed(1) + '%'
      });
    }
  });

  return warnings;
}

function generateOptimizationSuggestions() {
  return [
    {
      type: 'reallocation',
      priority: 'high',
      suggestion: 'Move 5 ULDs from TPE to LAX to prevent shortage',
      estimatedImpact: 'Reduce turnaround time by 1.2 hours'
    },
    {
      type: 'maintenance',
      priority: 'medium',
      suggestion: 'Schedule maintenance for 8 ULDs with high usage',
      estimatedImpact: 'Prevent potential equipment failure'
    },
    {
      type: 'efficiency',
      priority: 'low',
      suggestion: 'Optimize warehouse layout at NRT',
      estimatedImpact: 'Save 15 minutes per ULD retrieval'
    }
  ];
}

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Root route for health check (Must be before wildcard)
app.get('/', (req, res) => {
  res.send('🚀 China Airlines ULD Backend is Running!');
});

// Serve frontend for all other routes (client-side routing)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Check if file exists before sending, otherwise 404
    const indexPath = path.join(__dirname, '../frontend/dist/index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend build not found on backend server. Use the Frontend URL.');
    }
  });
}

// Initialize data
initializeSampleData();

// --- Internal Simulator for Live Updates (Render Compatible) ---
function startInternalSimulator() {
  console.log('🚀 Starting Internal Simulator...');

  const AIRPORTS = {
    TPE: { lat: 25.0797, lng: 121.2342 },
    LAX: { lat: 33.9416, lng: -118.4085 },
    NRT: { lat: 35.7647, lng: 140.3864 },
    HKG: { lat: 22.3080, lng: 113.9185 },
    SIN: { lat: 1.3644, lng: 103.9915 },
    BKK: { lat: 13.6900, lng: 100.7501 },
    ICN: { lat: 37.4602, lng: 126.4407 }
  };

  setInterval(() => {
    let updatesCount = 0;

    uldsData.forEach(uld => {
      // Update 40% of ULDs each tick
      if (Math.random() < 0.4) {
        updatesCount++;

        // 1. Simulate Movement
        const airport = AIRPORTS[uld.airport];
        if (airport) {
          uld.location.lat = airport.lat + (Math.random() - 0.5) * 0.05;
          uld.location.lng = airport.lng + (Math.random() - 0.5) * 0.05;
        }

        // 2. Simulate Sensors
        uld.sensors.temperature = Math.max(10, Math.min(40, uld.sensors.temperature + (Math.random() - 0.5) * 2));
        uld.sensors.humidity = Math.max(30, Math.min(90, uld.sensors.humidity + (Math.random() - 0.5) * 5));

        // Battery drain
        if (uld.status === 'in-use') uld.sensors.battery -= 0.1;
        if (uld.sensors.battery < 0) uld.sensors.battery = 0;

        // 3. Generate Alerts
        if (uld.sensors.temperature > 35) {
          const alert = {
            id: Date.now() + Math.random(),
            uldId: uld.id,
            type: 'Temperature',
            message: `High temperature detected: ${uld.sensors.temperature.toFixed(1)}°C`,
            severity: 'warning',
            timestamp: new Date()
          };
          alertsData.unshift(alert);
          if (alertsData.length > 50) alertsData.pop();
          io.emit('new-alert', alert);
        }

        if (uld.sensors.battery < 15 && uld.sensors.battery > 14.8) { // Trigger once around 15%
          const alert = {
            id: Date.now() + Math.random(),
            uldId: uld.id,
            type: 'Battery',
            message: `Low battery: ${uld.sensors.battery.toFixed(1)}%`,
            severity: 'critical',
            timestamp: new Date()
          };
          alertsData.unshift(alert);
          io.emit('new-alert', alert);
        }

        // Emit update
        io.emit('uld-updated', uld);
      }
    });

    // Broadcast dashboard stats update occasionally
    if (Math.random() < 0.2) {
      updateAnalytics();
      io.emit('dashboard-update', analyticsData);
    }

  }, 5000); // Run every 5 seconds
}

// Start the simulator
startInternalSimulator();

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 ULD Management API server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ready for real-time updates`);
});
