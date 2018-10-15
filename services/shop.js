const { SellerID,ApiRootUrl,version } = wx.getExtConfigSync();
const util = require('../utils/util.js');
const location = require('./location.js');

const url = `${ApiRootUrl}/sc/v1/sellers/${SellerID}/shops`

//获取门店详情
function getDetail(id,data) {
	console.log('shop getDetail');
	return util.request(url + '/' + id, data);
}

//获取门店列表
function getList(data) {
	console.log('shop getList');
	if (!data) {data = {};}
	data.status = 'PUBLISHED';
	return util.request(url, data);
}

function getNearList(data) {
	console.log('shop getNearList');
	if (!data) {data = {};}
	data.status = 'PUBLISHED';
	return location.update().then(info=>{
		data.longitude = info.longitude;
		data.latitude = info.latitude;
		return util.request(url, data);
	}).catch(err=>{
		return util.request(url, data);
	});
}

module.exports = {
	getDetail,
	getList,
	getNearList
}
