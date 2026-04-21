const auth_methods = require("../controllers/auth_controller");
const express = require("express");
const { loginValidation } = require("../middleware/validators");

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh the user's access token
 *     description: Uses a refresh token stored in cookies to generate a new access token
 *     tags:
 *       - Authentication
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOi...
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       403:
 *         description: Refresh token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Refresh token expired, please log in again
 *       500:
 *         description: Server error
 */

router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Read from cookie
  if (!refreshToken) {
    return res.status(403).json({ error: "Refresh token invalid" });
  }
  try {
    const response = await auth_methods.refreshUserToken(refreshToken);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user and return access & refresh tokens
 *     description: Verifies user credentials. On success, returns an access token and sets a refresh token in an HTTP-only cookie.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailId
 *               - password
 *             properties:
 *               emailId:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: yourpassword123
 *     responses:
 *       201:
 *         description: Login successful, tokens returned
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only cookie containing the refresh token
 *             schema:
 *               type: string
 *               example: refreshToken=abc123; HttpOnly; Secure; SameSite=Strict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login Successful!
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     roleId:
 *                       type: integer
 *                       example: 2
 *                     user_name:
 *                       type: string
 *                       example: John
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Incorrect Password!
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Login Failed
 */

router.post("/login", loginValidation, async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const data = await auth_methods.loginUser(emailId, password);

    res.cookie("refreshToken", data.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const responseData = {
      accessToken: data.access_token,
      roleId: data.role_id,
      userName: data.user_name,
    };
    if (data.role_id != 1) {
      responseData.companyId = data.company_id;
    }
    res.status(201).json({
      message: "Login Successful!",
      result: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(error.status || 500).json({ error: error.message });
  }
});


/**
 * @swagger
 * /api/v1/auth/logout:
 *    post:
 *      summary: Logout user and clear cookie and delete refreshToken
 *      description: The refresh token is deleted from the database and the httponly cookie carrying the refreshToken is cleared
 *      tags:
 *        - Authentication
 *      security:
 *        - cookieAuth: []
 *      responses:
 *        200:
 *          description: Logged out successfully
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message: 
 *                    type: string
 *                    example: Logged out successfully
 *        403:
 *          description: Token not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: Refresh token required
 *        500:
 *          description: DB query - token deletion failure
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: Token deletion failure
 */
router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Read from cookie
  if (!refreshToken)
    return res.status(403).json({ error: "Refresh token required" });
  try {
    await auth_methods.logoutUser(refreshToken);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ error: error.message, result: false });
  }
});

module.exports = router;
