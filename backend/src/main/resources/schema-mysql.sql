-- Corporate Asset Management MySQL Schema & Seed Data
USE corporate_asset_management;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    budget_ceiling DECIMAL(15,2) NOT NULL DEFAULT 50000.00,
    head_name VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    designation VARCHAR(100) NOT NULL,
    department_id BIGINT,
    joined_date DATE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    purchase_cost DECIMAL(15,2) NOT NULL,
    purchase_date DATE NOT NULL,
    condition_status VARCHAR(30) NOT NULL DEFAULT 'GOOD',
    allocation_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    assigned_employee_id BIGINT,
    power_watts INT DEFAULT 65,
    estimated_lifespan_years INT DEFAULT 4,
    salvage_value DECIMAL(15,2) DEFAULT 0.00,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Asset Finances Table
CREATE TABLE IF NOT EXISTS asset_finances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NOT NULL UNIQUE,
    financing_type VARCHAR(30) NOT NULL DEFAULT 'LOAN',
    total_loan_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    down_payment DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    monthly_emi DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    interest_rate DECIMAL(5,2) DEFAULT 8.50,
    tenure_months INT NOT NULL DEFAULT 24,
    emis_paid INT NOT NULL DEFAULT 0,
    current_ownership_pct DECIMAL(6,2) NOT NULL DEFAULT 20.00,
    is_fully_paid BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Maintenance Logs Table
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    cost DECIMAL(15,2) NOT NULL,
    issue_description VARCHAR(255) NOT NULL,
    service_provider VARCHAR(120),
    maintenance_date DATE NOT NULL,
    is_resolved BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Custody Histories Table
