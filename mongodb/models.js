var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var storeInfo = new Schema({
    name: String, //商家名称
    id: String, //商家id
    phone: String, //电话
    address: String, //地址
    scheme: String, //商家主页
    flavors: String, //商家品类
    is_new: String, //是否是新商家
    latitude: String, //商家纬度
    longitude: String, //商家经度
    rating: String, //商家评分
    recent_order_num: String, //商家月销量
    order_lead_time: String, //商家平均配送时间
    province: String, //商家所在省份
    city: String, //商家所在城市
    county: String, //商家所在的区县
    createTime: String, //创建时间(商家爬取时间)
    },{
        autoIndex: false,
        versionKey: false
    }
);

var citySpiderInfo = new Schema({
    province: String, //商家所在省份
    city: String, //商家所在城市
    count: Number, //该城市当前爬取总数
    state: String, //爬取状态(完成采集)(采集完成才会建立此表，因此都是“采集完成”)
    endTime: String, //结束时间(城市爬取结束的时间)
    },{
        autoIndex: false,
        versionKey: false
    }
);

var spiderInfo = new Schema({
    id: String, // 该schema全局唯一，id作为查询标记
    totalStoresCount: Number, //全部商家数
    spideredCitys: Number, //已经爬取的城市数量
    currentCity: String, //当前爬取的城市
    currentState: String, //该城市当前爬取状态(尚未采集，采集中，完成采集)
    },{
        autoIndex: false,
        versionKey: false
    }   
);

module.exports = {
    getSchema: function(name) {
        switch(name) {
            case 'storeInfo':
                return storeInfo;
            case 'spiderInfo':
                return spiderInfo;
            case 'citySpiderInfo':
                return citySpiderInfo;                
        }
    }
};
