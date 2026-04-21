const db = require('../db').callbackPool;
const { 
  getStatsQuery, 
  getRecentVisitorsQuery, 
  getUpcomingAppointmentsQuery 
} = require('../queries/dashboard_queries');

const getDashboardData = (req, res) => {
  const responseData = {
    stats: {},
    recentVisitors: [],
    upcomingAppointments: []
  };

  let statsQuery = getStatsQuery;
  let recentQuery = getRecentVisitorsQuery;
  let upcomingQuery = getUpcomingAppointmentsQuery;
  const companyParams = [];
  const recentParams = [];
  const upcomingParams = [];

  if (req.user && req.user.roleId !== 1) {
    const isEmployee = req.user.roleId === 3;

    if (isEmployee) {
      statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM visitors WHERE company_id = ? AND employee_id = ?) as total_visitors,
          (SELECT COUNT(*) FROM employees WHERE status = 'Active' AND company_id = ?) as total_employees,
          (SELECT COUNT(*) FROM companies WHERE status = 'Active') as total_companies,
          (SELECT COUNT(*) FROM appointment_scheduling WHERE appointment_date = CURDATE() AND company_id = ? AND whom_to_meet = ?) as today_appointments,
          (SELECT COUNT(*) FROM visitors WHERE qr_status = 'checked_in' AND company_id = ? AND employee_id = ?) as visitors_checked_in
      `;
      companyParams.push(
        req.user.companyId, req.user.userId, 
        req.user.companyId, 
        req.user.companyId, req.user.userId, 
        req.user.companyId, req.user.userId
      );
      
      recentQuery = recentQuery.replace('ORDER BY', 'WHERE v.company_id = ? AND v.employee_id = ? ORDER BY');
      recentParams.push(req.user.companyId, req.user.userId);
      
      upcomingQuery = upcomingQuery.replace('ORDER BY', 'AND a.company_id = ? AND a.whom_to_meet = ? ORDER BY');
      upcomingParams.push(req.user.companyId, req.user.userId);
    } else {
      // Company Admin
      statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM visitors WHERE company_id = ?) as total_visitors,
          (SELECT COUNT(*) FROM employees WHERE status = 'Active' AND company_id = ?) as total_employees,
          (SELECT COUNT(*) FROM companies WHERE status = 'Active') as total_companies,
          (SELECT COUNT(*) FROM appointment_scheduling WHERE appointment_date = CURDATE() AND company_id = ?) as today_appointments,
          (SELECT COUNT(*) FROM visitors WHERE qr_status = 'checked_in' AND company_id = ?) as visitors_checked_in
      `;
      companyParams.push(req.user.companyId, req.user.companyId, req.user.companyId, req.user.companyId);
      
      recentQuery = recentQuery.replace('ORDER BY', 'WHERE v.company_id = ? ORDER BY');
      recentParams.push(req.user.companyId);
      
      upcomingQuery = upcomingQuery.replace('ORDER BY', 'AND a.company_id = ? ORDER BY');
      upcomingParams.push(req.user.companyId);
    }
  }

  // 1. Get Stats
  db.query(statsQuery, companyParams, (err, statsResult) => {
    if (err) {
      console.error('Dashboard Stats Error:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
    responseData.stats = statsResult[0];

    // 2. Get Recent Visitors
    db.query(recentQuery, recentParams, (err, visitorsResult) => {
      if (err) {
        console.error('Dashboard Visitors Error:', err);
        return res.status(500).json({ error: 'Failed to fetch recent visitors' });
      }
      responseData.recentVisitors = visitorsResult;

      // 3. Get Upcoming Appointments
      db.query(upcomingQuery, upcomingParams, (err, appointmentsResult) => {
        if (err) {
          console.error('Dashboard Appointments Error:', err);
          return res.status(500).json({ error: 'Failed to fetch appointments' });
        }
        responseData.upcomingAppointments = appointmentsResult;

        // Send Final Response
        res.status(200).json(responseData);
      });
    });
  });
};

module.exports = {
  getDashboardData
};
