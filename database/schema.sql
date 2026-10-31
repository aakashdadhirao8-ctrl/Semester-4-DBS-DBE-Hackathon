-- ============================================================
-- CODESPARK HACKATHON 2026 • KL University - Bachupally Campus
-- Track 4: Workforce & Enterprise | Problem Statement 28: Corporate Asset Management
-- Database Schema: MySQL / PostgreSQL Compatible
-- ============================================================

CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    budget_ceiling DECIMAL(15, 2) NOT NULL DEFAULT 50000.00,
    head_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    designation VARCHAR(100) NOT NULL,
    department_id BIGINT,
    joined_date DATE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- HARDWARE, SERVER, VEHICLE, MACHINERY, OFFICE_EQUIPMENT
    purchase_cost DECIMAL(15, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    condition_status VARCHAR(30) NOT NULL DEFAULT 'GOOD', -- EXCELLENT, GOOD, FAIR, DAMAGED
    allocation_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, ASSIGNED, UNDER_MAINTENANCE, SCRAPPED
    assigned_employee_id BIGINT,
    power_watts INT DEFAULT 65, -- For Green IT & Energy calculation
    estimated_lifespan_years INT DEFAULT 4,
    salvage_value DECIMAL(15, 2) DEFAULT 0.00,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS asset_finances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NOT NULL UNIQUE,
    financing_type VARCHAR(30) NOT NULL DEFAULT 'LOAN', -- OUTRIGHT, LOAN, LEASE
    total_loan_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    down_payment DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    monthly_emi DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 8.50,
    tenure_months INT NOT NULL DEFAULT 24,
    emis_paid INT NOT NULL DEFAULT 0,
    current_ownership_pct DECIMAL(6, 2) NOT NULL DEFAULT 20.00,
    is_fully_paid BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emi_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    finance_id BIGINT NOT NULL,
    installment_no INT NOT NULL,
    amount_paid DECIMAL(15, 2) NOT NULL,
    payment_date DATE NOT NULL,
    remarks VARCHAR(255),
    FOREIGN KEY (finance_id) REFERENCES asset_finances(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    cost DECIMAL(15, 2) NOT NULL,
    issue_description VARCHAR(255) NOT NULL,
    service_provider VARCHAR(120),
    maintenance_date DATE NOT NULL,
    is_resolved BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS custody_histories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    employee_id BIGINT,
    action_type VARCHAR(30) NOT NULL, -- ASSIGNED, RETURNED, REASSIGNED
    action_date DATE NOT NULL,
    condition_notes VARCHAR(255),
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);
