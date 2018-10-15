var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var qianbao = require('../../../config/qianbao.js');
const auth = require('../../../services/auth.js');
const { SellerID } = wx.getExtConfigSync()
var app = getApp();

Page({
  data: {
    checkedGoodsList: [],
    checkedAddress: {},
    checkedCoupon: [],
    couponList: [],
    goodsTotalPrice: 0.00, //商品总价
    freightPrice: 0.00,    //快递费
    couponPrice: 0.00,     //优惠券的价格
    orderTotalPrice: 0.00,  //订单总价
    actualPrice: 1,     //实际需要支付的总价
    addressId: 0,
    couponId: 0
  },
  onLoad: function (options) {

    // 页面初始化 options为页面跳转所带来的参数

    try {
      var addressId = wx.getStorageSync('addressId');
      if (addressId) {
        this.setData({
          'addressId': addressId
        });
      }

      var couponId = wx.getStorageSync('couponId');
      if (couponId) {
        this.setData({
          'couponId': couponId
        });
      }
    } catch (e) {
      // Do something when catch error
    }


  },
  getCheckoutInfo: function () {
    let that = this;
    // util.request(api.CartCheckout, { addressId: that.data.addressId, couponId: that.data.couponId }).then(function (res) {
    //   if (res.errno === 0) {
    //     console.log(res.data);
    //     that.setData({
    //       checkedGoodsList: res.data.checkedGoodsList,
    //       checkedAddress: res.data.checkedAddress,
    //       actualPrice: res.data.actualPrice,
    //       checkedCoupon: res.data.checkedCoupon,
    //       couponList: res.data.couponList,
    //       couponPrice: res.data.couponPrice,
    //       freightPrice: res.data.freightPrice,
    //       goodsTotalPrice: res.data.goodsTotalPrice,
    //       orderTotalPrice: res.data.orderTotalPrice
    //     });
    //   }
      wx.hideLoading();
    // });
  },
  selectAddress() {
    wx.navigateTo({
      url: '/pages/shopping/address/address',
    })
  },
  addAddress() {
    wx.navigateTo({
      url: '/pages/shopping/addressAdd/addressAdd',
    })
  },
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    // 页面显示
    wx.showLoading({
      title: '加载中...',
    })
    this.getCheckoutInfo();

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  },
  submitOrder: function () {

    util.request(qianbao.Url_Orders, {
            "bizCode": 101,
            "buyerId": auth.getUserInfo().user.id,
            "buyerName": auth.getUserInfo().user.nickName,
            // "channel": "PLACE:123456",
            "isTest": false,
            // "items": [
            //   {
            //     "goodsAttrs": "string",
            //     "goodsCatalog": "string",
            //     "goodsId": "string",
            //     "goodsName": "string",
            //     "goodsPic": "string",
            //     "metadata": "string",
            //     "quantity": 1,
            //     "realUnitPrice": 10,
            //     "shopId": "string",
            //     "type": 0,
            //     "unitPrice": 8
            //   }
            // ],
            "metadata": "[]",
            "realFee": 1,
            // "referNo": "string",
            "remark": "测试买单",
            "sellerId": "SellerID",
            "sellerName": wx.getStorageSync('brandName'),
            "shopId": "5aad05e5cb9a19021c3ec4d3",
            "shopName": "南翔店",
            "source": 100,
            "test": true
          }, 'POST').then(res => {
            util.request(`${qianbao.Url_trade}/${res.data.id}/pay`,{},'POST').then(res=>{
                console.log(res)
            })
    })

  }
})