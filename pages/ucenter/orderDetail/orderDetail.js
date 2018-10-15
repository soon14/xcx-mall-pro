var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var qianbao = require('../../../config/qianbao.js');
var orderMgr = require('../../../services/order.js');

Page({
  data: {
    orderId: 0,
    orderInfo: {},
    orderGoods: [],
    handleOption: {},
    isfold:true,
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.id,
    });
    this.getOrderDetail();
  },
  moreInfo(){
    this.setData({
      isfold:!this.data.isfold,
    })
  },
  goCatelog(){
    wx.reLaunch({
      url: '/pages/orderMenu/orderMenu'
    });
  },
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  getOrderDetail() {
    let that = this;
    util.request(qianbao.Url_Orders + '/' + that.data.orderId, { append:'payments,items'}).then(function (res) {
      if (res.code === 0) {
        console.log(res.data);
        let orderInfo = res.data;
        orderInfo.formatTotalFee = orderInfo.totalFee / 100;
        orderInfo.createdTime = util.formatTime(new Date(orderInfo.createdTime))
        orderInfo.metadataObj = {}
        try { 
					orderInfo.metadataObj = JSON.parse(orderInfo.metadata)  
				} catch(e){
				};
        that.setData({
          orderInfo: orderInfo,
          paidTime: util.formatTime(new Date(orderInfo.paidTime)),
          orderGoods: res.data.items,
        });
        console.log(that.data.orderInfo)
        if (res.data.handleOption) {
          that.setData({
            handleOption: res.data.handleOption
          });
        }
        // that.payTimer();
      }
    });
  },
  payTimer() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    setInterval(() => {
      console.log(orderInfo);
      orderInfo.add_time -= 1;
      that.setData({
        orderInfo: orderInfo,
      });
    }, 1000);
  },
  payOrder() {
    // if (this.data.addressId <= 0) {
    //   util.showErrorToast('请选择收货地址');
    //   return false;
    // }
    let that = this;
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    orderMgr.pay(that.data.orderInfo.shopId, that.data.orderInfo.id).then(function (res) {
      if (res.code === 0) {
        let payParam = res.data.wx;
        const orderId = res.data.id;
        console.info(res.data);
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
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=false&orderId=' + orderId,
            })
          }
        })
      }
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})