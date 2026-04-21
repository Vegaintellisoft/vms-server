const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboard_controller');

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Get dashboard statistics and recent activity
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total_visitors: { type: integer }
 *                     total_employees: { type: integer }
 *                     total_companies: { type: integer }
 *                     today_appointments: { type: integer }
 *                     visitors_checked_in: { type: integer }
 *                 recentVisitors:
 *                   type: array
 *                 upcomingAppointments:
 *                   type: array
 */
router.get('/', getDashboardData);

module.exports = router;
