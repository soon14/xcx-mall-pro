var util = require('../../utils/util.js');
var qianbao = require('../../config/qianbao.js');
var shopMgr = require('../../services/shop.js');

Page({
  data: {
    // text:"这是一个页面"
    navList: [],
    placeList: [],
    id: 0,
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    pageNum: 1,
    pageSize: 10,
    isLoading:true,
    noMoreData:false
  },
  bindscrolltolower2: function () {
    if (this.data.isLoading || this.data.noMoreData) return
    this.setData({
      pageNum:this.data.pageNum+1
    })
    this.getPlaceList()
  },
  imagePreview(e){
    var current = e.currentTarget.dataset.src
    var urls = e.currentTarget.dataset.images.map(item=>item.media[0].url)
    wx.previewImage({
      current, // 当前显示图片的http链接
      urls // 需要预览的图片http链接列表
    })
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if (options.id) {
      that.setData({
        id: parseInt(options.id)
      });
    }

    /*wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });*/


    this.getCategoryInfo();

  },
  getCategoryInfo: function () {
    let that = this;
    shopMgr.getList({ 
      pageNum: that.data.pageNum, 
      pageSize: that.data.pageSize 
    }).then(function (res) {

      that.setData({
        navList: res.data,
        currentCategory: res.data[0]
      });

      if (that.data.id==0) {
        that.setData({
          id: res.data[0].id
        });
        
      }
      
      //nav位置
      let currentIndex = 0;
      let navListCount = that.data.navList.length;
      /*for (let i = 0; i < navListCount; i++) {
        currentIndex += 1;
        if (that.data.navList[i].id == that.data.id) {
          that.setData({
            currentCategory : that.data.navList[i]
          });
          
          break;
        }
      }*/
      that.data.navList.some((navItem,currentIndex)=>{
        if (navItem.id == that.data.id){
          that.setData({
            currentCategory : navItem
          });
          if (currentIndex > navListCount / 2 && navListCount > 5) {
            that.setData({
              scrollLeft: currentIndex * 60
            });
          }
          return true
        }
      })

      that.getPlaceList();
        
    });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    console.log(1);
  },
  onHide: function () {
    // 页面隐藏
  },
  getPlaceList: function () {
    var that = this;
    this.setData({
      isLoading:true
    })
    util.request(qianbao.Url_Places, { shopId: that.data.id, pageNum: that.data.pageNum, pageSize: that.data.pageSize})
      .then(res=> {
        that.setData({
          placeList: this.data.placeList.concat(res.data),
          isLoading:false,
          noMoreData: res.data.length < that.data.pageSize
        });
      });
  },
  onUnload: function () {
    // 页面关闭
  },
  switchCate: function (event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }
    this.setData({
      pageNum:1,
      noMoreData:false,
      placeList:[]
    })
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    this.setData({
      id: event.currentTarget.dataset.id
    });

    this.getPlaceList();
  }
})