import request from '@/utils/request'

const API = {
    page: '/sub/system/page',
    save: '/sub/system/save',
    freeze: '/sub/system/freeze',
    unFreeze: '/sub/system/unFreeze',
    deleted: '/sub/system/delete'
}
/*
* @param parameter
* @returns {*}
*/
export function getPage(parameter) {
    return request({
        url: API.page,
        method: 'get',
        params: parameter
    })
}


export function save(data) {
    return request({
        url: API.save,
        method: 'POST',
        data: data
    })
}

export function freeze(parameter) {
    return request({
        url: API.freeze,
        method: 'POST',
        data: parameter
    })
}

export function unFreeze(parameter) {
    return request({
        url: API.unFreeze,
        method: 'POST',
        data: parameter
    })
}

export function deleted(parameter) {
    return request({
        url: API.deleted,
        method: 'POST',
        data: parameter
    })
}