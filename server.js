const http = require("http");
const cluster = require('cluster');
const superagent = require("superagent"); //客户端请求代理模块
const async = require("async");
// const nodeExcel = require('excel-export');

const mongoose = require('mongoose');
global.mongoose = require('mongoose');
global.db = mongoose.connection;
db.on('open', function(cb){ console.log(`[${common.formatTime(new Date())}]爬虫已准备就绪...`)});
mongoose.connect("mongodb://127.0.0.1:‌​27017/eleme-spider", {useNewUrlParser:true});

const mongoHandler = require('./mongodb/mongoHandler.js');
const common = require('./utils/common.js');
const config = require('./utils/config.js');


let isSpidering = false;

function onRequest(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8', 'Access-Control-Allow-origin': req.headers.origin});
    const url = req.url;
    const route = common.getQueryStringRoute(url);
    const args = common.getQueryStringArgs(url);
    // console.log(args);

    if( route == 'getSpiderSummaryData' ) {
        let getSpiderInfo = function(callback) {
            mongoHandler.getSpiderInfo(callback);
        } 
        let getCitySpiderInfo = function(callback) {
            mongoHandler.getCitySpiderInfo(callback);
        }
        async.parallel([getSpiderInfo, getCitySpiderInfo], function(err, results){
            let result = {
                totalStoresCount: results[0][0].totalStoresCount,
                spideredCitys: results[0][0].spideredCitys,
                currentCity: results[0][0].currentCity,
                currentState: results[0][0].currentState,
                items: results[1]          
            }
            res.end(JSON.stringify(result));
        });
    } else if ( route == 'geCitySpiderInfo') {
        let getCitySpiderInfo = function(callback) {
            mongoHandler.getCitySpiderInfo(callback);
        }
        async.parallel([getCitySpiderInfo], function(err, results){
            let result = {
                items: results[0]
            }
            res.end(JSON.stringify(result));
        }); 
    } else if ( route == 'exportDataToExcel' ) {
        var getStoreInfo = function(callback) {
            mongoHandler.getStoreInfo(args, callback);
        }
        async.waterfall([getStoreInfo], function(err, result) {
            let resultReturn = {
                resteraunts: result
            }
            res.end(JSON.stringify(resultReturn));
        });
    } else if ( route == 'startSpiderTask' ) {
        if(!isSpidering) {
            isSpidering = true; //开始爬取的标志
            const   startDate = new Date(); //开始时间
            let endDate = false;    //结束时间
            let COUNT = config.limit; //人为控制爬取次数

            //代理请求的中心位置
            let location = {
                latitude: common.detailLocation(args.latitude) || 30.681090,
                longitude: common.detailLocation(args.longitude) || 104.101420,
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
                let getStoresList = function(updatedStoreInfo, callback) {
                    superagent
                    .get(url)
                    .set('cookie', config.cookie_storeList)
                    .set('referer', 'https://h5.ele.me/')
                    .set('user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1')
                    .set('x-uab', config.x_uab_storeList)
                    .on('error', function(err) {
                        console.log(`爬虫此时出现请求异常： ${common.formatTime(new Date())}`);
                        console.log(err);
                    })
                    .end(function(err, res) {
                        // console.log(res.body.items[0]);
                      callback(null, res.body);
                    }); 
                }

                let getStoreItemInfo = function(storeAllInfos, callback) {
                    // console.log(storeAllInfos.items[0]);
                    let storeList = [...storeAllInfos.items];
                    storeList.forEach(function(store, index, arr) {
                        let storeInfo = {
                            name: store.restaurant.name, //商家名称
                            id: store.restaurant.id, //商家id
                            phone: '', //商家电话
                            address: '', //商家地址
                            scheme: store.restaurant.scheme, //商家主页
                            flavors: common.getFlavorStr(store.restaurant.flavors), //品类
                            is_new: store.restaurant.is_new, //是否新商家
                            latitude: store.restaurant.latitude, //商家纬度
                            longitude: store.restaurant.longitude, //商家经度
                            rating: store.restaurant.rating, //商家评分
                            recent_order_num: store.restaurant.recent_order_num, //月销量
                            order_lead_time: store.restaurant.order_lead_time, //平均配送时长
                            province: location.province, // 所在省份
                            city: location.city // 所在城市
                        };

                        common.sleep(parseInt(1000)); //每秒请求一个商家数据

                        let urlGetPhoneAddress = `https://h5.ele.me/pizza/shopping/restaurants/${store.restaurant.id}/batch_shop?user_id=${config.user_id}&code=0.${store.restaurant.authentic_id}&extras=%5B%22activities%22%2C%22albums%22%2C%22license%22%2C%22identification%22%2C%22qualification%22%5D&terminal=h5`;
                        let getStorePhoneAddressInfo = function(callback) {
                            superagent
                            .get(urlGetPhoneAddress)
                            .set('cookie', config.cookie_storeInfo)
                            .set('referer', 'https://h5.ele.me/shop/')
                            .set('user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1')
                            .set('x-uab', config.x_uab_storeInfo)
                            .on('error', function(err) {
                                console.log(`爬虫此时出现请求异常： ${common.formatTime(new Date())}`);
                                console.log(err);
                            })
                            .end(function(err, res) {
                                storeInfo.phone = res.body.rst.phone;
                                storeInfo.address = res.body.rst.address;
                                console.log(storeInfo); //即将要存储的对象
                                mongoHandler.saveStoreInfo(storeInfo);
                                callback(null, res.body.rst);
                            }); 
                        }

                        async.waterfall([getStorePhoneAddressInfo], function(err, result) {
                            //
                        })
                    });
                    callback(null, storeAllInfos);
                }

                async.waterfall([updateSpiderInfoBeforeSpider, getStoresList, getStoreItemInfo], function(err, result) {
                    // console.log(result);
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
            // console.log('isSpidering: ' + isSpidering);
            // console.log('其余请求/正在爬取中...');
        }
    }
}

http.createServer(onRequest).listen(3000);
