const { SellerID, ApiRootUrl, MpAppID } = wx.getExtConfigSync()
const util = require('../utils/util.js');

const url = `${ApiRootUrl}/sc/v1/sellers/${SellerID}/qr-codes`;

function getDetail(id) {
	console.log('qrcode getDetail');
	return util.request(url + '/' + id);
}

function scan(){
	return new Promise((resolve, reject)=>{
		wx.scanCode({
			onlyFromCamera: true,
			success: (res) => {
			  if (res.path) {
			    var qrCodeId = res.path.split('qrCodeId=')[1];
			    getDetail(qrCodeId).then(res=>{
			    	resolve(res);
			    }).catch(err=>{
			    	reject(err);
			    });
			  } else {
			    reject({message:'扫码失败，二维码未知'})
			  }
			},
			fail:(err)=>{
			  reject(err)
			}
		});
	});
}

module.exports = {
	getDetail,
	scan
}
