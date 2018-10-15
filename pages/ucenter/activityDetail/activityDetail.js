var util = require('../../../utils/util.js');
var activityMgr = require('../../../services/activity.js');
var api = require('../../../config/api.js');
var WxParse = require('../../../lib/wxParse/wxParse.js');
var qianbao = require('../../../config/qianbao.js');
var auth = require('../../../services/auth.js');

Page({
  data: {
    activityId: 0,
    activityInfo: {},
    isOwner:false,
    isActor:false,
    place:{},
    activityGoods: [],
    handleOption: {},
    noCollectImage: "/static/images/icon_collect.png",
    hasCollectImage: "/static/images/icon_collect_checked.png",
    collectBackImage: "/static/images/icon_collect.png"
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      activityId: options.id
    });
  },
  openHomePage: function () {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  goUsers(){
    wx.navigateTo({
      url: '/pages/userList/userList?id=' + this.data.activityInfo.id,
    });
  },
  getActivityDetail() {
    let that = this;
    // warnning activity
    return activityMgr.getDetail(that.data.activityId).then(function (res) {
      let me = auth.getUserInfo().user;
      if (res.code === 0) {
        var activityInfo = res.data
        activityInfo.formatCreatedTime = util.formatTime(new Date(activityInfo.createdTime))
        that.setData({
          activityInfo
        });
       
       if (res.data.owner.eid == me.id) {
         that.setData({
           isOwner: true
         });
       }

       for (var index = 0; index < res.data.actors.length; index++) {
         if (res.data.actors[index].eid == me.id) {
           that.setData({
             isActor: true
           });
           break;
         }
       }


        that.getPlaceDetail();
        //that.payTimer();
      }
    });
  },
  getPlaceDetail() {
    let that = this;
    console.info(that.data.activityInfo);
    util.request(qianbao.Url_Places + '/' + that.data.activityInfo.place.eid).then(function (res) {
      if (res.code === 0) {
        console.log(res.data);
        that.setData({
          place: res.data
        });
        //that.payTimer();
      }
    });
  },
  payTimer() {
    let that = this;
    let activityInfo = that.data.activityInfo;

    setInterval(() => {
      console.log(activityInfo);
      activityInfo.add_time -= 1;
      that.setData({
        activityInfo: activityInfo,
      });
    }, 1000);
  },
  payOrder() {
    let that = this;
    util.request(api.PayPrepayId, {
      activityId: that.data.activityId || 15
    }).then(function (res) {
      if (res.errno === 0) {
        const payParam = res.data;
        wx.requestPayment({
          'timeStamp': payParam.timeStamp,
          'nonceStr': payParam.nonceStr,
          'package': payParam.package,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function (res) {
            console.log(res)
          },
          'fail': function (res) {
            console.log(res)
          }
        });
      }
    });

  },
  joinActivity() {
    let that = this;
    let me = auth.getUserInfo().user;
    activityMgr.join(that.data.activityId).then(function (res) {
      if (res.code === 0) {
        that.setData({
          activityInfo: res.data
        });

        wx.showToast({
          title: '加入成功'
        });

        if (res.data.owner.eid == me.id) {
          that.setData({
            isOwner: true
          });
        }

        for (var index = 0; index < res.data.actors.length; index++) {
          if (res.data.actors[index].eid == me.id) {
            that.setData({
              isActor: true
            });
            break;
          }
        }


      }
    });

  },
  leaveActivity() {
    let that = this;
    activityMgr.leave(that.data.activityId).then(function (res) {
      if (res.code === 0) {
        that.setData({
          activityInfo: res.data
        });
        wx.showToast({
          title: '已离开活动'
        });
        that.setData({
          isActor: false
        });
      }
    });
  },
  closeActivity() {
    let that = this;
    activityMgr.update(that.data.activityId,{status:'CANCELED'}).then(function (res) {
      if (res.code === 0) {
        that.setData({
          activityInfo: res.data
        });
        wx.showToast({
          title: '已取消活动'
        });

        if (res.data.owner.eid == me.id) {
          that.setData({
            isOwner: true
          });
        }

        for (var index = 0; index < res.data.actors.length; index++) {
          if (res.data.actors[index].eid == me.id) {
            that.setData({
              isActor: true
            });
            break;
          }
        }

      }
    });

  },
  setting(){
    wx.navigateTo({
      url: '/pages/ucenter/activitySetting/activitySetting?id=' + this.data.activityInfo.id
    });
  },
  onShareAppMessage: function () {
    return {
      title: "邀请您参加" + this.data.activityInfo.title ,
      desc: "邀请您参加" + this.data.activityInfo.title,
      path: '/pages/ucenter/activityDetail/activityDetail?id=' + this.data.activityInfo.id
    }
  },
  
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.getActivityDetail();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onPullDownRefresh: function () {
    this.getActivityDetail().then(res=>{
      wx.stopPullDownRefresh()
    }).catch(()=>{
      wx.stopPullDownRefresh()
    })
  },
})