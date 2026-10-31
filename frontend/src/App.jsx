import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Hourglass, 
  Boxes, 
  Users, 
  Leaf, 
  ShieldAlert, 
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Database,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Sliders,
  DollarSign,
  Crown,
  Shield,
  PieChart,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  FileCheck2,
  KeyRound
} from 'lucide-react';
import { api } from './services/api';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import LoanEquityCenter from './components/LoanEquityCenter';
import InflationTimeMachine from './components/InflationTimeMachine';
import AssetInventory from './components/AssetInventory';
import CostPerSeatView from './components/CostPerSeatView';
import GreenItView from './components/GreenItView';
import AlertCenter from './components/AlertCenter';
import AssetPortfolioSplitView from './components/AssetPortfolioSplitView';
import CashOutflowView from './components/CashOutflowView';
import CsvDataManager from './components/CsvDataManager';
import AccessManagementPortal from './components/AccessManagementPortal';
import './styles/app.css';

const PAGES = {
  overview: {
    id: 'overview',
    title: 'Executive Overview',
    section: 'Core Workspace',
    eyebrow: 'Portfolio & Solvency',
    description: 'Real-time corporate asset valuation, net asset equity progression, debt amortization, and machine learning expenditure forecasts.'
  },
  assets: {
    id: 'assets',
    title: 'Asset Registry & Custody',
    section: 'Core Workspace',
    eyebrow: 'Hardware & Infrastructure',
    description: 'Comprehensive inventory of all corporate hardware, servers, fleet vehicles, and machinery with handover custody audit logs.'
  },
  workforce: {
    id: 'workforce',
    title: 'Workforce Quotas & Cost-Per-Seat',
    section: 'Core Workspace',
    eyebrow: 'Headcount Governance',
    description: 'Department asset allocation ratios, headcount distribution, and cost-per-seat budget ceiling monitoring.'
  },
  portfolio: {
    id: 'portfolio',
    title: 'Asset Portfolio Split',
    section: 'Financial Intelligence',
    eyebrow: 'Capital Allocation & Classes',
    description: 'Deep visual breakdown of physical asset portfolio distribution with interactive donut charts, category capital investment bars, and class concentration.'
  },
  outflow: {
    id: 'outflow',
    title: 'Monthly Cash Outflow Breakdown',
    section: 'Financial Intelligence',
    eyebrow: 'Burn Run-Rate & Forecasting',
    description: 'Granular operational cash burn analysis: Equipment EMIs, preventative repairs, power utilities, and Scikit-Learn polynomial AI predictions.'
  },
  loans: {
    id: 'loans',
    title: 'Financing & Equity Engine',
    section: 'Financial Intelligence',
    eyebrow: 'CapEx Amortization',
    description: 'Dynamic company ownership percentage tracking, real-time EMI payments, and interactive early payoff ROI simulations.'
  },
  inflation: {
    id: 'inflation',
    title: 'CapEx Time-Machine',
    section: 'Financial Intelligence',
    eyebrow: 'Replacement Forecasting',
    description: 'Historical inflation backtracking and the visual Scissors Chart comparing book value depreciation against rising replacement costs.'
  },
  sustainability: {
    id: 'sustainability',
    title: 'Green IT & ESG Sustainability',
    section: 'Governance & ESG',
    eyebrow: 'Eco-Efficiency Analytics',
    description: 'Power ratings (Watts/kWh), annual carbon footprint emissions, monthly utility burn, and datacenter efficiency grades.'
  },
  alerts: {
    id: 'alerts',
    title: 'Risk & Governance Advisories',
    section: 'Governance & ESG',
    eyebrow: 'Intelligent Rule Engine',
    description: 'Automated Scrap vs Repair tipping point triggers, department budget ceiling breaches, and warranty lifespan notifications.'
  }
};

