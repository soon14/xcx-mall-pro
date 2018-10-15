const { SellerID, ApiRootUrl, MpAppID } = wx.getExtConfigSync();
const util = require('../utils/util.js');

const url = `${ApiRootUrl}/sc/v1/sellers/${SellerID}/me/addresses`;

function getList(data){
	if (!data) {
		data={};
	}
	return util.request(url, data);
}

module.exports = {
	getList,
}
