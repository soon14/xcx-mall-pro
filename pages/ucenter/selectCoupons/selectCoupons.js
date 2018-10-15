// pages/ucenter/selectCoupons/selectCoupons.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupons:[],
    unUseCoupon:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getCoupons(this);
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
  
  },
  onUnuseCouponClick : function(res){//点击不使用红包
    var unUseCoupon = this.data.unUseCoupon;
    unUseCoupon = !unUseCoupon;
    if(!unUseCoupon){
      wx.setStorageSync('coupon', {});
    }
    this.setData({
      unUseCoupon
    });
  },
  singleSelected : function(res){
      var tmp = {};
      res.detail.forEach(function(value,key){
        tmp = value;
      });
      wx.setStorageSync('coupon', tmp);
  },
})

function getCoupons(_this){
  var coupons = [];  
  for(var i = 0 ; i < 20 ;i++){
    var coupon = {};
    coupon.discount = i;
    coupon.workCondition = '满30元可用';
    coupon.workInfo = '新用户专享红包';
    coupon.deadLine = '2018.12.12';
    coupon.status='check';
    coupons.push(coupon);
  }
  _this.setData({
    coupons
  });
}