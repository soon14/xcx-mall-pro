const util = require('../../utils/util.js');
const qianbao = require('../../config/qianbao.js');
const home = require('../../services/home.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var path = "?";
    for (var key in options) {
      path = path + key + "=" + options[key] + "&";
    }
    path = path.substring(0, path.length - 1);

    util.request(qianbao.Url_Configs + '?key=scanType', ).then(res => {
      if (res.code === 0 && res.data && res.data[0]) {
        var configs = JSON.parse(res.data[0].value);
        var hasOrder = false;
        var hasPay = false;
        var hasWifi = false;   

        configs.forEach(func => {
          if (func.code == "1") {
            hasOrder = func.isSelect;
          }
          if (func.code == '2') {
            hasPay = func.isSelect;
          }
          if (func.code == '3') {
            hasWifi = func.isSelect;
          }
        });
        
        if (hasOrder && !hasPay && !hasWifi) {
          path = "/pages/orderMenu/orderMenu" + path;
        } else if (hasPay && !hasOrder && !hasWifi) {
          path = "/pages/payInput/payInput" + path;
        } else if (hasWifi && !hasOrder && !hasPay) {
          path = "/pages/wifi/wifiSetting" + path;
        }else{
          path = "/pages/scanFunctions/scanFunctions" + path + "&showOrder=" + (hasOrder ? "1" : "0") + "&showPay=" + (hasPay ? "1" : "0") + "&showWifi=" +(hasWifi?"1":"0");
        }

      }else{
        path = "/pages/orderMenu/orderMenu" + path;
      }
      wx.reLaunch({
        url: path,
      });
    });
 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    home.focus();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})