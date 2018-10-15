var qianbao = require('../../../config/qianbao.js');
var util = require('../../../utils/util.js');
const { MpAppID, SellerID } = wx.getExtConfigSync()
// pages/ucenter/card/card.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageNum:1,
    cards:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCards()
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
    console.log('onReachBottom')
    this.getCards()
  },
  addCard: function () {
  },
  openCard: function () {
    wx.openCard({
      cardList: [
        {
          cardId: 'pyWyj1fsocKRWqgkAyN0dmQ9BBZ0',
          code: '551232650673'
        },
      ],
      success: function (res) {
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getCards:function(){
    console.log(222)
    const _this = this
    util.request(qianbao.Url_Cards, {
      pageNum:this.data.pageNum,
      pageSize:20
    }).then(function (res) {
      if (res.code == '00000000') {
        _this.data.pageNum++
        const cards = _this.data.cards.concat(res.data)
        _this.setData({cards})
      }
    });
  }
})