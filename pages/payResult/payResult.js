var util = require('../../utils/util.js');
var qianbao = require('../../config/qianbao.js');
var orderMgr = require('../../services/order.js');
const request_coupon = require('../../services/coupons.js');
const auth = require('../../services/auth.js');
var app = getApp();
Page({
  data: {
    status: false,
    orderId: 0,
    shopId: 0,
    netCoupons: [],
    localCoupons: [],
    netConsumeActivity: [],
    canShare:false,
    money:0,
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options);
    console.log('订单支付成功');
    
    this.setData({
      orderId: options.orderId,
      status: (options.status=='true')
    })
    if(this.data.status){
      queryConsumeActivity(this);
    }
    const _this = this;
    orderMgr.getDetail(options.orderId).then(res=>{
      _this.setData({
        money:res.data.realPaid,
        shopId: res.data.shopId
      });
    });
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

  },
  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from == 'button' && res.target && res.target.dataset.shareid == 'shareCoupon') {
      const { netConsumeActivity } = this.data;
      return {
        title: netConsumeActivity[0].metadata.shareTopic,
        path: '/pages/index/index?shareComingType=coupon&orderId=' + this.data.orderId + "&activityId=" + netConsumeActivity[0].id,
        imageUrl: netConsumeActivity[0].metadata.shareLogo,
      }
    }
    return {
      title: '分享',
      path: '/pages/index/index'
    }
  },
  
  payOrder() {
    let that = this;
    orderMgr.pay(this.data.shopId, this.data.orderId).then(function (res) {
      if (res.code === 0) {
        let payParam = res.data.wx;
        const orderId = res.data.id;
        console.info(res.data);

        
        wx.requestPayment({
          'timeStamp': payParam.timestamp + '',
          'nonceStr': payParam.nonceStr,
          'package': payParam.package,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function (res) {
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=true&orderId=' + orderId,
            })
          },
          'fail': function (res) {
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=false&orderId=' + orderId,
            })
          }
        })
      }
    });
  }
})

//查询是否有消费有礼活动--begain
function queryConsumeActivity(that) {
  var requestParams = {};
  requestParams.type = 'CONSUME_GIFT';
  requestParams.append = 'COUPON_MOLD';
  requestParams.status = 'PUBLISHED';
  requestParams.sellerId = auth.getUserInfo().seller.id;
  if (that.data.shopId) {
    requestParams.shopId = that.data.shopId;
  }
  requestParams.pageNum = 1;
  requestParams.pageSize = 1;
  var currentDate = new Date();
  var beforeDate = new Date();
  beforeDate = beforeDate.setDate(beforeDate.getDate() + 1);
  beforeDate = new Date(beforeDate);
  var currentTime = currentDate.getFullYear() + "/" +
    (currentDate.getMonth() + 1) + "/" + currentDate.getDate();
  var beforeTime = beforeDate.getFullYear() + "/" + (beforeDate.getMonth() + 1) + "/" + beforeDate.getDate();
  requestParams.endTimeGte = Date.parse(new Date(currentTime));
  requestParams.startTimeLt = Date.parse(new Date(beforeTime)); 
  
  request_coupon.queryActivty(requestParams).then(function (resp) {
    if (resp.data && resp.data.length > 0) {
      console.log('--消费有礼---');
      console.log(resp);
      that.data.netConsumeActivity = resp.data;
      queryActivityDetail(resp.data[0].id, that);
    }
  });

}
//查询是否有消费有礼活动--end

//查询活动详情--begain
function queryActivityDetail(activityId, that) {
  var requestParams = {};
  requestParams.append = 'COUPON_MOLD';
  request_coupon.queryActivityDetail(activityId, requestParams).then(function (resp) {
    console.log('查询活动详情');
    console.log(resp);
    var canShare = false;
    if (resp.data.metadata && resp.data.metadata.isSpportShare != '0') {
      canShare = true;
    }
    that.setData({
      canShare
    });

    that.data.netCoupons = JSON.parse(resp.data.metadata.coupon_mold_list);

    that.data.netCoupons = JSON.parse(resp.data.metadata.coupon_mold_list);
    var length = that.data.netCoupons.length;
    while (length--) {
      var item = that.data.netCoupons[length];
      if (item.quantity == item.usedQuantity) {
        that.data.netCoupons.splice(length, 1);
      }
    }
    if (!that.data.netCoupons || that.data.netCoupons.length == 0) {
      return;
    }
    
    sendConsumeCoupe(that, resp);
  });
}
//查询活动详情--end

//送消费有礼券--begain
function sendConsumeCoupe(that, activityResp) {
  var requestParams = {};
  requestParams.user = {};
  requestParams.user.id = auth.getUserInfo().user.id;
  requestParams.activityId = activityResp.data.id;
  requestParams.sellerId = auth.getUserInfo().user.id;
  requestParams.metadata = {};
  requestParams.metadata.orderId = that.data.orderId;
  request_coupon.createCoupon(requestParams).then(function (resp) {
    console.log(resp);
    changeNetDataToLocalCoupons(that, that.data.netCoupons);
  });
}
//送消费有礼券--end

//修改网络数据到本地显示数据--begain
function changeNetDataToLocalCoupons(_this, rspData) {
  var localCoupons = [];
  rspData.forEach(function (item, index) {
    var tmpCoupon = {};
    tmpCoupon.discount = item.reduceFee / 100;
    if (item.leastFee != 0) {
      tmpCoupon.workCondition = '满' + item.leastFee / 100 + '元可用';
    } else {
      tmpCoupon.workCondition = '无门槛';
    }
    tmpCoupon.workInfo = item.name;
    if (item.expireType == 'FIX_DAYS') {
      tmpCoupon.deadLine = item.fixedTerm + '天后';
    }
    tmpCoupon.status = item.status;
    localCoupons.push(tmpCoupon);
  });
  _this.setData({
    localCoupons
  });
};
//修改网络数据到本地显示数据--end