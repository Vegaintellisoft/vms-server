const db = require('../db').callbackPool;
const { getVisitorsQuery } = require('../queries/visitor_reports_queries');

const getAllVisitors = (req, res) => {
  db.query(getVisitorsQuery, (err, results) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ error: 'Failed to fetch visitors' });
    }
    res.status(200).json(results);
  });
};

module.exports = {
  getAllVisitors
};
