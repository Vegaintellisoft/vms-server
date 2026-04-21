const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitor_controller');
const multer = require('multer');
const qrcode = require('qrcode');
const { submitDetailsWithoutOtp } = require('../controllers/visitor_controller');
const { 
  visitorValidation, 
  visitorOtpValidation, 
  visitorVerifyOtpValidation 
} = require('../middleware/validators');
const { otpLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');
// QR code generation helper (returns a Promise)
const generateQrCode = (visitorId) => {
  return new Promise((resolve, reject) => {
    const qrData = `visitor-${visitorId}`;
    qrcode.toDataURL(qrData, (err, qrCodeUrl) => {
      if (err) reject(err);
      else resolve(qrCodeUrl);
    });
  });
};

// File upload setup with multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });
/**
 * @swagger
 * tags:
 *   - name: Visitors
 *     description: Visitor management APIs
 */

/**
 * @swagger
 * /api/v1/visitors/send-otp:
 *   post:
 *     summary: Send OTP to a mobile number
 *     tags:
 *       - Visitors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/send-otp', otpLimiter, visitorOtpValidation, visitorController.sendOtp);

/**
 * @swagger
 * /api/v1/visitors/verify-otp:
 *   post:
 *     summary: Verify OTP for a mobile number
 *     tags:
 *       - Visitors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', otpLimiter, visitorVerifyOtpValidation, visitorController.verifyOtp);

/**
 * @swagger
 * /api/v1/visitors/all-visitors:
 *   get:
 *     summary: Retrieve all visitors
 *     tags:
 *       - Visitors
 *     description: Fetches a list of all visitors from the database.
 *     responses:
 *       200:
 *         description: A list of visitors
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
 *                       id:
 *                         type: integer
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       purpose:
 *                         type: string
 *                       aadhar_no:
 *                         type: string
 *                       address:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get('/all-visitors', authenticateToken, visitorController.getAllVisitors);

/**
 * @swagger
 * /api/v1/visitors/visitor-details:
 *   get:
 *     summary: Retrieve visitor details including check-in/out, status, and QR code
 *     tags:
 *       - Visitors
 *     responses:
 *       200:
 *         description: Visitor details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       visitor_id:
 *                         type: integer
 *                       visitor_name:
 *                         type: string
 *                       employee_name:
 *                         type: string
 *                       checkin:
 *                         type: string
 *                         format: date-time
 *                       checkout:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: integer
 *                       qr_code:
 *                         type: string
 *       404:
 *         description: No visitors found
 *       500:
 *         description: Internal Server Error
 */
router.get('/visitor-details', authenticateToken, visitorController.getVisitorDetails);

/**
 * @swagger
 * /api/v1/visitors/submit-details:
 *   post:
 *     summary: Submit visitor details and generate QR code
 *     tags:
 *       - Visitors
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *               company_id:
 *                 type: integer
 *               department_id:
 *                 type: integer
 *               designation_id:
 *                 type: integer
 *               whom_to_meet:
 *                 type: integer
 *               purpose:
 *                 type: string
 *               aadhar_no:
 *                 type: string
 *               address:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Visitor data submitted and QR code generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Visitor data submitted and QR code generated
 *                 visitor_id:
 *                   type: integer
 *                   example: 123
 *                 qr_code:
 *                   type: string
 *                   example: https://yourdomain.com/qrcodes/visitor123.png
 */
router.post('/submit-details', upload.single('image'), visitorValidation, visitorController.submitDetails);

/**
 * @swagger
 * /api/v1/visitors/qr-scan:
 *   post:
 *     summary: Handle visitor QR code scan (Check-in/Check-out)
 *     tags:
 *       - Visitors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visitor check-in/check-out status updated
 *       404:
 *         description: Visitor not found
 */
router.post('/qr-scan', visitorController.handleQrScan);

/**
 * @swagger
 * /visitor/{id}/status:
 *   put:
 *     summary: Update visitor status by ID
 *     tags:
 *       - Visitors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Visitor ID
 *     requestBody:
 *       description: New status value
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status updated successfully
 *       404:
 *         description: Visitor not found or status not updated
 *       500:
 *         description: Database error
 */
router.put('/:id/status', visitorController.updateVisitorStatusController);

/**
 * @swagger
 * /api/v1/visitors/gen_card:
 *   post:
 *     summary: Get QR code for a visitor by ID (only if qr_status is 'active')
 *     tags:
 *       - Visitors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitor_id
 *             properties:
 *               visitor_id:
 *                 type: integer
 *                 example: 123
 *                 description: ID of the visitor
 *     responses:
 *       200:
 *         description: QR code and visitor data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qr_code:
 *                   type: string
 *                   description: QR code data (base64 encoded or raw string)
 *                 first_name:
 *                   type: string
 *                   description: Visitor's first name
 *                 last_name:
 *                   type: string
 *                   description: Visitor's last name
 *                 purpose:
 *                   type: string
 *                   description: Purpose of visit
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Visitor's email address
 *                 phone:
 *                   type: string
 *                   description: Visitor's phone number
 *                 image:
 *                   type: string
 *                   format: uri
 *                   description: Visitor's profile image URL
 *                 whom_to_meet:
 *                   type: object
 *                   description: Employee whom the visitor is meeting
 *                   properties:
 *                     employee_id:
 *                       type: integer
 *                       description: Employee ID
 *                     first_name:
 *                       type: string
 *                       description: Employee's first name
 *                     last_name:
 *                       type: string
 *                       description: Employee's last name
 *       400:
 *         description: Invalid visitor ID
 *       404:
 *         description: Visitor not found or QR code not active
 *       500:
 *         description: Internal server error
 */
router.post('/gen_card', visitorController.getVisitorQrCode);

/**
 * @swagger
 * /api/v1/visitors/submit-without-otp:
 *   post:
 *     summary: Submit visitor details and generate QR code (no OTP verification)
 *     tags:
 *       - Visitors
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
 *               whom_to_meet:
 *                 type: string
 *               purpose:
 *                 type: string
 *               aadhar_no:
 *                 type: string
 *               address:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Visitor data submitted successfully and QR code generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 visitor_id:
 *                   type: integer
 *                 qr_code:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post('/submit-without-otp', upload.single('image'), visitorValidation, submitDetailsWithoutOtp);

/**
 * @swagger
 * /api/v1/visitors/update_visitor:
 *   post:
 *     summary: Update a visitor's information
 *     description: Updates visitor details including an optional image.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: visitor_id
 *         type: integer
 *         required: true
 *         description: ID of the visitor to update
 *       - in: formData
 *         name: image
 *         type: file
 *         description: Optional image file
 *       - in: formData
 *         name: first_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: last_name
 *         type: string
 *         required: true
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *       - in: formData
 *         name: phone
 *         type: string
 *         required: true
 *       - in: formData
 *         name: gender
 *         type: string
 *         required: true
 *       - in: formData
 *         name: aadhar_no
 *         type: string
 *         required: true
 *       - in: formData
 *         name: address
 *         type: string
 *         required: true
 *       - in: formData
 *         name: company_id
 *         type: integer
 *         required: true
 *       - in: formData
 *         name: department_id
 *         type: integer
 *         required: true
 *       - in: formData
 *         name: designation_id
 *         type: integer
 *         required: true
 *       - in: formData
 *         name: whom_to_meet
 *         type: integer
 *         required: true
 *       - in: formData
 *         name: purpose
 *         type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Visitor updated successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/update_visitor', upload.single('image'), visitorController.updateVisitor);


/**
 * @swagger
 * /api/v1/visitors/get_visitor:
 *   post:
 *     summary: Get visitor details by visitor_id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitor_id
 *             properties:
 *               visitor_id:
 *                 type: integer
 *                 example: 33
 *     responses:
 *       200:
 *         description: Visitor details retrieved successfully
 *       404:
 *         description: Visitor not found
 */
router.post('/get_visitor', visitorController.getVisitorById);

// ============================================================
// ADMIN VERIFICATION ROUTES (public - accessed via email link)
// ============================================================

/**
 * @swagger
 * /api/v1/visitors/verify-details/{id}:
 *   get:
 *     summary: Get visitor details for admin verification page
 *     tags:
 *       - Visitors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Visitor ID
 *     responses:
 *       200:
 *         description: Visitor details fetched successfully
 *       404:
 *         description: Visitor not found
 */
router.get('/verify-details/:id', visitorController.getVisitorForVerification);

/**
 * @swagger
 * /api/v1/visitors/approve/{id}:
 *   put:
 *     summary: Approve a visitor (admin verification)
 *     tags:
 *       - Visitors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Visitor ID to approve
 *     responses:
 *       200:
 *         description: Visitor approved and QR code generated
 *       400:
 *         description: Visitor already verified
 *       404:
 *         description: Visitor not found
 */
router.put('/approve/:id', visitorController.approveVisitor);

/**
 * @swagger
 * /api/v1/visitors/reject/{id}:
 *   put:
 *     summary: Reject a visitor
 *     tags:
 *       - Visitors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Visitor ID to reject
 *     responses:
 *       200:
 *         description: Visitor rejected
 *       400:
 *         description: Cannot reject an already verified visitor
 *       404:
 *         description: Visitor not found
 */
router.put('/reject/:id', visitorController.rejectVisitor);

module.exports = router;
