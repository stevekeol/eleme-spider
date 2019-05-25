// const http = require("http");
// const url = require("url");
// const cheerio = require("cheerio"); //Node.js的抓取页面模块
// const async = require("async");
// const eventproxy = require('eventproxy'); //解决回调嵌套，让串行等待变成并行等待

// const EVENTPROXY = new eventproxy();

// const test = 'https://h5.ele.me/restapi/member/v2/users/223030102/location?longitude=120.064087&latitude=30.282619';

// const xhrUrl_init = 'https://h5.ele.me/restapi/shopping/v3/restaurants?latitude=30.282619&longitude=120.064087&offset=0&limit=8&extras[]=activities&extras[]=tags&extra_filters=home&rank_id=&terminal=h5';

// const test_0 = 'https://www.itjuzi.com/login';

// let xhrUrl = `https://h5.ele.me/restapi/shopping/v3/restaurants?latitude=30.282619&longitude=120.064087&offset=${offset}&limit=8&extras[]=activities&extras[]=tags&extra_filters=home&rank_id=${rank_id}&terminal=h5`;


const superagent = require("superagent"); //客户端请求代理模块
const async = require("async");

let	offset = 0;
let	rank_id = '';
let	has_next = true;
let	limit = 5;
let	index = 0;
let	url = `https://h5.ele.me/restapi/shopping/v3/restaurants?latitude=30.282619&longitude=120.064087&offset=${offset}&limit=8&extras[]=activities&extras[]=tags&extra_filters=home&rank_id=${rank_id}&terminal=h5`;

let start = function(offset, rank_id) {
	let getStoreAllInfo = function(callback) {
		superagent
	    .get(url)
	    .set('cookie', 'ubt_ssid=letbe83ed2dgw1ubh26xj4aoltlzhxx4_2019-05-22; _utrace=10da00394d52c6cf5dda8e0db2637e1d_2019-05-22; perf_ssid=p133tnt71er6h4bq71ylxhk12w6yqjsd_2019-05-22; cna=DUtqFSf+OyYCATy/M2IUrsNr; _bl_uid=91jU5v3OzeF86mowj7IR3vay6gFv; track_id=1558530274|515fc23c0beb6f1e06927ec367dfdb2e67521443236a8e7ef5|2b3c075a11ca151673d2757abf23dbcd; UTUSER=223030102; tzyy=cc1c26b6992fbc80ad70dc9c7e43c4ac; USERID=223030102; SID=utcIBo9hys04tpgF619JEW1Ht8YI1Ce6UMrg; ZDS=1.0|1558688062|k2Cw5hrBoSF5h1bzz5IGf2ClbaFSKsfgbUtW4GR/qA3qurTczV5LN9iPfDLRb6Rl; isg=BKGhjU9wWZcbjPVhbghCXgAosG2xRB_HiD2PXAN2lagHask8TJ7hElOsyNjJoq14')
	    .set('referer', 'https://h5.ele.me/')
	    .set('user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1')
	    .set('x-uab', '118#ZVWZz2sMZu/oXZCfBHRIZYquZYT4zHWzagC2Voq4mMXHoUZTyHRVPgZuusqhzeWZZZZZXoqVzeAuZZZh0HWWGcb/ZzqTqhZzZgeCc5qVzHZzZeZTVHRVZZZuZwqhzeWzZZZuXTbVzHZzZeZhTgKfgH2Z5Nh6DwmYtHFUpoq4cAIJ+llc/guWQsu2Us41manDSp8JzBnss3ybyCbBub1Lz2wqTA5ZvtM7AY5iQ1uTugZCmrDtKHZzhCAYu+t5RgZTlJTRSmiVZFVxzWaEYrxGqLmRx41C2dYob1PLoF1IV0B47DhVSv8bVcY65NhWeAWBgeo4Gf2fFCcgZrIpJ9EG/tjt7G5jpZwC5GQwIYFOfH0NrLhg+DML4+mFz8vpwAAzIDt+l3PI2bJe0VB1rTOszhOeTweJ0VlZYb0yAhmKHzoknkGQfJH6vLYh1F+fyGfexUZ8Hy19lQWQlmgUSfOfAF1NR/jzEmm6qt6b4ycVdtdNtrdaSn2d4lGJVfLS+aHfIsBpIZzEI9uqU1lmboetZGxrTOchqvK/Li2PZs6LAHNgq8x9NsZkXZtWU7sUD8hBLFnzhIkGm33if/D2+mGBbgEwUhQrwG6fWSmsk/oLZM5RnUa2Hmgbcr6Ky1UkCI+ZrZUlYSPRkvgvlVVWYbOXD9cOccUfRsbM9dtxh8dF47Hx54ow0S2fwzfP5IfqxNdMtVfa3FpoOlvtCATCrcCu/Nknf0R9MIMQJAqqikU3b+GW8Qy+dicNIeGjVcYFSTA=')
	    .end(function(err, res) {
	    	// console.log(res.body);
	      callback(null, res.body);
	    });	
	}

	let getStoreCriticalInfo = function(storeAllInfos, callback) {
		let storeList = [...storeAllInfos.items];
		storeList.forEach(function(store, index, arr) {
			let storeInfo = {
				name: '', //商家名称
				id: '', //商家id
				phone: '', //商家电话
				address: '', //商家地址
				scheme: '', //商家主页
				flavors: [], //品类
				is_new: false, //是否新商家
				latitude: '', //商家纬度
				longitude: '', //商家经度
				rating: '', //商家评分
				recent_order_num: '', //月销量
				order_lead_time: '' //平均配送时长
			};
			console.log(`\n第${offset+index}家店铺：`);
			storeInfo.name = store.restaurant.name;
			storeInfo.id = store.restaurant.id;
			storeInfo.phone = store.restaurant.phone;
			storeInfo.address = store.restaurant.address;
			storeInfo.scheme = store.restaurant.scheme;
			storeInfo.flavors = store.restaurant.flavors;
			storeInfo.is_new = store.restaurant.is_new;
			storeInfo.latitude = store.restaurant.latitude;
			storeInfo.longitude = store.restaurant.longitude;
			storeInfo.rating = store.restaurant.rating;
			storeInfo.recent_order_num = store.restaurant.recent_order_num;
			storeInfo.order_lead_time = store.restaurant.order_lead_time;	
			console.log(storeInfo);
		});
		callback(null, storeAllInfos);
	}

	async.waterfall([getStoreAllInfo, getStoreCriticalInfo], function(err, result) {
		has_next = result.has_next;
		offset = offset + 8;
		rank_id = result.meta.rank_id;
		url = `https://h5.ele.me/restapi/shopping/v3/restaurants?latitude=30.282619&longitude=120.064087&offset=${offset}&limit=8&extras[]=activities&extras[]=tags&extra_filters=home&rank_id=${rank_id}&terminal=h5`;
		index = index + 1;
		if(has_next && index < 1) {
			start(offset, rank_id);
		} else {
			console.log(`\n已经停止于： ${new Date()}, 共执行了${index}个循环！\n`)
		}
	});
}

start(offset, rank_id);
