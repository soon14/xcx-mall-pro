const util = require('../../utils/util.js');
const workspace = require('../../config/workspace.js');
const qianbao = require('../../config/qianbao.js');
const card = require('../../utils/card.js')
const couponRequest = require('../../services/coupons.js');
const auth = require('../../services/auth.js');
const home = require('../../services/home.js');
const shopMgr = require('../../services/shop.js');
const mta = require('../../utils/mta.js');
const app = getApp()
const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
const { MpAppID, SellerID } = extConfig

Page({
  data: {
    brandName: '',
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    shops: [{
      media: [{ url: '../../static/images/onerror.png' }],
      mock: true
    }, {
      media: [{ url: '../../static/images/onerror.png' }],
      mock: true
    }],
    banner: [{ body: "../../static/images/onerror.png", mock: true }],
    channel: [],
    cards: [],
    userCard: false,
    isPreviewing: false,
    mainColor: extConfig.mainColor,
    hasGetCardInfo: false,
    configs: workspace.menus.homeConfig,

    //coupon
    coupons: [],
    haveGetCoupon:false,
    newUserActivityId:"",
    netCoupons:[],
    netNewUserActivity:[],
    netConsumeActivity: [],
    shareComingType:"",//通过什么渠道分享进入的
    orderId:0,
    activityId:"",
    shouldShow:true,
    isNewUserCoupon:true,
    isAllCouponsDisable:false,
  },
  imagePreview(e) {
    var current = e.currentTarget.dataset.src
    var urls = e.currentTarget.dataset.images.map(item => item.media[0].url)
    wx.previewImage({
      current, // 当前显示图片的http链接
      urls // 需要预览的图片http链接列表
    })
  },

  hidePreview() { },

  onShareAppMessage: function (res) {
    console.log(res)
    console.log(res[0].from);
    console.log(res[0].target);
    console.log(res[0].target.dataset.shareid);
    const { netConsumeActivity, netNewUserActivity} = this.data;
    var path ='';
    var title ='';
    var imageUrl='';
    if(this.data.activityId){
      path = '/pages/index/index?shareComingType=coupon&orderId=' + this.data.orderId + "&activityId=" + this.data.activityId;
      title = netConsumeActivity[0].metadata.shareTopic;
      imageUrl = netConsumeActivity[0].metadata.shareLogo;
    }else{
      path = '/pages/index/index?shareComingType=coupon';
      title = netNewUserActivity[0].metadata.shareTopic;
      imageUrl = netNewUserActivity[0].metadata.shareLogo;
    }
    if(res[0].from =='button' && res[0].target && res[0].target.dataset.shareid=='shareCoupon'){
      const { netNewUserActivity} = this.data;
        return{
          title: title,
          path: path,
          imageUrl: imageUrl,
        }
    }
  },

  getBannerData: function () {
    return util.request(qianbao.Url_Contents + '?type=BANNER').then(res => {
      if (res.code === 0) {
        if (res.data.length > 0) {
          var banner = res.data
          /*[
            VINCI_UC_USER-会员中心-用户
            VINCI_SC_BRAND-商户中心-品牌
            VINCI_SC_SHOP-商户中心-门店
            VINCI_SC_SELLER-商户中心-商家
            VINCI_SC_PLACE-商户中心-桌台
            VINCI_SC_APP-商户中心-应用
            VINCI_SC_PRODUCT-商户中心-商品
            VINCI_CC_CONTENT-内容中心-内容
            VINCI_CC_COMMENT-内容中心-评论
            MAINTAIN_WORKER_ORDER-运维工单
          ]*/
          banner.forEach(item => {
            if (item.target && item.target.type == 'VINCI_SC_PRODUCT') {
              item.formatPath = '/pages/goods/goods?id=' + item.target.id
            }
            if (item.target && item.target.type == 'VINCI_CC_CONTENT') {
              item.formatPath = '/pages/topicDetail/topicDetail?id=' + item.target.id
            }
          })
          this.setData({
            banner: res.data,
          });

        }
      }
    });
  },
  getShops() {
    return shopMgr.getList().then(res => {
      if (res.data.length > 0) {
        var shops=res.data.map(item=>{
          item.way=item.location.addition.slice(0,3)
          return item
        })
        this.setData({
          shops
        });
      }
      console.log(this.data.shops)
    });
  },
  getTopics() {
    return util.request(qianbao.Url_Contents, {
      type: 'ARTICLE',
      pageSize: 20,
      pageNum: 1
    }).then(res => {
      if (res.code == 0) {
        var topics = this.data.topics.concat(res.data.map(item => {
          item.formatCreatedTime = util.formatTime(new Date(item.createdTime))
          return item
        }))
        this.setData({
          topics
        })
      }
    })
  },
  getNewGoods() {
    // let productsort=''
    return util.request(qianbao.Url_Products + '?sort=order,desc&tagCode=fresh-product&catalogIdNe=default').then(res => {
      if (res.code === 0) {
         let datas = res.data.map(item=>{
            item.tags.map(item1=>{
              if(item1.code=="dine-product"){
                item.productsort="堂食"
               }else if(item1.code=="takeout-product"){
                item.productsort="外卖"
              }else if(item1.code=="mall-product"){
                item.productsort="商城"
              }
            })
            return item;
        })
        this.setData({
          newGoods: datas,
        });
      }
    });
  },
  getHotGoods() {
    return util.request(qianbao.Url_Products + '?sort=order,desc&tagCode=hot-product&catalogIdNe=default', ).then(res => {
      if (res.code === 0) {
        let datas=res.data.map(item=>{
            item.tags.map(item1=>{
                if(item1.code=="dine-product"){
                    item.productsort="堂食"
                   }else if(item1.code=="takeout-product"){
                    item.productsort="外卖"
                  }else if(item1.code=="mall-product"){
                    item.productsort="商城"
                  }
            })
            return item;
        })
          this.setData({
            hotGoods:datas,
          });
      }
    });
  },
  getCard() {
    return card.getCard().then((res) => {
      this.setData({
        ...res,
        hasGetCardInfo: true,
      })
    })
  },
  getHomeConfigs() {
    return util.request(qianbao.Url_Configs + '?key=homeConfig', ).then(res => {
      if (res.code === 0 && res.data && res.data[0]) {
        let configs = JSON.parse(res.data[0].value).sort(function (a, b) {
          return a.order - b.order
        }).filter(item => item.isSelect)
        this.setData({ configs })
      }
      console.log(this.data.configs)
    });
  },
  getChannels: function () {
    return util.request(qianbao.Url_Configs + '?key=channelHome', ).then(res => {
      const def = workspace.menus.channelHome;
      if (res.code === 0 && res.data && res.data[0]) {
        var channel = JSON.parse(res.data[0].value).filter(item => item.isSelect).sort((a, b) => a.order - b.order).map(obj=>{
          def.some(o => {
            if (obj.id == o.id) {
              obj.picUrl = o.picUrl;
              return true;
            }
          });
          return obj;
        });
        this.setData({ channel })
        console.log(this.data.channel)
      } else {
        this.setData({ channel: def })
      }
    });
  },
  gocatelog() {
    wx.switchTab({
      url: '/pages/orderMenu/orderMenu?categoryId=1'
    })
  },
  getHomeData: function () {
    return Promise.all([
      this.getBannerData(),
      this.getShops(),
      this.getTopics(),
      this.getNewGoods(),
      this.getHotGoods(),
      this.getHomeConfigs(),
      this.getChannels(),
      // this.getCard(),
    ])
  },
  contactUs() {
    /*
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
    */

    wx.navigateTo({
      url: '/pages/shop/shop',
    });
  },
  onLoad: function (options) {
    app.aldstat.sendEvent('indexLoad');
    mta.initPage();

    var that = this
    this.data.shareComingType = options.shareComingType;
    this.data.orderId = options.orderId;
    this.data.activityId = options.activityId;
    console.log(options);
    app.getBrandName().then(brandName => {
      wx.setNavigationBarTitle({
        title: brandName
      });
      if(options.activityId){
        this.setData({
          activityId: options.activityId
        });
      }
      this.setData({
        brandName,
      });
      queryNewUserActivity(this);
    })
    // 页面显示
    this.getHomeData()


    // 页面显示
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function (res) {
    console.log(res);
    console.log('分享进入')
    home.ignore();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onPullDownRefresh: function () {
    this.getHomeData().then((res) => {
      wx.stopPullDownRefresh()
    });
  },
  stop() { },
  hidePreview() {
    this.hidePreviewAnimate()
    setTimeout(() => {
      this.setData({
        isPreviewing: false
      })
    }, 400)
  },
  hidePreviewAnimate() {
    var animation1 = wx.createAnimation({
      duration: 200,  //动画时长
      timingFunction: "linear", //线性
      delay: 0  //0则不延迟
    });
    var animation2 = wx.createAnimation({
      duration: 200,  //动画时长
      timingFunction: "linear", //线性
      delay: 0  //0则不延迟
    });
    animation2.opacity(0).step();
    this.setData({ previewAnimationData: animation2 })

    animation1.scale(1.1).step();
    this.setData({ animationData: animation1.export() })

    setTimeout(() => {
      animation1.scale(1).step();
      this.animationData = animation1
      this.setData({ animationData: animation1 })
    }, 200)
  },
  showPreview(e) {
    var item=e.currentTarget.dataset.item
    console.log(item)
    wx.navigateTo({
      url: '/pages/shopintroduce/shopintroduce?currentPrewiewGoods=' + JSON.stringify(item),
    });
    // var currentPrewiewGoods = e.currentTarget.dataset.item
    // this.setData({
    //   currentPrewiewGoods,
    //   isPreviewing: true
    // })
    // this.showPreviewAnimate()
  },
  showPreviewAnimate() {
    /* 动画部分 */
    // 第1步：创建动画实例
    var animation1 = wx.createAnimation({
      duration: 200,  //动画时长
      timingFunction: "linear", //线性
      delay: 0  //0则不延迟
    });
    var animation2 = wx.createAnimation({
      duration: 200,  //动画时长
      timingFunction: "linear", //线性
      delay: 0  //0则不延迟
    });

    animation2.opacity(1).step();
    this.setData({ previewAnimationData: animation2 })

    animation1.scale(1.1).step();
    this.setData({ animationData: animation1.export() })

    setTimeout(() => {
      animation1.scale(1).step();
      this.animationData = animation1
      this.setData({ animationData: animation1 })
    }, 200)
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

  },

///////

  bindGetUserInfo: function(e) {
    var _this = this;
    if (e.detail.userInfo){
      auth.authLogin().then(res=>{
      if(_this.data.isNewUserCoupon){
          sendCouponsToNewUser(_this);
        }else{
          sendConsumeCoupe(_this);
        }
      });
    }
  },

  // sendCoupons :function(e){
  //   sendCouponsToNewUser(this);
  // },

  browerShop : function(e){
    this.setData({
      coupons : []
    });
  }
})

function getNewUserCoupons(_this){
  var requestParams = {};
  requestParams.append ='COUPON_MOLD';
  couponRequest.queryActivityDetail(_this.data.newUserActivityId,requestParams).then(function(resp){
      console.log(resp);
    var coupList = JSON.parse(resp.data.metadata.coupon_mold_list);
    //删除已过期的优惠券-不再展示--begin
    var length  = coupList.length;
    while(length--){
      if (coupList[length].quantity == coupList[length].usedQuantity){
        coupList.splice(length,1);//删除已过期优惠券
      }
    }
    if(!coupList || coupList.length == 0 ){
      if (_this.data.orderId) {//如果新人有礼活动优惠券无库存，则判断是否可以领取消费有礼
        checkUserCanJoinConsumeActivity(_this);
      }
      return;
    }
    //删除已过期的优惠券-不再展示--end
    _this.data.netCoupons =coupList;
    //已过期优惠券显示已过期--begin--废弃，按照不显示处理
    var tmpCount = 0;
    _this.data.netCoupons.forEach(function (item, index) {
      if (item.quantity == item.usedQuantity) {
        tmpCount++;
      }
    });

    if (tmpCount == _this.data.netCoupons.length) {
      console.log("无有效优惠券");
      changeNetDataToLocalCoupons(_this, _this.data.netCoupons);
      _this.setData({
        shouldShow: true,
        haveGetCoupon: true,
      });
      return;
    }
 //已过期优惠券显示已过期--end

    changeNetDataToLocalCoupons(_this, coupList);
  });
};

function changeNetDataToLocalCoupons(_this, rspData) {
  var coupons = [];
  var quantityEmptyCount = 0;
  rspData.forEach(function (item, index) {
    var tmpCoupon = {};
    tmpCoupon.discount = item.reduceFee /100;
    if (item.leastFee != 0) {
      tmpCoupon.workCondition = '满' + item.leastFee/100 + '元可用';
    } else {
      tmpCoupon.workCondition = '无门槛';
    }
    tmpCoupon.workInfo = item.name;
    if (item.expireType == 'FIX_DAYS') {
      tmpCoupon.deadLine = "领取"+item.fixedTerm + '天后';
    }
    if (item.quantity ==item.usedQuantity){
      tmpCoupon.status ="quantityEmpty";
      quantityEmptyCount++;
    }else{
      tmpCoupon.status = item.status;
    }
    coupons.push(tmpCoupon);
  });
  var isAllCouponsDisable = _this.data.isAllCouponsDisable;
  if (coupons && coupons.length == quantityEmptyCount ){
    isAllCouponsDisable = true;
  }
  _this.setData({
    coupons,
    isAllCouponsDisable
  });
};

function sendCouponsToNewUser(_this){
  var couponCount = _this.data.netCoupons.length;
var requestParams = {};

  requestParams.user = {};
  requestParams.user.id = auth.getUserInfo().user.id;
  requestParams.activityId = _this.data.netNewUserActivity[0].id;
  requestParams.sellerId = SellerID;

  couponRequest.createCoupon(requestParams).then(function(resp){
  console.log('创建优惠券---');
  console.log(resp);
  _this.data.netCoupons.forEach(function(data){
    data.status = 'geted';
  });
    changeNetDataToLocalCoupons(_this,_this.data.netCoupons)
      _this.setData({
        haveGetCoupon: true
      });
  });

}
//查询seller下面新人有礼活动列表
function queryNewUserActivity(that){
  var requestParams = {};
  requestParams.pageNum = 1;
  requestParams.type ='NEWCOMER_GIFT';
  requestParams.status ='PUBLISHED';
  requestParams.sellerId = SellerID;
  requestParams.pageSize = 1;
  var currentDate = new Date();
  var beforeDate = new Date();
  beforeDate = beforeDate.setDate(beforeDate.getDate()+1);
  beforeDate = new Date(beforeDate);
  var currentTime = currentDate.getFullYear() + "/" +
  (currentDate.getMonth() + 1) + "/" + currentDate.getDate();
  var beforeTime = beforeDate.getFullYear() + "/" + (beforeDate.getMonth() + 1) + "/" + beforeDate.getDate();
  requestParams.startTimeLt = Date.parse(new Date(beforeTime));
  requestParams.endTimeGte = Date.parse(new Date(currentTime));
  couponRequest.queryActivty(requestParams).then(function(resp){
      console.log(resp);
    if(resp.code == 0 && resp.data && resp.data.length > 0){
      that.data.netNewUserActivity.push(resp.data[0]);
      checkUserCanJoinNewUserActivity(resp.data[0],that);
    }else{
      if (that.data.orderId) {
        checkUserCanJoinConsumeActivity(that);
        return;
      }
    }
  });
}

//检查用户是否有权限参加新人有礼活动
function checkUserCanJoinNewUserActivity(activityTmp,that){
  var requestParams = {};
  requestParams.append ='ACTIVITY';
  requestParams.userId = auth.getUserInfo().user.id;
  requestParams.activityType ='NEWCOMER_GIFT';
  requestParams.sellerId = SellerID;
  requestParams.pageNum=1;
  requestParams.pageSize = 50;
  couponRequest.queryParticipant(requestParams).then(function(resp){
    console.log(resp);
    if(resp.code == 0 && resp.data.length == 0){
      that.data.newUserActivityId = activityTmp.id;
      getNewUserCoupons(that);
    } else if (resp.code == 0 && resp.data.length > 0 && that.data.shareComingType =='coupon'){
      if(that.data.orderId){
        checkUserCanJoinConsumeActivity(that);
        return;
      }
      wx.showToast({
        title: '您已经领取过新人专享优惠券啦',
        icon:'none'
      })
    }
  });
}

//检查用户是否有权限参加消费有礼活动
function checkUserCanJoinConsumeActivity(that) {
  var requestParams = {};
  const { orderId,activityId} = that.data;
  requestParams.append = 'ACTIVITY';
  requestParams.userId = auth.getUserInfo().user.id;
  requestParams.activityType = 'CONSUME_GIFT';
  requestParams.activityId = activityId;
  requestParams.orderId = orderId;
  requestParams.sellerId = SellerID;
  requestParams.pageNum = 1;
  requestParams.pageSize = 50;
  couponRequest.queryParticipant(requestParams).then(function (resp) {
    console.log(resp);
    if (resp.code == 0 && resp.data.length == 0) {
      // sendConsumeCoupe(that,resp);//送券
      queryConsumeActivityDetail(that);
    } else{
      wx.showToast({
        title: '您已经领取过该优惠券啦',
        icon: 'none'
      })
    }
  });
}

//送消费有礼券--begain
function sendConsumeCoupe(that, activityResp) {
  var requestParams = {};
  requestParams.user = {};
  requestParams.user.id = auth.getUserInfo().user.id;
  requestParams.activityId = that.data.activityId;
  requestParams.sellerId = auth.getUserInfo().user.id;
  requestParams.metadata = {};
  requestParams.metadata.orderId = that.data.orderId;
  couponRequest.createCoupon(requestParams).then(function (resp) {
    console.log(resp);
    var netCoupons = [];
    that.setData({
      haveGetCoupon: true,
    })
    changeNetDataToLocalCoupons(that, that.data.netCoupons);
  }).catch(function(res){
    console.log(res);
    that.setData({
      shouldShow:false,
    })
  });
}
//送消费有礼券--end

//查询消费活动详情--begain
function queryConsumeActivityDetail(that) {
  var requestParams = {};
  requestParams.append = 'COUPON_MOLD';
  couponRequest.queryActivityDetail(that.data.activityId, requestParams).then(function (resp) {
    console.log('查询活动详情');
    console.log(resp);
    var netConsumeActivity = [];
    netConsumeActivity.push(resp.data);
    var canShare = false;
    if (resp.data.metadata && resp.data.metadata.isSpportShare != '0') {
      canShare = true;
    }
    that.setData({
      canShare,
      netConsumeActivity,
      isNewUserCoupon:false
    });
    that.data.netCoupons = JSON.parse(resp.data.metadata.coupon_mold_list);
    //删除已过期的优惠券-不再展示--begin
    var length = that.data.netCoupons.length;
    while (length--) {
      if (that.data.netCoupons[length].quantity == that.data.netCoupons[length].usedQuantity) {
        that.data.netCoupons.splice(length, 1);//删除已过期优惠券
      }
    }
    if (!that.data.netCoupons || that.data.netCoupons.length == 0) {
      return;
    }
    changeNetDataToLocalCoupons(that, that.data.netCoupons);
    //删除已过期的优惠券-不再展示--end
  //   var tmpCount = 0;
  //   that.data.netCoupons.forEach(function(item,index){
  //     if (item.quantity == item.usedQuantity){
  //       tmpCount++;
  //     }
  //   });
  //   if (tmpCount == that.data.netCoupons.length ){
  //     console.log("无有效优惠券");
  //     changeNetDataToLocalCoupons(that, that.data.netCoupons);
  //     that.setData({
  //       shouldShow: true,
  //        haveGetCoupon: true,
  //     });
  //     return;
  //   }
  //   sendConsumeCoupe(that, resp);
  });
}
//查询活动详情--end