import request from '@/utils/request'

const userApi = {
    roleList:'sys/role/list',
    userPage: '/sys/user/page',
    saveUser: '/sys/user/save',
    userRoleList : 'sys/user/userRole',
    freezeUser: '/sys/user/freeze',
    unFreezeUser: '/sys/user/unFreeze',
    deleteUser: '/sys/user/delete'
}
/*
* @param parameter
* @returns {*}
*/
export function getUserPage(parameter) {
    return request({
        url: userApi.userPage,
        method: 'get',
        params: parameter
    })
}

export function getRoleList() {
    return request({
        url: userApi.roleList,
        method: 'get'
    })
}

export function getUserRoleList(data) {
    return request({
        url: userApi.userRoleList,
        method: 'POST',
        data: data
    })
}

export function saveUser(data) {
    return request({
        url: userApi.saveUser,
        method: 'POST',
        data: data
    })
}

export function freezeUser(parameter) {
    return request({
        url: userApi.freezeUser,
        method: 'POST',
        data: parameter
    })
}

export function unFreezeUser(parameter) {
    return request({
        url: userApi.unFreezeUser,
        method: 'POST',
        data: parameter
    })
}

export function deleteUser(parameter) {
    return request({
        url: userApi.deleteUser,
        method: 'POST',
        data: parameter
    })
}