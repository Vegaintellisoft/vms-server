const getVisitorsQuery = `
  SELECT 
    v.visitor_id,
    v.first_name,
    v.last_name,
    v.email,
    v.phone,
    v.gender,
    c.company_name,
    d.dept_name AS department_name,
    des.desgnation_name AS designation_name,
    CONCAT(e.first_name, ' ', e.last_name) AS whom_to_meet,
    p.purpose,
    v.sign_in_time,
    v.sign_out_time,
    v.created_at,
    v.qr_status,
    v.company_id
  FROM 
    visitors v
  LEFT JOIN employees e ON v.whom_to_meet = e.emp_id
  LEFT JOIN companies c ON v.company_id = c.company_id
  LEFT JOIN departments d ON v.department_id = d.department_id
  LEFT JOIN designations des ON v.designation_id = des.designation_id
  LEFT JOIN purpose p ON v.purpose = p.purpose_id
  ORDER BY 
    v.created_at DESC
`;


module.exports = {
  getVisitorsQuery
};