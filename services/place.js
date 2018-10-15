const { SellerID, ApiRootUrl, MpAppID } = wx.getExtConfigSync()
const util = require('../utils/util.js');

const url = `${ApiRootUrl}/sc/v1/sellers/${SellerID}/places`;

//临时key
let place = wx.getStorageSync('tmp_place');

function update(id) {
	console.log('place getDetail');
	return util.request(url + '/' + id).then(res=>{
		place = res.data;
		wx.setStorageSync('tmp_place', place);
		return place;
	});
}

function remove(){
	wx.removeStorageSync('tmp_place');
	place = null;
}

function get(){
	return place;
}

module.exports = {
	update,
	get,
	remove
}
