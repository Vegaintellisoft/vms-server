const getAllDepartments = `
  SELECT d.*, c.company_name
  FROM departments d 
  JOIN companies c ON d.company_id = c.company_id
  WHERE d.status='Active';
`;

const getDepartmentByCompany = `
  SELECT d.*
  FROM departments d 
  JOIN companies c ON d.company_id = c.company_id
  WHERE c.company_id = ? AND d.status='Active';
`

const getDepartmentById = `
  SELECT * FROM departments WHERE department_id = ? AND status='Active';
`;

const createDepartment = `
  INSERT INTO departments (company_id, dept_name, status) VALUES (?, ?, ?);
`;

const updateDepartment = `
  UPDATE departments SET company_id = ?, dept_name = ?, status = ? WHERE department_id = ?;
`;

const deleteDepartment = `
  UPDATE departments SET status='Inactive' WHERE department_id=?;
`;

module.exports = {
  getAllDepartments,
  getDepartmentByCompany,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
