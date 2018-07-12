//system
require('datejs');
Date.i18n.setLanguage('fa-IR');

var fs                  = require('fs');
var fse                 = require('fs-extra');
var path                = require('path');
var request             = require('request');

var db                  = require('./base/db');
var str                 = require('./str/staticStrings.js');
var telegramBot         = require('node-telegram-bot-api');
var generateKeyboard    = require('./base/generateKeyboard.js');
var time                = require('../lib/time.js');
var commands            = require('./routting/commands');
var freeStrings         = require('./routting/freeStrings');

//user
var userOper        = require('./user/userOperations.js');
var menu            = require('./routting/menuItemsRouting');

//admin
var adminPanel      = require('./admin/adminPanel.js');
var upload          = require('./routting/uploadRouting');

var convertObjectToArray = function(object, option)
{
    var chartData = [];
    for (var i in object) {
        var item = object[i];
        var outer = [];
        // skip over items in the outer object that aren't nested objects themselves
        if (typeof item === "object" && option.nested) {
            var resalts = convertObjectToArray(item,option);
            for(var j in resalts) { 
                chartData.push(resalts[j])
            }
        }
        else if(typeof item !== "object") chartData.push(item);
    }
    return chartData;
    //console.log(chartData);
}

var converAMenuItemsToArray = function(object)
{
    var items = [];
    for (item in object){
        var element = object[item];
        //check if the Item is a module setting 
        if(element.modulename){
            //check module statuse
            if(global.config.modules[element.modulename]) items.push(element.name);
        }
        else items.push(element.name);
    }
    return items;
}

var checkValidMessage = function(text, custom)
{
    var isvalid = false;
    //str
    if(custom) {
        //console.log(custom);
        custom.forEach(function(element) {
            if(element && text && element.toString().trim() === text.toString().trim()) isvalid = true;
        }, this);
    }
    else {
        global.fn.strArr.forEach(function(element) {
        if(element.toString().trim() === text.toString().trim()) 
            isvalid = true;
        }, this);
    }
    return isvalid;
}

var saveTelegramFile = async function(id, savePath, callback)
{
    var link = await global.robot.bot.getFileLink(id).then();
    var stream = fs.createWriteStream(savePath);
    stream.on('close', (e) =>{
        if(e) { console.log(e); return;}
        console.log('new file has been created on', savePath);
        if(callback) callback(id, savePath);
    });

    request(link).pipe(stream);
}

var removeFile = function(path, callback)
{
    fs.unlink(path, (err) => { 
        if(err) console.log(err);
        if(callback) callback(true);
    });
}

var getMenuItems = async function(name, user, callback)
{
    var items = [];
    var noitem = false;
    var postlist = await fn.db.post.find({'category': name, 'publish': true}).limit(20).exec().then();
    if(postlist) postlist.forEach(function(element) { items.push({'name':element.name, 'order':element.order}) }, this);

    //get child categories
    var catlist = await fn.db.category.find({'parent': name}, 'name order').exec().then();
    catlist.forEach(function(element) { items.push({'name':element.name, 'order':element.order}) }, this); 

    //get modules
    var modulsoptions = global.robot.config.moduleOptions;
    for (let i = 0; i < modulsoptions.length; i++) 
    {
        const md = modulsoptions[i];
        if(md.category !== name || !md.active) continue;

        var order = (typeof md.btn_order === 'number') ? md.btn_order : 1;
        //if moudle has 1 btn
        if(md.button) items.push({'name':md.button, 'order': order});
        //if module has more than 1 btn
        else if(md.buttons.length > 0) {
            md.buttons.forEach(element => { items.push({'name':element, 'order': order}); });
        }
        
        //user route method
        var mRoute = getModuleRouteMethods(md.name);
        if(!mRoute.userRoute) continue;
        
        var buttons = await mRoute.methods.getButtons(md.name, user);
        buttons.forEach(btn => { items.push({'name':btn, 'order': order}); });
    }

    //sort
    items.sort((a, b) => {return a.order - b.order});
    var newItems = [];
    items.forEach(function(element) { newItems.push(element.name); }, this);
    newItems.reverse();
    
    //no item
    if(items.length === 0) noitem = true;
    
    //callback and description
    var detail = {
        'description' : name,
        'attachment'  : []
    }

    var category = await fn.db.category.findOne({'name':name}).then();
    if(category && category.description) detail.description = category.description;
    if(category && category.attachments) detail.attachments = category.attachments;
    
    var result = { 'items': newItems, 'detail': detail, 'noitem': noitem };
    return result;
}

var getMainMenuItems = async function(user)
{
    var result = await getMenuItems(fn.mstr.category['maincategory'], user);
    global.robot.menuItems = (result.items) ? result.items : [];
}

var queryStringMaker = function(parameter, list, condition)
{
    var query = '';
    var count = list.length;
    list.forEach(function(element, i) {
        if(i > 0 && i < count) query += " " + condition + " ";
        query += 'this.' + parameter + ' === "' + element + '"';
    }, this);
    return query;
}

var updateBotContent = function(callback)
{
    global.fn.m.category.get(() => { getMainMenuItems(); })
    if(callback) callback();
}

