import request from '@/utils/request'

const roleApi = {
    permissionList:'sys/permission/list',
    rolePage: '/sys/role/page',
    saveRole: '/sys/role/save',
    freezeRole: '/sys/role/freeze',
    unFreezeRole: '/sys/role/unFreeze',
    deleteRole: '/sys/role/delete'
}
/*
* @param parameter
* @returns {*}
*/
export function getRolePage(parameter) {
    return request({
        url: roleApi.rolePage,
        method: 'get',
        params: parameter
    })
}

export function getPermissionList() {
    return request({
        url: roleApi.permissionList,
        method: 'get'
    })
}
export function saveRole(data) {
    return request({
        url: roleApi.saveRole,
        method: 'POST',
        data: data
    })
}

export function freezeRole(parameter) {
    return request({
        url: roleApi.freezeRole,
        method: 'POST',
        data: parameter
    })
}

export function unFreezeRole(parameter) {
    return request({
        url: roleApi.unFreezeRole,
        method: 'POST',
        data: parameter
    })
}

export function deleteRole(parameter) {
    return request({
        url: roleApi.deleteRole,
        method: 'POST',
        data: parameter
    })
}