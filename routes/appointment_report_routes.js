const express = require('express');
const router = express.Router();
const { getAllAppointments } = require('../controllers/appointment_report_controller');

/**
 * @swagger
 * /api/appointments_report:
 *   get:
 *     summary: Get all appointments with visitor and employee details
 *     description: Returns a list of appointments including visitor and employee info
 *     responses:
 *       200:
 *         description: A list of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   visitor_name:
 *                     type: string
 *                   email_id:
 *                     type: string
 *                   mobile_no:
 *                     type: string
 *                   employee_name:
 *                     type: string
 *                   expected_date:
 *                     type: string
 *                     format: date
 *                   expected_time:
 *                     type: string
 *                     format: time
 */
router.get('/', getAllAppointments);

module.exports = router;
