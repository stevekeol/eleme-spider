var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var models = require('./models.js');
var common = require('../utils/common.js');

var storeInfoModel = mongoose.model('storeInfo', models.getSchema('storeInfo'));
var citySpiderInfoModel = mongoose.model('citySpiderInfo', models.getSchema('citySpiderInfo'));
var spiderInfoModel = mongoose.model('spiderInfo', models.getSchema('spiderInfo'));

var saveStoreInfo = function(storeInfo) {
    var storeInfo = {
            'name': storeInfo.name,
            'id': storeInfo.id,
            'phone': storeInfo.phone,
            'address': storeInfo.address,
            'scheme': storeInfo.scheme,
            'flavors': storeInfo.flavors,
            'is_new': storeInfo.is_new,
            'latitude': storeInfo.latitude,
            'longitude': storeInfo.longitude,
            'rating': storeInfo.rating,
            'recent_order_num': storeInfo.recent_order_num,
            'order_lead_time': storeInfo.order_lead_time,
            'province': storeInfo.province,
            'city': storeInfo.city,
            'createTime': common.formatTime(new Date())
    }

    //查找某个字段的文档，没有的话，就创建
    storeInfoModel.findOne({'id': storeInfo.id}, function(err, row) {
        if(err) {
            console.log('数据库操作失败');
        }
        if(row) {
            // callback(null, row);
            console.log('该商家已存在');
        } else {
            storeInfoModel.create(storeInfo, function(err, result) {
                if(err) {
                    console.log(err);
                    console.log('该商家创建失败');
                } else{
                    console.log('该商家已创建');
                    // callback(null, result);
                    // 
                }
            });    
        }
    });
};

var updateSpiderInfoBeforeSpider = function(spiderInfo, callback) {
    let spiderInfoOptions = {
        'currentCity': spiderInfo.city,
        'currentState': '采集中'
    }
    spiderInfoModel.findOneAndUpdate({"id": "stevekeol@sina.com"}, spiderInfoOptions, {'new': true}, function(err, row) {
        if(err) console.log(err);
        // console.log(row);
        callback(null, row);
    });   
}

var updateSpiderInfoAfterSpider = function(spiderInfo, callback) {
    { $inc: { orderId: 1 } }
    let spiderInfoOptions = {
        $inc: {
            totalStoresCount: spiderInfo.addCount,
            spideredCitys: 1
        },
        'currentState': '采集完成'
    }
    spiderInfoModel.findOneAndUpdate({"id": "stevekeol@sina.com"}, spiderInfoOptions, {'new': true}, function(err, row) {
        if(err) console.log(err);
        // console.log(row);
        callback(null, row);
    });   
}

var updateCitySpiderInfoAfterSpider = function(spiderInfo, callback) {
    //查找某个字段的文档，没有的话，就创建
    citySpiderInfoModel.findOne({'province': spiderInfo.province, 'city': spiderInfo.city}, function(err, row) {
        if(err) {
            console.log('数据库操作失败: updateCitySpiderInfoAfterSpider');
        }
        if(row) {
            let options = {
                endTime: common.formatTime(new Date()),
                state: '采集完成',
                $inc: {
                    count: spiderInfo.addCount
                }             
            }
            citySpiderInfoModel.findOneAndUpdate({'province': spiderInfo.province, 'city': spiderInfo.city}, options, function(err, result) {
                if(err) console.log(err);
                // console.log(result);
                callback(null, result);
            })
        } else {
            let options = {
                province: spiderInfo.province,
                city: spiderInfo.city,
                count: spiderInfo.addCount,
                state: spiderInfo.state,
                endTime: common.formatTime(new Date())
            }
            citySpiderInfoModel.create(options, function(err, result) {
                if(err) {
                    console.log(err);
                    console.log('该商家创建失败: updateCitySpiderInfoAfterSpider');
                } else{
                    // console.log(result);
                    callback(null, result);
                }
            });    
        }
    });  
}

var getCitySpiderInfo = function(callback) {
    var citySpiderInfo = {
        'province': '浙江',
        'city': '杭州',
        'endTime': common.formatTime(new Date()),
        'count': 32765,
        'state': '采集完成'
    };

    citySpiderInfoModel.find({}, function(err, row) {
        if(err) console.log(err);
        if(row) {
            // console.log(row);
            // 
            // citySpiderInfoModel.create(citySpiderInfo, function(err, result) {
            //     if(err) {
            //         console.log(err);
            //         console.log('该商家创建失败');
            //     } else{
            //         console.log('getCitySpiderInfo的schema已创建');
            //         // callback(null, result);
            //     }
            // }); 
            callback(null, row);
        } else {
            console.log('尚无citySpiderInfo信息');
        }
    })
}

var getSpiderInfo = function(callback) {
    var spiderInfo = {
        'totalStoresCount': 86236,
        'spideredCitys': 4,
        'currentCity': '成都',
        'currentState': '采集中'

    };

    spiderInfoModel.find({"id": "stevekeol@sina.com"}, function(err, row) {
        if(err) console.log(err);
        if(row) {
            // console.log(row);
            // 
            // spiderInfoModel.create(spiderInfo, function(err, result) {
            //     if(err) {
            //         console.log(err);
            //         console.log('该商家创建失败');
            //     } else{
            //         console.log('getSpiderInfo的schema已创建');
            //         // callback(null, result);
            //     }
            // }); 
            callback(null, row);            
        } else {
            console.log('尚无spiderInfo信息');
            spiderInfoModel.create(spiderInfo, function(err, result) {
                if(err) {
                    console.log(err);
                    console.log('该商家创建失败');
                } else{
                    console.log('该商家已创建');
                    // callback(null, result);
                }
            });             
        }
    })
}

var getStoreInfo = function(downloadOption, callback) {
    // console.log(downloadOption);
    storeInfoModel.find({'is_new': true}, function(err, row) {    
    // storeInfoModel.find({'province': downloadOption.province, 'city': downloadOption.city}, function(err, row) {
        if(err) {
            console.log('数据库操作失败');
        }
        if(row) {
            callback(null, row);
        } else {
            console.log('尚无商家资料');
        }
    });
};



module.exports.saveStoreInfo = saveStoreInfo;
module.exports.getCitySpiderInfo = getCitySpiderInfo;
module.exports.getSpiderInfo = getSpiderInfo;
module.exports.getStoreInfo = getStoreInfo;
module.exports.updateSpiderInfoBeforeSpider = updateSpiderInfoBeforeSpider;
module.exports.updateSpiderInfoAfterSpider = updateSpiderInfoAfterSpider;
module.exports.updateCitySpiderInfoAfterSpider = updateCitySpiderInfoAfterSpider;

