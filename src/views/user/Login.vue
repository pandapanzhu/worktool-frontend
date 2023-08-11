<template>
  <div class="main">
    <a-form ref="formLogin" :form="form" @submit="handleSubmit">
      <a-tabs :activeKey="customActiveKey" :tabBarStyle="{ textAlign: 'center', borderBottom: 'unset' }" @change="handleTabClick">
        <a-tab-pane key="tab1" :tab="$t('user.login.tab-login-credentials')"></a-tab-pane>
        <!-- <a-tab-pane key="tab2" :tab="$t('user.login.tab-login-mobile')">
          <a-form-item>
            <a-input size="large" type="text" :placeholder="$t('user.login.mobile.placeholder')" v-decorator="['mobile', {rules: [{ required: true, pattern: /^1[34578]\d{9}$/, message: $t('user.login.mobile.placeholder') }], validateTrigger: 'change'}]">
              <a-icon slot="prefix" type="mobile" :style="{ color: 'rgba(0,0,0,.25)' }"/>
            </a-input>
          </a-form-item>

          <a-row :gutter="16">
            <a-col class="gutter-row" :span="16">
              <a-form-item>
                <a-input size="large" type="text" :placeholder="$t('user.login.mobile.verification-code.placeholder')" v-decorator="['captcha', {rules: [{ required: true, message: $t('user.verification-code.required') }], validateTrigger: 'blur'}]">
                  <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }"/>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="8">
              <a-button
                class="getCaptcha"
                tabindex="-1"
                :disabled="state.smsSendBtn"
                @click.stop.prevent="getCaptcha"
                v-text="!state.smsSendBtn && $t('user.register.get-verification-code') || (state.time+' s')"
              ></a-button>
            </a-col>
          </a-row>
        </a-tab-pane> -->
      </a-tabs>
      <div v-if="customActiveKey == 'tab1'">
        <a-alert v-if="isLoginError" type="error" showIcon style="margin-bottom: 24px;" :message="$t('user.login.message-invalid-credentials')" />
        <a-form-item>
          <a-input 
            size="large" 
            type="text"
            :placeholder="$t('user.login.username.placeholder')"
            v-decorator="[ 'username', {rules: [{ required: true, message: $t('user.userName.required') }, { validator: handleUsernameOrEmail }], validateTrigger: 'change'}]">
            <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }"/>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input-password 
            size="large"
            :placeholder="$t('user.login.password.placeholder')"
            v-decorator="[ 'password', {rules: [{ required: true, message: $t('user.password.required') }], validateTrigger: 'blur'}]">
            <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }"/>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-row style="display: flex; align-items: center;">
            <a-col :span="14">
              <a-input 
                size="large"
                :placeholder="$t('user.login.verification-code.placeholder')" 
                v-decorator="[ 'verificationCode', {rules: [{ required: true, message: $t('user.verification-code.required') }], validateTrigger: 'blur'}]">
                <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }"/>
              </a-input>
            </a-col>
            <a-col :span="10" style="margin-top: -4px;overflow: hidden;">
              <img :src="randCodeImage" style="height: 40px;" @click="initImgCaptcha()"/>
            </a-col>
          </a-row>
        </a-form-item>
      </div>
      
      <a-form-item>
        <a-checkbox v-decorator="['rememberMe', { valuePropName: 'checked' }]">{{ $t('user.login.remember-me') }}</a-checkbox>
        <router-link
          :to="{ name: 'recover', params: { user: 'aaa'} }"
          class="forge-password"
          style="float: right;"
        >{{ $t('user.login.forgot-password') }}</router-link>
      </a-form-item>
      <a-form-item style="margin-top:24px">
        <a-button
          style="width: 100%;"
          size="large"
          type="primary"
          htmlType="submit"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
        >{{ $t('user.login.login') }}</a-button>
      </a-form-item>
      <!-- <div class="user-login-other">
        <span>{{ $t('user.login.sign-in-with') }}</span>
        <a>
          <a-icon class="item-icon" type="alipay-circle"></a-icon>
        </a>
        <a>
          <a-icon class="item-icon" type="taobao-circle"></a-icon>
        </a>
        <a>
          <a-icon class="item-icon" type="weibo-circle"></a-icon>
        </a>
        <router-link class="register" :to="{ name: 'register' }">{{ $t('user.login.signup') }}</router-link>
      </div> -->
    </a-form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { timeFix, getUUID, getRandomString, AES_IV, AES_KEY } from '@/utils/util'
