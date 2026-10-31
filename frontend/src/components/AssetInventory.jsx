import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  UserPlus, 
  RotateCcw, 
  Wrench, 
  ShieldAlert, 
  CheckCircle2, 
  X,
  Receipt,
  Boxes,
  Crown,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import CsvDataManager from './CsvDataManager';

export default function AssetInventory({ currency, forexRates, role = 'manager' }) {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Form states
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  const [maintCost, setMaintCost] = useState('');
  const [maintIssue, setMaintIssue] = useState('');
  const [maintProvider, setMaintProvider] = useState('');

  const [newAsset, setNewAsset] = useState({
    assetTag: '',
    name: '',
    category: 'HARDWARE',
    purchaseCost: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    powerWatts: 65,
    salvageValue: 0,
    financingType: 'OUTRIGHT',
    totalLoanAmount: '',
    downPayment: '',
    monthlyEmi: '',
    tenureMonths: 24,
    interestRate: 8.5,
    isPersonal: false
  });

  useEffect(() => {
    loadData();
    const unsubscribe = api.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [role]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetList, empList] = await Promise.all([
        api.getAllAssets(role),
        api.getEmployees(),
      ]);
      setAssets(assetList);
      setEmployees(empList);
      if (empList.length > 0) setAssignEmployeeId(empList[0].id);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      await api.assignAsset(selectedAsset.id, {
        employeeId: Number(assignEmployeeId),
        conditionNotes: assignNotes || 'Assigned in good condition'
      });
      setShowAssignModal(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to assign asset');
    }
  };

  const handleReturn = async (asset) => {
    if (!confirm(`Return ${asset.name} back to company pool?`)) return;
    try {
      await api.returnAsset(asset.id, 'Returned to company pool by manager');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to return asset');
    }
  };

  const handleDeleteAsset = async (asset) => {
    if (!confirm(`Permanently delete "${asset.name}" (${asset.assetTag}) from corporate inventory?`)) return;
    try {
      await api.deleteAsset(asset.id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete asset');
    }
  };

  const handleMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      await api.logMaintenance(selectedAsset.id, {
        cost: Number(maintCost),
        issueDescription: maintIssue,
        serviceProvider: maintProvider || 'Authorized Service Center'
      });
      setShowMaintenanceModal(false);
      setMaintCost('');
      setMaintIssue('');
      setMaintProvider('');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to log maintenance');
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      await api.createAsset({
        ...newAsset,
        purchaseCost: Number(newAsset.purchaseCost),
        powerWatts: Number(newAsset.powerWatts),
        salvageValue: Number(newAsset.salvageValue),
        totalLoanAmount: newAsset.financingType === 'LOAN' ? Number(newAsset.totalLoanAmount || newAsset.purchaseCost) : 0,
        downPayment: newAsset.financingType === 'LOAN' ? Number(newAsset.downPayment || 0) : 0,
        monthlyEmi: newAsset.financingType === 'LOAN' ? Number(newAsset.monthlyEmi || 0) : 0,
        tenureMonths: Number(newAsset.tenureMonths || 24),
        interestRate: Number(newAsset.interestRate || 8.5)
      });
      setShowAddModal(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create asset');
    }
  };

  const rate = forexRates[currency] || 1.0;
  const symbol = currency === 'INR' ? '₹' : (currency === 'EUR' ? '€' : '$');

  const fmt = (val) => {
    if (val === undefined || val === null) return `${symbol}0`;
    const converted = Number(val) * rate;
    return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const filtered = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          a.assetTag.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Search by asset tag, hardware model..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="form-input" 
              style={{ paddingLeft: '36px' }} 
            />
          </div>

          <select 
            className="form-select" 
            style={{ width: '180px' }} 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="HARDWARE">Hardware / Laptops</option>
            <option value="SERVER">Cloud & AI Servers</option>
            <option value="VEHICLE">EV Fleet Vehicles</option>
            <option value="OFFICE_EQUIPMENT">Office Equipment</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            onClick={() => setShowCsvModal(true)}
            title="Import or Export assets via external CSV spreadsheets"
          >
            <FileSpreadsheet size={16} color="var(--accent-primary)" />
            <span>Import / Export CSV</span>
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Register New Asset
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="card-panel">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Tag / Model</th>
                <th>Category</th>
                <th>Purchase Value</th>
                <th>Tax Write-Off</th>
                <th>Custody / Owner</th>
                <th>Power Draw</th>
                <th>Condition</th>
                <th>Allocation Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                        <Boxes size={26} />
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Asset Inventory Database is Empty
                      </div>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: 0, lineHeight: 1.45 }}>
                        Ready to load your real-world datasets. Import your external CSV files using standard industry headers, or register individual equipment items.
                      </p>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.65rem' }}>
                        <button className="btn btn-secondary" onClick={() => setShowCsvModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FileSpreadsheet size={15} color="var(--accent-primary)" />
                          <span>Import External CSV</span>
                        </button>
                        <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Plus size={15} />
                          <span>Register Asset</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(a => {
                const isAssigned = a.allocationStatus === 'ASSIGNED';
                const isMaint = a.allocationStatus === 'UNDER_MAINTENANCE';
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="tooltip-wrapper">
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            {a.name}
                            {a.isPersonal && <span className="kingpin-gold-badge" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>👑 Kingpin Estate</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{a.assetTag}</div>
                        </div>

                        <div className="tooltip-bubble">
                          <div className="tooltip-title">{a.name}</div>
                          <div className="tooltip-desc">
                            Acquired: <strong>{a.purchaseDate}</strong> • Condition: <strong>{a.conditionStatus}</strong> • Book Value: <strong>{fmt(a.currentBookValue)}</strong> • Power: <strong>{a.powerWatts || 65}W</strong>
                            {a.financingType === 'LOAN' && (
                              <div style={{ marginTop: '4px', color: 'var(--accent-gold)' }}>
                                Financed: {a.currentOwnershipPct}% Owned • Remaining: {fmt(a.remainingLoanBalance)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{a.category}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(a.purchaseCost)}</td>
                    <td>
                      <div className="tooltip-wrapper">
                        <span className="tax-shield-badge">
                          🛡️ +{fmt(a.annualTaxShield || (a.purchaseCost * 0.05))}/yr
                        </span>
                        <div className="tooltip-bubble">
                          <div className="tooltip-title"><Receipt size={12} /> Tax Shield Benefit</div>
                          <div className="tooltip-desc">
                            {a.taxCategory || 'MACRS Depreciation'} • Deductible Rate: {a.taxDepreciationRate || 20}% • Tax Bracket: {a.taxBracketPct || 25}% • Annual Tax Reduction: <strong>+{fmt(a.annualTaxShield || (a.purchaseCost * 0.05))}</strong>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {(a.assignedEmployee || a.assignedEmployeeName) ? (
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            {a.assignedEmployee?.fullName || a.assignedEmployeeName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {a.assignedEmployee?.department?.name || a.departmentName || 'Department'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Unallocated Pool</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{a.powerWatts || 65} W</td>
                    <td>
                      <span className={`badge ${a.conditionStatus === 'DAMAGED' ? 'badge-critical' : 'badge-success'}`}>
                        {a.conditionStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isAssigned ? 'badge-info' : (isMaint ? 'badge-warning' : 'badge-success')}`}>
                        {a.allocationStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {isAssigned ? (
                          <button 
                            className="btn-primary btn-sm btn-amber"
                            onClick={() => handleReturn(a)}
                            title="Return custody to pool"
                          >
                            <RotateCcw size={14} /> Return
                          </button>
                        ) : (
                          <button 
                            className="btn-primary btn-sm"
                            onClick={() => {
                              setSelectedAsset(a);
                              setShowAssignModal(true);
                            }}
                            title="Assign to employee"
                          >
                            <UserPlus size={14} /> Assign
                          </button>
                        )}

                        <button 
                          className="btn-primary btn-sm"
                          style={{ background: '#334155' }}
                          onClick={() => {
                            setSelectedAsset(a);
                            setShowMaintenanceModal(true);
                          }}
                          title="Log repair or maintenance"
                        >
                          <Wrench size={14} /> Repair
                        </button>

                        <button 
                          className="btn-primary btn-sm"
                          style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#f87171' }}
                          onClick={() => handleDeleteAsset(a)}
                          title="Delete / Decommission Asset"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Assign Asset */}
      {showAssignModal && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <div className="card-title">Assign Custody: {selectedAsset.name}</div>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setShowAssignModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label className="form-label">Select Employee</label>
                <select className="form-select" value={assignEmployeeId} onChange={e => setAssignEmployeeId(e.target.value)}>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.designation} — {emp.department?.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Handover Condition Notes</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Issued with power adapter, no scratches" 
                  value={assignNotes} 
                  onChange={e => setAssignNotes(e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-primary" style={{ background: '#334155' }} onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Handover</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Maintenance */}
      {showMaintenanceModal && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <div className="card-title">Log Maintenance: {selectedAsset.name}</div>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setShowMaintenanceModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMaintenance}>
              <div className="form-group">
                <label className="form-label">Service Repair Cost ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  className="form-input" 
                  placeholder="e.g. 450.00" 
                  value={maintCost} 
                  onChange={e => setMaintCost(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Defect / Issue Description</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="e.g. Battery replacement & thermal fan cleaning" 
                  value={maintIssue} 
                  onChange={e => setMaintIssue(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Service Provider / Vendor</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Official Apple Care / In-House IT" 
                  value={maintProvider} 
                  onChange={e => setMaintProvider(e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-primary" style={{ background: '#334155' }} onClick={() => setShowMaintenanceModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary btn-emerald">Save Maintenance Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register New Asset */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="card-header">
              <div className="card-title">
                {newAsset.isPersonal ? '👑 Register Kingpin Personal Holding' : 'Register Corporate Physical Asset'}
              </div>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAsset}>
              {/* Scope Selector if Kingpin is logged in */}
              {role === 'kingpin' && (
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', marginBottom: '1.25rem' }}>
                  <label className="form-label">Asset Scope / Ownership</label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem' }}>
                    <button
                      type="button"
                      className={`btn-primary btn-sm ${!newAsset.isPersonal ? '' : 'btn-secondary'}`}
                      onClick={() => setNewAsset({ ...newAsset, isPersonal: false, category: 'HARDWARE' })}
                    >
                      Corporate Equipment
                    </button>
                    <button
                      type="button"
                      className={`btn-primary btn-sm ${newAsset.isPersonal ? 'btn-amber' : 'btn-secondary'}`}
                      onClick={() => setNewAsset({ ...newAsset, isPersonal: true, category: 'REAL_ESTATE' })}
                    >
                      👑 Kingpin Personal Holding (Estate, Jet, Car)
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Asset Tag (Unique)</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder={newAsset.isPersonal ? "e.g. KNG-EST-04" : "e.g. DEV-MBP-2025-09"} 
                    value={newAsset.assetTag} 
                    onChange={e => setNewAsset({ ...newAsset, assetTag: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select" 
                    value={newAsset.category} 
                    onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
                  >
                    {newAsset.isPersonal ? (
                      <>
                        <option value="REAL_ESTATE">Personal Real Estate / Villa / Penthouse</option>
                        <option value="AIRCRAFT">Private Executive Jet / Aviation</option>
                        <option value="LUXURY_AUTO">Personal Exotic / Luxury Vehicle</option>
                        <option value="COLLECTIBLE">Private Vault / Art & Collectibles</option>
                        <option value="HARDWARE">Executive Computing Workstation</option>
                      </>
                    ) : (
                      <>
                        <option value="HARDWARE">Hardware / Laptops</option>
                        <option value="SERVER">Cloud / AI Server</option>
                        <option value="VEHICLE">EV Fleet Vehicle</option>
                        <option value="MACHINERY">Heavy Machinery</option>
                        <option value="OFFICE_EQUIPMENT">Office Equipment</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Model / Asset Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="e.g. Dell PowerEdge R760 128GB" 
                  value={newAsset.name} 
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Purchase Cost ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    className="form-input" 
                    placeholder="e.g. 5000.00" 
                    value={newAsset.purchaseCost} 
                    onChange={e => setNewAsset({ ...newAsset, purchaseCost: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Date</label>
                  <input 
                    type="date" 
                    required 
                    className="form-input" 
                    value={newAsset.purchaseDate} 
                    onChange={e => setNewAsset({ ...newAsset, purchaseDate: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Power (Watts)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 85" 
                    value={newAsset.powerWatts} 
                    onChange={e => setNewAsset({ ...newAsset, powerWatts: e.target.value })} 
                  />
                </div>
              </div>

              {/* Financing Selection */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                <div className="form-group">
                  <label className="form-label">Financing Structure</label>
                  <select 
                    className="form-select" 
                    value={newAsset.financingType} 
                    onChange={e => setNewAsset({ ...newAsset, financingType: e.target.value })}
                  >
                    <option value="OUTRIGHT">Outright Purchase (100% Equity Owned)</option>
                    <option value="LOAN">Financed via Bank Loan / EMI (Amortized)</option>
                  </select>
                </div>

                {newAsset.financingType === 'LOAN' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <div>
                      <label className="form-label">Down Payment ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-input" 
                        placeholder="e.g. 1000" 
                        value={newAsset.downPayment} 
                        onChange={e => setNewAsset({ ...newAsset, downPayment: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="form-label">Monthly EMI ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-input" 
                        placeholder="e.g. 250" 
                        value={newAsset.monthlyEmi} 
                        onChange={e => setNewAsset({ ...newAsset, monthlyEmi: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="form-label">Tenure (Months)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="e.g. 24" 
                        value={newAsset.tenureMonths} 
                        onChange={e => setNewAsset({ ...newAsset, tenureMonths: e.target.value })} 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-primary" style={{ background: '#334155' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Data Manager Modal */}
      <CsvDataManager 
        isOpen={showCsvModal} 
        onClose={() => setShowCsvModal(false)} 
        onDataImported={loadData}
      />
    </div>
  );
}
