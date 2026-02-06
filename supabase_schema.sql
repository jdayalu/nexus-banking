-- Enable UUIDs
create extension if not exists "uuid-ossp";

-- 1. Customers
create table if not exists customers (
  id text primary key, -- Keeping text to match mock IDs like 'C001', in real app use uuid
  name text not null,
  type text check (type in ('Retail', 'Corporate', 'SME', 'Wealth')),
  email text,
  phone text,
  risk text check (risk in ('Low', 'Medium', 'High')),
  kyc_status text default 'Pending',
  net_worth numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Accounts
create table if not exists accounts (
  id text primary key, -- 'A101001'
  customer_id text references customers(id),
  type text,
  currency text default 'USD',
  balance numeric default 0,
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Loans
create table if not exists loans (
  id text primary key,
  customer_id text references customers(id),
  type text,
  amount numeric,
  remaining numeric,
  status text default 'Active',
  next_payment date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Transactions
create table if not exists transactions (
  id text primary key,
  account_id text references accounts(id),
  date date default CURRENT_DATE,
  description text,
  amount numeric, -- Negative for debit, positive for credit
  type text, -- 'Credit', 'Debit', 'Wire', 'ACH'
  status text default 'Posted', -- 'Posted', 'Pending Auth'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Alerts (Risk/AML)
create table if not exists alerts (
  id text primary key,
  severity text check (severity in ('Low', 'Medium', 'High')),
  type text,
  entity text, -- Could reference customer or account ID
  description text,
  date date default CURRENT_DATE,
  status text default 'Open',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Audit Log
create table if not exists audit_log (
  id uuid default uuid_generate_v4() primary key,
  time timestamp with time zone default timezone('utc'::text, now()),
  "user" text, -- Reserved word, quoted
  action text,
  details text
);

-- SEED DATA (Matches Mock Data)
-- Clear existing data to avoid duplicates if re-running
truncate table audit_log, alerts, transactions, loans, accounts, customers;

insert into customers (id, name, type, email, phone, risk, kyc_status, net_worth) values 
('C001', 'John Doe', 'Retail', 'john@example.com', '+1-555-0101', 'Low', 'Verified', 154000),
('C002', 'Acme Corp International', 'Corporate', 'contact@acme.com', '+1-555-0999', 'Medium', 'Review Needed', 5400000),
('C003', 'Sarah Smith', 'Retail', 'sarah@example.com', '+1-555-0102', 'Low', 'Verified', 85000),
('C004', 'TechStart Inc', 'SME', 'info@techstart.io', '+1-555-0888', 'High', 'Verified', 1200000);

insert into accounts (id, customer_id, type, currency, balance, status) values
('A101001', 'C001', 'Checking', 'USD', 5420.50, 'Active'),
('A101002', 'C001', 'Savings', 'USD', 25000.00, 'Active'),
('A202001', 'C002', 'Corporate Operating', 'USD', 1250000.00, 'Active'),
('A202002', 'C002', 'Trade Finance', 'EUR', 450000.00, 'Active'),
('A303001', 'C003', 'Checking', 'USD', 1200.00, 'Active');

insert into loans (id, customer_id, type, amount, remaining, status, next_payment) values
('L9001', 'C001', 'Mortgage', 350000, 342000, 'Active', '2024-03-01'),
('L9002', 'C004', 'Business Loan', 100000, 95000, 'Active', '2024-02-28');

insert into transactions (id, account_id, date, description, amount, type, status) values
('T5510', 'A101001', '2024-02-24', 'Grocery Store', -150.00, 'Debit', 'Posted'),
('T5511', 'A101001', '2024-02-23', 'Payroll Deposit', 3200.00, 'Credit', 'Posted'),
('T5512', 'A202001', '2024-02-24', 'Vendor Payment #442', -12500.00, 'Debit', 'Pending Auth');

insert into alerts (id, severity, type, entity, description, date, status) values
('AL-991', 'High', 'AML Watchlist', 'C004', 'Name match on new sanction list', '2024-02-25', 'Open'),
('AL-992', 'Medium', 'Structuring', 'A101001', 'Multiple deposits just under $10k', '2024-02-20', 'Investigating');

insert into audit_log ("user", action, details) values
('System', 'Daily Batch', 'EOD Processing Complete');
