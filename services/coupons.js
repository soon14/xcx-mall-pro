const util = require('../utils/util.js');

const qianbao = require('../config/qianbao.js');

const { SellerID, ApiRootUrl, version } = wx.getExtConfigSync()

const url_activity = ApiRootUrl + '/sc/v2/sellers/' + SellerID + '/activities';
const url_participant = ApiRootUrl + '/sc/v1/sellers/' + SellerID + '/participants';
const url_coupon_mode = ApiRootUrl + '/sc/v1/sellers/' + SellerID + '/coupon-molds';
const url_coupon = ApiRootUrl + '/sc/v1/sellers/' +SellerID + '/coupons';
const url_sendCoupon = ApiRootUrl + '/sc/v1/sellers/' + SellerID + '/me/participants'

function queryActivty(data) {
  return util.request(url_activity, data, "GET");
}

function queryParticipant(data) {
  return util.request(url_participant, data, "GET");
}

function queryActivityDetail(id, data) {
  return util.request(url_activity + '/' + id, data, "GET");
}

function queryCouponDetail(id) {
  return util.request(url_coupon_mode + '/' + id, "GET");
}

function createCoupon(data) {
  return util.request(url_sendCoupon, data, "POST");
}

function queryUserCoupons(data) {
  return util.request(url_coupon, data, "GET");
}

module.exports = {

  queryActivty,
  queryParticipant,
  queryActivityDetail,
  queryCouponDetail,
  createCoupon,
  queryUserCoupons,
}