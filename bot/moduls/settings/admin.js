var name = 'settings';

var checkRoute = function(option){

    var btnsArr  = [ 
        fn.mstr.settings['name'],
        fn.mstr.settings['back'],
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

var show = function(userid, injectedtext)
{
    fn.userOper.setSection(userid, fn.mstr.settings['name'], true);
    var btns = fn.mstr.settings['btns'];
    var list = [
        btns['firstmess'],
        btns['strToSticker'],
    ];
    var back = fn.str.goToAdmin['back'];
    var mess = (injectedtext) ? injectedtext : fn.mstr.settings['name'];
    var replymarkup = fn.generateKeyboard({'custom': true, 'grid':true, 'list': list, 'back':back}, false);
    global.fn.sendMessage(userid, mess, replymarkup);        
}

var routting = function(message, speratedSection, user, mName)
{
    var text = message.text;
    var last = speratedSection.length-1;
    var btns = fn.mstr.settings.btns;
    
    //show root
    if(text === fn.mstr.settings['name'] || text === fn.mstr.settings['back']) show(message.from.id);

    //first message of robot
    else if (text === btns['firstmess'])
    {
        var mess = fn.mstr.settings.mess['firstmess'];
        var replymarkup = fn.generateKeyboard({'section': fn.mstr.settings['back']}, true);
        global.fn.sendMessage(message.from.id, mess, replymarkup);
        fn.userOper.setSection(message.from.id, btns['firstmess'], true);
    }
    else if (speratedSection[3] === btns['firstmess'])
    {
        if(text.length < 10) {
            global.fn.sendMessage(message.from.id, fn.mstr.settings.mess['shorttext']); 
            return;
        }

        global.robot.config.firstmessage = text;
        global.robot.save();
        show(message.from.id, fn.str['seccess']);
    }

    //host address
    else if (text === btns['domain'])
    {
        var mess = fn.mstr.settings.mess['getdomain'];
        var replymarkup = fn.generateKeyboard({'section': fn.mstr.settings['back']}, true);
        global.fn.sendMessage(message.from.id, mess, replymarkup);
        fn.userOper.setSection(message.from.id, btns['domain'], true);
    }
    else if (speratedSection[3] === btns['domain'])
    {
        global.robot.config.domain = text;
        global.robot.save();
        show(message.from.id, fn.str['seccess']);
    }

    //string to sticker
    else if (text === btns['strToSticker'] || speratedSection[3] === btns['strToSticker'])
        strToSticker.routting(message, speratedSection, user, mName);
}

var strToSticker = require('./strToSticker');
var query = require('./query');
var upload = require('./upload');

module.exports = { name, checkRoute, query, upload, routting, show, strToSticker }