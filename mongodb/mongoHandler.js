var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var models = require('./models.js');
var common = require('../utils/common.js');

var storeInfoModel = mongoose.model('storeInfo', models.getSchema('storeInfo')); 

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
	    'province': '',
	    'city': '',
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
                }
            });    
        }
    });
};

module.exports.saveStoreInfo = saveStoreInfo;

