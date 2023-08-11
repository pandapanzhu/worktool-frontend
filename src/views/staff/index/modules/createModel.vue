<template>
    <a-modal :title="title" :width="800" :visible="visible" @ok="() => {
            $emit('ok')
        }
        " @cancel="() => {
            $emit('cancel')
        }
        ">
        <a-spin :spinning="loading">
            <a-form :form="form">
                <a-form-item v-show="false" :labelCol="labelCol" :wrapperCol="wrapperCol" label="系统编码" hasFeedback>
                    <a-input placeholder="请输入系统编码"
                        v-decorator="['systemId', { rules: [{ required: true, message: '请输入系统编码' }] }]" id="systemId"
                        :disabled="disableId" :visible="disableId" />
                </a-form-item>
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="客户列表">
                    <a-select style="width: 100%"  v-decorator="['supplierId']" :allowClear="true">
                        <a-select-option v-for="(supplier, index) in supplierList" :key="supplier.supplierId"
                            :value="supplier.supplierId">{{
                                supplier.name
                            }}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="系统名称" hasFeedback>
                    <a-input placeholder="系统名称"
                        v-decorator="['systemName', { rules: [{ required: true, message: '请输入系统名称' }] }]" id="systemName"
                        :disabled="disableId" />
                </a-form-item>

                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="监控地址" hasFeedback>
                    <a-input placeholder="请输入监控地址" v-decorator="['url', { rules: [{ required: true, message: '请输入监控地址' }] }]"
                        id="email" />
                </a-form-item>

                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="系统类型" hasFeedback>
                    <a-select v-decorator="['type', { rules: [{ required: true, message: '请选择系统类型' }]  }]">
                        <a-select-option :value="1">B端系统</a-select-option>
                        <a-select-option :value="0">C端系统</a-select-option>
                    </a-select>
                </a-form-item>

            </a-form>
        </a-spin>
    </a-modal>
</template>

<script>
import pick from 'lodash.pick'
// 表单字段
const fields = ['systemId','systemName', 'url', 'type', 'supplierId']

export default {
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        loading: {
            type: Boolean,
            default: () => false,
        },
        model: {
            type: Object,
            default: () => null,
        },
        supplierList: {
            type: Array,
            default: () => null,
        },
    },
    data() {
        return {
            form: this.$form.createForm(this),
            labelCol: {
                xs: { span: 24 },
                sm: { span: 7 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 13 },
            },
            title: '',
            disableId: true,
        }
    },
    created() {
        // 防止表单未注册
        fields.forEach((v) => this.form.getFieldDecorator(v))
        // 当 model 发生改变时，为表单设置值
        this.$watch('model', () => {
            this.model && this.form.setFieldsValue(pick(this.model, fields))
            if (this.model && this.model.username) {
                this.title = '编辑' + this.model.username
                this.disableId = true
            } else {
                this.title = '新增用户'
                this.disableId = false
            }
        })
    },
    methods: {},
}
</script>
