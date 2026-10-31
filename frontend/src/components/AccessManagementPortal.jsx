import React, { useState } from 'react';
import { 
  Crown, 
  Shield, 
  CheckCircle2, 
  RotateCcw, 
  KeyRound, 
  Sparkles, 
  DollarSign, 
  Moon, 
  Sun, 
  Layers, 
  Check, 
  X, 
  Database, 
  Cpu, 
  Server, 
  FileSpreadsheet, 
  Lock, 
  Unlock,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  Terminal,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function AccessManagementPortal({ 
  isOpen, 
  onClose, 
  isInitialGateway = false,
  currentRole, 
  onAuthenticate,
  onRoleChange, 
  currentTheme, 
  onThemeChange, 
  currentCurrency, 
  onCurrencyChange,
  onOpenCsvHub,
  onLockTerminal
}) {
  const [activeTab, setActiveTab] = useState('auth'); // 'auth' | 'management'
  const [enteredPin, setEnteredPin] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState(currentRole || 'manager');
  const [pinError, setPinError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const TERMINAL_CONFIGS = {
    kingpin: {
      id: 'kingpin',
      title: 'Kingpin Sovereign Terminal',
      roleName: 'Kingpin',
      subtitle: 'Executive Sovereign & Wealth Custodian',
      badge: 'Executive Clearance Level 5',
      badgeColor: '#F59E0B',
      pin: '7777',
      icon: Crown,
      iconColor: '#F59E0B',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      summary: 'Full master clearance. Unlocks the consolidated balance sheet, bank debt amortization, CapEx time-machine forecasting, personal private estates (Penthouse, Jet, Supercar), and millions in Section 179 tax write-offs.',
      permissions: ['Consolidated Balance Sheet', 'Personal Wealth Estates', 'Bank Debt Amortization', 'CapEx Time-Machine', 'Section 179 Tax Deductions', 'All Fleet & Hardware']
    },
    manager: {
      id: 'manager',
      title: 'Quartermaster Console',
      roleName: 'Quartermaster',
      subtitle: 'Operations & Hardware Custodian',
      badge: 'Operations Clearance Level 2',
      badgeColor: 'var(--accent-primary)',
      pin: '1234',
      icon: Shield,
      iconColor: 'var(--accent-primary)',
      bgGlow: 'rgba(99, 102, 241, 0.12)',
      borderColor: 'rgba(99, 102, 241, 0.4)',
      summary: 'Operations custodian. Manages corporate hardware inventory, employee custody handovers, maintenance ticketing, and department quotas. (Financing debt, treasury inflation, and private estates are restricted).',
      permissions: ['Corporate Hardware Fleet', 'Employee Custody Handovers', 'Maintenance Ticketing', 'Department Quota Governance', 'Green IT & ESG', 'CSV Data Ingestion']
    },
    auditor: {
      id: 'auditor',
      title: 'Executive Auditor Portal',
      roleName: 'Auditor',
      subtitle: 'Governance, Compliance & ESG Inspection',
      badge: 'Governance Clearance Level 3',
      badgeColor: 'var(--accent-emerald)',
      pin: '9999',
      icon: FileCheck2,
      iconColor: 'var(--accent-emerald)',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      summary: 'Read-only financial and sustainability ledger review. Validates book depreciation schedules, ESG power consumption telemetry, and risk advisories without write-access mutation.',
      permissions: ['Read-Only Balance Sheet', 'Audit Risk Advisories', 'ESG Power Footprint Review', 'Cost-Per-Seat Analysis', 'CSV Data Export']
    }
  };

  const handleSelectTerminal = (termId) => {
    setSelectedTerminal(termId);
    setEnteredPin('');
    setPinError('');
  };

  const handleAuthenticateWithPin = (e) => {
    e?.preventDefault();
    const target = TERMINAL_CONFIGS[selectedTerminal];
    if (enteredPin === target.pin) {
      if (onAuthenticate) onAuthenticate(selectedTerminal);
      if (onRoleChange) onRoleChange(selectedTerminal);
      if (onClose) onClose();
    } else {
      setPinError(`Invalid PIN code. Use demo PIN "${target.pin}" or click 1-Click Express Login.`);
    }
  };

  const handleQuickLogin = (termId) => {
    if (onAuthenticate) onAuthenticate(termId);
    if (onRoleChange) onRoleChange(termId);
    if (onClose) onClose();
  };

  const handleResetDatabase = () => {
    try {
      api.resetToSeedData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWipeDatabase = () => {
    try {
      api.clearAllData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const activeTerminal = TERMINAL_CONFIGS[selectedTerminal] || TERMINAL_CONFIGS.manager;

  return (
    <div 
      className={isInitialGateway ? "initial-gateway-container" : "login-portal-backdrop"} 
      onClick={!isInitialGateway ? onClose : undefined}
    >
      <div 
        className={isInitialGateway ? "initial-gateway-card" : "login-portal-card"} 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: isInitialGateway ? '980px' : '920px', padding: isInitialGateway ? '2.5rem 3rem' : '2rem 2.25rem' }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #6366F1, #818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                <Layers size={16} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                CORPORATE ASSET MANAGEMENT
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>PS #28 • Enterprise</span>
            </div>
            <h1 style={{ fontSize: isInitialGateway ? '1.75rem' : '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', letterSpacing: '-0.02em' }}>
              {isInitialGateway ? 'Enterprise Terminal Access Gateway' : 'Access Terminal & Management Console'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isInitialGateway 
                ? 'Authenticate to unlock the corporate balance sheet, equipment inventory, and predictive CapEx analytics.'
                : 'Switch active clearance role, reset baseline data, and review enterprise RBAC permissions.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Quick theme and currency controls if on initial gateway */}
            {isInitialGateway && (
              <>
                <div className="theme-switcher">
                  <button 
                    type="button"
                    className={`theme-btn ${currentTheme === 'porcelain' ? 'active' : ''}`}
                    onClick={() => onThemeChange('porcelain')}
                    title="Porcelain Light"
                  >
                    <span>🏛️</span>
                  </button>
                  <button 
                    type="button"
                    className={`theme-btn ${currentTheme === 'obsidian' ? 'active' : ''}`}
                    onClick={() => onThemeChange('obsidian')}
                    title="Obsidian Dark"
                  >
                    <span>🌌</span>
                  </button>
                </div>

                <div className="currency-selector">
                  {['USD', 'INR', 'EUR'].map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`currency-chip ${currentCurrency === c ? 'active' : ''}`}
                      onClick={() => onCurrencyChange(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}

            {!isInitialGateway && (
              <button 
                type="button"
                style={{ 
                  background: 'transparent', 
                  border: '1px solid var(--border-subtle)', 
                  color: 'var(--text-tertiary)', 
                  width: 34, 
                  height: 34, 
                  borderRadius: 8, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1rem',
                  transition: 'all 0.15s ease'
                }}
                onClick={onClose}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Only in in-app modal mode) */}
        {!isInitialGateway && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <button
              type="button"
              className="theme-btn"
              style={{ 
                fontWeight: 700, 
                fontSize: '0.85rem', 
                padding: '0.5rem 1rem', 
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'auth' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'auth' ? '#FFFFFF' : 'var(--text-secondary)',
                border: activeTab === 'auth' ? 'none' : '1px solid var(--border-subtle)'
              }}
              onClick={() => setActiveTab('auth')}
            >
              <KeyRound size={15} style={{ marginRight: '6px' }} />
              Terminal Authentication & Logins
            </button>

            <button
              type="button"
              className="theme-btn"
              style={{ 
                fontWeight: 700, 
                fontSize: '0.85rem', 
                padding: '0.5rem 1rem', 
                borderRadius: 'var(--radius-sm)',
                background: activeTab === 'management' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'management' ? '#FFFFFF' : 'var(--text-secondary)',
                border: activeTab === 'management' ? 'none' : '1px solid var(--border-subtle)'
              }}
              onClick={() => setActiveTab('management')}
            >
              <Terminal size={15} style={{ marginRight: '6px' }} />
              Platform Governance & System Controls
            </button>
          </div>
        )}

        {/* ============================================================
            TAB 1: TERMINAL AUTHENTICATION
            ============================================================ */}
        {(activeTab === 'auth' || isInitialGateway) && (
          <div style={{ marginTop: '1.25rem' }}>
            <div className="gateway-roles-grid">
              {Object.values(TERMINAL_CONFIGS).map((term) => {
                const IconComponent = term.icon;
                const isSelected = selectedTerminal === term.id;
                const isCurrent = currentRole === term.id && !isInitialGateway;

                return (
                  <div 
                    key={term.id}
                    onClick={() => handleSelectTerminal(term.id)}
                    style={{ 
                      background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)', 
                      border: isSelected ? `2px solid ${term.badgeColor}` : '1px solid var(--border-medium)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '1.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 8, background: term.bgGlow, display: 'flex', alignItems: 'center', justifyContent: 'center', color: term.iconColor }}>
                          <IconComponent size={20} />
                        </div>
                        {isCurrent && (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                            ✓ Active
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                        {term.roleName}
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: term.badgeColor, fontWeight: 700, marginBottom: '0.65rem' }}>
                        {term.badge}
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '1rem' }}>
                        {term.summary}
                      </p>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                        Default Demo PIN: <strong>{term.pin}</strong>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ 
                          width: '100%', 
                          fontSize: '0.78rem', 
                          padding: '0.5rem', 
                          background: term.id === 'kingpin' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : (term.id === 'auditor' ? 'var(--accent-emerald)' : 'var(--accent-primary)'),
                          color: term.id === 'kingpin' ? '#000000' : '#FFFFFF',
                          fontWeight: 800 
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLogin(term.id);
                        }}
                      >
                        ⚡ 1-Click Express Login
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PIN Code Verification Panel */}
            <div style={{ marginTop: '1.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={16} color={activeTerminal.badgeColor} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    PIN Terminal Verification for {activeTerminal.title}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Enter 4-digit security PIN (Demo PIN: <strong>{activeTerminal.pin}</strong>) or use the 1-Click buttons above.
                </div>
                {pinError && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', marginTop: '4px', fontWeight: 600 }}>
                    ⚠️ {pinError}
                  </div>
                )}
              </div>

              <form onSubmit={handleAuthenticateWithPin} style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                <input 
                  type="password"
                  maxLength={4}
                  placeholder="PIN"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="form-input"
                  style={{ width: '90px', textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.1rem', fontWeight: 700 }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ fontSize: '0.825rem', padding: '0.55rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <span>Verify & Unlock</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: PLATFORM GOVERNANCE & SYSTEM CONTROLS
            ============================================================ */}
        {!isInitialGateway && activeTab === 'management' && (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Quick System Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {/* Dataset Management: Wipe & Restore */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                  <RotateCcw size={16} color="var(--accent-rose)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Dataset Reset
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.35', marginBottom: '0.85rem' }}>
                  Wipe data clean for CSV imports or restore demo seeds.
                </p>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)' }}
                    onClick={handleWipeDatabase}
                    title="Wipes all datasets clean to an empty slate"
                  >
                    {resetSuccess ? '✓ Wiped' : 'Wipe Clean'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)' }}
                    onClick={handleResetDatabase}
                    title="Restores demo sample data"
                  >
                    Demo Seeds
                  </button>
                </div>
              </div>

              {/* Theme Selector */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                  <Moon size={16} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Appearance
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.35', marginBottom: '0.85rem' }}>
                  Toggle Midnight Obsidian or Porcelain.
                </p>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className={`theme-btn ${currentTheme === 'obsidian' ? 'active' : ''}`}
                    style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem' }}
                    onClick={() => onThemeChange('obsidian')}
                  >
                    🌌 Dark
                  </button>
                  <button
                    type="button"
                    className={`theme-btn ${currentTheme === 'porcelain' ? 'active' : ''}`}
                    style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem' }}
                    onClick={() => onThemeChange('porcelain')}
                  >
                    🏛️ Light
                  </button>
                </div>
              </div>

              {/* Currency & Forex */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                  <DollarSign size={16} color="var(--accent-emerald)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Valuation Currency
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.35', marginBottom: '0.85rem' }}>
                  Multi-currency real-time conversion.
                </p>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {['USD', 'INR', 'EUR'].map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`currency-chip ${currentCurrency === c ? 'active' : ''}`}
                      style={{ flex: 1, fontSize: '0.72rem', padding: '0.4rem', textAlign: 'center' }}
                      onClick={() => onCurrencyChange(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lock & Sign Out */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
                  <LogOut size={16} color="var(--accent-rose)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                    Lock Terminal
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.35', marginBottom: '0.85rem' }}>
                  Lock workspace and return to gateway.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)' }}
                  onClick={() => {
                    if (onLockTerminal) onLockTerminal();
                    if (onClose) onClose();
                  }}
                >
                  🔒 Lock & Sign Out
                </button>
              </div>
            </div>

            {/* RBAC Privilege Matrix */}
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Enterprise Role-Based Access Control (RBAC) Matrix
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>Strict Privilege Enforcement</span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.5rem' }}>System Capability / Module</th>
                    <th style={{ padding: '0.5rem', color: '#F59E0B' }}>👑 Kingpin</th>
                    <th style={{ padding: '0.5rem', color: 'var(--accent-primary)' }}>⚙️ Quartermaster</th>
                    <th style={{ padding: '0.5rem', color: 'var(--accent-emerald)' }}>🏛️ Auditor</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Corporate Hardware Inventory & Custody', kp: 'Full Access', qm: 'Full Access', aud: 'Read-Only' },
                    { feature: 'Private Estates (Penthouse, Jet, Supercar)', kp: 'Unlocked', qm: 'Restricted (Hidden)', aud: 'Restricted' },
                    { feature: 'Bank Debt Amortization & Payoff Simulation', kp: 'Full Access', qm: 'Restricted', aud: 'Read-Only' },
                    { feature: 'CapEx Time-Machine (Macro BLS Backtracking)', kp: 'Full Access', qm: 'Restricted', aud: 'Audit View' },
                    { feature: 'Depreciation & Section 179 Tax Shields', kp: 'Full Access', qm: 'Restricted', aud: 'Audit View' },
                    { feature: 'Workforce Cost-Per-Seat & Team Member Adding', kp: 'Full Access', qm: 'Full Access', aud: 'Read-Only' },
                    { feature: 'Green IT & ESG Carbon Telemetry', kp: 'Full Access', qm: 'Full Access', aud: 'Full Access' },
                    { feature: 'External CSV Data Ingestion & Schema Override', kp: 'Full Access', qm: 'Full Access', aud: 'Export Only' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>{row.feature}</td>
                      <td style={{ padding: '0.5rem', color: row.kp === 'Full Access' || row.kp === 'Unlocked' ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: 600 }}>{row.kp}</td>
                      <td style={{ padding: '0.5rem', color: row.qm === 'Full Access' ? 'var(--accent-emerald)' : (row.qm.includes('Restricted') ? 'var(--accent-rose)' : 'var(--text-muted)'), fontWeight: 600 }}>{row.qm}</td>
                      <td style={{ padding: '0.5rem', color: row.aud === 'Full Access' ? 'var(--accent-emerald)' : 'var(--accent-cyan)', fontWeight: 600 }}>{row.aud}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Footer Active Session Status */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-dot"></span>
            <span>Active Session Token: <code style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>CAM-AUTH-{(currentRole || 'GUEST').toUpperCase()}-99X</code></span>
          </div>
          <div>
            System Node: <strong>MySQL 8.0:3306 (corporate_asset_management) • Spring Boot:8080</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
