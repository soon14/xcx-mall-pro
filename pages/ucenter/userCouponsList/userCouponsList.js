// pages/ucenter/userCouponsList/userCouponsList.js

var request_coupon = require('../../../services/coupons.js');
var auth = require('../../../services/auth.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupons: [],
    pageSize:20,
    pageNum:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getUserCoupons(this);
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
    this.data.pageNum = 1;
    getUserCoupons(this);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.pageNum++;
    getUserCoupons(this);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return{
      title : '有优惠券啦',
      path:'/pages/index/index',
      imageUrl:'/static/images/address.jpg'
    }
  },
  
  lijishiyong: function (res) {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})
//查询优惠券--begain
function getUserCoupons(_this){
  var requestParams = {};
  requestParams.userId = auth.getUserInfo().user.id;
  requestParams.status = 'NORMAL,INEFFECTIVE,EXPIRED';
  requestParams.pageNum = 1;
  requestParams.pageSize = 50;
  request_coupon.queryUserCoupons(requestParams).then(function(res){
    console.log('--优惠券--');
    console.log(res)
    wx.stopPullDownRefresh();
    changeNetDataToLocalData(_this,res);
  });
}
//查询优惠券--end

//转换网络数据到本地数据显示---begain
function changeNetDataToLocalData(_this, res) {
  var coupons = [];
  res.data.forEach(function (item, index) {
    var tmpCoupon = {};
    tmpCoupon.discount = item.mold.reduceFee;
    if (item.mold.leastFee != 0) {
      tmpCoupon.workCondition = '满' + item.mold.leastFee + '元可用';
    } else {
      tmpCoupon.workCondition = '无门槛';
    }
    tmpCoupon.workInfo = item.mold.name;
    var endTime = item.endTime - Date.parse(new Date());
    endTime = parseInt(endTime /1000/60/60/24);
    tmpCoupon.deadLine = endTime + '天后';
    if (item.status == 'NORMAL') {
      tmpCoupon.status = 'unUse';
    } else if (item.status == 'EXPIRED' || item.status == 'INEFFECTIVE') {
      tmpCoupon.status = 'deadLined';
    } 
    coupons.push(tmpCoupon);
  });
  _this.setData({
    coupons,
  });
}
  //转换网络数据到本地数据显示---end