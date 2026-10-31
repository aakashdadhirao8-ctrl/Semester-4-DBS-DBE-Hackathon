import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  DollarSign, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Shield,
  Crown,
  Percent,
  Receipt,
  Wrench,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { api } from '../services/api';

export default function ExecutiveDashboard({ currency, forexRates, onNavigate, role = 'manager' }) {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    const unsubscribe = api.subscribe(() => {
      loadDashboard();
    });
    return () => unsubscribe();
  }, [role]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [sumData, catData, fcData] = await Promise.all([
        api.getDashboardSummary(role),
        api.getCategoryDistribution(role),
        api.getMlForecast(),
      ]);
      setSummary(sumData);
      setCategories(catData);
      setForecast(fcData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading Enterprise Intelligence & CapEx metrics...
      </div>
    );
  }

  const isKingpin = role === 'kingpin';

  return (
    <div className="animate-in">
      {/* Role Banner if Kingpin is Active */}
      {isKingpin ? (
        <div style={{ 
          background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.04) 100%)', 
          border: '1px solid rgba(245, 158, 11, 0.3)', 
          borderRadius: 'var(--radius-md)', 
          padding: '0.85rem 1.25rem', 
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Crown size={20} color="#F59E0B" />
            <div>
              <span style={{ fontWeight: 800, color: '#F59E0B', fontSize: '0.85rem' }}>KINGPIN SOVEREIGN ACCESS UNLOCKED</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Displaying consolidated corporate infrastructure plus personal estates (Obsidian Penthouse, Gulfstream G280, Rolls-Royce) & Section 179 personal tax write-offs.
              </p>
            </div>
          </div>
          <span className="kingpin-gold-badge">Private Wealth Mode</span>
        </div>
      ) : (
        <div style={{ 
          background: 'var(--bg-surface-elevated)', 
          border: '1px solid var(--border-medium)', 
          borderRadius: 'var(--radius-md)', 
          padding: '0.75rem 1.15rem', 
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Shield size={18} color="var(--accent-primary)" />
            <div>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.825rem' }}>QUARTERMASTER CONSOLE (OPERATIONS & CUSTODY)</span>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                Managing corporate hardware pool, employee custody handovers, maintenance ticketing, and department quotas.
              </p>
            </div>
          </div>
          <span className="badge badge-info">Ops Custodian</span>
        </div>
      )}

      {/* ============================================================
          KPI METRIC CARDS (Different for Kingpin vs Quartermaster)
          ============================================================ */}
      <div className="kpi-grid">
        {/* 1. Workforce (Shared) */}
        <div 
          className="kpi-card clickable tooltip-wrapper"
          onClick={() => onNavigate && onNavigate('workforce')}
        >
          <div className="kpi-card-arrow"><ArrowUpRight size={14} /></div>
          <div className="kpi-header">
            <span className="kpi-title">Active Workforce</span>
            <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
              <Users size={16} />
            </div>
          </div>
          <div className="kpi-value">{summary?.totalHeadcount || 0}</div>
          <div className="kpi-footer">Across 5 Corporate Departments</div>

          <div className="tooltip-bubble">
            <div className="tooltip-title"><Users size={12} /> Workforce Allocation</div>
            <div className="tooltip-desc">
              Total assigned staff. Average asset cost-per-seat: <strong>{fmt(summary?.averageCostPerSeat)}/head</strong>. Click to open Workforce Quotas.
            </div>
          </div>
        </div>

        {/* 2. Asset Inventory (Shared) */}
        <div 
          className="kpi-card clickable tooltip-wrapper"
          onClick={() => onNavigate && onNavigate('assets')}
        >
          <div className="kpi-card-arrow"><ArrowUpRight size={14} /></div>
          <div className="kpi-header">
            <span className="kpi-title">{isKingpin ? 'Consolidated Assets' : 'Hardware Fleet Value'}</span>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
              <Building2 size={16} />
            </div>
          </div>
          <div className="kpi-value">{fmt(summary?.totalAssetCost)}</div>
          <div className="kpi-footer">{summary?.totalAssetCount || 0} registered assets in pool</div>

          <div className="tooltip-bubble">
            <div className="tooltip-title"><Building2 size={12} /> Asset Ledger</div>
            <div className="tooltip-desc">
              Current book value: <strong>{fmt(summary?.totalBookValue)}</strong> after depreciation. Click to view Asset Registry.
            </div>
          </div>
        </div>

        {/* KINGPIN EXCLUSIVE CARDS: DEBT, SOLVENCY, TAXES */}
        {isKingpin ? (
          <>
            {/* 3. Outstanding Debt */}
            <div 
              className="kpi-card clickable tooltip-wrapper"
              onClick={() => onNavigate && onNavigate('loans')}
            >
              <div className="kpi-card-arrow"><ArrowUpRight size={14} /></div>
              <div className="kpi-header">
                <span className="kpi-title">Outstanding Debt</span>
                <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)' }}>
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: 'var(--accent-rose)' }}>{fmt(summary?.totalDebt)}</div>
              <div className="kpi-footer">Active loans on equipment & estates</div>

              <div className="tooltip-bubble">
                <div className="tooltip-title"><DollarSign size={12} /> Debt Obligations</div>
                <div className="tooltip-desc">
                  Remaining bank liability across financed assets. Click to open Loans & Equity Engine.
                </div>
              </div>
            </div>

            {/* 4. Net Asset Equity */}
            <div 
              className="kpi-card clickable tooltip-wrapper"
              onClick={() => onNavigate && onNavigate('loans')}
            >
              <div className="kpi-card-arrow"><ArrowUpRight size={14} /></div>
              <div className="kpi-header">
                <span className="kpi-title">Net Asset Equity</span>
                <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                  <ShieldCheck size={16} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>{fmt(summary?.netAssetEquity)}</div>
              <div className="kpi-footer">
                <strong style={{ color: 'var(--accent-emerald)' }}>{summary?.overallOwnershipPct}%</strong> Overall Ownership Equity
              </div>

              <div className="tooltip-bubble">
                <div className="tooltip-title"><ShieldCheck size={12} /> Company Solvency</div>
                <div className="tooltip-desc">
                  Asset Value minus Unpaid Debt = Net Owned Capital. Click to view Amortization Engine.
                </div>
              </div>
            </div>

            {/* 5. Total Tax Write-Offs */}
            <div 
              className="kpi-card clickable tooltip-wrapper"
              onClick={() => onNavigate && onNavigate('assets')}
            >
              <div className="kpi-card-arrow"><ArrowUpRight size={14} /></div>
              <div className="kpi-header">
                <span className="kpi-title">Total Tax Write-Offs</span>
                <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                  <Receipt size={16} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>
                {fmt(summary?.totalTaxSavings)}
              </div>
              <div className="kpi-footer">Corp Shield + Jet/Estate Bonus Depr</div>

              <div className="tooltip-bubble">
                <div className="tooltip-title"><Receipt size={12} /> Depreciation Tax Shield</div>
                <div className="tooltip-desc">
                  Accelerated depreciation and property tax deductions shelter executive wealth. Click for Asset Tax Breakdown.
                </div>
              </div>
            </div>
          </>
        ) : (
          /* QUARTERMASTER OPERATIONAL CARDS */
          <>
            {/* 3. Monthly Maintenance Outflow */}
            <div 
              className="kpi-card clickable tooltip-wrapper"
              onClick={() => onNavigate && onNavigate('assets')}
            >
              <div className="kpi-card-arrow"><ArrowUpRight size={14} /></div>
              <div className="kpi-header">
                <span className="kpi-title">Routine Upkeep & Repairs</span>
                <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)' }}>
                  <Wrench size={16} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>
                {fmt(summary?.monthlyBurn?.monthlyMaintenanceAvg)}
              </div>
              <div className="kpi-footer">Monthly average repair expenditure</div>

              <div className="tooltip-bubble">
                <div className="tooltip-title"><Wrench size={12} /> Equipment Maintenance</div>
                <div className="tooltip-desc">
                  Repair servicing, hardware parts replacement, and vendor servicing. Click to view Asset Maintenance.
                </div>
              </div>
            </div>

            {/* 4. Operational Risk Alerts */}
            <div 
              className="kpi-card clickable tooltip-wrapper"
              onClick={() => onNavigate && onNavigate('alerts')}
            >
              <div className="kpi-card-arrow"><ArrowUpRight size={14} /></div>
              <div className="kpi-header">
                <span className="kpi-title">Maintenance Advisories</span>
                <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)' }}>
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: 'var(--accent-rose)' }}>3 Active</div>
              <div className="kpi-footer">1 Decommission, 1 Quota, 1 Warranty</div>

              <div className="tooltip-bubble">
                <div className="tooltip-title"><AlertTriangle size={12} /> Risk Advisories</div>
                <div className="tooltip-desc">
                  Click to inspect Caterpillar generator scrap alert, DevOps budget quota, and Dell server warranty renewal.
                </div>
              </div>
            </div>
          </>
        )}

        {/* Final Card: Green IT Energy (Shared) */}
        <div 
          className="kpi-card clickable tooltip-wrapper"
          onClick={() => onNavigate && onNavigate('sustainability')}
        >
          <div className="kpi-card-arrow"><ArrowUpRight size={14} /></div>
          <div className="kpi-header">
            <span className="kpi-title">Green IT Energy</span>
            <div className="kpi-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              <Zap size={16} />
            </div>
          </div>
          <div className="kpi-value">{summary?.greenItStats?.monthlyKwh} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kWh</span></div>
          <div className="kpi-footer">
            Rating: <span className="badge badge-success">{summary?.greenItStats?.greenGrade}</span>
          </div>

          <div className="tooltip-bubble">
            <div className="tooltip-title"><Zap size={12} /> ESG Telemetry</div>
            <div className="tooltip-desc">
              Hardware power draw and monthly carbon footprint. Click to open Green IT & ESG.
            </div>
          </div>
        </div>
      </div>

      {/* Panels Grid: Monthly Burn Outflow vs Asset Categories (Both entire boxes are clickable redirecting tiles) */}
      <div className="panel-grid">
        <div 
          className="card-panel clickable panel-card-interactive"
          onClick={() => onNavigate && onNavigate('outflow')}
          title="Click entire box to open dedicated Monthly Cash Outflow breakdown"
        >
          <div className="kpi-card-arrow"><ArrowUpRight size={16} /></div>
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} color="var(--accent-primary)" />
              Monthly Operational Cash Outflow Breakdown
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-info">Amortized Run-Rate</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Click Box to Open ↗</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isKingpin ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            {isKingpin && (
              <div 
                className="clickable panel-card-interactive"
                style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', position: 'relative', cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate('loans'); }}
                title="Click to open Financing & Equity Engine (EMIs & Debt)"
              >
                <div style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--text-muted)' }}><ArrowUpRight size={13} /></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1. Equipment & Estate EMIs ↗</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--accent-gold)' }}>
                  {fmt(summary?.monthlyBurn?.monthlyEmis)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Principal + Bank interest</div>
              </div>
            )}

            <div 
              className="clickable panel-card-interactive"
              style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', position: 'relative', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate('assets'); }}
              title="Click to open Asset Registry & Maintenance Logs"
            >
              <div style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--text-muted)' }}><ArrowUpRight size={13} /></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isKingpin ? '2. Routine Repairs ↗' : '1. Hardware Repairs & Servicing ↗'}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                {fmt(summary?.monthlyBurn?.monthlyMaintenanceAvg)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Monthly average repairs</div>
            </div>

            <div 
              className="clickable panel-card-interactive"
              style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', position: 'relative', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate('sustainability'); }}
              title="Click to open Green IT & ESG Telemetry"
            >
              <div style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--text-muted)' }}><ArrowUpRight size={13} /></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isKingpin ? '3. Electricity / Power ↗' : '2. Facility Power Utility ↗'}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                {fmt(summary?.monthlyBurn?.monthlyElectricityBill)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Hardware power consumption</div>
            </div>
          </div>

          {/* ML Cash Flow Forecast */}
          {forecast && (
            <div 
              className="clickable panel-card-interactive"
              style={{ marginTop: '1.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate('outflow'); }}
              title="Click to view full ML Cash Outflow breakdown"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  🔮 AI Predictive 6-Month Expenditure Forecast ({forecast.model})
                  <ArrowUpRight size={14} />
                </span>
                <span className="badge badge-info">R² = {forecast.r2_score || '0.98'}</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                {forecast.keyInsight}
              </p>

              {forecast.forecast && forecast.forecast.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                  {forecast.forecast.map((item, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-surface)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: item.driverNote?.includes('⚠️') ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.month}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.2rem', color: item.driverNote?.includes('⚠️') ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                        {fmt(item.projectedExpenditure)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Awaiting asset inventory data to generate polynomial regression forecast.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Asset Category Breakdown (Clickable box) */}
        <div 
          className="card-panel clickable panel-card-interactive"
          onClick={() => onNavigate && onNavigate('portfolio')}
          title="Click entire box to open dedicated Asset Portfolio Split & Allocation panel"
        >
          <div className="kpi-card-arrow"><ArrowUpRight size={16} /></div>
          <div className="card-header">
            <div className="card-title">
              <PieChart size={18} color="var(--accent-cyan)" />
              Asset Portfolio Split
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-info">{categories.length} Classes</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Click Box to Open ↗</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {(() => {
              if (!categories || categories.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    <PieChart size={32} color="var(--text-dim)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>No Portfolio Assets Loaded</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px', margin: '4px auto 1rem' }}>
                      Import external CSV spreadsheets to analyze your asset categories and capital allocation.
                    </p>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate('assets'); }}
                    >
                      Open Asset Registry & Import CSV ↗
                    </button>
                  </div>
                );
              }
              const catTotal = categories.reduce((sum, c) => sum + Number(c.totalValue), 0) || 1;
              return categories.map((cat, i) => {
                const fraction = (Number(cat.totalValue) / catTotal) * 100;
                const pctStr = fraction < 0.05 ? '<0.1%' : (fraction < 10 ? fraction.toFixed(1) + '%' : Math.round(fraction) + '%');
                return (
                  <div 
                    key={i}
                    className="clickable"
                    style={{ 
                      padding: '0.5rem 0.65rem', 
                      borderRadius: 'var(--radius-sm)', 
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      border: '1px solid transparent'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate && onNavigate('portfolio');
                    }}
                    title={`Click to view ${cat.category} details in Portfolio Split`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {cat.category} ({cat.count})
                        <ArrowUpRight size={12} color="var(--text-tertiary)" />
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>{fmt(cat.totalValue)} ({pctStr})</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className={`progress-fill ${i % 2 === 0 ? 'progress-cyan' : 'progress-emerald'}`} 
                        style={{ width: `${Math.max(4, Math.min(100, fraction))}%` }} 
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
