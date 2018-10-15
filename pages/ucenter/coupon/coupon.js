// pages/ucenter/userCouponsList/userCouponsList.js

var request_coupon = require('../../../services/coupons.js');
var auth = require('../../../services/auth.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupons: [],
    pageSize: 20,
    pageNum: 1,
    netCoupons:[],
    couponsTotal:0,
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
    if(this.data.couponsTotal <= this.data.netCoupons.length){
        return;
    }
    this.data.pageNum++;
    getUserCoupons(this);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    // return {
    //   title: '有优惠券啦',
    //   path: '/pages/index/index',
    //   imageUrl: '/static/images/address.jpg'
    // }
  },

  singleSelected: function (res) {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})
//查询优惠券--begain
function getUserCoupons(_this) {
  var requestParams = {};
  var netCoupons = _this.data.netCoupons;
  requestParams.userId = auth.getUserInfo().user.id;
  requestParams.status = 'NORMAL,INEFFECTIVE,EXPIRED';
  requestParams.pageNum = _this.data.pageNum;
  requestParams.pageSize =6;
  request_coupon.queryUserCoupons(requestParams).then(function (res) {
    console.log('--优惠券--');
    console.log(res)
    wx.stopPullDownRefresh();
    if (_this.data.pageNum > 1){
      netCoupons =  netCoupons.concat(res.data);
    }else{
      netCoupons = res.data;
    }
    _this.setData({
      netCoupons,
      couponsTotal: res.total
    });
    changeNetDataToLocalData(_this);
  });
}
//查询优惠券--end

//转换网络数据到本地数据显示---begain
function changeNetDataToLocalData(_this) {
  var coupons = [];
  _this.data.netCoupons.forEach(function (item, index) {
    var tmpCoupon = {};
    tmpCoupon.discount = item.mold.reduceFee /100;
    if (item.mold.leastFee != 0) {
      tmpCoupon.workCondition = '满' + item.mold.leastFee /100 + '元可用';
    } else {
      tmpCoupon.workCondition = '无门槛';
    }
    tmpCoupon.workInfo = item.mold.name;
    var endTime = item.endTime - Date.parse(new Date());
    endTime = parseInt(endTime / 1000 / 60 / 60 / 24);
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