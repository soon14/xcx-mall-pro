var util = require('../../../utils/util.js');
var activityMgr = require('../../../services/activity.js');
var api = require('../../../config/api.js');
var qianbao = require('../../../config/qianbao.js');
var auth = require('../../../services/auth.js');
let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}

Page({
  data:{
    activityList: [],
    pageNum:1,
    pageSize:20,
    user:{},
    activeIndex:-1,
    noMoreData:false,
    isLoading:false,
    template:[],
  },
  addPage(){
    if (this.data.isLoading || this.data.noMoreData) return
    this.setData({
      pageNum:this.data.pageNum + 1
    })
    this.getActivityList()
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.getActivityList();
  },
  getActivityList(){
    this.setData({
      isLoading:true
    })
    activityMgr.getList({ 
      pageNum:this.data.pageNum,
      pageSize:this.data.pageSize,
      type:'RESERVATION'
    }).then(res=>{
      let temp = res.data;
      var noMoreData = res.data.length < this.data.pageSize
      this.setData({
        user:auth.getUserInfo().user,
        activityList: this.data.activityList.concat(temp),
        template:this.data.template.concat(temp),
        // isLoading:false,
        noMoreData
      });
      if (!noMoreData && this.data.template.length < this.data.pageSize) {
        this.setData({
          pageNum:this.data.pageNum + 1
        })
        this.getActivityList()
      } else {
        this.setData({
          template:[],
          isLoading:false
        })
      }
    });
  },
  routerGo(e){
    var activeIndex = e.currentTarget.dataset.index
    this.setData({
      activeIndex
    })
    wx.navigateTo({
      url:e.currentTarget.dataset.url
    })
  },
  closeActivity(event) {
    wx.showModal({
      title: '',
      content: '确定要取消该活动？',
      success: res=> {
        if (res.confirm) {
          let activityId = event.target.dataset.activityId;
          let index = event.target.dataset.index;
          activityMgr.update(activityId,{status:'CANCELED'}).then(res=> {
            if (res.code === 0) {
              wx.showToast({
                title: '已取消活动'
              });
              var activityList = this.data.activityList
              activityList[index].status = 'CANCELED'
              activityList[index].statusName = '取消'
              this.setData({
                activityList
              })
            }
          });
        }
      }
    })
    return false;
  },
  leaveActivity(event) {
    wx.showModal({
      title: '',
      content: '确定要离开该活动？',
      success: res=> {
        if (res.confirm) {
          let activityId = event.target.dataset.activityId;
          let index = event.target.dataset.index;
          activityMgr.leave(activityId).then( res=> {
            if (res.code === 0) {
              wx.showToast({
                title: '已离开活动'
              });
              var activityList = this.data.activityList
              activityList.splice(index,1)
              this.setData({
                activityList
              })
            }
          });
        }
      }
    })
    return false;
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var activeIndex = this.data.activeIndex
    if (activeIndex > -1) {
      var activityList = this.data.activityList
      var activity = activityList[activeIndex]
      var user = this.data.user
      // warnning activity
        activityMgr.getDetail(activity.id).then(res=>{
          if (res.code == 0) {
            activity = res.data
            if (activity.actors.some(actor=>actor.eid == user.id)) {
              activityList.splice(activeIndex,1,activity)
            } else {
              activityList.splice(activeIndex,1)
            }
            this.setData({ activityList })
          }
        })
        this.setData({activeIndex:-1})
      }
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})