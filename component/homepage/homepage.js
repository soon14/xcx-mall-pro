// component/homepage/homepage.js

const home = require('../../services/home.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  
  /**
   * 组件的初始数据
   */
  data: {
    show:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goHome() {
      wx.switchTab({
        url: '/pages/index/index'
      });
    },
  },

  attached(){
    this.setData({
      show: home.getIsShow(),
    });
  },

  

})
