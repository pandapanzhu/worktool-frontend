
export function notificationError(err, _this) {
  if(err.response.status ==404){
    err = "网络错误,请稍后再试"
  }
  _this.$notification['error']({
    message: '错误',
    description: ((err.response || err).msg || err) || '请求出现错误，请稍后再试',
    duration: 4
  })
}

export function notificationSuccess(title, msg, _this) {
  _this.$notification['success']({
    message: title || '成功',
    description: msg || '操作成功',
    duration: 4
  })
}