var auth = require('../../services/auth.js');
let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
var util = require('../../utils/util.js');
var qianbao = require('../../config/qianbao.js');
var orderMgr = require('../../services/order.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    mainColor: extConfig.mainColor,

    address:"",//地址
    refundTip:"",//优惠规则
    total:0,//总额
    exclude:0,//不优惠金额
    refund:0,//优惠金额
    actual:0,//实际支付金额

    qrCodeId: '',
    shop: {},
    place: {},

  },

  clickPay: function () {
    if (this.data.actual > 0) {
      const orderSubData = {
        bizCode: 101,
        channel: 'Pay',
        metadata: JSON.stringify({
          placeName: this.data.place.name,
          placeId: this.data.place.id,
        }),
        isTest: false,
        items: [{
          "unitPrice": this.data.actual * 100,
          "quantity": 1,
        }],
        shopId: this.data.shop.id,
      }
      util.request(qianbao.Url_Orders, orderSubData, 'POST').then(res => {
        if (res.code == 0) {
          this.payOrder(res.data.id)
        }
      });
    }else{
      wx.showToast({
        icon:"none",
        title:"请输入有效金额",
      });
    }
  },

  bindGetUserInfo: function(e) {
    var _this = this;
    if (e.detail.userInfo){
      auth.authLogin().then(res=>{
        _this.clickPay();
      });
    }
  },

  inputTotal: function (e) {
    this.setData({ 
      total: e.detail.value
    })
    this.updateMoney();
  },

  inputExclude: function (e) {
    this.setData({
      exclude: e.detail.value
    })
    this.updateMoney();
  },

  updateMoney: function () {
    this.setData({
      actual: this.data.total
    })
  },

  initByQrcodeId(id) {
    return util.request(qianbao.Url_Qrcodes + '/' + id +"?append=target").then(res => {
      if (res.code == 0 && res.data && res.data.target && res.data.target.id) {
        return this.getPlaceInfo(res.data.target.id);
      } else {
        throw new Error('获取信息失败')
      }
    })
  },

  getPlaceInfo(id) {
    if (id) {
      return util.request(qianbao.Url_Places + '/' + id).then(res => {
        if (res.code === 0) {

          let shop = res.data.shop.name;
          let branchName = res.data.shop.branchName;
          var address = shop;
          if (branchName)  {
            address = address + "(" + branchName + ")";
          }
          let catalog = res.data.catalog.name;
          if (address) {
            if (catalog && catalog != "未分类") {
              address = address + "-" + catalog;
            }
          }else{
            address = catalog;
          }
          let place = res.data.name;
          if (address) {
            if (place) {
              address = address + "-" + place;
            }
          }else{
            address = place;
          }
          this.setData({
            place: res.data,
            shop: res.data.shop,
            address,
          });
        }
      });
    }
  },

  payOrder(orderId) {

    let that = this;
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    orderMgr.pay(this.data.shop.id, orderId).then(function (res) {
      if (res.code === 0) {
        // 付款
        let payParam = res.data.wx;
        const orderId = res.data.id;
        wx.requestPayment({
          'timeStamp': payParam.timestamp + '',
          'nonceStr': payParam.nonceStr,
          'package': payParam.package,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function (res) {
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=true&orderId=' + orderId,
            })
          },
          'fail': function (res) {
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if (options.qrCodeId) {
      var app = getApp();
      this.setData({
        qrCodeId: options.qrCodeId,
      });
      this.initByQrcodeId(options.qrCodeId).catch(err => {
        wx.showToast({
          title: err.message,
          icon: 'none',
          duration: 2000
        })
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})