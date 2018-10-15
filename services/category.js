const { SellerID,ApiRootUrl,version } = wx.getExtConfigSync();
const util = require('../utils/util.js');

const url = `${ApiRootUrl}/sc/v1/sellers/${SellerID}/catalogs`


function getList(data) {
	data.sort = 'order,desc';
	data.scopeType = 'VINCI_SC_SHOP';
	data.pageNum = 1;
	data.pageSize = 1000;
	return util.request(url, data);
}

module.exports = {
	getList
}
