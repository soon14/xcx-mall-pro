 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    path : "", 
    name:"",
    icon:"",
    btns:[],
  },

  clickOrder: function () {
    wx.reLaunch({
      url: '/pages/orderMenu/orderMenu' + this.data.path
    });
  },

  clickPay: function () {
    wx.navigateTo({
      url: '/pages/payInput/payInput' + this.data.path
    });
  },

  clickWIFI: function () {
    wx.navigateTo({
      url: '/pages/wifi/wifiSetting' + this.data.path
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var str = "?";
    for (var key in options) {
      str = str + key + "=" + options[key] + "&";
    }
    
    str = str.substring(0, str.length - 1);

    this.setData({
      path: str,
    });

    let _this = this;
    getApp().getBrandName().then(res => {
      let info = wx.getStorageSync('sellerInfo');
      console.log(JSON.stringify(info));
      _this.setData({
        name: info.wx.miniApps[0].nickName,
        icon: info.wx.miniApps[0].headImg,
      });
      wx.setNavigationBarTitle({
        title: _this.data.name
      });
    })

    var btns = [];
    if (options.showOrder == "1") {
      btns.push({
        name: "我要点餐",
        icon: "/static/images/scan_menu.png",
        type: "clickOrder",
      });
    }
    if (options.showPay == "1") {
      btns.push({
        name: "我要买单",
        icon: "/static/images/scan_pay.png",
        type: "clickPay",
      });
    }
    if (options.showWifi == "1") {
      btns.push({
        name: "连接WI-FI",
				icon: "/static/images/scan_wifi.png",
        type: "clickWIFI",
      });
    }

    this.setData({btns});

  },

  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
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