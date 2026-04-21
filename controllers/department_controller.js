const db = require("../db").callbackPool; // Use callback-style pool
const dbPromise = require("../db").promise; // Use promise-based pool for async functions
const queries = require("../queries/department_queries");

exports.getAll = (req, res) => {
  db.query(queries.getAllDepartments, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching departments', error: err });
    }
    res.status(200).json(results);
  });
};

exports.getByIdAsync = async (id) => {
  try {
    const [rows] = await dbPromise.query(queries.getDepartmentById, [id]);
    if (rows.length === 0) throw { status: 404, message: "Department not found" };
    return rows[0];
  } catch (error) {
    throw { status: error.status || 500, message: error.message || "Internal server error" };
  }
};

exports.getById = (req, res) => {
  const { id } = req.params;
  db.query(queries.getDepartmentById, [id], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching department', error: err });
    }
    if (results.length === 0) {
      return res.status(404).send({ message: 'Department not found' });
    }
    res.status(200).json({ message: 'Department retrieved successfully', data: results[0] });
  });
};

exports.create = (req, res) => {
  const { company_id, name, status } = req.body;
  db.query(queries.createDepartment, [company_id, name, status], (err, result) => {
    if (err) {
      return res.status(500).send({ message: 'Error creating department', error: err });
    }
    res.status(201).json({
      message: 'Department created successfully',
      data: { id: result.insertId, company_id, name, status }
    });
  });
};

exports.update = (req, res) => {
  const { id } = req.params;
  const { company_id, name, status } = req.body;
  db.query(queries.updateDepartment, [company_id, name, status, id], (err, result) => {
    if (err) {
      return res.status(500).send({ message: 'Error updating department', error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Department not found' });
    }
    res.status(200).json({
      message: 'Department updated successfully',
      data: { id, company_id, name, status }
    });
  });
};

exports.deleteDepartment = (req, res) => {
  const { id } = req.params;
  db.query(queries.deleteDepartment, [id], (err, result) => {
    if (err) {
      return res.status(500).send({ message: 'Error deleting department', error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Department not found' });
    }
    res.status(200).json({ message: 'Department deactivated successfully' });
  });
};