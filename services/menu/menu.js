const activityMgr = require('../activity.js');
const categoryMgr = require('../category.js');
let isEditing = false;

//获取菜单列表
function getMenuList(activity) {
  let menuList = activity.items.map(item=>{
    item.product = JSON.parse(item.metadata.oraginItem);
    item.metadata.price = parseInt(item.metadata.price);
    item.metadata.number = parseInt(item.metadata.number);
    item.metadata.hasParam = item.metadata.hasParam == 'true'
    return item;
  });
  return menuList;
}

//获取商品的规格属性信息
function getParamInfo(product){
  let attrs = product.attrs.map((v,i)=>{
    v.choiceIndex = 0;
    return v;
  });
  let goodsList = product.goodsList ? product.goodsList:[];
  let norms = [];
  let price = product.price;
  goodsList.forEach(function(value,idx){
    value.specs.forEach(function(v,i){
      let isFirst = !norms[0];
      if (isFirst) {
        price = value.price;
      }
      norms.push({ 
        name: v.name, 
        price: value.price, 
        sid: v.sid,
        gid: value.id,//goodsid
        isChoiced:isFirst,
      });
    });
  });
  return {attrs, norms, price};
}

//选择商品规格属性
function choiceParam(param, type, idx, v_idx){
  if (type == 'attr') {
    let attr = param.attrs[idx];
    attr.choiceIndex = v_idx;
    param.attrs[idx] = attr;
  }else if (type == 'norm') {
    let norms = param.norms.map((v,i)=>{
      v.isChoiced = (i == v_idx);
      if (v.isChoiced) {
        param.price = v.price;
      }
      return v;
    });
    param.norms = norms;
  }
  return param;
}

//获取
function getItemInfo(product, param, menuList){
  let info = {
    "name": product.name,
    "metadata": {
      id: product.goodsList[0].id,
      gid: product.goodsList[0].id,
      url:product.media[0].url,
      price:product.price,
      number:0,
      hasParam:false,
      oraginItem:JSON.stringify(product)
    }
  };
  if (product.hasParam) {
    info.metadata.hasParam = true;
    param.norms.some(v=>{
      if (v.isChoiced) {
        info.metadata.gid = v.gid;
        info.metadata.norm = v.name;
        info.metadata.price = v.price;
        return true;
      }
    });
    let attr = '';
    param.attrs.forEach(v=>{
      if (attr.length>0) {
        attr = attr + '|' + v.values[v.choiceIndex];
      }else{
        attr = v.values[v.choiceIndex];
      }
    });
    info.metadata.attr = attr;
    info.metadata.id = info.metadata.gid + '|' + attr;
  }
  info.product = product;
  menuList.some(v=>{
    if (v.metadata.id == info.metadata.id) {
      info.id = v.id;
      info.metadata.number = v.metadata.number;
      return true;
    }
  });
  return info;
}

function addItem (activity, item) {
	if (isEditing) {
		return Promise.reject("editing");
	}
	isEditing = true;
  item.metadata.number += 1;
  if (item.metadata.number == 1) {
    return activityMgr.addItem(activity.id,item).then(res=>{
      isEditing = false;
      return res.data;
    }).catch(err=>{
    	isEditing = false;
    	return Promise.reject(err);
    });
  } else {
    return updataItem(activity, item);
  }
}

function removeItem(activity, item){
  if (item.metadata.number == 0 || isEditing) {
  	return Promise.reject("editing");
  }
  isEditing = true;
  item.metadata.number -= 1;
  if (item.metadata.number == 0) {
    return activityMgr.removeItem(activity.id,item).then(res=>{
      isEditing = false;
      return res.data;
    }).catch(err=>{
      isEditing = false;
      return Promise.reject(err);
    });
  } else {
    return updataItem(activity, item);
  }
}

function updataItem(activity, item){
  return activityMgr.updateItem(activity.id,item).then(res=>{
  	isEditing = false;
  	return res.data;
  }).catch(err=>{
  	isEditing = false;
  	return Promise.reject(err);
  });
}

function calculateMenu(menuList) {
  let price = 0, number = 0;
  menuList.forEach(v=>{
    price += v.metadata.price * v.metadata.number;
    number += v.metadata.number;
  });
  return {price, number};
}

function updateProductList(productList, menuList){
  return productList.map(v=>{
    let hasNew = false;
    let hasHot = false;
    v.tags.forEach(tag=>{
      if (tag.code == 'fresh-product') {
        hasNew = true;
      }else if (tag.code == 'hot-product') {
        hasHot = true;
      }
    });
    v.hasNew = hasNew;
    v.hasHot = hasHot;
    v.number = 0;
    menuList.forEach(item=>{
      if (item.product.id == v.id) {//计算商品选择数量
        v.number += item.metadata.number;
      }
    });
    return v;
  });
}

function updateCatalogList(catalogList, menuList){
  return catalogList.map(v=>{
    v.number = 0;
    menuList.forEach(item=>{
      if (item.product.catalogs.some(catalog=>catalog.id == v.id)) {
        v.number += item.metadata.number;
      }
    });
    return v;
  });
}

module.exports = {
	getMenuList,
	getItemInfo,
  getParamInfo,
  choiceParam,
	addItem,
	removeItem,
	calculateMenu,
	updateProductList,
	updateCatalogList
}

