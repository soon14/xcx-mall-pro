var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var it120 = require('../../config/it120.js');
var qianbao = require('../../config/qianbao.js');
var orderMgr = require('../../services/order.js');
var shopMgr = require('../../services/shop.js');
var activityMgr = require('../../services/activity.js');
var request_coupon = require('../../services/coupons.js');
var auth = require('../../services/auth.js');
let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
const menu = require('../../services/menu/menu.js');
const dineMgr = require('../../services/menu/dine.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activity:null,
    shop:null,
    dineList:[],
    totle:0,
    totleLength:0,
    isSubmiting:false,
    beforePublish:false,
    mainColor:extConfig.mainColor,
    note:'',
    actorsNum:'',
    actorsData:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    isDisabled:false,

    //dine
    dineConfigEnabled:false,//外带

		needActor:true,//人数是否必填
		isShare:true,//是否多人点餐
		//外带
		dineEnable:true,//是否支持外带
    isDineOut:false,
    isfold:true,

    isShowCoupon: false,
    netCoupons: [],
    localCoupons: [],
    selectedCoupons: [],
    couponDiscount: 0,
    couponPageNum:1,
    netCouponTotal:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  
  moreInfo(){
    this.setData({
      isfold:!this.data.isfold,
    })
  },
  goback(){
    wx.reLaunch({
      url:'/pages/index/index'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  onShopChange(shop){
    if (shop) {
      var needActor = false;
      var isShare = false;
      var dineEnable = false;
      var config = dineMgr.getConfig();
      var dineConfigEnabled = config.enabled;
      needActor = config.isActorsNumRequired;
      isShare = config.isShared;
      dineEnable = config.isDineOut;
      this.setData({
        needActor,
        isShare,
        dineEnable,
        dineConfigEnabled,
        shop
      });
    }
  },

  onActivityChange(activity){
    if (activity) {
      this.setData({
        activity,
      });
      this.handleActivity(activity);
    }else{
      this.setData({
        activity:null,
        dineList:[],
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    dineMgr.bindOnShopChange(this.onShopChange);
    dineMgr.bindOnActivityChange(this.onActivityChange);

    var formEditData = wx.getStorageSync('formEditData')
    if (formEditData) {
      formEditData.forEach(item=>{
        if (item.key === 'note') {
          // 修改备注
          this.setData({
            note:item.value
          })
        }
      })
    }
    wx.removeStorageSync('formEditData')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    dineMgr.handleOnHide();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    if (this.data.activity) {
      dineMgr.updateActivity(this.data.activity.id).then(res=>{
        wx.stopPullDownRefresh();
      }).catch(err=>{
        wx.stopPullDownRefresh();
      });
    }else{
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.isShowCoupon){
      if (this.data.netCouponTotal <= this.data.netCoupons.length){
          return;
      }
      this.data.couponPageNum ++;
      queryUserCoupons(this);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  bindCountryChange(e){
    this.setData({ actorsNum:+this.data.actorsData[e.detail.value] })
  },
  radioChange(e){
    this.setData({
     isDineOut: e.detail.value == '外带',
     });
  },
  goUsers(){
    wx.navigateTo({
      url: '/pages/userList/userList?id=' + this.data.activity.id,
    });
  },
  bindinput(e) {
    this.setData({
      note: e.detail.value
    })
  },

  handleActivity(activity){
    /////////
    if (activity.id) {
      this.setData({activity});
    }

    if (activity.status == 'CLOSED') {
      this.setData({
        isDisabled:true,
        note:activity.metadata.note || '',
        actorsNum:activity.metadata.actorsNum || ''
      })
    }
     
    let dineList = menu.getMenuList(activity);
    this.setData({dineList});//设置购物车数据

    this.calculateTotal();
  },

	getShop(id){
    shopMgr.getDetail(id, {append:"dine_config"}).then(res => {
			var needActor = false;
			var isShare = false;
			var dineEnable = false;
      var dineConfigEnabled = res.data.dineConfig.enabled;
			if (dineConfigEnabled) {
				needActor = res.data.dineConfig.isActorsNumRequired;
				isShare = res.data.dineConfig.isShared;
				dineEnable = res.data.dineConfig.isDineOut;
			}
			this.setData({
				needActor,
				isShare,
				dineEnable,
        dineConfigEnabled
			});
		});
	},

  calculateTotal(){
    var totle = 0, totleLength = 0 , dineList
    dineList = this.data.dineList
    dineList.forEach(v=>{
      totle += v.metadata.price * v.metadata.number;
      totleLength += v.metadata.number;
    });
    this.setData({
      totle,
      totleLength
    })
    queryUserCoupons(this);
  },

  reSubmit(){
    if (this.data.isSubmiting) return
    this.setData({isSubmiting:true})
    setTimeout(()=>{
      this.setData({isSubmiting:false})
    },1000);

    dineMgr.updateActivity(this.data.activity.id).then(activity=>{
      if (activity.status == 'CLOSED') {
        wx.showToast({
          title: '订单已有人支付，无需重复下单',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (activity.status == 'PUBLISHED') {
        this.reSubmitModel()
        return
      }
    })
  },
  reSubmitModel(){
    var that = this
    wx.showModal({
      title: '提示',
      content: '当前餐桌已提交过订单（未支付），是否创建新订单？',
      success: function(res) {
        if (res.confirm) {
          var activity = that.data.activity
          activityMgr.update(activity.id,{status:'CREATED'}).then(res => {
            if (res.code == 0) {
              activity.status = 'CREATED'
              that.setData({
                activity
              })
            }
          })
        } else if (res.cancel) {}
      }
    })
  },
  submit(){
    if (this.data.isSubmiting) return
		//用餐人数
		if (!this.data.actorsNum && this.data.needActor) {
      wx.showToast({
				title: '请选择就餐人数',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.setData({
      isSubmiting:true,
      beforePublish:true
    })
    setTimeout(()=>{
      this.setData({isSubmiting:false})
    },1000)
    dineMgr.updateActivity(this.data.activity.id).then(activity=>{
      if (this.data.totle == 0) {
        wx.showToast({
          title: '交易金额不符合条件',
          icon: 'none',
          duration: 2000
        })
        this.setData({
          beforePublish:false
        })
        return
      }
      if (activity.status == 'CLOSED') {
        wx.showToast({
          title: '订单已有人支付，无需重复下单',
          icon: 'none',
          duration: 2000
        })

        this.setData({
          beforePublish:false,
        })

        return
      }
      if (activity.status == 'PUBLISHED') {
        this.setData({
          beforePublish:false
        });
        this.reSubmitModel()
        return
      }

      var dic = {
        note:this.data.note,
        activityId:this.data.activity.id, 
        placeName:this.data.activity.place.name,
        placeId:this.data.activity.place.id,
      };
      if (this.data.dineConfigEnabled) {
        if (this.data.needActor) {
          dic.actorsNum = this.data.actorsNum;
        }
        if (this.data.dineEnable) {
          dic.isDineOut = this.data.isDineOut;
        }
      }
      var items = this.data.dineList.map(item => {
        var infos = {
          "goodsId": item.metadata.gid,
          "unitPrice": item.metadata.price,
          "productName": item.name,
          "goodsPic": item.metadata.url,
          "quantity": item.metadata.number,
          "realUnitPrice": item.metadata.price,
          "productAttrs": item.metadata.attr,
        };
        if (item.product.isPackage) {
          infos.productId = item.product.id;
        }
        return infos;
      });
      const orderSubData = {
        bizCode: 100,
        channel: 'ACTIVITY_' + activity.id,
        remark:this.data.note,
        metadata:JSON.stringify(dic),
        isTest: false, 
        items,
        shopId: activity.shop.id,
      }
      util.request(qianbao.Url_Orders, orderSubData, 'POST').then(res => {
        if (res.code == 0) {
          this.payOrder(res.data.id)
        }
      });
    })
  },
  payOrder(orderId) {
    let that = this;
    const { totle, shippingfee, couponDiscount } = this.data;
    var tmpAmount = ((totle - couponDiscount)) <= 0 ? 0 : ((totle - couponDiscount));
    var amount = tmpAmount ;
    var couponId;
    if (this.data.selectedCoupons && this.data.selectedCoupons.length > 0) {
      couponId = this.data.selectedCoupons[0].id;
    }
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    let activity = this.data.activity;
    orderMgr.pay(activity.shop.id, orderId, {
      amount,
      couponId
    }).then(function (res) {
      if (res.code === 0) {
        // activity状态更新为发布中
        if(res.data.status == 21){//表明已经支付成功
          dineMgr.leavePlace();
          // 修改活动备注  人数  关联订单
          activityMgr.update(activity.id, {
            metadata: {
              orderId: res.data.id,
              note: that.data.note,
              actorsNum: that.data.actorsNum
            }
          });

          activity.status = 'CLOSED'
          that.setData({
            activity
          })
          wx.redirectTo({
            url: '/pages/payResult/payResult?status=true&orderId=' + res.data.id,
          })
          return;
        }
        if (activity.status == 'CREATED') {
          activityMgr.update(activity.id, { status: 'PUBLISHED' }).then(res => {
            if (res.code == 0) {
              activity.status = 'PUBLISHED'
              that.setData({
                activity,
                beforePublish: false
              })
            }
          })
        }
        // 付款
        let payParam = res.data.wx;
        const orderId = res.data.id;
        wx.requestPayment({
          'timeStamp': payParam.timestamp + '',
          'nonceStr': payParam.nonceStr,
          'package': payParam.package,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function (res) {
            dineMgr.leavePlace();
            // 修改活动备注  人数  关联订单
            activityMgr.update(activity.id, {
              metadata: {
                orderId,
                note: that.data.note,
                actorsNum: that.data.actorsNum
              }
            });

            activity.status = 'CLOSED'
            that.setData({
              activity
            })

            wx.redirectTo({
              url: '/pages/payResult/payResult?status=true&orderId=' + orderId,
            })
          },
          'fail': function (res) {

            activityMgr.update(activity.id, { status: 'CREATED' }).then(res => {
              if (res.code == 0) {
                activity.status = 'CREATED'
                that.setData({
                  activity
                })
              }
            });
            wx.showModal({
              title: '确定放弃支付吗？',
              confirmColor: '#b4282d',
              confirmText: '继续支付',
              cancelText: '放弃',
              content: '超过订单支付时效后，订单将被取消，请尽快完成支付',
              success: function (res) {
                if (res.confirm) {
                  that.payOrder(orderId);
                } else {
                  orderMgr.cancel(orderId, {
                    reason: "用户放弃支付" 
                  }).then(function (res) {
                    console.log('用户放弃支付')
                    console.log(res);
                  });
                  that.setData({
                    mainColor: "#323332",
                    beforePublish: false,
                    activity,
                  });
                }
              }
            });

          }
        })
      }
    }).catch(function(res){
      orderMgr.cancel(orderId, {
        reason: "订单出错" 
      }).then(function (res) {
        console.log('订单出错')
        console.log(res);
        var activity = that.data.activity;
        activity.status = 'CREATED';
      });
      that.setData({
        mainColor: "#323332",
        beforePublish: false,
        activity,
      });
    })
  },


  //点击使用优惠券--begain
  onCouponSelectClick: function (resp) {
    console.log(resp);
    const { totle } = this.data;
    var clickPosition = 0;
    for (var i of resp.detail) {
      clickPosition = i[0];
    }
    if (this.data.localCoupons[clickPosition].status == "") {
      wx.showToast({
        title: '该优惠券不可使用哦',
        icon: 'none'
      })
      return;
    }
 
    var selectCouponTmp = [];
    selectCouponTmp.push(this.data.netCoupons[clickPosition]);
    this.data.selectedCoupons = selectCouponTmp;
    calcCountDiscount(this);
    this.setData({
      isShowCoupon: false
    });
  },
  //点击使用优惠券--end

  //选择优惠券--begain
  chooseCoupon: function (view) {
    this.setData({
      isShowCoupon: true,
    });
  },
  //选择优惠券--end
  //优惠券列表页点击取消--begin
  coupons_cancel:function() {
    this.setData({
      isShowCoupon: false
    });
  }
 //优惠券列表页点击取消--end
})

//查询用户所有的优惠券--begain
function queryUserCoupons(that) {
  var requestParams = {};
  var netCoupons = that.data.netCoupons;
  requestParams.userId = auth.getUserInfo().user.id;
  requestParams.status = 'NORMAL';
  requestParams.pageNum = that.data.couponPageNum;
  requestParams.pageSize = 50;
  request_coupon.queryUserCoupons(requestParams).then(function (res) {
    console.log('优惠券----');
    that.data.netCouponTotal = res.total;
    if (requestParams.pageNum > 1){
      netCoupons = netCoupons.concat(res.data);
    }else{
      netCoupons = res.data;
    }
    changeNetDataToLocalData(that, netCoupons);
    that.setData({
      couponCount: res.total,
    });
  });
}
//查询用户所有的优惠券--end

//转换网络数据到本地数据显示---begain
function changeNetDataToLocalData(_this, res) {
  var coupons = [];
  res.forEach(function (item, index) {
    var tmpCoupon = {};
    tmpCoupon.couponUnUsefulReson = [];
    tmpCoupon.discount = item.mold.reduceFee / 100;
    if (item.mold.leastFee != 0) {
      tmpCoupon.workCondition = '满' + item.mold.leastFee / 100 + '元可用';
    } else {
      tmpCoupon.workCondition = '无门槛';
    }
    tmpCoupon.workInfo = item.mold.name;
    var endTime = item.endTime - Date.parse(new Date());
    endTime = parseInt(endTime / 1000 / 60 / 60 / 24);
    tmpCoupon.deadLine = endTime + '天后';
    if (item.status == 'NORMAL') {
      tmpCoupon.status = 'unUse';
    } else if (item.status == 'EXPIRED' || item.status == 'INEFFECTIVE') {
      tmpCoupon.status = 'deadLined';
    }
    if ((_this.data.totle - item.mold.leastFee) < 0) {
      tmpCoupon.status = "";
      tmpCoupon.couponUnUsefulReson.push("本次消费未达到使用门槛");
    }
    if (item.mold.shops) {
      var fitEable = false;
      item.mold.shops.forEach(function (shop) {
        if (shop.id == _this.data.activity.shop.id) {
          fitEable = true;
        }
      })
      if (!fitEable) {
        tmpCoupon.couponUnUsefulReson.push("该优惠券不适用于本门店");
        tmpCoupon.status = "";
      }
    }
    coupons.push(tmpCoupon);
  });

  var unUseTmp = [];
  var useTpm = [];

  var unUseableNetCouponTmp = [];
  var useableNetCouponTmp = [];
  var resLength = res.length;
  for (var i = 0; i < resLength; i++) {
    if (coupons[i].status == "") {
      unUseTmp.push(coupons[i]);
      unUseableNetCouponTmp.push(res[i]);
    } else {
      useTpm.push(coupons[i]);
      useableNetCouponTmp.push(res[i]);
    }
  }

  coupons = useTpm.concat(unUseTmp);
  res = useableNetCouponTmp.concat(unUseableNetCouponTmp);
  _this.setData({
    localCoupons: coupons,
    netCoupons: res,
  });
}
  //转换网络数据到本地数据显示---end


//计算优惠券优惠金额--begain
function calcCountDiscount(_this) {
  const { selectedCoupons } = _this.data;
  var couponDiscount = 0;
  selectedCoupons.forEach(function (item) {
    couponDiscount = couponDiscount + item.mold.reduceFee;
  });
  _this.setData({
    couponDiscount
  });
}
   //计算优惠券优惠金额--end