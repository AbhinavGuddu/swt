const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Airport coordinates
const AIRPORTS = {
    TPE: { lat: 25.0797, lng: 121.2342, name: 'Taipei Taoyuan' },
    LAX: { lat: 33.9416, lng: -118.4085, name: 'Los Angeles' },
    NRT: { lat: 35.7647, lng: 140.3864, name: 'Tokyo Narita' },
    HKG: { lat: 22.3080, lng: 113.9185, name: 'Hong Kong' },
    SIN: { lat: 1.3644, lng: 103.9915, name: 'Singapore' },
    BKK: { lat: 13.6900, lng: 100.7501, name: 'Bangkok' },
    ICN: { lat: 37.4602, lng: 126.4407, name: 'Seoul Incheon' }
};

const ZONES = ['Warehouse_A1', 'Warehouse_A2', 'Warehouse_B1', 'Ramp_North', 'Ramp_South', 'Customs', 'Maintenance'];

let uldsData = [];
let isRunning = true;

// Fetch ULDs from server
async function fetchULDs() {
    try {
        const response = await axios.get(`${API_URL}/ulds`);
        uldsData = response.data.data;
        console.log(`📦 Loaded ${uldsData.length} ULDs from server`);
    } catch (error) {
        console.error('❌ Error fetching ULDs:', error.message);
    }
}

// Simulate ULD movement
function simulateMovement(uld) {
    const airport = AIRPORTS[uld.airport];

    // Random movement within airport vicinity
    const latVariation = (Math.random() - 0.5) * 0.05; // ~5km radius
    const lngVariation = (Math.random() - 0.5) * 0.05;

    uld.location.lat = airport.lat + latVariation;
    uld.location.lng = airport.lng + lngVariation;

    // Randomly change zone
    if (Math.random() < 0.1) { // 10% chance
        const randomZone = ZONES[Math.floor(Math.random() * ZONES.length)];
        uld.location.zone = `${uld.airport}_${randomZone}`;
    }

    // Change status occasionally
    if (Math.random() < 0.05) { // 5% chance
        const statuses = ['available', 'in-use', 'in-transit', 'maintenance'];
        if (uld.status !== 'lost') {
            uld.status = statuses[Math.floor(Math.random() * statuses.length)];
        }
    }
}

// Simulate sensor readings
function simulateSensors(uld) {
    // Temperature (slowly varying)
    uld.sensors.temperature += (Math.random() - 0.5) * 2;
    uld.sensors.temperature = Math.max(10, Math.min(40, uld.sensors.temperature));

    // Humidity (slowly varying)
    uld.sensors.humidity += (Math.random() - 0.5) * 5;
    uld.sensors.humidity = Math.max(30, Math.min(90, uld.sensors.humidity));

    // Shock level (mostly low, occasional spikes)
    if (Math.random() < 0.05) { // 5% chance of impact
        uld.sensors.shockLevel = 3 + Math.random() * 4;
    } else {
        uld.sensors.shockLevel = Math.random() * 0.5;
    }

    // Battery (slowly draining)
    if (uld.status === 'in-use' || uld.status === 'in-transit') {
        uld.sensors.battery -= 0.1 + Math.random() * 0.2;
    } else {
        uld.sensors.battery -= 0.01 + Math.random() * 0.02; // Slower drain when idle
    }

    // Charging when in warehouse
    if (uld.location.zone.includes('Warehouse') && uld.sensors.battery < 80) {
        uld.sensors.battery += 0.5 + Math.random() * 1; // Wireless charging
    }

    uld.sensors.battery = Math.max(0, Math.min(100, uld.sensors.battery));
}

// Update ULD on server
async function updateULD(uld) {
    try {
        await axios.post(`${API_URL}/ulds/${uld.id}/location`, {
            location: uld.location,
            sensors: uld.sensors,
            status: uld.status
        });
    } catch (error) {
        // Silently fail - server might not be ready
    }
}

// Simulate all ULDs
async function simulateAll() {
    const updatePromises = uldsData.map(async (uld) => {
        // 80% of ULDs are active and updating
        if (Math.random() < 0.8) {
            simulateMovement(uld);
            simulateSensors(uld);
            await updateULD(uld);
        }
    });

    await Promise.all(updatePromises);
}

// Main simulation loop
async function startSimulation() {
    console.log('🚀 IoT Simulator starting...');
    console.log('📡 Connecting to API server at', API_URL);

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fetch initial ULD data
    await fetchULDs();

    if (uldsData.length === 0) {
        console.log('⚠️  No ULDs found. Make sure the server is running.');
        return;
    }

    console.log('✅ Simulation started');
    console.log('📊 Updating ULD data every 5 seconds');
    console.log('Press Ctrl+C to stop\n');

    let updateCount = 0;

    // Update every 5 seconds
    const interval = setInterval(async () => {
        if (!isRunning) {
            clearInterval(interval);
            return;
        }

        updateCount++;
        console.log(`🔄 Update #${updateCount} - Simulating ${uldsData.length} ULDs...`);
        await simulateAll();

        // Show some stats
        const available = uldsData.filter(u => u.status === 'available').length;
        const inUse = uldsData.filter(u => u.status === 'in-use').length;
        const lowBattery = uldsData.filter(u => u.sensors.battery < 20).length;

        console.log(`   Status: ${available} available, ${inUse} in-use | Low battery: ${lowBattery}`);
    }, 5000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n👋 Stopping simulator...');
        isRunning = false;
        clearInterval(interval);
        process.exit(0);
    });
}

// Start the simulator
startSimulation();
