<template>
  <a-modal :title="title" :width="800" :visible="visible"  @ok="() => { $emit('ok') }" @cancel="() => { $emit('cancel')} ">
    <a-spin :spinning="loading">
        <a-form :form="form" >
          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="唯一识别码" hasFeedback>
            <a-input placeholder="唯一识别码" v-decorator="['permissionId', {rules:[{required: true, message: '请输入唯一识别码'}]}]" id="no" :disabled="disablePermissionId" />
          </a-form-item>

          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="权限名称"  hasFeedback>
            <a-input placeholder="请输入权限名称"  v-decorator="['permissionName', {rules:[{required: true, message: '请输入权限名称'}]}]" id="permission_name" />
          </a-form-item>

          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="状态" hasFeedback>
            <a-select  v-decorator="['status', {rules:[{required: true, message: '请选择状态'}]}]">
              <a-select-option :value="1">正常</a-select-option>
              <a-select-option :value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="描述" hasFeedback>
            <a-textarea :rows="5"  v-decorator="['describe']" placeholder="..." id="remark" />
          </a-form-item>

          <a-divider />

          <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="赋予权限" hasFeedback>
            <a-select style="width: 100%" mode="multiple" v-decorator="['actions']" :allowClear="true">
              <a-select-option v-for="(action, index) in permissionList" :key="action.action" :value="action.action">{{
                action.describe
              }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-spin>
      </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['permissionId', 'permissionName','status','describe','actions']

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    model: {
      type: Object,
      default: () => null
    },
    permissionList:{
      type: Array,
      default: () => null
    }
  },
  data () {
    
    return {
      form: this.$form.createForm(this),
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      title:'',
      disablePermissionId:true
    }
  },
  created () {
    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))
    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      this.model && this.form.setFieldsValue(pick(this.model, fields))
      if(this.model && this.model.permissionId){
        this.title = '编辑' +this.model.permissionName
        this.disablePermissionId = true
      }else{
        this.title = '新增权限'
        this.disablePermissionId = false
      }
    })
  },
  methods: {

  }
}
</script>
