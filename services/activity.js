const { SellerID,ApiRootUrl,version } = wx.getExtConfigSync();
const util = require('../utils/util.js');

const url = ApiRootUrl + '/sc/' + 'v2' + '/sellers/' + SellerID + '/activities'
const url_me = ApiRootUrl + '/sc/' + 'v2' + '/sellers/' + SellerID + '/me/activities'


//参与活动
function getJoinList(data){
	console.log('activity getJoinList');
	return util.request(url_me + '?role=owner', data);
}

//活动详情
function getDetail(id){
	console.log('activity getDetail');
	return util.request(url + '/' + id);
}

//活动列表
function getList(data){
	console.log('activity getList');
	return util.request(url, data);
}

//创建活动
function create(data){
	console.log('activity create');
	return util.request(url, data, 'POST');
}

//更新活动
function update(id, data){
	console.log('activity update');
	return util.request(url + '/' + id, data , 'PUT');
}

//参加活动
function join(id){
	console.log('activity join');
	return util.request(url + '/' + id + '/join', {} , 'POST');
}

//离开活动
function leave(id){
	console.log('activity leave');
	return util.request(url + '/' + id + '/leave', {} , 'DELETE');
}

//添加活动内容
function addItem(id, data){
	console.log('activity addItem');
	return util.request(url + '/' + id + '/items', data , 'POST');
}

//删除活动内容
function removeItem(id, data){
	console.log('activity removeItem');
	return util.request(url + '/' + id + '/items/' + data.id, {} , 'DELETE');
}

//更新活动内容
function updateItem(id, data){
	console.log('activity updateItem');
	return util.request(url + '/' + id + '/items/' + data.id, data , 'PUT');
}

//清空活动内容
function clearItem(id){
	console.log('activity clearItem');
	return util.request(url + '/' + id + '/items' , {} , 'DELETE');
}

module.exports = {
	getJoinList,
	getDetail,
	getList,
	create,
	update,
	join,
	leave,
	addItem,
	removeItem,
	updateItem,
	clearItem
};


