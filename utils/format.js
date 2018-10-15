
//////////////////////////////////////////////////////

Date.prototype.format = function(fmt)   
{ //author: meizz   
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;
}

//////////////////////////////////////////////////////

//date ==========================================

function pastTime(time) {
	let sub = (new Date().getTime() - time) / 1000;
	if (sub < 0) {
		return '未来';
	}else if (sub < 60) {
		return '现在';
	}else if (sub < (60*60)) {
		return Math.floor(sub/60) + '分钟前';
	}else if (sub < (60*60*24)) {
		return Math.floor(sub/60/60) + '小时前';
	}else if (sub < (60*60*24*4)) {
		return Math.floor(sub/60/60/24) + '天前';
	}else{
		return new Date(time).format('yyyy-MM-dd hh:mm:ss');
	}
}

//distance ==========================================

function distance(m){
	if (m < 1000) {
		return m + 'm';
	}else{
		return Math.floor(m/1000) + 'km';
	}
}


//////////////////////////////////////////////////////

module.exports = {
	pastTime,
	distance
}

