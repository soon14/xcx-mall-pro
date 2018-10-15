
const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
const { MpAppID, SellerID } = extConfig
Page({
  data: {
    mainColor: extConfig.mainColor,
    currentPrewiewGoods:{}
  },
  onLoad: function(options) {
    console.log(JSON.parse(options.currentPrewiewGoods))
    this.setData({
      currentPrewiewGoods:JSON.parse(options.currentPrewiewGoods)
    })
  },
  gocatelog() {
    
    let url = '/pages/orderMenu/orderMenu';
    if (this.data.currentPrewiewGoods.productsort == '外卖') {
      url = '/pages/takeaway/shopOrder_ta/shopOrder_ta';
    }else if (this.data.currentPrewiewGoods.productsort == '商城') {
      url = '/pages/takeaway/giftShop/giftShop';
    }
    wx.switchTab({
      url
    })
  },
  onReady: function() {
    // 生命周期函数--监听页面初次渲染完成

  },


  onShow: function() {
  
  },
  onHide: function() {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function() {
    // 生命周期函数--监听页面卸载

  },

 


  show() {
    
  },
  hide() {
   
  },


 
  })
