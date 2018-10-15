
const qianbao = require('../../config/qianbao.js')
const util = require('../../utils/util.js');
const format = require('../../utils/format.js');
const shopMgr = require('../../services/shop.js');

const app = getApp();

// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude:'',
    longitude:'',
    shops:[],

    hasAddress:true,
    isLoading:false,
    pageNum:1,
    pageSize:10,
    noMoreData:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var latitude = options.latitude || app.globalData.location.latitude
    var longitude = options.longitude || app.globalData.location.longitude
    var hasAddress = !!latitude && !!longitude
    if (!hasAddress) {
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          var latitude = res.latitude
          var longitude = res.longitude
          var speed = res.speed
          var accuracy = res.accuracy
          app.globalData.location.latitude = latitude
          app.globalData.location.longitude = longitude
          that.getShopbyLocation(latitude,longitude)
          that.setData({
            latitude,
            longitude,
            hasAddress:true
          })
        },
        fail:function(err){
          that.setData({
            longitude:'',
            latitude:'',
            hasAddress:false
          })
          that.getShopbyLocation('','')
        }
      })
    } else {
      this.setData({
        longitude,
        latitude,
        hasAddress
      })
      this.getShopbyLocation(latitude,longitude)
    }
  },
  init(){

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
  addPage(){
    if (this.data.isLoading || this.data.noMoreData) return
    this.setData({
      pageNum:this.data.pageNum + 1
    })
    this.getShopbyLocation(this.data.latitude,this.data.longitude)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this
    this.setData({
      shops:[]
    })
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        app.globalData.location.latitude = latitude
        app.globalData.location.longitude = longitude
        that.getShopbyLocation(latitude,longitude).then(()=>{
          wx.stopPullDownRefresh()
        })
        that.setData({
          latitude,
          longitude,
          hasAddress:true
        })
      },
      fail:function(err){
        that.setData({
          longitude:'',
          latitude:'',
          hasAddress:false
        })
        that.getShopbyLocation('','').then(()=>{
          wx.stopPullDownRefresh()
        })
      }
    })
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

  getAddress(){
    let that = this;
    wx.openSetting({
      success:function(data){
        if (data.authSetting['scope.userLocation']) {
          wx.getLocation({
            type: 'wgs84',
            success: function (res) {
              var latitude = res.latitude
              var longitude = res.longitude
              var speed = res.speed
              var accuracy = res.accuracy
              app.globalData.location.latitude = latitude
              app.globalData.location.longitude = longitude
              that.setData({
                latitude,
                longitude,
                hasAddress:true,
                shops:[],
                pageNum:1
              })
              that.getShopbyLocation(latitude,longitude)
            },
            fail:function(err){
            }
          })
        }
      }
    })
  },
  getShopbyLocation(latitude,longitude){
    this.setData({
      isLoading:true
    })
    let that = this;
    // 获得shop列表
    return shopMgr.getList({ 
      pageNum: this.data.pageNum, 
      pageSize: this.data.pageSize, 
      latitude, 
      longitude 
    }).then(function (res) {
      var temp = res.data.map(item=>{
        console.log(res)
        if (item.distance) {
          item.showDistance = `${item.distance.value} ${item.distance.unit}`;
        }
        return item
      })
      var shops = that.data.shops.concat(temp)
      var noMoreData = temp.length < that.data.pageSize
      that.setData({
        shops,
        isLoading:false,
        noMoreData
      })
    })
  },
})