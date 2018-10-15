var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var qianbao = require('../../../config/qianbao.js');
const async = require("../../../utils/async.js");
var orderMgr = require('../../../services/order.js');
const activityMgr = require("../../../services/activity.js");

var app = getApp();

Page({
  data: {
    orderId: '',
    order: {},
    checkedGoodsList: [],
    checkedAddress: {},
    checkedCoupon: [],
    couponList: [],
    goodsTotalPrice: 0.00, //商品总价
    freightPrice: 0.00,    //快递费
    couponPrice: 0.00,     //优惠券的价格
    orderTotalPrice: 0.00,  //订单总价
    actualPrice: 0.00,     //实际需要支付的总价
    addressId: 0,
    couponId: 0
  },
  onLoad: function (options) {

    // 页面初始化 options为页面跳转所带来的参数

    try {
      wx.showLoading({
        title: '加载中...',
      })
      this.getCheckoutInfo();

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
    var now = new Date();
    var today = util.formatDate(now);
    var curPlace = wx.getStorageSync('curPlace');

    var key = 'SCANCODE_' + curPlace.id + '_' + today
    var curActivity = wx.getStorageSync(key);
    let checkedGoodsList
    let card
    //#warnning. activity type 有问题
    activityMgr.getList({ type: key }).then(function (res) {

      if (res.code === 0) {
        card = res.data[0].items
        let checkedList = res.data[0].items.filter(function (v) {
          if (v.metadata.isChecked == '1') {
            return true;
          } else {
            return false;
          }
        });
        let totalAmount = 0;
        let cgs = [];
        checkedGoodsList = checkedList.map(v => {
          console.info(v);
          let gs = {};
          v.number = parseInt(v.metadata.number);
          v.price = parseFloat(v.metadata.price, 2);
          gs.goodsId = v.eid;
          gs.productName = v.name;
          gs.goodsPic = v.metadata.url;
          gs.quantity = v.number;
          gs.realUnitPrice = v.price;
          gs.unitPrice = v.price;
          cgs.push(gs);
          v.goodsId = v.eid;
          v.productName = v.name;
          v.quantity = v.number;
          v.realUnitPrice = v.price;
          v.unitPrice = v.price;
          v.checked = (v.metadata.isChecked == '1') ? true : false;
          totalAmount = totalAmount + v.price * v.number;
          return v;
        });
        let curPlace = wx.getStorageSync('curPlace');
        that.setData({
          checkedGoodsList: checkedGoodsList,
          //checkedAddress: res.data.checkedAddress,
          actualPrice: totalAmount,
          //checkedCoupon: res.data.checkedCoupon,
          //couponList: res.data.couponList,
          //couponPrice: res.data.couponPrice,
          //freightPrice: res.data.freightPrice,
          goodsTotalPrice: totalAmount,
          orderTotalPrice: totalAmount
        });
        
        const orderSubData = {
          bizCode: 100,
          channel: 'PLACE_' + curPlace.id,
          isTest: false,
          items: cgs,
          shopId: curPlace.shop.id,
         
        }
        if (totalAmount > 0){
          orderSubData.realFee = totalAmount
        }
        wx.hideLoading();
        return util.request(qianbao.Url_Orders, orderSubData, 'POST');
      }else{
        throw new Error('获取购物车数据错误！');
      }
    }).then(function (res) {
      if (res.code === 0) {
        console.info(res.data);
        that.setData({
          order: res.data,
        });
        //#warnning. activity type 有问题
        var curPlace = wx.getStorageSync('curPlace');
        var key = 'SCANCODE_' + curPlace.id + '_' + util.formatDate(new Date())
        var curActivity = wx.getStorageSync(key);
        // #######
        async.map(checkedGoodsList, (item, callback) => {
          activityMgr.removeItem(curActivity.id,{id:item.eid}).then(function (res) {
            callback(null, res)
          });
        }, (err, res) => {
          if (err) {
            throw new Error(err);
          }
        })
      }else{
        throw new Error('生成订单错误！');
      }
      }).catch(function (error) {
        // 处理 getJSON 和 前一个回调函数运行时发生的错误
        console.log('发生错误！', error);
      });
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
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  },
  submitOrder: function () {
    let that = this;
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    let curPlace = wx.getStorageSync('curPlace');
    orderMgr.pay(curPlace.shop.id, that.data.order.id).then(function (res) {
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
    });

  }
})