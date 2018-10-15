var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var it120 = require('../../../config/it120.js');
var workspace = require('../../../config/workspace.js');
var qianbao = require('../../../config/qianbao.js');
var auth = require('../../../services/auth.js');
const card = require('../../../utils/card.js')

let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
var app = getApp();
const { MpAppID, SellerID } = extConfig
Page({
  data: {
    channelList: [],
    userInfo: {
      user: {
        nickName: 'Hi,游客',
        avatar: 'http://yanxuan.nosdn.127.net/8945ae63d940cc42406c3f67019c5cb6.png'
      }
    },
    phone:'',
    mainColor: '#333',
    isAuth:false,
  },

  contactUs(){
    app.getSellerInfo().then(sellerInfo=>{
      if (sellerInfo.contacts && sellerInfo.contacts[0] && sellerInfo.contacts[0].phone ) {
        wx.makePhoneCall({
          phoneNumber: sellerInfo.contacts[0].phone,
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '商家未预留联系方式',
          showCancel:false,
        })
      }
    })
  },

  getPhoneNumber: function (e) {
    const _this = this;
    if (e.detail.iv) {
      auth.bindTel(e.detail).then(info=> {
        var phone = info.phone;
        _this.setData({
          phone
        });
      });
    }
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数

    this.getChannels();

    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    this.setData({
      mainColor: extConfig.mainColor
    })
  },
  onReady: function () {

  },
  onShow: function () {
    let userInfo = auth.getUserInfo();
    if (userInfo && userInfo.wx) {
      this.setData({
        userInfo: userInfo,
        isAuth: true
      })
    }
    if (userInfo.phone) {
      this.setData({
        phone: userInfo.phone
      })
    }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  /*getChannels: function () {
    let that = this;
    that.setData({
      channelList: workspace.menus.channelUser
    });
  },*/

  getChannels: function () {
    return util.request(qianbao.Url_Configs + '?key=channelUser', ).then(res => {
      const def = workspace.menus.channelUser;
      if (res.code === 0 && res.data && res.data[0]) {
        var  channelList = JSON.parse(res.data[0].value).filter(item=>item.isSelect).sort((a,b)=> a.order - b.order).map(obj=>{
          def.some(o => {
            if (obj.id == o.id) {
              obj.picUrl = o.picUrl;
              return true;
            }
          });
          return obj;
        });
        this.setData({ channelList })
        console.log(this.data.channelList)
      } else {
        this.setData({ channelList: def })
      }
      // console.log(this.data.channelList)
    });
  },

  stayYuned(){
    wx.showModal({
      title: '提示',
      content: '更多功能敬请期待',
      showCancel:false,
    })
  },

  bindGetUserInfo(e){
    var _this = this;
    if (e.detail.userInfo){
      auth.authLogin().then(info=>{
        _this.setData({
          userInfo: info,
          isAuth: true
        });
      });
    }
  },

  reset: function () {
    wx.showModal({
      title: '',
      confirmColor: '#b4282d',
      content: '确定清除缓存？',
      success: function (res) {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({
            url: '/pages/index/index',
          });
        }
      }
    })
  },
  addCard: function (e) {
    const _this = this
    const cardId = this.data.cards[0].wx.cardId
    const cardCode = app.cardCode
    if (cardCode) {
      card.openCard(cardId, cardCode)
    } else {
      card.addCard(cardId)
    }
  },
  getCard() {
    card.getCard().then((res) => {
      this.setData({
        ...res,
        hasGetCardInfo: true,
      })
    })
  },
  qrPay() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        if (res.path) {
          var qrCodeId = res.path.split('qrCodeId=')[1]
          var path = "/pages/payInput/payInput?qrCodeId=" + qrCodeId;
          wx.navigateTo({
            url: path,
          });
        } else {
          wx.showToast({
            title: '扫码失败，二维码未知',
            icon: "none"
          })
        }
      },
      fail: (err) => {
        wx.showToast({
          title: "扫码失败",
          icon: "none"
        })
      }
    })
  }
})