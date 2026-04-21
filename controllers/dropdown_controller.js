const db = require('../db').callbackPool;
const queries = require('../queries/dropdownQueries');

// Get all active companies
exports.getCompanies = (req, res) => {
  db.query(queries.getActiveCompanies, (err, results) => {
    if (err) {
      console.error('Error fetching companies:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get active departments for active company (POST - body parameter)
exports.getDepartmentsByCompany = (req, res) => {
  const { companyId } = req.body;
  db.query(queries.getDepartmentsByCompany, [companyId], (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get active departments for active company (GET - path parameter)
exports.getDepartmentsByCompanyId = (req, res) => {
  const { companyId } = req.params;
  db.query(queries.getDepartmentsByCompany, [companyId], (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get active designations where company and department active (POST - body parameter)
exports.getDesignationsByDepartment = (req, res) => {
  const { departmentId } = req.body;
  db.query(queries.getDesignationsByDepartment, [departmentId], (err, results) => {
    if (err) {
      console.error('Error fetching designations:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get active designations where company and department active (GET - path parameter)
exports.getDesignationsByDepartmentId = (req, res) => {
  const { departmentId } = req.params;
  db.query(queries.getDesignationsByDepartment, [departmentId], (err, results) => {
    if (err) {
      console.error('Error fetching designations:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get active employees where company and designation active (POST - body parameter)
exports.getEmployeesByDesignation = (req, res) => {
  const { designationId, designation_id } = req.body;
  // Support both 'designationId' and 'designation_id' for compatibility
  const id = designationId || designation_id;
  db.query(queries.getEmployeesByDesignation, [id], (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get active employees where company and designation active (GET - path parameter)
exports.getEmployeesByDesignationId = (req, res) => {
  const { designationId } = req.params;
  db.query(queries.getEmployeesByDesignation, [designationId], (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get all purposes
exports.getAllPurposes = (req, res) => {
  db.query(queries.getAllPurposes, (err, results) => {
    if (err) {
      console.error('Error fetching purposes:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get all active public employees
exports.getAllEmployeesPublic = (req, res) => {
  db.query(queries.getAllEmployeesPublic, (err, results) => {
    if (err) {
      console.error('Error fetching all employees:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};
