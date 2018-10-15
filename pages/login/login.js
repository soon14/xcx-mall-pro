var auth = require('../../services/auth.js');

// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    route: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var route = decodeURIComponent(options.from) || 'pages/index/index'
    this.setData({
      route
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  bindGetUserInfo: function(e) {
    var _this = this;
    if (e.detail.userInfo) {
      wx.showLoading();
      auth.authLogin().then(res => {
        wx.hideLoading();
        wx.reLaunch({
          url: '/' + _this.data.route
        });
      }).catch(err => {
        wx.hideLoading();
      });
    }
  },

  clickCancel() {
    wx.reLaunch({
      url: '/' + this.data.route
    });
  }

})