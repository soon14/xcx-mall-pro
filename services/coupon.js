const { SellerID, ApiRootUrl, MpAppID } = wx.getExtConfigSync()
const util = require('../utils/util.js');
const auth = require('./auth.js');

const url = ApiRootUrl + '/sc/v1/sellers/' +SellerID + '/coupons';

function getList(data){
	if (!data) {
		data={};
	}
	data.userId = auth.getUserInfo().user.id;
	return util.request(url, data);
}

module.exports = {
	getList,
}
