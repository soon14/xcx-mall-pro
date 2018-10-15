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
    navname: "",
    categoryList: [],
    id: "",
    currentId: "",
    shop: {},
    goodsList: [],
    currentCategory: {},
    mainColor: "#434343",
    isShowMerchantInfo: false,
    goodsBorder: "2px solid #434343",
    merchantBorder: "",
    currentType: "0",
    totle: '0',
    totleLength: '0',
    isShow: false,
    checkedList: [],
    cataType: extConfig.cataType || 3,
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
    canSubmit:false,
    submitcolor: "",
    submitname: "",
    takeoutShopCount: 0,
    deliveryType:""
  },

  addPage() {
    if (this.data.isLoadinng || this.data.noMoreData) return
    this.setData({
      pageNum: this.data.pageNum + 1
    })
    this.getCurrentGoods(this.data.currentCategory.id)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    iwx.stopPullDownRefresh()
  },

  onShareAppMessage: function() {

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
      append: "takeout_config"
    }).then(function(res) {
      var temp = res.data;
      for (var i = 0; i < temp.length; i++) {
        if (temp[i].takeoutConfig.enabled) {
          that.setData({
            //第一次进入界面或重新加载获取的shopid
            id: temp[i].id,
          });
          break;
        }
      }
      var takeoutShopCount = that.data.takeoutShopCount;
      for (var i = 0; i < temp.length; i++) {
        if (temp[i].takeoutConfig.enabled) {
          takeoutShopCount = takeoutShopCount + 1
        }
      }
      that.setData({
        takeoutShopCount
      });
      that.getActivity();
      that.getShopInfo();
    })
  },
  disMove() {

  },

  changeType(e) {
    var that = this;
    var tagID = e.currentTarget.dataset.id;
    if (that.data.currentType === tagID) return;

    that.setData({
      currentType: tagID,
    })

    if (tagID === "0") {
      that.setData({
        isShowMerchantInfo: false,
        goodsBorder: "2px solid #434343",
        merchantBorder: "",
      })
    } else if (tagID === "1") {
      that.setData({
        isShowMerchantInfo: true,
        goodsBorder: "",
        merchantBorder: "2px solid #434343",
      })
    }
  },

  callPhone() {
    var that = this
    var tel = that.data.shop.phone;
    console.log("电话" + tel)
    if (tel.length > 0) {
      wx.makePhoneCall({
        phoneNumber: tel
      })
    }
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

  //获取商户信息
  getShopInfo() {
    var that = this;
    if (!that.data.id) {
      wx.showToast({
        title: '当前门店未开通外卖',
        icon: 'none',
        duration: 2000
      })
      return
    }
    shopMgr.getDetail(that.data.id, {
      append: "takeout_config"
    }).then(function(res) {
      if (!res.data.takeoutConfig.enabled) {
        return
      }
      var shop = res.data
      var showName = shop.name;
      if (shop.branchName) {
        showName = showName + "(" + shop.branchName + ")";
      }
      console.log("shop:" + shop)
      var startFee = shop.takeoutConfig.startFee / 100
      var maxDistance = shop.takeoutConfig.maxDistance
      wx.setNavigationBarTitle({
        title: showName
      })
      var arr = shop.takeoutConfig.scopes
      var deliveryType = shop.takeoutConfig.deliveryType
        if (deliveryType == "DADA_DELIVERY"){
          deliveryType = "达达"
        }else{
          deliveryType = "商家"
        }
      //第一次进入界面或重新加载,存储可接单时间isBizTime
      wx.setStorageSync("isbiztime", shop.takeoutConfig.isBizTime)
      that.setData({
        shop,
        showName,
        startFee,
        maxDistance,
        deliveryType
      });
      that.getCatalog();
    });

  },

  //获取分类
  getCatalog() {
    let that = this;
    util.request(qianbao.Url_Catalogs + '?type=TAKEOUT&sort=order,desc&scopeType=VINCI_SC_SHOP&pageNum=1&pageSize=1000&scopeId=' + this.data.shop.id).then(function(res) {
      that.setData({
        navList: res.data.map(item => {
          item.hasData = that.data.checkedList.some(checkedItem => checkedItem.catalogs.some(catalog => catalog.id === item.id))
          return item
        }),
        currentCategory: res.data[0],
        navname: res.data[0].name
      });
      if (res.data[0]) {
        that.getCurrentGoods(res.data[0].id);
      }
    });
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
    var item = e.currentTarget.dataset.item;
    this.remove(item);
  },

  // remove(e) {
  //   var item = e.currentTarget.dataset.item;
  //   this.removeNew(item);
  // },

  removeProduct(e) {
    var product = e.currentTarget.dataset.item;
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

  addProduct(e) {
    var product = e.currentTarget.dataset.item;
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
  addItem(e) {
    var item = e.currentTarget.dataset.item;
    this.add(item);
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
    this.updateNavList();
    this.updateParam();

    this.calculateTotal();
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

  updateNavList() {
    var checkedList = this.data.checkedList;
    var navList = this.data.navList.map(v => {
      v.hasData = false;
      v.number = 0;
      checkedList.forEach(item => {
        if (item.product.catalogs.some(catalog => catalog.id === v.id)) {
          v.hasData = true;
          v.number += item.metadata.number;
        }
      });
      return v;
    });
    this.setData({
      navList
    });
  },

  changeSubmitStyle() {
    var canSubmit = this.data.canSubmit
    var submitname = this.data.submitname
    var submitcolor = this.data.submitcolor
    if (this.data.startFee * 100 > this.data.totle) {
      canSubmit = false
      submitcolor = "gray",
      submitname = "还差" + (this.data.startFee * 100 - this.data.totle) / 100 + "元"
    } else {
      canSubmit = true
      submitcolor = "#434343",
      submitname = "去结算"
    }
    this.setData({
      canSubmit,
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

  clearMenuList() {
    var checkedList = [];
    this.setData({
      checkedList,
    });
    this.updateNavList();
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
    if (!this.data.canSubmit) return
    //注释掉营业时间判断
    // var that = this
    // console.log("time=", new Date("2018/7/5 10:20").getTime())
    // var now = new Date().toLocaleDateString();
    // var start = new Date(now + " " + that.data.shop.bizTimes[0].startTime).getTime()
    // var end = new Date(now + " " + that.data.shop.bizTimes[0].endTime).getTime()
    // console.log("time=", start)
    // var nowlong = new Date().valueOf()
    // if (nowlong < start || nowlong > end) {
    //   util.showErrorToast('该时段未营业');
    // } else {
      wx.navigateTo({
        url: '/pages/ucenter/submitOrder/submitOrder?id=' + this.data.activity.id + '&shopname=' + this.data.showName + '&shopid=' + this.data.shop.id + '&taketype=takeout' + '&deliveryType=' + this.data.deliveryType,
      });
    // }
  },


  getCurrentGoods(id) {
    this.setData({
      isLoadinng: true
    });
    util.request(qianbao.Url_Products, {
      catalogId: id,
      shopId: this.data.shop.id,
      append: 'goods_list',
      sort: 'order,desc',
      type: 'DISH',
      status: 'ON,SOLD_OUT',
      tagCode: "takeout-product",
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize
    }).then(res => {
      var tmp = res.data.map(v => {
        v.hasParam = v.attrs[0] || v.specs[0];
        return v;
      });
      var goodsList = this.data.goodsList.concat(tmp);
      goodsList.map(item => {
        let tags = item.tags.filter(itx => {
          return (itx.code == 'fresh-product' || itx.code == 'hot-product')
        })
        item.tags = tags
      })
      this.setData({
        goodsList,
        isLoadinng: false,
        noMoreData: res.data.length < this.data.pageSize
      });
      console.log(this.data.goodsList)
      this.updateGoodsList();
      wx.hideLoading();
    });
  },

  onReady: function() {
    // 页面渲染完成
  },

  onShow: function() {
    // 页面显示
    let that = this;
    wx.getStorage({
      key: 'cleanShopcart',
      success: function(res) {
        console.log(res)
        if (res.data == "clean") {
          that.clearMenuList();
        }
      },
    })
    //获取外卖门店的数目，数目变化了，则重新拉取门店接口
    shopMgr.getList({
      pageNum: that.data.pageNum,
      pageSize: that.data.pageSize,
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      append: "takeout_config"
    }).then(function (res) {
      var shopCount = 0;
      for (var i = 0; i < res.data.length; i++) {
        if (res.data[i].takeoutConfig.enabled) {
          shopCount = shopCount + 1
        }
      }
      if (that.data.takeoutShopCount !== 0 && that.data.takeoutShopCount !== shopCount){
        that.reloadData()
      }
    })
    //1、根据当前外卖门店id判断当前外卖门店是否关闭，若关闭，则重新请求接口，获取最近的外卖门店
    if (that.data.id) {
      shopMgr.getDetail(that.data.id, { append: "takeout_config" }).then(function(res) {
        if (res.code === 0) {
          var shop = res.data
          if (!shop.takeoutConfig.enabled) {
            that.reloadData()
          } 
        }
      });
    }

    //shopId用于记录切换门店时的门店id，currentId当前门店id,shopId = currentId时不刷新接口数据
    let shopId = wx.getStorageSync("takeout") ? wx.getStorageSync("takeout") : that.data.id;
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

        that.clearMenuList();
        console.log("shopId:" + shopId)
        if (shopId) {
          that.setData({
            id: shopId
          })
        }
        that.getShopInfo();
      }else{
        //门店未变化时，获取当前门店的最新信息
        shopMgr.getDetail(that.data.id, { append: "takeout_config" }).then(function (res) {
          if (res.code === 0) {
            //如果门店歇业状态发生了变化，重新请求门店信息
            if (wx.getStorageSync("isbiztime") !== res.data.takeoutConfig.isBizTime) {
              that.setData({
                pageNum: 1,
                goodsList: [],
              })
              that.getActivity();
              that.clearMenuList();
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
      takeoutShopCount: 0
    })
    this.getLocationAddress()
    wx.setStorageSync("takeout", "")
    this.clearMenuList();
  },

  getLocationAddress() {

    let that = this;
    let hasAddress = that.data.hasAddress
    if (!hasAddress) {
      wx.getLocation({
        type: 'wgs84',
        success: function(res) {
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
        fail: function(err) {
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
      "type": "TAKEOUT",
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

  onHide: function() {
    // 页面隐藏
  },

  onUnload: function() {
    // 页面关闭
  },

  switchCate(event) {
    var that = this;
    var currentTarget = event.currentTarget;
    if (this.data.currentCategory.id == event.currentTarget.dataset.id) {
      return false;
    }

    for (var i = 0; i < that.data.navList.length; i++) {
      if (that.data.navList[i].id == event.currentTarget.dataset.id) {
        that.setData({
          currentCategory: that.data.navList[i],
          navname: that.data.navList[i].name
        });
        break;
      }
    }
    this.setData({
      goodsList: [],
      pageNum: 1,
      noMoreData: false
    })
    this.getCurrentGoods(event.currentTarget.dataset.id);
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