var getModuleOption = function(mName, option)
{
    var moduleOption = null;
    var added = false;

    if (!global.robot.config.moduleOptions) global.robot.config.moduleOptions = [];
    
    global.robot.config.moduleOptions.forEach(function(element, i) {
        if(element.name === mName) {
            index = i;
            moduleOption = {'index':i, 'option':element};
            added = true;
        }
    }, this);

    //create
    if(!added && option && option.create) {
        var newmoduleOption = {};
        if(option.setting) newmoduleOption = option.setting;
        else newmoduleOption = {'name':mName, 'datas':[], 'btn_order':1};
        global.robot.config.moduleOptions.push(newmoduleOption);
        //save configuration
        global.robot.save();
        moduleOption = {};
        moduleOption.option = newmoduleOption;
        moduleOption.index = global.robot.config.moduleOptions.length-1;
    }

    return moduleOption;
}

var getModuleData = function(mName, dName)
{
    var data = {};
    //get module detail and data
    var moduleOption = getModuleOption(mName, {'create': true});
    if(moduleOption) moduleOption.option.datas.forEach(element => {
        if(element.name === dName) data = element;
    });
    //return
    return data;
}

var putDatasToModuleOption = function (mName, datas, setting) 
{
    //get module details
    var ModuleOption = getModuleOption(mName, {'create': true, 'setting': setting});
    var mdatas = ModuleOption.option.datas;
    //add & update bot-config
    datas.map(item => 
        {
            notadded = true;
            //update
            mdatas.forEach(element => {
                if(element.name !== item.name) return;
                if(item.value) element.value = item.value;
                if(item.key) element.key = item.key;
                notadded = false;
            });
            //add
            if(!notadded) return;
            mdatas.push(item);
        }
    );

    //replace new datas
    global.robot.config.moduleOptions[ModuleOption.index].datas = mdatas;
    global.robot.save();

    //return
    return ModuleOption;
}

var getModuleRouteMethods = function(mName)
{
    //define query route
    var mRouteMethods = { 'userRoute': false };
    global.mRoutes.forEach(route => {
        if(route.name !== mName) return;
         mRouteMethods.methods = route;
        //check user route method
         if(route.getButtons) 
            mRouteMethods.userRoute = true;
    });
    return mRouteMethods;
}

var alertadmins = async function(mess)
{
    var admins = await fn.db.user.find({'isAdmin': true}).exec().then();
    admins.forEach(user => {
        sendMessage(user.userid, mess, {'parse_mode':'HTML'});
    });
}

var getRoute = function(routename)
{
    result = [];
    global.mRoutes.map(route => {
        if(route[routename]) result.push(route);
    });
    return result;
}

var saveLastMessage = async function(message)
{
    var userid = message.from.id;
    var lastmess = {
        'userid': userid,
        'text'  : message.text,
        'chatid': message.chat.id,
        'messageid': message.message_id,
    }
    var last = await global.fn.db.lastMess.count({'userid': userid}).exec().then();
    
    //update
    if(last) global.fn.db.lastMess.update({'userid': userid}, lastmess).exec();
    else new global.fn.db.lastMess(lastmess).save();
}

var getLastMessage = async function(userid)
{
    var last = await global.fn.db.lastMess.findOne({'userid': userid}).exec().then();
    if(last) return last;
    else return {};
}

var sendMessage = async function(userid, text, option)
{
    if(!text) return;
    
    //send message
    var msg = await global.robot.bot.sendMessage(userid, text, option).then();

    //check sticker replacer
    var strToSticker = await global.fn.m['settings'].strToSticker.check(userid);
    if(strToSticker.status)
    {
        var replacer = strToSticker.replacer;
        sendDocument(msg.chat.id, replacer.fileid, replacer.type, option);
        global.robot.bot.deleteMessage(msg.chat.id, msg.message_id);
    }

    return msg;
}

var sendDocument = async function(chatid, fileid, type, option={})
{
    //send post
    switch (type) 
    {
        case 'file':
            return global.robot.bot.sendDocument(chatid, fileid, option).then();
            break;

        case 'photo':
            return global.robot.bot.sendPhoto(chatid, fileid, option).then();
            break;
            
        case 'sound':
            return global.robot.bot.sendAudio(chatid, fileid, option).then();
            break;

        case 'voice':
            return global.robot.bot.sendVoice(chatid, fileid, option).then();
            break;

        case 'video':
            return global.robot.bot.sendVideo(chatid, fileid, option).then();
            break;

        case 'sticker':
            return global.robot.bot.sendSticker(chatid, fileid, option).then();
            break;
    }
}

var editMessageText = function (text, option) 
{
    return global.robot.bot.editMessageText(text, option).then();
}

var sleep = function(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

var getStartLink = function(startParam)
{
    var botusername = global.robot.username;
    var link = 'http://t.me/' + botusername + '?start=' + startParam;
    return link;
}

module.exports = {
    //system
    db, time, str, telegramBot, generateKeyboard, convertObjectToArray, commands,
    getMainMenuItems, getMenuItems, converAMenuItemsToArray, queryStringMaker,
    checkValidMessage, saveTelegramFile, removeFile, freeStrings,
    updateBotContent, request, path, fs, fse, 
    //user
    userOper, menu,
    //admin
    adminPanel, upload,
    //tools
    getModuleOption, putDatasToModuleOption, getModuleRouteMethods, 
    getModuleData, alertadmins, getRoute,
    saveLastMessage, getLastMessage,
    sendMessage, sendDocument, editMessageText,
    sleep, getStartLink,
}