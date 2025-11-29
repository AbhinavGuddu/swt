import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import './AlertPanel.css';

function AlertPanel({ onClearCount }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAlerts();
        onClearCount();
    }, []);

    const fetchAlerts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/alerts');
            setAlerts(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            setLoading(false);
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'critical':
                return <AlertCircle size={24} />;
            case 'warning':
                return <AlertTriangle size={24} />;
            case 'info':
                return <Info size={24} />;
            default:
                return <Bell size={24} />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'critical';
            case 'medium':
                return 'warning';
            case 'low':
                return 'info';
            default:
                return 'info';
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'all') return true;
        return getSeverityColor(alert.severity) === filter;
    });

    const alertStats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'high').length,
        warning: alerts.filter(a => a.severity === 'medium').length,
        info: alerts.filter(a => a.severity === 'low').length
    };

    if (loading) {
        return (
            <div className="alert-loading">
                <div className="spinner"></div>
                <p>Loading alerts...</p>
            </div>
        );
    }

    return (
        <div className="alert-panel">
            <div className="alert-header">
                <div className="header-title">
                    <Bell size={32} />
                    <div>
                        <h2>Alert Center</h2>
                        <p className="subtitle">Real-time notifications and warnings</p>
                    </div>
                </div>
            </div>

            {/* Alert Stats */}
            <div className="alert-stats">
                <div className="stat-item">
                    <span className="stat-label">Total Alerts</span>
                    <span className="stat-value">{alertStats.total}</span>
                </div>
                <div className="stat-item critical">
                    <span className="stat-label">Critical</span>
                    <span className="stat-value">{alertStats.critical}</span>
                </div>
                <div className="stat-item warning">
                    <span className="stat-label">Warnings</span>
                    <span className="stat-value">{alertStats.warning}</span>
                </div>
                <div className="stat-item info">
                    <span className="stat-label">Info</span>
                    <span className="stat-value">{alertStats.info}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="alert-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({alertStats.total})
                </button>
                <button
                    className={`filter-btn ${filter === 'critical' ? 'active' : ''}`}
                    onClick={() => setFilter('critical')}
                >
                    Critical ({alertStats.critical})
                </button>
                <button
                    className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
                    onClick={() => setFilter('warning')}
                >
                    Warnings ({alertStats.warning})
                </button>
                <button
                    className={`filter-btn ${filter === 'info' ? 'active' : ''}`}
                    onClick={() => setFilter('info')}
                >
                    Info ({alertStats.info})
                </button>
            </div>

            {/* Alerts List */}
            <div className="alerts-container">
                {filteredAlerts.length === 0 ? (
                    <div className="no-alerts">
                        <CheckCircle2 size={64} />
                        <h3>All Clear!</h3>
                        <p>No alerts to show in this category</p>
                    </div>
                ) : (
                    <div className="alerts-list">
                        {filteredAlerts.map(alert => (
                            <div key={alert.id} className={`alert-card ${getSeverityColor(alert.severity)}`}>
                                <div className="alert-icon">
                                    {getAlertIcon(alert.type)}
                                </div>
                                <div className="alert-content">
                                    <h4 className="alert-title">{alert.title}</h4>
                                    <p className="alert-message">{alert.message}</p>
                                    <div className="alert-meta">
                                        <span className="alert-time">
                                            {new Date(alert.timestamp).toLocaleString()}
                                        </span>
                                        {alert.uldId && (
                                            <span className="alert-uld">ULD: {alert.uldId}</span>
                                        )}
                                    </div>
                                </div>
                                <div className={`alert-severity ${getSeverityColor(alert.severity)}`}>
                                    {alert.severity}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Alert Legend */}
            <div className="alert-legend">
                <h4>Alert Types</h4>
                <div className="legend-grid">
                    <div className="legend-item">
                        <div className="legend-icon critical">
                            <AlertCircle size={16} />
                        </div>
                        <div>
                            <strong>Critical</strong>
                            <p>Requires immediate attention (lost ULD, equipment failure)</p>
                        </div>
                    </div>
                    <div className="legend-item">
                        <div className="legend-icon warning">
                            <AlertTriangle size={16} />
                        </div>
                        <div>
                            <strong>Warning</strong>
                            <p>Needs attention soon (low battery, record mismatch)</p>
                        </div>
                    </div>
                    <div className="legend-item">
                        <div className="legend-icon info">
                            <Info size={16} />
                        </div>
                        <div>
                            <strong>Info</strong>
                            <p>FYI notifications (predicted shortage, recommendations)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AlertPanel;
