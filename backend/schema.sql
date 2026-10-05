
CREATE DATABASE IF NOT EXISTS tams_db;
USE tams_db;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Staff',
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, role, name) VALUES
('admin', '123', 'Administrator', 'Temple Administrator'),
('priest', '123', 'Priest', 'Priest'),
('treasurer', '123', 'Treasurer', 'Treasurer');

-- ------------------------------------------------------------
-- Table: activities
-- ------------------------------------------------------------
DROP TABLE IF EXISTS activities;
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sub VARCHAR(255),
    type ENUM('Daily', 'Weekly', 'Monthly', 'Festival', 'Special') NOT NULL,
    when_date VARCHAR(100) NOT NULL,
    priest VARCHAR(100) NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO activities (name, sub, type, when_date, priest, status) VALUES
('Suprabhatam & Nirmalya Darshan', 'Sanctum sanctorum', 'Daily', '08 Aug · 5:30 AM', 'Ganesan Sivachariar', 'Completed'),
('Ganapathy Homam', 'Sponsored seva', 'Daily', '08 Aug · 7:00 AM', 'Krishnamurthy Bhat', 'Completed'),
('Sayaraksha & Abhishekam', 'Evening rites', 'Daily', '08 Aug · 6:00 PM', 'Krishnamurthy Bhat', 'Scheduled'),
('Sahasranama Archana', 'Weekly Friday special', 'Weekly', '14 Aug · 9:00 AM', 'Ravishankar Gurukkal', 'Scheduled'),
('Full Moon Abhishekam', 'Monthly Pournami seva', 'Monthly', '19 Aug · 6:30 AM', 'Ganesan Sivachariar', 'Scheduled'),
('Varalakshmi Vratham Kalasam', 'Festival opening ritual', 'Festival', '14 Aug · 6:00 AM', 'Ganesan Sivachariar', 'Scheduled'),
('Navagraha Shanti Homam', 'Devotee request — special pooja', 'Special', '10 Aug · 10:00 AM', 'Ravishankar Gurukkal', 'Cancelled');

-- ------------------------------------------------------------
-- Table: donations
-- ------------------------------------------------------------
DROP TABLE IF EXISTS donations;
CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_name VARCHAR(150) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('Completed', 'Pending', 'Refunded') DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO donations (donor_name, amount, category, date, payment_mode, receipt_no, status) VALUES
('Ramanathan K.', 10008.00, 'Annadhanam', '2026-08-08', 'UPI', 'REC-2026-0801', 'Completed'),
('Meenakshi Sundaram', 5000.00, 'Temple Renovation', '2026-08-07', 'Net Banking', 'REC-2026-0802', 'Completed'),
('Saritha Reddy', 2500.00, 'Daily Pooja', '2026-08-06', 'Cash', 'REC-2026-0803', 'Completed'),
('Srinivasan V.', 15000.00, 'Kumbhabhishekam', '2026-08-05', 'Cheque', 'REC-2026-0804', 'Completed');

-- ------------------------------------------------------------
-- Table: priests
-- ------------------------------------------------------------
DROP TABLE IF EXISTS priests;
CREATE TABLE priests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    shift VARCHAR(100) NOT NULL,
    status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active'
);

INSERT INTO priests (name, designation, phone, shift, status) VALUES
('Ganesan Sivachariar', 'Chief Priest (Head Archaka)', '+91 98401 23456', 'Morning Shift (5 AM - 1 PM)', 'Active'),
('Krishnamurthy Bhat', 'Senior Priest', '+91 98402 34567', 'Evening Shift (4 PM - 9 PM)', 'Active'),
('Ravishankar Gurukkal', 'Assistant Priest', '+91 98403 45678', 'Full Day', 'Active');

-- ------------------------------------------------------------
-- Table: staff
-- ------------------------------------------------------------
DROP TABLE IF EXISTS staff;
CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

INSERT INTO staff (name, role, department, phone, status) VALUES
('Sundararajan P.', 'Office Manager', 'Administration', '+91 94441 11223', 'Active'),
('Kavitha M.', 'Accountant', 'Finance', '+91 94442 22334', 'Active'),
('Murugan V.', 'Store Keeper', 'Inventory', '+91 94443 33445', 'Active'),
('Lakshmi N.', 'Kitchen Supervisor', 'Annadhanam', '+91 94444 44556', 'Active');

