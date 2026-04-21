
const getAllCompanies = `
  SELECT * FROM companies WHERE status = 'Active';
`;

const getCompanyById = `
 SELECT * FROM companies WHERE company_id = ? AND status = 'Active';
`;

const createCompany = `
  INSERT INTO companies (company_name, status) VALUES (?, ?);
`;

const updateCompany = `
  UPDATE companies SET company_name = ?, status = ? WHERE company_id = ?;
`;

const deleteCompany = `
  DELETE FROM companies WHERE company_id = ?;
`;

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
};

