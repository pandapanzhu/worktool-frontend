<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="客户名称">
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

    <s-table row-key="supplierId" size="default" :columns="columns" :data="loadData" ref="table">
      <a-tag color="blue" slot="status" slot-scope="text">{{ text | statusFilter }}</a-tag>
      <span slot="updateTime" slot-scope="text">{{ text | moment }}</span>
      <span slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a @click="handleEdit(record)">监控系统</a>
       
      </span>
    </s-table>

    <info-model
      ref="editModal"
      :visible="visible"
      :loading="confirmLoading"
      :model="mdl"
      @cancel="handleCancel"
      @ok="handleOk"
    />
  </a-card>
</template>

<script>
import { STable } from '@/components'
import { getPage, save } from '@/api/supplier/index'
import InfoModel from './modules/InfoModel'
import { notificationError, notificationSuccess } from '@/utils/notification'

export default {
  name: 'TableList',
  components: {
    STable,
    InfoModel
  },
  data() {
    return {
      visible: false,
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
          title: '名称',
          dataIndex: 'name',
        },
        {
          title: '邮箱',
          dataIndex: 'email',
        },
        {
          title: '电话号码',
          dataIndex: 'mobile',
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
  },
  created() {
    
  },
  methods: {
    
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