-- ------------------------------------------------------------
-- Table: inventory
-- ------------------------------------------------------------
DROP TABLE IF EXISTS inventory;
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    status ENUM('In Stock', 'Low Stock', 'Out of Stock') DEFAULT 'In Stock'
);

INSERT INTO inventory (item_name, category, quantity, unit, status) VALUES
('Pure Cow Ghee', 'Pooja Essentials', 45, 'Liters', 'In Stock'),
('Camphor (Karpuram)', 'Pooja Essentials', 12, 'Kg', 'In Stock'),
('Sandalwood Paste', 'Pooja Essentials', 8, 'Kg', 'Low Stock'),
('Raw Rice (Annadhanam)', 'Kitchen Items', 450, 'Kg', 'In Stock'),
('Jaggery', 'Kitchen Items', 85, 'Kg', 'In Stock'),
('Brass Oil Lamps (Dheepam)', 'Pooja Utensils', 30, 'Pieces', 'In Stock');

-- ------------------------------------------------------------
-- Table: festivals
-- ------------------------------------------------------------
DROP TABLE IF EXISTS festivals;
CREATE TABLE festivals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    status ENUM('Upcoming', 'Ongoing', 'Completed') DEFAULT 'Upcoming'
);

INSERT INTO festivals (name, start_date, end_date, description, status) VALUES
('Kandha Sashti Utsavam & Soorasamharam', '2026-10-25', '2026-10-31', 'Grand 6-day festival celebrating Lord Murugan defeating Surapadman on the seashore, followed by Thirukalyanam', 'Upcoming'),
('Vaikasi Visakam Utsavam', '2026-05-28', '2026-06-01', 'Incarnation day of Lord Shanmukha with thousands bringing Milk Kavadis and Pada Yatra', 'Completed'),
('Avani Perumanthiram (Avani Utsavam)', '2026-08-24', '2026-09-04', '12-day festival with Red Silk and White Silk Shanmugar chapparams and Ther Oottam car festival', 'Ongoing'),
('Masi Perumanthiram (Masi Utsavam)', '2026-02-14', '2026-02-25', '12-day Brahmotsavam with Silver Chariot, Pachai Saathi Green Alankaram, and sea-water Theerthavari', 'Completed'),
('Tuesday Shanmugar Abhishekam & Kavadi Seva', '2026-09-22', '2026-09-22', 'Weekly sacred Sevvai/Tuesday special milk Abhishekam and Kavadi offerings for Lord Shanmukha', 'Ongoing');

-- ------------------------------------------------------------
-- Table: annadhanam
-- ------------------------------------------------------------
DROP TABLE IF EXISTS annadhanam;
CREATE TABLE annadhanam (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    count INT NOT NULL,
    sponsor_name VARCHAR(150),
    amount DECIMAL(10, 2),
    status ENUM('Served', 'Scheduled', 'Cancelled') DEFAULT 'Scheduled'
);

INSERT INTO annadhanam (date, count, sponsor_name, amount, status) VALUES
('2026-08-08', 500, 'Ramanathan K.', 10008.00, 'Served'),
('2026-08-07', 450, 'Anonymous Devotee', 7500.00, 'Served'),
('2026-08-09', 600, 'Suresh Kumar', 12000.00, 'Scheduled'),
('2026-08-10', 550, 'Temple Trust Fund', 10000.00, 'Scheduled');

-- ------------------------------------------------------------
-- Table: temple_details
-- ------------------------------------------------------------
DROP TABLE IF EXISTS temple_details;
CREATE TABLE temple_details (
    id INT PRIMARY KEY DEFAULT 1,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    timings VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    trust_info TEXT NOT NULL
);

INSERT INTO temple_details (id, name, location, timings, phone, email, trust_info) VALUES
(1, 'Sri Arulmigu Subramaniya Swamy Temple', 'Tiruchendur, Thoothukudi District, Tamil Nadu - 628215', '5:00 AM – 12:30 PM & 4:00 PM – 9:00 PM', '+91 4639 242221', 'eo.tiruchendur@tnhrce.gov.in', 'Managed by Hindu Religious & Charitable Endowments (HR&CE) Department & Devasthanam Board');
