const db = require('../db').callbackPool;
const { getAppointmentsQuery } = require('../queries/appointment_report_queries');

const getAllAppointments = (req, res) => {
  db.query(getAppointmentsQuery, (err, results) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
    res.status(200).json(results);
  });
};

module.exports = {
  getAllAppointments
};
