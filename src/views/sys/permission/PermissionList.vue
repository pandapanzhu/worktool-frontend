<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="权限名称">
                <a-input v-model="queryParam.permissionName" placeholder="请输入权限名称" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select v-model="queryParam.status" placeholder="请选择" default-value="">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="1">启用</a-select-option>
                  <a-select-option value="0">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => (this.queryParam = {})">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button>
      </div>

      <s-table :columns="columns" :data="loadData" rowKey="permissionId" ref="table">
        <span slot="actions" slot-scope="text, record">
          <a-tag v-for="(action, index) in record.actionEntitySet" :key="index">{{ action.describe }}</a-tag>
        </span>

        <span slot="status" slot-scope="text">
          {{ text | statusFilter }}
        </span>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <!-- <a-menu-item>
                <a @click="handleEdit(record)">详情</a>
              </a-menu-item> -->
              <a-menu-item>
                <a href="javascript:;" v-if="record.status === 1" @click="handleFreeze(record)">禁用</a>
                <a href="javascript:;" v-else @click="handleUnFreeze(record)">启用</a>
              </a-menu-item>
              <a-menu-item>
                <a @click="handleDelete(record)">删除</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </s-table>

      <edit-form
        ref="editModal"
        :visible="editVisible"
        :loading="confirmLoading"
        :model="mdl"
        :permissionList="permissionList"
        @cancel="handleCancel"
        @ok="handleOk"
      />
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { STable } from '@/components'
import {
  savePermission,
  freezePermission,
  unFreezePermission,
  deletePermission,
  getPermissionPage,
  loadAllPermissionAction,
} from '@/api/permission/permission'

import { notificationError, notificationSuccess } from '@/utils/notification'
import EditForm from './modules/EditForm'
export default {
  name: 'TableList',
  components: {
    STable,
    EditForm,
  },
  data() {
    return {
      description:
        '列表使用场景：后台管理中的权限管理以及角色管理，可用于基于 RBAC 设计的角色权限控制，颗粒度细到每一个操作类型。',
      confirmLoading: false,
      editVisible: false,
      mdl: {},
      // 查询参数
      queryParam: {},
      // 表头
      columns: [
        {
          title: '唯一识别码',
          dataIndex: 'permissionId',
        },
        {
          title: '权限名称',
          dataIndex: 'permissionName',
        },
        {
          title: '可操作权限',
          dataIndex: 'actions',
          scopedSlots: { customRender: 'actions' },
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '操作',
          width: '150px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
        },
      ],
      // 向后端拉取可以用的操作列表
      permissionList: null,
      // 加载数据方法 必须为 Promise 对象
      loadData: (parameter) => {
        const params = Object.assign(parameter, this.queryParam)
        return getPermissionPage(params)
          .then((res) => {
            const { data } = res.data
            data.map((permission) => {
              if (permission.actions && permission.actions.length > 0) {
                permission.actions = permission.actions.split(',')
              } else {
                permission.actions = []
              }
              return permission
            })
            return res.data
          })
          .catch((err) => {
            console.log(err)
            notificationError(err, this)
          })
      },
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: '正常',
        0: '禁用',
      }
      return statusMap[status]
    },
  },
  created() {
    this.loadPermissionList()
  },
  methods: {
    loadPermissionList() {
      // permissionList
      loadAllPermissionAction().then((res) => {
        this.permissionList = res.data
      })
    },
    handleAdd () {
      this.mdl = null
      this.editVisible = true
    },
    handleEdit(record) {
      this.mdl = Object.assign({}, record)
      this.editVisible = true
    },
    handleCancel() {
      this.editVisible = false
      const form = this.$refs.editModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    // 提交编辑的表单
    handleOk() {
      const form = this.$refs.editModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          if (values && values.actions && values.actions.length > 0) {
            values.actionString = values.actions.join(',')
          }
          console.log(values)
          // 保存
          savePermission(values)
            .then((res) => {
              const code = res.code
              if (code === 200) {
                this.editVisible = false
                this.confirmLoading = false
                // 重置表单数据
                form.resetFields()
                // 刷新表格
                this.$refs.table.refresh()
                notificationSuccess('成功', '保存成功', this)
              } else {
                this.confirmLoading = false
                notificationError(res, this)
              }
            })
            .catch((err) => {
              console.log(err)
              notificationError(err, this)
            })
        } else {
          this.confirmLoading = false
        }
      })
    },
    toggleAdvanced() {
      this.advanced = !this.advanced
    },
    handleFreeze(record) {
      var that = this
      this.$confirm({
        title: '提示',
        content: `真的对 ${record.permissionName} 进行【禁用】操作吗?`,
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk() {
          const param = { id: record.permissionId }
          freezePermission(param)
            .then((res) => {
              const code = res.code
              if (code === 200) {
                // 刷新表格
                that.$refs.table.refresh()
                notificationSuccess('成功', '保存成功', that)
              } else {
                notificationError(res, that)
              }
            })
            .catch((err) => {
              console.log(err)
              notificationError(err, that)
            })
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    handleUnFreeze(record) {
      var that = this
      this.$confirm({
        title: '提示',
        content: `真的对 ${record.permissionName} 进行【启用】操作吗?`,
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk() {
          const param = { id: record.permissionId }
          unFreezePermission(param)
            .then((res) => {
              const code = res.code
              if (code === 200) {
                // 刷新表格
                that.$refs.table.refresh()
                notificationSuccess('成功', '保存成功', that)
              } else {
                notificationError(res, that)
              }
            })
            .catch((err) => {
              console.log(err)
              notificationError(err, that)
            })
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    handleDelete(record) {
      var that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 ${record.permissionName} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          const param = { id: record.permissionId }
          deletePermission(param)
            .then((res) => {
              const code = res.code
              if (code === 200) {
                // 刷新表格
                that.$refs.table.refresh()
                notificationSuccess('成功', '保存成功', that)
              } else {
                notificationError(res, that)
              }
            })
            .catch((err) => {
              console.log(err)
              notificationError(err, that)
            })
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
  },
}
</script>
