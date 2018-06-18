var botlib = require('./bot/bot');
var web = require('./express/bin/www');

// var option = {
//     dbpath:'',
//     modulespath:'',
//     modules:{},
//     token:'',
//     serverport:3000,
//     domain:'',
// }

var start = async function start(option)
{
    // get config
    global.config = option;
    console.log(global.config);
    
    var bot = await botlib.settingUp().then();
    web.start();
    return bot;
}

module.exports = {
    start
}
