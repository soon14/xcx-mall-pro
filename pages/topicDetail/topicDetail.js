var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var it120 = require('../../config/it120.js');
var qianbao = require('../../config/qianbao.js');
let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}

Page({
  data: {
    id: 0,
    topic: {},
    topicList: [],
    commentCount: 0,
    commentList: []
  },
  onShareAppMessage: function () {
      },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      id: options.id
    });
    util.request(qianbao.Url_Contents + '/' + this.data.id,{
      // type:'ARTICLE'
    }).then(res=>{
       if (res.code == 0) {
          var topic = res.data
          topic.formatTime = util.formatTime(new Date(topic.createdTime))
          that.setData({
            topic,
            isLoading:false
          });

          wx.setNavigationBarTitle({
            title: topic.title
          })

          WxParse.wxParse('topicDetail', 'html', res.data.body, that);
       }
    })
    /*util.request(it120.GET_CMS_NEWS_DETAIL, { id: that.data.id}).then(function (res) {
      if (res.code === 0) {

        that.setData({
          topic: res.data,
        });

        wx.setNavigationBarTitle({
          title: res.data.title
        })

        WxParse.wxParse('topicDetail', 'html', res.data.content, that);
      }
    });*/

    util.request(qianbao.Url_Contents,{
        type:'ARTICLE',
        pageSize:20,
        pageNum:1
      }).then(res=>{
          // wx.hideToast();
        if (res.code == 0) {
          var topicList = this.data.topicList.concat(res.data.map(item=>{
            item.formatCreatedTime = util.formatTime(new Date(item.createdTime))
            return item
          }))
          this.setData({
            topicList,
          })
        }
      })
    /*util.request(it120.GET_CMS_NEWS_LIST + '?categoryId=' + extConfig.topicCategory).then(function (res) {
      if (res.code === 0) {

        that.setData({
          topicList: res.data
        });
      }
    });*/
  },
  onReady: function () {

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