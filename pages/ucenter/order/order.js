var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var qianbao = require('../../../config/qianbao.js');
var orderMgr = require('../../../services/order.js');
var auth = require('../../../services/auth.js');
let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}

Page({

  /**
   * 页面的初始数据 
   */
  data: {
    pageNum: 1,
    pageSize: 5,
    pageNumTake: 1,
    pageSizeTake: 5,
    pageNumGift: 1,
    pageSizeGift: 5,
    isLoading: true,
    isTakeLoading: true,
    isGiftLoading: true,
    noMoreTakeData: false,
    noMoreGiftData: false,
    noMoreData: false,
    isTakeout: 2,
    takeoutList: [],
    giftList: [],
    orderList: [],
  },
  getOrderList() {
    this.setData({
      isLoading: true
    })
    let buyerId = auth.getUserInfo().user.id;
    let sellerId = extConfig.SellerID;
    util.request(qianbao.Url_Orders, {
      needItem: true,
      buyerId: buyerId,
      sellerId: sellerId,
      status: '21',
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      bizCode: '100,101'
    }).then(res => {
      if (res.code === 0) {
        let orderList = this.data.orderList.concat(res.data.map(v => {
          v.formatTotalFee = v.totalFee / 100;
          if (v.paidTime) {
            v.createdTime = util.formatTime(new Date(v.createdTime))
          } else {
            v.createdTime = util.formatTime(new Date(v.createdTime))
          }

          v.metadataObj = {}
          try {
            v.metadataObj = JSON.parse(v.metadata)
          } catch (e) { }
          return v;
        }));
        console.log(orderList)
        this.setData({
          orderList,
          isLoading: false,
          noMoreData: res.data.length < this.data.pageSize
        });
      }
    });
  },
  // =================================
  getTakeOrderList() {
    this.setData({
      isTakeLoading: true
    })
    let buyerId = auth.getUserInfo().user.id;
    let sellerId = extConfig.SellerID;
    util.request(qianbao.Url_Orders, {
      needItem: true,
      buyerId: buyerId,
      sellerId: sellerId,
      //外卖订单目前去除显示待支付状态 11,12,20,
      status: '21',
      pageNum: this.data.pageNumTake,
      pageSize: this.data.pageSizeTake,
      bizCode: 102,
      needFulfillment: true
    }).then(res => {
      if (res.code === 0) {
        let takeoutList = this.data.takeoutList.concat(res.data.map(v => {
          v.formatTotalFee = v.totalFee / 100;
          if (v.paidTime) {
            v.createdTime = util.formatTime(new Date(v.createdTime))
          } else {
            v.createdTime = util.formatTime(new Date(v.createdTime))

          }
          v.metadataObj = {}
          try {
            v.metadataObj = JSON.parse(v.metadata)
          } catch (e) { }
          return v;
        }));
        this.setData({
          takeoutList,
          isTakeLoading: false,
          noMoreTakeData: res.data.length < this.data.pageSizeTake
        });
        console.log(this.data.takeoutList)
      }
    });
  },
  // ====================================
  getGiftOrderList() {
    this.setData({
      isGiftLoading: true
    })
    let buyerId = auth.getUserInfo().user.id;
    let sellerId = extConfig.SellerID;
    util.request(qianbao.Url_Orders, {
      needItem: true,
      buyerId: buyerId,
      sellerId: sellerId,
      //商城订单目前去除显示待支付状态. 11,12,20,
      status: '21',
      pageNum: this.data.pageNumGift,
      pageSize: this.data.pageSizeGift,
      bizCode: 103,
      needFulfillment: true
    }).then(res => {
      if (res.code === 0) {
        let giftList = this.data.giftList.concat(res.data.map(v => {
          v.formatTotalFee = v.totalFee / 100;
          if (v.paidTime) {
            v.createdTime = util.formatTime(new Date(v.createdTime))
          } else {
            v.createdTime = util.formatTime(new Date(v.createdTime))
          }
          v.metadataObj = {}
          try {
            v.metadataObj = JSON.parse(v.metadata)
          } catch (e) { }
          return v;
        }));
        console.log(giftList)
        this.setData({
          giftList,
          isGiftLoading: false,
          noMoreGiftData: res.data.length < this.data.pageSizeGift
        });
      }
    });
  },
  addPage() {
    if (this.data.isLoading || this.data.noMoreData) return
    this.setData({
      pageNum: this.data.pageNum + 1
    })
    this.getOrderList()
  },
  // =======================
  addTakePage() {
    console.log("111111111111")
    if (this.data.isTakeLoading || this.data.noMoreTakeData) return
    this.setData({
      pageNumTake: this.data.pageNumTake + 1
    })
    this.getTakeOrderList()
  },
  // ==========================
  addGiftPage() {
    if (this.data.isGiftLoading || this.data.noMoreGiftData) return
    this.setData({
      pageNumGift: this.data.pageNumGift + 1
    })
    this.getGiftOrderList()
  },
  payOrder: function (event) {

    let orderIndex = event.target.dataset.orderIndex;
    console.info(orderIndex);
    let order = this.data.orderList[orderIndex];
    console.info(order);

    let that = this;
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    orderMgr.pay(order.shopId, order.id).then(function (res) {
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
  // ===============
  payTakeOrder: function (event) {

    let orderIndex = event.target.dataset.orderIndex;
    console.info(orderIndex);
    let order = this.data.takeoutList[orderIndex];
    console.info(order);

    let that = this;
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    orderMgr.pay(order.shopId, order.id).then(function (res) {
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
        })
      }
    })
  },
  // ============
  payGiftOrder: function (event) {

    let orderIndex = event.target.dataset.orderIndex;
    console.info(orderIndex);
    let order = this.data.giftList[orderIndex];
    console.info(order);

    let that = this;
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    orderMgr.pay(order.shopId, order.id).then(function (res) {
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
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderList();
    this.getTakeOrderList();
    this.getGiftOrderList();
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
    console.log("xxxxx");
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  selectTakeout: function () {
    this.setData({
      isTakeout: 0
    })
  },
  selectGift: function () {
    this.setData({
      isTakeout: 1
    })
  },
  selectTang: function () {
    this.setData({
      isTakeout: 2
    })
  },
  goTakeout:function(e){
    wx.switchTab({
      url: '/pages/takeaway/shopOrder_ta/shopOrder_ta'
    });
  }
})