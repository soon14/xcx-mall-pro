var util = require('../../utils/util.js');
var qianbao = require('../../config/qianbao.js');
var auth = require('../../services/auth.js');

var app = getApp();

Page({
  data: {
    messageList: [],
    nickName:'',
    avatar:''
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.getMessageList();
    let loginUser = auth.getUserInfo();
    try{
      this.setData({
        nickName:loginUser.wx.nickName,
        avatar:loginUser.wx.avatar
      })
    }catch(e){}
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示

  },
  getMessageList (){
    let that = this;
    util.request(qianbao.Url_Messages).then(function (res) {
      if (res.code === 0) {
        that.setData({
          messageList: res.data
        });
      }
    });
  },
  messageAddOrUpdate (event) {
    console.log(event)
    wx.navigateTo({
      url: '/pages/workspace/messageAdd/messageAdd?id=' + event.currentTarget.dataset.messageId
    })
  },
  deleteMessage(event){
    console.log(event.target)
    let that = this;
    wx.showModal({
      title: '',
      content: '确定要删除品牌？',
      success: function (res) {
        if (res.confirm) {
          let messageId = event.target.dataset.messageId;
          util.request(qianbao.Url_Messages + '/' + messageId, {}, 'DELETE').then(function (res) {
            if (res.code === 0) {
              that.getMessageList();
            }
          });
          console.log('用户点击确定')
        }
      }
    })
    return false;
    
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})