<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="系统名称">
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

    <s-table row-key="username" size="default" :columns="columns" :data="loadData" ref="table">
      <span slot="type" slot-scope="text">{{ text | typeFilter }}</span>
      <a-tag color="green" slot="monitorStatus" slot-scope="text">{{ text | monitorStatusFilter }}</a-tag>
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

    <create-model
      ref="editModal"
      :visible="visible"
      :loading="confirmLoading"
      :supplierList = "supplierList"
      :model="mdl"
      @cancel="handleCancel"
      @ok="handleOk"
    />
  </a-card>
</template>

<script>
import { STable } from '@/components'
import { save, freeze, unFreeze, getPage,deleted } from '@/api/subsystem/index'
import { list } from '@/api/supplier/index'
import CreateModel from './modules/createModel'
import { notificationError, notificationSuccess } from '@/utils/notification'

export default {
  name: 'TableList',
  components: {
    STable,
    CreateModel,
  },
  data() {
    return {
      visible: false,
      supplierList: [],
      mdl: {},
      confirmLoading: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      form: this.$form.createForm(this),
      modalTitle: '',
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 表头
      columns: [
        {
          title: '系统名称',
          dataIndex: 'systemName',
        },
        {
          title: '校验地址',
          dataIndex: 'url',
        },
        {
          title: '系统类型',
          dataIndex: 'type',
          scopedSlots: { customRender: 'type' },
        },
        {
          title: '客户名称',
          dataIndex: 'supplierName',
        },
        {
          title: '监控状态',
          dataIndex: 'monitorStatus',
          scopedSlots: { customRender: 'monitorStatus' },
        },
        {
          title: '系统状态',
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
      ],

      // 加载数据方法 必须为 Promise 对象
      loadData: (parameter) => {
        return getPage(parameter).then((res) => {
          if(200 == res.code){
            return res.data
          }
        }).catch((e) => {
          console.log(e)
          notificationError(e, this)
        })
      },
    }
  },
  filters: {
    statusFilter(key) {
      const statusMap = {
        1: '正常',
        0: '禁用',
      }
      return statusMap[key]
    },
    monitorStatusFilter(key) {
      const statusMap = {
        1: '成功',
        0: '失败',
      }
      return statusMap[key]
    },
    typeFilter(key) {
      const statusMap = {
        1: 'B端系统',
        0: 'C端系统',
      }
      return statusMap[key]
    },
  },
  created() {
    this.loadSupplierList()
  },
  methods: {
    loadSupplierList(){
      list().then((res) => {
        this.supplierList = res.data
      })
    },
    handleCancel() {
      this.visible = false
      const form = this.$refs.editModal.form
      this.mdl = null
      form.resetFields()
    },
    handleAdd() {
      this.visible = true
      this.mdl =  {status:1}
    },
    handleEdit(record) {
      this.visible = true
      this.mdl = record
    },
    handleOk(e) {
      const form = this.$refs.editModal.form
      this.confirmLoading = true
      form.validateFields((err, values) => {
        if (!err) {
          console.log(values)
          // 保存
          save(values)
            .then((res) => {
              const code = res.code
              if (code === 200) {
                this.visible = false
                // 重置表单数据
                form.resetFields()
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
          const value = Object.values(err)[0]
          console.log(value.errors[0].message)
          notificationError(value.errors[0].message, this)
        }
      })
      this.confirmLoading = false
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
        content: `真的对 ${record.systemName} 进行【禁用】操作吗?`,
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk() {
          const param = { id: record.systemId }
          freeze(param)
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
        content: `真的对 ${record.systemName} 进行【启用】操作吗?`,
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk() {
          const param = { id: record.systemId }
          unFreeze(param)
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
        content: `真的要删除 ${record.systemName} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          const param = { id: record.systemId }
          deleted(param)
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
