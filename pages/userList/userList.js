var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var it120 = require('../../config/it120.js');
var qianbao = require('../../config/qianbao.js');
var activityMgr = require('../../services/activity.js');
let extConfig = wx.getExtConfigSync? wx.getExtConfigSync(): {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activity:{
      actors:[]
    },
  },
  imagePreview(e){
    var current = e.currentTarget.dataset.src
    var urls = e.currentTarget.dataset.images.map(item=>item.avatar)
    wx.previewImage({
      current, // 当前显示图片的http链接
      urls // 需要预览的图片http链接列表
    })
  },
  getActivity(id){
    // warnning activity
    return activityMgr.getDetail(id).then(res=>{
      if (res.code == 0) {
        this.setData({
          activity:res.data,
        })
        wx.setNavigationBarTitle({
          title: `成员列表(${this.data.activity.actors.length})`
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
        activityId:options.id
    })
    this.getActivity(options.id)
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
    this.getActivity(this.data.activity.id).then(res=>{
      wx.stopPullDownRefresh()
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
  
  }
})