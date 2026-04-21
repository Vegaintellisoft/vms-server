const db = require("../db").promise; // Use promise-based pool
const queries = require("../queries/company_queries");

exports.getAll = async () => {
  try {
    const [rows] = await db.query(queries.getAllCompanies);
    return rows;
  } catch (error) {
    throw { status: 500, message: "Failed to fetch companies" };
  }
};

exports.getById = async (id) => {
  try {
    const [rows] = await db.query(queries.getCompanyById, [id]);
    if (rows.length === 0) {
      throw { status: 404, message: 'Company not found' };
    }
    return rows[0];
  } catch (error) {
    // Propagate the error with status and message
    throw { status: error.status || 500, message: error.message || 'Internal server error' };
  }
};

exports.create = async (name, status) => {
  try {
    const [result] = await db.query(queries.createCompany, [name, status]);
    return { id: result.insertId, name, status };
  } catch (error) {
    throw { status: 500, message: "Failed to create company" };
  }
};

exports.update = async (id, name, status) => {
  try {
    const [result] = await db.query(queries.updateCompany, [name, status, id]);
    if (result.affectedRows === 0) throw { status: 404, message: "Company not found" };
    return { id, name, status };
  } catch (error) {
    if (error.status) throw error;
    throw { status: 500, message: "Failed to update company" };
  }
};
