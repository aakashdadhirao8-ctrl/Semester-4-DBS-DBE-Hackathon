import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Layers, 
  Users, 
  Building2,
  Table,
  RefreshCw,
  Plus,
  Trash2,
  Filter
} from 'lucide-react';
import { api } from '../services/api';

export default function CsvDataManager({ isOpen, onClose, onDataImported }) {
  const [activeTab, setActiveTab] = useState('assets'); // 'assets', 'workforce', 'departments'
  const [importMode, setImportMode] = useState('append'); // 'append' or 'replace'
  const [parsedData, setParsedData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [excludedColumns, setExcludedColumns] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Simple, robust CSV parser handling quotes and commas
  const parseCsvText = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV must contain a header row and at least one data row.');
    }

    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(col => col.replace(/^["']|["']$/g, ''));
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(line => {
      const values = parseLine(line);
      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] !== undefined ? values[idx] : '';
      });
      return rowObj;
    });

    return { headers, rows };
  };

  const handleFileUpload = (e) => {
    setErrorMessage('');
    setSuccessMessage('');
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setExcludedColumns([]);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCsvText(text);
        setParsedData(parsed);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to parse CSV file. Please check file formatting.');
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleClearFile = () => {
    setParsedData(null);
    setFileName('');
    setExcludedColumns([]);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleRemoveRow = (indexToRemove) => {
    setParsedData(prev => {
      if (!prev) return null;
      const updatedRows = prev.rows.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, rows: updatedRows };
    });
  };

  const toggleExcludeColumn = (col) => {
    setExcludedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleWipeCurrentDataset = async () => {
    const tabName = activeTab === 'assets' ? 'Asset Fleet' : (activeTab === 'workforce' ? 'Workforce Staff' : 'Department Quotas');
    if (!confirm(`⚠️ DANGER: Are you sure you want to completely clear and wipe all ${tabName} records? This operation removes all active entries from the database.`)) {
      return;
    }
    try {
      await api.clearDataset(activeTab);
      setSuccessMessage(`✓ All live ${tabName} records have been successfully purged.`);
      if (onDataImported) onDataImported();
    } catch (err) {
      setErrorMessage(`Failed to clear dataset: ${err.message}`);
    }
  };

  const handleApplyImport = () => {
    if (!parsedData || parsedData.rows.length === 0) return;

    // Filter out excluded columns from each row
    const rowsToImport = parsedData.rows.map(row => {
      const filtered = { ...row };
      excludedColumns.forEach(col => {
        delete filtered[col];
      });
      return filtered;
    });

    try {
      let res;
      if (activeTab === 'assets') {
        res = api.importAssets(rowsToImport, importMode === 'replace');
      } else if (activeTab === 'workforce') {
        res = api.importEmployees(rowsToImport, importMode === 'replace');
      } else if (activeTab === 'departments') {
        res = api.importDepartments(rowsToImport, importMode === 'replace');
      }

      setSuccessMessage(`✓ Successfully imported ${res?.count || rowsToImport.length} ${activeTab} records (${importMode} mode).`);
      setParsedData(null);
      setFileName('');
      setExcludedColumns([]);
      if (onDataImported) onDataImported();
    } catch (err) {
      setErrorMessage(`Import error: ${err.message}`);
    }
  };

  // Trigger browser download for a string
  const triggerDownload = (filename, content) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Template Downloads with Comprehensive Enterprise Datasets
  const downloadAssetTemplate = () => {
    const template = `assetTag,name,category,purchaseCost,currentBookValue,purchaseDate,conditionStatus,allocationStatus,assignedEmployeeName,departmentName,powerWatts,financingType,monthlyEmi,isPersonal
SRV-NV-2025-01,"NVIDIA DGX H100 AI Supercomputer",SERVER,48000,42000,2025-01-10,EXCELLENT,ASSIGNED,Arjun Reddy,DevOps & Cloud Infrastructure,1200,LOAN,1650,false
SRV-DL-2024-02,"Dell PowerEdge R760 64TB Rack Server",SERVER,28500,24000,2024-08-15,EXCELLENT,ASSIGNED,Divya Sharma,DevOps & Cloud Infrastructure,750,LOAN,980,false
FLT-EV-2024-03,"BYD e6 Electric Executive Delivery Van",VEHICLE,34000,29500,2024-05-20,EXCELLENT,ASSIGNED,Karthik Nair,Corporate Logistics & Fleet,3500,LOAN,720,false
FLT-TS-2025-04,"Tesla Model Y Commercial Fleet SUV",VEHICLE,42000,38000,2025-02-01,EXCELLENT,ASSIGNED,Deepak Nambiar,Corporate Logistics & Fleet,3800,LOAN,890,false
MAC-M4-2025-05,"Apple MacBook Pro 16"" M4 Max 64GB",HARDWARE,4800,4500,2025-01-20,EXCELLENT,ASSIGNED,Sneha Rao,Software Engineering,96,OUTRIGHT,0,false
WRK-DL-2024-06,"Dell Precision 7780 Mobile Workstation",HARDWARE,4200,3600,2024-09-10,GOOD,ASSIGNED,Vikramaditya Roy,Software Engineering,180,OUTRIGHT,0,false
THK-X1-2024-07,"Lenovo ThinkPad X1 Carbon Gen 12",HARDWARE,2600,2100,2024-06-12,EXCELLENT,ASSIGNED,Rohan Verma,Software Engineering,65,OUTRIGHT,0,false
DSG-MB-2024-08,"Apple MacBook Pro 14"" M3 Pro 32GB",HARDWARE,2900,2400,2024-07-05,GOOD,ASSIGNED,Meera Iyer,Product & UI/UX Design,70,OUTRIGHT,0,false
GEN-CT-2023-09,"Caterpillar 500kVA Industrial Backup Generator",MACHINERY,75000,62000,2023-11-18,GOOD,ASSIGNED,Karthik Nair,Corporate Logistics & Fleet,4500,LOAN,1450,false
CNC-FN-2024-10,"Fanuc Robodrill High-Precision Milling Unit",MACHINERY,68000,58000,2024-03-25,EXCELLENT,AVAILABLE,,Corporate Logistics & Fleet,5200,LOAN,1320,false
DSP-DL-2024-11,"Dell UltraSharp 32"" 4K USB-C Hub Monitor Fleet",OFFICE_EQUIPMENT,9500,8100,2024-04-14,EXCELLENT,ASSIGNED,Siddharth Sen,Product & UI/UX Design,120,OUTRIGHT,0,false
EST-CP-2023-12,"Corporate Innovation Campus - Block B",REAL_ESTATE,2400000,2320000,2023-04-01,EXCELLENT,ASSIGNED,Suresh Menon,Executive & Finance,12000,LOAN,18500,false
EST-PH-2024-13,"Obsidian Sovereign Penthouse Suite",REAL_ESTATE,1850000,1810000,2024-01-10,EXCELLENT,ASSIGNED,,Executive & Finance,8500,LOAN,14200,true
JET-GL-2023-14,"Gulfstream G280 Executive Aviation Jet",REAL_ESTATE,4800000,4500000,2023-08-20,EXCELLENT,AVAILABLE,,Executive & Finance,25000,LOAN,38500,true`;
    triggerDownload('assets_template.csv', template);
  };

  const downloadWorkforceTemplate = () => {
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
    triggerDownload('workforce_template.csv', template);
  };

  const downloadDepartmentsTemplate = () => {
    const template = `name,code,budgetCeiling,headName
"DevOps & Cloud Infrastructure",DEVOPS,180000,"Rajesh Varma"
"Software Engineering",ENGG,120000,"Ananya Sen"
"Corporate Logistics & Fleet",LOGISTICS,160000,"Vikram Rathore"
"Product & UI/UX Design",DESIGN,65000,"Priya Kulkarni"
"Executive & Finance",EXEC,95000,"Suresh Menon"
"Cybersecurity & Zero Trust",CYBER,110000,"Ravi Shankar"`;
    triggerDownload('departments_template.csv', template);
  };

  // Export Live Database
  const exportLiveCsv = () => {
    if (activeTab === 'assets') {
      triggerDownload(`live_assets_export_${new Date().toISOString().split('T')[0]}.csv`, api.exportAssetsCsv());
    } else if (activeTab === 'workforce') {
      triggerDownload(`live_workforce_export_${new Date().toISOString().split('T')[0]}.csv`, api.exportEmployeesCsv());
    } else if (activeTab === 'departments') {
      triggerDownload(`live_departments_export_${new Date().toISOString().split('T')[0]}.csv`, api.exportDepartmentsCsv());
    }
  };

  return (
    <div className="login-portal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="login-portal-card animate-in" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '880px', width: '94vw', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={20} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                ENTERPRISE DATA PIPELINE
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              Import & Export External CSV Data
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Load, filter, inspect, or wipe live corporate asset portfolios, workforce staff, and department budgets.
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '0.5rem', margin: '1.25rem 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => { setActiveTab('assets'); handleClearFile(); }}
            className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: activeTab === 'assets' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              background: activeTab === 'assets' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-elevated)',
              color: activeTab === 'assets' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Layers size={15} /> Asset Portfolio Fleet
          </button>

          <button
            onClick={() => { setActiveTab('workforce'); handleClearFile(); }}
            className={`tab-btn ${activeTab === 'workforce' ? 'active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: activeTab === 'workforce' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
              background: activeTab === 'workforce' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-elevated)',
              color: activeTab === 'workforce' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Users size={15} /> Workforce & Staff
          </button>

          <button
            onClick={() => { setActiveTab('departments'); handleClearFile(); }}
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              border: activeTab === 'departments' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              background: activeTab === 'departments' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-surface-elevated)',
              color: activeTab === 'departments' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Building2 size={15} /> Department Quotas
          </button>
        </div>

        {/* Action Banners: Download Template, Export Live, and Wipe Dataset */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-elevated)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Standard {activeTab.toUpperCase()} CSV Format
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Download pre-formatted enterprise templates, export live database tables, or wipe current records.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
              onClick={activeTab === 'assets' ? downloadAssetTemplate : (activeTab === 'workforce' ? downloadWorkforceTemplate : downloadDepartmentsTemplate)}
            >
              <Download size={14} /> Download Template (.CSV)
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
              onClick={exportLiveCsv}
            >
              <FileText size={14} /> Export Live {activeTab} (.CSV)
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.08)' }}
              onClick={handleWipeCurrentDataset}
              title="Wipe and clear all active records in this dataset"
            >
              <Trash2 size={14} color="#f87171" /> Wipe Current Dataset
            </button>
          </div>
        </div>

        {/* File Dropzone & Loaded File Banner */}
        {!fileName ? (
          <div style={{ 
            border: '2px dashed var(--border-strong)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1.75rem', 
            textAlign: 'center', 
            background: 'var(--bg-surface)', 
            position: 'relative',
            marginBottom: '1.25rem'
          }}>
            <input 
              type="file" 
              accept=".csv,text/csv" 
              onChange={handleFileUpload}
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                opacity: 0, 
                cursor: 'pointer' 
              }} 
            />
            <Upload size={28} color="var(--accent-primary)" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Choose or drag & drop {activeTab}.csv file
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Click or drag your standard industry CSV here to parse and inspect.
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '0.85rem 1.15rem', 
            background: 'rgba(99, 102, 241, 0.1)', 
            border: '1px solid var(--accent-primary)', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1.25rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <FileSpreadsheet size={20} color="var(--accent-primary)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  Loaded: {fileName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {parsedData?.rows?.length || 0} rows parsed • Ready for variable selection & pruning
                </div>
              </div>
            </div>

            <button 
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}
              onClick={handleClearFile}
              title="Discard loaded CSV file"
            >
              <X size={14} /> Clear / Discard File
            </button>
          </div>
        )}

        {/* Notifications */}
        {errorMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-rose)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', color: 'var(--accent-rose)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            <AlertTriangle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-emerald)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', color: 'var(--accent-emerald)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Parsed Preview Table with Row Deletion & Column Toggles */}
        {parsedData && (
          <div className="animate-in" style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--bg-surface-elevated)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  Parsed Preview ({parsedData.rows.length} Records Detected)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Click 🗑️ to delete any unwanted row before importing. Click variables below to toggle inclusion.
                </div>
              </div>

              {/* Mode choice */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="importMode" 
                    value="append" 
                    checked={importMode === 'append'} 
                    onChange={() => setImportMode('append')} 
                  />
                  <span>Append to existing</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="importMode" 
                    value="replace" 
                    checked={importMode === 'replace'} 
                    onChange={() => setImportMode('replace')} 
                  />
                  <span style={{ color: 'var(--accent-rose)' }}>Replace current dataset</span>
                </label>
              </div>
            </div>

            {/* Variable / Column Selection Pills */}
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Filter size={13} color="var(--accent-primary)" />
                <span>Schema Variables (Click pill to exclude / remove unwanted column from import):</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {parsedData.headers.map((h, i) => {
                  const isExcluded = excludedColumns.includes(h);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleExcludeColumn(h)}
                      style={{
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: isExcluded ? '1px dashed var(--border-medium)' : '1px solid var(--accent-primary)',
                        background: isExcluded ? 'transparent' : 'rgba(99, 102, 241, 0.15)',
                        color: isExcluded ? 'var(--text-dim)' : 'var(--accent-primary)',
                        textDecoration: isExcluded ? 'line-through' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                      title={isExcluded ? `Click to re-include ${h}` : `Click to exclude ${h} from import`}
                    >
                      <span>{h}</span>
                      <span>{isExcluded ? '＋' : '✕'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data Table with Remove Row button */}
            <div style={{ overflowX: 'auto', maxHeight: '250px' }}>
              <table className="data-table" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    {parsedData.headers.filter(h => !excludedColumns.includes(h)).slice(0, 7).map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                    <th style={{ textAlign: 'center', width: '70px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        All rows have been removed. Click Clear File to choose another CSV.
                      </td>
                    </tr>
                  ) : (
                    parsedData.rows.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ color: 'var(--text-dim)', fontWeight: 600 }}>{idx + 1}</td>
                        {parsedData.headers.filter(h => !excludedColumns.includes(h)).slice(0, 7).map((h, i) => (
                          <td key={i}>{row[h] || '—'}</td>
                        ))}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.68rem'
                            }}
                            title={`Remove row ${idx + 1}`}
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {parsedData.rows.length} record(s) queued • {excludedColumns.length} column(s) omitted
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.8rem' }}
                  onClick={handleClearFile}
                >
                  Discard All
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ fontSize: '0.8rem', background: 'var(--accent-primary)', color: '#FFFFFF' }}
                  onClick={handleApplyImport}
                  disabled={parsedData.rows.length === 0}
                >
                  Commit & Ingest {parsedData.rows.length} Records into Corporate Asset Management
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem' }}
            onClick={onClose}
          >
            Close Data Hub
          </button>
        </div>
      </div>
    </div>
  );
}
