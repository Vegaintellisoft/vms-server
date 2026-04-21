const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department_controller');

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Manage departments under companies
 */

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: A list of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       department_id:
 *                         type: integer
 *                       company_id:
 *                         type: integer
 *                       dept_name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       company_name:
 *                         type: string
 */
router.get('/', departmentController.getAll);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the department to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single department's details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 department_id:
 *                   type: integer
 *                 company_id:
 *                   type: integer
 *                 dept_name:
 *                   type: string
 *                 status:
 *                   type: string
 *       404:
 *         description: Department not found
 */
router.get('/:id', departmentController.getById);

/**
 * @swagger
 * /departments/create:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - name
 *               - status
 *             properties:
 *               company_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       201:
 *         description: Department created successfully
 */
router.post('/create', departmentController.create);

/**
 * @swagger
 * /departments/update/{id}:
 *   put:
 *     summary: Update department details
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_id
 *               - name
 *               - status
 *             properties:
 *               company_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: Department updated successfully
 */
router.put('/update/:id', departmentController.update);

/**
 * @swagger
 * /departments/delete/{id}:
 *   delete:
 *     summary: Mark a department as Inactive
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Department deactivated successfully
 */

router.delete('/delete/:id', departmentController.deleteDepartment);

module.exports = router;
