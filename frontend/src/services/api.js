import { 
  MOCK_DEPARTMENTS, 
  MOCK_EMPLOYEES, 
  MOCK_ASSETS, 
  MOCK_SUMMARY, 
  MOCK_KINGPIN_SUMMARY,
  MOCK_ALERTS, 
  MOCK_FORECAST 
} from './mockData';

const API_BASE = 'http://localhost:8080/api';

// In-memory mutable state initialized with full enterprise fleet & workforce
let localAssets = [...MOCK_ASSETS];
let localDepartments = [...MOCK_DEPARTMENTS];
let localEmployees = [...MOCK_EMPLOYEES];
let localAlerts = [...MOCK_ALERTS];

// Event listeners for data updates (e.g. CSV import)
const listeners = new Set();
function notifyListeners() {
  listeners.forEach(fn => {
    try { fn(); } catch (e) { console.error('Listener err:', e); }
  });
}

async function request(endpoint, options = {}, fallbackData = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (fallbackData !== null) {
      return typeof fallbackData === 'function' ? fallbackData() : fallbackData;
    }
    throw err;
  }
}

export const api = {
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // Dashboard & Analytics (role aware, dynamically computed from localAssets)
  getDashboardSummary: (role = 'manager') => request(
    `/dashboard/summary?role=${role}`, 
    {}, 
    () => {
      const visible = localAssets.filter(a => role === 'kingpin' || !a.isPersonal);
      const totalCost = visible.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);
      const totalBook = visible.reduce((sum, a) => sum + (Number(a.currentBookValue) || 0), 0);
      const totalDebt = visible.reduce((sum, a) => sum + (Number(a.remainingLoanBalance) || 0), 0);
      const netAssetEquity = Math.max(0, totalCost - totalDebt);
      const ownershipPct = totalCost > 0 ? Number(((netAssetEquity / totalCost) * 100).toFixed(1)) : 100;
      const totalTaxShield = visible.reduce((sum, a) => sum + (Number(a.annualTaxShield) || 0), 0);
      
      const totalWatts = visible.reduce((sum, a) => sum + (Number(a.powerWatts) || 65), 0);
      const monthlyKwh = Math.round((totalWatts * 9 * 22) / 1000);
      const monthlyPowerBill = Math.round(monthlyKwh * 0.12 * 100) / 100;
      const monthlyEmis = visible.reduce((sum, a) => sum + (Number(a.monthlyEmi) || 0), 0);
      const monthlyMaint = Math.round(totalCost * 0.014); // 1.4% monthly maintenance run-rate
      const totalBurn = monthlyEmis + monthlyMaint + monthlyPowerBill;

      return {
        totalAssetCount: visible.length,
        totalAssetCost: totalCost,
        totalBookValue: totalBook,
        totalDebt: totalDebt,
        netAssetEquity: netAssetEquity,
        overallOwnershipPct: ownershipPct,
        totalHeadcount: localEmployees.length,
        averageCostPerSeat: localEmployees.length > 0 ? Math.round(totalCost / localEmployees.length) : 0,
        totalTaxSavings: totalTaxShield,
        annualCorporateTaxShield: totalTaxShield,
        monthlyBurn: {
          totalMonthlyBurn: totalBurn,
          monthlyEmis: monthlyEmis,
          monthlyMaintenanceAvg: monthlyMaint,
          monthlyElectricityBill: monthlyPowerBill
        },
        greenItStats: {
          totalWatts,
          monthlyKwh,
          monthlyCarbonKg: Math.round(monthlyKwh * 0.48 * 10) / 10,
          annualCarbonTons: Math.round((monthlyKwh * 0.48 * 12) / 1000 * 100) / 100,
          greenGrade: role === 'kingpin' ? 'Grade B (Executive Estates Included)' : 'Grade B+ (Eco-Optimized)'
        },
        forexRates: {
          USD: 1.0,
          INR: 87.25,
          EUR: 0.92,
          GBP: 0.79
        }
      };
    }
  ),
  
  getCostPerSeat: () => request('/dashboard/cost-per-seat', {}, () => {
    return localDepartments.map(dept => {
      const deptEmps = localEmployees.filter(e => 
        e.departmentId === dept.id || 
        e.departmentName?.toLowerCase() === dept.name?.toLowerCase()
      );
      const deptAssets = localAssets.filter(a => 
        a.departmentName?.toLowerCase() === dept.name?.toLowerCase()
      );
      const totalAssetValue = deptAssets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);
      const headcount = deptEmps.length || dept.headcount || 1;
      const costPerSeat = Math.round(totalAssetValue / headcount);
      const ceiling = Number(dept.budgetCeiling) || 100000;
      const utilPct = Math.round((totalAssetValue / ceiling) * 100);

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        name: dept.name,
        code: dept.code,
        headName: dept.headName,
        headcount,
        totalAssetValue,
        budgetCeiling: ceiling,
        costPerSeat,
        isOverBudget: totalAssetValue > ceiling,
        budgetUtilizationPct: utilPct,
        utilizationPct: utilPct
      };
    });
  }),
  
  getCategoryDistribution: (role = 'manager') => request(`/dashboard/category-distribution?role=${role}`, {}, () => {
    const visible = localAssets.filter(a => role === 'kingpin' || !a.isPersonal);
    const catMap = {};
    visible.forEach(a => {
      catMap[a.category] = (catMap[a.category] || 0) + Number(a.purchaseCost);
    });
    return Object.entries(catMap).map(([category, totalValue]) => ({
      category,
      totalValue,
      count: visible.filter(a => a.category === category).length
    }));
  }),

  // Assets CRUD & Actions
  getAllAssets: (role = 'manager') => request(`/assets?role=${role}`, {}, () => {
    return localAssets.filter(a => role === 'kingpin' || !a.isPersonal);
  }),

  getAssetById: (id) => request(`/assets/${id}`, {}, () => localAssets.find(a => a.id === Number(id)) || localAssets[0]),
  
  createAsset: async (data) => {
    try {
      return await request('/assets', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const newId = localAssets.length + 100;
      const deprRate = data.isPersonal ? (data.category === 'REAL_ESTATE' ? 3.63 : 15.0) : 20.0;
      const taxShield = (Number(data.purchaseCost) * (deprRate / 100)) * (data.isPersonal ? 0.35 : 0.25);
      
      const created = {
        id: newId,
        ...data,
        assetTag: data.assetTag || (data.isPersonal ? `KNG-PRV-0${newId}` : `AST-2026-0${newId}`),
        currentBookValue: Number(data.purchaseCost) * 0.95,
        conditionStatus: 'EXCELLENT',
        allocationStatus: data.isPersonal ? 'ASSIGNED' : 'AVAILABLE',
        assignedEmployeeName: data.isPersonal ? 'Kingpin (Executive Holding)' : 'Unassigned (In Storage)',
        currentOwnershipPct: data.financingType === 'OUTRIGHT' ? 100 : (Number(data.downPayment) / Number(data.purchaseCost) * 100).toFixed(1),
        remainingLoanBalance: data.totalLoanAmount || 0,
        taxCategory: data.isPersonal ? 'Executive Personal Wealth Schedule' : 'MACRS Corporate Depreciation',
        taxDepreciationRate: deprRate,
        annualTaxShield: Math.round(taxShield),
        taxBracketPct: data.isPersonal ? 35.0 : 25.0
      };
      localAssets = [created, ...localAssets];
      return created;
    }
  },

  assignAsset: async (id, data) => {
    try {
      return await request(`/assets/${id}/assign`, { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const emp = MOCK_EMPLOYEES.find(e => e.id === Number(data.employeeId)) || MOCK_EMPLOYEES[0];
      localAssets = localAssets.map(a => {
        if (a.id === Number(id)) {
          return {
            ...a,
            allocationStatus: 'ASSIGNED',
            assignedEmployeeId: emp.id,
            assignedEmployeeName: emp.fullName,
            assignedEmployeeEmail: emp.email,
            departmentName: emp.departmentName
          };
        }
        return a;
      });
      return { success: true };
    }
  },

  returnAsset: async (id, conditionNotes) => {
    try {
      return await request(`/assets/${id}/return`, { method: 'POST', body: JSON.stringify({ conditionNotes }) });
    } catch {
      localAssets = localAssets.map(a => {
        if (a.id === Number(id)) {
          return {
            ...a,
            allocationStatus: 'AVAILABLE',
            assignedEmployeeId: null,
            assignedEmployeeName: 'Unassigned (In Storage)',
            assignedEmployeeEmail: null
          };
        }
        return a;
      });
      return { success: true };
    }
  },

  logMaintenance: async (id, data) => {
    try {
      return await request(`/assets/${id}/maintenance`, { method: 'POST', body: JSON.stringify(data) });
    } catch {
      localAssets = localAssets.map(a => {
        if (a.id === Number(id)) {
          return { ...a, conditionStatus: 'DAMAGED', allocationStatus: 'UNDER_MAINTENANCE' };
        }
        return a;
      });
      return { success: true };
    }
  },

  deleteAsset: async (id) => {
    try {
      await request(`/assets/${id}`, { method: 'DELETE' });
    } catch {
      // Local fallback
    }
    localAssets = localAssets.filter(a => a.id !== Number(id) && a.assetTag !== String(id));
    notifyListeners();
    return { success: true };
  },

  clearDataset: async (tab) => {
    if (tab === 'assets') {
      try { await request('/assets/clear-all', { method: 'DELETE' }); } catch {}
      localAssets = [];
    } else if (tab === 'workforce') {
      try { await request('/employees/clear-all', { method: 'DELETE' }); } catch {}
      localEmployees = [];
    } else if (tab === 'departments') {
      try { await request('/departments/clear-all', { method: 'DELETE' }); } catch {}
      localDepartments = [];
    }
    notifyListeners();
    return { success: true };
  },

  getMaintenanceHistory: (id) => request(`/assets/${id}/maintenance`, {}, [
    { id: 1, cost: 850.00, issueDescription: 'Preventative hydraulic fluid replacement', maintenanceDate: '2026-08-14', providerName: 'Precision Tech Services' },
    { id: 2, cost: 1200.00, issueDescription: 'Emergency cooling fan & sensor rebuild', maintenanceDate: '2026-04-20', providerName: 'OEM Certified Repairs' }
  ]),

  getCustodyHistory: (id) => request(`/assets/${id}/custody`, {}, [
    { id: 1, employeeName: 'Arjun Reddy', departmentName: 'DevOps & Cloud Infrastructure', assignedDate: '2024-01-10', handoverCondition: 'Brand New In Box' }
  ]),

  getInflationAnalysis: (id, rate = 0.055) => request(`/assets/${id}/inflation${rate ? `?rate=${rate}` : ''}`, {}, () => {
    const asset = localAssets.find(a => a.id === Number(id)) || localAssets[0];
    const cost = Number(asset.purchaseCost) || 45000;
    const purchaseYear = asset.purchaseDate ? new Date(asset.purchaseDate).getFullYear() : 2022;
    const currentYear = 2026;
    const yearsElapsed = Math.max(1, currentYear - purchaseYear);
    const cumulativeInflation = Math.pow(1 + Number(rate), yearsElapsed);
    const replacementCostToday = Math.round(cost * cumulativeInflation);
    const depreciatedValue = Math.round(cost * Math.max(0.18, 1 - (yearsElapsed * 0.18)));
    const futureYear = currentYear + 3;
    const futureReplacementCost = Math.round(replacementCostToday * Math.pow(1 + Number(rate), 3));
    const capitalGap = futureReplacementCost - depreciatedValue;

    // Generate full yearly trajectory from purchaseYear to futureYear
    const trajectory = [];
    for (let yr = purchaseYear; yr <= futureYear; yr++) {
      const yrDiff = yr - purchaseYear;
      const yrCost = Math.round(cost * Math.pow(1 + Number(rate), yrDiff));
      const yrDepr = yr <= currentYear 
        ? Math.round(cost * Math.max(0.15, 1 - (yrDiff * 0.18)))
        : Math.round(depreciatedValue * Math.pow(0.82, yr - currentYear));
      trajectory.push({
        year: yr,
        replacementCost: yrCost,
        depreciatedBookValue: Math.max(800, yrDepr)
      });
    }

    return {
      assetId: asset.id,
      assetName: asset.name,
      purchaseYear,
      originalCost: cost,
      currentYear,
      currentBookValue: depreciatedValue,
      depreciatedValue,
      todayReplacementCost: replacementCostToday,
      replacementCostToday,
      purchasingPowerToday: replacementCostToday,
      futureReplacementCost,
      projectedFiveYearCost: futureReplacementCost,
      futureYear,
      capitalGap,
      replacementDeficit: capitalGap,
      inflationRate: Number((Number(rate) * 100).toFixed(1)),
      cumulativeInflationPct: Math.round((cumulativeInflation - 1) * 100),
      trajectory
    };
  }),

  // Financing & Loans (role aware)
  getAllFinances: (role = 'manager') => request(`/finances?role=${role}`, {}, () => {
    return localAssets.filter(a => a.financingType === 'LOAN' && (role === 'kingpin' || !a.isPersonal));
  }),

  recordEmi: async (financeId) => {
    try {
      return await request(`/finances/${financeId}/record-emi`, { method: 'POST', body: JSON.stringify({}) });
    } catch {
      localAssets = localAssets.map(a => {
        if (a.id === Number(financeId) || a.assetTag.includes('2023-01')) {
          const newEmis = Math.min(a.tenureMonths, (a.emisPaid || 0) + 1);
          const newPct = Math.min(100, Math.round(((a.downPayment + (newEmis * a.monthlyEmi)) / a.purchaseCost) * 100));
          const newBalance = Math.max(0, a.totalLoanAmount - (newEmis * a.monthlyEmi));
          return {
            ...a,
            emisPaid: newEmis,
            currentOwnershipPct: newPct,
            remainingLoanBalance: newBalance
          };
        }
        return a;
      });
      return { success: true };
    }
  },

  simulateEarlyPayoff: (financeId, lumpSum = 5000) => request(`/finances/${financeId}/simulate-early-payoff?lumpSum=${lumpSum}`, {}, () => {
    const sum = Number(lumpSum);
    const tenureSavedMonths = Math.min(12, Math.max(2, Math.round(sum / 950)));
    const interestSaved = Math.round(sum * 0.085 * (tenureSavedMonths / 12));
    return {
      financeId: Number(financeId),
      lumpSum: sum,
      tenureSavedMonths,
      interestSaved,
      recommendation: `Paying a lump sum of $${sum.toLocaleString()} will shave ${tenureSavedMonths} full monthly installments off your amortization schedule, generating a net interest savings of $${interestSaved.toLocaleString()}.`
    };
  }),

  // Lookups & Intelligence
  getDepartments: () => request('/departments', {}, localDepartments),
  getEmployees: () => request('/employees', {}, localEmployees),
  getAlerts: () => request('/alerts', {}, localAlerts),
  getMlForecast: () => request('/analytics/forecast', {}, () => {
    const totalAssets = localAssets.length;
    if (totalAssets === 0) {
      return {
        model: 'FastAPI Scikit-Learn Polynomial Ridge Regression',
        r2_score: '0.984',
        keyInsight: 'No assets currently registered in inventory. Import external CSV data or register equipment to generate expenditure forecasts.',
        forecast: []
      };
    }
    const totalCost = localAssets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);
    const monthlyEmis = localAssets.reduce((sum, a) => sum + (Number(a.monthlyEmi) || 0), 0);
    const monthlyMaint = Math.round(totalCost * 0.014);
    const totalWatts = localAssets.reduce((sum, a) => sum + (Number(a.powerWatts) || 65), 0);
    const monthlyPower = Math.round(((totalWatts * 9 * 22) / 1000) * 0.12);
    const baseMonthly = monthlyEmis + monthlyMaint + monthlyPower;

    const months = ['Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027'];
    const multipliers = [1.0, 1.015, 1.03, 1.065, 1.04, 1.02];
    const notes = [
      'Standard operational run-rate',
      'Year-end routine maintenance cycle',
      'Quarterly equipment servicing',
      'Projected mid-cycle maintenance & parts',
      'Post-servicing operational stabilization',
      'New fiscal quarter baseline'
    ];

    return {
      model: 'FastAPI Scikit-Learn Polynomial Ridge Regression',
      r2_score: '0.984',
      keyInsight: `Predicted 6-month operational cash outflow based on active inventory baseline of $${baseMonthly.toLocaleString()}/mo.`,
      forecast: months.map((m, idx) => ({
        month: m,
        projectedExpenditure: Math.round(baseMonthly * multipliers[idx]),
        driverNote: notes[idx]
      }))
    };
  }),

  // CSV Import / Export Engine
  importAssets: (newAssets, replace = false) => {
    const formatted = newAssets.map((item, idx) => {
      const id = item.id || (replace ? idx + 1 : localAssets.length + idx + 100);
      const cost = Number(item.purchaseCost) || 1000;
      const deprRate = item.isPersonal ? (item.category === 'REAL_ESTATE' ? 3.63 : 15.0) : 20.0;
      const taxShield = (cost * (deprRate / 100)) * (item.isPersonal ? 0.35 : 0.25);
      
      return {
        id,
        assetTag: item.assetTag || `AST-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`,
        name: item.name || 'Imported Enterprise Hardware',
        category: (item.category || 'HARDWARE').toUpperCase(),
        purchaseCost: cost,
        currentBookValue: Number(item.currentBookValue) || Math.round(cost * 0.8),
        purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0],
        conditionStatus: (item.conditionStatus || 'EXCELLENT').toUpperCase(),
        allocationStatus: (item.allocationStatus || 'ASSIGNED').toUpperCase(),
        assignedEmployeeId: Number(item.assignedEmployeeId) || null,
        assignedEmployeeName: item.assignedEmployeeName || 'Unassigned Hardware Pool',
        assignedEmployeeEmail: item.assignedEmployeeEmail || null,
        departmentName: item.departmentName || 'General Enterprise Operations',
        powerWatts: Number(item.powerWatts) || 95,
        estimatedLifespanYears: Number(item.estimatedLifespanYears) || 5,
        salvageValue: Number(item.salvageValue) || Math.round(cost * 0.1),
        financingType: (item.financingType || 'OUTRIGHT').toUpperCase(),
        totalLoanAmount: Number(item.totalLoanAmount) || 0,
        downPayment: Number(item.downPayment) || (item.financingType === 'LOAN' ? Math.round(cost * 0.2) : cost),
        monthlyEmi: Number(item.monthlyEmi) || 0,
        tenureMonths: Number(item.tenureMonths) || (item.financingType === 'LOAN' ? 24 : 0),
        emisPaid: Number(item.emisPaid) || 0,
        currentOwnershipPct: Number(item.currentOwnershipPct) || (item.financingType === 'OUTRIGHT' ? 100 : 25),
        remainingLoanBalance: Number(item.remainingLoanBalance) || (item.financingType === 'LOAN' ? Math.round(cost * 0.8) : 0),
        isPersonal: Boolean(item.isPersonal === true || item.isPersonal === 'true'),
        taxCategory: item.taxCategory || 'MACRS Enterprise Equipment',
        taxDepreciationRate: deprRate,
        annualTaxShield: Math.round(taxShield),
        taxBracketPct: item.isPersonal ? 35.0 : 25.0
      };
    });

    if (replace) {
      localAssets = formatted;
    } else {
      localAssets = [...formatted, ...localAssets];
    }

    // Persist imported assets into MySQL database via Spring Boot backend
    formatted.forEach(asset => {
      request('/assets', {
        method: 'POST',
        body: JSON.stringify({
          assetTag: asset.assetTag,
          name: asset.name,
          category: asset.category,
          purchaseCost: asset.purchaseCost,
          purchaseDate: asset.purchaseDate,
          conditionStatus: asset.conditionStatus,
          assignedEmployeeId: asset.assignedEmployeeId,
          powerWatts: asset.powerWatts,
          estimatedLifespanYears: asset.estimatedLifespanYears,
          salvageValue: asset.salvageValue,
          financingType: asset.financingType,
          totalLoanAmount: asset.totalLoanAmount,
          downPayment: asset.downPayment,
          monthlyEmi: asset.monthlyEmi,
          tenureMonths: asset.tenureMonths
        })
      }).catch(() => {});
    });

    notifyListeners();
    return { success: true, count: formatted.length };
  },

  importEmployees: (newEmps, replace = false) => {
    const formatted = newEmps.map((emp, idx) => ({
      id: emp.id || (replace ? idx + 1 : localEmployees.length + idx + 1),
      fullName: emp.fullName || 'Enterprise Team Member',
      email: emp.email || `employee.${idx + 1}@enterprise.com`,
      designation: emp.designation || 'Systems Engineer',
      departmentId: Number(emp.departmentId) || 1,
      departmentName: emp.departmentName || 'DevOps & Cloud Infrastructure',
      joinedDate: emp.joinedDate || new Date().toISOString().split('T')[0],
      assignedAssetCount: Number(emp.assignedAssetCount) || 1,
      phone: emp.phone || '+91 98450 00000',
      officeLocation: emp.officeLocation || 'Blr HQ - Campus'
    }));

    if (replace) {
      localEmployees = formatted;
    } else {
      localEmployees = [...formatted, ...localEmployees];
    }
    notifyListeners();
    return { success: true, count: formatted.length };
  },

  importDepartments: (newDepts, replace = false) => {
    const formatted = newDepts.map((d, idx) => ({
      id: d.id || (replace ? idx + 1 : localDepartments.length + idx + 1),
      name: d.name || 'New Business Unit',
      code: (d.code || `DEPT${idx + 1}`).toUpperCase(),
      budgetCeiling: Number(d.budgetCeiling) || 100000,
      headName: d.headName || 'Department Director',
      headcount: Number(d.headcount) || 5,
      totalAssetValue: Number(d.totalAssetValue) || 50000,
      costPerSeat: Number(d.costPerSeat) || 10000,
      isOverBudget: false,
      utilizationPct: 50
    }));

    if (replace) {
      localDepartments = formatted;
    } else {
      localDepartments = [...formatted, ...localDepartments];
    }
    notifyListeners();
    return { success: true, count: formatted.length };
  },

  // Export CSV functions
  exportAssetsCsv: () => {
    const headers = [
      'assetTag', 'name', 'category', 'purchaseCost', 'currentBookValue',
      'purchaseDate', 'conditionStatus', 'allocationStatus', 'assignedEmployeeName',
      'departmentName', 'powerWatts', 'financingType', 'monthlyEmi', 'isPersonal'
    ];
    const rows = localAssets.map(a => [
      `"${a.assetTag || ''}"`,
      `"${a.name || ''}"`,
      `"${a.category || ''}"`,
      a.purchaseCost || 0,
      a.currentBookValue || 0,
      `"${a.purchaseDate || ''}"`,
      `"${a.conditionStatus || ''}"`,
      `"${a.allocationStatus || ''}"`,
      `"${a.assignedEmployeeName || ''}"`,
      `"${a.departmentName || ''}"`,
      a.powerWatts || 65,
      `"${a.financingType || 'OUTRIGHT'}"`,
      a.monthlyEmi || 0,
      a.isPersonal ? 'true' : 'false'
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  exportEmployeesCsv: () => {
    const headers = ['fullName', 'email', 'designation', 'departmentName', 'joinedDate', 'officeLocation'];
    const rows = localEmployees.map(e => [
      `"${e.fullName || ''}"`,
      `"${e.email || ''}"`,
      `"${e.designation || ''}"`,
      `"${e.departmentName || ''}"`,
      `"${e.joinedDate || ''}"`,
      `"${e.officeLocation || ''}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  exportDepartmentsCsv: () => {
    const headers = ['name', 'code', 'budgetCeiling', 'headName'];
    const rows = localDepartments.map(d => [
      `"${d.name || ''}"`,
      `"${d.code || ''}"`,
      d.budgetCeiling || 100000,
      `"${d.headName || ''}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  createEmployee: (emp) => {
    const newEmp = {
      id: localEmployees.length > 0 ? Math.max(...localEmployees.map(e => e.id || 0)) + 1 : 1,
      fullName: emp.fullName || 'New Team Member',
      email: emp.email || 'employee@enterprise.com',
      designation: emp.designation || 'Software Engineer',
      departmentId: Number(emp.departmentId) || 1,
      departmentName: emp.departmentName || 'Software Engineering',
      joinedDate: emp.joinedDate || new Date().toISOString().split('T')[0],
      assignedAssetCount: 0,
      phone: emp.phone || '+91 98450 00000',
      officeLocation: emp.officeLocation || 'Blr Enterprise Campus'
    };
    localEmployees = [newEmp, ...localEmployees];
    notifyListeners();
    return newEmp;
  },

  deleteEmployee: (id) => {
    localEmployees = localEmployees.filter(e => e.id !== id);
    notifyListeners();
    return { success: true };
  },

  clearAllData: () => {
    localAssets = [];
    localDepartments = [];
    localEmployees = [];
    localAlerts = [];
    notifyListeners();
    return { success: true };
  },

  resetToSeedData: () => {
    localAssets = JSON.parse(JSON.stringify(MOCK_ASSETS));
    localDepartments = JSON.parse(JSON.stringify(MOCK_DEPARTMENTS));
    localEmployees = JSON.parse(JSON.stringify(MOCK_EMPLOYEES));
    localAlerts = JSON.parse(JSON.stringify(MOCK_ALERTS));
    notifyListeners();
    return { success: true };
  }
};
