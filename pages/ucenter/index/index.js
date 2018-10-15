var util = require('../../../utils/util.js');
var auth = require('../../../services/auth.js');
var sellerMgr = require('../../../services/seller.js');
var orderMgr = require('../../../services/order.js');
var couponMgr = require('../../../services/coupon.js')
var theme = require('../../../utils/theme.js');

var app = getApp();

Page({

  data: {
    userInfo: {
      user: {
        nickName: '点击登录',
        avatar: 'https://oss.qianbaocard.org/20180912/89e031e2fb724c9fb43a81553d200bcc.png'
      }
    },
    phone:'',
    mainColor: '#333',
    isAuth:false,
    couponNum:0,
    orderNum:0,
    extraData:{id:36710}//
  },

  contactUs(){
    sellerMgr.getDetail().then(sellerInfo=>{
      if (sellerInfo.contacts && sellerInfo.contacts[0] && sellerInfo.contacts[0].phone ) {
        wx.makePhoneCall({
          phoneNumber: sellerInfo.contacts[0].phone,
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '商家未预留联系方式',
          showCancel:false,
        })
      }
    })
  },

  getPhoneNumber: function (e) {
    console.log()
    const _this = this;
    if (e.detail.iv) {
      auth.bindTel(e.detail).then(info=> {
        var phone = info.phone;
        _this.setData({
          phone
        });
      });
    }
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      mainColor: theme.color
    });
    this.getOrderNum();
    this.getCouponNum();
  },

  onReady: function () {
    
  },

  onShow: function () {
    let userInfo = auth.getUserInfo();
    if (userInfo && userInfo.wx) {
      this.setData({
        userInfo: userInfo,
        isAuth: true
      })
    }
    if (userInfo.phone) {
      this.setData({
        phone: userInfo.phone
      })
    }
  },

  onHide: function () {
    // 页面隐藏
  },

  onUnload: function () {
    // 页面关闭
  },

  stayYuned(){
    wx.showModal({
      title: '提示',
      content: '更多功能敬请期待',
      showCancel:false,
    })
  },

  bindGetUserInfo(e){
    var _this = this;
    if (e.detail.userInfo){
      auth.authLogin(e.detail).then(info=>{
        _this.setData({
          userInfo: info,
          isAuth: true
        });
      });
    }
  },

  reset: function () {
    wx.showModal({
      title: '',
      confirmColor: '#b4282d',
      content: '确定清除缓存？',
      success: function (res) {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({
            url: '/pages/index/index',
          });
        }
      }
    })
  },

  getOrderNum(){
    let _this = this;
    orderMgr.getList({
      status : '21',
      bizCode : "100,101,102,103"
    }).then(res=>{
      _this.setData({
        orderNum: res.total
      })
    });
  },

  getCouponNum(){
    let _this = this;
    couponMgr.getList({
      status : 'NORMAL'
    }).then(res=>{
      _this.setData({
        couponNum: res.total
      })
    });
  }
  
})
