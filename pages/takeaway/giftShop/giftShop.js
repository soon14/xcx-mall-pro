const util = require('../../../utils/util.js');
const qianbao = require('../../../config/qianbao.js');
const workspace = require('../../../config/workspace.js');
const activityMgr = require('../../../services/activity.js');
const shopMgr = require('../../../services/shop.js');
const auth = require('../../../services/auth.js');
const mta = require('../../../utils/mta.js');
const extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
const app = getApp();

Page({
  data: {
    navList: [],
    id: "",
    currentId: "",
    goodsList: [],
    mainColor: "#434343",
    totle: '0',
    totleLength: '0',
    isShow: false,
    checkedList: [],
    checkedListNum: 0,
    activity: {},
    isPreviewing: false,
    currentPrewiewGoods: {},
    animationData: null,
    previewAnimationData: null,
    modelAnimation: null,
    modelbgAnimation: null,
    pageNum: 1,
    pageSize: 20,
    isLoadinng: false,
    noMoreData: false,
    shop: {},
    startFee: "0",
    maxDistance: "0",
    latitude: "",
    longitude: "",
    hasAddress: "",
    showName: '',
    //弹框 选择规格属性
    showAddParam: false,
    attrsTmp: [],
    normsTmp: [],
    priceTmp: '',
    itemTmp: {}, //选择item
    productTmp: {}, //当前菜品

    submitclick: "",
    submitcolor: "",
    submitname: "",
    mallShopCount: 0,
    deliveryType: ""
  },

  addPage() {
    if (this.data.isLoadinng || this.data.noMoreData) return
    this.setData({
      pageNum: this.data.pageNum + 1
    })
    this.getCurrentGoods();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    iwx.stopPullDownRefresh()
  },

  onShareAppMessage: function() {

  },
  onShow: function() {
    // 页面显示
    let that = this
    wx.getStorage({
      key: 'cleanShopcart',
      success: function(res) {
        console.log(res)
        if (res.data == "clean") {
          that.clearCheckList();
        }
      },
    })
    //获取商城门店的数目，数目变化了，则重新拉取门店接口
    shopMgr.getList({
      pageNum: that.data.pageNum,
      pageSize: that.data.pageSize,
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      append: "mall_config"
    }).then(function (res) {
      var shopCount = 0;
      for (var i = 0; i < res.data.length; i++) {
        if (res.data[i].mallConfig.enabled) {
          shopCount = shopCount + 1
        }
      }
      if (that.data.mallShopCount !== 0 && that.data.mallShopCount !== shopCount) {
        that.reloadData()
      }
    })

    //根据当前商城门店id判断当前外卖门店是否关闭，若关闭，则重新请求接口，获取最近的商城门店
    if (that.data.id) {
      shopMgr.getDetail(that.data.id, { append: "mall_config" }).then(function (res) {
        if (res.code === 0) {
          var shop = res.data
          if (!shop.mallConfig.enabled) {
            that.reloadData()
          } 
        }
      });
    }

    //shopId用于记录切换门店时的门店id，currentId当前门店id,shopId = currentId时不刷新接口数据
    let shopId = wx.getStorageSync("mall") ? wx.getStorageSync("mall") : that.data.id;
    var currentId = that.data.id;
    that.setData({
      currentId
    })
    that.setData({
      id: shopId
    })
    if (shopId) {
      if (shopId != currentId) {
        that.setData({
          pageNum: 1,
          goodsList: [],
        })
        that.getActivity();
        that.clearCheckList();
        console.log("shopId:" + shopId)
        if (shopId) {
          that.setData({
            id: shopId
          })
        }
        that.getShopInfo();
      }
      else {
        //门店未变化时，获取当前门店的最新信息
        shopMgr.getDetail(that.data.id, { append: "mall_config" }).then(function (res) {
          if (res.code === 0) {
            //如果门店歇业状态发生了变化，重新请求门店信息
            if (wx.getStorageSync("isbiztimemall") !== res.data.mallConfig.isBizTime) {
              that.setData({
                pageNum: 1,
                goodsList: [],
              })
              that.getActivity();
              that.clearCheckList();
              that.getShopInfo();
            }
          }
        });
      }
    } else {
      that.getLocationAddress()
    }   
  },

  reloadData(){
    this.setData({
      pageNum: 1,
      goodsList: [],
      mallShopCount: 0
    })
    this.getLocationAddress()
    wx.setStorageSync("mall", "")
    this.clearCheckList();
  },

  getLocationAddress() {
    
    let that = this;
    let hasAddress = that.data.hasAddress
    if (!hasAddress) {
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          var latitude = res.latitude
          var longitude = res.longitude
          var speed = res.speed
          var accuracy = res.accuracy
          app.globalData.location.latitude = latitude
          app.globalData.location.longitude = longitude
          that.getShopbyLocation(latitude, longitude)
          that.setData({
            latitude,
            longitude,
            hasAddress: true
          })
        },
        fail: function (err) {
          that.setData({
            longitude: '',
            latitude: '',
            hasAddress: false
          })
          that.getShopbyLocation('', '')
        }
      })
    } else {
      this.setData({
        longitude: app.globalData.location.longitude,
        latitude: app.globalData.location.latitude,
        hasAddress
      })
      this.getShopbyLocation(this.data.latitude, this.data.longitude)
    }
  },

  getActivity() {
    activityMgr.create({
      "type": "MALL", 
      "shopId": this.data.id,
    }).then(res => {
      if (res.code == 0) {
        console.log(res)
        this.setData({
          activity: res.data
        });

      }
    })
  },
  onUnload: function() {
    // 页面关闭
  },

  showPreviewAnimate() {
    /* 动画部分 */
    // 第1步：创建动画实例   
    var animation1 = wx.createAnimation({
      duration: 200, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });
    var animation2 = wx.createAnimation({
      duration: 200, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });

    animation2.opacity(1).step();
    this.setData({
      previewAnimationData: animation2
    })

    animation1.scale(1.1).step();
    this.setData({
      animationData: animation1.export()
    })

    setTimeout(() => {
      animation1.scale(1).step();
      this.animationData = animation1
      this.setData({
        animationData: animation1
      })
    }, 200)
  },

  hidePreviewAnimate() {
    var animation1 = wx.createAnimation({
      duration: 200, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });
    var animation2 = wx.createAnimation({
      duration: 200, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });
    animation2.opacity(0).step();
    this.setData({
      previewAnimationData: animation2
    })

    animation1.scale(1.1).step();
    this.setData({
      animationData: animation1.export()
    })

    setTimeout(() => {
      animation1.scale(1).step();
      this.animationData = animation1
      this.setData({
        animationData: animation1
      })
    }, 200)
  },

  onLoad: function(options) {
    mta.initPage();
    var that = this;
    var latitude = options.latitude || app.globalData.location.latitude
    var longitude = options.longitude || app.globalData.location.longitude
    var hasAddress = !!latitude && !!longitude
      that.setData({
        hasAddress
      })
  },
  getShopbyLocation(latitude, longitude) {
    let that = this;
    // 获得shop列表
    return shopMgr.getList({
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
      latitude: latitude,
      longitude: longitude,
      append: "mall_config"
    }).then(function(res) {
      var temp = res.data.map(item => {
        item.distance = item.distance || {}
        if (item.distance.unit == 'km') {
          item.distance.value = 1
          item.distance.unit = 'km以上'
        }
        return item
      })
      var temp = res.data;
      for (var i = 0; i < temp.length; i++) {
        if (temp[i].mallConfig.enabled) {
          that.setData({
            //第一次进入界面或重新加载获取的shopid
            id: temp[i].id,
          });
          break;
        }
      }
      var mallShopCount = that.data.mallShopCount;
      for (var i = 0; i < temp.length; i++) {
        if (temp[i].mallConfig.enabled) {
          mallShopCount = mallShopCount + 1
        }
      }
      that.setData({
        mallShopCount
      });
      that.getActivity()
      that.getShopInfo();
    })
  },


  disMove() {

  },

  hidePreview() {
    this.hidePreviewAnimate()
    setTimeout(() => {
      this.setData({
        isPreviewing: false
      })
    }, 400)
  },

  showPreview(e) {
    var currentPrewiewGoods = e.currentTarget.dataset.item
    this.setData({
      currentPrewiewGoods,
      isPreviewing: true
    })
    this.showPreviewAnimate()
  },

  calculateCheckedListNum() {
    var checkedListNum
    if (this.data.checkedList.length == 0) {
      checkedListNum = 0
    } else {
      checkedListNum = this.data.checkedList.map(item => item.number).reduce((a, b) => {
        return a + b
      })
    }
    this.setData({
      checkedListNum
    })
  },

  removeItem(e) {
    var item = e.target.dataset.item;
    this.remove(item);
  },

  removeProduct(e) {
    var product = e.target.dataset.item;
    if (product.hasParam) return;
    var tmp = this.generateItemInfo(product);
    this.remove(tmp);
  },

  remove(item) {
    if (item.metadata.number == 0) return;
    item.metadata.number -= 1;
    if (item.metadata.number == 0) {
      var _this = this;
      activityMgr.removeItem(this.data.activity.id, item).then(res => {
        _this.handleActivityRes(res);

      }).catch(err => {

      });
    } else {
      this.updataItem(item)
    }
  },

  addItem(e) {
    var item = e.target.dataset.item;
    this.add(item);
  },


  addProduct(e) {
    var product = e.target.dataset.item;
    var tmp = this.generateItemInfo(product);
    if (product.hasParam) {
      var unit = product.unit;
      var attrs = product.attrs.map((v, i) => {
        v.choiceIndex = 0;
        return v;
      });
      var goodsList = product.goodsList ? product.goodsList : [];
      var norms = [];
      var priceTmp = product.price;
      goodsList.forEach(function(value, idx) {
        value.specs.forEach(function(v, i) {
          var isFirst = !norms[0];
          if (isFirst) {
            priceTmp = value.price;
          }
          norms.push({
            name: v.name,
            price: value.price,
            sid: v.sid,
            gid: value.id, //goodsid
            isChoiced: isFirst,
          });
        });
      });
      this.showToast();
      this.setData({
        normsTmp: norms,
        attrsTmp: attrs,
        priceTmp,
        productTmp: product,
      });
      this.updateParam();
      return;
    } else {
      this.add(tmp);
    }
  },

  add(item) {
    item.metadata.number += 1;
    if (item.metadata.number == 1) {
      var _this = this;
      activityMgr.addItem(this.data.activity.id, item).then(res => {
        _this.handleActivityRes(res);

      }).catch(err => {

      });
    } else {
      this.updataItem(item)
    }
  },

  handleActivityRes(res) {
    var activity = res.data;
    this.setData({
      activity
    });

    var checkedList = activity.items.map(item => {
      item.product = JSON.parse(item.metadata.oraginItem);
      item.metadata.price = parseInt(item.metadata.price);
      item.metadata.number = parseInt(item.metadata.number);
      item.metadata.hasParam = item.metadata.hasParam == 'true'
      return item;
    });
    this.setData({
      checkedList
    }); //设置购物车数据

    if (checkedList.length == 0) {
      this.hide()
    }
    this.updateGoodsList();
    this.updateParam();
    this.calculateTotal();
  },

  addProductAuth(e){
    var _this = this;
    if (e.detail.userInfo){
      auth.authLogin().then(res=>{
        _this.addProduct(e);
      });
    }
  },
  
  updateGoodsList() {
    var checkedList = this.data.checkedList;
    var goodsList = this.data.goodsList.map(v => {
      v.number = 0;
      checkedList.forEach(item => {
        if (item.product.id == v.id) { //计算商品选择数量
          v.number += item.metadata.number;
        }
      });
      return v;
    });
    this.setData({
      goodsList
    });
  },
  
  changeSubmitStyle() {
    var submitclick = this.data.submitclick
    var submitname = this.data.submitname
    var submitcolor = this.data.submitcolor
    if (this.data.startFee * 100 > this.data.totle) {
      submitclick = ""
      submitcolor = "gray",
        submitname = "还差" + (this.data.startFee * 100 - this.data.totle) / 100 + "元"
    } else {
      submitclick = "submit"
      submitcolor = "#434343",
        submitname = "去结算"
    }
    this.setData({
      submitclick,
      submitcolor,
      submitname
    })

  },

  updateParam() {
    if (Object.keys(this.data.productTmp)[0]) {
      var product = this.data.productTmp;
      var itemTMP = this.generateItemInfo(product);
      this.setData({
        itemTMP
      });
    }
  },

  addParam() {
    var product = this.data.productTmp;
    var item = this.generateItemInfo(product);
    this.add(item);
  },
  addParamFinish() {
    this.addParam();
    this.hideToast();
  },

  updataItem(item) {
    var _this = this;
    activityMgr.updateItem(this.data.activity.id, item).then(res => {
      _this.handleActivityRes(res);

    }).catch(err => {

    });
  },

  clearCheckList() {
    var checkedList = [];
    this.setData({
      checkedList,
    });
    this.updateGoodsList();
    if (this.data.activity.id) {
      activityMgr.clearItem(this.data.activity.id);
    }
    this.calculateTotal();
    this.hide();
  },

  calculateTotal() {
    var totle = 0, totleLength = 0, checkedList
    checkedList = this.data.checkedList
    checkedList.forEach(v => {
      totle += v.metadata.price * v.metadata.number;
      totleLength += v.metadata.number;
    });
    this.setData({
      totle,
      totleLength
    })
    this.changeSubmitStyle()
  },

  //显示隐藏弹框
  hideToast(e) {
    this.hidePreviewAnimate()
    setTimeout(() => {
      this.setData({
        showAddParam: false,
      })
    }, 400);
  },

  showToast(e) {
    this.setData({
      showAddParam: true,
    })
    this.showPreviewAnimate();
  },


  show() {
    this.setData({
      isShow: true
    })
    var modelAnimation = wx.createAnimation({
      duration: 400, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });
    var modelbgAnimation = wx.createAnimation({
      duration: 400, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });

    modelbgAnimation.opacity(1).step();
    this.setData({
      modelbgAnimation
    })

    modelAnimation.bottom(0).step();
    this.setData({
      modelAnimation
    })
  },

  hide() {
    var modelAnimation = wx.createAnimation({
      duration: 400, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });
    var modelbgAnimation = wx.createAnimation({
      duration: 400, //动画时长  
      timingFunction: "linear", //线性  
      delay: 0 //0则不延迟  
    });

    modelbgAnimation.opacity(0).step();
    this.setData({
      modelbgAnimation
    })

    modelAnimation.bottom('-100%').step();
    this.setData({
      modelAnimation
    })
    setTimeout(() => {
      this.setData({
        isShow: false
      })
    }, 400)
  },

  toggle() {
    this.data.isShow ? this.hide() : this.show()
  },

  share() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  showList() {
    if (this.data.checkedList.length == 0) return
    this.toggle()
  },
  submit() {
    if (this.data.checkedList.length == 0) return
    //注释掉营业时间判断
    // var that = this
    // var now = new Date().toLocaleDateString();
    // var start = new Date(now + " " + that.data.shop.bizTimes[0].startTime).getTime()
    // var end = new Date(now + " " + that.data.shop.bizTimes[0].endTime).getTime()
    // var nowlong = new Date().valueOf()
    // if (nowlong < start || nowlong > end) {
    //   util.showErrorToast('该时段未营业');
    // } else {
      wx.navigateTo({
        url: '/pages/ucenter/submitOrder/submitOrder?id=' + this.data.activity.id + '&shopname=' + this.data.showName + '&shopid=' + this.data.shop.id + '&taketype=mall' + '&deliveryType=' + this.data.deliveryType,

      });
    // }
  },

  getCurrentGoods() {
    this.setData({
      isLoadinng: true
    });
    util.request(qianbao.Url_Products, {
      append: 'goods_list',
      sort: 'order,desc',
      type: 'GIFT',
      status: 'ON,SOLD_OUT',
      tagCode: "mall-product",
      shopId: this.data.shop.id,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    }).then(res => {
      var tmp = res.data.map(v => {
        v.hasParam = v.attrs[0] || v.specs[0];
        return v;
      });
      var goodsList = this.data.goodsList.concat(tmp);
      this.setData({
        goodsList,
        isLoadinng: false,
        noMoreData: res.data.length < this.data.pageSize
      });
      this.updateGoodsList();
      wx.hideLoading();
    });
  },
  //获取商户信息
  getShopInfo() {
    var that = this;
    if (!that.data.id) {
      wx.showToast({
        title: '当前门店未开通商城',
        icon: 'none',
        duration: 2000
      })
      return
    }
    shopMgr.getDetail(that.data.id, {
      append: "mall_config"
    }).then(function(res) {
      if (res.code === 0) {
        if (!res.data.mallConfig.enabled){
          return
        }
        var shop = res.data
        var showName = shop.name;
        if (shop.branchName) {
          showName = showName + "(" + shop.branchName + ")";
        }
        var startFee = shop.mallConfig.startFee / 100
        var maxDistance = shop.mallConfig.maxDistance
        var deliveryType = shop.mallConfig.deliveryType
        if (deliveryType == "DADA_DELIVERY") {
          deliveryType = "达达"
        } else {
          deliveryType = "商家"
        }
        //第一次进入界面或重新加载,存储可接单时间isBizTime
        wx.setStorageSync("isbiztimemall", shop.mallConfig.isBizTime)
        that.setData({
          shop,
          showName,
          startFee,
          maxDistance,
          deliveryType
        });
        that.getCurrentGoods();
      }
    });
  },

  //弹框选择规格属性
  choiceParam(e) {
    if (e.currentTarget.dataset.type == 'attr') {
      var attrsTmp = this.data.attrsTmp;
      var attr = attrsTmp[e.currentTarget.dataset.idx];
      attr.choiceIndex = e.currentTarget.dataset.v_idx;
      attrsTmp[e.currentTarget.dataset.idx] = attr;
      this.setData({
        attrsTmp,
      });
    } else if (e.currentTarget.dataset.type == 'norm') {
      var priceTmp = this.data.priceTmp;
      var normsTmp = this.data.normsTmp.map((v, i) => {
        v.isChoiced = i == e.currentTarget.dataset.v_idx;
        if (v.isChoiced) {
          priceTmp = v.price;
        }
        return v;
      });
      this.setData({
        priceTmp,
        normsTmp
      });
    }
    this.updateParam();

  },

  generateItemInfo(product) {
    var info = {
      "name": product.name,
      "metadata": {
        id: product.goodsList[0].id,
        gid: product.goodsList[0].id,
        url: product.media[0].url,
        price: product.price,
        number: 0,
        hasParam: false,
        oraginItem: JSON.stringify(product)
      }
    };
    if (product.hasParam) {
      info.metadata.hasParam = true;
      this.data.normsTmp.some(v => {
        if (v.isChoiced) {
          info.metadata.gid = v.gid;
          info.metadata.norm = v.name;
          info.metadata.price = v.price;
          return true;
        }
      });
      var attr = '';
      this.data.attrsTmp.forEach(v => {
        if (attr.length > 0) {
          attr = attr + '|' + v.values[v.choiceIndex];
        } else {
          attr = v.values[v.choiceIndex];
        }
      });
      info.metadata.attr = attr;
      info.metadata.id = info.metadata.gid + '|' + attr;
    }
    info.product = product;
    this.data.checkedList.some(v => {
      if (v.metadata.id == info.metadata.id) {
        info.id = v.id;
        info.metadata.number = v.metadata.number;
        return true;
      }
    });
    return info;
  },



})