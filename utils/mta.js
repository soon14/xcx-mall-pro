let mta = require('../lib/mta/mta_analysis.js');
let auth = require('../services/auth.js');

function initAPP(opt) {
	mta.App.init({
      "appID":"500633163",
      "eventID":"500633167", // 高级功能-自定义事件统计ID，配置开通后在初始化处填写
      "lauchOpts":opt, //渠道分析,需在onLaunch方法传入options,如onLaunch:function(options){...}
      "statPullDownFresh":true, // 使用分析-下拉刷新次数/人数，必须先开通自定义事件，并配置了合法的eventID
      "statShareApp":true, // 使用分析-分享次数/人数，必须先开通自定义事件，并配置了合法的eventID
      "statReachBottom":true // 使用分析-页面触底次数/人数，必须先开通自定义事件，并配置了合法的eventID
    });
    setUser();
}

function initPage() {
	mta.Page.init();
}

function setUser() {
	let openID;
	let userInfo = auth.getUserInfo();
	let phone = userInfo.phone;
	if (userInfo.wx && userInfo.wx.openId) {
		openID = userInfo.wx.openId;
	}
	mta.Data.userInfo = {'open_id': openID, 'phone': phone };
}

function event(id, data) {
	mta.Event.stat(id, data);
}

module.exports = {
	initAPP,
	initPage,
	event
}
