const express = require('express');
const router = express.Router();
const selectController = require('../controllers/select_controller');

/**
 * @swagger
 * /api/selects/companies:
 *   get:
 *     summary: Get list of all companies
 *     tags: [Selects]
 *     responses:
 *       200:
 *         description: List of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   company_id:
 *                     type: integer
 *                   company_name:
 *                     type: string
 *                   status:
 *                     type: string
 */
router.get('/companies', selectController.getCompanies);

/**
 * @swagger
 * /api/selects/departments/{company_id}:
 *   get:
 *     summary: Get list of departments by company ID
 *     tags: [Selects]
 *     parameters:
 *       - in: path
 *         name: company_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the company
 *     responses:
 *       200:
 *         description: List of departments for the given company
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   department_id:
 *                     type: integer
 *                   dept_name:
 *                     type: string
 *                   status:
 *                     type: string
 */
router.get('/departments/:company_id', selectController.getDepartments);

/**
 * @swagger
 * /api/selects/designations/{company_id}/{department_id}:
 *   get:
 *     summary: Get list of designations by company ID and department ID
 *     tags: [Selects]
 *     parameters:
 *       - in: path
 *         name: company_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the company
 *       - in: path
 *         name: department_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the department
 *     responses:
 *       200:
 *         description: List of designations for the given company and department
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   designation_id:
 *                     type: integer
 *                   desgnation_name:
 *                     type: string
 *                   status:
 *                     type: string
 */
router.get('/designations/:company_id/:department_id', selectController.getDesignations);

/**
 * @swagger
 * /api/selects/employees/{company_id}/{department_id}/{designation_id}:
 *   get:
 *     summary: Get list of employees by company ID, department ID, and designation ID
 *     tags: [Selects]
 *     parameters:
 *       - in: path
 *         name: company_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the company
 *       - in: path
 *         name: department_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the department
 *       - in: path
 *         name: designation_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the designation
 *     responses:
 *       200:
 *         description: List of employees for the given company, department and designation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   emp_id:
 *                     type: integer
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   status:
 *                     type: string
 */
router.get('/employees/:company_id/:department_id/:designation_id', selectController.getEmployees);

module.exports = router;
