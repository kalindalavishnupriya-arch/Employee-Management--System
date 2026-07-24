/*
   Smart Employee Management System - Database Setup Script
   -------------------------------------------------------
   This script creates the necessary tables for the application.
   Run it against your MySQL (or compatible) database.
*/

CREATE DATABASE IF NOT EXISTS sempms;
USE sempms;

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    department VARCHAR(100),
    designation VARCHAR(100),
    joined_date DATE,
    status VARCHAR(50),
    employee_id BIGINT,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE'
);

-- Employees table (profile details)
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    joined_date DATE,
    status VARCHAR(50)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    deadline DATE,
    owner_user_id BIGINT,
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    assignee_user_id BIGINT,
    project_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignee_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Sample data (optional)
INSERT INTO users (username, password, role) VALUES
    ('admin', '{bcrypt}$2a$10$examplehashedpassword', 'ADMIN'),
    ('Priya', '{bcrypt}$2a$10$examplehashedpassword', 'EMPLOYEE'),
    ('Vishnu', '{bcrypt}$2a$10$examplehashedpassword', 'EMPLOYEE');

-- Link users to employees (example)
INSERT INTO employees (first_name, last_name, email, department, designation, joined_date, status) VALUES
    ('Priya', 'Kumar', 'priya@example.com', 'Engineering', 'Developer', CURDATE(), 'ACTIVE'),
    ('Vishnu', 'Patel', 'vishnu@example.com', 'Engineering', 'Developer', CURDATE(), 'ACTIVE');

-- Associate employee_id with user (example, adjust IDs as needed)
UPDATE users SET employee_id = 1 WHERE username = 'Priya';
UPDATE users SET employee_id = 2 WHERE username = 'Vishnu';
