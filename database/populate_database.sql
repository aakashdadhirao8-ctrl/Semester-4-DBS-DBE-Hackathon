USE corporate_asset_management;

-- 1. Populate Departments
INSERT INTO departments (id, name, code, budget_ceiling, head_name) VALUES
(1, 'DevOps & Cloud Infrastructure', 'DEVOPS', 180000.00, 'Rajesh Varma'),
(2, 'Software Engineering', 'ENGG', 120000.00, 'Ananya Sen'),
(3, 'Corporate Logistics & Fleet', 'LOGISTICS', 160000.00, 'Vikram Rathore'),
(4, 'Product & UI/UX Design', 'DESIGN', 65000.00, 'Priya Kulkarni'),
(5, 'Executive & Finance', 'EXEC', 95000.00, 'Suresh Menon'),
(6, 'Cybersecurity & Zero Trust', 'CYBER', 110000.00, 'Ravi Shankar')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name), 
    budget_ceiling = VALUES(budget_ceiling), 
    head_name = VALUES(head_name);

-- 2. Populate Employees
INSERT INTO employees (id, full_name, email, designation, department_id, joined_date) VALUES
(1, 'Arjun Reddy', 'arjun.reddy@enterprise.com', 'Principal Cloud Architect', 1, '2022-03-15'),
(2, 'Divya Sharma', 'divya.sharma@enterprise.com', 'Site Reliability Engineer', 1, '2024-02-15'),
(3, 'Vikramaditya Roy', 'vikram.roy@enterprise.com', 'Staff Infrastructure Specialist', 1, '2023-05-12'),
(4, 'Sneha Rao', 'sneha.rao@enterprise.com', 'Senior Full-Stack Engineer', 2, '2023-06-10'),
(5, 'Rohan Verma', 'rohan.verma@enterprise.com', 'VP of Engineering', 2, '2022-08-01'),
(6, 'Tanvi Mehra', 'tanvi.mehra@enterprise.com', 'Senior Systems Developer', 2, '2024-01-18'),
(7, 'Karthik Nair', 'karthik.nair@enterprise.com', 'Fleet & Operations Director', 3, '2021-11-01'),
(8, 'Deepak Nambiar', 'deepak.nambiar@enterprise.com', 'Supply Chain Systems Lead', 3, '2021-08-01'),
(9, 'Meera Iyer', 'meera.iyer@enterprise.com', 'Lead Product Designer', 4, '2023-01-20'),
(10, 'Siddharth Sen', 'siddharth.sen@enterprise.com', 'Senior Interaction Designer', 4, '2024-03-11'),
(11, 'Suresh Menon', 'suresh.menon@enterprise.com', 'Chief Financial Officer', 5, '2020-04-10'),
(12, 'Pooja Hegde', 'pooja.hegde@enterprise.com', 'Head of Treasury & Capital Compliance', 5, '2022-09-01')
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    designation = VALUES(designation),
    department_id = VALUES(department_id),
    joined_date = VALUES(joined_date);

-- 3. Populate Corporate Physical Assets
INSERT INTO assets (id, asset_tag, name, category, purchase_cost, purchase_date, condition_status, allocation_status, assigned_employee_id, power_watts, estimated_lifespan_years, salvage_value) VALUES
(1, 'SRV-NV-2025-01', 'NVIDIA DGX H100 AI Supercomputer', 'SERVER', 48000.00, '2025-01-10', 'EXCELLENT', 'ASSIGNED', 1, 1200, 5, 5000.00),
(2, 'SRV-DL-2024-02', 'Dell PowerEdge R760 64TB Rack Server', 'SERVER', 28500.00, '2024-08-15', 'EXCELLENT', 'ASSIGNED', 2, 750, 5, 3000.00),
(3, 'FLT-EV-2024-03', 'BYD e6 Electric Executive Delivery Van', 'VEHICLE', 34000.00, '2024-05-20', 'EXCELLENT', 'ASSIGNED', 7, 3500, 7, 4500.00),
(4, 'FLT-TS-2025-04', 'Tesla Model Y Commercial Fleet SUV', 'VEHICLE', 42000.00, '2025-02-01', 'EXCELLENT', 'ASSIGNED', 8, 3800, 7, 5000.00),
(5, 'MAC-M4-2025-05', 'Apple MacBook Pro 16" M4 Max 64GB', 'HARDWARE', 4800.00, '2025-01-20', 'EXCELLENT', 'ASSIGNED', 4, 96, 4, 600.00),
(6, 'WRK-DL-2024-06', 'Dell Precision 7780 Mobile Workstation', 'HARDWARE', 4200.00, '2024-09-10', 'GOOD', 'ASSIGNED', 3, 180, 4, 500.00),
(7, 'THK-X1-2024-07', 'Lenovo ThinkPad X1 Carbon Gen 12', 'HARDWARE', 2600.00, '2024-06-12', 'EXCELLENT', 'ASSIGNED', 5, 65, 4, 350.00),
(8, 'DSG-MB-2024-08', 'Apple MacBook Pro 14" M3 Pro 32GB', 'HARDWARE', 2900.00, '2024-07-05', 'GOOD', 'ASSIGNED', 9, 70, 4, 400.00),
(9, 'GEN-CT-2023-09', 'Caterpillar 500kVA Industrial Backup Generator', 'MACHINERY', 75000.00, '2023-11-18', 'GOOD', 'ASSIGNED', 7, 4500, 10, 8000.00),
(10, 'CNC-FN-2024-10', 'Fanuc Robodrill High-Precision Milling Unit', 'MACHINERY', 68000.00, '2024-03-25', 'EXCELLENT', 'AVAILABLE', NULL, 5200, 8, 7000.00),
(11, 'DSP-DL-2024-11', 'Dell UltraSharp 32" 4K USB-C Hub Monitor Fleet', 'OFFICE_EQUIPMENT', 9500.00, '2024-04-14', 'EXCELLENT', 'ASSIGNED', 10, 120, 5, 1000.00),
(12, 'EST-CP-2023-12', 'Corporate Innovation Campus - Block B', 'REAL_ESTATE', 2400000.00, '2023-04-01', 'EXCELLENT', 'ASSIGNED', 11, 12000, 30, 200000.00),
(13, 'EST-PH-2024-13', 'Obsidian Sovereign Penthouse Suite', 'REAL_ESTATE', 1850000.00, '2024-01-10', 'EXCELLENT', 'AVAILABLE', NULL, 8500, 30, 150000.00),
(14, 'JET-GL-2023-14', 'Gulfstream G280 Executive Aviation Jet', 'REAL_ESTATE', 4800000.00, '2023-08-20', 'EXCELLENT', 'AVAILABLE', NULL, 25000, 20, 500000.00)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    category = VALUES(category),
    purchase_cost = VALUES(purchase_cost),
    purchase_date = VALUES(purchase_date),
    condition_status = VALUES(condition_status),
    allocation_status = VALUES(allocation_status),
    assigned_employee_id = VALUES(assigned_employee_id),
    power_watts = VALUES(power_watts);

