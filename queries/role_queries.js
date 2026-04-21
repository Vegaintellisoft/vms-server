listModules = "SELECT module_id, module_name, module_description FROM modules;"
getModulePermissions = "SELECT permission_id, permission_name, permission_description FROM permissions WHERE designated_module_id=?;"
addRole = "INSERT INTO roles (role_name) VALUES (?);"
getRoleId = "SELECT role_id FROM roles WHERE role_name = ?;"
getRoleName = "SELECT role_name FROM roles WHERE role_id = ?"
addRolePermissions = "INSERT INTO role_permissions VALUES ?;"
getRoles = "SELECT * FROM roles WHERE visibility = true;"
changeRoleStatus = "UPDATE roles SET status=? WHERE role_id = ?;"
getRolePermissions = "SELECT permission_id FROM role_permissions WHERE role_id = ?;"
getRolePermissionNames = "SELECT p.permission_name FROM permissions p JOIN role_permissions rp ON rp.permission_id=p.permission_id WHERE rp.role_id = ?"
deleteRolePermissions = "DELETE FROM role_permissions WHERE role_id = ?;"
changeRoleVisibility = "UPDATE roles SET visibility = false WHERE role_id = ?;"
getRolesByModules = `SELECT m.module_name, GROUP_CONCAT(DISTINCT r.role_name SEPARATOR ', ') AS roles
                    FROM roles r  
                    JOIN role_permissions rp ON r.role_id = rp.role_id  
                    JOIN permissions p ON rp.permission_id = p.permission_id  
                    JOIN modules m ON p.designated_module_id = m.module_id  
                    GROUP BY m.module_name;
                    `
getRolePermissionIds = "SELECT permission_id FROM role_permissions WHERE role_id = ?;"
module.exports = {
                    listModules, 
                    getModulePermissions,
                    addRole, 
                    getRoleId, 
                    addRolePermissions, 
                    getRoles, 
                    changeRoleStatus, 
                    getRolePermissions, 
                    getRolePermissionNames,
                    changeRoleVisibility, 
                    deleteRolePermissions,
                    getRoleName,
                    getRolesByModules
                }