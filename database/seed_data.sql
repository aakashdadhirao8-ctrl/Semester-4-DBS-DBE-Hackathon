-- ============================================================
-- CODESPARK HACKATHON 2026 • KL University - Bachupally Campus
-- Track 4: Problem Statement 28: Corporate Asset Management
-- Realistic Demo Seed Data
-- ============================================================

-- 1. Departments
INSERT INTO departments (id, name, code, budget_ceiling, head_name) VALUES
(1, 'DevOps & Cloud Infrastructure', 'DEVOPS', 120000.00, 'Rajesh Varma'),
(2, 'Software Engineering', 'ENGG', 85000.00, 'Ananya Sen'),
(3, 'Corporate Logistics & Fleet', 'LOGISTICS', 150000.00, 'Vikram Rathore'),
(4, 'Product & UI/UX Design', 'DESIGN', 40000.00, 'Priya Kulkarni'),
(5, 'Executive & Finance', 'EXEC', 60000.00, 'Suresh Menon');

-- 2. Employees
INSERT INTO employees (id, full_name, email, designation, department_id, joined_date) VALUES
(1, 'Arjun Reddy', 'arjun.reddy@enterprise.com', 'Principal Cloud Architect', 1, '2022-03-15'),
(2, 'Sneha Rao', 'sneha.rao@enterprise.com', 'Senior Full-Stack Engineer', 2, '2023-06-10'),
(3, 'Karthik Nair', 'karthik.nair@enterprise.com', 'Fleet & Facilities Manager', 3, '2021-11-01'),
(4, 'Meera Iyer', 'meera.iyer@enterprise.com', 'Lead Product Designer', 4, '2023-01-20'),
(5, 'Rohan Verma', 'rohan.verma@enterprise.com', 'VP of Engineering', 2, '2022-08-01'),
(6, 'Divya Sharma', 'divya.sharma@enterprise.com', 'Site Reliability Engineer', 1, '2024-02-15');

-- 3. Assets
INSERT INTO assets (id, asset_tag, name, category, purchase_cost, purchase_date, condition_status, allocation_status, assigned_employee_id, power_watts, estimated_lifespan_years, salvage_value) VALUES
-- High-performance AI / Cloud Server Rack
(1, 'SRV-AI-2023-01', 'NVIDIA DGX Station A100 Server', 'SERVER', 45000.00, '2023-02-10', 'EXCELLENT', 'ASSIGNED', 1, 950, 5, 5000.00),
-- Dell PowerEdge Storage Server
(2, 'SRV-DL-2022-04', 'Dell PowerEdge R750 64TB Rack', 'SERVER', 28000.00, '2022-05-18', 'GOOD', 'ASSIGNED', 6, 750, 5, 2500.00),
-- Company EV Fleet Delivery Van
(3, 'FLT-EV-2023-09', 'Tata Ace EV Cargo Delivery Van', 'VEHICLE', 32000.00, '2023-09-12', 'GOOD', 'ASSIGNED', 3, 3200, 7, 4000.00),
-- Developer Workstation
(4, 'DEV-MBP-2024-01', 'Apple MacBook Pro 16" M3 Max 64GB', 'HARDWARE', 3800.00, '2024-01-15', 'EXCELLENT', 'ASSIGNED', 2, 85, 4, 600.00),
-- Designer Studio Workstation
(5, 'DSG-MBP-2023-07', 'Apple MacBook Pro 14" M2 Pro 32GB', 'HARDWARE', 2600.00, '2023-07-22', 'GOOD', 'ASSIGNED', 4, 70, 4, 400.00),
-- Executive Laptop
(6, 'EXE-THK-2024-03', 'Lenovo ThinkPad X1 Carbon Gen 11', 'HARDWARE', 2400.00, '2024-03-05', 'EXCELLENT', 'ASSIGNED', 5, 65, 4, 350.00),
-- Legacy Server (Candidate for SCRAP/DECOMMISSION to show intelligent alert!)
(7, 'LEG-SRV-2019-11', 'Legacy HP ProLiant DL380 Gen9', 'SERVER', 12000.00, '2019-11-10', 'DAMAGED', 'UNDER_MAINTENANCE', 1, 650, 4, 500.00),
-- Spare Inventory Hardware
(8, 'SPR-MN-2024-02', 'Dell UltraSharp 32" 4K USB-C Hub Monitor', 'OFFICE_EQUIPMENT', 850.00, '2024-02-28', 'EXCELLENT', 'AVAILABLE', NULL, 45, 5, 100.00);

