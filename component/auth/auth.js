// component/auth/auth.js
const auth = require('../../services/auth.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  externalClasses: ['a-class', 'a-style'],
  /**
   * 组件的初始数据
   */
  data: {
    isAuth:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGetUserInfo(e){
      let _this = this;
      if (e.detail.userInfo){
        auth.authLogin().then(res=>{
          _this.triggerEvent('finish', _this.dataset);
        });
      }
    },
    onTap(e){
      this.triggerEvent('finish', this.dataset);
    }
  },

  attached(){
    this.setData({
      isAuth: auth.isAuth(),
    });
  },

})
