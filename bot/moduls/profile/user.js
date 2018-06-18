var checkRoute = function(option)
{
    var mName   = option.mName;
    var btnsArr  = fn.convertObjectToArray(fn.mstr[mName].btns_user,{});

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

var getButtons = function (mName){
    var buttons  = fn.convertObjectToArray(fn.mstr[mName].btns_user,{});
    return buttons;
}

var getInviteLink = function(userid, user, mName)
{
    var botusername = global.robot.username;
    var link = 'http://t.me/' + botusername + '?start=' + 'nu-' + userid;
    var name = user.username;
    var invitationMess = '';
    var invitationMessOption = fn.getModuleData(mName, 'invitationMess');
    if(invitationMessOption) invitationMess = invitationMessOption.value;

    var text = `لینک دعوت از طرف ${name} \n`;
    text += `${invitationMess} \n` + link;

    global.fn.sendMessage(userid, text);
}

var registerFromLink = async function(telegramUser, text)
{
    console.log('someone registerd with an invite link');
    var botusername = global.robot.username;
    var userid = telegramUser.id;
    var sperateText = text.split('-');
    var inviter = parseInt(sperateText[1]);

    if(isNaN(inviter)) return;

    //get inviter detail
    var inviterUser = await fn.db.user.findOne({'userid' : inviter}).exec().then();
    var iName = (inviterUser.username) ? inviterUser.username : inviter;

    var mess = 'سلام خوش امدی ' + telegramUser.first_name + '\n' +
        'شما از طرف ' + iName + ' عضو شده اید.';

    var existUser = await fn.db.user.findOne({'userid' : userid}).exec().then();
    var newuser = null;
    //if user does not exist
    if(!existUser) {
        var username = telegramUser.username;
        telegramUser.inviter = inviter;
        newuser = await global.fn.userOper.registerId(telegramUser);
        fn.commands.backToMainMenu(userid, newuser, mess);
    }

    //if user was register already in this bot
    else fn.commands.backToMainMenu(userid, existUser, 'سلام خوش امدید' + '\n' + 'شما قبلا ثبت نام کرده اید.');

    //emir event
    if(newuser) global.fn.eventEmitter.emit('affterInvitedUserRegistered', inviter, newuser);
}

var routting = function(message, speratedSection, user, mName)
{
    var last = speratedSection.length-1;
    var btns = fn.mstr[mName].btns_user;
    var userid = message.from.id;
    
    //get invitation link
    if (message.text === btns['invitationlink'])
        getInviteLink(userid, user, mName);

}

module.exports = { routting, checkRoute, getButtons }

fn.eventEmitter.on('commands', (message, speratedSection, user) => 
{
    if(message.text.startsWith('/start nu')) 
        registerFromLink(message.from, message.text);
});