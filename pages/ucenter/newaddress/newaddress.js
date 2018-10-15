// pages/ucenter/newaddress/newaddress.js
var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var qianbao = require('../../../config/qianbao.js')
var app = getApp();

Page({
  data: {
    // addressList: [{ id: '1', name: '老王', gender: '男', mobile: '18765430987', locationAddress: '上海市科技绿洲三期', detailAddress: '13号楼2楼' }, { id: '2', name: '电风的士速递房东说扇', gender: '女', mobile: '13908933387', locationAddress: '上海市松江新城', detailAddress: '289号楼3楼' }],
    addressList: [],
    pageNum: 1,
    pageSize: 100,
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.getAddressList();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.getAddressList()
  },
  getAddressList() {
    let addressList = this.data.addressList;
    let that = this;
    util.request(qianbao.Url_address, {
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
    }, 'GET').then(function (res) {
      if (res.code === 0) {
        that.setData({
          addressList: res.data
        });
      }
    });
  },
  addressAddOrUpdate(event) {
    console.log(event)
    wx.navigateTo({
      // url: '/pages/ucenter/newAddAddress/newAddAddress?id=' + event.currentTarget.dataset.addressId
      url: '/pages/ucenter/newAddAddress/newAddAddress?id=' + event.currentTarget.dataset.addressId 
      // + '&name=' + event.currentTarget.dataset.addressName 
      // + '&gender=' + event.currentTarget.dataset.addressGender
      // + '&mobile=' + event.currentTarget.dataset.addressMobile
      // + '&locationAddress=' + event.currentTarget.dataset.addressLocationaddress
      // + '&detailAddress=' + event.currentTarget.dataset.addressDetailaddress
      // + '&title=' + event.currentTarget.dataset.addressTitle
    })
  },
  deleteAddress(event) {
    console.log(event.target)
    let that = this;
    wx.showModal({
      title: '',
      content: '确定要删除地址？',
      success: function (res) {
        if (res.confirm) {
          let addressId = event.target.dataset.addressId;
          util.request(qianbao.Url_address+"/" + addressId, {},'DELETE').then(function (res) {
            if (res.code === 0) {
              that.getAddressList();
            }
          });
          console.log('用户点击确定')
        }
      }
    })
    return false;

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})