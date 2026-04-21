const sendOtpQuery = `
  INSERT INTO temp_visitors (phone, otp, otp_expiry, otp_verified)
  VALUES (?, ?, ?, 0)
  ON DUPLICATE KEY UPDATE otp = ?, otp_expiry = ?, otp_verified = 0
`;

const selectOtpQuery = 'SELECT otp, otp_expiry FROM temp_visitors WHERE phone = ? ORDER BY otp_expiry DESC LIMIT 1';

const verifyOtpQuery = 'UPDATE temp_visitors SET otp_verified = 1 WHERE phone = ?';

const checkVerificationQuery = 'SELECT otp_verified FROM temp_visitors WHERE phone = ?';

const submitVisitorQuery = `
  UPDATE temp_visitors SET
    first_name = ?, last_name = ?, email = ?, gender = ?, company_id = ?, department_id = ?, 
    designation_id = ?, whom_to_meet = ?, purpose = ?, aadhar_no = ?, address = ?, image = ?
  WHERE phone = ?
`;
const selectTempVisitorByPhone = 'SELECT * FROM temp_visitors WHERE phone = ?';

const updateTempVisitor = `
  UPDATE temp_visitors SET
    first_name = ?, last_name = ?, email = ?, gender = ?, company_id = ?, department_id = ?, 
    designation_id = ?, whom_to_meet = ?, purpose = ?, aadhar_no = ?, address = ?, image = ?
  WHERE phone = ?
`;

const insertIntoVisitorMain = `
  INSERT INTO visitors (
    first_name, last_name, email, phone, gender,
    company_id, department_id, designation_id, whom_to_meet,
    purpose, aadhar_no, address, visitor_company_name, image,
    otp, otp_verified, qr_status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
`;


// const getAllVisitorsQuery = 'SELECT * FROM visitors';
const getAllVisitorsQuery = `
    SELECT
    v.visitor_id AS visitor_id,
    CONCAT(v.first_name, ' ', v.last_name) AS first_name,
    v.email AS email,
    v.phone AS phone,
    v.gender AS gender,
    v.company_id,
    v.department_id,
    v.designation_id,
    CONCAT(e.first_name, ' ', e.last_name) AS whom_to_meet,
    v.purpose,
    v.aadhar_no,
    v.address,
    v.image,
    v.status,
    v.qr_code,
    v.sign_in_time ,
    v.sign_out_time 
FROM visitors v
LEFT JOIN employees e 
    ON v.whom_to_meet = e.emp_id
ORDER BY v.sign_in_time DESC;
`;

const getVisitorDetailsQuery = `
    SELECT
        v.visitor_id AS visitor_id,
        CONCAT(v.first_name, ' ', v.last_name) AS visitor_name,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        v.sign_in_time AS checkin,
        v.sign_out_time AS checkout,
        v.status,
        v.qr_code
    FROM visitors v
    LEFT JOIN employees e ON v.whom_to_meet = e.id
    ORDER BY v.sign_in_time DESC;
`;

const updateVisitorStatusQuery = 'UPDATE visitors SET status = ? WHERE visitor_id = ?';

// const getVisitorQrCodeById = `
//   SELECT qr_code, first_name, last_name, email, phone,purpose,whom_to_meet FROM visitors 
//   WHERE visitor_id = ? AND qr_status = 'active' 
//   LIMIT 1
// `;

const getVisitorQrCodeById = `SELECT 
  v.qr_code, 
  v.unique_code,
  v.first_name AS visitor_first_name, 
  v.last_name AS visitor_last_name, 
  v.email, 
  p.purpose AS purpose_text,         -- Get text from purpose table
  v.visitor_id,
  v.phone, 
  v.image,
  v.whom_to_meet,
  e.emp_id,
  e.first_name AS employee_first_name, 
  e.last_name AS employee_last_name
FROM visitors v
JOIN employees e ON v.whom_to_meet = e.emp_id
JOIN purpose p ON v.purpose = p.purpose_id    -- This joins purpose_id to visitors.purpose
WHERE v.visitor_id = ? 
  AND v.qr_status = 'active'
LIMIT 1;
`;

const insertIntoVisitorOtp = `
  INSERT INTO visitors (
    first_name, last_name, email, phone, gender,
    company_id, department_id, designation_id, whom_to_meet,
    purpose, aadhar_no, address, visitor_company_name, image,
    otp, otp_verified, qr_status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
`;

const updateVisitorQrCode = `
  UPDATE visitors SET qr_code = ?, unique_code = ? WHERE visitor_id = ?
`;

const updateVisitorQuery = `
  UPDATE visitors SET
    first_name=?, last_name=?, email=?, phone=?, gender=?, aadhar_no=?, address=?,
    company_id=?, department_id=?, designation_id=?, whom_to_meet=?, purpose=?${'${imageClause}'}
  WHERE visitor_id=?
`;
module.exports = {
  updateVisitorQuery,
  getVisitorQrCodeById,
  updateVisitorStatusQuery,
  getAllVisitorsQuery,
  sendOtpQuery,
  selectOtpQuery,
  verifyOtpQuery,
  checkVerificationQuery,
  submitVisitorQuery,
    selectTempVisitorByPhone,
  updateTempVisitor,
  insertIntoVisitorMain,
  getVisitorDetailsQuery,
  updateVisitorQrCode,
  insertIntoVisitorOtp
};
