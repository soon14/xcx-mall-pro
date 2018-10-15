var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var it120 = require('../../../config/it120.js');
var workspace = require('../../../config/workspace.js');
var qianbao = require('../../../config/qianbao.js');
var auth = require('../../../services/auth.js');
const card = require('../../../utils/card.js');
var myaddress=require('../../../services/menu/takeout.js')

let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
var app = getApp();
const { MpAppID, SellerID } = extConfig
Page({
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
    addressList: [],
    selectedAddress: {},
    pageNum: 1,
    pageSize: 100,
  },

  getAddressList() {
    let that = this;
    util.request(qianbao.Url_address, {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
    }, 'GET').then(function(res) {
      if (res.code === 0) {
        var selectedAddress = wx.getStorageSync("addressSelect");
        if (!selectedAddress) {
          selectedAddress = res.data[0];
        } else {
          if (res.data.length != 0) {
            var selectedAddressDelete = true;
            res.data.forEach(item => {
              if (item.id == selectedAddress.id) {
                selectedAddressDelete = false;
              }
            });
            if (selectedAddressDelete) {
              selectedAddress = res.data[0];
            }
          }
        }
        that.setData({
          addressList: res.data,
          selectedAddress: selectedAddress
        });
       console.log(that.data.addressList)
      }
    });
  },
  addressAddOrUpdate(event) {
    wx.navigateTo({
      url: '/pages/ucenter/newAddAddress/newAddAddress?id=' + event.currentTarget.dataset.addressId
    })

  },
  
  addressSelect(event) {
    let selectedAddress = this.data.selectedAddress;
    let that = this;
    util.request(qianbao.Url_address + "/" + event.currentTarget.dataset.addressId, {}, 'GET').then(function(res) {
      if (res.code === 0) {
        that.setData({
          selectedAddress: res.data
        });
        // myaddress.setChoiceAddress(that.data.selectedAddress);
        // console.log(myaddress.getChoiceAddress())
        wx.setStorageSync("addressSelect", that.data.selectedAddress);
        // that.getShippingFee();
      }
    });
  },
  deleteAddress(event) {
    console.log(event)
    let that = this;
    wx.showModal({
      title: '',
      content: '确定要删除地址？',
      success: function(res) {
        if (res.confirm) {
          let addressId = event.target.dataset.addressId;
          util.request(qianbao.Url_address + "/" + addressId, {}, 'DELETE').then(function(res) {
            console.log(res)
            if (res.code === 0) {
              // wx.navigateBack({
              //   delta: 1
              // })
              that.onLoad()
              wx.setStorageSync("refreshAddress", "needrefresh");
            }
          });
          console.log('用户点击确定')
        }
      }
    })
    return false;
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

  onLoad: function (options) {
    // var selectedAddress=myaddress.getChoiceAddress();
    // this.setData({
    //   addressList:selectedAddress
    // });
    // console.log(this.data.addressList)
    this.getAddressList();
   
  },
  onReady: function () {

  },
  onShow: function () {
    var refreshAddress = wx.getStorageSync("refreshAddress");
    console.log(refreshAddress)
    if (refreshAddress) {
      this.getAddressList();
    }
    wx.removeStorageSync("refreshAddress");
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})