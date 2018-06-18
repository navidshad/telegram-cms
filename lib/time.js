var moment = require('moment-timezone');

var gettime = function(){
    var now = moment(new Date());
    sperate = now.tz('Iran/Tehran').toString().replace('Thu', '').trim().split(':');
    return sperate[0] + ':' + sperate[1];
}

module.exports = { gettime }