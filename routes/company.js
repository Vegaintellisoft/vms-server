const express = require("express");
const companyController = require("../controllers/company_controller");

const router = express.Router();

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     tags:
 *       - Companies
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
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   status:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const companies = await companyController.getAll();
    res.status(200).json(companies);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get a company by ID
 *     tags:
 *       - Companies
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the company to get
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Company data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 status:
 *                   type: string
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const company = await companyController.getById(id);
    res.status(200).json(company);
  } catch (error) {
    // If company not found, status will be 404 with message "Company not found"
    res.status(error.status || 500).json({ error: error.message || "Server error" });
  }
});

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company
 *     tags:
 *       - Companies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *                 example: Example Company
 *               status:
 *                 type: string
 *                 example: Active
 *     responses:
 *       201:
 *         description: Company created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 status:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res) => {
  const { name, status } = req.body;
  try {
    const newCompany = await companyController.create(name, status);
    res.status(201).json(newCompany);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Update an existing company
 *     tags:
 *       - Companies
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the company to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Company Name
 *               status:
 *                 type: string
 *                 example: Inactive
 *     responses:
 *       200:
 *         description: Company updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 status:
 *                   type: string
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { name, status } = req.body;
  try {
    const updatedCompany = await companyController.update(id, name, status);
    res.status(200).json(updatedCompany);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;
