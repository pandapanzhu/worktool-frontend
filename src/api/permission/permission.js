import request from '@/utils/request'

const permissionApi = {
    loadAllPermissionAction: '/sys/permission/loadAllPermissionAction',
    permissionPage: '/sys/permission/page',
    savePermission: '/sys/permission/savePermission',
    freezePermission: '/sys/permission/freeze',
    unFreezePermission: '/sys/permission/unFreeze',
    deletePermission: '/sys/permission/delete'
}
/*
* @param parameter
* @returns {*}
*/
export function getPermissionPage(parameter) {
    return request({
        url: permissionApi.permissionPage,
        method: 'get',
        params: parameter
    })
}
export function loadAllPermissionAction() {
    return request({
        url: permissionApi.loadAllPermissionAction,
        method: 'get'
    })
}

export function savePermission(data) {
    return request({
        url: permissionApi.savePermission,
        method: 'POST',
        data: data
    })
}

export function freezePermission(parameter) {
    return request({
        url: permissionApi.freezePermission,
        method: 'POST',
        data: parameter
    })
}

export function unFreezePermission(parameter) {
    return request({
        url: permissionApi.unFreezePermission,
        method: 'POST',
        data: parameter
    })
}

export function deletePermission(parameter) {
    return request({
        url: permissionApi.deletePermission,
        method: 'POST',
        data: parameter
    })
}