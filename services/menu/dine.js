const shopMgr = require('../shop.js');
const activityMgr = require('../activity.js');
const qrCodeMgr = require('../qrcode.js');
const placeMgr = require('../place.js');
const auth = require('../auth.js');

let place;
let shop;
let activity;
let config;

let onShopChange;
let onActivityChange;

let isCycle = false;

function handleOptions(options){
	place = placeMgr.get()
	if (options.qrCodeId) {
		return qrCodeMgr.getDetail(options.qrCodeId).then(res=>{
			return handleQrCode(res.data);
		});
	}else if (options.activityId) {
		return handleActivity(options.activityId);
	}else if (place) {
		return handlePlace();
	}else{
		return handleShop();
	}
}

function handleOnUnload(){
	isCycle = false;
	place = null;
	shop = null;
	activity = null;
	config = null;
	onShopChange = null;
	onActivityChange = null;
}

function handleOnHide(){
	isCycle = false;
	onShopChange = null;
	onActivityChange = null;
}

function handleOnShow(){
	isCycle = true;
	handleCycleUpdateActivity();
}

function handleScan(){
	return qrCodeMgr.scan().then(res=>{
		return handleQrCode(res.data);
	})
}

function handleQrCode(qr){
	return updatePlace(qr.target.id).then(()=>{
		return handlePlace();
	});
}

function handleActivity(id){
	return updateActivity(id).then(()=>{
		if (activity) {
			return updatePlace(activity.place.id).then(()=>{
				return updateShop(place.shop.id);
			});
		}
	});
}

function handlePlace(){
	return updateShop(place.shop.id).then(()=>{
		return updateActivity();
	});
}

function handleShop(){
	return updateShop();
}

function handleLeave(){
	return leaveActivity().then(()=>{
		placeMgr.remove();
		updateShop();
	});
}

function handleCycleUpdateActivity(){
	setTimeout(()=>{
		console.log('handleCycleUpdateActivity');
		if (activity && config.isShare) {
			updateActivity(activity.id);
		}
		if (isCycle) {
			handleCycleUpdateActivity();
		}
    },3000);
}

//func -----------------------------------------
function bindOnShopChange(func){
	onShopChange = func;
	if (shop) {
		updateShop(shop.id);
	}
}
function bindOnActivityChange(func){
	onActivityChange = func;
	if (activity) {
		updateActivity(activity.id);
	}
}

//place ----------------------------------------
function updatePlace(id) {
	return placeMgr.update(id).then(placeTmp=>{
		if (!place || placeTmp.id != place.id) {
			if (place) {
				leaveOldActivity(place.id);
			}
			place = placeTmp;
		}
	});
}

function getPlace(){
	return place;
}

function leavePlace(){
	place = null;
	placeMgr.remove();
}

//activity -------------------------------------
//保证（shop，config，place）或者id 值有效才能调
function updateActivity(id) {
	if (id) {
		return activityMgr.getDetail(id).then(res=>{
			if (res.data.status == 'CLOSED') {
	            leavePlace();
			}
			setActivity(res.data);
			return res.data;
		})
	}else {
	    var start = new Date().setHours(0,0,0);
	    var end = new Date().setHours(23,59,59);
	    return activityMgr.getList({
	      "status":"CREATED,PUBLISHED",
	      "type":'DINE',
	      "shopId": place.shop.id,
	      "placeId": place.id,
	      "createdTimeGte": start,
	      "createdTimeLt": end
	    }).then(res=>{
	      var activityTmp;
	      if (res.data.length > 0) {
	        if (config.isShare) {
	          activityTmp = res.data[0];
	        }else{
	          var uid = auth.getUserInfo().user.id;
	          res.data.some(v=>{
	            if (v.owner.id == uid) {
	              activityTmp = v;
	              return true;
	            }
	          });
	        }
	      }
	      if (activityTmp) {
	        var hasSelf = false;
	        activityTmp.actors.some(actor=>{
	          if (actor.id == auth.getUserInfo().user.id) {
	            hasSelf = true;
	            return true;
	          }
	        });
	        if (hasSelf) {
	        	setActivity(activityTmp);
	        	return activityTmp;
	        }else{
	          return activityMgr.join(activityTmp.id).then(res=>{
	          	setActivity(res.data);
	          	return res.data;
	          });
	        }
	      }else{
	        return activityMgr.create({
	          "type": 'DINE',
	          "shopId": place.shop.id,
	          "placeId": place.id,
	        }).then(res=>{
	        	setActivity(res.data);
	        	return res.data;
	        });
	      }
	    });
	}
}

function leaveActivity(){
	return activityMgr.leave(activity.id).then(res=>{
		wx.showToast({
	        title: '已离开活动'
		});
		setActivity();
	});
}

//离开桌台的活动
function leaveOldActivity(placeId){
	activityMgr.getJoinList({
        "status":"CREATED,PUBLISHED",
        "type":'DINE',
        placeId,
	}).then(res=>{
        res.data.forEach(act=>{
          activityMgr.leave(act.id);
        });
	});
}

function setActivity(obj){
	activity = obj;
	if (onActivityChange) {
		onActivityChange(activity);
	}
}

function getActivity(){
	return activity;
}

//shop -----------------------------------------

function updateShop(id) {
	if (id) {
		return shopMgr.getDetail(id,{
			append:"dine_config"
		}).then(res => {
			setShop(res.data);
		});
	}else{
		return shopMgr.getNearList({
			pageNum: 1,
			pageSize: 1,
			append: "dine_config"
	    }).then(function (res) {
			if (res.data[0]) {
				setShop(res.data[0]);
			}else{
				wx.showModal({
	              title: '提示',
	              content: '暂无门店',
	              showCancel:false,
	            });
	            setShop();
			}
	    });
	}
}

function setShop(obj){
	shop = obj;
	updateConfig();
	if (onShopChange) {
		onShopChange(shop);
	}
}

function getShop(){
	return shop;
}

//config -----------------------------------

function getConfig(){
	return config;
}

function updateConfig(){
	config = shop.dineConfig;
	if (!config) {
		config = {};
	}
	if (!config.enabled) {
	  config.isShared = false;
	  config.isActorsNumRequired = false;
	  config.isDineOut = false;
	}
}

// -----------------------------------
module.exports = {
	handleOptions,
	handleOnUnload,
	handleOnHide,
	handleOnShow,
	handleScan,
	handleLeave,
	bindOnShopChange,
	bindOnActivityChange,
	getConfig,
	getPlace,
	updateActivity,
	updateShop,
	leavePlace
}

