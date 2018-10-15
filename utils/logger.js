/*
 * @Author: lichao
 * @Date:   2018-06-20 09:59:11
 * @Last Modified by:   lichao
 * @Last Modified time: 2018-06-20 12:11:44
 */

'use strict';

export function logout() {
    //用户清除localStorage，跳转到登录页
    var fromPage = getCurrentPageUrlWithArgs()
    wx.clearStorageSync()
    wx.reLaunch({ url: `/pages/login/login?from=${encodeURIComponent(fromPage)}` })
}

function getCurrentPageUrl(){
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length-1]    //获取当前页面的对象
    var url = currentPage.route    //当前页面url
    return url;
}

function getCurrentPageUrlWithArgs(){
    var pages = getCurrentPages()    //获取加载的页面
    if (pages[0]) {
        var currentPage = pages[pages.length-1]    //获取当前页面的对象
        var url = currentPage.route    //当前页面url
        var options = currentPage.options    //如果要获取url中所带的参数可以查看options
        //拼接url的参数
        var urlWithArgs = url + '?'
        for(var key in options){
            var value = options[key]
            urlWithArgs += key + '=' + value + '&'
        }
        urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length-1)
        return urlWithArgs
    }else{
        return 'pages/index/index';
    }
    
}