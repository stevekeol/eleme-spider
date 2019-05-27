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
  arr.forEach(function(flavor, index, flavors) {
    flavorStr += ' ' + flavor.name;
  });
  //去除字符串前面的空格并返回
  return flavorStr.replace(/(^\s*)/g, "");  
}

module.exports.getRequestParam = getRequestParam;
module.exports.formatTime = formatTime;
module.exports.formatSimpleTime = formatSimpleTime;
module.exports.getFlavorStr = getFlavorStr;