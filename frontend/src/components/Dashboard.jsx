import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Activity, Clock, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [ulds, setUlds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [analyticsRes, uldsRes] = await Promise.all([
                axios.get('/api/analytics/dashboard'),
                axios.get('/api/ulds')
            ]);

            setAnalytics(analyticsRes.data.data);
            setUlds(uldsRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading || !analytics) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    // Group ULDs by airport
    const uldsByAirport = ulds.reduce((acc, uld) => {
        acc[uld.airport] = (acc[uld.airport] || 0) + 1;
        return acc;
    }, {});

    // Low battery ULDs
    const lowBatteryULDs = ulds.filter(u => u.sensors.battery < 20);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Dashboard Overview</h2>
                <p className="subtitle">Real-time ULD management metrics</p>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
                <div className="metric-card primary">
                    <div className="metric-icon">
                        <Package size={32} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Total ULDs</span>
                        <span className="metric-value">{analytics.totalULDs}</span>
                    </div>
                </div>

                <div className="metric-card success">
                    <div className="metric-icon">
                        <CheckCircle2 size={32} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Available</span>
                        <span className="metric-value">{analytics.available}</span>
                        <span className="metric-change">
                            {((analytics.available / analytics.totalULDs) * 100).toFixed(0)}% of fleet
                        </span>
                    </div>
                </div>

                <div className="metric-card info">
                    <div className="metric-icon">
                        <Activity size={32} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">In Use</span>
                        <span className="metric-value">{analytics.inUse}</span>
                        <span className="metric-change">
                            {analytics.utilizationRate}% utilization
                        </span>
                    </div>
                </div>

                <div className="metric-card warning">
                    <div className="metric-icon">
                        <AlertTriangle size={32} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Maintenance</span>
                        <span className="metric-value">{analytics.maintenance}</span>
                    </div>
                </div>

                <div className="metric-card time">
                    <div className="metric-icon">
                        <Clock size={32} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Avg Turnaround</span>
                        <span className="metric-value">{analytics.avgTurnaroundTime}h</span>
                        <span className="metric-change success">
                            <TrendingUp size={14} /> 12% faster
                        </span>
                    </div>
                </div>

                <div className="metric-card accuracy">
                    <div className="metric-icon">
                        <CheckCircle2 size={32} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Record Accuracy</span>
                        <span className="metric-value">{analytics.recordAccuracy}%</span>
                        <span className="metric-change">帳實相符度</span>
                    </div>
                </div>
            </div>

            {/* Distribution by Airport */}
            <div className="section">
                <h3>ULD Distribution by Airport</h3>
                <div className="airport-grid">
                    {Object.entries(uldsByAirport)
                        .sort((a, b) => b[1] - a[1])
                        .map(([airport, count]) => (
                            <div key={airport} className="airport-card">
                                <div className="airport-header">
                                    <span className="airport-code">{airport}</span>
                                    <span className="airport-count">{count}</span>
                                </div>
                                <div className="airport-bar">
                                    <div
                                        className="airport-bar-fill"
                                        style={{ width: `${(count / analytics.totalULDs) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Low Battery Alerts */}
            {lowBatteryULDs.length > 0 && (
                <div className="section">
                    <h3>⚠️ Low Battery Alerts ({lowBatteryULDs.length})</h3>
                    <div className="alerts-list">
                        {lowBatteryULDs.slice(0, 5).map(uld => (
                            <div key={uld.id} className="alert-item">
                                <div className="alert-info">
                                    <span className="alert-title">{uld.id}</span>
                                    <span className="alert-subtitle">{uld.location.zone}</span>
                                </div>
                                <div className="alert-battery">
                                    <span className="battery-level danger">{uld.sensors.battery.toFixed(0)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="section">
                <h3>Recent ULD Activity</h3>
                <div className="activity-list">
                    {ulds
                        .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate))
                        .slice(0, 8)
                        .map(uld => (
                            <div key={uld.id} className="activity-item">
                                <div className="activity-icon">
                                    <Package size={20} />
                                </div>
                                <div className="activity-content">
                                    <span className="activity-title">{uld.id}</span>
                                    <span className="activity-subtitle">
                                        {uld.location.zone} • {uld.status}
                                    </span>
                                </div>
                                <div className="activity-time">
                                    {new Date(uld.lastUpdate).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
