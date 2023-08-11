import request from '@/utils/request'

const API = {
    page: '/supplier/page',
    save: '/supplier/save',
    freeze: '/supplier/freeze',
    unFreeze: '/supplier/unFreeze',
    list: '/supplier/list'
}
/*
* @param parameter
* @returns {*}
*/
export function getPage(parameter) {
    return request({
        url: API.page,
        method: 'GET',
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

export function list() {
    return request({
        url: API.list,
        method: 'GET'
    })
}