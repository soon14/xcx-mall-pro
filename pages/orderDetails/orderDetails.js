// pages/orderDetails/orderDetails.js
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var qianbao = require('../../config/qianbao.js');
var shopMgr = require('../../services/shop.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopId: 1,
    bizCode: 0,
    orderId: 0,
    orderInfo: {},
    orderGoods: [],
    handleOption: {},
    isfold:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.id,
    });
    this.getOrderDetail();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  onShareAppMessage: function() {
    return {
      title: '分享',
      path: '/pages/index/index'
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  getOrderDetail() {
    let that = this;
    util.request(qianbao.Url_Orders + '/' + that.data.orderId, {
      append: 'payments,items,fulfillment,address'
    }).then(function(res) {
      if (res.code === 0) {
        console.log(res.data);
        let orderInfo = res.data;
        orderInfo.formatTotalFee = orderInfo.totalFee / 100;
        if (orderInfo.paidTime) {
          orderInfo.formatPaidTime = util.formatTime(new Date(orderInfo.paidTime))
        } else {
          orderInfo.formatPaidTime = util.formatTime(new Date(orderInfo.modifiedTime))

        }
        if (orderInfo.fulfillment.metadata) {
          orderInfo.fulfillment.metadata.delivery.finishTime = util.formatTime(new Date(orderInfo.fulfillment.metadata.delivery.finishTime))
        }
        orderInfo.metadataObj = {}
        // try {
        //   orderInfo.metadataObj = JSON.parse(orderInfo.metadata)
        // } catch (e) {}
        that.setData({
          orderInfo: orderInfo,
          orderGoods: res.data.items,
          shopId: orderInfo.shopId,
          bizCode: orderInfo.bizCode
        });
        if (res.data.handleOption) {
          that.setData({
            handleOption: res.data.handleOption,
          })
        }
        console.log(that.data.orderInfo)
        //that.payTimer();
      }
    });
  },
  moreInfo(){
    this.setData({
      isfold:!this.data.isfold,
    })
  },
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  goCatelog() {
    var shopId = this.data.shopId;
    var bizCode = this.data.bizCode;
    if (bizCode == 102) {
      wx.setStorageSync("takeout", shopId)
      wx.switchTab({
        url: '/pages/takeaway/shopOrder_ta/shopOrder_ta?id=' + shopId
      });
    } else if (bizCode == 103) {
      wx.setStorageSync("mall", shopId)
      wx.switchTab({
        url: '/pages/takeaway/giftShop/giftShop?id=' + shopId
      });
    }

  },
  goIndex() {
    var shopId = this.data.shopId;
    wx.navigateTo({
      url: '/pages/shopDetail/shopDetail?id=' + shopId
    });
  },
  share() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  makePhone() {
    wx.makePhoneCall({
      phoneNumber: this.data.orderInfo.fulfillment.metadata.delivery.delivererPhone
    })
  },
  makePhoneMerhcant() {
    shopMgr.getDetail(this.data.shopId).then(function(res) {
      var shop = res.data
      var arr = shop.phone.split(',');

      wx.makePhoneCall({
        phoneNumber: arr[0]
      })
    });

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {

  // }
})