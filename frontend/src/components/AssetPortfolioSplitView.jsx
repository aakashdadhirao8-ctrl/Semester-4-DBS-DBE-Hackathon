import React, { useState, useEffect } from 'react';
import { 
  PieChart as PieChartIcon, 
  BarChart3, 
  Layers, 
  TrendingUp, 
  Building2, 
  Server, 
  Truck, 
  Laptop, 
  Wrench, 
  Briefcase, 
  Home, 
  Plane, 
  Car, 
  Crown, 
  ShieldCheck, 
  ArrowUpRight,
  Search,
  X
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORY_COLORS = {
  SERVER: '#6366F1',           // Iris
  VEHICLE: '#0EA5E9',          // Cyan
  HARDWARE: '#10B981',         // Emerald
  MACHINERY: '#F59E0B',        // Amber
  OFFICE_EQUIPMENT: '#EC4899', // Pink
  REAL_ESTATE: '#8B5CF6',      // Purple
  AIRCRAFT: '#F97316',         // Orange
  LUXURY_AUTO: '#EAB308'       // Gold
};

const CATEGORY_ICONS = {
  SERVER: Server,
  VEHICLE: Truck,
  HARDWARE: Laptop,
  MACHINERY: Wrench,
  OFFICE_EQUIPMENT: Briefcase,
  REAL_ESTATE: Home,
  AIRCRAFT: Plane,
  LUXURY_AUTO: Car
};

export default function AssetPortfolioSplitView({ currency, forexRates, role = 'manager' }) {
  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'corporate', 'personal'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const isKingpin = role === 'kingpin';

  useEffect(() => {
    loadPortfolioData();
    const unsubscribe = api.subscribe(() => {
      loadPortfolioData();
    });
    return () => unsubscribe();
  }, [role]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const [catData, assetData, sumData] = await Promise.all([
        api.getCategoryDistribution(role),
        api.getAllAssets(role),
        api.getDashboardSummary(role)
      ]);
      setCategories(catData || []);
      setAssets(assetData || []);
      setSummary(sumData || null);
      if (catData && catData.length > 0) {
        setSelectedCategory(catData[0].category);
      }
    } catch (err) {
      console.error('Failed to load portfolio split data:', err);
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
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading Asset Portfolio Distribution...</div>;
  }

  // Filter assets based on selection and search
  const filteredAssets = assets.filter(a => {
    if (filterMode === 'corporate' && a.isPersonal) return false;
    if (filterMode === 'personal' && !a.isPersonal) return false;
    if (selectedCategory && selectedCategory !== 'ALL') {
      if (a.category !== selectedCategory) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTag = a.assetTag?.toLowerCase().includes(q);
      const matchName = a.name?.toLowerCase().includes(q);
      const matchCat = a.category?.toLowerCase().includes(q);
      const matchDept = a.departmentName?.toLowerCase().includes(q);
      const matchEmp = a.assignedEmployeeName?.toLowerCase().includes(q);
      if (!matchTag && !matchName && !matchCat && !matchDept && !matchEmp) return false;
    }
    return true;
  });

  const totalCapEx = categories.reduce((sum, c) => sum + Number(c.totalValue), 0);
  const totalValue = totalCapEx || 1;

  // Prepare Donut Chart Data
  let cumulativeAngle = 0;
  const donutSlices = categories.map((cat, idx) => {
    const val = Number(cat.totalValue);
    const fraction = val / totalValue;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const color = CATEGORY_COLORS[cat.category] || '#64748B';
    return {
      category: cat.category,
      count: cat.count,
      totalValue: val,
      percentage: (fraction * 100).toFixed(1),
      startAngle,
      endAngle,
      color
    };
  });

  // SVG Helper to calculate pie slice paths
  const getSlicePath = (cx, cy, r, innerR, startDeg, endDeg) => {
    const rad = (deg) => (deg - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(rad(startDeg));
    const y1 = cy + r * Math.sin(rad(startDeg));
    const x2 = cx + r * Math.cos(rad(endDeg));
    const y2 = cy + r * Math.sin(rad(endDeg));

    const ix1 = cx + innerR * Math.cos(rad(endDeg));
    const iy1 = cy + innerR * Math.sin(rad(endDeg));
    const ix2 = cx + innerR * Math.cos(rad(startDeg));
    const iy2 = cy + innerR * Math.sin(rad(startDeg));

    const largeArc = endDeg - startDeg > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
  };

  const maxCategoryValue = Math.max(...categories.map(c => Number(c.totalValue))) || 1;

  return (
    <div className="animate-in">
      {/* Top Controls & Portfolio Scope Banner */}
      <div className="card-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="card-title">
              <PieChartIcon size={20} color="var(--accent-primary)" />
              Asset Portfolio Split & Allocation Matrix
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Capital expenditure distribution across physical server hardware, fleet vehicles, real estate, and heavy machinery.
            </p>
          </div>

          {/* Search Bar & Filter Chips */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search category, model, tag..."
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

            {isKingpin && (
              <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
                <button 
                  onClick={() => setFilterMode('all')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: filterMode === 'all' ? 'var(--accent-primary)' : 'transparent',
                    color: filterMode === 'all' ? '#FFFFFF' : 'var(--text-secondary)'
                  }}
                >
                  Consolidated (All)
                </button>
                <button 
                  onClick={() => setFilterMode('corporate')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: filterMode === 'corporate' ? 'var(--accent-primary)' : 'transparent',
                    color: filterMode === 'corporate' ? '#FFFFFF' : 'var(--text-secondary)'
                  }}
                >
                  Corporate Fleet Only
                </button>
                <button 
                  onClick={() => setFilterMode('personal')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: filterMode === 'personal' ? 'var(--accent-gold)' : 'transparent',
                    color: filterMode === 'personal' ? '#000000' : 'var(--text-secondary)'
                  }}
                >
                  👑 Kingpin Estates
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Chart Grids: Donut Pie Chart & Comparative Bar Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(380px, 1.3fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* 1. Interactive Donut / Pie Chart */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="card-header" style={{ width: '100%', marginBottom: '1rem' }}>
            <div className="card-title">
              <PieChartIcon size={18} color="var(--accent-cyan)" />
              Category Portfolio Donut Split
            </div>
            <span className="badge badge-info">{categories.length} Asset Classes</span>
          </div>

          <div style={{ position: 'relative', width: 280, height: 280, margin: '1rem 0' }}>
            <svg viewBox="0 0 280 280" style={{ width: '100%', height: '100%', transform: 'rotate(0deg)' }}>
              {donutSlices.length === 0 ? (
                <circle cx="140" cy="140" r="105" fill="none" stroke="var(--border-subtle)" strokeWidth="32" strokeDasharray="6 6" />
              ) : (
                donutSlices.map((slice, i) => {
                  const path = getSlicePath(140, 140, 130, 85, slice.startAngle, slice.endAngle);
                  const isSelected = selectedCategory === slice.category;
                  return (
                    <path
                      key={i}
                      className="donut-slice"
                      d={path}
                      fill={slice.color}
                      opacity={selectedCategory && !isSelected ? 0.35 : 1}
                      stroke="var(--bg-card)"
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCategory(isSelected ? 'ALL' : slice.category)}
                    />
                  );
                })
              )}
            </svg>

            {/* Donut Center Core Display */}
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total CapEx
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {fmt(totalCapEx)}
              </div>
              <div style={{ fontSize: '0.7rem', color: assets.length > 0 ? 'var(--accent-emerald)' : 'var(--text-dim)', marginTop: '2px' }}>
                {assets.length} Active Assets
              </div>
            </div>
          </div>

          {/* Donut Category Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', width: '100%', marginTop: '0.5rem' }}>
            {donutSlices.map((slice, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedCategory(selectedCategory === slice.category ? 'ALL' : slice.category)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.65rem', 
                  background: selectedCategory === slice.category ? 'var(--bg-surface-hover)' : 'var(--bg-surface-elevated)', 
                  border: selectedCategory === slice.category ? `1px solid ${slice.color}` : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: slice.color, flexShrink: 0 }}></span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {slice.category}
                  </span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                  {slice.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Comparative Capital Bar Charts */}
        <div className="card-panel">
          <div className="card-header" style={{ marginBottom: '1.25rem' }}>
            <div className="card-title">
              <BarChart3 size={18} color="var(--accent-emerald)" />
              Capital Investment per Asset Category
            </div>
            <span className="badge badge-info">Comparative Scale</span>
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Displays total financial commitment and book value concentration by physical category. Click on any bar to filter assets below.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>No Asset Investment Data</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Import external CSV files to view visual capital distributions and bar charts.
                </p>
              </div>
            ) : (
              categories.map((cat, i) => {
              const val = Number(cat.totalValue);
              const barWidthPct = Math.max(6, Math.round((val / maxCategoryValue) * 100));
              const pctOfTotal = ((val / totalValue) * 100).toFixed(1);
              const color = CATEGORY_COLORS[cat.category] || '#6366F1';
              const isSelected = selectedCategory === cat.category;
              const IconComp = CATEGORY_ICONS[cat.category] || Layers;

              return (
                <div 
                  key={i}
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.category)}
                  style={{ 
                    cursor: 'pointer', 
                    padding: '0.5rem 0.65rem', 
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                    border: isSelected ? `1px solid ${color}` : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.825rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <IconComp size={15} color={color} />
                      <strong style={{ color: 'var(--text-primary)' }}>{cat.category}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>({cat.count} units)</span>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{fmt(val)}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({pctOfTotal}%)</span>
                    </div>
                  </div>

                  <div className="progress-track" style={{ height: '10px', background: 'var(--bg-surface-elevated)' }}>
                    <div 
                      style={{ 
                        width: `${barWidthPct}%`, 
                        height: '100%', 
                        background: color, 
                        borderRadius: 'var(--radius-pill)',
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      </div>

      {/* Asset Registry Drill-down for Selected Category */}
      <div className="card-panel">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <div className="card-title">
              <Building2 size={18} color="var(--accent-primary)" />
              {selectedCategory && selectedCategory !== 'ALL' ? `${selectedCategory} Assets List` : 'Consolidated Assets across Selected Categories'}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Showing {filteredAssets.length} matching physical asset records.
            </p>
          </div>

          {selectedCategory && selectedCategory !== 'ALL' && (
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setSelectedCategory('ALL')}
            >
              Show All Categories
            </button>
          )}
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Purchase Cost</th>
                <th>Current Book Value</th>
                <th>Custodian / Dept</th>
                <th>Condition</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <span className="asset-tag-badge">{asset.assetTag}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{asset.name}</div>
                    {asset.isPersonal && (
                      <span className="kingpin-gold-badge" style={{ fontSize: '0.62rem', marginTop: '2px' }}>
                        Kingpin Estate
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">{asset.category}</span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{fmt(asset.purchaseCost)}</strong>
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{fmt(asset.currentBookValue)}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{asset.assignedEmployeeName || 'Pooled Infrastructure'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{asset.departmentName}</div>
                  </td>
                  <td>
                    <span className={`badge ${asset.conditionStatus === 'EXCELLENT' ? 'badge-success' : (asset.conditionStatus === 'GOOD' ? 'badge-info' : 'badge-critical')}`}>
                      {asset.conditionStatus}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info">{asset.allocationStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
