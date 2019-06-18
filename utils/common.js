// 前端页面，取出url中参数

var URL = require('url');  
var QUERYSTRING = require('querystring');

// 取出查询参数(从完整url中取出某个具体的参数)
var getRequestParam = function (req, param) {
  var params = QUERYSTRING.parse(URL.parse(req.url).query);
  return params[param];
};


//取年月日时分秒
const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

// 取年月日
const formatSimpleTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('-');
}

//补0操作
const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

//将flavors(商家品类)数组中的字段name,拼接成string
const getFlavorStr  = arr => {
  let flavorStr = '';
  arr = arr || [];
  arr.forEach(function(flavor, index, flavors) {
    flavorStr += ' ' + flavor.name;
  });
  //去除字符串前面的空格
  return flavorStr.replace(/(^\s*)/g, "");  
}

//获取url中的请求参数对象
const getQueryStringArgs = (url = '/?') => {
  let args = {};
  let arr =  url.substring(1).split('?');
  if(arr[1]) {
    let key_values = arr[1].split('&');
    for(let i = 0; i < key_values.length; i++) {
      let item = key_values[i].split('=');
      let name = item[0];
      let value = item[1];
      if(name.length) {
        args[name] = decodeURI(value);
      }
    }
  }
  return args;
}

//获取路径中的路由
const getQueryStringRoute = (url = '/?') => {
  let arr =  url.substring(1).split('?');
  return arr[0];
}


//延迟请求
const sleep = delay => {
  var start = (new Date()).getTime();
  while ((new Date()).getTime() - start < delay) {
    continue;
  }
}

//增加经纬度精度（2位->6位）
const detailLocation = latLong => {
    return parseFloat(latLong.toString() + Math.floor(Math.random()*10000));
}

module.exports.getRequestParam = getRequestParam;
module.exports.formatTime = formatTime;
module.exports.formatSimpleTime = formatSimpleTime;
module.exports.getFlavorStr = getFlavorStr;
module.exports.getQueryStringArgs = getQueryStringArgs;
module.exports.getQueryStringRoute = getQueryStringRoute;
module.exports.sleep = sleep;
module.exports.detailLocation = detailLocation;