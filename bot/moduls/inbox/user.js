var checkRoute = function(option){

    var btnsArr  = [ 
        fn.mstr.inbox.lable
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

var alertToAmin = function(newMess){
    fn.db.user.find({'isAdmin': true}, 'userid').exec((e, admins) => {
        //user message
        inboxMess = 'پیام از طرف ' + '@' + newMess.username +
        '\n' + 'ــــــــــــــــــــ' + '\n' + newMess.message +
        '\n' + 'ــــــــــــــــــــ' + '\n' + '⚠️ ' + 'برای ارسال پاسخ لطفا به بخش "صندوق پیام" در بخش مدیریت بروید.' +
        '\n \n @' + global.robot.username;

        //send to admins
        admins.forEach(admin => {
            global.fn.sendMessage(admin.userid, inboxMess);
        });
    });
}

var routting = function(message, speratedSection){
    var last = speratedSection.length-1;
    //ask to send massage to admin
    if (message.text === fn.mstr['inbox'].lable){
        console.log('getting message');
        fn.userOper.setSection(message.from.id, fn.mstr['inbox'].lable, true);        
        global.fn.sendMessage(message.from.id, fn.mstr['inbox'].getmess, fn.generateKeyboard({section:fn.str['backToMenu']}, true));
    }
    else if(speratedSection[last] === fn.mstr['inbox'].lable){
        console.log('send user message to admin');
        var userMessage = 'شما از طرف ' + message.from.username + ' یک پیام دریافت کرده اید.' + '\n' +
        'ــــــــــــــــــــ' + '\n' +  message.text;

        fn.userOper.checkProfile(message.from.id, (user) => {
            //time
            var time = fn.time.gettime();
            
            //save to inbox
            var newInboxMess = new global.fn.db.inbox({
                'readed'      : false,
                'messId'      : message.message_id,
                'date'        : time,
                'userid'      : user.userid,
                'username'    : user.username,
                'message'     : message.text
            });
            newInboxMess.save();
            alertToAmin(newInboxMess);
            fn.commands.backToMainMenu(message.from.id, user, fn.str['seccess']);
        });
    }
}

module.exports = { routting, checkRoute }