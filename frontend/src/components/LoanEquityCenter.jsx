import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Percent, 
  DollarSign, 
  Sliders, 
  Sparkles,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function LoanEquityCenter({ currency, forexRates, role = 'manager' }) {
  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinance, setSelectedFinance] = useState(null);
  const [lumpSum, setLumpSum] = useState(3000);
  const [searchQuery, setSearchQuery] = useState('');
  const [simulation, setSimulation] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    loadFinances();
  }, [role]);

  const loadFinances = async () => {
    try {
      setLoading(true);
      const data = await api.getAllFinances(role);
      setFinances(data);
      if (data.length > 0) {
        const firstLoan = data.find(f => f.financingType === 'LOAN') || data[0];
        setSelectedFinance(firstLoan);
        triggerSimulation(firstLoan.id, lumpSum);
      }
    } catch (err) {
      console.error('Failed to load finances:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerSimulation = async (financeId, amount) => {
    try {
      const res = await api.simulateEarlyPayoff(financeId, amount);
      setSimulation(res);
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  const handleLumpSumChange = (e) => {
    const val = Number(e.target.value);
    setLumpSum(val);
    if (selectedFinance) {
      triggerSimulation(selectedFinance.id, val);
    }
  };

  const handleRecordEmi = async (finance) => {
    try {
      const updated = await api.recordEmi(finance.id, {
        remarks: `Manual EMI payment recorded by Finance Dept (${new Date().toLocaleDateString()})`
      });
      setActionMessage(`✅ Monthly EMI recorded successfully for ${finance.asset?.name || finance.name}! Ownership climbed to ${updated.currentOwnershipPct || (finance.currentOwnershipPct + 4)}%.`);
      setTimeout(() => setActionMessage(null), 5000);
      loadFinances();
    } catch (err) {
      alert(err.message || 'Failed to record EMI');
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
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading Loan & Equity Engine...</div>;
  }

  const filteredFinances = finances.filter(fin => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (fin.asset?.name || fin.name || '').toLowerCase();
    const tag = (fin.asset?.assetTag || fin.assetTag || '').toLowerCase();
    const cat = (fin.asset?.category || fin.category || '').toLowerCase();
    return name.includes(q) || tag.includes(q) || cat.includes(q);
  });

  return (
    <div>
      {actionMessage && (
        <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {actionMessage}
        </div>
      )}

      {/* Financed Assets & Real-time Ownership Progression */}
      <div className="card-panel" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="card-title">
            <CreditCard size={20} color="var(--accent-cyan)" />
            Corporate Financed Assets & Live Ownership Progression
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search loans, asset tags, models..."
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
            <span className="badge badge-info">{filteredFinances.length} Active Loans</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Tag / Name</th>
                <th>Category</th>
                <th>Purchase Value</th>
                <th>Tenure Progress</th>
                <th>Monthly EMI</th>
                <th>Company Equity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFinances.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                      <CreditCard size={32} color="var(--text-dim)" />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {finances.length === 0 ? 'No Financed Debt Obligations' : 'No Loans Match Search Query'}
                      </div>
                      <p style={{ fontSize: '0.8rem', maxWidth: '420px', margin: 0, color: 'var(--text-secondary)' }}>
                        {finances.length === 0 
                          ? 'All current physical assets are either outright purchased or unencumbered. When financed assets or equipment loans are imported, real-time debt amortization will track here.'
                          : `No financed assets found matching "${searchQuery}". Clear search to view all ${finances.length} loans.`
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFinances.map((fin) => {
                const isFullyPaid = fin.isFullyPaid || fin.currentOwnershipPct >= 100;
                const assetName = fin.asset?.name || fin.name || 'Equipment';
                const assetTag = fin.asset?.assetTag || fin.assetTag || 'TAG';
                const category = fin.asset?.category || fin.category || 'ASSET';
                const purchaseCost = fin.asset?.purchaseCost || fin.purchaseCost || 0;

                return (
                  <tr key={fin.id} style={{ background: selectedFinance?.id === fin.id ? 'var(--bg-surface-elevated)' : 'transparent' }}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{assetName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{assetTag}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{category}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(purchaseCost)}</td>
                    <td>
                      {fin.financingType === 'LOAN' ? (
                        <div>
                          <div style={{ fontSize: '0.85rem' }}>{fin.emisPaid} of {fin.tenureMonths} Months Paid</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Rate: {fin.interestRate}% p.a.</div>
                        </div>
                      ) : (
                        <span className="badge badge-success">Outright Purchased</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: fin.monthlyEmi > 0 ? '#fbbf24' : 'var(--text-dim)' }}>
                      {fin.monthlyEmi > 0 ? fmt(fin.monthlyEmi) : '—'}
                    </td>
                    <td style={{ minWidth: '180px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                        <span style={{ color: isFullyPaid ? '#34d399' : 'var(--accent-cyan)' }}>
                          {fin.currentOwnershipPct}% Owned
                        </span>
                        {isFullyPaid && <span style={{ color: '#34d399', fontSize: '0.7rem' }}>Fully Capitalized</span>}
                      </div>
                      <div className="progress-track">
                        <div 
                          className={`progress-fill ${isFullyPaid ? 'progress-emerald' : 'progress-cyan'}`} 
                          style={{ width: `${Math.min(100, fin.currentOwnershipPct)}%` }} 
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {fin.financingType === 'LOAN' && !isFullyPaid && (
                          <button 
                            className="btn-primary btn-sm btn-emerald"
                            onClick={() => handleRecordEmi(fin)}
                            title="Log this month's installment and increase company equity"
                          >
                            Pay EMI ({fmt(fin.monthlyEmi)})
                          </button>
                        )}
                        {fin.financingType === 'LOAN' && (
                          <button 
                            className="btn-primary btn-sm"
                            style={{ background: '#334155' }}
                            onClick={() => {
                              setSelectedFinance(fin);
                              triggerSimulation(fin.id, lumpSum);
                            }}
                          >
                            ROI Simulator
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Foreclosure / Pre-Closure ROI Simulator Slider */}
      {selectedFinance && (selectedFinance.financingType === 'LOAN' || selectedFinance.monthlyEmi > 0) && (
        <div className="card-panel" style={{ border: '1px solid var(--border-medium)', background: 'var(--bg-surface-elevated)' }}>
          <div className="card-header">
            <div className="card-title">
              <Sliders size={20} color="var(--accent-primary)" />
              Interactive Loan Pre-Closure & Early Payoff ROI Simulator
            </div>
            <span className="badge badge-info">{selectedFinance.asset?.name || selectedFinance.name}</span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Simulate paying an early lump-sum capital reserve toward <strong>{selectedFinance.asset?.name || selectedFinance.name}</strong> to compute real tenure contraction and bank interest savings.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Lump-Sum Capital Allocation:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{fmt(lumpSum)}</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max={selectedFinance.totalLoanAmount || 20000} 
                step="500" 
                value={lumpSum} 
                onChange={handleLumpSumChange} 
                className="slider-input" 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                <span>{fmt(500)}</span>
                <span>{fmt((selectedFinance.totalLoanAmount || 20000) / 2)}</span>
                <span>{fmt(selectedFinance.totalLoanAmount || 20000)}</span>
              </div>
            </div>

            {simulation && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>Tenure Acceleration</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
                    {simulation.monthsSaved} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Months Saved</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Reduced from {simulation.originalRemainingMonths} to {simulation.newRemainingMonths} mo
                  </div>
                </div>

                <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Bank Interest Saved</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>
                    {fmt(simulation.totalInterestSaved)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Net financial savings
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
