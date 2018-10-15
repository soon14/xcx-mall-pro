// pages/wifi/wifiSetting.js
var auth = require('../../services/auth.js');
var qianbao 	= require('../../config/qianbao.js');
var shopMgr   = require('../../services/shop.js')
const util = require('../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
	
    shopIndex: 0,
    wifiIndex: 0,
    showWifiDetail: false,
    
    shops: [],
    wifis: [],

    shop:{},
    wifi:{},
  },

  hideWifiDetail() {
    this.hidePreviewAnimate();
    setTimeout(() => {
      this.setData({
        showWifiDetail: false,
      })
    }, 400)
  },

  hidePreviewAnimate() {
    var animation1 = wx.createAnimation({
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });
    var animation2 = wx.createAnimation({
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });
    animation2.opacity(0).step();
    this.setData({ previewAnimationData: animation2 })

    animation1.scale(1.1).step();
    this.setData({ animationData: animation1.export() })

    setTimeout(() => {
      animation1.scale(1).step();
      this.animationData = animation1
      this.setData({ animationData: animation1 })
    }, 200)
  },

  showPreviewAnimate() {
    /* 动画部分 */
    // 第1步：创建动画实例   
    var animation1 = wx.createAnimation({
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });
    var animation2 = wx.createAnimation({
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });

    animation2.opacity(1).step();
    this.setData({ previewAnimationData: animation2 })

    animation1.scale(1.1).step();
    this.setData({ animationData: animation1.export() })

    setTimeout(() => {
      animation1.scale(1).step();
      this.animationData = animation1
      this.setData({ animationData: animation1 })
    }, 200)
  },

  bindPickerChangeWifiShop: function (e) {
    var index = e.detail.value;
    var shop = this.data.shops[index];
    var wifis = shop.wifiDevices;
    this.setData({
      shopIndex: index,
      shop,
      wifis,
      wifiIndex: 0,
      wifi: wifis[0]
    });

  },

  bindPickerChangeWifi: function (e) {
    this.setData({
      wifiIndex: e.detail.value,
      wifi: this.data.wifis[e.detail.value],
    })
  },

  bindGetUserInfo (e) {
    var _this = this;
    if (e.detail.userInfo){
      auth.authLogin().then(res=>{
        _this.wifiClickOK();
      });
    }
  },

  wifiClickOK: function () {
    if (wx.canIUse('connectWifi')) {
      let _this = this;
      wx.startWifi({
        success: function (res) {
          // wx.showLoading({
          //   title: '连接中',
          // });
          wx.connectWifi({
            SSID: _this.data.wifi.ssid,
            BSSID: _this.data.wifi.bssid,
            password: _this.data.wifi.password,
            success: function (res) {
              wx.showToast({
                title: '连接成功',
              });
              wx.navigateBack({
              });
            },
            fail: function (res) {

              if (res.errCode == 12007) {
                return;
              }

							var title = res.errMsg;
              if (res.errCode == 12005) {
                title = '请打开手机WI-FI设置'
              } else if (res.errCode == 12003 || res.errCode == 12002) {
                title = 'WI-FI信息错误，请联系管理员';
              }else{
                _this.setData({
                  showWifiDetail: true,
                });
                _this.showPreviewAnimate();
                return;
              }
              wx.showToast({
                icon: 'none',
								title
              });
            },
            complete: function (res) {
              wx.stopWifi({
              });
            }
          });
        },
        fail: function (err) {
          _this.setData({
            showWifiDetail: true,
          });
          _this.showPreviewAnimate();
        }
      })
    } else {
      this.setData({
        showWifiDetail: true,
      });
      this.showPreviewAnimate();
    }

  },

  wifiPwdCopy: function () {
    wx.setClipboardData({
      data: this.data.wifi.password,
    });
    this.setData({
      showWifiDetail: false,
    });
    this.hidePreviewAnimate();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    var latitude = app.globalData.location.latitude
    var longitude = app.globalData.location.longitude
    var hasAddress = !!latitude && !!longitude
    if (!hasAddress) {
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          console.log(_this)
          var latitude = res.latitude
          var longitude = res.longitude
          app.globalData.location.latitude = latitude
          app.globalData.location.longitude = longitude
          _this.getShopbyLocation(latitude, longitude)
        },
        fail: function (err) {
          _this.getShopbyLocation('', '')
        }
      })
    } else {
      _this.getShopbyLocation(latitude, longitude)
    }
  },

  getShopbyLocation(latitude, longitude) {
    let _this = this;
    // 获得shop列表
    return shopMgr.getList({  
      latitude, 
      longitude 
    }).then(function (res) {
      var shops = res.data.map(function(v){
				v.showName = v.name + (v.branchName?"(" + v.branchName + ")" : "");
				return v;
			});
      var shop = shops[0];
      var wifis = shop.wifiDevices;
      _this.setData({
        shops,
        shopIndex:0,
        shop,
        wifis,
        wifiIndex:0,
        wifi:wifis[0]
      })
    })
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