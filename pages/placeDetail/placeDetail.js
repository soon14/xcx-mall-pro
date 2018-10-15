var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
// var api = require('../../config/api.js');
var qianbao = require('../../config/qianbao.js');
var auth = require('../../services/auth.js');
var activityMgr = require('../../services/activity.js');

var rangeStart = 9 //预约开始时间
var rangeEnd = 20 //预约结束时间
var range = 2 //预约时长
var beforeDay = 7 //可提前时长 7天

var tody = new Date()
/*最多提前7天预约*/
var endDay = new Date(+tody + beforeDay * 24 * 3600 * 1000)

var startTime, endTime
if (tody.getHours() >= rangeStart && tody.getHours() < rangeEnd) {
  // 默认值为下一个小时
  startTime = (tody.getHours() + 1) + ':00'
  endTime = (tody.getHours() + 1 + range) + ':00'
} else {
  startTime = rangeStart + ":00"
  endTime = rangeStart + range + ":00"
}
if (tody.getHours() >= rangeEnd) {
  // 延后一天
  tody = new Date(+tody + 1 * 24 * 3600 * 1000)
  endDay = new Date(+tody + beforeDay * 24 * 3600 * 1000)
}

var nowDate = tody.getFullYear() + '-' + ('0' + (tody.getMonth() + 1)).slice(-2) + '-' + ('0' + tody.getDate()).slice(-2)
var endDate = endDay.getFullYear() + '-' + ('0' + (endDay.getMonth() + 1)).slice(-2) + '-' + ('0' + endDay.getDate()).slice(-2)

var validator = {
  name(val) {
    return /^.{1,10}$/.test(val)
  },
  phone(val) {
    return /^1\d{10}$/.test(val)
  },
  peopleNum(val) {
    return /^\d*$/.test(val) && val <= this.data.place.userLimit
  },
}

