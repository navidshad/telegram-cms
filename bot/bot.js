var create = async function()
{
    var botObject = require('./base/botObject.js');
    
    //make the bot to be an object
    var newBot = new botObject({
        token: global.config.token,
        username: global.config.botusername,
        config : {'modules':global.config.modules}
    });

    //start bot
    await newBot.start();
    //get category list and main menu item
    global.fn.updateBotContent();

    return newBot;
}

var settingUp = function()
{
    return new Promise(async (resolve, reject) => 
    {
        // 
        global.afterStart = [];
        // get approot path
        global.appRoot = __dirname;
        // setting test run
        if(global.config.testRun)
        {
            global.config.dbpath = global.config.dbpath_test;
            global.config.token = global.config.token_test;
        }
        
        /// must be declear first
        events = require('events');
        global.fn = { eventEmitter: new events.EventEmitter() };
        if(typeof global.config.fn == 'object')
            extend(global.fn, global.config.fn);

        global.mRoutes = [];
        global.searchRoutes = [];

        // event runafterstart
        global.fn.eventEmitter.on('runafterstart', (params, callback) => {
            var task = {'patams': params, 'callback': callback};
            global.afterStart.push(task)
        });
        
        // add module events 
        global.fn.eventEmitter.on('addNewModule', addModuleToMroutes);

        // get built in modules
        await getMstrs().then();
        await getModuls().then();
        await getFunctions().then();

        //get user modules
        await getMstrs(global.config.modulespath).then().catch(e => {console.log(e);});;
        await getModuls(global.config.modulespath).then().catch(e => {console.log(e);});

        // start schedule
        var schedule = require('./base/schedule');
        schedule.runcCycle();

        //get built-in models
        await getDbModels().then();
        //get user models
        await getDbModels(global.config.modulespath).then();

        // function
        global.fn.strArr = global.fn.convertObjectToArray(fn.str, {'nested': true});
        global.fn.mstrArr = global.fn.convertObjectToArray(fn.mstr, {'nested': true});

        // start robot;
        var bot = await create();

        resolve(bot);
    });
}

var runafterstart = function()
{
    global.afterStart.forEach(element => {
        element.callback(element.params);
    });
}

var getMstrs = function(path)
{
    return new Promise((resolve, reject) => 
    {
        var dir = (path) ? path : require('path').join( global.appRoot , 'moduls');
        var option = {'filter':['.js'], 'name':'mstr'};

        if(!global.fn.mstr) global.fn.mstr = {};
        //get Mstr file paths
        filWalker.walk(dir, option, (e, list) => 
        {
            if(e) reject(e);
            else {
                //console.log(list);
                list.forEach(mstr => {
                    addMstr(require(mstr));
                });
                resolve();
            }
        });

    });
}

var getModuls = function(path)
{
    return new Promise((resolve, reject) => 
    {
        var dir = (path) ? path : require('path').join( global.appRoot , 'moduls');
        var option = {'filter':['.js'], 'name':'admin'};

        if(!global.fn.m) global.fn.m = {};
        //get Mstr file paths
        filWalker.walk(dir, option, (e, list) => 
        {
            if(e) reject(e);
            //console.log(list);
            list.forEach(m =>
            {
                var emodule = require(m);
                addModuleToMroutes(emodule);
                //console.log(emodule.name)
            });
            resolve();
        });
    });
}

function addModuleToMroutes(newModule)
{
    //console.log(newModule.name)
    global.fn.m[newModule.name] = newModule;
    
        // add db if admin has db property
    if(newModule.db) {
        let mDB = newModule.db.createModels(global.mongoose);
        addDBModel(mDB);
    }
    // add mstr if admin has it
    if(newModule.str) addMstr(newModule.str);
    
    //get module route functions
    var route = {}
    route.name      = newModule.name;
    route.admin     = newModule.checkRoute;

    if(newModule.user){
        route.user       = newModule.user.checkRoute;
        route.getButtons = (newModule.user.getButtons) ? newModule.user.getButtons : null;
        route.searchRoute= (newModule.user.searchRoute) ? newModule.user.searchRoute : null;
    }

    route.upload    = (newModule.upload) ? newModule.upload.checkUpload : null;
    route.query     = (newModule.query) ? newModule.query.checkQuery : null;
    global.mRoutes.push(route);
}

function addDBModel(model)
{
    global.fn.db = extend(global.fn.db, model);
}

function addMstr(newStr)
{
    global.fn.mstr = extend(global.fn.mstr, newStr);
}

var getFunctions = function()
{
    return new Promise((resolve, reject) => {
        var fn = require('./functions');
        global.fn = extend(global.fn, fn);
        resolve();
    });
}

var getDbModels = function(path)
{
    return new Promise((resolve, reject) => 
    {
        var dir =  (path) ? path : require('path').join( global.appRoot , 'moduls');
        var option = {'filter':['.js'], 'name':'db'};
        //get Mstr file paths
        filWalker.walk(dir, option, (e, list) => 
        {
            if(e) reject(e);
            //console.log(list);
            list.forEach(db => {
                //console.log(db)
                var model = require(db);
                addDBModel(model);
                //global.fn.db = extend(global.fn.db, model);
            });
            resolve();
        });

    });
}

function extend(obj, src) 
{
    for (var key in src) {
        if (src.hasOwnProperty(key)) 
            obj[key] = src[key];
    }
    return obj;
}

var filWalker = require('../lib/filewalker');

module.exports = {
    settingUp, addModuleToMroutes, runafterstart,
}