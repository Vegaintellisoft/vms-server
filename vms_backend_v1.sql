create database VMS;
use VMS;

CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE designations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  department_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE modules (
	  module_id int PRIMARY KEY AUTO_INCREMENT,
    module_name VARCHAR(150) UNIQUE NOT NULL,
    module_description MEDIUMTEXT
);

CREATE TABLE permissions(
	  permission_id int PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    designated_module_id int NOT NULL,
    permission_description MEDIUMTEXT,
    CONSTRAINT fk_module
		FOREIGN KEY(designated_module_id) 
        REFERENCES modules(module_id) 
        ON DELETE CASCADE
);

CREATE TABLE roles(
	  role_id int PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL default current_timestamp,
	  status ENUM('Active', 'Inactive') DEFAULT 'Active',
    visibility bool NOT NULL default true
);

CREATE TABLE role_permissions(
	role_id int,
    permission_id int,
    PRIMARY KEY(role_id,permission_id),
    CONSTRAINT fk_role
        FOREIGN KEY (role_id) 
        REFERENCES roles (role_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_permission
        FOREIGN KEY (permission_id) 
        REFERENCES permissions (permission_id)
        ON DELETE CASCADE
);

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  joining_date DATE,
  gender ENUM('Male', 'Female', 'Other') DEFAULT 'Other',
  company_id INT NOT NULL,
  department_id INT NOT NULL,
  designation_id INT NOT NULL,
  role_id INT NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  password VARCHAR(255) NOT NULL,
  remarks TEXT,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  visibility bool DEFAULT True,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (designation_id) REFERENCES designations(id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE refresh_tokens(
	id int PRIMARY KEY AUTO_INCREMENT,
	employee_id int,
    token text,
    expires_at TIMESTAMP default (CURRENT_DATE + INTERVAL 7 DAY),
    CONSTRAINT fk_employee
		FOREIGN KEY(employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE
);
