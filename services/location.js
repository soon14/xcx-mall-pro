
let location = {};//latitude longitude speed accuracy
let lastTime = 0;

function update () {
	const time = new Date().getTime() / 1000;
	//5分钟刷新一次
	if (time - lastTime <= 300) {
		return Promise.resolve(location);
	}else{
		return new Promise((resolve, reject) => {
			wx.getLocation({
		        type: 'wgs84',
		        success: function(res) {
		        	lastTime = time;
		        	location = res;
		        	resolve(location);
		        },
		        fail: function(err) {
		        	reject();
		        }
			});
		});
	}
}

module.exports = {
	update
}
