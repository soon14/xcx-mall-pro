// pages/formEdit/formEdit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    key:'',
    value:'',
    max:'',
    label:'',
    type:'',
    disabled:false,
    placeholder:'请输入'
  },
  bindinput(e){
    this.setData({
      value:e.detail.value
    })
  },
  submit(){
    var data = [{
      key:this.data.key,
      value:this.data.value
    }]
    wx.setStorageSync('formEditData', data);
    wx.navigateBack()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var key = options.key //  *必传
    var label = options.label || '修改' 
    var value = options.value || ''
    var max = +options.max || 200
    var type = options.type || 'input'//input textarea
    var placeholder = options.placeholder || '请输入'//type = textarea 有效
    var disabled = options.disabled == 1 ? true : false
    console.log(options)
    console.log(value)
    this.setData({ key, value, max, label, type, placeholder, disabled })
    wx.setNavigationBarTitle({
      title: label
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
    wx.stopPullDownRefresh()
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