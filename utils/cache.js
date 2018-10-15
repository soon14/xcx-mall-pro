
//当日缓存数据 -----------------------------------
const tmp = wx.getStorageSync('cache_day');
let day = tmp ? tmp : {};
const date = new Date().toLocaleDateString();

function init(){
	if (!day[date]) {
		wx.removeStorageSync('cache_day');
		day[date] = [];
	}
}

function validInDay(key){
	return day[date].indexOf(key) >= 0;
}

function get(key){
	return	wx.getStorageSync(key);
}

function set(key, value) {
	if (value) {
		wx.setStorageSync(key, value);
		if (day[date].indexOf(key) < 0) {
			day[date].push(key);
		}
		wx.setStorageSync('cache_day', day);
	}else{
		wx.removeStorageSync(key);
		const idx = day[date].indexOf(key);
		if (idx >= 0) {
			day[date].splice(idx, 1);
		}
		wx.setStorageSync('cache_day', day);
	}
}

module.exports = {
	init,
	get,
	set,
	validInDay,
}


