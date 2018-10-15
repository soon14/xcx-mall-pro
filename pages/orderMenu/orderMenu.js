const util = require('../../utils/util.js');
const qianbao = require('../../config/qianbao.js');
const workspace = require('../../config/workspace.js');
const auth = require('../../services/auth.js');
const home = require('../../services/home.js');
const activityMgr = require('../../services/activity.js');
const categoryMgr = require('../../services/category.js');
const menu = require('../../services/menu/menu.js');
const dineMgr = require('../../services/menu/dine.js');
const shopMgr = require('../../services/shop.js');
const mta = require('../../utils/mta.js');
const extConfig = wx.getExtConfigSync? wx.getExtConfigSync(): {}
const app = getApp();

Page({
  data: {

    navList: [],//分类栏数据
    goodsList: [],//商品数据
    totle:0,//总金额
    totleLength:0,//总数量
    dineList:[],//购物车数据
    navname: "",

    shop:null,
    activity:null,
    place:null,

    mainColor:extConfig.mainColor,
    cataType: extConfig.cataType || 3,

    isShare:false,

    pageNum:1,
    pageSize:20,
    isLoadinng:false,
    noMoreData:false,

    //动画
    animationData:null,
    previewAnimationData:null,
    modelAnimation:null,
    modelbgAnimation:null,

    //弹框 购物车
    isShow:false,

    //弹框 选择规格属性
    showAddParam:false,
    param:{},

    //选择
    productTmp:{},//当前菜品
    currentCategory: {},//当前分类
    
    //授权
    isAuth: false,
  },

  goUsers(){
    wx.navigateTo({
      url: '/pages/userList/userList?id=' + this.data.activity.id,
    });
  },

  addPage(){
    if (this.data.isLoadinng || this.data.noMoreData) return
    this.setData({
      pageNum:this.data.pageNum + 1
    })
    this.getCurrentGoods(this.data.currentCategory.id)
  },

  leave() {
    wx.showModal({
      title: '',
      content: '确定要放弃点餐？',
      success: res=> {
        if (res.confirm) {
          dineMgr.handleLeave();
        }
      }
    })
    return false;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let promise = [];
    if (this.data.activity) {
      promise.push(dineMgr.updateActivity(this.data.activity.id));
    }
    if (this.data.shop) {
      promise.push(dineMgr.updateShop(this.data.shop.id));
    }
    if (promise[0]) {
      Promise.all(promise).then(res=>{
        wx.stopPullDownRefresh();
      }).catch(err=>{
        wx.stopPullDownRefresh();
      })
    }else{
      wx.stopPullDownRefresh();
    }
  },

  onShareAppMessage: function () {
    var user = auth.getUserInfo().user;
    var path = '/pages/orderMenu/orderMenu';
    if (this.data.activity.id) {
      path = path + '?activityId=' + this.data.activity.id;
    }
    return {
      title: user.nickName + '邀请您共同点餐',
      desc: user.nickName + '邀请您共同点餐',
      path
    }
  },

  onShopChange(shop){
    if (shop) {
      const config = dineMgr.getConfig();
      this.setData({
        shop,
        isShare : config.isShared
      });
      this.getCatalog(shop.id);
    }else{
      this.setData({
        shop:null,
        isShare : false
      });
    }
  },

  onActivityChange(activity){
    if (activity) {
      const place = dineMgr.getPlace();
      this.setData({
        activity,
        place
      });
      this.handleActivity(activity);
    }else{
      this.setData({
        activity:null,
        place:null,
        dineList:[],
        isShow:false
      });
    }
  },

  onLoad: function (options) {
    mta.initPage();
    dineMgr.handleOptions(options).catch(err=>{
      wx.showToast({
        title: err.message,
        icon: 'none',
        duration: 2000
      })
    });
  },

  //获取分类
  getCatalog(shopid) {
    this.setData({
      navList: [],
      goodsList: [],
      pageNum: 1,
      noMoreData: false
    })
    let _this = this;
    categoryMgr.getList({
      type:"DISH",
      scopeId:shopid
    }).then(function (res) {
      if (res.data[0]) {
        _this.setData({
          navList: res.data,
          currentCategory: res.data[0],
          navname:res.data[0].name
        });
        _this.updateNavList();
        _this.getCurrentGoods(res.data[0].id);
      }
    });
  },

  removeItem(e){
    var item = e.currentTarget.dataset.item;
    this.remove(item);
  },

  removeProduct(e){
    var product = e.currentTarget.dataset.item;
    if (product.hasParam) return;
    var tmp = this.generateItemInfo(product);
    this.remove(tmp);
  },

  addItem(e){
    var item = e.currentTarget.dataset.item;
    this.add(item);
  },

  addProduct(e){
    if (!this.data.activity) {
      var that = this
      wx.showModal({
        title: '提示',
        confirmText:'扫码',
        content: '请扫描餐桌小程序码点餐',
        success: function(res) {
          if (res.confirm) {
            dineMgr.handleScan().catch(err=>{
              wx.showToast({
                title: err.message || '扫码失败',
                icon: 'none',
                duration: 2000
              })
            });
          }
        }
      });
      return;
    }
    var product = e.currentTarget.dataset.item;
    
    if (product.hasParam) {
      let param = menu.getParamInfo(product);
      
      this.setData({
        param,
        productTmp:product,
      });
      this.showToast();
      return;
    }else{
      var tmp = this.generateItemInfo(product);
      this.add(tmp);
    }
  },

  addParamFinish(){
    var product = this.data.productTmp;
    var item = this.generateItemInfo(product);
    this.add(item);
    this.hideToast();
  },

  add(item){
    var _this = this;
    menu.addItem(this.data.activity, item).then(activity=>{
      _this.handleActivity(activity);
    });
  },
  
  remove(item){
    var _this = this;
    menu.removeItem(this.data.activity, item).then(activity=>{
      _this.handleActivity(activity);
    });
  },

  clearMenuList(){
    var dineList = [];
    this.setData({
      dineList,
    });
    this.updateNavList();
    this.updateGoodsList();
    activityMgr.clearItem(this.data.activity.id);
    this.calculateTotal();
    this.hide();
  },

  calculateTotal(){
    let result = menu.calculateMenu(this.data.dineList);
    this.setData({
      totle : result.price,
      totleLength : result.number
    })
  },

  share(){
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  submit(){
    if (!this.data.shop.dineConfig.enabled) {
      wx.showToast({
                icon: 'none',
                title: '当前店铺点餐功能已关闭',
                mask: true
              });
      return;
    }
    if (this.data.dineList.length == 0) return
    wx.navigateTo({
      url: '/pages/preSubmit/preSubmit?id=' + this.data.activity.id,
    });
  },

  getCurrentGoods (id) {
    this.setData({
      isLoadinng:true
    });
    util.request(qianbao.Url_Products, {
      catalogId: id,
      shopId: this.data.shop.id,
      append:'goods_list',
      sort:'order,desc',
      type: 'DISH',
      status: 'ON,SOLD_OUT',
      tagCode: "dine-product",
      pageNum:this.data.pageNum,
      pageSize:this.data.pageSize,

    }).then(res=>{
      var tmp = res.data.map(v=>{
        v.hasParam = v.attrs[0] || v.specs[0];
        return v;
      });
      var goodsList = this.data.goodsList.concat(tmp);
      this.setData({
        goodsList,
        isLoadinng:false,
        noMoreData: res.data.length < this.data.pageSize
      });
      this.updateGoodsList();
      // wx.hideLoading();
    });
  },

  updateGoodsList(){
    this.setData({
      goodsList : menu.updateProductList(this.data.goodsList, this.data.dineList)
    });
  },

  updateNavList(){
    this.setData({
      navList : menu.updateCatalogList(this.data.navList, this.data.dineList)
    });
  },

  handleActivity(activity){
    /////////
    if (activity.id) {
      this.setData({activity});
    }

    if (activity.status == 'CLOSED') {
      wx.showModal({
        title: '提示',
        content: '点餐已结束，请重新扫描二维码',
        showCancel:false,
      });
      this.setData({activity:null});
    }else if (activity.status === 'PUBLISHED') {
      wx.showToast({
        title: '当前订单正在付款',
        icon: 'none',
        duration: 2000
      });
      wx.navigateTo({
        url: '/pages/preSubmit/preSubmit?id=' + activity.id,
      });
    }
     
    let dineList = menu.getMenuList(activity);
    this.setData({dineList});//设置购物车数据

    if (dineList.length == 0) {
      this.hide()
    }

    this.updateGoodsList();
    this.updateNavList();

    this.calculateTotal();
  },

  onReady: function () {
    // 页面渲染完成
  },

  onShow: function () {
    // 页面显示
    home.ignore();
    this.setData({
      isAuth: auth.isAuth()
    });

    dineMgr.bindOnShopChange(this.onShopChange);
    dineMgr.bindOnActivityChange(this.onActivityChange);
    dineMgr.handleOnShow();
  },
  
  onHide: function () {
    dineMgr.handleOnHide();
    // 页面隐藏
  },
  
  onUnload: function () {
    // 页面关闭
    dineMgr.handleOnUnload();
  },

  switchCate(event) {
    var that = this;
    var currentTarget = event.currentTarget;
    if (this.data.currentCategory.id == event.currentTarget.dataset.id) {
      return false;
    }
    
    for (var i = 0; i < that.data.navList.length; i++) {
      if (that.data.navList[i].id == event.currentTarget.dataset.id ) {
        that.setData({
          currentCategory: that.data.navList[i],
          navname: that.data.navList[i].name
        });
        break;
      }
    }
    this.setData({
      goodsList:[],
      pageNum:1,
      noMoreData:false
    })
    this.getCurrentGoods(event.currentTarget.dataset.id);
  },

//弹框选择规格属性
  choiceParam(e){

    const type = e.currentTarget.dataset.type;
    const idx = e.currentTarget.dataset.idx;
    const v_idx = e.currentTarget.dataset.v_idx;
    const param = menu.choiceParam(this.data.param, type, idx, v_idx);
    this.setData({
      param
    })
  },

  generateItemInfo(product){
    return menu.getItemInfo(product, this.data.param, this.data.dineList);
  },

//动画
  showPreviewAnimate(){  
    /* 动画部分 */  
    // 第1步：创建动画实例   
    var animation1 = wx.createAnimation({  
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });
    var animation2 = wx.createAnimation({  
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });
      
    animation2.opacity(1).step();
    this.setData({previewAnimationData:animation2})

    animation1.scale(1.1).step();  
    this.setData({animationData: animation1.export()})
      
    setTimeout(() => {  
      animation1.scale(1).step();  
      this.animationData = animation1  
      this.setData({animationData: animation1})
    }, 200)
  },
  
  hidePreviewAnimate(){
    var animation1 = wx.createAnimation({  
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });  
    var animation2 = wx.createAnimation({  
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });
    animation2.opacity(0).step();
    this.setData({previewAnimationData:animation2})

    animation1.scale(1.1).step();  
    this.setData({animationData: animation1.export()})
      
    setTimeout(() => {  
      animation1.scale(1).step();  
      this.animationData = animation1  
      this.setData({animationData: animation1})
    }, 200)  
  },

//显示隐藏弹框
  hideToast(e){
    this.hidePreviewAnimate()
    setTimeout(()=>{
      this.setData({
        showAddParam:false,
      })
    },400);
  },
  showToast(e){
    this.setData({
      showAddParam:true,
    })
    this.showPreviewAnimate();
  },
  showList(){
    if (this.data.dineList.length == 0) {
      return;
    }
    this.data.isShow ? this.hide() : this.show();
  },
  show(){
    this.setData({
      isShow: true
    })
    var modelAnimation = wx.createAnimation({  
      duration: 400,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });  
    var modelbgAnimation = wx.createAnimation({  
      duration: 400,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });  
    modelbgAnimation.opacity(1).step();
    this.setData({modelbgAnimation})
    modelAnimation.bottom(0).step();  
    this.setData({modelAnimation})
  },
  hide(){
    var modelAnimation = wx.createAnimation({  
      duration: 400,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });
    var modelbgAnimation = wx.createAnimation({  
      duration: 400,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });  
    modelbgAnimation.opacity(0).step();
    this.setData({modelbgAnimation})
    modelAnimation.bottom('-100%').step();  
    this.setData({modelAnimation})
    setTimeout(()=>{
      this.setData({
        isShow: false
      })
    },400)
  },

  bindGetUserInfo(e){
    var _this = this;
    if (e.detail.userInfo){
      wx.showLoading();
      auth.authLogin().then(res=>{
        _this.setData({
          isAuth:true,
        });
        wx.hideLoading();
      }).catch(err=>{
        wx.hideLoading();
      });
    }
  },

})