const { SellerID, ApiRootUrl, MpAppID } = wx.getExtConfigSync();
import { logout } from './logger.js'

const url_rfToken = ApiRootUrl + '/uc/' + 'v1' +'/auth/refresh-token';
const url_login = ApiRootUrl + '/sc/' + 'v1' + '/sellers/' + SellerID + '/user/login/wx-miniapp';

const vinci_expireIn = 7000 * 1000; //token存活时间,2h,此处设置7000s

let vinciToken = wx.getStorageSync('vinci_token');
let updateToken = false;

//登录
function login(data) {
  return request(url_login, data, 'POST').then(res=>{
    let token = {
      tokenType: res.data.tokenType,
      accessToken: res.data.accessToken,
      expiration: Date.now() + vinci_expireIn,
      refreshToken: res.data.refreshToken,
    };
    setVinciToken(token);
    return res;
  });
}

//微信API登录 获取code
function wxGetLoginCode() {
  return new Promise((resolve, reject)=>{
    wx.login({
      success: res=> {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(res);
        }
      },
      fail: reject
    });
  });
}

//微信API 获取登录者微信信息 可能会废弃 
function wxGetUserInfo() {
  return new Promise((resolve, reject)=>{
    wx.getUserInfo({
      withCredentials: true,
      success: res=> {
        resolve(res);
      },
      fail: err=> {
        reject(err);
      },
    });
  });
}

//自动登录
function autoLogin(){
  return wxGetLoginCode().then(code=>{
    return login({ jsCode : code });
  });
}

//授权登录
function authLogin(){
  return wxGetLoginCode().then(code=>{
    return wxGetUserInfo().then(info=>{
      return login({
        jsCode : code ,
        encryptedData : info.encryptedData,
        iv : info.iv
      });
    });
  });
}

//刷新token
function refreshToken(rfToken) {
  if (rfToken) {
    return request(url_rfToken,{refreshToken: rfToken}, 'POST').then(res=>{
      let token = {
        tokenType: res.data.tokenType,
        accessToken: res.data.accessToken,
        expiration: Date.now() + vinci_expireIn,
        refreshToken: res.data.refreshToken,
      };
      setVinciToken(token);
      return token;
    });
  }else{
    return Promise.reject();
  }
}

function delayGetVinciToken () {
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      getVinciToken().then(res=>{
        resolve(res);
      }).catch(err=>{
        reject(err);
      });
    },100);
  });
}

function getVinciToken () {
  return new Promise((resolve, reject)=>{

    if (updateToken) {
      delayGetVinciToken().then(res=>{
        resolve(res);
      }).catch(err=>{
        reject(err);
      });
      return;
    }

    const token = vinciToken;
    if (token) {
      if (Date.now() < token.expiration) {
        resolve(token);
      } else {
        updateToken = true;
        refreshToken(token.refreshToken).then(function (newToken) {
          updateToken = false;
          resolve(newToken);
        }).catch(()=>{
          autoLogin().then(()=>{
            updateToken = false;
            const token = vinciToken;
            resolve(token);
          }).catch(()=>{
            updateToken = false;
            reject();
          });
        });
      }
    } else {
      updateToken = true;
      autoLogin().then(()=>{
        updateToken = false;
        const token = vinciToken;
        resolve(token);
      }).catch(()=>{
        updateToken = false;
        reject();
      });
    }

  });
}

function setVinciToken (token) {
  if (token) {
    wx.setStorageSync('vinci_token', token);
  }else{
    wx.removeStorageSync('vinci_token');
  }
  vinciToken = token;
}

function getRequestInfo({ url, method = 'Get', headers = {}, params, data}){
  return new Promise(function(resolve, reject){
    var header = {
      'Content-Type': 'application/json',
      'accept': 'application/json,text/plain,text/html',
      'content-type': 'application/json; charset=utf-8',
      ...headers,
    };
    const publicPaths = [
      url_login,
      url_rfToken,
    ];
    if (publicPaths.indexOf(url) < 0) {
      getVinciToken().then(token=>{
        header.Authorization = `${token.tokenType} ${token.accessToken}`;
        if (!header.Authorization) {
          reject({ message: '未登录' });
        }else{
          resolve({ url, method, headers:header, params, data });
        }
      }).catch(()=>{
        reject({ message: '未登录' });
      });
    }else{
      resolve({ url, method, headers: header , params, data });
    }
  });
}

function request(url, data, method = 'GET', headers = {}, params) {
    return new Promise(function(resolve, reject) {
      getRequestInfo({ url, method, headers, params, data }).then(function ({ url, method, headers, params, data }){
        // wx.showNavigationBarLoading();

        wx.request({
          url,
          data,
          method,
          header:headers,
          success: function (res) {

            if (res.data.duration > 100) {
              console.log('request time exception === \nurl : ' + url + '\ndata : ' + JSON.stringify(data) + '\nmethod : ' + method + '\nduration : ' + res.data.duration);
            }

            // wx.hideNavigationBarLoading();
            if (res.statusCode == 200 || res.statusCode == 201) {
              if (res.data.code == 0) {
                resolve(res.data)
              }else{
                wx.showToast({
                  icon: 'none',
                  title: `操作失败！${res.data.code}：${res.data.message}`,
                  mask: true
                });
                reject({ message: `接口数据异常，code:${res.data.code}`});
              }
            } else if (res.statusCode == 401) {
              //需要登录后才可以操作
              // wx.showToast({
              //   icon: 'none',
              //   title: '请先登录 401',
              //   mask: true
              // });
              reject({ message: '用户未登录' });
            } else {
              wx.showToast({
                icon: 'none',
                title: `服务器正忙，请重试！${res.statusCode}`,
                mask: true
              });
              reject({ message: `接口请求错误，状态码：${res.statusCode}` });
            }

          },
          fail: function (err) {
            // wx.hideNavigationBarLoading();
            reject({ message: err.errMsg })
          }
        })
      }).catch(function ({ message}){
        reject({ message });
      });
    });
}

module.exports= {
  request,
  autoLogin,
  authLogin
}

