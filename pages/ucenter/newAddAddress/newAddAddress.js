// pages/ucenter/addAddress/addAddress.js
var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var qianbao = require('../../../config/qianbao.js');
var auth = require('../../../services/auth.js');
var app = getApp();
var formatLocation = util.formatLocation;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: [{
        name: 'MALE',
        value: '先生',
        checked: 'true'
      },
      {
        name: 'FEMALE',
        value: '女士'
      },
    ],
    address: {
      id: 0,
      name: '',
      gender: 'MALE',
      mobile: '',
      gps: '',
      locationAddress: '',
      detailAddress: '',
      idtitle: '',
    },
    addressid: '',
  },
  listenerRadioGroup: function(e) {
    console.log(e);
    let address = this.data.address;
    address.gender = e.detail.value;
    this.setData({
      address: address
    });

  },
  bindinputName(event) {
    let address = this.data.address;
    address.name = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputMobile(event) {
    let address = this.data.address;
    address.mobile = event.detail.value;
    this.setData({
      address: address
    });
  },
  chooseAddress() {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        that.getChooseLocation();
      },
      fail: function(err) {
        console.log(err)
        wx.openSetting({
          success: function(data) {
            if (data.authSetting['scope.userLocation']) {
              that.getChooseLocation();
            }
          }
        })
      }
    })

  },

  getChooseLocation(){
    let address = this.data.address;
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res);
        address.locationAddress = res.address;
        address.gps = res.longitude + "," + res.latitude;
        console.log(address.gps);
        that.setData({
          // location: formatLocation(res.longitude, res.latitude),
          address: address
        })
      }
    })
  },

  bindinputAddress(event) {
    let address = this.data.address;
    address.detailAddress = event.detail.value;
    this.setData({
      address: address
    });
  },

  getWeixinAddress() {
    let that = this;
    // 获取微信地址
    wx.chooseAddress({
      success: function(res) {
        // 根据地理位置 查询经纬度
        let weixinRes = res;
        wx.request({
          url: 'https://restapi.amap.com/v3/geocode/geo',
          method: 'get',
          data: {
            key: 'de06093e9f7cd043101c88f645d8abb9',
            address: weixinRes.provinceName + weixinRes.cityName + weixinRes.countyName + weixinRes.detailInfo,
          },
          success: function(res) {
            let address = that.data.address;
            let array = that.data.array;
            address.name = weixinRes.userName;
            address.mobile = weixinRes.telNumber;
            address.gender = auth.getUserInfo().gender;
            if (address.gender == "MALE") {
              array[0].checked = true;
              array[1].checked = false;

            } else {
              array[0].checked = false;
              array[1].checked = true;
            }

            address.gps = res.data.geocodes[0].location;
            address.locationAddress = weixinRes.provinceName + weixinRes.cityName + weixinRes.countyName;
            address.detailAddress = weixinRes.detailInfo;
            that.setData({
              address,
              array
            });
          },
          fail: function(err) {
            
          }

        })

      }
    })
  },

  saveAddress() {
    console.log(this.data.address)
    let address = this.data.address;

    if (address.name == '') {
      util.showErrorToast('请输入姓名');

      return false;
    }

    if (address.mobile == '') {
      util.showErrorToast('请输入手机号码');
      return false;
    }


    if (address.locationAddress == '点击选择') {
      util.showErrorToast('请选择收货地址');
      return false;
    }

    if (address.detailAddress == '') {
      util.showErrorToast('请输入详细地址');
      return false;
    }

    if (this.data.addressid == '0') {
      let that = this;
      //保存新增地址接口
      util.request(qianbao.Url_address, {
        receiverName: address.name,
        gender: address.gender,
        phone: address.mobile,
        gps: address.gps,
        address: address.locationAddress,
        addition: address.detailAddress,

      }, 'POST').then(function(res) {
        if (res.code === 0) {
          wx.navigateBack({
            delta: 1
          })
          wx.setStorageSync("refreshAddress", "needrefresh");
        }
      });
    } else {
      //编辑地址接口
      util.request(qianbao.Url_address + "/" + this.data.addressid, {
        receiverName: address.name,
        gender: address.gender,
        phone: address.mobile,
        gps: address.gps,
        address: address.locationAddress,
        addition: address.detailAddress,
      }, 'put').then(function(res) {
        if (res.code === 0) {
          wx.navigateBack({
            delta: 1
          })
          wx.setStorageSync("refreshAddress", "needrefresh");
        }
      });
    }

  },
  deleteAddress(event) {
    console.log(event.target)
    let that = this;
    wx.showModal({
      title: '',
      content: '确定要删除地址？',
      success: function(res) {
        if (res.confirm) {
          let addressId = event.target.dataset.addressId;
          util.request(qianbao.Url_address + "/" + addressId, {}, 'DELETE').then(function(res) {
            if (res.code === 0) {
              wx.navigateBack({
                delta: 1
              })
              wx.setStorageSync("refreshAddress", "needrefresh");
            }
          });
          console.log('用户点击确定')
        }
      }
    })
    return false;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    let address = this.data.address;
    let array = this.data.array;
    let addressid = this.data.addressid;
    addressid = options.id;
    this.setData({
      addressid: addressid
    })
    let that = this;
    if (options.id !== '0') {
      util.request(qianbao.Url_address + "/" + options.id, {}, 'GET').then(function(res) {
        if (res.code === 0) {
          address.name = res.data.receiverName;
          address.id = res.data.id;
          address.gender = res.data.gender;

          if (address.gender == "MALE") {
            array[0].checked = true;
            array[1].checked = false;

          } else {
            array[0].checked = false;
            array[1].checked = true;
          }

          address.mobile = res.data.phone;
          address.locationAddress = res.data.location.address;
          address.detailAddress = res.data.location.addition;
          address.gps = res.data.location.longitude + ',' + res.data.location.latitude;
          that.setData({
            array: array,
            address: address
          });
        }
      });
      wx.setNavigationBarTitle({
        title: '编辑收货地址', //页面标题为路由参数
      })
    } else {
      wx.setNavigationBarTitle({
        title: '新增收货地址', //页面标题为路由参数
      })
    }
  },

  getAddressDetail() {
    let address = this.data.address;
    let that = this;
    address.name = that.data.addressName;
    that.setData({
      address: address
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})