// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

const RouteView = {
  name: 'RouteView',
  render: h => h('router-view')
}

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'home',
        redirect: '/home/home',
        component: RouteView,
        hidden: true,
        meta: { title: 'menu.home', keepAlive: true, },
        children: [
          {
            path: '/home/home',
            name: 'Home',
            component: () => import('@/views/home/Home'),
            meta: { title: 'menu.dashboard.workplace', keepAlive: true }
          }
        ]
      },
      {
        path: '/robot',
        // name: 'supplier',
        redirect: '/robot/qalist',
        component: RouteView,
        meta: { title: 'menu.robot', icon: 'robot', keepAlive: true, },
        children: [
          {
            path: '/robot/index',
            name: 'index',
            component: () => import('@/views/robot/index'),
            meta: { title: 'menu.robot', keepAlive: true , permission: ['robotList'] }
          },
          {
            path: '/robot/info',
            name: 'info',
            component: () => import('@/views/robot/info'),
            meta: { title: 'menu.robot.info', keepAlive: true }
          },
          {
            path: '/robot/qalist',
            name: 'qalist',
            component: () => import('@/views/robot/qalist'),
            meta: { title: 'menu.qa.list', keepAlive: true }
          },
          {
            path: '/robot/qalog',
            name: 'qalog',
            component: () => import('@/views/robot/qalog'),
            meta: { title: 'menu.qa.log', keepAlive: true }
          }
        ]
      },
      {
        path: '/staff',
        // name: 'subsystem',
        redirect: '/staff/index',
        component: RouteView,
        meta: { title: 'menu.staff', icon: 'usergroup-add', keepAlive: true, },
        children: [
          {
            path: '/staff/department',
            name: 'staff',
            component: () => import('@/views/staff/department'),
            meta: { title: 'menu.department', keepAlive: true }
          },
          {
            path: '/staff/index',
            name: 'staff',
            component: () => import('@/views/staff/index'),
            meta: { title: 'menu.staff', keepAlive: true }
          }
        ]
      },
      // system setting
      {
        path: '/sys',
        component: RouteView,
        redirect: '/sys/user',
        name: 'sys',
        meta: { title: 'menu.sys', icon: 'setting', keepAlive: true, permission: ['sys','user','role','permission'] },
        children: [
          {
            path: '/sys/user',
            name: 'user',
            component: () => import('@/views/sys/user/UserList'),
            meta: { title: 'menu.sys.user', keepAlive: true, permission: ['sys','user'] }
          },
          {
            path: '/sys/role',
            name: 'role',
            component: () => import('@/views/sys/role/RoleList'),
            meta: { title: 'menu.sys.role', keepAlive: true, permission: ['sys','role'] },
          },
          {
            path: '/sys/permission',
            name: 'PermissionList',
            component: () => import('@/views/sys/permission/PermissionList'),
            meta: { title: 'menu.sys.permission', keepAlive: true, permission: ['sys','permission'] }
          }
        ]
      },

      // account
      // 个人中心和信息
      {
        path: '/account',
        component: RouteView,
        redirect: '/account/center',
        name: 'account',
        meta: { title: 'menu.account', icon: 'user', keepAlive: true },
        hidden: true,
        children: [
          {
            path: '/account/center',
            name: 'center',
            component: () => import('@/views/account/center'),
            meta: { title: 'menu.account.center', hidden: true }
          },
          {
            path: '/account/settings',
            name: 'settings',
            component: () => import('@/views/account/settings/Index'),
            meta: { title: 'menu.account.settings', hideHeader: true },
            redirect: '/account/settings/basic',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/account/settings/basic',
                name: 'BasicSettings',
                component: () => import('@/views/account/settings/BasicSetting'),
                meta: { title: 'account.settings.menuMap.basic', hidden: true }
              },
              {
                path: '/account/settings/security',
                name: 'SecuritySettings',
                component: () => import('@/views/account/settings/Security'),
                meta: {
                  title: 'account.settings.menuMap.security',
                  hidden: true,
                  keepAlive: true,
                  permission: ['user']
                }
              },
              {
                path: '/account/settings/custom',
                name: 'CustomSettings',
                component: () => import('@/views/account/settings/Custom'),
                meta: { title: 'account.settings.menuMap.custom', hidden: true, keepAlive: true }
              },
              {
                path: '/account/settings/binding',
                name: 'BindingSettings',
                component: () => import('@/views/account/settings/Binding'),
                meta: { title: 'account.settings.menuMap.binding', hidden: true, keepAlive: true }
              },
              {
                path: '/account/settings/notification',
                name: 'NotificationSettings',
                component: () => import('@/views/account/settings/Notification'),
                meta: {
                  title: 'account.settings.menuMap.notification',
                  hidden: true,
                  keepAlive: true,
                  permission: ['user']
                }
              }
            ]
          }
        ]
      },


    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
