var util = require('../../../utils/util.js');
var qianbao = require('../../../config/qianbao.js');
var activityMgr = require('../../../services/activity.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityId:'',
    activity:{}
  },
  getActivity(){
    return  activityMgr.getDetail(this.data.activityId).then(res=>{
      if (res.code == 0) {
        this.setData({
          activity:res.data
        })
      } else {
        throw new Error('获取活动失败')
      }
    })
  },
  openActivity() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否重新激活当前预约活动？',
      success: function(res) {
        if (res.confirm) {
          activityMgr.update(that.data.activityId,{status:'CREATED'}).then(function (res) {
            if (res.code === 0) {
              that.setData({
                activity: res.data
              });
              wx.showToast({
                title: '活动已重新激活'
              });
              wx.navigateBack()
            }
          });
        } else if (res.cancel) {}
      }
    })
  },
  closeActivity() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否关闭当前预约活动？',
      success: function(res) {
        if (res.confirm) {
          activityMgr.update(that.data.activityId,{status:'CANCELED'}).then(function (res) {
            if (res.code === 0) {
              that.setData({
                activity: res.data
              });
              wx.showToast({
                title: '已取消活动'
              });
              wx.navigateBack()
            } else {
              throw new Error('取消失败')
            }
          });
        } else if (res.cancel) {}
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var activityId = options.id
    this.setData({ activityId })
    this.getActivity()
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
    var formEditData = wx.getStorageSync('formEditData')
    if (formEditData) {
      formEditData.forEach(item=>{
        if (item.key === 'title') {
          // 修改activity的名称
          this.updataActivity({
            title:item.value
          })
        }
        if(item.key === 'description') {
          // 修改activity的说明
          this.updataActivity({
            description:item.value
          })
        }
      })
    }
    wx.removeStorageSync('formEditData')
  },
  updataActivity(o){
    return activityMgr.update(this.data.activityId, o).then(res=>{
      if( res.code == 0) {
        this.setData({
          activity:res.data
        })
        wx.showToast({
          title: err.message || '更新成功'
        });
      } else {
        throw new Error('更新失败')
      }
    })
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
    this.getActivity().then(()=>{
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