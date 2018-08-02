var name = 'inbox';

var checkRoute = function(option){

    var btnsArr  = [ 
        fn.mstr.inbox['name']
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

var show = async function(userid){
    console.log('got to inbox section');
    var titles = [
        fn.mstr.inbox['inboxDeleteAll'],
        fn.mstr.inbox['settings']
    ];

    //get message list
    var items = await fn.db.inbox.find({}).sort('-_id').limit(30).exec().then();
    items.forEach(function(item) {
        var sym = (!item.answered) ? fn.mstr.inbox.readSym[0] : fn.mstr.inbox.readSym[1];
        var title = 'ـ ' + sym + ' ' + item.username + ' | ' + item.date;
        titles.push(title);
    }, this);

    //show list
    var markup = fn.generateKeyboard({'custom':true, 'grid':true, 'list': titles, 'back':fn.str.goToAdmin['back']}, false);
    global.fn.sendMessage(userid, fn.mstr['inbox'].name, markup);
    fn.userOper.setSection(userid, fn.mstr['inbox'].name, true);
}

var showMessage = function(message){
        //get date from message
        seperateText = message.text.split('|');
        date = seperateText[1];
        date = (date) ? date.trim() : '';

        //find message
        fn.db.inbox.findOne({'date':date}, function(ee, item){
            if(item){
                var detailArr = [];
                var fn_answer = fn.mstr.inbox.query['inbox'] + '-' + fn.mstr.inbox.query['answer'] + '-' + item._id;
                var fn_delete = fn.mstr.inbox.query['inbox'] + '-' + fn.mstr.inbox.query['delete'] + '-' + item._id;
                detailArr.push([ 
                    {'text': 'ارسال پاسخ', 'callback_data': fn_answer},
                    {'text': 'حذف', 'callback_data': fn_delete}
                ]);

                inboxMess = 'پیام از طرف ' + '@' + item.username +
                '\n' + 'ــــــــــــــــــــ' + '\n' + item.message + '\n \n @' + global.robot.username;
                global.fn.sendMessage(message.from.id, inboxMess, {"reply_markup" : {"inline_keyboard" : detailArr}});
            }
            else{
                global.fn.sendMessage(message.from.id, 'این پیام دیگر موجود نیست');
            }
        });
}

var answertoMessage = async function(message, messid){

    var item = await fn.db.inbox.findOne({'_id':messid}).then();

    if(!item) {
        global.fn.sendMessage(message.from.id, 'این پیام دیگر موجود نیست');
        return;
    }

    answer = 'پیام شما:' + '\n';
    answer += item.message + '\n \n';
    answer += 'جواب پیام شما:' + '\n';
    answer += message.text + '\n';
    answer += '\n @' + global.robot.username;
    global.fn.sendMessage(message.from.id, answer);
    global.fn.sendMessage(item.userid, answer).catch((error) => {
        console.log(error.code);  // => 'ETELEGRAM'
        console.log(error.response.body); // => { ok: false, error_code: 400, description: 'Bad Request: chat not found' }
        if(error.response.statusCode === 403) global.fn.sendMessage(message.from.id, 'این کاربر ربات را block کرده است.'); 
    });

    await fn.db.inbox.update({'_id':messid}, {'answered': true}).then();
    show(message.from.id);
}

var deleteMessage = function(userid, option){
    var query = {};
    var newSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'];
    if(option.id) query = {'_id':option.id};
    fn.db.inbox.remove(query, function(er){ 
        fn.userOper.setSection(newSection, false);
        show(userid);
    });
}

var setting = require('./setting');
var user = require('./user');

var routting = function(message, speratedSection)
{
    //go to inbox
    if(message.text === fn.mstr['inbox'].name || message.text === fn.mstr['inbox'].back)
        show(message.from.id);
    
    //delet all message
    else if(message.text === fn.mstr.inbox['inboxDeleteAll']) deleteMessage(message.from.id, {'all': true});
    
    //setting
    else if(message.text === fn.mstr['inbox'].settings || speratedSection[3] === fn.mstr['inbox'].settings) 
        setting.routting(message, speratedSection);

    //choose a message
    else if(speratedSection[speratedSection.length-1] === fn.mstr['inbox'].name) showMessage(message);

    //get answer
    else if(speratedSection[speratedSection.length-2] === fn.mstr['inbox'].mess['answer']) answertoMessage(message, speratedSection[speratedSection.length-1]);
}

var query = require('./query');

module.exports = { name, checkRoute, routting, query, show, user}