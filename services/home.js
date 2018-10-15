
const showScenes = [1011, 1012, 1013, 1014, 1047, 1048, 1049, 1036];//需显示按钮场景值

let isShow = false;

//处理进入小程序场景
function handleShowScene(scene) {
	isShow = showScenes.indexOf(scene) >= 0;
}

//进入首页相关页面时，隐藏按钮
function ignore() {
	isShow = false;
}

//进入肯定会显示的页面时，显示按钮
function focus() {
	isShow = true;
}

//获取是否需要显示按钮
function getIsShow() {
	return isShow;
}

module.exports = {
	handleShowScene,
	ignore,
	focus,
	getIsShow,
};
