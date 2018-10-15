var util = require('../../../utils/util.js')
var api = require('../../../config/api.js')
var qianbao = require('../../../config/qianbao.js')
var orderMgr = require('../../../services/order.js');
var activityMgr = require('../../../services/activity.js');
var shopMgr = require('../../../services/shop.js');
var auth = require('../../../services/auth.js');
var request_coupon = require('../../../services/coupons.js');
var myaddress=require('../../../services/menu/takeout.js')

Page({
  data: {
    addressData: [],
    isShow: false,
    addressList: [],
    selectedAddress: {},
    activityId: '',
    shopname: '',
    shopid: '',
    taketype: '',
    activity: {},
    checkedList: [],
    checkedListImage: [],
    checkedListImageThree: [],
    totle: 0,
    totleLength: 0,
    note: '',
    isSubmiting: false,
    beforePublish: false,
    pageNum: 1,
    pageSize: 100,
    shippingfee: 0,
    deliveryType: "",
    payBackgroundColor: 'gray',
    payclick: '',
    payName: '去支付',
    couponCount:0,
    isShowCoupon:false,
    netCoupons:[],
    localCoupons:[],
    selectedCoupons:[],
    couponDiscount:0,
    couponPageNum:1,
    netCouponTotal:0,
    useAbleCouponNum:0,
  },
  onLoad: function(options) {
    this.setData({
      activityId: options.id,
      shopname: options.shopname,
      shopid: options.shopid,
      taketype: options.taketype,
      deliveryType: options.deliveryType,
    })
    this.getActivity(options.id).then(res => {
      wx.hideLoading()
    })
    this.getAddressList();
    queryUserCoupons(this);
  },
  getAddressList() {
    let that = this;
    util.request(qianbao.Url_address, {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
    }, 'GET').then(function(res) {
      if (res.code === 0) {
        var selectedAddress = wx.getStorageSync("addressSelect");
        console.log(selectedAddress)
        if (!selectedAddress) {
          selectedAddress = res.data[0];
        } else {
          if (res.data.length != 0) {
            var selectedAddressDelete = true;
            res.data.forEach(item => {
              if (item.id == selectedAddress.id) {
                selectedAddressDelete = false;
              }
            });
            if (selectedAddressDelete) {
              selectedAddress = res.data[0];
            }
          }
        }
        that.setData({
          addressList: res.data,
          selectedAddress: selectedAddress
        });
        // var selectedAddress=myaddress.getChoiceAddress();
        // console.log(myaddress.getChoiceAddress())
       
        let payBackgroundColor = that.data.payBackgroundColor;
        let payclick = that.data.payclick;
        if (res.data != 0) {
          payBackgroundColor = "#323332";
          payclick = "submit"
          that.getShippingFee();
        } else {
          payBackgroundColor = "gray";
          payclick = "";
        }
        that.setData({
          payBackgroundColor,
          payclick
        });
      }
    });
  },
  getShippingFee() {
    var that = this;
    var selectedAddress = that.data.selectedAddress;
    let payBackgroundColor = that.data.payBackgroundColor;
    let payclick = that.data.payclick;
    let shippingfee = that.data.shippingfee;

    shopMgr.getDetail(that.data.shopid, {
      bizType: that.data.taketype,
      lat: selectedAddress.location.latitude,
      lng: selectedAddress.location.longitude,
      append: "delivery_fee"
    }).then(function(res) {
      if (res.code == 0) {
        if (res.data.deliveryFee == "-1") {
          util.showErrorToast("超出配送范围");
          shippingfee = 0;
          payBackgroundColor = "gray";
          payclick = "";
        } else {
          payBackgroundColor = "#323332";
          payclick = "submit";
          shippingfee = res.data.deliveryFee / 100;
        }
      } else {
        util.showErrorToast(res.message);
        shippingfee = 0;
        payBackgroundColor = "gray";
        payclick = "";
      }
      that.setData({
        shippingfee,
        payBackgroundColor,
        payclick
      })
    });
  },
  onReady: function() {
    // 生命周期函数--监听页面初次渲染完成

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.isShowCoupon) {
      if (this.data.netCouponTotal <= this.data.netCoupons.length) {
        return;
      }
      this.data.couponPageNum++;
      queryUserCoupons(this);
    }
  },

  onShow: function() {
    // 生命周期函数--监听页面显示
    var formEditData = wx.getStorageSync('formEditData')
    if (formEditData) {
      formEditData.forEach(item => {
        if (item.key === 'note') {
          // 修改备注
          this.setData({
            note: item.value
          })
        }
      })
    }
    wx.removeStorageSync('formEditData')

    var selectedAddress = wx.getStorageSync("addressSelect");
    this.setData({
      selectedAddress: selectedAddress
    })

    var refreshAddress = wx.getStorageSync("refreshAddress");
    console.log(refreshAddress)
    if (refreshAddress) {
      this.getAddressList();
    }
    wx.removeStorageSync("refreshAddress");
  },
  onHide: function() {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function() {
    // 生命周期函数--监听页面卸载

  },

  stop() {},
  getActivity(id) {
    return activityMgr.getDetail(id).then(res => {
      if (res.code == 0) {
        var activity = res.data
        var checkedListImage = activity.items
        var checkedList = activity.items.map(item => {
          item.product = JSON.parse(item.metadata.oraginItem);
          item.metadata.price = parseInt(item.metadata.price);
          item.metadata.number = parseInt(item.metadata.number);
          item.metadata.hasParam = item.metadata.hasParam == 'true'
          return item;
        });
        var checkedListImageThree = [];
        if (checkedListImage.length > 3) {
          for (var i = 0; i < 3; i++) { 
          checkedListImageThree.push(checkedListImage[i])
          }
        }
        this.setData({
          activity,
          checkedListImage,
          checkedListImageThree,
          checkedList
        })
        if (activity.status == 'CLOSED') {
          this.setData({
            isDisabled: true,
            note: activity.metadata.note || '',
            actorsNum: activity.metadata.actorsNum || ''
          })
        }
        this.calculateTotal()
      }
    })
  },
  calculateTotal() {
    var totle = 0,
      totleLength = 0,
      checkedList
    checkedList = this.data.checkedList
    checkedList.forEach(v => {
      totle += v.metadata.price * v.metadata.number;
      totleLength += v.metadata.number;
    });
    this.setData({
      totle,
      totleLength
    })
  },
  addressAddOrUpdate(event) {
    wx.navigateTo({
      url: '/pages/ucenter/newAddAddress/newAddAddress?id=' + event.currentTarget.dataset.addressId
    })

  },
  addressSelect(event) {
    this.hide();
    let selectedAddress = this.data.selectedAddress;
    let that = this;
    util.request(qianbao.Url_address + "/" + event.currentTarget.dataset.addressId, {}, 'GET').then(function(res) {
      if (res.code === 0) {
        that.setData({
          selectedAddress: res.data
        });
        wx.setStorageSync("addressSelect", that.data.selectedAddress);
        that.getShippingFee();
      }
    });
  },


  show() {
    this.setData({
      isShow: true
    })
    var modelAnimation = wx.createAnimation({
      duration: 400, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });
    var modelbgAnimation = wx.createAnimation({
      duration: 400, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });

    modelbgAnimation.opacity(1).step();
    this.setData({
      modelbgAnimation
    })

    modelAnimation.bottom(0).step();
    this.setData({
      modelAnimation
    })
  },
  hide() {
    var modelAnimation = wx.createAnimation({
      duration: 400, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });
    var modelbgAnimation = wx.createAnimation({
      duration: 400, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });

    modelbgAnimation.opacity(0).step();
    this.setData({
      modelbgAnimation
    })

    modelAnimation.bottom('-100%').step();
    this.setData({
      modelAnimation
    })
    setTimeout(() => {
      this.setData({
        isShow: false
      })
    }, 400)
  },
  openModal() {
    // this.toggle()
    wx.navigateTo({
      url:'/pages/ucenter/myaddress/myaddress'
    })
  },
  toggle() {
    this.show()
  },

  //支付
  submit() {
    this.setData({
      payBackgroundColor: "gray",
      payclick: "",
      payName: '支付中...'
    });
    setTimeout(() => {
      this.setData({
        isSubmiting: false
      })
    }, 1000)
    if (this.data.addressList.length <= 0) {
      util.showErrorToast('请选择收货地址');
      return false;
    }
    var selectedAddress = this.data.selectedAddress;
    this.getActivity(this.data.activity.id).then(res => {
      var activity = this.data.activity
      // if (this.data.totle == 0) {
      //   wx.showToast({
      //     title: '交易金额不符合条件',
      //     icon: 'none',
      //     duration: 2000
      //   })
      //   this.setData({
      //     beforePublish: false
      //   })
      //   return
      // }
      util.request(qianbao.Url_Orders + "?type=" + this.data.taketype, {
        activityId: this.data.activity.id,
        shopId: this.data.shopid,
        remark: this.data.note,
        items: this.data.checkedList.map(item => {
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
        }).concat([{
          unitPrice: parseInt((this.data.shippingfee * 100).toFixed(2)),
          quantity: '1',
          type: '5'
        }]),
        address: {
          receiverName: selectedAddress.receiverName,
          phone: selectedAddress.phone,
          address: selectedAddress.location.address + selectedAddress.location.addition,
          lat: selectedAddress.location.latitude,
          lng: selectedAddress.location.longitude,
        }
      }, 'POST').then(res => {
        if (res.code == 0) {
          this.payOrder(res.data.id)
        }
      })

    })
  },

  clearMenu(){
    wx.setStorageSync('cleanShopcart','clean');
  },

  payOrder(orderId) {
    let that = this;
    const { totle, shippingfee, couponDiscount } = this.data;
    var tmpAmount = ((totle - couponDiscount)) <= 0 ? 0 : ((totle - couponDiscount));
    var amount = tmpAmount + shippingfee * 100 ;
    let activity = that.data.activity;
    var couponId;
    if (that.data.selectedCoupons && that.data.selectedCoupons.length > 0 ){
      couponId = that.data.selectedCoupons[0].id;
    }

    orderMgr.pay(that.data.shopid, orderId, {
      amount,
      couponId
    }).then(function(res) {
      if (res.code === 0) {
        const orderId = res.data.id;
        if (res.data.status == 21) {
          that.clearMenu();
          wx.redirectTo({
            url: '/pages/payResult/payResult?status=true&orderId=' + orderId
          })
          return;
        }
        console.log('支付中...');
        console.log(res);
        // 付款
        let payParam = res.data.wx;
        wx.requestPayment({
          'timeStamp': payParam.timestamp + '',
          'nonceStr': payParam.nonceStr,
          'package': payParam.package,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function(res) {
            that.clearMenu();
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=true&orderId=' + orderId
            })
          },
          'fail': function(res) {
            wx.showModal({
              title: '确定放弃支付吗？',
              confirmColor: '#b4282d',
              confirmText: '继续支付',
              cancelText: '放弃',
              content: '超过订单支付时效后，订单将被取消，请尽快完成支付',
              success: function(res) {
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
                    payBackgroundColor: "#323332",
                    payclick: "submit",
                    payName: '去支付'
                  });
                }
              },
            });
          }
        });
      }
    }).catch(function (res) {
      orderMgr.cancel(orderId, {
        reason: "订单出错" 
      }).then(function (res) {
        console.log('订单出错')
        console.log(res);
        that.setData({
          payBackgroundColor: "#323332",
          payclick: "submit",
          payName: '去支付'
        });
      });
    })
  },
  //选择优惠券--begain
  chooseCoupon:function(view){
    this.setData({
      isShowCoupon: true,
    });
  },
  //选择优惠券----end

  //点击使用优惠券--begain
  onCouponSelectClick:function(resp){
    console.log(resp);
    const { totle, shippingfee, couponDiscount} = this.data;
    var clickPosition =0;
    for (var i of resp.detail){
        clickPosition = i[0];
    }
    if(this.data.localCoupons[clickPosition].status==""){
      wx.showToast({
        title: '该优惠券不可使用哦',
        icon:'none'
      })
      return;
    }
     var totalMonery = ((totle)  - couponDiscount);
    if (this.data.netCoupons[clickPosition].leastFee < totalMonery){
      wx.showToast({
        title: '该优惠券使用门槛不满足哦',
        icon:'none',
      })
      return;
    }
    var selectCouponTmp = [];
    selectCouponTmp.push(this.data.netCoupons[clickPosition]);
    this.data.selectedCoupons = selectCouponTmp;
    calcCountDiscount(this);
    this.setData({
      isShowCoupon:false
    });
  },
  //点击使用优惠券--end

  //优惠券列表页点击取消--begin
  coupons_cancel(){
    this.setData({
      isShowCoupon: false
    });
  },
 //优惠券列表页点击取消--end

  showmoreclick() {
    this.setData({
      checkedListImageThree: this.data.checkedListImage
    })
  },

  showreduceclick(){
    var checkedListImageThree = [];
    if (this.data.checkedListImage.length > 3) {
      for (var i = 0; i < 3; i++) {
        checkedListImageThree.push(this.data.checkedListImage[i])
      }
    }
    this.setData({
      checkedListImageThree
    })
  }
})

