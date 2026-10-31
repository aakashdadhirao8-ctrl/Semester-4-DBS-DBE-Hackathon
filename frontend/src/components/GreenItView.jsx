import React, { useState, useEffect } from 'react';
import { Zap, Leaf, DollarSign, Award, CheckCircle, Flame, Search, X } from 'lucide-react';
import { api } from '../services/api';

export default function GreenItView({ currency, forexRates }) {
  const [summary, setSummary] = useState(null);
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumData, assetData] = await Promise.all([
        api.getDashboardSummary(),
        api.getAllAssets(),
      ]);
      setSummary(sumData);
      setAssets(assetData);
    } catch (err) {
      console.error('Failed to load Green IT metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const rate = forexRates[currency] || 1.0;
  const symbol = currency === 'INR' ? '₹' : (currency === 'EUR' ? '€' : '$');

  const fmt = (val) => {
    if (val === undefined || val === null) return `${symbol}0`;
    const converted = Number(val) * rate;
    return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading Green IT & ESG Metrics...</div>;
  }

  const greenStats = summary?.greenItStats;

  const filteredAssets = assets.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.assetTag?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* 4 Headline Sustainability Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Active Power Rating</span>
            <Zap size={18} color="var(--accent-emerald)" />
          </div>
          <div className="kpi-value">{greenStats?.totalWatts || 0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Watts</span></div>
          <div className="kpi-footer">Cumulative hardware draw</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Monthly Energy Draw</span>
            <Leaf size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value">{greenStats?.monthlyKwh} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kWh</span></div>
          <div className="kpi-footer">Based on 9h/day × 22 work days</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Monthly Power Bill</span>
            <DollarSign size={18} color="var(--accent-amber)" />
          </div>
          <div className="kpi-value" style={{ color: '#fbbf24' }}>
            {fmt(summary?.monthlyBurn?.monthlyElectricityBill)}
          </div>
          <div className="kpi-footer">Utility power expenditure</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Monthly Carbon Footprint</span>
            <Flame size={18} color="var(--accent-purple)" />
          </div>
          <div className="kpi-value">{(greenStats?.monthlyCo2Kg !== undefined && greenStats?.monthlyCo2Kg !== null) ? greenStats.monthlyCo2Kg : 0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg CO₂</span></div>
          <div className="kpi-footer">
            ESG Efficiency: <span className="badge badge-success">{greenStats?.greenGrade || 'A+ (Clean Baseline)'}</span>
          </div>
        </div>
      </div>

      {/* Hardware Energy Consumption Telemetry */}
      <div className="card-panel" style={{ marginTop: '1.5rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="card-title">
            <Zap size={18} color="var(--accent-emerald)" />
            Hardware Telemetry & Energy Draw
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search hardware, tags, power..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px', paddingRight: '28px', height: '34px', fontSize: '0.8rem' }}
              />
              {searchQuery && (
                <X 
                  size={14} 
                  color="var(--text-muted)" 
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                  onClick={() => setSearchQuery('')}
                />
              )}
            </div>
            <span className="badge badge-info">{filteredAssets.length} Active Monitored Assets</span>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Category</th>
                <th>Power Draw</th>
                <th>Est. Monthly kWh</th>
                <th>Monthly Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    {assets.length === 0 
                      ? 'No hardware assets monitored. Import CSV data to track power consumption and carbon emissions.'
                      : `No hardware found matching "${searchQuery}". Clear search to view all assets.`
                    }
                  </td>
                </tr>
              ) : (
                filteredAssets.map((a) => {
                  const monthlyKwh = ((a.powerWatts || 65) * 9 * 22) / 1000;
                  const cost = monthlyKwh * 0.14;
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{a.assetTag}</div>
                      </td>
                      <td>
                        <span className="badge badge-info">{a.category}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: (a.powerWatts || 65) > 500 ? '#fb7185' : '#34d399' }}>
                        {a.powerWatts || 65} W
                      </td>
                      <td>{monthlyKwh.toFixed(1)} kWh</td>
                      <td style={{ fontWeight: 600 }}>{fmt(cost)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
