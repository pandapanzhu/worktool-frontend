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

                <a-form-item v-show="!disableId" :labelCol="labelCol" :wrapperCol="wrapperCol" label="客户编码" hasFeedback>
                    <a-input placeholder="请输入客户编码"
                        v-decorator="['supplierId', { rules: [{ required: true, message: '请输入客户编码' }] }]" id="supplierId"
                        :disabled="disableId" :visible="disableId" />
                </a-form-item>
                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="客户名称" hasFeedback>
                    <a-input placeholder="请输入客户名称"
                        v-decorator="['name', { rules: [{ required: true, message: '请输入客户名称' }] }]" id="name"  />
                </a-form-item>

                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="邮箱" hasFeedback>
                    <a-input placeholder="请输入邮箱" v-decorator="['email']" id="email" />
                </a-form-item>

                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="电话号码" hasFeedback>
                    <a-input placeholder="请输入电话号码" v-decorator="['mobile']" id="mobile" />
                </a-form-item>

                <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="状态" hasFeedback>
                    <a-select v-decorator="['status', { rules: [{ required: true, message: '请选择状态' }]  }]">
                        <a-select-option :value="1">正常</a-select-option>
                        <a-select-option :value="0">禁用</a-select-option>
                    </a-select>
                </a-form-item>

            </a-form>
        </a-spin>
    </a-modal>
</template>

<script>
import pick from 'lodash.pick'
// 表单字段
const fields = ['supplierId','name', 'email', 'status', 'mobile', 'updateTime']

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
            if (this.model && this.model.name) {
                this.title = '编辑' + this.model.name
            } else {
                this.title = '新增客户'
            }
        })
    },
    methods: {},
}
</script>
