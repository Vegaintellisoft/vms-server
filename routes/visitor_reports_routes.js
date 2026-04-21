const express = require('express');
const router = express.Router();
const { getAllVisitors } = require('../controllers/visitor_report_controller');

/**
 * @swagger
 * /api/visitors_reports:
 *   get:
 *     summary: Get all visitors
 *     description: Returns a list of visitors with their details
 *     responses:
 *       200:
 *         description: List of visitors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   visitor_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   whom_to_meet:
 *                     type: string
 *                   sign_in_time:
 *                     type: string
 *                     format: date-time
 *                   sign_out_time:
 *                     type: string
 *                     format: date-time
 */
router.get('/', getAllVisitors);

module.exports = router;