CREATE TABLE IF NOT EXISTS custody_histories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    employee_id BIGINT,
    action_type VARCHAR(30) NOT NULL,
    action_date DATE NOT NULL,
    condition_notes VARCHAR(255),
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. EMI Payments Table
CREATE TABLE IF NOT EXISTS emi_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    finance_id BIGINT NOT NULL,
    installment_no INT NOT NULL,
    amount_paid DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    remarks VARCHAR(255),
    FOREIGN KEY (finance_id) REFERENCES asset_finances(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA (INSERT IGNORE)
-- ============================================================

INSERT IGNORE INTO departments (id, name, code, budget_ceiling, head_name) VALUES
(1, 'DevOps & Cloud Infrastructure', 'DEVOPS', 120000.00, 'Rajesh Varma'),
(2, 'Software Engineering', 'ENGG', 85000.00, 'Ananya Sen'),
(3, 'Corporate Logistics & Fleet', 'LOGISTICS', 150000.00, 'Vikram Rathore'),
(4, 'Product & UI/UX Design', 'DESIGN', 40000.00, 'Priya Kulkarni'),
(5, 'Executive & Finance', 'EXEC', 60000.00, 'Suresh Menon');

INSERT IGNORE INTO employees (id, full_name, email, designation, department_id, joined_date) VALUES
(1, 'Arjun Reddy', 'arjun.reddy@enterprise.com', 'Principal Cloud Architect', 1, '2022-03-15'),
(2, 'Sneha Rao', 'sneha.rao@enterprise.com', 'Senior Full-Stack Engineer', 2, '2023-06-10'),
(3, 'Karthik Nair', 'karthik.nair@enterprise.com', 'Fleet & Facilities Manager', 3, '2021-11-01'),
(4, 'Meera Iyer', 'meera.iyer@enterprise.com', 'Lead Product Designer', 4, '2023-01-20'),
(5, 'Rohan Verma', 'rohan.verma@enterprise.com', 'VP of Engineering', 2, '2022-08-01'),
(6, 'Divya Sharma', 'divya.sharma@enterprise.com', 'Site Reliability Engineer', 1, '2024-02-15');

INSERT IGNORE INTO assets (id, asset_tag, name, category, purchase_cost, purchase_date, condition_status, allocation_status, assigned_employee_id, power_watts, estimated_lifespan_years, salvage_value) VALUES
(1, 'SRV-AI-2023-01', 'NVIDIA DGX Station A100 Server', 'SERVER', 45000.00, '2023-02-10', 'EXCELLENT', 'ASSIGNED', 1, 950, 5, 5000.00),
(2, 'SRV-DL-2022-04', 'Dell PowerEdge R750 64TB Rack', 'SERVER', 28000.00, '2022-05-18', 'GOOD', 'ASSIGNED', 6, 750, 5, 2500.00),
(3, 'FLT-EV-2023-09', 'Tata Ace EV Cargo Delivery Van', 'VEHICLE', 32000.00, '2023-09-12', 'GOOD', 'ASSIGNED', 3, 3200, 7, 4000.00),
(4, 'DEV-MBP-2024-01', 'Apple MacBook Pro 16" M3 Max 64GB', 'HARDWARE', 3800.00, '2024-01-15', 'EXCELLENT', 'ASSIGNED', 2, 85, 4, 600.00),
(5, 'DSG-MBP-2023-07', 'Apple MacBook Pro 14" M2 Pro 32GB', 'HARDWARE', 2600.00, '2023-07-22', 'GOOD', 'ASSIGNED', 4, 70, 4, 400.00),
(6, 'EXE-THK-2024-03', 'Lenovo ThinkPad X1 Carbon Gen 11', 'HARDWARE', 2400.00, '2024-03-05', 'EXCELLENT', 'ASSIGNED', 5, 65, 4, 350.00),
(7, 'LEG-SRV-2019-11', 'Legacy HP ProLiant DL380 Gen9', 'SERVER', 12000.00, '2019-11-10', 'DAMAGED', 'UNDER_MAINTENANCE', 1, 650, 4, 500.00),
(8, 'SPR-MN-2024-02', 'Dell UltraSharp 32" 4K USB-C Hub Monitor', 'OFFICE_EQUIPMENT', 850.00, '2024-02-28', 'EXCELLENT', 'AVAILABLE', NULL, 45, 5, 100.00);

INSERT IGNORE INTO asset_finances (id, asset_id, financing_type, total_loan_amount, down_payment, monthly_emi, interest_rate, tenure_months, emis_paid, current_ownership_pct, is_fully_paid) VALUES
(1, 1, 'LOAN', 36000.00, 9000.00, 1150.00, 7.80, 36, 22, 74.20, FALSE),
(2, 2, 'LOAN', 22400.00, 5600.00, 1010.00, 8.20, 24, 24, 100.00, TRUE),
(3, 3, 'LOAN', 25600.00, 6400.00, 625.00, 8.50, 48, 14, 42.10, FALSE),
(4, 4, 'OUTRIGHT', 0.00, 3800.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
(5, 5, 'OUTRIGHT', 0.00, 2600.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
(6, 6, 'OUTRIGHT', 0.00, 2400.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
(7, 7, 'OUTRIGHT', 0.00, 12000.00, 0.00, 0.00, 0, 0, 100.00, TRUE),
(8, 8, 'OUTRIGHT', 0.00, 850.00, 0.00, 0.00, 0, 0, 100.00, TRUE);

INSERT IGNORE INTO maintenance_logs (id, asset_id, cost, issue_description, service_provider, maintenance_date, is_resolved) VALUES
(1, 3, 340.00, 'Brake caliper inspection & routine EV battery health check', 'Tata Commercial Service', '2024-03-10', TRUE),
(2, 1, 480.00, 'Redundant power supply unit replacement (PSU 2)', 'NVIDIA Enterprise Support', '2024-04-18', TRUE),
(3, 7, 2100.00, 'Motherboard capacitor failure and fan array replacement', 'ProLiant Certified Techs', '2023-08-14', TRUE),
(4, 7, 1850.00, 'RAID controller card failure and secondary bus repair', 'ProLiant Certified Techs', '2024-02-20', TRUE),
(5, 7, 1450.00, 'Critical thermal sensor malfunction and heatsink re-paste', 'ProLiant Certified Techs', '2024-06-05', FALSE);

INSERT IGNORE INTO custody_histories (id, asset_id, employee_id, action_type, action_date, condition_notes) VALUES
(1, 1, 1, 'ASSIGNED', '2023-02-12', 'Initial deployment in Cloud Lab Rack 04'),
(2, 2, 6, 'ASSIGNED', '2022-05-20', 'Assigned to SRE infrastructure cluster'),
(3, 3, 3, 'ASSIGNED', '2023-09-15', 'Issued with standard telematics and fast-charger'),
(4, 4, 2, 'ASSIGNED', '2024-01-16', 'Brand new unboxed with security profile installed'),
(5, 5, 4, 'ASSIGNED', '2023-07-23', 'Issued with Adobe Creative Cloud license bundle'),
(6, 6, 5, 'ASSIGNED', '2024-03-06', 'Executive provisioning with full disk encryption'),
(7, 7, 1, 'ASSIGNED', '2019-11-12', 'Legacy staging environment allocation');
