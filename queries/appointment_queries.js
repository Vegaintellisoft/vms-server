const db = require('../db');

const insertVisitorQuery = `
INSERT INTO visitors (
  first_name, last_name, email, phone, gender,
  company_id, department_id, designation_id, whom_to_meet,
  purpose, aadhar_no, address, image,
  otp_verified, qr_status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const updateVisitorQrQuery = `
  UPDATE visitors SET qr_code = ? WHERE visitor_id = ?
`;

const insertAppointmentQuery = `
  INSERT INTO appointment_scheduling (
    visitor_id, appointment_date, appointment_time, duration,
    purpose_of_visit, company_id, department_id, designation_id,
    whom_to_meet, reminder, remarks
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const updateAppointmentQuery = `
  UPDATE appointment_scheduling SET
    visitor_id = ?, appointment_date = ?, appointment_time = ?, duration = ?,
    purpose_of_visit = ?, company_id = ?, department_id = ?, designation_id = ?,
    whom_to_meet = ?, reminder = ?, remarks = ?
  WHERE appointment_id = ?
`;

const getAppointmentByIdQuery = `
  SELECT 
    a.*, 
    v.first_name AS visitor_first_name, 
    v.last_name AS visitor_last_name, 
    v.email AS visitor_email, 
    v.phone AS visitor_phone,
    e.first_name AS emp_first_name, 
    e.last_name AS emp_last_name, 
    e.email AS emp_email
  FROM appointment_scheduling a
  JOIN visitors v ON a.visitor_id = v.visitor_id
  JOIN employees e ON a.whom_to_meet = e.emp_id
  WHERE a.appointment_id = ?
`;

const getAppointmentsTableDataQuery = `
  SELECT 
    CONCAT(v.first_name, ' ', v.last_name) AS visitor_name,
    v.email,
    v.phone,
    a.appointment_date,
    a.appointment_time,
    a.duration,
    k.company_name AS company_name,
    CONCAT(e.first_name, ' ', e.last_name )AS employee_name,
    p.purpose AS purpose,
    a.remarks
  FROM appointment_scheduling a
  LEFT JOIN employees e 
    ON a.whom_to_meet = e.emp_id
  LEFT JOIN purpose p 
    ON a.purpose_of_visit = p.purpose_id
  LEFT JOIN companies k 
    ON a.company_id = k.company_id
  JOIN visitors v ON a.visitor_id = v.visitor_id
  ORDER BY a.appointment_date DESC
`;

const getRemarksByAppointmentIdQuery  = `
 SELECT remarks 
  FROM appointment_scheduling 
  WHERE appointment_id = ?;
`;

const getVisitorAppointmentQuery = `
  SELECT 
      v.first_name,
      v.last_name,
      v.image,
      v.purpose,
      a.appointment_id,
      v.email,
      e.first_name AS whom_to_meet,
      v.qr_status,
      v.qr_code
  FROM 
      visitors v
  JOIN 
      appointment_scheduling a ON v.visitor_id = a.visitor_id
  JOIN 
      employees e ON v.whom_to_meet = e.emp_id
  WHERE 
      (v.email = ? OR v.phone = ?)
      AND v.qr_status = 'active'
  LIMIT 1
`;

const checkVisitorQuery = `
  SELECT visitor_id FROM visitors 
  WHERE (phone = ? OR email = ?) AND qr_status = 'active' 
  LIMIT 1
`;

const insertOtpQuery = `
  INSERT INTO otps (phone, email, otp, expires_at) 
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE otp = VALUES(otp), expires_at = VALUES(expires_at)
`;

const selectOtpQuery = `
    SELECT otp, expires_at 
    FROM otps 
    WHERE 
      (phone = ? AND ? IS NOT NULL) 
      OR 
      (email = ? AND ? IS NOT NULL)
    ORDER BY expires_at DESC
    LIMIT 1
`;

const deleteOtpQuery = `
  DELETE FROM otps WHERE (phone = ? OR email = ?)
`;

const fetchVisitorQuery = `
  SELECT 
    v.first_name, v.last_name, v.image, v.phone, v.address, a.appointment_id, 
    CONCAT(e.first_name, ' ', e.last_name) AS whom_to_meet, 
    k.purpose, v.qr_code
  FROM visitors v
  JOIN purpose k ON v.purpose = k.purpose_id
  JOIN appointment_scheduling a ON v.visitor_id = a.visitor_id
  JOIN employees e ON a.whom_to_meet = e.emp_id
  WHERE (v.phone = ? OR v.email = ?) AND v.qr_status = 'active'
  LIMIT 1
`;

module.exports = {
  checkVisitorQuery,
  insertOtpQuery,
  selectOtpQuery,
  deleteOtpQuery,
  fetchVisitorQuery,
  getVisitorAppointmentQuery,
  getAppointmentByIdQuery,
  insertVisitorQuery,
  insertAppointmentQuery,
  updateAppointmentQuery,
  getAppointmentsTableDataQuery,
  getRemarksByAppointmentIdQuery,
  updateVisitorQrQuery
};
