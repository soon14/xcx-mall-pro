var util = require('../../utils/util.js');
var qianbao = require('../../config/qianbao.js');
var shopMgr = require('../../services/shop.js');
let extConfig = wx.getExtConfigSync? wx.getExtConfigSync(): {}

var app = getApp();

Page({
  data: {
    id: 0,
    shop: {
      media:[{url:'../../static/images/onerror.png'}]
    },
    goodsList: [],
    page: 1,
    markers: [{
      id: 0,
      latitude: 0,
      longitude: 0,
      width: 20,
      height: 20
    }],
    scale:'14',
    controls: [{
      id: 1,
      iconPath: '../../static/images/address.png',
      position: {
        left: 290,
        top: 30,
        width: 60,
        height: 60
      },
      clickable: true
    }],
    size: 1000,
		showName:''
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      id: options.id
    });
    this.getBrand();
  },
  // controltap(e) {
  //   this.goMap()
  // },
  // goMap(){
  //   var latitude, longitude, scale, name, address
  //   latitude = +this.data.shop.location.latitude
  //   longitude = +this.data.shop.location.longitude
  //   address = this.data.shop.location.address
  //   scale = this.data.scale
		// name = this.data.showName
  //   wx.openLocation({
  //     latitude,
  //     longitude,
  //     scale,
  //     address,
  //     name
  //   })
  // },
  getBrand: function () {
    let that = this;
    shopMgr.getDetail(that.data.id).then(function (res) {
      if (res.code === 0) {
        var shop = res.data;
				var showName = shop.name;
				if (shop.branchName) {
					showName = showName + '（' + shop.branchName + '）';
				}
        wx.setNavigationBarTitle({
					title: showName
        })
        that.setData({
          shop,
					showName,
          markers: [{
            iconPath: "../../static/images/location.png",
            id: 0,
            longitude: +res.data.location.longitude,
            latitude: +res.data.location.latitude,
            width: 80,
            height: 50,
            callout:{
              padding:5,
							content: showName,
              display:'ALWAYS',
              color:"#ffffff",
              bgColor:extConfig.mainColor,
              borderRadius:5
            }
          }]
        });
      }
    });
  },
  bindtapMap(e) {
    let self = this;
    wx.openLocation({
      latitude: parseFloat(self.data.shop.location.latitude) ,
      longitude: parseFloat(self.data.shop.location.longitude),
			name: self.data.showName,
      address: self.data.shop.address,
      scale: 28
    });
  },  
  phoneClick: function (e) {
    wx.makePhoneCall({
      phoneNumber: this.data.shop.phone,
    })
  },

  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  }
})