const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employees_controller');
const upload = require('../utils/upload'); // multer middleware
const { employeeValidation } = require('../middleware/validators');

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management APIs
 */

/**
 * @swagger
 * /api/v1/employees/add-employee:
 *   post:
 *     summary: Add a new employee
 *     tags: [Employees]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               company_id:
 *                 type: integer
 *               department_id:
 *                 type: integer
 *               designation_id:
 *                 type: integer
 *               password:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Employee added successfully
 *       400:
 *         description: Email or phone already exists
 *       500:
 *         description: Server error
 */

router.post('/add-employee', upload.single('image'), employeeValidation, employeeController.addEmployee);

/**
 * @swagger
 * /api/v1/employees/update-employee/{id}:
 *   put:
 *     summary: Update an employee by ID
 *     tags: [Employees]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               company_id:
 *                 type: integer
 *               department_id:
 *                 type: integer
 *               designation_id:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       500:
 *         description: Server error
 */
router.put('/update-employee/:id', upload.single('image'), employeeValidation, employeeController.updateEmployee);

/**
 * @swagger
 * /api/v1/employees/get_all_employee:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: List of employees
 *       500:
 *         description: Server error
 */
router.get('/get_all_employee', employeeController.getAllEmployees);

/**
 * @swagger
 * /api/v1/employees/get_emp_id/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee data
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.get('/get_emp_id/:id', employeeController.getEmployeeById);

/**
 * @swagger
 * /api/v1/employees/delete_emp_id/{id}:
 *   delete:
 *     summary: Delete employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/delete_emp_id/:id', employeeController.deleteEmployee);

module.exports = router;
