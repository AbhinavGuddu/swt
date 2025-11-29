import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { MapPin, Battery, Thermometer, Navigation } from 'lucide-react';
import './MapView.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom markers by status
const getMarkerIcon = (status, battery) => {
    let color = '#10b981'; // green - available
    if (status === 'in-use') color = '#3b82f6'; // blue
    else if (status === 'in-transit') color = '#f59e0b'; // orange
    else if (status === 'maintenance') color = '#6b7280'; // gray
    else if (status === 'lost') color = '#ef4444'; // red
    else if (battery < 20) color = '#dc2626'; // red for low battery

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

function MapView({ socket }) {
    const [ulds, setUlds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({ total: 0, available: 0, inUse: 0, issues: 0 });

    useEffect(() => {
        fetchULDs();

        // Listen for real-time updates
        socket.on('uld-update', (updatedUld) => {
            setUlds(prev => {
                const index = prev.findIndex(u => u.id === updatedUld.id);
                if (index >= 0) {
                    const newUlds = [...prev];
                    newUlds[index] = updatedUld;
                    return newUlds;
                }
                return prev;
            });
        });

        return () => {
            socket.off('uld-update');
        };
    }, [socket]);

    useEffect(() => {
        // Update stats
        const available = ulds.filter(u => u.status === 'available').length;
        const inUse = ulds.filter(u => u.status === 'in-use' || u.status === 'in-transit').length;
        const issues = ulds.filter(u => u.status === 'lost' || u.status === 'maintenance' || u.sensors.battery < 20).length;

        setStats({
            total: ulds.length,
            available,
            inUse,
            issues
        });
    }, [ulds]);

    const fetchULDs = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/ulds');
            setUlds(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching ULDs:', error);
            setLoading(false);
        }
    };

    const filteredULDs = ulds.filter(uld => {
        if (filter === 'all') return true;
        if (filter === 'available') return uld.status === 'available';
        if (filter === 'in-use') return uld.status === 'in-use' || uld.status === 'in-transit';
        if (filter === 'issues') return uld.status === 'lost' || uld.status === 'maintenance' || uld.sensors.battery < 20;
        return true;
    });

    if (loading) {
        return (
            <div className="map-loading">
                <div className="spinner"></div>
                <p>Loading ULD locations...</p>
            </div>
        );
    }

    return (
        <div className="map-view">
            <div className="map-header">
                <h2>Live ULD Tracking</h2>
                <div className="map-stats">
                    <div className="stat-card">
                        <span className="stat-label">Total</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                    <div className="stat-card success">
                        <span className="stat-label">Available</span>
                        <span className="stat-value">{stats.available}</span>
                    </div>
                    <div className="stat-card info">
                        <span className="stat-label">In Use</span>
                        <span className="stat-value">{stats.inUse}</span>
                    </div>
                    <div className="stat-card warning">
                        <span className="stat-label">Issues</span>
                        <span className="stat-value">{stats.issues}</span>
                    </div>
                </div>
                <div className="map-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
                        onClick={() => setFilter('available')}
                    >
                        Available
                    </button>
                    <button
                        className={`filter-btn ${filter === 'in-use' ? 'active' : ''}`}
                        onClick={() => setFilter('in-use')}
                    >
                        In Use
                    </button>
                    <button
                        className={`filter-btn ${filter === 'issues' ? 'active' : ''}`}
                        onClick={() => setFilter('issues')}
                    >
                        Issues
                    </button>
                </div>
            </div>

            <div className="map-container-wrapper">
                <MapContainer
                    center={[25.0797, 121.2342]}
                    zoom={3}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {filteredULDs.map(uld => (
                        <Marker
                            key={uld.id}
                            position={[uld.location.lat, uld.location.lng]}
                            icon={getMarkerIcon(uld.status, uld.sensors.battery)}
                        >
                            <Popup className="uld-popup">
                                <div className="popup-content">
                                    <h3>{uld.id}</h3>
                                    <div className="popup-info">
                                        <div className="info-row">
                                            <MapPin size={16} />
                                            <span>{uld.location.zone}</span>
                                        </div>
                                        <div className="info-row">
                                            <Navigation size={16} />
                                            <span className={`status-badge status-${uld.status}`}>
                                                {uld.status}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <Battery size={16} />
                                            <span className={uld.sensors.battery < 20 ? 'text-danger' : ''}>
                                                {uld.sensors.battery.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <Thermometer size={16} />
                                            <span>{uld.sensors.temperature.toFixed(1)}°C</span>
                                        </div>
                                    </div>
                                    <div className="popup-footer">
                                        <small>Updated: {new Date(uld.lastUpdate).toLocaleTimeString()}</small>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

export default MapView;
