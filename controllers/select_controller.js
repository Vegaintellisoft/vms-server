const db = require('../db').callbackPool;
const queries = require('../queries/select_queries');

exports.getCompanies = (req, res) => {
  db.query(queries.getCompanies, (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.send(rows);
  });
};

exports.getDepartments = (req, res) => {
  const companyId = req.params.company_id;
  db.query(queries.getDepartmentsByCompany, [companyId], (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.send(rows);
  });
};

exports.getDesignations = (req, res) => {
  const { company_id, department_id } = req.params;
  db.query(queries.getDesignationsByCompanyAndDept, [company_id, department_id], (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.send(rows);
  });
};

exports.getEmployees = (req, res) => {
  const { company_id, department_id, designation_id } = req.params;
  db.query(queries.getEmployeesByCompanyDeptDesgn, [company_id, department_id, designation_id], (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.send(rows);
  });
};