-- 4. Populate Asset Financing & Equity
INSERT INTO asset_finances (id, asset_id, financing_type, total_loan_amount, down_payment, monthly_emi, interest_rate, tenure_months, emis_paid, current_ownership_pct, is_fully_paid) VALUES
(1, 1, 'LOAN', 40000.00, 8000.00, 1650.00, 7.80, 24, 14, 68.50, FALSE),
(2, 2, 'LOAN', 22800.00, 5700.00, 980.00, 8.20, 24, 18, 81.20, FALSE),
(3, 3, 'LOAN', 27200.00, 6800.00, 720.00, 8.50, 36, 16, 54.00, FALSE),
(4, 4, 'LOAN', 33600.00, 8400.00, 890.00, 8.50, 36, 12, 45.40, FALSE),
(5, 5, 'OUTRIGHT', 0.00, 4800.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
(6, 6, 'OUTRIGHT', 0.00, 4200.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
(7, 7, 'OUTRIGHT', 0.00, 2600.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
(8, 8, 'OUTRIGHT', 0.00, 2900.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
(9, 9, 'LOAN', 60000.00, 15000.00, 1450.00, 7.50, 48, 20, 58.30, FALSE),
(10, 10, 'LOAN', 54400.00, 13600.00, 1320.00, 7.90, 48, 14, 49.00, FALSE),
(11, 11, 'OUTRIGHT', 0.00, 9500.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
(12, 12, 'LOAN', 1920000.00, 480000.00, 18500.00, 6.50, 120, 30, 43.10, FALSE),
(13, 13, 'LOAN', 1480000.00, 370000.00, 14200.00, 6.80, 120, 22, 36.90, FALSE),
(14, 14, 'LOAN', 3840000.00, 960000.00, 38500.00, 6.20, 120, 26, 40.80, FALSE)
ON DUPLICATE KEY UPDATE
    total_loan_amount = VALUES(total_loan_amount),
    monthly_emi = VALUES(monthly_emi),
    current_ownership_pct = VALUES(current_ownership_pct),
    is_fully_paid = VALUES(is_fully_paid);

-- 5. Populate Maintenance Logs
INSERT INTO maintenance_logs (id, asset_id, cost, issue_description, service_provider, maintenance_date, is_resolved) VALUES
(1, 1, 620.00, 'Redundant cooling fan module replacement', 'NVIDIA Enterprise Support', '2025-02-14', TRUE),
(2, 2, 450.00, 'RAID array firmware patch & thermal recalibration', 'Dell ProSupport Plus', '2024-11-20', TRUE),
(3, 3, 380.00, 'Regenerative braking sensor diagnostic & 10k service', 'BYD Commercial Logistics Care', '2024-09-15', TRUE),
(4, 9, 1250.00, 'Fuel injector flushing & automatic transfer switch load test', 'Caterpillar Certified Power', '2024-04-10', TRUE),
(5, 6, 210.00, 'Precision keyboard replacement & thermal re-paste', 'Dell Certified Repair', '2024-12-05', TRUE)
ON DUPLICATE KEY UPDATE
    cost = VALUES(cost),
    issue_description = VALUES(issue_description);

-- 6. Populate Custody Handover Audit Logs
INSERT INTO custody_histories (id, asset_id, employee_id, action_type, action_date, condition_notes) VALUES
(1, 1, 1, 'ASSIGNED', '2025-01-10', 'Issued to Principal Architect for AI research compute cluster'),
(2, 2, 2, 'ASSIGNED', '2024-08-15', 'Rack installed in Data Center Pod 3'),
(3, 3, 7, 'ASSIGNED', '2024-05-20', 'Vehicle keys & EV charging card handed over'),
(4, 4, 8, 'ASSIGNED', '2025-02-01', 'Commercial SUV allocated with fleet GPS tag'),
(5, 5, 4, 'ASSIGNED', '2025-01-20', 'Sealed factory packaging unboxed with asset tag attached'),
(6, 6, 3, 'ASSIGNED', '2024-09-10', 'Provisioned with Linux & Docker developer images')
ON DUPLICATE KEY UPDATE
    action_type = VALUES(action_type),
    condition_notes = VALUES(condition_notes);
