const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment_controller');
const { appointmentValidation, appointmentOtpValidation, appointmentVerifyOtpValidation } = require('../middleware/validators');

/**
 * @swagger
 * /api/v1/appointments/send-otp:
 *   post:
 *     summary: Send OTP to visitor via email or phone
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
const multer = require('multer');

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/send-otp', appointmentOtpValidation, appointmentController.sendOtp);

/**
 * @swagger
 * /api/v1/appointments/verify-otp:
 *   post:
 *     summary: Verify OTP and fetch visitor appointment info
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment and visitor data returned
 */
router.post('/verify-otp', appointmentVerifyOtpValidation, appointmentController.verifyOtp);

/**
 * @swagger
 * /api/v1/appointments/create:
 *   post:
 *     summary: Create visitor and appointment, generate QR
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *               aadhar_no:
 *                 type: string
 *               address:
 *                 type: string
 *               image:
 *                 type: string
 *               purpose_of_visit:
 *                 type: string
 *               appointment_date:
 *                 type: string
 *               appointment_time:
 *                 type: string
 *               duration:
 *                 type: integer
 *               company_id:
 *                 type: integer
 *               department_id:
 *                 type: integer
 *               designation_id:
 *                 type: integer
 *               whom_to_meet:
 *                 type: integer
 *               reminder:
 *                 type: boolean
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       500:
 *         description: Server error
 */
router.post('/create', upload.single('image'), appointmentValidation, appointmentController.createAppointment);

/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   put:
 *     summary: Update an existing appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visitor_id:
 *                 type: integer
 *               appointment_date:
 *                 type: string
 *                 format: date
 *               appointment_time:
 *                 type: string
 *                 format: time
 *               duration:
 *                 type: integer
 *               purpose_of_visit:
 *                 type: string
 *               company_id:
 *                 type: integer
 *               department_id:
 *                 type: integer
 *               designation_id:
 *                 type: integer
 *               whom_to_meet:
 *                 type: integer
 *               reminder:
 *                 type: boolean
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put('/:id', appointmentValidation, appointmentController.updateAppointment);

/**
 * @swagger
 * /api/v1/appointments/fetch_appointment:
 *   post:
 *     summary: Fetch appointment details by appointment ID
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.post('/fetch_appointment', appointmentController.getAppointmentById);

/**
 * @swagger
 * /api/v1/appointments/table-data:
 *   get:
 *     summary: Get appointment table data
 *     description: Returns a list of visitor appointments with name, email, phone, date, purpose, and remarks.
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: A list of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Appointments fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       visitor_name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: john@example.com
 *                       phone:
 *                         type: string
 *                         example: 1234567890
 *                       appointment_date:
 *                         type: string
 *                         format: date
 *                         example: 2025-06-01
 *                       purpose:
 *                         type: string
 *                         example: Business Meeting
 *                       remarks:
 *                         type: string
 *                         example: First-time visitor
 *       500:
 *         description: Internal server error
 */
router.get('/table-data', appointmentController.getAppointmentsTableData);


module.exports = router;
