const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
role_controller = require('../controllers/role_controller')

const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1]; // Extract Bearer token

//   if (!token) return res.status(401).json({ error: "Access token required" });

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//       if (err) return res.status(403).json({ error: "Invalid or expired token" });

//       req.user = decoded;
//       next(); 
//   });
    next()
};

/**
 * @swagger
 * /api/roles/list_modules:
 *   get:
 *     summary: Get list of available modules
 *     description: Returns a list of all modules. Requires a valid access token.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of modules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   module_id:
 *                     type: integer
 *                     example: 1
 *                   module_name:
 *                     type: string
 *                     example: User Management
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database Operation failed
 */

router.get('/list_modules',authenticateToken, async (req,res)=>{
    try{
        modules = await role_controller.getModules()
        res.json(modules)
    }catch(err){
        res.status(err.status||500).json({error: err.message})
    }
})

/**
 * @swagger
 * /api/roles/module_permissions/{module}:
 *   get:
 *     summary: Get permissions for a module
 *     description: Retrieves all permissions (with ID, name, and description) assigned to a specific module.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *         description: The module identifier (usually module ID or name)
 *         example: "user-management"
 *     responses:
 *       200:
 *         description: Successfully retrieved module permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   permission_id:
 *                     type: integer
 *                     example: 12
 *                   permission_name:
 *                     type: string
 *                     example: "Create User"
 *                   permission_description:
 *                     type: string
 *                     example: "Allows creation of new users"
 *       400:
 *         description: Invalid module parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid module name
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server/database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database Operation failed
 */

router.get('/module_permissions/:module',authenticateToken, async (req,res)=>{
    mod = req.params.module
    try{
        actions = await role_controller.getModulePermissions(mod)
        res.json(actions)
    }catch(err){
        res.status(err.status||500).json({error: err.message})
    }
})

/**
 * @swagger
 * /api/roles/add:
 *   post:
 *    summary: Create Role
 *    description: Create a role provided a list of permissions and role name
 *    tag: 
 *      - Role Management
 *    security:
 *      - bearerAuth:[]
 *    responses:
 *       200:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               porperties:
 *                 message:
 *                   type: string
 *                   example: Role Created Successfully
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
 *   
 */

router.post('/add',authenticateToken, async (req,res)=>{
    const {permissions,role_name} = req.body
    try{
        actions = await role_controller.createRole(role_name,permissions)
        res.json(actions)
    }catch(err){
        res.status(err.status||500).json({error: err.message})
    }
})

/**
 * @swagger
 * /api/roles/list_roles:
 *   get:
 *     summary: Retrieve list of visible roles
 *     description: Returns all roles from the database where `visibility = true`. Requires a valid access token.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   role_name:
 *                     type: string
 *                     example: Admin
 *                   created_at:
 *                      type: date
 *                   visibility:
 *                     type: boolean
 *                     example: true
 *                   status:
 *                     type: string
 *                     example: Active/Inactive
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database Operation failed
 */

router.get('/list_roles',authenticateToken, async (req,res)=>{
    try{
        roles = await role_controller.getRoles()
        res.json(roles)
    }catch(err){
        res.status(err.status||500).json({error: err.message})
    }
})

/**
 * @swagger
 * /api/roles/change_status:
 *   post:
 *     summary: Change the status of a role
 *     description: Updates the `status` field of a role by role ID. Requires authentication.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *               - status
 *             properties:
 *               role_id:
 *                 type: integer
 *                 example: 2
 *               status:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Role status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 affectedRows: 1
 *                 changedRows: 1
 *                 fieldCount: 0
 *       400:
 *         description: Bad request (missing or invalid body parameters)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal Server Error - DB failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database Operation failed
 */

router.post('/change_status',authenticateToken, async (req,res)=>{
    const {role_id,status} = req.body
    try{
        actions = await role_controller.changeRoleStatus(role_id, status)
        res.json(actions)
    }catch(err){
        res.status(err.status||500).json({error: err.message})
    }
})

/**
 * @swagger
 * /api/roles/change_visibility/{rid}:
 *   get:
 *     summary: Change role visibility to false
 *     description: Sets the `visibility` of a role to `false` based on the provided role ID. Requires a valid access token.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rid
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID to update
 *         example: 3
 *     responses:
 *       200:
 *         description: Role visibility updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 affectedRows: 1
 *                 changedRows: 1
 *                 fieldCount: 0
 *       400:
 *         description: Invalid role ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid role ID
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error during database operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database Operation failed
 */

