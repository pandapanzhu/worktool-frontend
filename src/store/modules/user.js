import storage from 'store'
import expirePlugin from 'store/plugins/expire'
import { login, getInfo, logout } from '@/api/login'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

storage.addPlugin(expirePlugin)
const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
    permission: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
    SET_PERMISSION: (state, permission) => {
      state.permission = permission
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          const code = response.code
          if (code === 200) {
            const token = response.data.token
            storage.set(ACCESS_TOKEN, token)
            commit('SET_TOKEN', token)
            resolve(response)
          } else {
            reject(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        // 请求后端获取用户信息 /sys/user/info
        getInfo().then(response => {
          const code = response.code
          if (code === 200) {
            const data = response.data
            if (data.permissions && data.permissions.length > 0) {
              data.permissions = data.permissions.map(permission => {
                const per = {
                  ...permission,
                  actionList: (permission.actionEntitySet || {}).map(item => item.action)
                 }
                return per
              })
              data.permissionList = data.permissions.map(permission => { return permission.permissionId })
              // 覆盖响应体的 role, 供下游使用
              // commit('SET_ROLES', role)
              commit('SET_PERMISSION', data.permissions)
              commit('SET_INFO', data)
              commit('SET_NAME', { name: data.name, welcome: welcome() })
              commit('SET_AVATAR', data.avatar)
              // 下游
              resolve(data)
            } else {
              reject(new Error('getInfo: roles must be a non-null array !'))
            }
          } else {
            reject(response)
          }
        }).catch(error => {
          console.log(error)
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          console.log('logout')
          storage.remove(ACCESS_TOKEN)
          resolve()
        }).catch((err) => {
          console.log('logout fail:', err)
          // resolve()
        }).finally(() => {
        })
      })
    }

  }
}

export default user
