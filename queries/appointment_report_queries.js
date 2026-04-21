const getAppointmentsQuery = `
  SELECT 
    a.appointment_id,
    CONCAT(v.first_name, ' ', v.last_name) AS visitor_name,
    v.email,
    v.phone,
    CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
    a.appointment_date,
    a.appointment_time,
    a.duration,
    a.purpose_of_visit,
    a.reminder,
    a.remarks,
    a.created_at,
    a.company_id
  FROM 
    appointment_scheduling a
  JOIN 
    visitors v ON a.visitor_id = v.visitor_id
  JOIN 
    employees e ON a.whom_to_meet = e.emp_id
  ORDER BY 
    a.appointment_date DESC, a.appointment_time DESC
`;

module.exports = {
  getAppointmentsQuery
};
