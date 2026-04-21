// const express = require('express');
// const router = express.Router();
// const dropdownController = require('../controllers/dropdown_controller');

// /**
//  * @swagger
//  * tags:
//  *   name: DropDowns
//  *   description: Dropdown API endpoints for companies, departments, designations, and employees
//  */

// /**
//  * @swagger
//  * /api/companies:
//  *   get:
//  *     summary: Retrieve all active companies
//  *     tags: [DropDowns]
//  *     responses:
//  *       200:
//  *         description: List of active companies
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   company_id:
//  *                     type: integer
//  *                   company_name:
//  *                     type: string
//  */
// router.get('/companies', dropdownController.getCompanies);

// /**
//  * @swagger
//  * /api/departments:
//  *   post:
//  *     summary: Retrieve active departments for a specific company
//  *     tags: [DropDowns]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - companyId
//  *             properties:
//  *               companyId:
//  *                 type: integer
//  *     responses:
//  *       200:
//  *         description: List of active departments for the company
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   department_id:
//  *                     type: integer
//  *                   dept_name:
//  *                     type: string
//  *       500:
//  *         description: Database error
//  */
// router.post('/departments', dropdownController.getDepartmentsByCompany);

// /**
//  * @swagger
//  * /api/designations:
//  *   post:
//  *     summary: Retrieve active designations for a specific department
//  *     tags: [DropDowns]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               departmentId:
//  *                 type: integer
//  *                 description: The ID of the department
//  *                 example: 1
//  *     responses:
//  *       200:
//  *         description: List of active designations for the department
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   designation_id:
//  *                     type: integer
//  *                   desgnation_name:
//  *                     type: string
//  */
// router.post('/designations', dropdownController.getDesignationsByDepartment);

// /**
//  * @swagger
//  * /api/get_employees:
//  *   post:
//  *     summary: Retrieve active employees for a specific designation
//  *     tags: [DropDowns]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - designationId
//  *             properties:
//  *               designationId:
//  *                 type: integer
//  *                 description: The ID of the designation
//  *                 example: 1
//  *     responses:
//  *       200:
//  *         description: List of active employees for the designation
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   emp_id:
//  *                     type: integer
//  *                   emp_name:
//  *                     type: string
//  *       500:
//  *         description: Server error
//  */
// router.post('/get_employees', dropdownController.getEmployeesByDesignation);

// /**
//  * @swagger
//  * /api/purposes:
//  *   get:
//  *     summary: Retrieve all purposes for dropdown
//  *     tags: [DropDowns]
//  *     responses:
//  *       200:
//  *         description: List of purposes for dropdown
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   id:
//  *                     type: integer
//  *                     description: Purpose ID
//  *                     example: 1
//  *                   name:
//  *                     type: string
//  *                     description: Purpose name
//  *                     example: Consultation
//  *       500:
//  *         description: Server error
//  */
// router.get('/purposes', dropdownController.getAllPurposes);


// module.exports = router;

const express = require('express');
const router = express.Router();
const dropdownController = require('../controllers/dropdown_controller');

/**
 * @swagger
 * tags:
 *   name: Dropdowns
 *   description: APIs for dropdown population
 */

/**
 * @swagger
 * /api/v1/public/dropdowns/companies:
 *   get:
 *     summary: Get list of active companies
 *     tags: [Dropdowns]
 *     responses:
 *       200:
 *         description: A list of active companies
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
 */
router.get('/companies', dropdownController.getCompanies);

/**
 * @swagger
 * /api/v1/public/dropdowns/departments/{companyId}:
 *   get:
 *     summary: Get active departments by company ID (path parameter)
 *     tags: [Dropdowns]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The company ID
 *     responses:
 *       200:
 *         description: A list of active departments for a given company
 */
router.get('/departments/:companyId', dropdownController.getDepartmentsByCompanyId);

/**
 * @swagger
 * /api/v1/public/dropdowns/departments:
 *   post:
 *     summary: Get active departments by company (body parameter)
 *     tags: [Dropdowns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *             properties:
 *               companyId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: A list of active departments for a given company
 */
router.post('/departments', dropdownController.getDepartmentsByCompany);

/**
 * @swagger
 * /api/v1/public/dropdowns/designations/{departmentId}:
 *   get:
 *     summary: Get active designations by department ID (path parameter)
 *     tags: [Dropdowns]
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The department ID
 *     responses:
 *       200:
 *         description: A list of active designations
 */
router.get('/designations/:departmentId', dropdownController.getDesignationsByDepartmentId);

/**
 * @swagger
 * /api/v1/public/dropdowns/designations:
 *   post:
 *     summary: Get active designations by department (body parameter)
 *     tags: [Dropdowns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departmentId
 *             properties:
 *               departmentId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: A list of active designations
 */
router.post('/designations', dropdownController.getDesignationsByDepartment);

/**
 * @swagger
 * /api/v1/public/dropdowns/employees/{designationId}:
 *   get:
 *     summary: Get active employees by designation ID (path parameter)
 *     tags: [Dropdowns]
 *     parameters:
 *       - in: path
 *         name: designationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The designation ID
 *     responses:
 *       200:
 *         description: A list of active employees for a given designation
 */
router.get('/employees/:designationId', dropdownController.getEmployeesByDesignationId);

/**
 * @swagger
 * /api/v1/public/dropdowns/employees:
 *   post:
 *     summary: Get active employees by designation (body parameter)
 *     tags: [Dropdowns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - designation_id
 *             properties:
 *               designation_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: A list of active employees for a given designation
 */
router.post('/employees', dropdownController.getEmployeesByDesignation);

/**
 * @swagger
 * /api/v1/public/dropdowns/purposes:
 *   get:
 *     summary: Get list of all purposes
 *     tags: [Dropdowns]
 *     responses:
 *       200:
 *         description: A list of purposes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   purpose_id:
 *                     type: integer
 *                   purpose:
 *                     type: string
 */
router.get('/purposes', dropdownController.getAllPurposes);

/**
 * @swagger
 * /api/v1/public/dropdowns/all-employees:
 *   get:
 *     summary: Get all active employees along with their companies
 *     tags: [Dropdowns]
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get('/all-employees', dropdownController.getAllEmployeesPublic);

module.exports = router;

