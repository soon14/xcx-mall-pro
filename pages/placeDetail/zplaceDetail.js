var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var qianbao = require('../../config/qianbao.js');
var it120 = require('../../config/it120.js');
let extConfig = wx.getExtConfigSync? wx.getExtConfigSync(): {}

var rangeStart = 9 //预约开始时间
var rangeEnd = 20 //预约结束时间
var range = 2 //预约时长
var beforeDay = 7 //可提前时长 7天

var tody = new Date()
/*最多提前7天预约*/
var endDay = new Date(+tody + beforeDay * 24 * 3600 * 1000)

var startTime, endTime
if (tody.getHours() >= rangeStart && tody.getHours() < rangeEnd) {
    // 默认值为下一个小时
    startTime = (tody.getHours() + 1) + ':00'
    endTime = (tody.getHours() + 1 + range) + ':00'
} else {
    startTime = rangeStart + ":00"
    endTime = rangeStart + range + ":00"
} 
if (tody.getHours() >= rangeEnd) {
  // 延后一天
  tody = new Date(+tody + 1 * 24 * 3600 * 1000)
  endDay = new Date(+tody + beforeDay * 24 * 3600 * 1000)
}

var nowDate = tody.getFullYear() + '-' + ('0' + (tody.getMonth() + 1)).slice(-2) + '-' + ('0' + tody.getDate()).slice(-2)
var endDate = endDay.getFullYear() + '-' + ('0' + (endDay.getMonth() + 1)).slice(-2) + '-' + ('0' + endDay.getDate()).slice(-2)

var validator = {
    name (val){
      return /^.{1,10}$/.test(val)
    },
    phone (val){
      return /^1\d{10}$/.test(val)
    },
    peopleNum (val){
      return /^\d*$/.test(val) && val <= this.data.place.userLimit
    },
}

