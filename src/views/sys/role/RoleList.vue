<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="角色名称">
              <a-input v-model="queryParam.name" placeholder="请输入" />
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

    <s-table
      row-key="roleId"
      size="default"
      :columns="columns"
      :data="loadData"
      :expandedRowKeys="expandedRowKeys"
      @expand="handleExpand"
      ref="table"
    >
      <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
        <a-row :gutter="24" :style="{ marginBottom: '12px' }">
          <a-col
            :span="12"
            v-for="(role, index) in record.permissions"
            :key="index"
            :style="{ marginBottom: '12px', height: '23px' }"
          >
            <a-col :lg="4" :md="24">
              <span>{{ role.permissionName }}:</span>
            </a-col>
            <a-col :lg="20" :md="24" v-if="role.actionList && role.actionList.length > 0">
              <a-tag color="cyan" v-for="action in role.actionList" :key="action">{{
                action | permissionFilter
              }}</a-tag>
            </a-col>
            <a-col :span="20" v-else>-</a-col>
          </a-col>
        </a-row>
      </div>
      <a-tag color="blue" slot="status" slot-scope="text">{{ text | statusFilter }}</a-tag>
      <span slot="updateTime" slot-scope="text">{{ text | moment }}</span>
      <span slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-dropdown>
          <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a v-if="record.status == 1" @click="handleFreeze(record)">禁用</a>
              <a v-else @click="handleUnFreeze(record)">启用</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="handleDelete(record)">删除</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </span>
    </s-table>

    <a-modal :title="modalTitle" style="top: 20px" :width="800" v-model="visible" @ok="handleOk">
      <a-form class="permission-form" :form="form">
        <a-form-item :labelCol="labelCol" v-show="false" :wrapperCol="wrapperCol" label="角色名称" hasFeedback>
          <a-input placeholder="起一个名字" v-decorator="['roleId']" />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="角色名称" hasFeedback>
          <a-input
            placeholder="请输入角色名称"
            v-decorator="['roleName', { rules: [{ required: true, message: '请输入角色名称' }] }]"
          />
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="状态" hasFeedback>
          <a-select v-decorator="['status', { initialValue: 1 }]">
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="描述" hasFeedback>
          <a-textarea :rows="5" placeholder="..." id="remark" v-decorator="['remark']" />
        </a-form-item>

        <a-divider>拥有权限</a-divider>
        <template v-for="permission in permissions">
          <a-form-item
            class="permission-group"
            v-if="permission.actionsOptions && permission.actionsOptions.length > 0"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            :key="permission.permissionId"
            :label="permission.permissionName"
          >
            <!-- <a-checkbox :indeterminate="indeterminate"  @change="onCheckAllChange">全选</a-checkbox> -->
            <a-checkbox-group
              v-decorator="[`permissions.${permission.permissionId}`]"
              :options="permission.actionsOptions"
            />
          </a-form-item>
        </template>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import pick from 'lodash.pick'
import map from 'lodash.map'
import { STable } from '@/components'
import { saveRole, freezeRole, unFreezeRole, deleteRole, getRolePage, getPermissionList } from '@/api/role/role'
import { PERMISSION_ENUM } from '@/core/permission/permission'
import { notificationError, notificationSuccess } from '@/utils/notification'
const STATUS = {
  1: '启用',
  0: '禁用',
}

const columns = [
  {
    title: '角色名称',
    dataIndex: 'roleName',
  },
  {
    title: '角色描述',
    dataIndex: 'remark',
  },
  {
    title: '状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' },
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    scopedSlots: { customRender: 'updateTime' },
    sorter: true,
  },
  {
    title: '操作',
    width: '150px',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]

