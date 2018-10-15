// const shopMgr = require('../shop.js');
// const activityMgr = require('../activity.js');
const addressMgr = require('../address.js');
// const placeMgr = require('../place.js');
// const auth = require('../auth.js');

let address = null;
let addressList = null;


// address --------------------------------------

function getChoiceAddress () {
	return address;
}

function setChoiceAddress (obj) {
	address = obj;
}

module.exports = {
	getChoiceAddress,
	setChoiceAddress,
}
