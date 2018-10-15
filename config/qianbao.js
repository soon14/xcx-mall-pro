const { SellerID, ApiRootUrl, version } = wx.getExtConfigSync()
module.exports = {
  Url_AuthLoginByWeixin: ApiRootUrl + '/sc/'+version+'/sellers/' + SellerID + '/auth/loginByWeixin', //微信登录
  Url_AuthLoginByAccount: `${ApiRootUrl}/uc/auth/login`, //微信登录
  Url_Goods: ApiRootUrl + '/sc/'+version+'/sellers/' + SellerID + '/goods',  //商品接口
  Url_Brands: ApiRootUrl + '/sc/'+version+'/sellers/' + SellerID + '/brands',  //品牌接口
  Url_Messages: ApiRootUrl + '/sc/' + version + '/sellers/' + SellerID + '/messages',  //品牌接口
  Url_Cart: ApiRootUrl + '/sc/'+version+'/sellers/' + SellerID + '/cart',  //购物车接口
  Url_Orders: `${ApiRootUrl}/sc/${version}` + '/sellers/' + SellerID + '/me/orders',  //订单接口、创建外卖订单或商城订单接口
  Url_Desks: ApiRootUrl + '/sc/'+version+'/sellers/' + SellerID + '/desks/',  // 桌台信息
  Url_Mobile: ApiRootUrl + '/sc/' + version + '/sellers/' + SellerID + '/members', //绑定手机号
  
  Url_Contents: `${ApiRootUrl}/sc/${version}/sellers/${SellerID}/contents`,  //内容接口
  Url_Qrcodes: `${ApiRootUrl}/sc/${version}/sellers/${SellerID}/qr-codes`,  //二维码
  Url_Sellers: `${ApiRootUrl}/sc/${version}/sellers/${SellerID}`,  //Sellers


  //登录
  Url_Coupons: ApiRootUrl + '/sc/' + version + '/sellers/' + SellerID + '/coupons', // 获取优惠卡列表
  Url_Cards: ApiRootUrl + '/sc/' + version + '/sellers/' + SellerID + '/cards', // 获取会员卡信息
  // Url_CardsCallBack: ApiRootUrl + '/sc/' + version + '/sellers/' + SellerID + '/cards/callback', //领取会员卡后回调
  Url_CardsCallReceive: ApiRootUrl + '/sc/' + version + '/sellers/' + SellerID + '/me/wx/card-sign', // 领取会员卡
  Url_AppUsers: ApiRootUrl + '/sc/' + version + '/sellers/' + SellerID + '/me/wx/app-users',
  Url_UserCards: ApiRootUrl + '/sc/' + version + '/sellers/' + SellerID + '/me/wx/user-cards',
  //bc
  Url_Catalogs: ApiRootUrl + '/bc/'+version+'/sellers/' + SellerID+'/catalogs',  //分类目录接口

  //cc
  Url_Files: ApiRootUrl + '/cc/'+version+'/sellers/' + SellerID + '/files',  //文件接口
  Url_Comments: ApiRootUrl + '/cc/'+version+'/sellers/' + SellerID + '/comments',  //评论接口
  Url_Footprints: ApiRootUrl + '/sc/' + version + '/sellers/' + SellerID + '/footprints',  //足迹接口

  Url_Configs: ApiRootUrl + '/sc/' + version + '/sellers/' + SellerID + '/configs',  //配置接口
  //tc
  Url_PayPrepayId: ApiRootUrl + '/${version}/tc/sellers/' + SellerID + '/pay/prepay',  //获取微信统一下单prepay_id
  Url_Desks:`${ApiRootUrl}/sc/${version}/sellers/${SellerID}/desks/`,  // 桌台信息

  Url_Reservation:`${ApiRootUrl}/sc/${version}/sellers/${SellerID}/reservations/`, //预约
  Url_Places:`${ApiRootUrl}/sc/${version}/sellers/${SellerID}/places`,//桌台
  Url_Catalogs:`${ApiRootUrl}/sc/${version}/sellers/${SellerID}/catalogs`,//分类
  Url_Inventories:`${ApiRootUrl}/sc/${version}/sellers/${SellerID}/inventories`,//商品库存
  Url_ProductAttrs:`${ApiRootUrl}/sc/${version}/sellers/${SellerID}/product-attrs`,//商品规格
  Url_ProductTpls:`${ApiRootUrl}/sc/${version}/sellers/${SellerID}/product-tpls`,//商品模板
  Url_Products:`${ApiRootUrl}/sc/${version}/sellers/${SellerID}/products`,//商品
  Url_trade:`${ApiRootUrl}/sc/${version}/sellers/${SellerID}/trade`,//商品
  // mc
  // Url_UserCard: `${ApiRootUrl}/mc/${version}/user/cards`
	
	Url_dada_per: `${ApiRootUrl}/sc/${version}` + '/sellers/' + SellerID + '/dada/pre-order',  //创建哒哒预订单接口
	Url_address: `${ApiRootUrl}/sc/${version}/sellers/${SellerID}/me/addresses`,//收货地址相关接口

};