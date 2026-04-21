-- =========================================
-- VMS Role-Based Access Control (RBAC) Tables
-- Run this script to create the missing roles tables
-- =========================================

-- Modules Table (represents different sections of the application)
CREATE TABLE IF NOT EXISTS `modules` (
  `module_id` INT NOT NULL AUTO_INCREMENT,
  `module_name` VARCHAR(100) NOT NULL,
  `module_description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`module_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Permissions Table (actions that can be performed within modules)
CREATE TABLE IF NOT EXISTS `permissions` (
  `permission_id` INT NOT NULL AUTO_INCREMENT,
  `permission_name` VARCHAR(100) NOT NULL,
  `permission_description` TEXT,
  `designated_module_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`permission_id`),
  KEY `fk_permission_module` (`designated_module_id`),
  CONSTRAINT `fk_permission_module` FOREIGN KEY (`designated_module_id`) REFERENCES `modules` (`module_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Roles Table
CREATE TABLE IF NOT EXISTS `roles` (
  `role_id` INT NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(100) NOT NULL,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `visibility` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Role Permissions Junction Table
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  KEY `fk_rp_role` (`role_id`),
  KEY `fk_rp_permission` (`permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================
-- Seed Data for Modules
-- =========================================
INSERT INTO `modules` (`module_name`, `module_description`) VALUES
('Dashboard', 'Main dashboard and analytics views'),
('Visitor Management', 'Check-in, check-out, and visitor tracking'),
('Appointment Management', 'Appointment scheduling and management'),
('Employee Management', 'Employee records and management'),
('Masters', 'Company, Department, Designation management'),
('Role Management', 'User roles and permissions management'),
('Reports', 'Report generation and exports');

-- =========================================
-- Seed Data for Permissions
-- =========================================

-- Dashboard Permissions
INSERT INTO `permissions` (`permission_name`, `permission_description`, `designated_module_id`) VALUES
('View Dashboard', 'Access to view the main dashboard', 1),
('View Analytics', 'Access to view analytics and charts', 1);

-- Visitor Management Permissions
INSERT INTO `permissions` (`permission_name`, `permission_description`, `designated_module_id`) VALUES
('View Visitors', 'View visitor list', 2),
('Create Visitor', 'Check-in new visitors', 2),
('Edit Visitor', 'Modify visitor information', 2),
('Delete Visitor', 'Remove visitor records', 2),
('Check-out Visitor', 'Check-out visitors', 2);

-- Appointment Management Permissions
INSERT INTO `permissions` (`permission_name`, `permission_description`, `designated_module_id`) VALUES
('View Appointments', 'View appointment list', 3),
('Create Appointment', 'Schedule new appointments', 3),
('Edit Appointment', 'Modify appointments', 3),
('Delete Appointment', 'Cancel appointments', 3);

-- Employee Management Permissions
INSERT INTO `permissions` (`permission_name`, `permission_description`, `designated_module_id`) VALUES
('View Employees', 'View employee list', 4),
('Create Employee', 'Add new employees', 4),
('Edit Employee', 'Modify employee details', 4),
('Delete Employee', 'Remove employee records', 4);

-- Masters Permissions
INSERT INTO `permissions` (`permission_name`, `permission_description`, `designated_module_id`) VALUES
('View Masters', 'View company, department, designation', 5),
('Create Masters', 'Add new master records', 5),
('Edit Masters', 'Modify master records', 5),
('Delete Masters', 'Remove master records', 5);

-- Role Management Permissions
INSERT INTO `permissions` (`permission_name`, `permission_description`, `designated_module_id`) VALUES
('View Roles', 'View role list', 6),
('Create Role', 'Create new roles', 6),
('Edit Role', 'Modify role permissions', 6),
('Delete Role', 'Remove roles', 6);

-- Reports Permissions
INSERT INTO `permissions` (`permission_name`, `permission_description`, `designated_module_id`) VALUES
('View Reports', 'Access to view reports', 7),
('Export Reports', 'Export reports to PDF/Excel', 7);

-- =========================================
-- Seed Data for Default Roles
-- =========================================
INSERT INTO `roles` (`role_name`, `status`, `visibility`) VALUES
('Super Admin', 'Active', TRUE),
('Admin', 'Active', TRUE),
('Receptionist', 'Active', TRUE),
('Security', 'Active', TRUE),
('Viewer', 'Active', TRUE);

-- =========================================
-- Assign All Permissions to Super Admin (role_id = 1)
-- =========================================
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, permission_id FROM permissions;

-- Admin gets most permissions (role_id = 2)
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, permission_id FROM permissions WHERE permission_id NOT IN (
  SELECT permission_id FROM permissions WHERE permission_name IN ('Delete Role', 'Delete Employee')
);

-- Receptionist permissions (role_id = 3)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(3, 1), -- View Dashboard
(3, 3), -- View Visitors
(3, 4), -- Create Visitor
(3, 5), -- Edit Visitor
(3, 7), -- Check-out Visitor
(3, 8), -- View Appointments
(3, 9); -- Create Appointment

-- Security permissions (role_id = 4)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(4, 1), -- View Dashboard
(4, 3), -- View Visitors
(4, 7); -- Check-out Visitor

-- Viewer permissions (role_id = 5)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(5, 1), -- View Dashboard
(5, 3), -- View Visitors
(5, 8); -- View Appointments

-- =========================================
-- Done! Role tables created and seeded
-- =========================================
