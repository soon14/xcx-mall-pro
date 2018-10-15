var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var qianbao = require('../../config/qianbao.js');
var format = require('../../utils/format.js');

let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
var app = getApp()
Page({
    data: {
        topicList: [],
        scrollTop: 0,
        pageNum:1,
        pageSize:5,
        isLoading:false,
        noMoreData:false,
        noData:false
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.getTopic();
    },

    onPullDownRefresh:function(){
      if (this.data.isLoading) return
      this.setData({
        pageNum:1,
        noMoreData:false,
        noData:false,
      })
      this.getTopic(()=>{
        this.setData({
          topicList:[]
        })
      }).then(()=>{wx.stopPullDownRefresh()})
    },
    onShareAppMessage: function () {

      },
    onReachBottom(){
        if (this.data.isLoading || this.data.noMoreData) return
        this.setData({
            pageNum:this.data.pageNum + 1
        })
        this.getTopic()
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
    
    getTopic: function(ongetdata){
      this.setData({
        isLoading:true
      })
      let that = this;
      return util.request(qianbao.Url_Contents,{
        type:'ARTICLE',
        pageSize:this.data.pageSize,
        pageNum:this.data.pageNum
      }).then(res=>{
          // wx.hideToast();
          console.log(res)
        if (res.code == 0) {
          ongetdata && ongetdata()
          var topicList = this.data.topicList.concat(res.data.map(item=>{
            item.formatCreatedTime = format.pastTime(item.createdTime);
            return item
          }))
          this.setData({
            topicList,
            noMoreData: res.data.length < that.data.pageSize,
            isLoading:false,
            noData: topicList.length == 0
          })
        }
      })
    },
    
})