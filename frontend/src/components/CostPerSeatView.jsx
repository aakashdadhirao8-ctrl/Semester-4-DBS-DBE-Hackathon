import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Search, 
  Laptop, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Phone, 
  MapPin, 
  X, 
  ArrowRight, 
  ChevronRight, 
  Cpu, 
  Layers, 
  Sparkles, 
  Zap, 
  Building2,
  Plus,
  Upload,
  Download,
  FileSpreadsheet,
  ArrowUpRight,
  UserPlus,
  Check,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

export default function CostPerSeatView({ currency, forexRates, onNavigate }) {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Employee Modal State
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    fullName: '',
    email: '',
    designation: '',
    departmentId: 1,
    officeLocation: 'Blr HQ - Campus',
    phone: '+91 98450 00000'
  });
  const [addSuccess, setAddSuccess] = useState(false);

  // Workforce CSV Import / Export Modal State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvParsed, setCsvParsed] = useState(null);
  const [csvMode, setCsvMode] = useState('append'); // 'append' | 'replace'
  const [csvError, setCsvError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState('');

  useEffect(() => {
    loadData();
    const unsubscribe = api.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptData, empData, assetData] = await Promise.all([
        api.getCostPerSeat(),
        api.getEmployees(),
        api.getAllAssets('manager')
      ]);
      setDepartments(deptData || []);
      setEmployees(empData || []);
      setAssets(assetData || []);
      if (deptData && deptData.length > 0 && !selectedDeptId) {
        setSelectedDeptId(deptData[0].departmentId || deptData[0].id);
      }
    } catch (err) {
      console.error('Failed to load cost-per-seat and workforce:', err);
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

  // Handle Form Submission for Adding Team Member
  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!newEmp.fullName.trim()) return;

    const deptObj = departments.find(d => (d.departmentId || d.id) === Number(newEmp.departmentId));
    const created = api.createEmployee({
      fullName: newEmp.fullName.trim(),
      email: newEmp.email.trim() || `${newEmp.fullName.toLowerCase().replace(/\s+/g, '.')}@enterprise.com`,
      designation: newEmp.designation.trim() || 'Software Engineer',
      departmentId: Number(newEmp.departmentId),
      departmentName: deptObj ? (deptObj.departmentName || deptObj.name) : 'Software Engineering',
      officeLocation: newEmp.officeLocation.trim() || 'Blr HQ - Campus',
      phone: newEmp.phone.trim() || '+91 98450 00000',
      joinedDate: new Date().toISOString().split('T')[0]
    });

    setAddSuccess(true);
    setTimeout(() => {
      setAddSuccess(false);
      setShowAddEmpModal(false);
      setNewEmp({
        fullName: '',
        email: '',
        designation: '',
        departmentId: selectedDeptId || 1,
        officeLocation: 'Blr HQ - Campus',
        phone: '+91 98450 00000'
      });
    }, 1200);
  };

  // CSV Parsing Engine
  const parseCsvText = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV must contain a header row and at least one employee data row.');
    }
    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else current += char;
      }
      result.push(current.trim());
      return result.map(col => col.replace(/^["']|["']$/g, ''));
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(line => {
      const vals = parseLine(line);
      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = vals[idx] !== undefined ? vals[idx] : '';
      });
      return rowObj;
    });
    return { headers, rows };
  };

  const handleCsvFileUpload = (e) => {
    setCsvError('');
    setCsvSuccess('');
    const file = e.target.files[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCsvText(text);
        setCsvParsed(parsed);
      } catch (err) {
        setCsvError(err.message || 'Failed to parse CSV file. Please verify CSV formatting.');
        setCsvParsed(null);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyCsvImport = () => {
    if (!csvParsed || csvParsed.rows.length === 0) return;
    try {
      const res = api.importEmployees(csvParsed.rows, csvMode === 'replace');
      setCsvSuccess(`✓ Successfully imported ${res?.count || csvParsed.rows.length} employee records (${csvMode} mode).`);
      setCsvParsed(null);
      setCsvFileName('');
      setTimeout(() => {
        setCsvSuccess('');
        setShowCsvModal(false);
      }, 1500);
    } catch (err) {
      setCsvError(`Import error: ${err.message}`);
    }
  };

  const handleExportWorkforce = () => {
    const csvContent = api.exportEmployeesCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `workforce_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const template = `fullName,email,designation,departmentName,joinedDate,officeLocation
"Arjun Reddy",arjun.reddy@enterprise.com,"Principal Cloud Architect","DevOps & Cloud Infrastructure",2022-03-15,"Blr HQ - Floor 4"
"Divya Sharma",divya.sharma@enterprise.com,"Site Reliability Engineer","DevOps & Cloud Infrastructure",2024-02-15,"Blr HQ - Floor 4"
"Vikramaditya Roy",vikram.roy@enterprise.com,"Staff Infrastructure Specialist","DevOps & Cloud Infrastructure",2023-05-12,"Blr HQ - Floor 4"
"Sneha Rao",sneha.rao@enterprise.com,"Senior Full-Stack Engineer","Software Engineering",2023-06-10,"Blr HQ - Floor 3"
"Rohan Verma",rohan.verma@enterprise.com,"VP of Engineering","Software Engineering",2022-08-01,"Blr HQ - Floor 3"
"Tanvi Mehra",tanvi.mehra@enterprise.com,"Senior Systems Developer","Software Engineering",2024-01-18,"Blr HQ - Floor 3"
"Karthik Nair",karthik.nair@enterprise.com,"Fleet & Operations Director","Corporate Logistics & Fleet",2021-11-01,"Logistics Depot - Sector 9"
"Deepak Nambiar",deepak.nambiar@enterprise.com,"Supply Chain Systems Lead","Corporate Logistics & Fleet",2021-08-01,"Logistics Depot - Sector 9"
"Meera Iyer",meera.iyer@enterprise.com,"Lead Product Designer","Product & UI/UX Design",2023-01-20,"Design Studio - Floor 2"
"Siddharth Sen",siddharth.sen@enterprise.com,"Senior Interaction Designer","Product & UI/UX Design",2024-03-11,"Design Studio - Floor 2"
"Suresh Menon",suresh.menon@enterprise.com,"Chief Financial Officer","Executive & Finance",2020-04-10,"Executive Suite - Floor 5"
"Pooja Hegde",pooja.hegde@enterprise.com,"Head of Treasury & Capital Compliance","Executive & Finance",2022-09-01,"Executive Suite - Floor 5"`;
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'workforce_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading Department Quotas & Workforce Intelligence...</div>;
  }

  const selectedDept = departments.find(d => (d.departmentId || d.id) === selectedDeptId);
  const deptEmployees = employees.filter(e => e.departmentId === selectedDeptId);

  // Global search filtering across departments, roles, and employee names
  const filteredDepartments = departments.filter(d => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const deptName = (d.departmentName || d.name || '').toLowerCase();
    const deptCode = (d.code || '').toLowerCase();
    const headName = (d.headName || '').toLowerCase();
    if (deptName.includes(q) || deptCode.includes(q) || headName.includes(q)) return true;
    return employees.some(e => 
      e.departmentId === (d.departmentId || d.id) &&
      (e.fullName?.toLowerCase().includes(q) || e.designation?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q))
    );
  });

  // Filter employees by search query if any
  const filteredEmployees = deptEmployees.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.fullName?.toLowerCase().includes(q) ||
      e.designation?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q)
    );
  });

  // Department pooled / shared assets
  const deptAssets = assets.filter(a => 
    a.departmentName?.toLowerCase() === selectedDept?.departmentName?.toLowerCase() ||
    a.departmentName?.toLowerCase() === selectedDept?.name?.toLowerCase()
  );

  return (
    <div className="animate-in">
      {/* Overview Card Panel */}
      <div className="card-panel" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.85rem' }}>
          <div>
            <div className="card-title">
              <Users size={20} color="var(--accent-cyan)" />
              Department Headcount & Asset Cost-Per-Seat Index
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Measuring the <strong>Asset Cost Per Seat</strong> (Total Department Hardware / Headcount) to govern CapEx ceilings.
            </p>
          </div>

          {/* Action Toolbar: Search, CSV Hub & Add Employee */}
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search departments, staff, roles..."
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

            <button
              type="button"
              className="btn btn-secondary"
              style={{ height: '34px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0 0.85rem' }}
              onClick={() => setShowCsvModal(true)}
              title="Import or Export Workforce Data via CSV"
            >
              <FileSpreadsheet size={15} color="var(--accent-primary)" />
              <span>Import / Export CSV</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              style={{ height: '34px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0 0.95rem' }}
              onClick={() => {
                setNewEmp(prev => ({ ...prev, departmentId: selectedDeptId || 1 }));
                setShowAddEmpModal(true);
              }}
              title="Register and Hire a New Team Member"
            >
              <Plus size={15} />
              <span>+ Hire / Add Member</span>
            </button>
          </div>
        </div>

        {/* Clickable Department Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: filteredDepartments.length === 0 ? '1fr' : 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
          {filteredDepartments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'var(--bg-surface-elevated)', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', margin: '0 auto 0.75rem' }}>
                <Users size={22} />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {departments.length === 0 ? 'No Workforce or Departments Found' : 'No Departments Match Search Filter'}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '4px auto 1rem' }}>
                {departments.length === 0 
                  ? 'Import your external CSV spreadsheets for Workforce staff or Department quotas to view headcount allocation and cost-per-seat metrics.'
                  : `No department or staff member matches "${searchQuery}". Clear search to view all departments.`
                }
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setShowCsvModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileSpreadsheet size={15} color="var(--accent-primary)" />
                  <span>Import Workforce CSV</span>
                </button>
                <button className="btn-primary" onClick={() => setShowAddEmpModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Plus size={15} />
                  <span>Hire / Add Member</span>
                </button>
              </div>
            </div>
          ) : (
            filteredDepartments.map((dept) => {
            const isOver = dept.isOverBudget;
            const deptId = dept.departmentId || dept.id;
            const deptName = dept.departmentName || dept.name;
            const utilPct = dept.budgetUtilizationPct || dept.utilizationPct || 0;
            const isSelected = selectedDeptId === deptId;

            return (
              <div 
                key={deptId} 
                onClick={() => setSelectedDeptId(deptId)}
                style={{ 
                  background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-surface-elevated)', 
                  border: isSelected 
                    ? '2px solid var(--accent-primary)' 
                    : (isOver ? '1px solid var(--accent-rose)' : '1px solid var(--border-subtle)'), 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '1.25rem',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.25)' : 'none'
                }}
                title={`Click to view employees in ${deptName}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {deptName}
                    </div>
                    <span className="badge badge-info" style={{ marginTop: '0.2rem' }}>{dept.code}</span>
                  </div>
                  {isOver ? (
                    <span className="badge badge-critical">
                      <AlertTriangle size={12} /> Overrun
                    </span>
                  ) : (
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Healthy
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Headcount</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {dept.headcount} Team Members
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Asset Cost Per Seat</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {fmt(dept.costPerSeat)} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-dim)' }}>/head</span>
                    </div>
                  </div>
                </div>

                {/* Budget Utilization Meter */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Allocated: <strong>{fmt(dept.totalAssetValue)}</strong>
                    </span>
                    <span style={{ color: isOver ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                      Cap: <strong>{fmt(dept.budgetCeiling)}</strong> ({utilPct}%)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className={`progress-fill ${isOver ? 'progress-rose' : (utilPct > 80 ? 'progress-amber' : 'progress-emerald')}`} 
                      style={{ width: `${Math.min(100, utilPct)}%` }} 
                    />
                  </div>
                </div>

                {/* Click indicator badge */}
                <div style={{ 
                  marginTop: '0.85rem', 
                  paddingTop: '0.65rem', 
                  borderTop: '1px solid var(--border-subtle)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '0.75rem'
                }}>
                  <span style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-tertiary)', fontWeight: isSelected ? 700 : 500 }}>
                    {isSelected ? '✓ Currently Inspecting Roster' : '🔍 Click to view employees'}
                  </span>
                  <ChevronRight size={14} color={isSelected ? 'var(--accent-primary)' : 'var(--text-tertiary)'} />
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* ============================================================
          DRILL-DOWN PANEL: SELECTED DEPARTMENT WORKFORCE & ASSETS
          ============================================================ */}
      {selectedDept && (
        <div className="card-panel" style={{ border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}>
          {/* Department Inspector Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="badge badge-info" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  {selectedDept.code} DEPT ROSTER
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Head of Dept: <strong>{selectedDept.headName || 'Department Director'}</strong>
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                {selectedDept.departmentName || selectedDept.name} — Staff & Hardware Allocation
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Total Allocated Assets: <strong>{fmt(selectedDept.totalAssetValue)}</strong> across {selectedDept.headcount} team members ({fmt(selectedDept.costPerSeat)}/seat)
              </p>
            </div>

            {/* Search Filter & Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text"
                  placeholder="Filter employees by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', fontSize: '0.825rem' }}
                />
                {searchQuery && (
                  <X 
                    size={14} 
                    color="var(--text-muted)" 
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                    onClick={() => setSearchQuery('')}
                  />
                )}
              </div>
              <span className="badge badge-info" style={{ padding: '0.45rem 0.75rem' }}>
                {filteredEmployees.length} Members Listed
              </span>
            </div>
          </div>

          {/* Employee Roster Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: filteredEmployees.length === 0 ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {filteredEmployees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                <Users size={28} color="var(--text-dim)" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>No Staff Members Found in this Department</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Add a new employee or import workforce CSV records.
                </p>
              </div>
            ) : (
              filteredEmployees.map((emp) => {
              const empAssets = assets.filter(a => a.assignedEmployeeId === emp.id);
              const initials = emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2);

              return (
                <div 
                  key={emp.id}
                  style={{ 
                    background: 'var(--bg-surface-elevated)', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  {/* Employee Identity Header */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #6366F1, #818CF8)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 800, 
                        fontSize: '0.95rem',
                        color: '#FFFFFF',
                        flexShrink: 0
                      }}>
                        {initials}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {emp.fullName}
                          </h3>
                          <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Active</span>
                        </div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '2px' }}>
                          {emp.designation}
                        </div>
                      </div>
                    </div>

                    {/* Contact & Meta Details */}
                    <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Mail size={13} color="var(--text-tertiary)" />
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{emp.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <MapPin size={13} color="var(--text-tertiary)" />
                        <span>{emp.officeLocation || 'Blr Enterprise Campus'}</span>
                        <span style={{ color: 'var(--border-strong)' }}>•</span>
                        <Calendar size={13} color="var(--text-tertiary)" />
                        <span>Joined {emp.joinedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Hardware Section */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Assigned Hardware ({empAssets.length})</span>
                      {empAssets.length > 0 && (
                        <span style={{ color: 'var(--text-primary)' }}>
                          Total: {fmt(empAssets.reduce((sum, a) => sum + Number(a.purchaseCost), 0))}
                        </span>
                      )}
                    </div>

                    {empAssets.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {empAssets.map(asset => (
                          <div 
                            key={asset.id}
                            className="clickable panel-card-interactive"
                            style={{ 
                              background: 'var(--bg-surface)', 
                              border: '1px solid var(--border-medium)', 
                              borderRadius: 'var(--radius-sm)', 
                              padding: '0.65rem 0.85rem',
                              cursor: 'pointer'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate && onNavigate('assets');
                            }}
                            title="Click to inspect this hardware in Asset Registry"
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {asset.assetTag}
                                <ArrowUpRight size={12} />
                              </span>
                              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                                {asset.category}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                              {asset.name}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.45rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <span>Cost: <strong style={{ color: 'var(--text-primary)' }}>{fmt(asset.purchaseCost)}</strong></span>
                              <span>Book: <strong style={{ color: 'var(--accent-gold)' }}>{fmt(asset.currentBookValue)}</strong></span>
                              <span>Power: <strong>{asset.powerWatts}W</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        <Laptop size={15} style={{ margin: '0 auto 0.25rem', opacity: 0.5 }} />
                        No dedicated physical hardware assigned (Accesses Shared Department Server/Cloud Pool)
                      </div>
                    )}
                  </div>
                </div>
              );
            }))}
          </div>

          {/* Department Pooled & Infrastructure Equipment */}
          {deptAssets.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={16} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedDept.departmentName || selectedDept.name} Pooled Department Assets
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Total {deptAssets.length} Department Infrastructure Assets
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                {deptAssets.map(asset => (
                  <div 
                    key={asset.id} 
                    className="clickable panel-card-interactive"
                    style={{ 
                      background: 'var(--bg-surface-elevated)', 
                      border: '1px solid var(--border-subtle)', 
                      borderRadius: 'var(--radius-sm)', 
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => onNavigate && onNavigate('assets')}
                    title="Click to inspect this pooled asset in Asset Registry"
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {asset.assetTag}
                        <ArrowUpRight size={12} />
                      </div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {asset.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Custodian: {asset.assignedEmployeeName || 'Unassigned Shared Pool'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {fmt(asset.purchaseCost)}
                      </div>
                      <span className={`badge ${asset.conditionStatus === 'EXCELLENT' ? 'badge-success' : (asset.conditionStatus === 'GOOD' ? 'badge-info' : 'badge-critical')}`} style={{ fontSize: '0.65rem', marginTop: '3px' }}>
                        {asset.conditionStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          MODAL 1: ADD / HIRE TEAM MEMBER
          ============================================================ */}
      {showAddEmpModal && (
        <div className="login-portal-backdrop" onClick={() => setShowAddEmpModal(false)}>
          <div className="login-portal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                  WORKFORCE EXPANSION
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Register / Hire Team Member
                </h2>
              </div>
              <button 
                type="button"
                style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', width: 30, height: 30, borderRadius: 6, cursor: 'pointer' }}
                onClick={() => setShowAddEmpModal(false)}
              >
                ✕
              </button>
            </div>

            {addSuccess ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <CheckCircle2 size={44} color="var(--accent-emerald)" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Team Member Added!</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Employee registered to active department roster.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Full Legal Name *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Liam Anderson"
                    value={newEmp.fullName}
                    onChange={e => setNewEmp({ ...newEmp, fullName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Corporate Email
                    </label>
                    <input 
                      type="email"
                      placeholder="liam.a@enterprise.com"
                      value={newEmp.email}
                      onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Designation / Role *
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Lead SRE Architect"
                      value={newEmp.designation}
                      onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Department Unit
                    </label>
                    <select 
                      value={newEmp.departmentId}
                      onChange={e => setNewEmp({ ...newEmp, departmentId: Number(e.target.value) })}
                      className="form-input"
                    >
                      {departments.map(d => (
                        <option key={d.departmentId || d.id} value={d.departmentId || d.id}>
                          {d.departmentName || d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Office Campus
                    </label>
                    <input 
                      type="text"
                      placeholder="Blr HQ - Floor 4"
                      value={newEmp.officeLocation}
                      onChange={e => setNewEmp({ ...newEmp, officeLocation: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddEmpModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ fontWeight: 700 }}
                  >
                    Register Team Member
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: WORKFORCE CSV IMPORT & EXPORT
          ============================================================ */}
      {showCsvModal && (
        <div className="login-portal-backdrop" onClick={() => setShowCsvModal(false)}>
          <div className="login-portal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                  ENTERPRISE DATA INTEGRATION
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Workforce CSV Import & Export Hub
                </h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Upload bulk employees via standard CSV or export the complete active corporate roster.
                </p>
              </div>
              <button 
                type="button"
                style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', width: 32, height: 32, borderRadius: 6, cursor: 'pointer' }}
                onClick={() => setShowCsvModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Quick Actions: Download Template & Export CSV */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, justifyContent: 'center' }}
                onClick={handleDownloadTemplate}
              >
                <Download size={15} color="var(--accent-cyan)" />
                <span>Download Sample Template</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, justifyContent: 'center' }}
                onClick={handleExportWorkforce}
              >
                <FileSpreadsheet size={15} color="var(--accent-emerald)" />
                <span>Export Active Roster ({employees.length} Staff)</span>
              </button>
            </div>

            {/* File Upload Box */}
            <div style={{ background: 'var(--bg-surface-elevated)', border: '2px dashed var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.75rem', textAlign: 'center', position: 'relative' }}>
              <Upload size={28} color="var(--accent-primary)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {csvFileName ? `Selected: ${csvFileName}` : 'Choose or Drop Workforce CSV File'}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Accepts standard CSV with columns: fullName, email, designation, departmentName, joinedDate, officeLocation
              </p>
              <input 
                type="file"
                accept=".csv"
                onChange={handleCsvFileUpload}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
            </div>

            {/* Alerts */}
            {csvError && (
              <div style={{ marginTop: '0.85rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', fontSize: '0.8rem' }}>
                ⚠️ {csvError}
              </div>
            )}
            {csvSuccess && (
              <div style={{ marginTop: '0.85rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>
                {csvSuccess}
              </div>
            )}

            {/* Preview of Parsed Rows */}
            {csvParsed && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Preview: {csvParsed.rows.length} Employees Parsed
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="csvMode" 
                        value="append" 
                        checked={csvMode === 'append'} 
                        onChange={() => setCsvMode('append')}
                      />
                      <span>Append to Roster</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="csvMode" 
                        value="replace" 
                        checked={csvMode === 'replace'} 
                        onChange={() => setCsvMode('replace')}
                      />
                      <span style={{ color: 'var(--accent-rose)' }}>Replace Existing</span>
                    </label>
                  </div>
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.45rem 0.65rem' }}>Full Name</th>
                        <th style={{ padding: '0.45rem 0.65rem' }}>Designation</th>
                        <th style={{ padding: '0.45rem 0.65rem' }}>Department</th>
                        <th style={{ padding: '0.45rem 0.65rem' }}>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvParsed.rows.slice(0, 5).map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.45rem 0.65rem', fontWeight: 600 }}>{r.fullName}</td>
                          <td style={{ padding: '0.45rem 0.65rem' }}>{r.designation}</td>
                          <td style={{ padding: '0.45rem 0.65rem' }}>{r.departmentName}</td>
                          <td style={{ padding: '0.45rem 0.65rem', color: 'var(--text-muted)' }}>{r.officeLocation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvParsed.rows.length > 5 && (
                    <div style={{ padding: '0.4rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-surface)' }}>
                      + {csvParsed.rows.length - 5} more employees in file
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setCsvParsed(null); setCsvFileName(''); }}
                  >
                    Clear File
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    style={{ fontWeight: 800 }}
                    onClick={handleApplyCsvImport}
                  >
                    Import {csvParsed.rows.length} Employees Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
