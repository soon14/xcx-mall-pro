const { SellerID, ApiRootUrl, MpAppID } = wx.getExtConfigSync();
const req = require('../utils/request.js');
const cache = require('../utils/cache.js');
const url_bindTel = ApiRootUrl + '/sc/' + 'v1' + '/sellers/' + SellerID + '/me/wx/miniapp/bind-phone';

let userInfo = cache.get('vinci_userInfo');

//初始化
function init(){
	autoLogin();
}

//是否授权
function isAuth() {
	return !!(userInfo && userInfo.wx);
}

//自动登录
function autoLogin() {
	return req.autoLogin().then(res=>{
			let info = res.data.member;
			userInfo = info;
			wx.setStorageSync('vinci_userInfo',info);
			return res;
		});
}

//授权登录
function authLogin(){
	if (cache.validInDay('vinci_userInfo')) {
		return Promise.resolve(userInfo);
	}else{
		return req.authLogin().then(res=>{
			let info = res.data.member;
			userInfo = info;
			cache.set('vinci_userInfo',info);
			return info;
		});
	}
}

//接口处理  ------------------------------------------------------------

//绑定手机
function bindTel(wxInfo){
	return req.request(url_bindTel,{ encryptedData : wxInfo.encryptedData,  iv : wxInfo.iv }, 'POST').then(res=>{
			let uInfo = res.data;
			return uInfo;
		});
}

//微信API ---------------------------------------------------------------

//微信API验证登录是否有效 
function wxCheckSession() {
	return new Promise((resolve, reject)=>{
		wx.checkSession({
			success: resolve,
			fail: reject
		})
	});
}

function wxGetSetting() {
	return new Promise((resolve, reject)=>{
		wx.getSetting({
			success: res=>{
				resolve(res.authSetting);
			},
			fail: reject
		})
	});
}

//set get --------------------------------------------------------------

function getUserInfo () {
	return userInfo;
}

//  --------------------------------------------------------------------
module.exports= {
	init,
	isAuth,
	authLogin,
	bindTel,
	getUserInfo
}
