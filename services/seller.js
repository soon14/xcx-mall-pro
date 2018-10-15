const { SellerID,ApiRootUrl,version } = wx.getExtConfigSync();
const util = require('../utils/util.js');
const cache = require('../utils/cache.js');

const url = `${ApiRootUrl}/sc/v1/sellers/${SellerID}`

let seller = cache.get('vinci_seller');

//获取Seller详情
function getDetail() {
	if (cache.validInDay('vinci_seller')) {
		return Promise.resolve(seller);
	}else{
		return util.request(url).then(res=>{
			console.log('seller getDetail');
			cache.set('vinci_seller', res.data)
			seller = res.data;
			return seller;
		});
	}
}

module.exports = {
	getDetail
}
