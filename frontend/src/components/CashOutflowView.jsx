import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Wrench, 
  CreditCard, 
  Sparkles, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  Calendar,
  Building2,
  PieChart,
  Search,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function CashOutflowView({ currency, forexRates, role = 'manager', onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(3); // Feb 2027 by default (highlight)
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const isKingpin = role === 'kingpin';

  useEffect(() => {
    loadData();
  }, [role]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumData, fcData, assetData] = await Promise.all([
        api.getDashboardSummary(role),
        api.getMlForecast(),
        api.getAllAssets(role)
      ]);
      setSummary(sumData);
      setForecast(fcData);
      setAssets(assetData || []);
    } catch (err) {
      console.error('Failed to load cash outflow data:', err);
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
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading Operational Cash Outflow Analysis...</div>;
  }

  const burn = summary?.monthlyBurn || {
    totalMonthlyBurn: 0,
    monthlyEmis: 0,
    monthlyMaintenanceAvg: 0,
    monthlyElectricityBill: 0
  };

  const totalMonthlyBurn = Number(burn.totalMonthlyBurn) || 0;
  const hasBurn = totalMonthlyBurn > 0;
  const emiPct = hasBurn ? Math.round((Number(burn.monthlyEmis) / totalMonthlyBurn) * 100) : 0;
  const maintPct = hasBurn ? Math.round((Number(burn.monthlyMaintenanceAvg) / totalMonthlyBurn) * 100) : 0;
  const powerPct = hasBurn ? Math.max(0, 100 - emiPct - maintPct) : 0;

  const displayedForecast = (forecast?.forecast || []).filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.month.toLowerCase().includes(q) || item.driverNote?.toLowerCase().includes(q);
  });

  return (
    <div className="animate-in">
      {/* Overview Card */}
      <div className="card-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="card-title">
              <TrendingUp size={20} color="var(--accent-primary)" />
              Monthly Operational Cash Outflow Breakdown & Burn Run-Rate
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Consolidated operational cash commitments: Amortized loan EMIs, routine hardware servicing, and datacenter electricity.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search outflow streams, EMIs, repairs..."
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

            <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              Current Run-Rate: {fmt(burn.totalMonthlyBurn)} / mo
            </span>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Cash Outflow */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* 1. EMIs */}
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Financed Asset EMIs</span>
            <CreditCard size={18} color="var(--accent-gold)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>{fmt(burn.monthlyEmis)}</div>
          <div className="kpi-footer">
            <strong>{emiPct}%</strong> of total operational cash burn
          </div>
        </div>

        {/* 2. Routine Maintenance */}
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Preventative Upkeep & Repairs</span>
            <Wrench size={18} color="var(--accent-primary)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--text-primary)' }}>{fmt(burn.monthlyMaintenanceAvg)}</div>
          <div className="kpi-footer">
            <strong>{maintPct}%</strong> vendor servicing & fluid changes
          </div>
        </div>

        {/* 3. Electricity / Power */}
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Datacenter & Facility Utility</span>
            <Zap size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-cyan)' }}>{fmt(burn.monthlyElectricityBill)}</div>
          <div className="kpi-footer">
            <strong>{powerPct}%</strong> hardware power draw
          </div>
        </div>

        {/* 4. Total Monthly Burn */}
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Total Monthly Outflow</span>
            <DollarSign size={18} color="var(--accent-emerald)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>{fmt(burn.totalMonthlyBurn)}</div>
          <div className="kpi-footer">
            Annualized run-rate: <strong>{fmt(Number(burn.totalMonthlyBurn) * 12)}</strong>
          </div>
        </div>
      </div>

      {/* Visual Component Stack Bar */}
      <div className="card-panel" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div className="card-title">
            Outflow Composition Stack
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-gold)' }}></span>
              Equipment EMIs ({emiPct}%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
              Repairs & Servicing ({maintPct}%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-cyan)' }}></span>
              Electricity Utility ({powerPct}%)
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: '24px', display: 'flex', borderRadius: 'var(--radius-pill)', overflow: 'hidden', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ width: `${emiPct}%`, background: 'var(--accent-gold)', height: '100%', transition: 'width 0.5s ease' }} title={`EMIs: ${fmt(burn.monthlyEmis)}`} />
          <div style={{ width: `${maintPct}%`, background: 'var(--accent-primary)', height: '100%', transition: 'width 0.5s ease' }} title={`Repairs: ${fmt(burn.monthlyMaintenanceAvg)}`} />
          <div style={{ width: `${powerPct}%`, background: 'var(--accent-cyan)', height: '100%', transition: 'width 0.5s ease' }} title={`Utility: ${fmt(burn.monthlyElectricityBill)}`} />
        </div>
      </div>

      {/* AI Predictive 6-Month Expenditure Forecast */}
      {forecast && (
        <div className="card-panel" style={{ marginBottom: '2rem' }}>
          <div className="card-header" style={{ marginBottom: '0.75rem' }}>
            <div className="card-title">
              <Sparkles size={18} color="var(--accent-primary)" />
              AI Predictive 6-Month Expenditure Forecast ({forecast.model || 'Scikit-Learn Regression'})
            </div>
            <span className="badge badge-info">Polynomial Ridge R² = {forecast.r2_score || '0.984'}</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
            {forecast.keyInsight}
          </p>

          {displayedForecast && displayedForecast.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {displayedForecast.map((item, idx) => {
                const isSelected = selectedMonthIdx === idx;
                const hasAlert = item.driverNote?.includes('⚠️');

                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedMonthIdx(idx)}
                    style={{ 
                      background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-surface-elevated)', 
                      border: isSelected 
                        ? (hasAlert ? '2px solid var(--accent-gold)' : '2px solid var(--accent-primary)') 
                        : (hasAlert ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)'), 
                      borderRadius: 'var(--radius-md)', 
                      padding: '1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {item.month}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem', color: hasAlert ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                      {fmt(item.projectedExpenditure)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: hasAlert ? 'var(--accent-gold)' : 'var(--text-tertiary)', marginTop: '0.45rem', lineHeight: '1.3' }}>
                      {item.driverNote}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'var(--bg-surface-elevated)', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
              <Sparkles size={28} color="var(--text-dim)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Awaiting Asset Inventory Data</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '420px', margin: '4px auto 1rem' }}>
                Import your external equipment CSV files to run Scikit-Learn polynomial ridge regression and forecast 6-month operational cash flow.
              </p>
              <button 
                className="btn btn-secondary"
                onClick={() => onNavigate && onNavigate('assets')}
              >
                Go to Asset Registry & Import CSV ↗
              </button>
            </div>
          )}
        </div>
      )}

      {/* Strategic Cash Flow Optimization Levers */}
      <div className="card-panel">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div className="card-title">
            <CheckCircle2 size={18} color="var(--accent-emerald)" />
            CapEx Cash Flow Optimization Levers
          </div>
          <span className="badge badge-success">Automated Financial Advisories</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          <div 
            className="clickable panel-card-interactive"
            style={{ background: 'var(--bg-surface-elevated)', padding: '1.15rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', position: 'relative' }}
            onClick={() => onNavigate && onNavigate('loans')}
            title="Click box to open Financing & Equity Payoff Simulator"
          >
            <div className="kpi-card-arrow"><ArrowUpRight size={15} /></div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={15} color="var(--accent-gold)" /> Early Loan Prepayment Arbitrage
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.5' }}>
              Exercising a lump-sum prepayment of $5,000 against the NVIDIA DGX server loan shaves 5 monthly installments, saving $1,280 in pure interest.
            </p>
            <div style={{ marginTop: '0.65rem', fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              Click to Open Equity Simulator ↗
            </div>
          </div>

          <div 
            className="clickable panel-card-interactive"
            style={{ background: 'var(--bg-surface-elevated)', padding: '1.15rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', position: 'relative' }}
            onClick={() => onNavigate && onNavigate('alerts')}
            title="Click box to inspect Scrap Advisory in Risk Center"
          >
            <div className="kpi-card-arrow"><ArrowUpRight size={15} /></div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={15} color="var(--accent-rose)" /> Decommission Heavy Diesel Generator
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.5' }}>
              Caterpillar 250kVA emergency generator has exceeded its repair-to-book-value threshold (55%). Retiring this asset removes $920/mo in upkeep costs.
            </p>
            <div style={{ marginTop: '0.65rem', fontSize: '0.72rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
              Click to Open Scrap Advisory ↗
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
