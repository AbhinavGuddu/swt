import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import './Analytics.css';

function Analytics() {
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {
        try {
            const response = await axios.get('/api/predictions');
            setPredictions(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching predictions:', error);
            setLoading(false);
        }
    };

    if (loading || !predictions) {
        return (
            <div className="analytics-loading">
                <div className="spinner"></div>
                <p>Loading AI insights...</p>
            </div>
        );
    }

    return (
        <div className="analytics">
            <div className="analytics-header">
                <div className="header-title">
                    <Brain size={32} className="header-icon" />
                    <div>
                        <h2>AI Analytics & Predictions</h2>
                        <p className="subtitle">Powered by machine learning and predictive algorithms</p>
                    </div>
                </div>
            </div>

            {/* Demand Forecast */}
            <div className="section">
                <div className="section-header">
                    <TrendingUp size={24} />
                    <h3>7-Day Demand Forecast</h3>
                </div>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={predictions.demandForecast}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '0.5rem',
                                    color: '#f1f5f9'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="TPE-LAX" stroke="#3b82f6" strokeWidth={2} />
                            <Line type="monotone" dataKey="TPE-NRT" stroke="#8b5cf6" strokeWidth={2} />
                            <Line type="monotone" dataKey="TPE-SIN" stroke="#10b981" strokeWidth={2} />
                            <Line type="monotone" dataKey="LAX-TPE" stroke="#f59e0b" strokeWidth={2} />
                            <Line type="monotone" dataKey="NRT-TPE" stroke="#ef4444" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="chart-description">
                    Predicted ULD requirements per route based on historical patterns and seasonal trends
                </p>
            </div>

            {/* Shortage Warnings */}
            {predictions.shortageWarnings.length > 0 && (
                <div className="section">
                    <div className="section-header">
                        <AlertCircle size={24} />
                        <h3>Predicted Shortages</h3>
                    </div>
                    <div className="warnings-grid">
                        {predictions.shortageWarnings.map((warning, index) => (
                            <div key={index} className="warning-card">
                                <div className="warning-icon">
                                    <AlertCircle size={24} />
                                </div>
                                <div className="warning-content">
                                    <h4>{warning.airport}</h4>
                                    <p className="warning-shortage">
                                        Shortage of <strong>{warning.predictedShortage} ULDs</strong>
                                    </p>
                                    <p className="warning-time">Within {warning.timeframe}</p>
                                    <div className="warning-confidence">
                                        <span className="confidence-label">Confidence:</span>
                                        <span className="confidence-value">{warning.confidence}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Optimization Suggestions */}
            <div className="section">
                <div className="section-header">
                    <Lightbulb size={24} />
                    <h3>AI Recommendations</h3>
                </div>
                <div className="suggestions-list">
                    {predictions.optimizationSuggestions.map((suggestion, index) => (
                        <div key={index} className={`suggestion-card priority-${suggestion.priority}`}>
                            <div className="suggestion-header">
                                <span className={`priority-badge ${suggestion.priority}`}>
                                    {suggestion.priority} priority
                                </span>
                                <span className="suggestion-type">{suggestion.type}</span>
                            </div>
                            <p className="suggestion-text">{suggestion.suggestion}</p>
                            <div className="suggestion-impact">
                                <span className="impact-label">Expected Impact:</span>
                                <span className="impact-value">{suggestion.estimatedImpact}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insights Summary */}
            <div className="insights-summary">
                <div className="insight-card">
                    <Brain size={32} />
                    <div>
                        <h4>Predictive Accuracy</h4>
                        <p className="insight-value">94.2%</p>
                        <p className="insight-desc">Based on last 30 days</p>
                    </div>
                </div>
                <div className="insight-card">
                    <TrendingUp size={32} />
                    <div>
                        <h4>Efficiency Gain</h4>
                        <p className="insight-value">+28%</p>
                        <p className="insight-desc">Since AI implementation</p>
                    </div>
                </div>
                <div className="insight-card">
                    <Lightbulb size={32} />
                    <div>
                        <h4>Cost Savings</h4>
                        <p className="insight-value">$125K</p>
                        <p className="insight-desc">Monthly average</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
