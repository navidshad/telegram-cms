var name = require('./admin').name;
var tx_name = 'گوگل آنالیتیک';

var mstr = {
    modulename: name,
    //admin
    name:'📈️ ' + tx_name, 
    back:'⤴️ برگشت به ' + tx_name,

    btns: {
        settings : '⚙️' + ' - ' + 'تنظیمات',
        backsetting: '⤴️ برگشت به ' + '⚙️' + ' - ' + 'تنظیمات',
    },

    btns_user: {
        
    },

    query : {
        admin       : 'a',
        user        : 'u',
        settings    : 'stings',
        activation  : 'activate',
        category    : 'category',
        order       : 'order',
    },

    sections: {

    },

    mess : {

    },

    datas: {
        trackID: {
            'name': 'trackID',
            'mess': 'لطفا track-id مربوط به حساب گوگل آنالیتیک خود را ارسال کنید.',
        },
    }
}

mstr.query[name] = name;

module.exports[name] = Object.create(mstr);