-- 4. Asset Finances (Loans, EMIs, Down Payments, Ownership Progression)
INSERT INTO asset_finances (id, asset_id, financing_type, total_loan_amount, down_payment, monthly_emi, interest_rate, tenure_months, emis_paid, current_ownership_pct, is_fully_paid) VALUES
-- Asset 1: NVIDIA DGX Server ($45k) - 36 months, 22 paid -> ~74% owned
(1, 1, 'LOAN', 36000.00, 9000.00, 1150.00, 7.80, 36, 22, 74.20, FALSE),
-- Asset 2: Dell PowerEdge ($28k) - 24 months, 24 paid -> 100% OWNED (Fully capitalized milestone!)
(2, 2, 'LOAN', 22400.00, 5600.00, 1010.00, 8.20, 24, 24, 100.00, TRUE),
-- Asset 3: EV Delivery Van ($32k) - 48 months, 14 paid -> ~42% owned
(3, 3, 'LOAN', 25600.00, 6400.00, 625.00, 8.50, 48, 14, 42.10, FALSE),
-- Asset 4: MacBook M3 Max - Outright Purchased
(4, 4, 'OUTRIGHT', 0.00, 3800.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
-- Asset 5: MacBook M2 Pro - Outright Purchased
(5, 5, 'OUTRIGHT', 0.00, 2600.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
-- Asset 6: ThinkPad X1 - Outright Purchased
(6, 6, 'OUTRIGHT', 0.00, 2400.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
-- Asset 7: Legacy Server - Outright Purchased (fully depreciated)
(7, 7, 'OUTRIGHT', 0.00, 12000.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
-- Asset 8: Monitor - Outright Purchased
(8, 8, 'OUTRIGHT', 0.00, 850.00, 0.00, 0.00, 0, 0, 100.00, TRUE);

-- 5. Maintenance Logs (Note: Asset 7 has cumulative repairs exceeding 50% of current book value!)
INSERT INTO maintenance_logs (id, asset_id, cost, issue_description, service_provider, maintenance_date, is_resolved) VALUES
(1, 3, 340.00, 'Brake caliper inspection & routine EV battery health check', 'Tata Commercial Service', '2024-03-10', TRUE),
(2, 1, 480.00, 'Redundant power supply unit replacement (PSU 2)', 'NVIDIA Enterprise Support', '2024-04-18', TRUE),
(3, 7, 2100.00, 'Motherboard capacitor failure and fan array replacement', 'ProLiant Certified Techs', '2023-08-14', TRUE),
(4, 7, 1850.00, 'RAID controller card failure and secondary bus repair', 'ProLiant Certified Techs', '2024-02-20', TRUE),
(5, 7, 1450.00, 'Critical thermal sensor malfunction and heatsink re-paste', 'ProLiant Certified Techs', '2024-06-05', FALSE);

-- 6. Custody Histories (Audit Trail)
INSERT INTO custody_histories (id, asset_id, employee_id, action_type, action_date, condition_notes) VALUES
(1, 1, 1, 'ASSIGNED', '2023-02-12', 'Initial deployment in Cloud Lab Rack 04'),
(2, 2, 6, 'ASSIGNED', '2022-05-20', 'Assigned to SRE infrastructure cluster'),
(3, 3, 3, 'ASSIGNED', '2023-09-15', 'Issued with standard telematics and fast-charger'),
(4, 4, 2, 'ASSIGNED', '2024-01-16', 'Brand new unboxed with security profile installed'),
(5, 5, 4, 'ASSIGNED', '2023-07-23', 'Issued with Adobe Creative Cloud license bundle'),
(6, 6, 5, 'ASSIGNED', '2024-03-06', 'Executive provisioning with full disk encryption'),
(7, 7, 1, 'ASSIGNED', '2019-11-12', 'Legacy staging environment allocation');
