var name = require('./admin').name;
var tx_name = 'کاربران';

var mstr = {
    modulename: name,
    //admin
    name:'👥 ' + tx_name, 
    back:'⤴️ بازگشت به ' + tx_name,

    btns: {
        settings : '⚙️' + ' - ' + 'تنظیمات',
        backsetting: '⤴️ بازگشت به ' + '⚙️' + ' - ' + 'تنظیمات',
    },

    btns_user: {
        invitationlink:'🗣' + 'لینک دعوت',
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
        invitationMess: {
            'name': 'متن دعوت نامه',
            'mess': 'لطفا متن دعوت نامه را ارسال کنید. این متن به لینک اختصاصی کاربر پیوست خواهد شد.',
        },
    }
}

mstr.query[name] = name;

module.exports[name] = Object.create(mstr);