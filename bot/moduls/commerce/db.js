var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bagitem = new Schema({
    'name'  :String,
    'id'    :String,
    'type'  :String,
    'price' :Number,
    'data'  :[{'key': String, 'value': String}]
});

var bagSchema = new Schema({
    'userid'        : Number,
    'message_id'    : Number, 
    'chatid'        : Number, 
    'page'          : Number,
    'items'         : [bagitem],
    'boughtItems'   : [bagitem],
    'address'       : {type:String, default:''},
    'phone'         : {type:Number, default:0},
    'fullname'      : {type:String, default:''},
    //coupon code
    cid             : String,
    usedcoupons     : []
});
  
var factorSchema = new Schema({
    'number'    : Number,
    'userid'    : Number,
    'date'      : Date,
    'desc'      : String,
    'products'  : [bagitem],
    'amount'    : Number,
    'discount'  : Number,
    'shipping'  : {type:Number, default:0},
    'message_id': Number,
    'chatid'    : Number,
    'ispaid'    : Boolean,
});

var couponSchema = new Schema({
    code        : String,
    userid      : Number,
    startDate   : Date,
    endDate     : Date,
    consumption     : {type:Number, default:1},
    consumptionway  : {type:String, default:'custom'},
    discountmode: {type:String, default:'amount'},
    amount      : Number,
    percent     : Number,
});

var data = new Schema({'name': String, 'value':String});
var couponGenaratorSchema = new Schema({
    name        : String,
    allowEdit   : {type:Boolean, default: true},
    status      : {type:Boolean, default: false},

    mode        : {type:String, default:'buy'},
    discountmode: {type:String, default:'amount'},
    amount      : {type:Number, default:5000},
    percent     : {type:Number, default:10},

    days        : {type:Number, default:1},
    hours       : {type:Number, default:0},
    consumption : {type:Number, default:1},
    consumptionway  : {type:String, default:'custom'},
    sessions        : {type:Number, default:5},
    minimumP        : {type:Number, default:0},
    maximumP        : {type:Number, default:0},
});

var gtdetail = {name:String, counter:Number, olde:String}
generatorTempSchema = new Schema({
    userid  : Number,
    generators    :[ gtdetail ],
})

var nextpaySchema = new Schema({
    'amount'    : Number,
    'order_id'  : Number,
    'trans_id'  : String,
    'code'      : String,
});

var fNumberSchema = new Schema({
    'last': {'type': Number, default: 100}
})

module.exports.bag      = mongoose.model('bags', bagSchema);
module.exports.factor   = mongoose.model('factors', factorSchema);
module.exports.fnumber  = mongoose.model('fNumber', fNumberSchema);

module.exports.coupon       = mongoose.model('coupons', couponSchema);
module.exports.generator    = mongoose.model('couponGenarators', couponGenaratorSchema);
module.exports.gentemp      = mongoose.model('couponGenaratorsTemp', generatorTempSchema);

module.exports.nextpay  = mongoose.model('nextpay', nextpaySchema);