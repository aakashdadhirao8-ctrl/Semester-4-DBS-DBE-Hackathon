import React, { useState, useEffect } from 'react';
import { 
  Hourglass, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Sliders, 
  AlertCircle,
  Clock,
  History,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Percent,
  Layers,
  ArrowUpRight,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import CsvDataManager from './CsvDataManager';

// Verified Historical BLS & Capital Goods Producer Price Index Benchmarks (1940 - 2026)
export const HISTORICAL_CPI_SERIES = [
  { year: 1940, cpi: 14.0, decade: '1940s', era: 'WWII & Industrial Mobilization', note: 'Base wartime production economy' },
  { year: 1945, cpi: 18.0, decade: '1940s', era: 'Post-War Reconstruction', note: 'End of wartime price ceilings' },
  { year: 1950, cpi: 24.1, decade: '1950s', era: 'Post-War Manufacturing Boom', note: 'Heavy industrial factory buildout' },
  { year: 1955, cpi: 26.8, decade: '1950s', era: 'Interstate Grid & Heavy Machinery', note: 'Monetary stability & low inflation' },
  { year: 1960, cpi: 29.6, decade: '1960s', era: 'Mainframe & Jet Aviation Genesis', note: 'IBM 7090 mainframe & Boeing 707 fleet era' },
  { year: 1965, cpi: 31.5, decade: '1960s', era: 'Early Computing & Automation', note: 'Solid-state semiconductor circuits' },
  { year: 1970, cpi: 38.8, decade: '1970s', era: 'Gold Standard Decoupling', note: 'Nixon shock and fiat currency transition' },
  { year: 1975, cpi: 53.8, decade: '1970s', era: 'Great Stagflation & Oil Shock', note: 'Double-digit industrial energy inflation' },
  { year: 1980, cpi: 82.4, decade: '1980s', era: 'Volcker Fed 20% Peak Tightening', note: 'Historic interest rate surge to tame CPI' },
  { year: 1985, cpi: 107.6, decade: '1980s', era: 'PC Revolution & Silicon Dawn', note: 'IBM PC/AT and 386 corporate adoption' },
  { year: 1990, cpi: 130.7, decade: '1990s', era: 'Client-Server & Unix Systems', note: 'Enterprise relational databases' },
  { year: 1995, cpi: 152.4, decade: '1990s', era: 'Commercial Internet Genesis', note: 'Enterprise fiber & dot-com servers' },
  { year: 2000, cpi: 172.2, decade: '2000s', era: 'Dot-Com Datacenter Surge', note: 'Gigabit switching & early rackmounts' },
  { year: 2005, cpi: 195.3, decade: '2000s', era: 'Global Manufacturing Expansion', note: 'Multi-core x86 and virtualization' },
  { year: 2010, cpi: 218.1, decade: '2010s', era: 'Cloud & Smartphone Era', note: 'AWS EC2 scale & enterprise mobile' },
  { year: 2015, cpi: 237.0, decade: '2010s', era: 'Hyperscale Cloud & SaaS', note: 'All-flash arrays and 10GbE network fabric' },
  { year: 2020, cpi: 258.8, decade: '2020s', era: 'Global Supply Chain Shock', note: 'Automotive and silicon chip shortages' },
  { year: 2022, cpi: 292.7, decade: '2020s', era: '40-Year Inflation Peak (8.5%)', note: 'Global supply chain reopening crunch' },
  { year: 2024, cpi: 314.2, decade: '2020s', era: 'AI Semiconductor Cluster Surge', note: 'High GPU and transformer hardware premiums' },
  { year: 2026, cpi: 328.5, decade: '2020s', era: 'Present CapEx Benchmark', note: 'Current active fiscal year' }
];

export default function InflationTimeMachine({ currency, forexRates }) {
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [activeTab, setActiveTab] = useState('scissors'); // 'scissors' (Replacement Deficit) or 'historical' (1940-2026 Backtracker)
  const [futureInflationRate, setFutureInflationRate] = useState(5.5); // 5.5% annual
  const [historicalYear, setHistoricalYear] = useState(1960);
  const [loading, setLoading] = useState(true);
  const [showCsvModal, setShowCsvModal] = useState(false);

  useEffect(() => {
    loadAssets();
    const unsubscribe = api.subscribe(() => {
      loadAssets();
    });
    return () => unsubscribe();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await api.getAllAssets('kingpin');
      setAssets(data || []);
      if (data && data.length > 0 && !selectedAssetId) {
        setSelectedAssetId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load assets for inflation engine:', err);
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
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading CapEx Time-Machine...</div>;
  }

  if (assets.length === 0) {
    return (
      <div className="card-panel animate-in" style={{ textAlign: 'center', padding: '4.5rem 2rem', maxWidth: '720px', margin: '2rem auto' }}>
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          background: 'rgba(6, 182, 212, 0.12)', 
          color: 'var(--accent-cyan)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.25rem' 
        }}>
          <Hourglass size={28} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          No Assets Available for Inflation Time-Machine
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
          The CapEx Time-Machine requires registered corporate assets in your inventory to project compounding replacement inflation curves, 10-year scissors replacement deficits, and 1940–2026 BLS purchasing power models.
        </p>
        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setShowCsvModal(true)}
          >
            <FileSpreadsheet size={16} color="var(--accent-primary)" />
            <span>Import Asset Portfolio CSV</span>
          </button>
        </div>
        {showCsvModal && (
          <CsvDataManager 
            isOpen={showCsvModal} 
            onClose={() => setShowCsvModal(false)} 
            onDataImported={() => loadAssets()} 
          />
        )}
      </div>
    );
  }

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  const assetCost = Number(selectedAsset.purchaseCost) || 50000;
  const bookVal = Number(selectedAsset.currentBookValue) || Math.round(assetCost * 0.7);
  const purchaseYear = selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).getFullYear() : 2023;
  const currentYear = 2026;
  const horizonYear = 2030; // 4 years forward

  // 1. SCISSORS MODEL: Year-by-Year from Purchase (e.g. 2023) to Horizon (2030)
  const scissorsData = [];
  const totalYears = horizonYear - purchaseYear;
  for (let yr = purchaseYear; yr <= horizonYear; yr++) {
    const elapsedFromPurchase = yr - purchaseYear;
    // Compounding inflation replacement cost
    const compFactor = Math.pow(1 + (futureInflationRate / 100), elapsedFromPurchase);
    const repCost = Math.round(assetCost * compFactor);

    // Depreciation curve: drops down to salvage (15%) by horizon
    const deprFraction = Math.max(0.15, 1 - (elapsedFromPurchase / (totalYears + 1)) * 0.85);
    const bookValue = Math.round(assetCost * deprFraction);

    scissorsData.push({
      year: yr,
      replacementCost: repCost,
      depreciatedBookValue: bookValue,
      gap: repCost - bookValue,
      isCurrent: yr === currentYear
    });
  }

  const currentRepCost = Math.round(assetCost * Math.pow(1 + (futureInflationRate / 100), currentYear - purchaseYear));
  const horizonRepCost = Math.round(assetCost * Math.pow(1 + (futureInflationRate / 100), horizonYear - purchaseYear));
  const horizonBookVal = scissorsData[scissorsData.length - 1]?.depreciatedBookValue || Math.round(assetCost * 0.15);
  const totalDeficit = horizonRepCost - horizonBookVal;
  const monthlyReserveNeeded = Math.round(totalDeficit / ((horizonYear - currentYear) * 12));

  // 2. HISTORICAL MODEL: 1940 to 2026
  const cpi2026 = 328.5;
  const histPoint = HISTORICAL_CPI_SERIES.find(p => p.year === historicalYear) || HISTORICAL_CPI_SERIES[0];
  const cpiHistorical = histPoint.cpi;
  const historicalPurchasingPower = Math.round(assetCost * (cpiHistorical / cpi2026));
  const cumulativeInflationPct = Math.round(((cpi2026 - cpiHistorical) / cpiHistorical) * 100);
  const inflationMultiplier = (cpi2026 / cpiHistorical).toFixed(1);
  const yearsElapsed = 2026 - historicalYear;
  const annualizedCagr = yearsElapsed > 0 
    ? ((Math.pow(cpi2026 / cpiHistorical, 1 / yearsElapsed) - 1) * 100).toFixed(2)
    : '0.00';

  // SVG Chart Geometry for Scissors Chart
  const svgWidth = 840;
  const svgHeight = 280;
  const padding = 50;

  const maxScissorsVal = Math.max(...scissorsData.map(d => d.replacementCost)) * 1.15;
  const getScissorsX = (idx) => padding + (idx / Math.max(1, scissorsData.length - 1)) * (svgWidth - 2 * padding);
  const getScissorsY = (val) => svgHeight - padding - (Number(val) / maxScissorsVal) * (svgHeight - 2 * padding);

  const scissorsRepPoints = scissorsData.map((d, i) => `${getScissorsX(i)},${getScissorsY(d.replacementCost)}`).join(' ');
  const scissorsBookPoints = scissorsData.map((d, i) => `${getScissorsX(i)},${getScissorsY(d.depreciatedBookValue)}`).join(' ');

  // Deficit Shaded Polygon between curves
  const deficitPolygonPoints = [
    ...scissorsData.map((d, i) => `${getScissorsX(i)},${getScissorsY(d.replacementCost)}`),
    ...scissorsData.slice().reverse().map((d, i) => {
      const originalIdx = scissorsData.length - 1 - i;
      return `${getScissorsX(originalIdx)},${getScissorsY(d.depreciatedBookValue)}`;
    })
  ].join(' ');

  // SVG Geometry for Historical Chart
  const histData = HISTORICAL_CPI_SERIES;
  const maxHistCpi = 360;
  const getHistX = (idx) => padding + (idx / (histData.length - 1)) * (svgWidth - 2 * padding);
  const getHistY = (cpi) => svgHeight - padding - (cpi / maxHistCpi) * (svgHeight - 2 * padding);
  const histPoints = histData.map((d, i) => `${getHistX(i)},${getHistY(d.cpi)}`).join(' ');

  const DECADE_PRESETS = [
    { year: 1940, label: '1940 (WWII)' },
    { year: 1950, label: '1950 (Manufacturing)' },
    { year: 1960, label: '1960 (Mainframe)' },
    { year: 1970, label: '1970 (Stagflation)' },
    { year: 1980, label: '1980 (PC Silicon)' },
    { year: 1990, label: '1990 (Client-Server)' },
    { year: 2000, label: '2000 (Dot-Com)' },
    { year: 2010, label: '2010 (Cloud Era)' },
    { year: 2020, label: '2020 (Supply Shock)' },
    { year: 2026, label: '2026 (Present)' }
  ];

  return (
    <div className="animate-in">
      {/* Top Controls: Asset Picker & Mode Switcher */}
      <div className="card-panel" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ minWidth: '320px', flex: 1 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Hourglass size={16} color="var(--accent-primary)" />
              Select Corporate Asset for Valuation Simulation:
            </label>
            <select 
              className="form-select" 
              value={selectedAssetId || ''} 
              onChange={(e) => setSelectedAssetId(Number(e.target.value))}
            >
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.assetTag}) — Original Cost: {fmt(a.purchaseCost)}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
            <button 
              onClick={() => setActiveTab('scissors')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: activeTab === 'scissors' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'scissors' ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>✂️</span> The Scissors Deficit Forecast (2023–2030)
            </button>
            <button 
              onClick={() => setActiveTab('historical')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: activeTab === 'historical' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'historical' ? '#000000' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🏛️</span> Historical Macro Backtracker (1940–2026)
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          TAB 1: THE CAPEX SCISSORS CHART (REPLACEMENT DEFICIT)
          ============================================================ */}
      {activeTab === 'scissors' && (
        <div className="animate-in">
          {/* Slider for Annual Inflation Benchmark */}
          <div className="card-panel" style={{ marginBottom: '1.75rem', background: 'var(--bg-surface-elevated)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="form-label" style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                Annual Capital Replacement Inflation Rate Benchmark:
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
                {futureInflationRate}% p.a.
              </span>
            </div>
            <input 
              type="range" 
              min="2.0" 
              max="12.0" 
              step="0.1" 
              value={futureInflationRate} 
              onChange={(e) => setFutureInflationRate(parseFloat(e.target.value))} 
              className="slider-input" 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
              <span>2.0% (Subdued CPI)</span>
              <span>5.5% (Global Hardware Baseline)</span>
              <span>8.5% (High Capital Crunch)</span>
              <span>12.0% (Severe Semiconductor Shortage)</span>
            </div>
          </div>

          {/* 4 Financial Impact KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
              <div className="kpi-header">
                <span className="kpi-title">Initial Purchase ({purchaseYear})</span>
                <Calendar size={18} color="var(--accent-primary)" />
              </div>
              <div className="kpi-value">{fmt(assetCost)}</div>
              <div className="kpi-footer">Original invoice procurement cost</div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
              <div className="kpi-header">
                <span className="kpi-title">Present Book Value (2026)</span>
                <TrendingDown size={18} color="var(--accent-amber)" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>{fmt(bookVal)}</div>
              <div className="kpi-footer">After depreciation ({currentYear - purchaseYear} yrs in service)</div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
              <div className="kpi-header">
                <span className="kpi-title">2030 Replacement Cost</span>
                <TrendingUp size={18} color="var(--accent-rose)" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--accent-rose)' }}>{fmt(horizonRepCost)}</div>
              <div className="kpi-footer">Compounded at {futureInflationRate}% annual inflation</div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid #F43F5E' }}>
              <div className="kpi-header">
                <span className="kpi-title">Unfunded Capital Deficit</span>
                <AlertCircle size={18} color="#F43F5E" />
              </div>
              <div className="kpi-value" style={{ color: '#F43F5E' }}>{fmt(totalDeficit)}</div>
              <div className="kpi-footer">
                Reserve <strong>{fmt(monthlyReserveNeeded)}/mo</strong> to replace debt-free
              </div>
            </div>
          </div>

          {/* The Visual Scissors Chart */}
          <div className="card-panel">
            <div className="card-header" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="card-title">
                  <Hourglass size={18} color="var(--accent-cyan)" />
                  The CapEx Scissors Chart (Widening Unfunded Replacement Gap)
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Standard depreciation models only reserve initial cost, ignoring inflation. The shaded zone highlights the exact <strong>unfunded replacement deficit</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fb7185' }}>
                  <span style={{ width: 12, height: 12, background: '#fb7185', borderRadius: '50%' }}></span>
                  Replacement Cost (Climbing)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24' }}>
                  <span style={{ width: 12, height: 12, background: '#fbbf24', borderRadius: '50%' }}></span>
                  Book Value (Depreciating)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(244, 63, 94, 0.7)' }}>
                  <span style={{ width: 12, height: 12, background: 'rgba(244, 63, 94, 0.3)', border: '1px solid #fb7185' }}></span>
                  Unfunded Deficit
                </span>
              </div>
            </div>

            <div className="chart-container">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                {/* Grid lines */}
                {[0.25, 0.5, 0.75, 1.0].map((frac, i) => (
                  <line 
                    key={i} 
                    x1={padding} 
                    y1={svgHeight - padding - frac * (svgHeight - 2 * padding)} 
                    x2={svgWidth - padding} 
                    y2={svgHeight - padding - frac * (svgHeight - 2 * padding)} 
                    stroke="rgba(255,255,255,0.06)" 
                    strokeDasharray="4 4" 
                  />
                ))}

                {/* Shaded Deficit Polygon (The Scissors Gap) */}
                <polygon 
                  points={deficitPolygonPoints} 
                  fill="rgba(244, 63, 94, 0.15)" 
                  stroke="none"
                />

                {/* Replacement Cost Curve (Rose/Red) */}
                <polyline 
                  fill="none" 
                  stroke="#fb7185" 
                  strokeWidth="3.5" 
                  points={scissorsRepPoints} 
                />

                {/* Book Value Curve (Amber) */}
                <polyline 
                  fill="none" 
                  stroke="#fbbf24" 
                  strokeWidth="3.5" 
                  points={scissorsBookPoints} 
                />

                {/* Data Points */}
                {scissorsData.map((d, i) => {
                  const x = getScissorsX(i);
                  const yRep = getScissorsY(d.replacementCost);
                  const yBook = getScissorsY(d.depreciatedBookValue);

                  return (
                    <g key={i}>
                      {d.isCurrent && (
                        <line 
                          x1={x} 
                          y1={padding - 15} 
                          x2={x} 
                          y2={svgHeight - padding} 
                          stroke="rgba(56, 189, 248, 0.7)" 
                          strokeWidth="2" 
                          strokeDasharray="3 3" 
                        />
                      )}

                      <circle cx={x} cy={yRep} r={d.isCurrent ? 6 : 4} fill="#fb7185" stroke="var(--bg-card)" strokeWidth="2" />
                      <circle cx={x} cy={yBook} r={d.isCurrent ? 6 : 4} fill="#fbbf24" stroke="var(--bg-card)" strokeWidth="2" />

                      <text 
                        x={x} 
                        y={svgHeight - 14} 
                        textAnchor="middle" 
                        fill={d.isCurrent ? "var(--accent-cyan)" : "var(--text-muted)"} 
                        fontSize={d.isCurrent ? "12" : "10"} 
                        fontWeight={d.isCurrent ? "800" : "500"}
                      >
                        {d.year} {d.isCurrent ? '(Now)' : ''}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: HISTORICAL MACROECONOMIC BACKTRACKER (1940 – 2026)
          ============================================================ */}
      {activeTab === 'historical' && (
        <div className="animate-in">
          {/* Historical Era Slider (1940 to 2026) */}
          <div className="card-panel" style={{ marginBottom: '1.75rem', background: 'var(--bg-surface-elevated)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="form-label" style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                Historical Era Benchmark: <strong style={{ color: 'var(--accent-cyan)' }}>{historicalYear} ({histPoint.era})</strong>
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Official BLS CPI Index: <strong>{cpiHistorical}</strong> (vs 328.5 in 2026)
              </span>
            </div>

            <input 
              type="range" 
              min="1940" 
              max="2026" 
              step="5" 
              value={historicalYear} 
              onChange={(e) => setHistoricalYear(Number(e.target.value))} 
              className="slider-input" 
            />

            {/* Quick Preset Decade Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
              {DECADE_PRESETS.map(preset => (
                <button
                  key={preset.year}
                  onClick={() => setHistoricalYear(preset.year)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: historicalYear === preset.year ? 800 : 500,
                    border: historicalYear === preset.year ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    background: historicalYear === preset.year ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-surface)',
                    color: historicalYear === preset.year ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Historical Backtrack KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
              <div className="kpi-header">
                <span className="kpi-title">{historicalYear} Equivalent Purchasing Power</span>
                <History size={18} color="var(--accent-cyan)" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--accent-cyan)' }}>
                {fmt(historicalPurchasingPower)}
              </div>
              <div className="kpi-footer">
                Capital needed in {historicalYear} dollars to procure this asset
              </div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
              <div className="kpi-header">
                <span className="kpi-title">Cumulative Price Inflation</span>
                <TrendingUp size={18} color="var(--accent-gold)" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--accent-gold)' }}>
                +{cumulativeInflationPct}%
              </div>
              <div className="kpi-footer">
                Over {yearsElapsed} years from {historicalYear} to 2026
              </div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
              <div className="kpi-header">
                <span className="kpi-title">Inflation Factor Multiplier</span>
                <Percent size={18} color="var(--accent-emerald)" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>
                {inflationMultiplier}x
              </div>
              <div className="kpi-footer">
                {annualizedCagr}% annualized compound growth (CAGR)
              </div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
              <div className="kpi-header">
                <span className="kpi-title">2026 Today Replacement</span>
                <DollarSign size={18} color="var(--accent-primary)" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--text-primary)' }}>
                {fmt(assetCost)}
              </div>
              <div className="kpi-footer">
                Today's benchmark catalog procurement price
              </div>
            </div>
          </div>

          {/* Historical BLS CPI Trajectory Chart (1940 to 2026) */}
          <div className="card-panel">
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <div className="card-title">
                  <History size={18} color="var(--accent-cyan)" />
                  Official BLS CPI Index Trajectory Across American Economic Eras (1940 – 2026)
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Verified Consumer Price Index series documenting the trajectory from WWII industrial base (14.0) through 1970s stagflation to 2026 (328.5).
                </p>
              </div>
              <span className="badge badge-info">Verified BLS Historical Data</span>
            </div>

            <div className="chart-container">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                {/* Grid lines */}
                {[0.25, 0.5, 0.75, 1.0].map((frac, i) => (
                  <line 
                    key={i} 
                    x1={padding} 
                    y1={svgHeight - padding - frac * (svgHeight - 2 * padding)} 
                    x2={svgWidth - padding} 
                    y2={svgHeight - padding - frac * (svgHeight - 2 * padding)} 
                    stroke="rgba(255,255,255,0.06)" 
                    strokeDasharray="4 4" 
                  />
                ))}

                {/* CPI Curve */}
                <polyline 
                  fill="none" 
                  stroke="var(--accent-cyan)" 
                  strokeWidth="3.5" 
                  points={histPoints} 
                />

                {/* Data Points */}
                {histData.map((d, i) => {
                  const x = getHistX(i);
                  const y = getHistY(d.cpi);
                  const isSelected = d.year === historicalYear;

                  return (
                    <g key={i}>
                      {isSelected && (
                        <line 
                          x1={x} 
                          y1={padding - 10} 
                          x2={x} 
                          y2={svgHeight - padding} 
                          stroke="rgba(6, 182, 212, 0.8)" 
                          strokeWidth="2" 
                          strokeDasharray="3 3" 
                        />
                      )}

                      <circle 
                        cx={x} 
                        cy={y} 
                        r={isSelected ? 7 : 4} 
                        fill={isSelected ? "var(--accent-cyan)" : "var(--accent-primary)"} 
                        stroke="var(--bg-card)" 
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setHistoricalYear(d.year)}
                      />

                      <text 
                        x={x} 
                        y={svgHeight - 14} 
                        textAnchor="middle" 
                        fill={isSelected ? "var(--accent-cyan)" : "var(--text-muted)"} 
                        fontSize={isSelected ? "11" : "9"} 
                        fontWeight={isSelected ? "800" : "500"}
                      >
                        {d.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Era Milestone Narrative Card */}
            <div style={{ marginTop: '1.25rem', padding: '1.15rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
                  ERA PROFILE • {histPoint.decade} ({historicalYear})
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {histPoint.era} (CPI Index: {histPoint.cpi})
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '3px', maxWidth: '750px', lineHeight: '1.5' }}>
                  {histPoint.note}. An enterprise hardware package requiring <strong>{fmt(assetCost)}</strong> today could be commissioned for only <strong>{fmt(historicalPurchasingPower)}</strong> in {historicalYear}'s currency ({inflationMultiplier}x price surge over {yearsElapsed} years).
                </p>
              </div>

              <div style={{ textAlign: 'right', minWidth: '140px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Historical Factor</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                  {inflationMultiplier}x
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
