var botlib = require('./bot/bot');

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
    
    var bot = await botlib.settingUp().then();
    return bot;
}

module.exports = {
    start
}
