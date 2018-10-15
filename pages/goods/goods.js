var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var qianbao = require('../../config/qianbao.js');

Page({
  data: {
    id: 0,
    goods: {},
    activity:{},
    gallery: [],
    brand: {},
    relatedGoods: [],
    cartGoodsCount: 0,
    userHasCollect: 0,
    footprintId:'',
    number: 1,
    openAttr: false,
    noCollectImage: "/static/images/icon_collect.png",
    hasCollectImage: "/static/images/icon_collect_checked.png",
    collectBackImage: "/static/images/icon_collect.png"
  },
  getGoodsInfo: function () {
    let that = this;
    util.request(qianbao.Url_Products + '/' + that.data.id +'?append=goods_list').then(function (res) {
      if (res.code === 0) {
        wx.setNavigationBarTitle({
          title: res.data.name
        })
        that.setData({
          goods: res.data,
          gallery: res.data.media,
          // gallery: res.data.gallery,
          // brand: res.data.brand,
          // userHasCollect: res.data.userHasCollect
        });
        that.checkIsCollected(res.data.id);

        WxParse.wxParse('goodsDetail', 'html', res.data.content, that);

      }
    });

  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      id: options.id
    });
    var that = this;
    this.getGoodsInfo();

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    wx.setStorageSync('cartGoodsCount', this.data.cartGoodsCount);
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
    wx.setStorageSync('cartGoodsCount', this.data.cartGoodsCount);

  },
  checkIsCollected: function(id) {
    let that = this;
    util.request(qianbao.Url_Footprints, {
      targetId: id,
      type:"COLLECTION"
    }, "GET")
      .then(function (res) {
        let _res = res;
        if (_res.code == 0 ) {
          if ( _res.data.length > 0) {
            console.info(_res.data[0].target.id);
          that.setData({
            'collectBackImage': that.data.hasCollectImage,
            'footprintId': _res.data[0].target.id,
            'userHasCollect': 1
          });
          }
        } else {
          wx.showToast({
            image: '/static/images/icon_error.png',
            title: _res.message + '',
            mask: true
          });
        }

      });
  },

})