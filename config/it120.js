let extConfig = wx.getExtConfigSync? wx.getExtConfigSync(): {}

const ApiRootUrl_it120 = 'https://api.it120.cc/' + extConfig.id;

module.exports = {
  GET_CONFIG_VALUE: ApiRootUrl_it120 + '/config/get-value',// 获取配置参数接口
  GET_CMS_CATEGORY_LIST: ApiRootUrl_it120 + '/cms/category/list',
  GET_CMS_CATEGORY_DETAIL: ApiRootUrl_it120 + '/cms/category/detail',
  GET_CMS_NEWS_LIST: ApiRootUrl_it120 + '/cms/news/list',
  GET_CMS_NEWS_DETAIL: ApiRootUrl_it120 + '/cms/news/detail',
  GET_MALL_SHOP_LIST: ApiRootUrl_it120 + '/shop/subshop/list',
  GET_MALL_GOODS_CATEGORY_LIST: ApiRootUrl_it120 + '/shop/goods/category/all',
  GET_MALL_GOODS_LIST: ApiRootUrl_it120 + '/shop/goods/list',
  GET_MALL_GOODS_DETAIL: ApiRootUrl_it120 + '/shop/goods/detail',
  GET_MALL_SHOP_DETAIL: ApiRootUrl_it120 + '/shop/subshop/detail',
  GET_CONFIG_BANNER_LIST: ApiRootUrl_it120 + '/banner/list',
  GET_CONFIG_BANNER_DETAIL: ApiRootUrl_it120 + '/banner/detail',
  GET_COUPONS_LIST: ApiRootUrl_it120 + '/discounts/coupons',
  GET_NOTICE_LIST: ApiRootUrl_it120 + '/notice/list',
  FETCH_DISCOUNT: ApiRootUrl_it120 + '/discounts/fetch',
  LOGIN_WEIXIN: ApiRootUrl_it120 + '/user/wxapp/login',
  GET_CHANNEL_LIST: ApiRootUrl_it120 +'/friendly-partner/list'
};