export default {
  name: 'TableList',
  components: {
    STable,
  },
  data() {
    return {
      description:
        '列表使用场景：后台管理中的权限管理以及角色管理，可用于基于 RBAC 设计的角色权限控制，颗粒度细到每一个操作类型。',

      visible: false,
      indeterminate: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      form: this.$form.createForm(this),
      permissions: [],
      modalTitle: '',
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 表头
      columns,
      // 加载数据方法 必须为 Promise 对象
      loadData: (parameter) => {
        return getRolePage(parameter).then((res) => {
          const roleList = res.data.data
          // 展开全部行
          this.expandedRowKeys = roleList.map((item) => item.roleId)
          //封装actionList

          roleList.map((item) => {
            const { permissions } = item
            if (permissions && permissions.length > 0) {
              permissions.map((permission) => {
                if (permission.actions && permission.actions.length > 0) {
                  permission.actionList = permission.actions.split(',')
                } else {
                  permission.actionList = []
                }
                return permission
              })
            }
            return item
          })
          return res.data
        })
      },

      expandedRowKeys: [],
      selectedRowKeys: [],
      selectedRows: [],
    }
  },
  filters: {
    statusFilter(key) {
      return STATUS[key]
    },
    permissionFilter(key) {
      const permission = PERMISSION_ENUM[key]
      return permission && permission.label
    },
  },
  created() {
    this.loadPermissions()
  },
  methods: {
    loadPermissions() {
      getPermissionList().then((res) => {
        this.permissions = res.data
      })
    },
    handleAdd() {
      this.visible = true
      this.modalTitle = '新增角色'
      const checkboxGroup = {}
      this.permissions = this.permissions.map((permission) => {
        const groupKey = `permissions.${permission.permissionId}`
        checkboxGroup[groupKey] = permission.actionList
        const actionsOptions = permission.actionEntitySet.map((action) => {
          return {
            label: action.describe,
            value: action.action,
            defaultCheck: action.defaultCheck,
          }
        })
        return {
          ...permission,
          actionsOptions,
        }
      })
      this.$nextTick(() => {
        this.form.setFieldsValue(pick({}, ['roleId', 'status', 'remark', 'roleName']))
        this.form.setFieldsValue(checkboxGroup)
      })
    },
    handleEdit(record) {
      this.visible = true
      this.modalTitle = '操作[' + record.roleName + ']'
      const checkboxGroup = {}
      this.permissions = record.permissions.map((permission) => {
        const groupKey = `permissions.${permission.permissionId}`
        checkboxGroup[groupKey] = permission.actionList
        const actionsOptions = permission.actionEntitySet.map((action) => {
          return {
            label: action.describe,
            value: action.action,
            defaultCheck: action.defaultCheck,
          }
        })
        return {
          ...permission,
          actionsOptions,
        }
      })

      this.$nextTick(() => {
        this.form.setFieldsValue(pick(record, ['roleId', 'status', 'remark', 'roleName']))
        this.form.setFieldsValue(checkboxGroup)
      })
    },
    handleOk(e) {
      this.form.validateFields((err, values) => {
        console.log(values)
        if (!err) {
          //permissions 是多个对象，要把他转化成数组
          if (values && values.permissions) {
            var arr = []
            map(values.permissions, (item, key) => {
              const obj = { name: key, actions: item }
              arr.push(obj)
            })
            console.log(arr)
            values.permissions = arr
          }
          console.log(values)
          // 保存
          saveRole(values)
            .then((res) => {
              const code = res.code
              if (code === 200) {
                this.visible = false
                // 重置表单数据
                this.form.resetFields()
                // 刷新表格
                this.$refs.table.refresh()
                notificationSuccess('成功', '保存成功', this)
              } else {
                notificationError(res, this)
              }
            })
            .catch((err) => {
              console.log(err)
              notificationError(err, this)
            })
        } else {
          notificationError(err, this)
        }
      })
    },
    onChange(selectedRowKeys, selectedRows) {
      console.log(selectedRowKeys)
      console.log(selectedRows)
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleExpand(expanded, record) {
      console.log('expanded', expanded, record)
      if (expanded) {
        this.expandedRowKeys.push(record.roleId)
      } else {
        this.expandedRowKeys = this.expandedRowKeys.filter((item) => record.roleId !== item)
      }
    },
    toggleAdvanced() {
      this.advanced = !this.advanced
    },
    handleFreeze(record) {
      var that = this
      this.$confirm({
        title: '提示',
        content: `真的对 ${record.roleName} 进行【禁用】操作吗?`,
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk() {
          const param = { id: record.roleId }
          freezeRole(param)
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
        content: `真的对 ${record.roleName} 进行【启用】操作吗?`,
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk() {
          const param = { id: record.roleId }
          unFreezeRole(param)
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
        content: `真的要删除 ${record.roleName} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          const param = { id: record.roleId }
          deleteRole(param)
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
  watch: {
    /*
      'selectedRows': function (selectedRows) {
        this.needTotalList = this.needTotalList.map(item => {
          return {
            ...item,
            total: selectedRows.reduce( (sum, val) => {
              return sum + val[item.dataIndex]
            }, 0)
          }
        })
      }
      */
  },
}
</script>

<style lang="less" scoped>
.permission-form {
  :deep(.permission-group) {
    margin-top: 0;
    margin-bottom: 0;
  }
}
</style>
