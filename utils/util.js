var api = require('../config/api.js');
var qianbao = require('../config/qianbao.js');
var settingIsOpen = false
var hasGoLogin = false
var que = []
var que2 = []
var loginRes = null

const codeMap = require('./codeMap') 
var request = require('./request.js').request 

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatDate(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  return [year, month, day].map(formatNumber).join('-') 
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}  

//弃用
function openSetting() {
  return new Promise((resolve,reject)=>{
    if (!settingIsOpen) {
      settingIsOpen = true
      console.log(1)
      wx.openSetting({
        complete:function(data){
          console.log(data)
            settingIsOpen = false
            if (data.authSetting["scope.userInfo"]) {
              console.log(3)
              que2.forEach(item=>{
                item && item()
              })
              que2 = []
              resolve()
            } else {
              reject(data)
              /*openSetting().then(()=>{
                resolve()
              })*/
            }
        }
      })
    } else {
      que2.push(resolve)
    }
  })
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}


module.exports = {
  formatTime,
  formatDate,
  request,
  showErrorToast,
}