import { notificationError, notificationSuccess } from '@/utils/notification'
import { getSmsCaptcha, getImgCaptcha } from '@/api/login'
import CryptoJS from 'crypto-js'
export default {
  data () {
    return {
      customActiveKey: 'tab1',
      loginBtn: false,
      // login type: 0 email, 1 username, 2 telephone
      loginType: 1,
      isLoginError: false,
      form: this.$form.createForm(this),
      uidPrex: '',
      uuid: '',
      randCodeImage: '',
      state: {
        time: 60,
        loginBtn: false,
        // login type: 0 email, 1 username, 2 telephone
        loginType: 1,
        smsSendBtn: false
      }
    }
  },
  // 一进来执行这里的方法
  created () {
    this.uidPrex = process.env.VUE_APP_PREFIX + getRandomString(16) + '_'
    this.uuid = this.uidPrex + getUUID()
    this.initImgCaptcha(this.uuid)
  },
  methods: {
    ...mapActions(['Login', 'Logout']),
    initImgCaptcha () {
      // 拿验证码
      this.uuid = this.uidPrex + getUUID()
      getImgCaptcha(this.uuid)
      .then(res => {
        this.randCodeImage = res.data
      })
      .catch(() => {
        this.randCodeImage = ''
      })
    },
    // handler
    handleUsernameOrEmail (rule, value, callback) {
      const { state } = this
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        state.loginType = 0
      } else {
        state.loginType = 1
      }
      callback()
    },
    handleTabClick (key) {
      this.customActiveKey = key
      // this.form.resetFields()
    },
    handleSubmit (e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state,
        customActiveKey,
        Login
      } = this

      state.loginBtn = true

      const validateFieldsKey = customActiveKey === 'tab1' ? ['username', 'password', 'verificationCode'] : ['mobile', 'captcha']

      validateFields(validateFieldsKey, { force: true }, (err, values) => {
        if (!err) {
          const loginParams = { ...values }
          delete loginParams.username
          loginParams[!state.loginType ? 'email' : 'username'] = values.username
          // 密码要加密传输
          let iv = AES_IV
          let key = AES_KEY
          key = CryptoJS.enc.Utf8.parse(key)
          iv = CryptoJS.enc.Utf8.parse(iv)
          loginParams.password = CryptoJS.AES.encrypt(values.password, key, {
              iv: iv, // 偏移量
              mode: CryptoJS.mode.CBC, // 加密模式
              padding: CryptoJS.pad.Pkcs7 // 填充
          }).toString()
          loginParams.captcha = values.verificationCode
          loginParams.uuid = this.uuid
          Login(loginParams)
            .then((res) => {
              const code = res.code
              if (code === 200) {
                this.loginSuccess()
              } else {
                this.requestFailed(res)
              }
            })
            .catch(err => {
              console.log(err)
              this.requestFailed(err)
              this.initImgCaptcha()
            }).finally(() => {
              state.loginBtn = false
            })
        } else {
          this.initImgCaptcha(this.uidPrex + getUUID())
          setTimeout(() => {
            state.loginBtn = false
          }, 600)
        }
      })
    },
    getCaptcha (e) {
      e.preventDefault()
      const { form: { validateFields }, state } = this

      validateFields(['mobile'], { force: true }, (err, values) => {
        if (!err) {
          state.smsSendBtn = true

          const interval = window.setInterval(() => {
            if (state.time-- <= 0) {
              state.time = 60
              state.smsSendBtn = false
              window.clearInterval(interval)
            }
          }, 1000)

          const hide = this.$message.loading('验证码发送中..', 0)
          getSmsCaptcha({ mobile: values.mobile }).then(res => {
            setTimeout(hide, 2500)
            notificationSuccess('提示','验证码获取成功，您的验证码为：' + res.data.captcha,this)
          }).catch(err => {
            setTimeout(hide, 1)
            clearInterval(interval)
            state.time = 60
            state.smsSendBtn = false
            this.requestFailed(err)
          })
        }
      })
    },
    loginSuccess () {
      this.$router.push({ path: '/' })
      // 延迟 1 秒显示欢迎信息
      setTimeout(() => {
        notificationSuccess('欢迎',`${timeFix()}，欢迎回来`,this)
        // this.$notification.success({
        //   message: '欢迎',
        //   description: `${timeFix()}，欢迎回来`
        // })
      }, 1000)
      this.isLoginError = false
    },
    requestFailed (err) {
      notificationError(err,this)
    }
  }
}
</script>
