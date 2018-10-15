//var push = require('./utils/pushsdk.js');
var util = require('./utils/util.js');
var api = require('./config/api.js');
var qianbao = require('./config/qianbao.js');
var aldstat = require('/lib/ald/ald-stat.js');
var ald = require('/lib/ald/san.js');
var mta = require('./utils/mta.js');
var auth = require('./services/auth.js');
var home = require('./services/home.js');
var cache = require('./utils/cache.js');

App({

  onLaunch: function (opt) {

    this.checkVersion();
    cache.init();
    auth.init();
    mta.initAPP(opt);
    
  },

  onShow(res){
    home.handleShowScene(res.scene);
  },

  onHide(){

  },

  checkVersion(){
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(function () {
      updateManager.applyUpdate();
    });
  },

  getBrandName(){
    return new Promise((resolve,reject)=>{
      var brandName
      if (brandName = this.globalData.brandName) {
        resolve(brandName)
      } else if (brandName = wx.getStorageSync('brandName')) {
        resolve(brandName)
      } else {
        util.request(qianbao.Url_Sellers).then(res=>{
          if (res.code == 0) {
            wx.setStorageSync('sellerInfo', res.data);
            this.globalData.sellerInfo = res.data;
            try {
              if (res.data.wx.miniApps[0].nickName) {
                wx.setStorageSync('brandName', res.data.wx.miniApps[0].nickName);
                this.globalData.brandName = res.data.wx.miniApps[0].nickName;
                resolve(res.data.wx.miniApps[0].nickName)
              } else {
                throw new Error()
              }
            } catch (e) {
              wx.setStorageSync('brandName', res.data.name);
              this.globalData.brandName = res.data.name;
              resolve(res.data.name)
            }
          } else {
            reject(res)
          }
        }).catch(err=>{reject(err)})
      }
    })
  },

  getSellerInfo(){
    return new Promise((resolve,reject)=>{
      var sellerInfo
      if (sellerInfo = this.globalData.sellerInfo) {
        resolve(sellerInfo)
      } else if (sellerInfo = wx.getStorageSync('sellerInfo')) {
        resolve(sellerInfo)
      } else {
        util.request(qianbao.Url_Sellers).then(res=>{
          if (res.code == 0) {
            wx.setStorageSync('sellerInfo', res.data);

            this.globalData.sellerInfo = res.data;
            try {
              wx.setStorageSync('brandName', res.data.wx.miniApps[0].nickName);
              this.globalData.brandName = res.data.wx.miniApps[0].nickName;
            } catch (e) {
              wx.setStorageSync('brandName', res.data.name);
              this.globalData.brandName = res.data.name;
            }
            resolve(res.data)
          } else {
            reject(res)
          }
        }).catch(err=>{reject(err)})
      }
    })
  },

  globalData: {
    location:{
      latitude:'',
      longitude:'',
    },
    subDomain: "zshp", // 如果你的域名是： https://api.it120.cc/abcd 那么这里只要填写 abcd
    version: "1.0.SNAPSHOT",
    sellerInfo: null,
    token: '',
  },
  card:[],
  cartGoodsCount:0

})