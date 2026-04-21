const pool = require("../db").promise;
const queries = require('../queries/role_queries');
const { logger } = require('../utils/logger');


async function getModules(){
    try{
        [res] = await pool.query(queries.listModules);
        return res
    }catch(error){
        logger.error('getModules error:', { error });
        throw ({status:500, message: 'Database Operation failed'})
    }
}

async function getModulePermissions(module) {
    try{
        [res] = await pool.query(queries.getModulePermissions,[module]);
        return res
    }catch(error){
        throw ({status:500, message: 'Database Operation failed'})
    }
}

async function createRole(roleName, permissionIds){
    try{
        addRoleResp = await pool.query(queries.addRole,[roleName]);
        roleId = addRoleResp[0]['insertId']
        permission_values = permissionIds.map(pid => [roleId, pid])
        resp = await pool.query(queries.addRolePermissions,[permission_values])
        return resp
    }catch(error){
        throw ({status:500,message: error.message})
    }
}

async function getRoles() {
    try{
        [res] = await pool.query(queries.getRoles);
        return res
    }catch(error){
        throw ({status:500, message: 'Database Operation failed'})
    }
}

async function changeRoleStatus(rid,status){
    try{
        [res] = await pool.query(queries.changeRoleStatus,[status, rid]);
        return res
    }catch(error){
        throw ({status:500, message: 'Database Operation failed'})
    }
}

async function getRolePermissionIds(rid){
    try{
        [res] = await pool.query(queries.getRolePermissionIds,[rid]);
        permissionIds = []
        res.forEach(element => {
            permissionIds.push(element.permission_id)
        });
        return permissionIds
    }catch(error){
        throw ({status:500, message: 'Database Operation failed'})
    }
}

async function getRolePermissionNames(rid){
    try{
        [res] = await pool.query(queries.getRolePermissionNames,[rid]);
        permissionNames = []
        res.forEach(element => {
            permissionNames.push(element.permission_name)
        });
        return permissionNames
    }catch(error){
        throw ({status:500, message: 'Database Operation failed'})
    }
}

async function modifyRolePermissions(rid,pids){
    permissionIds = pids.map(pid => [rid,pid])
    try{
        del_res = await pool.query(queries.deleteRolePermissions,[rid]);
        [add_permissions_res] = await pool.query(queries.addRolePermissions,[permissionIds]);
        return add_permissions_res
    }catch(error){
        throw ({status:500, message: 'Database Operation failed'})
    }
}

async function changeRoleVisibility(rid){
    try{
        [res] = await pool.query(queries.changeRoleVisibility,[rid]);
        return res
    }catch(error){
        throw ({status:500, message: 'Database Operation failed'})
    }
}

async function getRoleNameById(rid){
    try{
        [res] = await pool.query(queries.getRoleName,[rid]);
        return res[0].role_name
    }catch(error){
        throw ({status:500, message: 'Database Operation failed'})
    }
}

async function getRolesByModules(){
    try{
        [res] = await pool.query(queries.getRolesByModules)
        res.forEach((item)=> item.roles = item.roles.split(', '))
        return res
    }catch(error){
        throw ({status:500,message: 'Database Operation failed'})
    }
}

module.exports = {
                    getModules,
                    getModulePermissions,
                    createRole,
                    getRoles,
                    getRoleNameById, 
                    changeRoleStatus, 
                    modifyRolePermissions, 
                    getRolePermissionIds,
                    getRolePermissionNames,
                    getRolesByModules,
                    changeRoleVisibility,
                }