//查询用户所有的优惠券--begain
function queryUserCoupons(that){
  var requestParams = {};
  var netCoupons = that.data.netCoupons;
  requestParams.userId = auth.getUserInfo().user.id;
  requestParams.status = 'NORMAL';
  requestParams.pageNum = that.data.couponPageNum;
  requestParams.pageSize = 50;
  request_coupon.queryUserCoupons(requestParams).then(function(res){
    console.log('优惠券----');
    that.data.netCouponTotal = res.total;
    
    
    if (requestParams.pageNum > 1) {
      netCoupons = netCoupons.concat(res.data);
    } else {
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
    tmpCoupon.couponUnUsefulReson=[];
    tmpCoupon.discount = item.mold.reduceFee/100;
    if (item.mold.leastFee != 0) {
      tmpCoupon.workCondition = '满' + item.mold.leastFee/100 + '元可用';
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
    if ((_this.data.totle - item.mold.leastFee) < 0){
      tmpCoupon.status = "";
      tmpCoupon.couponUnUsefulReson.push("本次消费未达到使用门槛");
    }
    if (item.mold.shops) {
      var fitEable = false;
      item.mold.shops.forEach(function (shop) {
        if (shop.id == _this.data.shopid) {
           fitEable = true;          
        }
    })
    if(!fitEable){
      tmpCoupon.couponUnUsefulReson.push("该优惠券不适用于本门店");
      tmpCoupon.status = "";
    }
    }
    coupons.push(tmpCoupon);
  });

  var unUseTmp = [];
  var useTpm=[];

  var unUseableNetCouponTmp= [];
  var useableNetCouponTmp=[];
  var resLength = res.length;
  for (var i = 0; i < resLength ; i++){
    if (coupons[i].status==""){
      unUseTmp.push(coupons[i]);
      unUseableNetCouponTmp.push(res[i]);
    }else{
      useTpm.push(coupons[i]);
      useableNetCouponTmp.push(res[i]);
    }
  }

  coupons = useTpm.concat(unUseTmp);
  res = useableNetCouponTmp.concat(unUseableNetCouponTmp);
  _this.setData({
    localCoupons: coupons,
    netCoupons:res,
  });
}
  //转换网络数据到本地数据显示---end

  //计算优惠券优惠金额--begain
function calcCountDiscount (_this){
  const { selectedCoupons } = _this.data;
  var couponDiscount = 0;
  selectedCoupons.forEach(function(item){
    couponDiscount = couponDiscount + item.mold.reduceFee;
  });
  _this.setData({
    couponDiscount
  });
  }
   //计算优惠券优惠金额--end