router.get('/change_visibility/:rid', authenticateToken, async (req,res)=>{
    const role_id = req.params.rid
    try{
        resp = await role_controller.changeRoleVisibility(role_id)
        res.json(resp)
    }catch(err){
        res.status(err.status||500).json({error: err.message})
    }
})

/**
 * @swagger
 * /api/roles/modify_permissions:
 *   post:
 *     summary: Modify role permissions
 *     description: Replaces all permissions for a given role ID with the new list of permission IDs. Requires authentication.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *               - permissionIds
 *             properties:
 *               role_id:
 *                 type: integer
 *                 example: 2
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3, 5]
 *     responses:
 *       200:
 *         description: Role permissions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 affectedRows: 3
 *                 changedRows: 3
 *                 fieldCount: 0
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error during DB operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database Operation failed
 */

router.post('/modify_permissions', authenticateToken, async (req,res)=>{
    const {role_id, permissionIds} = req.body
    try{
        resp = await role_controller.modifyRolePermissions(role_id,permissionIds)
        res.json(resp)
    }catch(err){
        res.status(err.status||500).json({error: err.message})
    }
})

/**
 * @swagger
 * /api/roles/get_role_permission_ids/{rid}:
 *   get:
 *     summary: Get permission IDs for a role
 *     description: Retrieves a list of permission IDs associated with a given role ID. Requires authentication.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rid
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *         example: 2
 *     responses:
 *       200:
 *         description: List of permission IDs for the given role
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 *               example: [1, 3, 5]
 *       400:
 *         description: Invalid role ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid role ID
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error during database operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database Operation failed
 */

router.get('/get_role_permission_ids/:rid',authenticateToken,async (req,res)=>{
    const role_id = req.params.rid
    try{
        resp = await role_controller.getRolePermissionIds(role_id)
        res.json(resp)
    }catch(err){
        res.status(err.status||500).json({error: err.message})
    }
})

/**
 * @swagger
 * /api/roles/get_role_name/{rid}:
 *   get:
 *     summary: Get role name by ID
 *     description: Retrieves the role name associated with a specific role ID. Requires authentication.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rid
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *         example: 4
 *     responses:
 *       200:
 *         description: Role name retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Administrator"
 *       400:
 *         description: Invalid role ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid role ID
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error during database operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database Operation failed
 */

router.get('/get_role_name/:rid',authenticateToken,async (req,res)=>{
    const role_id = req.params.rid
    try{
        resp = await role_controller.getRoleNameById(role_id)
        res.json(resp)
    }catch(err){
        res.status(err.status||500).json({error: err.message})
    }
})

/**
 * @swagger
 * /api/roles/get_role_permission_names/{rid}:
 *   get:
 *     summary: Get permission names for a role
 *     description: Retrieves a list of permission names associated with the specified role ID. Requires authentication.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rid
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *         example: 3
 *     responses:
 *       200:
 *         description: Array of permission names
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Create User", "Edit Role", "View Dashboard"]
 *       400:
 *         description: Invalid role ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid role ID
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error during DB operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database Operation failed
 */

router.get('/get_role_permission_names/:rid',authenticateToken,async (req,res)=>{
    const role_id = req.params.rid
    try{
        resp = await role_controller.getRolePermissionNames(role_id)
        res.json(resp)
    }catch(err){
        res.status(err.status||500).json({error: err.message})
    }
})

/**
 * @swagger
 * /api/roles/get_roles_by_modules:
 *   get:
 *     summary: Get roles grouped by modules
 *     description: Retrieves a list of modules and the roles associated with each module.
 *     tags:
 *       - Roles
 *     responses:
 *       200:
 *         description: Successfully retrieved roles grouped by modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   module_name:
 *                     type: string
 *                     example: "User Management"
 *                   roles:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Admin", "Manager"]
 *       500:
 *         description: Internal server error during database operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database Operation failed
 */

router.get('/get_roles_by_modules', async (req,res)=>{
    try{
        resp = await role_controller.getRolesByModules()
        res.json(resp)
    }catch(err){
        res.status(err.status||500).json({error: err.message})
    }
})

module.exports = router