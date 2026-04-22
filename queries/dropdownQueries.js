// queries/dropdownQueries.js
// Get only active companies
const getActiveCompanies = `
  SELECT company_id, company_name 
  FROM companies 
  WHERE status='Active';
`;

// Get active departments by active company
const getDepartmentsByCompany = `
  SELECT d.department_id, d.dept_name
  FROM departments d
  JOIN companies c ON d.company_id = c.company_id
  WHERE d.company_id = ? AND c.status='Active' AND d.status='Active';
`;

// Get active designations by department where company is active
const getDesignationsByDepartment = `
  SELECT designation_id, desgnation_name as designation_name
  FROM designations
  WHERE department_id = ? AND status='Active';
`;

// Get active employees by designation where company is active
const getEmployeesByDesignation = `
  SELECT emp_id, emp_id as id, CONCAT(first_name, ' ', last_name) as emp_name
  FROM employees
  WHERE designation_id = ? AND status='Active';
`;
// Get all active employees with their companies
const getAllEmployeesPublic = `
  SELECT 
  e.emp_id,
  CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
  e.email,
  e.phone,
  e.company_id,
  c.company_name
FROM employees e
JOIN roles r ON e.role_id = r.role_id
JOIN companies c ON e.company_id = c.company_id
WHERE e.status = 'Active'
  AND r.role_name = 'Admin';
`;


const getAllPurposes = `
 SELECT purpose_id, purpose AS purpose FROM purpose; 
`;

module.exports = {
  getAllPurposes,
  getAllEmployeesPublic,
  getEmployeesByDesignation,
  getDesignationsByDepartment,
  getDepartmentsByCompany,
  getActiveCompanies
};
 // Query to fetch all active companies
  // getActiveCompanies: 'SELECT company_id, company_name FROM companies WHERE status = "Active"',
  
  // // Query to fetch departments based on company ID
  // getDepartmentsByCompany: `
  //   SELECT department_id, dept_name 
  //   FROM departments 
  //   WHERE company_id = ? AND status = "Active"
  // `,

  // // Query to fetch designations based on department ID
  // getDesignationsByDepartment: `
  //   SELECT designation_id, desgnation_name 
  //   FROM designations 
  //   WHERE department_id = ? AND status = "Active"
  // `,

  // // Query to fetch employees based on designation ID
  // getEmployeesByDesignation: `
  //   SELECT emp_id, CONCAT(first_name, ' ', last_name) AS emp_name
  //   FROM employees 
  //   WHERE designation_id = ? AND status = "Active"
  // `