// component/coupon/coupon.js
Component({
  /**
   * 组件的属性列表
   */
  /**
   * coupons字段列表
   * 'discount':   优惠券金额
   * 'workCondition':   使用条件 
   * 'workInfo':    提示语
   * 'deadLine':  截止日期
   * 'status' : "unUse":显示最后边的"立即使用"按钮
   *            "deadLined":显示最右边"已过期"图样
   *            "used":显示最右边"已使用的按钮"
   *            "check":显示最右边的单选框
   *            "geted":显示最右边 已领取的图标
   *            "quantityEmpty":库存不足
   *            "" : 不显示
   * "isCheck" : 和status的'check'配合使用，标志该优惠券是否选用
   *  couponUnUsefulReson:[]//不可用原因--数组
   */
  properties: {
    middleColor:{//优惠券的背景颜色，用于设置中间凹进去的底色
      type:null,
      value: 'rgba(255, 236, 208, 1)'
    },

   itemHeight:{//优惠券的高度
      type:null,
      value:160
   },
    coupons :{//优惠券数据
      type:null,
      value:[]
    },
    
    checked:{
      type: null,
      value:false
    },
    showMiddle:{
      type:null,
      value:false
    },
    couponsTitleColor:{
      type:null,
      value: "#434343"
    },
    isSingleChoose:{//可以选择优惠券，这边判断是否是单选/默认单选
      type:null,
      value:true
    },
    allowCheck:{
      type: null,
      value: true
    },
    tipsPaddingLeft:{
      type:null,
      value:40
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    singleSelectedCoupons: new Map(),
    multiSelectedCoupons: new Map()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onItemClick : function(res){
      if (!this.data.allowCheck){
        return;
      }
      var clickItem = res.currentTarget.dataset.clickitem;
      var coupons = this.data.coupons;
      var coupon = coupons[clickItem];
      var multiSelectedCoupons = new Map();
      var singleSelectedCoupons = new Map();
      if (this.data.isSingleChoose){//单选
        //如果已经选择过一个，直接修改single中的数据，否则直接添加
       if (this.data.singleSelectedCoupons.size == 1 ){
          singleSelectedCoupons = this.data.singleSelectedCoupons;;
          //修改singleSelectedCoupon中数据
          singleSelectedCoupons.forEach(function(value,key){
            coupons[key].isCheck = false;
            value.isCheck = false;
          });
          singleSelectedCoupons.clear();
          }else{
             if(!coupon.isCheck){
               coupon.isCheck = false;
             }
          }
        coupon.isCheck = !coupon.isCheck;
        singleSelectedCoupons.set(clickItem, coupon);
      }else{
        if (this.data.multiSelectedCoupons.size){
          multiSelectedCoupons = this.data.multiSelectedCoupons;
        }
        if(!multiSelectedCoupons.has(clickItem)){
          coupon.isCheck = false;
        }
        coupon.isCheck = !coupon.isCheck
        multiSelectedCoupons.set(clickItem, coupon);
      }

      this.setData({
        coupons,
        singleSelectedCoupons,
        multiSelectedCoupons
      });

      if (this.data.isSingleChoose){
        this.triggerEvent("singleSelected",singleSelectedCoupons);
      }else{
        this.triggerEvent("multiSelected", multiSelectedCoupons);
      }
    }
  }
})
