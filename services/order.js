const { SellerID, ApiRootUrl, MpAppID } = wx.getExtConfigSync()
const util = require('../utils/util.js');
const shopMgr = require('./shop.js');
const auth = require('./auth.js');

const url = ApiRootUrl + '/sc/' + 'v1' + '/sellers/' + SellerID + '/me/orders'
const url_tc = ApiRootUrl + '/tc/v1/me/orders/';

//支付
function pay(shopId, id, data){
	return shopMgr.getDetail(shopId, {append:'pay_config'}).then(res => {
    let info = [];
    if (!data) { data = {} };
    let {couponId, amount} = data;
    if (couponId) {
      info.push(getCouponPayInfo(couponId));
    }
    if (!(couponId && amount == 0)) {
      if (res.data.payConfig.useQBPay) {
        console.log('order pay qb ' + JSON.stringify(data));
        info.push(getQBPayInfo(amount));
      }else{
        console.log('order pay wx ' + JSON.stringify(data));
        info.push(getWXPayInfo(amount));
      }
    }
    return util.request(url + '/' + id + '/pay', info , 'POST');
	});
}

//取消订单
function cancel(id, data){
  console.log('order cancel');
  return util.request(url_tc + id + "/cancel", data, "PUT");
}

//获取订单列表
function getList(data){
  if (!data) {
    data={};
  }
  data.buyerId = auth.getUserInfo().user.id;
  data.sellerId = SellerID;
  return util.request(url , data);
}

//获取订单详情
function getDetail(id, data) {
  return util.request(url + '/' + id, data);
}

//get set  ------------------------------------------------------------
function getWXPayInfo(amount){
  let info = {
    payType : 10,
    wx : {
      appId : MpAppID,
      type : 'MINI_APP'
    }
  }
  if (amount) {
    info.wx.amount = amount;
  }
  return info;
}

function getQBPayInfo(amount){
  let info = {
    payType : 60,
    qb : {
      wxMiniAppId : MpAppID,
    }
  }
  if (amount) {
    info.qb.amount = amount;
  }
  return info;
}

function getCouponPayInfo(id){
  return {
    payType : 81,
    coupon : {
      id
    }
  };
}

//  ------------------------------------------------------------
module.exports = {
	pay,
  cancel,
  getList,
  getDetail
};