Page({
  data: {
    id: 0,
    shop:{},
    place: {
        // "id": "5ab0be1acb9a193cedf98061",
        // "seller": {
        //     "id": "5a951cc0cb9a19673498ca21",
        //     "name": "小程序"
        // },
        // "shop": {
        //     "id": "5aad05e5cb9a19021c3ec4d3",
        //     "name": "京料理",
        //     "branchName": "南翔店",
        //     "order": 0
        // },
        // "name": "一楼卡座",
        // "sn": "100",
        // "description": "描述描述描述描述描述描述描述",
        // "type": "DESK",
        // "userLimit": 10,
        // "status": "IDLE",
        // "medias": [{
        //     "type": "IMAGE",
        //     "url": "https://cdn.it120.cc/apifactory/2018/03/14/04b9f324d6166da50d032a930cddd7d5.jpg",
        //     "layout": "COVER",
        //     "title": "title",
        //     "text": "text",
        //     "order": 0
        // }],
        // "metadata": [{
        //     "name": "string",
        //     "value": "string",
        //     "type": "Array"
        // }],
        // "createdBy": "admin",
        // "modifiedBy": "admin",
        // "createdTime": 1521532442432,
        // "modifiedTime": 1521532442432
    },
    userHasCollect: 0,
    noCollectImage: "/static/images/icon_collect.png",
    hasCollectImage: "/static/images/icon_collect_checked.png",
    collectBackImage: "/static/images/icon_collect.png",
    scale:'14',

    markers: [],
    controls: [{
      id: 1,
      iconPath: '../../static/images/address.png',
      position: {
        left: 270,
        top: 30,
        width: 50,
        height: 50
      },
      clickable: true
    }],

    mainColor:extConfig.mainColor,
    openAttr:false,

    /*openAttr == true*/
    nowDate,
    endDate,
    // date: nowDate,
    date: '',
    formatDate:'',
    dataIsNull:true,
    name: "",
    /*startTime: startTime,
    endTime: endTime,*/
    startTime: '',
    endTime: '',

    startTimeIsNull:true,

    phone:'',
    verification:'',

    peopleNum: '',

    message:'',

    isAgree: false,
    validate:{
        name:true,
        phone:true,
        peopleNum:true,
    },
    required:{
      name:true,
      date:true,
      startTime:true,
      endTime:true,
      phone:true,
      verification:false,
      message:true
    },
    canSubmit:false
  },
  getPhoneNumber(e) { 
    // 获得加密数据信息
      console.log(e.detail.errMsg)
      console.log(e.detail.iv) 
      console.log(e.detail.encryptedData) 
  },
  submit(){

  },
  makePhoneCall(){
    wx.makePhoneCall({
      phoneNumber:'18221745014'
    })
  },
  controltap(e) {
    this.goMap()
  },
/*============== bind from change ==============*/
  changeValue(e){
    var o = {}
    var validate = this.data.validate
    o[e.target.dataset.name] = e.detail.value
    validate[e.target.dataset.name] = true
    o['validate']=validate
    this.setData(o)
  },
  validValue(e){
    var valid = true
    var validate = this.data.validate
    validate[e.target.dataset.name] = valid = validator[e.target.dataset.name].call(this,e.detail.value)
    if (!valid) {
      this.toast(e)
    }
    this.setData({
      validate
    })
  },
  bindDateChange(e) {
      this.setData({
          date: e.detail.value,
          formatDate: e.detail.value.split('-')[0] + '年' + e.detail.value.split('-')[1] + '月' + e.detail.value.split('-')[2] + '日',
          dataIsNull:false
      })
  },
  bindTimeChange(e) {
      var startTime = e.detail.value
      var endTime = ('0' + (+e.detail.value.split(':')[0] + range)).slice(-2) + ':' + e.detail.value.split(':')[1]
      this.setData({
          startTime,
          endTime,
          startTimeIsNull:false
      })
  },
/*=========== bind from change end ============*/
  toast(e){
    wx.showToast({
      icon:'none',
      title: e.target.dataset.toast,
      mask: true
    });
  },
  onShareAppMessage: function () {
    return {
      title: this.data.place.name,
      desc: this.data.shop.name + '-预约餐厅-' + this.data.shop.branchName,
      path: '/pages/placeDetail/placeDetail?id='+this.data.id + '&shopJson=' + JSON.stringify(this.data.shop)
    }
  },
  getPlaceInfo() {
    let that = this;
    util.request(qianbao.Url_Places + '/' + that.data.id).then(function (res) {
      if (res.code === 0) {
        res.data.gallery = res.data.media.map(item=>item.url)
        // res.data.tips = res.data.metadata.filter(item=>item.name == 'tips')[0] ? JSON.parse(res.data.metadata.filter(item=>item.name == 'tips')[0].value) : []
        that.setData({
          place: res.data,
          // userHasCollect: res.data.userHasCollect
        });

        if (res.data.userHasCollect == 1) {
          that.setData({
            'collectBackImage': that.data.hasCollectImage
          });
        } else {
          that.setData({
            'collectBackImage': that.data.noCollectImage
          });
        }
        WxParse.wxParse('goodsDetail', 'html', res.data.description, that);
      }
    });

  },
  goMap(){
    var latitude, longitude, scale, name, address
    latitude = this.data.shop.location.latitude
    longitude = this.data.shop.location.longitude
    address = this.data.shop.location.address
    scale = this.data.scale
    name = this.data.shop.name + '-' + this.data.shop.branchName
    wx.openLocation({
      latitude,
      longitude,
      scale,
      address,
      name
    })
  },
  previewImage(e){
    wx.previewImage({
      current:e.target.dataset.src,
      urls:e.target.dataset.list
    })
  },
  onLoad: function (options) {
    var shop = JSON.parse(options.shopJson)
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      id: options.id,
      shop,
      markers: [{
        iconPath: "../../static/images/location.png",
        id: 0,
        latitude: shop.location.latitude,
        longitude: shop.location.longitude,
        width: 80,
        height: 50,
        callout:{
          content:shop.name + '-' + shop.branchName,
          display:'ALWAYS',
          color:"#ffffff",
          bgColor:extConfig.mainColor,
          borderRadius:5
        }
      }]
    });
    this.getPlaceInfo();
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

  },
  closeAttrOrCollect: function () {
    let that = this;
    if (this.data.openAttr) {
      this.setData({
        openAttr: false,
      });
      if (that.data.userHasCollect == 1) {
        that.setData({
          'collectBackImage': that.data.hasCollectImage
        });
      } else {
        that.setData({
          'collectBackImage': that.data.noCollectImage
        });
      }
    } else {
      //添加或是取消收藏
      util.request(api.CollectAddOrDelete, { typeId: 0, valueId: this.data.id }, "POST")
        .then(function (res) {
          let _res = res;
          if (_res.errno == 0) {
            if ( _res.data.type == 'add') {
              that.setData({
                'collectBackImage': that.data.hasCollectImage
              });
            } else {
              that.setData({
                'collectBackImage': that.data.noCollectImage
              });
            }

          } else {
            wx.showToast({
              image: '/static/images/icon_error.png',
              title: _res.errmsg,
              mask: true
            });
          }

        });
    }

  },
  opencatalogPage: function () {
    wx.switchTab({
      url: '/pages/orderMenu/orderMenu',
    });
  },
  addToCart: function () {
    var that = this;
    if (this.data.openAttr == false) {
      //打开预约表单窗口
      this.setData({
        openAttr: true,
        collectBackImage: "/static/images/detail_back.png"
      });
    } else {
      if (!Object.keys(this.data.validate).every(key=>this.data.validate[key])) return
      if (!Object.keys(this.data.required).every(key=>!this.data.required[key] || this.data[key])) return
      var options = {
        "endTime": this.data.date + ' ' +  this.data.startTime + ':00',
        "mobile": this.data.phone,
        "msgToFriend": "给朋友的话",
        "msgToSeller": this.data.message,
        "num": this.data.peopleNum,
        "sponsor": this.data.name,
        "startTime": this.data.date + ' ' +  this.data.endTime + ':00',
        "placeId":this.data.id,
        "shopId":this.data.shop.id
      }
      util.request(qianbao.Url_reservation + '?trace=true',options,'POST' ).then(function (res) {
        wx.showToast({
          title: '预约成功',
          mask: true
        });
        setTimeout(()=>{
          wx.redirectTo({
            url:'/pages/appointment/appointment',
          })
        },1000)
      })
    }

  },
})