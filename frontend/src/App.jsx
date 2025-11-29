import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import AlertPanel from './components/AlertPanel';
import { BarChart3, Map, Bell, TrendingUp, Plane } from 'lucide-react';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
    const [activeView, setActiveView] = useState('map');
    const [alertCount, setAlertCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
            console.log('✅ Connected to server');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('❌ Disconnected from server');
        });

        socket.on('new-alert', (alert) => {
            setAlertCount(prev => prev + 1);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('new-alert');
        };
    }, []);

    return (
        <BrowserRouter>
            <div className="app">
                {/* Header */}
                <header className="header">
                    <div className="header-content">
                        <div className="logo">
                            <Plane size={32} className="logo-icon" />
                            <div>
                                <h1>China Airlines</h1>
                                <p>Smart ULD Management</p>
                            </div>
                        </div>

                        <div className="header-status">
                            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                                <span className="status-dot"></span>
                                {isConnected ? 'Live' : 'Offline'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="main-container">
                    {/* Sidebar */}
                    <aside className="sidebar">
                        <nav className="nav">
                            <button
                                className={`nav-item ${activeView === 'map' ? 'active' : ''}`}
                                onClick={() => setActiveView('map')}
                            >
                                <Map size={20} />
                                <span>Live Map</span>
                            </button>

                            <button
                                className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                                onClick={() => setActiveView('dashboard')}
                            >
                                <BarChart3 size={20} />
                                <span>Dashboard</span>
                            </button>

                            <button
                                className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
                                onClick={() => setActiveView('analytics')}
                            >
                                <TrendingUp size={20} />
                                <span>Analytics</span>
                            </button>

                            <button
                                className={`nav-item ${activeView === 'alerts' ? 'active' : ''}`}
                                onClick={() => setActiveView('alerts')}
                            >
                                <Bell size={20} />
                                <span>Alerts</span>
                                {alertCount > 0 && <span className="badge">{alertCount}</span>}
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="content">
                        {activeView === 'map' && <MapView socket={socket} />}
                        {activeView === 'dashboard' && <Dashboard />}
                        {activeView === 'analytics' && <Analytics />}
                        {activeView === 'alerts' && <AlertPanel onClearCount={() => setAlertCount(0)} />}
                    </main>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