Page({
  data: {
    id: 0,
    place: {},
    gallery: [],
    attribute: [],
    issueList: [],
    comment: [],
    brand: {},
    specificationList: [],
    productList: [],
    relatedPlace: [],
    cartPlaceCount: 0,
    userHasCollect: 0,
    number: 1,
    checkedSpecText: '请选择规格数量',
    openAttr: false,
    noCollectImage: "/static/images/icon_collect.png",
    hasCollectImage: "/static/images/icon_collect_checked.png",
    collectBackImage: "/static/images/icon_collect.png",
    /*openAttr == true*/
    nowDate,
    endDate,
    // date: nowDate,
    date: '',
    formatDate: '',
    dataIsNull: true,
    name: "",
    /*startTime: startTime,
    endTime: endTime,*/
    startTime: '',
    endTime: '',
    msgToSeller:'',
    msgToFriend:'',
    startTimeIsNull: true


  },

  bindDateChange(e) {
    this.setData({
      date: e.detail.value,
      formatDate: e.detail.value.split('-')[0] + '年' + e.detail.value.split('-')[1] + '月' + e.detail.value.split('-')[2] + '日',
      dataIsNull: false
    })
  },

  bindinputMsgToFriend(event) {
    this.setData({
      msgToFriend: event.detail.value
    })
  },

  bindinputMsgToSeller(event) {
    this.setData({
      msgToSeller: event.detail.value
    })
  },

  bindTimeChange(e) {
    var startTime = e.detail.value
    console.log('startTime', startTime)
    var endTime = ('0' + (+e.detail.value.split(':')[0] + range)).slice(-2) + ':' + e.detail.value.split(':')[1]
    this.setData({
      startTime,
      endTime,
      startTimeIsNull: false
    })
  },
  getPlaceInfo: function () {
    let that = this;
    util.request(qianbao.Url_Places + '/' + that.data.id +'?append=qr_code_list').then(function (res) {
      if (res.code === 0) {
        let gallery = res.data.media.concat(res.data.qrCodes);
        that.setData({
          place: res.data,
          gallery: gallery,
          // gallery: res.data.gallery,
          // attribute: res.data.attribute,
          // issueList: res.data.issue,
          // comment: res.data.comment,
          // brand: res.data.brand,
         // specificationList: res.data.properties,
          // productList: res.data.productList,
          // userHasCollect: res.data.userHasCollect
        });

        if (res.data.userHasCollect == 1) {
          that.setData({
            'collectBackImage': that.data.hasCollectImage
          });
        } else {
          that.setData({
            'collectBackImage': that.data.noCollectImage
          });
        }

        WxParse.wxParse('placeDetail', 'html', res.data.content, that);
      }
    });

  },
  clickSkuValue: function (event) {
    let that = this;
    let specNameId = event.currentTarget.dataset.nameId;
    let specValueId = event.currentTarget.dataset.valueId;

    //判断是否可以点击

    //TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      if (_specificationList[i].id == specNameId) {
        for (let j = 0; j < _specificationList[i].childsCurPlace.length; j++) {
          if (_specificationList[i].childsCurPlace[j].id == specValueId) {
            //如果已经选中，则反选
            if (_specificationList[i].childsCurPlace[j].paixu) {
              _specificationList[i].childsCurPlace[j].paixu = false;
            } else {
              _specificationList[i].childsCurPlace[j].paixu = true;
            }
          } else {
            _specificationList[i].childsCurPlace[j].paixu = false;
          }
        }
      }
    }
    this.setData({
      'specificationList': _specificationList
    });
    //重新计算spec改变后的信息
    this.changeSpecInfo();

    //重新计算哪些值不可以点击
  },

  //获取选中的规格信息
  getCheckedSpecValue: function () {
    let checkedValues = [];
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      let _checkedObj = {
        nameId: _specificationList[i].id,
        valueId: 0,
        valueText: ''
      };
      for (let j = 0; j < _specificationList[i].childsCurPlace.length; j++) {
        if (_specificationList[i].childsCurPlace[j].paixu) {
          _checkedObj.valueId = _specificationList[i].childsCurPlace[j].id;
          _checkedObj.valueText = _specificationList[i].childsCurPlace[j].name;
        }
      }
      checkedValues.push(_checkedObj);
    }

    return checkedValues;

  },
  //根据已选的值，计算其它值的状态
  setSpecValueStatus: function () {

  },
  //判断规格是否选择完整
  isCheckedAllSpec: function () {
    return !this.getCheckedSpecValue().some(function (v) {
      if (v.valueId == 0) {
        return true;
      }
    });
  },
  getCheckedSpecKey: function () {
    let checkedValue = this.getCheckedSpecValue().map(function (v) {
      return v.valueText;
    });

    return checkedValue.join('_');
  },
  changeSpecInfo: function () {
    let checkedNameValue = this.getCheckedSpecValue();
    //设置选择的信息
    let checkedValue = checkedNameValue.filter(function (v) {
      if (v.paixu != 0) {
        return true;
      } else {
        return false;
      }
    }).map(function (v) {
      return v.valueText;
    });
    if (checkedValue.length > 0) {
      this.setData({
        'checkedSpecText': checkedValue.join('　')
      });
    } else {
      this.setData({
        'checkedSpecText': '请选择规格数量'
      });
    }

  },
  getCheckedProductItem: function (key) {
    return this.data.productList.filter(function (v) {
      if (v.place_specification_ids == key) {
        return true;
      } else {
        return false;
      }
    });
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      id: options.id
      // id: 1181000
    });
    var that = this;
    this.getPlaceInfo();
  },
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭

  },
  switchAttrPop: function () {
    if (this.data.openAttr == false) {
      this.setData({
        openAttr: !this.data.openAttr,
        collectBackImage: "/static/images/detail_back.png"
      });
    }
  },
  closeAttrOrCollect: function () {
    let that = this;
    if (this.data.openAttr) {
      this.setData({
        openAttr: false,
      });
      if (that.data.userHasCollect == 1) {
        that.setData({
          'collectBackImage': that.data.hasCollectImage
        });
      } else {
        that.setData({
          'collectBackImage': that.data.noCollectImage
        });
      }
    } else {
      //添加或是取消收藏
      /*util.request(api.CollectAddOrDelete, { typeId: 0, valueId: this.data.id }, "POST")
        .then(function (res) {
          let _res = res;
          if (_res.errno == 0) {
            if ( _res.data.type == 'add') {
              that.setData({
                'collectBackImage': that.data.hasCollectImage
              });
            } else {
              that.setData({
                'collectBackImage': that.data.noCollectImage
              });
            }

          } else {
            wx.showToast({
              image: '/static/images/icon_error.png',
              title: _res.errmsg + '',
              mask: true
            });
          }

        });*/
    }

  },
  // openCartPage: function () {
  //   wx.redirectTo({
  //     url: '',
  //   });
  // },
  openHomePage: function () {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },

  addToCart: function () {
    var that = this;
    if (this.data.openAttr == false) {
      //打开规格选择窗口
      this.setData({
        openAttr: !this.data.openAttr,
        collectBackImage: "/static/images/detail_back.png"
      });
    } else {
      
      if (that.data.formatDate  == '') {
        util.showErrorToast('请输入预约日期');

        return false;
      }
      if (that.data.startTime == '') {
        util.showErrorToast('请输入预约时间');
        return false;
      }

      let me = auth.getUserInfo().user;

      var now = new Date();
      var today = util.formatDate(now);
      var curPlace = that.data.place;

      var key = 'RESERVATION_' + curPlace.id + '_' + today
      //#warnning. activity type 有问题
      activityMgr.getList({ type: key }).then(function (res) {
          if (res.code === 0) {
            that.setData({
              activity: res.data[0]
            });
            wx.setStorageSync(key, res.data[0]);
            return;
          }
        });

        const startTime = new Date(that.data.date + ' ' + that.data.startTime).getTime();
        const endTime = new Date(that.data.date + ' ' + that.data.endTime).getTime();

        //#warnning. activity type 有问题
        var data = {
          name: key,
          title: me.nickName+'创建的预约活动',
          shopId: curPlace.shop.id,
          placeId: curPlace.id,
          media: [
          ],
          actors: [
          ], 
          items: [
          ],
          startTime,
          endTime,
          metadata: {
             "type": "聚会",
             "atime": that.data.formatDate + ' ' + that.data.startTime + '-' + that.data.endTime,
             "url": curPlace.media[0].url,
             "msgToSeller": that.data.msgToSeller,
             "msgToFriend": that.data.msgToFriend,
          },
          type: key
        }
        
        activityMgr.create(data).then(function (res) {
          if (res.code === 0) {
            console.log(111)
            wx.showToast({
              title: '添加成功'
            });

            that.setData({
              openAttr: !that.data.openAttr,
              activity: res.data
            });
            wx.setStorageSync(key, res.data);
            wx.redirectTo({
              url: '/pages/ucenter/activityDetail/activityDetail?id=' + res.data.id,
            });

          }
        });
    }
  },
  cutNumber: function () {
    this.setData({
      number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1
    });
  },
  addNumber: function () {
    this.setData({
      number: this.data.number + 1
    });
  }
})