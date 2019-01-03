let botlib = require('./bot/bot');

// var option = {
//     dbpath:'',
//     modulespath:'',
//     modules:{},
//     token:'',
//     serverport:3000,
//     domain:'',
// }

let otherModulesToBeAdded = [];

let start = async function start(option)
{
    // get config
    global.config = option;
    
    var bot = await botlib.settingUp().then();
    
    otherModulesToBeAdded.forEach(m => 
    {
        global.fn.eventEmitter.emit('addNewModule', m);
    });
    
    botlib.runafterstart();
    
    return bot;
}

// this function is for other cms module on npm
function addModule(newModule){
    otherModulesToBeAdded.push(newModule);
}

module.exports = {
    start, addModule
}
