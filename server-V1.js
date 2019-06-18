const http = require("http");
const cluster = require('cluster');
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
var nodeExcel = require('excel-export');
const common = require('./utils/common.js');

const mongoose = require('mongoose');
global.mongoose = require('mongoose');

let isSpidering = false;

const mongoHandler = require('./mongodb/mongoHandler.js');

mongoose.connect("mongodb://127.0.0.1:‌​27017/eleme-spider", {useNewUrlParser:true});

global.db = mongoose.connection;
db.on('open', function(cb){
    console.log('以下是爬虫初始测试结果');
});


function onRequest(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8', 'Access-Control-Allow-origin': req.headers.origin});
        // res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        // res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");  

    console.log(decodeURI(req.url));
    const url = req.url;
    const route = common.getQueryStringRoute(url);
    const args = common.getQueryStringArgs(url);
    console.log(args);

    if( route == 'getSpiderSummaryData' ) {

        let getSpiderInfo = function(callback) {
            mongoHandler.getSpiderInfo(callback);
        } 

        let getCitySpiderInfo = function(callback) {
            mongoHandler.getCitySpiderInfo(callback);
        }

        async.parallel([getSpiderInfo, getCitySpiderInfo], function(err, results){
            console.log(results[0][0]);
            let result = {
                totalStoresCount: results[0][0].totalStoresCount,
                spideredCitys: results[0][0].spideredCitys,
                currentCity: results[0][0].currentCity,
                currentState: results[0][0].currentState,
                items: results[1]          
            }
            res.end(JSON.stringify(result));
        });
    } else if(route == 'geCitySpiderInfo') {
        let getCitySpiderInfo = function(callback) {
            mongoHandler.getCitySpiderInfo(callback);
        }
        async.parallel([getCitySpiderInfo], function(err, results){
            // console.log(results);
            let result = {
                items: results[0]
            }
            res.end(JSON.stringify(result));
        }); 
    } else if( route == 'startSpiderTask' ) {
        if(!isSpidering) {
            isSpidering = true; //开始爬取的标志
            const   startDate = new Date(); //开始时间
            let endDate = false;    //结束时间
            let COUNT = 1; //人为控制爬取次数

            //增加经纬度精度（2->6）
            function detailLocation(latLong) {
                return parseFloat(latLong.toString() + Math.floor(Math.random()*10000));
            }

            //代理请求的中心位置
            let location = {
                latitude: detailLocation(args.latitude) || 30.681090,
                longitude: detailLocation(args.longitude) || 104.101420,
                province: args.province || '四川',
                city: args.city || '成都'
            }

            let offset = 0;
            let rank_id = '';
            let has_next = true;
            let index = 0;
            let url = `https://h5.ele.me/restapi/shopping/v3/restaurants?latitude=${location.latitude}&longitude=${location.longitude}&offset=${offset}&limit=8&extras[]=activities&extras[]=tags&extra_filters=home&rank_id=${rank_id}&terminal=h5`;

            let startSpider = function(offset, rank_id) {
                let updateSpiderInfoBeforeSpider = function(callback) {
                    mongoHandler.updateSpiderInfoBeforeSpider(location, callback);
                }
                let getStoreAllInfo = function(updatedStoreInfo, callback) {
                    superagent
                    .get(url)
                    .set('cookie', 'uubt_ssid=lx2z5w6qgv9dzylb7w6lkbkc873z9ha9_2019-06-14; perf_ssid=5zlndkgl7xkry6v2h1iuhlq1qv0obfho_2019-06-14; cna=RV+3E1HM8nECAX14UTCd167l; _utrace=969eb28399f0253fc7972c9e7479fcd6_2019-06-14; _bl_uid=3kj5swkIvXwswtfay011g1gqeegs; track_id=1560498416|c4a69fee92c34e5ed10f049ad1f6edc44f4c12b1b3ec140612|91ad1e42478fd35e0123294a59373e7b; USERID=6319384082; UTUSER=6319384082; SID=athtVAhRWIIbBvviY4tsCp8QhUCJDfxTXSPQ; ZDS=1.0|1560498416|or3mUt9ejIpXD0dFaZBwWsnqF7Lg7A5808SkuN2gKMNQBvfQfjur0WmPQhDcfHzw; tzyy=aa11ca277ab35e99d0ebcc63c05d3371; pizza73686f7070696e67=_HHDoSEnvf1b4cmn579Jwpoao-WSgWda2T5pHEP1Oi90k5cjC-KTISsPOKXrEkbE; isg=BFFRjvoh6GOPGAWRvrjyTtC4YF3htM-42M1fTDPmTZgh2nEsew7VAP88eOiZUl1o')
                    .set('referer', 'https://h5.ele.me/')
                    .set('user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1')
                    .set('x-uab', '118#ZVWZz7EIAHplUZx3BeJgZYquZYT4zHWzagC2Voq4mMXHoUZTyHRVPgZuusqhzeWZZgZZXoqVzeAuZZZh0HWWGcb/ZzqTqhZzZgZCcfq4zH2ZZZChXHWVZZZZusqhzeWZZgCuTOq4zH2ZZZY6yT4fZgV0sXnVqJaJzY9/VoiB37E2cJCvZxuD2CK9CeYKhiWX2meofYuOI/cI3wm9GMH7ZZe3L4PXZZxq3Z2xCFpfZYiP+7Mw7YyEuyVF/w1yZmhFBsEfPw2j7jtBqrC2laG89UiOc68DFTY3MZbsMjo8+oMmL/zswPmkoG2AL5f/g6izRdRjZZNzMmmuRB2RIIZn7mP3AHuQibA/MHXMqmGJQmD9ojMWtmWuLgFwes3CsotKwE1a9Pup/eqQIWiqXUVC+Pk4l1uNNmP33ccvhEhNnvtGyNHGV+wYav6qxOteRLZK8XguJDz2sR8GCW9mXC5HVSFQvzhg0VreHSPBJ2b485X2rLPzCX9muoJmx50f6rdmOZ8=')
                    .on('error', function(err) {
                        console.log(`爬虫此时出现请求异常： ${common.formatTime(new Date())}`);
                        console.log(err);
                    })
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
                            order_lead_time: '', //平均配送时长
                            province: '', // 所在省份
                            city: '' // 所在城市
                        };

                        console.log('/*****************');
                        console.log(store.restaurant);
                        console.log('*******************/');

                        storeInfo.name = store.restaurant.name;
                        storeInfo.id = store.restaurant.id;
                        storeInfo.phone = store.restaurant.phone;
                        storeInfo.address = store.restaurant.address;
                        storeInfo.scheme = store.restaurant.scheme;
                        storeInfo.flavors = common.getFlavorStr(store.restaurant.flavors);
                        storeInfo.is_new = store.restaurant.is_new;
                        storeInfo.latitude = store.restaurant.latitude;
                        storeInfo.longitude = store.restaurant.longitude;
                        storeInfo.rating = store.restaurant.rating;
                        storeInfo.recent_order_num = store.restaurant.recent_order_num;
                        storeInfo.order_lead_time = store.restaurant.order_lead_time; 
                        storeInfo.province = location.province;
                        storeInfo.city = location.city;  

                        console.log(`\n第${(offset) + index}家店铺：`);
                        console.log(storeInfo); //即将要存储的对象

                        mongoHandler.saveStoreInfo(storeInfo);
                    });
                    callback(null, storeAllInfos);
                }

                async.waterfall([updateSpiderInfoBeforeSpider, getStoreAllInfo, getStoreCriticalInfo], function(err, result) {
                    console.log(result);
                    has_next = result.has_next;
                    offset = offset + 8;
                    rank_id = result.meta.rank_id;
                    url = `https://h5.ele.me/restapi/shopping/v3/restaurants?latitude=${location.latitude}&longitude=${location.longitude}&offset=${offset}&limit=8&extras[]=activities&extras[]=tags&extra_filters=home&rank_id=${rank_id}&terminal=h5`;
                    index = index + 1;
                    if(has_next && index < COUNT) {
                        common.sleep(parseInt(Math.random() * 1000));
                        startSpider(offset, rank_id);
                    } else {
                        endDate = new Date();
                        console.log('爬取' + index * 8 + '条商家数据，' + '共耗时：'+ (endDate - startDate) +'ms' +' --> '+ (Math.round((endDate - startDate)/1000/60*100)/100) +'min');
                        isSpidering = false; //停止爬取的标识
                        let updateSpiderInfoAfterSpider = function(callback) {
                            let optionsAfterSpider = {
                                addCount: index * 8,
                            };
                            mongoHandler.updateSpiderInfoAfterSpider(optionsAfterSpider, callback);
                        }

                        let updateCitySpiderInfoAfterSpider = function(updatedSpiderInfo, callback) {
                            let optionsAfterSpider = {
                                province: location.province,
                                city: location.city,
                                addCount: index * 8,
                                state: '采集完成'
                            };                            
                            mongoHandler.updateCitySpiderInfoAfterSpider(optionsAfterSpider, callback);
                        }

                        async.waterfall([updateSpiderInfoAfterSpider, updateCitySpiderInfoAfterSpider], function(err, result) {
                            // console.log(result);
                            //给前端返回标记
                        })
                    }
                });
            }
            startSpider(offset, rank_id);
        } else {
            console.log('isSpidering: ' + isSpidering);
            console.log('其余请求/正在爬取中...');
        }
    } else if( route == 'exportDataToExcel' ) {
        var getStoreInfo = function(callback) {
            mongoHandler.getStoreInfo(args, callback);
        }
        async.waterfall([getStoreInfo], function(err, result) {
            let resultReturn = {
                resteraunts: result
            }
            console.log(result);
            res.end(JSON.stringify(resultReturn));
        });
    }
}

http.createServer(onRequest).listen(3000);
console.log('象扑： Spider已经准备就绪...');