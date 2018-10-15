// component/image-o/image-o.js
//https://help.aliyun.com/document_detail/44688.html?spm=a2c4g.11186623.4.1.fLAaiU
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: String,
    mode: String,
    lazyLoad: Boolean,//lazy-load
    errSrc: String,//err-src 加载失败显示图片
    resize: String,//格式: " m:v,w:v,h:v,l:v,s:v,limit:v,color:v,p:v "
  },

  externalClasses: ['o-class'],

  /**
   * 组件的初始数据
   */
  data: {
    curSrc: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onErr(e){
      var curSrc = this.data.errSrc;
      if (curSrc) {
        this.setData({curSrc});
      }
      this.triggerEvent('error',e.detail);
    }
  },

  attached(){
    var curSrc = this.data.src;
    const path = "x-oss-process=image/resize";
    if (this.data.resize && curSrc.indexOf(path) < 0 && curSrc.indexOf('http') >= 0) {
      curSrc += curSrc.indexOf("?") >= 0 ? "&" : "?";
      curSrc += path;
      const arr = this.data.resize.split(",");
      arr.forEach(obj=>{
        curSrc += ',' + obj.replace(":","_");
      });
    }
    // console.log(curSrc);
    this.setData({curSrc});
  }

})
