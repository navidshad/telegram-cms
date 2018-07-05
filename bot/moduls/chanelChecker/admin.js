var name = 'chanelChecker';

var checkRoute = function(option){

    var btnsArr  = [ 
        fn.mstr.chanelChecker['name'],
        fn.mstr.chanelChecker['back']
    ];

    var result = {}
    //check text message
    if(option.text) btnsArr.forEach(btn => { 
        if(option.text === btn) 
        {
            result.status = true; 
            result.button = btn;
            result.routting = routting;
        }
    });

    //check seperate section
    if(option.speratedSection){
        option.speratedSection.forEach(section => {
            btnsArr.forEach(btn => 
            { 
                if(section === btn){
                    result.status = true; 
                    result.button = btn;
                    result.routting = routting;
                }
            });
        });
    }

    //return
    return result;
}

var isActive = function(){
    //console.log('check channelCkeck is active or not');
    var moduleOption = fn.getModuleOption('chanelChecker');
    if (moduleOption) return moduleOption.option.active;
    else return false;
}

var registerChannel = function(chat, messageid)
{
    var moduleOption = fn.getModuleOption('chanelChecker');
    var detail = [];

    detail.push({
        'name': 'channel', 
        'more': {'name':chat.username, 'value':chat.id}  
    });

    global.robot.config.moduleOptions[moduleOption.index].datas = detail;
    global.robot.save();
    global.robot.bot.deleteMessage(chat.id, messageid);
}

var getUser = async function(userid)
{
    var moduleOption = fn.getModuleOption('chanelChecker');
    var chatid = 0;
    var isMember = false;

    if(moduleOption.option.datas.length > 0)
    {
        chatid = moduleOption.option.datas[0].more[0].value;
        chatid = parseInt(chatid);
    } 

    var channel = await global.robot.bot.getChatMember(chatid, userid).then();

    var status = 'non';
    if(channel.status) status = channel.status;
    if(status === 'creator' || status === 'member') isMember = true;

    //mandatory Membership
    var mMembership = fn.getModuleData ('chanelChecker', 'mandatoryMembership');
    if(mMembership && mMembership.value == 'false') isMember = true;

    if(channel) global.fn.eventEmitter.emit('affterChannelCheck', userid, isMember);
    return isMember;
}

var InviteUser = function(userid){
    //console.log('Invite user to be a momber of channel');
    var chanel = '-';
    var moduleOption = fn.getModuleOption('chanelChecker').option;
    if(moduleOption.datas.length > 0) 
        chanel = moduleOption.datas[0].more[0].name;

    var mess = 'کاربر گرامی شما ابتدا باید در کانال زیر عضو شوید.' + '\n @' + chanel;
    global.fn.sendMessage(userid, mess);
}

var show = async function(userid, txt)
{
    var titles = [[
        fn.mstr[name].btns['newchannel']
    ]];
    
    var items = await fn.db.sendbox.find({}).sort('_id').exec().then();
        //make title list
        if(items.length > 0){
            items.forEach(function(element) {
                titles.push(global.fn.mstr[name]['sendboxSymbol'] + element.title);
            }, this);
        }

        fn.userOper.setSection(userid, fn.mstr[name].name, true);  
        var messtosend = (txt) ? txt : fn.mstr[name].name;
        var back = fn.str.goToAdmin.back;
        var markup = global.fn.generateKeyboard({'custom': true, 'grid':false, 'list': titles, 'back':back}, false);
        global.fn.sendMessage(userid, messtosend, markup);
}

var routting = function(message, speratedSection, user)
{
    var text = message.text;
    var last = speratedSection.length-1;
    //show chanelChecker setting
    if (text == fn.mstr.chanelChecker['back'])
        fn.adminPanel.show(message);

    else settings.routting (message, speratedSection, user, name);
}

var settings = require('./settings');
var query = require('./query');

module.exports = { 
    name, checkRoute, routting, query, settings, 
    registerChannel, getUser, InviteUser, isActive
}