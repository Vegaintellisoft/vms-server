const getStatsQuery = `
  SELECT 
    (SELECT COUNT(*) FROM visitors) as total_visitors,
    (SELECT COUNT(*) FROM employees WHERE status = 'Active') as total_employees,
    (SELECT COUNT(*) FROM companies WHERE status = 'Active') as total_companies,
    (SELECT COUNT(*) FROM appointment_scheduling WHERE appointment_date = CURDATE()) as today_appointments,
    (SELECT COUNT(*) FROM visitors WHERE qr_status = 'checked_in') as visitors_checked_in
`;

const getRecentVisitorsQuery = `
  SELECT 
    v.visitor_id,
    CONCAT(v.first_name, ' ', v.last_name) as name,
    c.company_name,
    v.sign_in_time,
    v.qr_status
  FROM visitors v
  LEFT JOIN companies c ON v.company_id = c.company_id
  ORDER BY v.created_at DESC
  LIMIT 5
`;

const getUpcomingAppointmentsQuery = `
  SELECT 
    a.appointment_id,
    CONCAT(v.first_name, ' ', v.last_name) as visitor_name,
    CONCAT(e.first_name, ' ', e.last_name) as employee_name,
    a.appointment_time,
    a.appointment_date
  FROM appointment_scheduling a
  JOIN visitors v ON a.visitor_id = v.visitor_id
  JOIN employees e ON a.whom_to_meet = e.emp_id
  WHERE a.appointment_date >= CURDATE()
  ORDER BY a.appointment_date ASC, a.appointment_time ASC
  LIMIT 5
`;

module.exports = {
  getStatsQuery,
  getRecentVisitorsQuery,
  getUpcomingAppointmentsQuery
};
