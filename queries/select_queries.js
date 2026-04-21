const getCompanies = `
  SELECT company_id, company_name FROM companies WHERE status = 'Active';
`;

const getDepartmentsByCompany = `
  SELECT department_id, dept_name FROM departments WHERE company_id = ? AND status = 'Active';
`;

const getDesignationsByCompanyAndDept = `
  SELECT designation_id, desgnation_name FROM designations WHERE company_id = ? AND department_id = ? AND status = 'Active';
`;

const getEmployeesByCompanyDeptDesgn = `
  SELECT emp_id, CONCAT(first_name, ' ', last_name) AS name FROM employees WHERE company_id = ? AND department_id = ? AND designation_id = ? AND status = 'Active';
`;

module.exports = {
  getCompanies,
  getDepartmentsByCompany,
  getDesignationsByCompanyAndDept,
  getEmployeesByCompanyDeptDesgn
};