export default function App() {
  // Sync state with URL hash for true multi-page routing
  const getInitialPage = () => {
    const hash = window.location.hash.replace('#/', '');
    return PAGES[hash] ? hash : 'overview';
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [forexRates, setForexRates] = useState({ USD: 1.0, INR: 87.25, EUR: 0.92 });
  const [alertCount, setAlertCount] = useState(3);
  const [theme, setTheme] = useState(() => localStorage.getItem('capex-theme') || 'obsidian');
  const [role, setRole] = useState('manager'); // 'manager' (Quartermaster) or 'kingpin'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Synchronize theme with html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('capex-theme', theme);
  }, [theme]);

  // Listen to hash change for browser Back/Forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const page = getInitialPage();
      setActivePage(page);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when page changes
  const navigateTo = (pageId) => {
    window.location.hash = `#/${pageId}`;
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Initial fetch of summary and alerts
    api.getDashboardSummary()
      .then(res => {
        if (res && res.forexRates) setForexRates(res.forexRates);
      })
      .catch(() => {});

    api.getAlerts()
      .then(res => {
        if (res) setAlertCount(res.length);
      })
      .catch(() => {});
  }, []);

  const currentPage = PAGES[activePage] || PAGES.overview;

  // Unauthenticated Gateway: Forces user to select terminal before entering system
  if (!isAuthenticated) {
    return (
      <AccessManagementPortal 
        isOpen={true}
        isInitialGateway={true}
        currentRole={role}
        onAuthenticate={(chosenRole) => {
          setRole(chosenRole);
          setIsAuthenticated(true);
        }}
        currentTheme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        currentCurrency={currency}
        onCurrencyChange={(newCurr) => setCurrency(newCurr)}
      />
    );
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ============================================================
          SIDEBAR NAVIGATION
          ============================================================ */}
      <aside className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div 
            className="brand-wrapper" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ cursor: 'pointer', width: '100%' }}
            title={sidebarCollapsed ? "Click logo to expand sidebar" : "Click logo to collapse sidebar"}
          >
            <div className="brand-icon">
              <Layers size={22} />
            </div>
            {!sidebarCollapsed && (
              <div className="brand-info">
                <div className="brand-name">
                  Corporate Asset Management
                  <span className="brand-badge-pill">PS #28</span>
                </div>
                <div className="brand-sub">Click logo to collapse</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="sidebar-nav">
          {/* Group 1: Core Workspace */}
          <div>
            {!sidebarCollapsed && <div className="nav-group-title">Core Workspace</div>}
            
            <div 
              className={`nav-link ${activePage === 'overview' ? 'active' : ''}`}
              onClick={() => navigateTo('overview')}
              title="Executive Overview"
            >
              <LayoutDashboard size={18} color={activePage === 'overview' ? '#6366F1' : 'currentColor'} />
              {!sidebarCollapsed && <span>Overview</span>}
            </div>

            <div 
              className={`nav-link ${activePage === 'assets' ? 'active' : ''}`}
              onClick={() => navigateTo('assets')}
              title="Asset Registry & Custody"
            >
              <Boxes size={18} color={activePage === 'assets' ? '#6366F1' : 'currentColor'} />
              {!sidebarCollapsed && <span>Asset Registry</span>}
            </div>

            <div 
              className={`nav-link ${activePage === 'workforce' ? 'active' : ''}`}
              onClick={() => navigateTo('workforce')}
              title="Workforce Quotas"
            >
              <Users size={18} color={activePage === 'workforce' ? '#6366F1' : 'currentColor'} />
              {!sidebarCollapsed && <span>Workforce & Quotas</span>}
            </div>
          </div>

          {/* Group 2: Financial Intelligence & CapEx Analytics */}
          <div>
            {!sidebarCollapsed && <div className="nav-group-title">Financial Intelligence</div>}
            
            <div 
              className={`nav-link ${activePage === 'portfolio' ? 'active' : ''}`}
              onClick={() => navigateTo('portfolio')}
              title="Asset Portfolio Split"
            >
              <PieChart size={18} color={activePage === 'portfolio' ? '#6366F1' : 'currentColor'} />
              {!sidebarCollapsed && <span>Portfolio Split</span>}
            </div>

            <div 
              className={`nav-link ${activePage === 'outflow' ? 'active' : ''}`}
              onClick={() => navigateTo('outflow')}
              title="Monthly Cash Outflow Breakdown"
            >
              <TrendingUp size={18} color={activePage === 'outflow' ? '#10B981' : 'currentColor'} />
              {!sidebarCollapsed && <span>Cash Outflow</span>}
            </div>

            <div 
              className={`nav-link ${activePage === 'inflation' ? 'active' : ''}`}
              onClick={() => navigateTo('inflation')}
              title="CapEx Time-Machine"
            >
              <Hourglass size={18} color={activePage === 'inflation' ? '#06B6D4' : 'currentColor'} />
              {!sidebarCollapsed && <span>Time-Machine (Inflation)</span>}
            </div>

            {role === 'kingpin' && (
              <div 
                className={`nav-link ${activePage === 'loans' ? 'active' : ''}`}
                onClick={() => navigateTo('loans')}
                title="Financing & Equity Engine"
              >
                <CreditCard size={18} color={activePage === 'loans' ? '#F59E0B' : 'currentColor'} />
                {!sidebarCollapsed && <span>Financing & Equity</span>}
              </div>
            )}
          </div>

          {/* Group 3: Governance & ESG */}
          <div>
            {!sidebarCollapsed && <div className="nav-group-title">Governance & ESG</div>}
            
            <div 
              className={`nav-link ${activePage === 'sustainability' ? 'active' : ''}`}
              onClick={() => navigateTo('sustainability')}
              title="Green IT & ESG"
            >
              <Leaf size={18} color={activePage === 'sustainability' ? '#10B981' : 'currentColor'} />
              {!sidebarCollapsed && <span>Green IT & ESG</span>}
            </div>

            <div 
              className={`nav-link ${activePage === 'alerts' ? 'active' : ''}`}
              onClick={() => navigateTo('alerts')}
              title="Risk & Smart Alerts"
            >
              <ShieldAlert size={18} color={activePage === 'alerts' ? '#F43F5E' : 'currentColor'} />
              {!sidebarCollapsed && <span>Risk Advisories</span>}
              {!sidebarCollapsed && alertCount > 0 && (
                <span className="nav-link-badge">{alertCount}</span>
              )}
            </div>
          </div>

          {/* Group 4: Terminal Authentication & Roles */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div 
              className="nav-link"
              onClick={() => setShowAuthModal(true)}
              style={{ 
                cursor: 'pointer', 
                background: 'var(--bg-surface-elevated)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent-primary)',
                fontWeight: 700
              }}
              title="Click to Switch Login (Kingpin / Quartermaster / Auditor)"
            >
              <KeyRound size={18} color="var(--accent-primary)" />
              {!sidebarCollapsed && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span>Switch Login</span>
                  <span className="badge badge-info" style={{ fontSize: '0.62rem' }}>3 Roles ⇄</span>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer Status */}
        <div className="sidebar-footer">
          <div className="system-status-indicator">
            <span className="status-dot"></span>
            {!sidebarCollapsed && (
              <span>MySQL:3306 • Spring Boot:8080</span>
            )}
          </div>
        </div>
      </aside>

      {/* ============================================================
          MAIN WORKSPACE LAYOUT
          ============================================================ */}
      <div className="app-main-layout">
        {/* Top Header Bar */}
        <header className="top-header">
          <div className="header-left">
            <div className="breadcrumbs">
              <span className="breadcrumb-root">Corporate Asset Management</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-section">{currentPage.section}</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{currentPage.title}</span>
            </div>
          </div>

          <div className="header-right">
            {/* Authenticated Identity Pill & Quick Access */}
            <div 
              className="auth-badge" 
              onClick={() => setShowAuthModal(true)} 
              title="Click to open Access Terminal & Platform Controls"
            >
              {role === 'kingpin' ? (
                <>
                  <Crown size={15} color="#F59E0B" />
                  <span style={{ color: '#F59E0B', fontWeight: 700 }}>Kingpin</span>
                  <span className="badge badge-warning" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>Level 5</span>
                </>
              ) : role === 'auditor' ? (
                <>
                  <FileCheck2 size={15} color="var(--accent-emerald)" />
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Auditor</span>
                  <span className="badge badge-success" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>Audit</span>
                </>
              ) : (
                <>
                  <Shield size={15} color="var(--accent-primary)" />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Quartermaster</span>
                  <span className="badge badge-info" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>Ops</span>
                </>
              )}
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', borderLeft: '1px solid var(--border-medium)', paddingLeft: '8px', marginLeft: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                Switch Login ⇄
              </span>
            </div>

            {/* Visual Theme Mode Switcher (Porcelain & Obsidian) */}
            <div className="theme-switcher">
              <button 
                className={`theme-btn ${theme === 'porcelain' ? 'active' : ''}`}
                onClick={() => setTheme('porcelain')}
                title="Executive Porcelain: Clean Light Slate & Ink"
              >
                <span>🏛️</span> Porcelain
              </button>
              <button 
                className={`theme-btn ${theme === 'obsidian' ? 'active' : ''}`}
                onClick={() => setTheme('obsidian')}
                title="Midnight Obsidian: Ultra-Refined Contrast"
              >
                <span>🌌</span> Obsidian
              </button>
            </div>

            {/* Currency Selector */}
            <div className="currency-selector">
              <button 
                className={`currency-chip ${currency === 'USD' ? 'active' : ''}`}
                onClick={() => setCurrency('USD')}
                title="US Dollars"
              >
                USD ($)
              </button>
              <button 
                className={`currency-chip ${currency === 'INR' ? 'active' : ''}`}
                onClick={() => setCurrency('INR')}
                title="Indian Rupees"
              >
                INR (₹)
              </button>
              <button 
                className={`currency-chip ${currency === 'EUR' ? 'active' : ''}`}
                onClick={() => setCurrency('EUR')}
                title="Euros"
              >
                EUR (€)
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="page-container">
          {/* Dynamic Page Header */}
          <div className="page-header">
            <div className="page-title-group">
              <div className="page-eyebrow">
                <Sparkles size={14} />
                {currentPage.eyebrow}
              </div>
              <h1 className="page-title">{currentPage.title}</h1>
              <p className="page-description">{currentPage.description}</p>
            </div>
          </div>

          {/* Page Routing Switch */}
          {activePage === 'overview' && (
            <ExecutiveDashboard 
              currency={currency} 
              forexRates={forexRates} 
              onNavigate={navigateTo}
              role={role}
            />
          )}

          {activePage === 'assets' && (
            <AssetInventory 
              currency={currency} 
              forexRates={forexRates} 
              role={role}
            />
          )}

          {activePage === 'workforce' && (
            <CostPerSeatView 
              currency={currency} 
              forexRates={forexRates} 
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'portfolio' && (
            <AssetPortfolioSplitView 
              currency={currency} 
              forexRates={forexRates} 
              role={role}
            />
          )}

          {activePage === 'outflow' && (
            <CashOutflowView 
              currency={currency} 
              forexRates={forexRates} 
              role={role}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'loans' && (
            <LoanEquityCenter 
              currency={currency} 
              forexRates={forexRates} 
              role={role}
            />
          )}

          {activePage === 'inflation' && (
            <InflationTimeMachine 
              currency={currency} 
              forexRates={forexRates} 
            />
          )}

          {activePage === 'sustainability' && (
            <GreenItView 
              currency={currency} 
              forexRates={forexRates} 
            />
          )}

          {activePage === 'alerts' && (
            <AlertCenter 
              onNavigate={navigateTo}
              onNavigateToAsset={() => navigateTo('assets')} 
            />
          )}
        </main>
      </div>

      {/* ============================================================
          ACCESS TERMINAL & PLATFORM MANAGEMENT PORTAL (MODAL)
          ============================================================ */}
      <AccessManagementPortal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isInitialGateway={false}
        currentRole={role}
        onRoleChange={(newRole) => {
          setRole(newRole);
          if (newRole !== 'kingpin' && activePage === 'loans') {
            navigateTo('overview');
          }
        }}
        currentTheme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        currentCurrency={currency}
        onCurrencyChange={(newCurr) => setCurrency(newCurr)}
        onOpenCsvHub={() => setShowCsvModal(true)}
        onLockTerminal={() => {
          setIsAuthenticated(false);
          setShowAuthModal(false);
        }}
      />

      {/* ============================================================
          CSV DATA HUB (IMPORT & EXPORT)
          ============================================================ */}
      <CsvDataManager 
        isOpen={showCsvModal} 
        onClose={() => setShowCsvModal(false)} 
      />
    </div>
  );
}
