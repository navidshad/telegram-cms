var name = 'sendbox';

var checkRoute = function(option)
{

    var btnsArr  = [ 
        fn.mstr[name]['name'],
        fn.mstr[name].btns['settings'],
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

var show = async function(userid, txt)
{
    var titles = [[
        fn.mstr[name].btns['settings'],
        fn.mstr[name].btns['newmess']
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

var showSender = async function (userid, sender) 
{
    //create callback keyboard
    var detailArr = [];
    var qt = fn.mstr[name].query;
    var fn_editText  = qt['sendbox'] + '-' + qt['text'] + '-' + sender._id;
    var fn_delete = qt['sendbox'] + '-' + qt['delete'] + '-' + sender._id;
    var fn_publication = qt['sendbox'] + '-' + qt['send'] + '-' + sender._id;
    var fn_attachment   = qt['sendbox'] + '-' + fn.str.query['attach'] + '-' + sender._id;

    var fn_vote = qt['sendbox'] + '-' + qt['addVoteitem'] + '-' + sender._id;
    var fn_voteResult = qt['sendbox'] + '-' + qt['voteresult'] + '-' + sender._id;


   //edit btns //publication btn
   detailArr.push([ 
        {'text': 'حذف', 'callback_data': fn_delete},
        {'text': 'بستن', 'callback_data': qt['sendbox']},
        {'text': 'ارسال', 'callback_data': fn_publication},
        {'text': '📝 متن', 'callback_data': fn_editText}
    ]);
    
    //vote
    detailArr.push([ 
        {'text': 'افزودن ایتم نظرسنجی', 'callback_data': fn_vote},
        {'text': 'نمایش نتیجه', 'callback_data': fn_voteResult},
     ]);
    //vote fiels
    sender.voteOptions.forEach((element, i) => 
    {
        var fn_removeVoteitem = qt['sendbox'] + '-' + qt['removeVoteitem'] + '-' + sender._id + '-' + i;
        var row = [ {'text':`❌ ${element}`, 'callback_data':fn_removeVoteitem} ];
        detailArr.push(row);
    });

    //attachment
    detailArr.push([ {'text': 'پیوست', 'callback_data': fn_attachment} ]);
    //attached fiels
    sender.attachments.forEach((element, i) => 
    {
        var fn_removeAttchment = qt['sendbox'] + '-' + fn.str.query['removeAttachment'] + '-' + sender._id + '-' + i;
        var row = [ {'text':'❌', 'callback_data':fn_removeAttchment},
                    {'text':element.name, 'callback_data':'nothing'} ];
        detailArr.push(row);
    });

   //create senderage
   var text = sender.title + '\n' +
   'ــــــــــــــــ' + '\n' +
   sender.text + '\n' + '\n' +
   'لطفا برای تنظیمات و ارسال نهایی از گزینه های زیر استفاده کنید.';
 
   await global.fn.sendMessage(userid, text, {"reply_markup" : {"inline_keyboard" : detailArr}});
}

var create = async function(message)
{
    //check title to not to added already
    var item = await fn.db.sendbox.findOne({'title': message.text}).exec().then();
    if(item) global.fn.sendMessage(message.from.id, fn.mstr[name]['wrongtitle']);
    else{
        var newSendMess = new fn.db.sendbox({
            //'date'     : fn.time.gettime(),
            'title'     : message.text,
            'text'      : 'محتوای پیام'
        });
        newSendMess.save(() => {
            showSender(message.from.id, newSendMess);
            show(message.from.id, fn.str['seccess']);
        });
    }
}

var edit = async function(id, detail, userid)
{
    var sendKey = true;
    var sender = await fn.db.sendbox.findOne({"_id": id}).exec().then();
    
    if(!sender){
        show(userid,'این پیام دیگر وجود ندارد');
        return;
    }

    if(detail.text) sender.text = detail.text;
    if(detail.titel) sender.title = detail.title;

    // vote item
    // add
    if(detail.voteOption) 
        sender.voteOptions.push(detail.voteOption);
    // remove
    if(detail.removeVoteOption) 
        sender.voteOptions.splice(parseInt(detail.removeVoteOption), 1);

    // attachment
    // add
    if(detail.attachment) {
        sendKey = false;
        sender.attachments.push(detail.attachment);
    }
    // remove
    if(detail.removeAttachment) 
        sender.attachments.splice(parseInt(detail.removeAttachment), 1);

    if(sendKey) {
        showSender(userid, sender);
        show(userid, fn.str['seccess']);
    }
    await sender.save();
}

var routting = async function(message, speratedSection, user)
{
    var btns = fn.mstr[name].btns;
    var mess = fn.mstr[name].mess;
    var userid = message.from.id;
    var text = message.text;
    var last = speratedSection.length-1;

    //ask to sendBox section
    if (text === fn.mstr[name].name || text === fn.mstr[name].back){
        console.log('go to sendbox section');
        show(userid);
    }

    //ask to new message
    else if (message.text === btns['newmess'])
    {
        var markup = fn.generateKeyboard({'section':fn.str.goToAdmin['back']}, true);
        fn.userOper.setSection(userid, btns['newmess'], true);
        global.fn.sendMessage(userid, mess['gettitle'], markup);
    }
    //get the title of new message
    else if(speratedSection[3] === btns['newmess'])
        create(message);

    //delete all message
    else if (text === btns['deleteall'])
    {
        await fn.db.sendbox.remove().exec().then();
        show(userid, fn.str['seccess']);
    }

    //edit message - callback query
    else if(speratedSection[3] === mess['gettext'])
        edit(speratedSection[last], {'text': text}, userid);

    //choose an old message
    else if(message.text.includes(fn.mstr[name]['sendboxSymbol']))
    {
        sendboxMessTitle = message.text.replace(fn.mstr[name]['sendboxSymbol'], '').trim();

        //find sender
        var sender = await fn.db.sendbox.findOne({'title': sendboxMessTitle}).exec().then();
        if(sender) showSender(userid, sender);
    }

    //ednd attachment
    else if(speratedSection[last-1] == fn.str['endAttach'] && text == fn.str['endAttach'])
    {
        show(userid);
        var senderid = speratedSection[last];
        var sender = await fn.db.sendbox.findOne({'_id': senderid}).exec().then();
        showSender(userid, sender);
    }

    //add vote option
    else if (speratedSection[last-1] == mess['getVoteItem'])
        edit(speratedSection[last], {'voteOption': text}, userid);

    // go to setting
    else if(speratedSection[3] === btns['settings'] || text == btns['settings']) 
        settings.routting(message, speratedSection, user, name);
}

var settings = require('./settings');
var query = require('./query');
var upload = require('./upload');
var send = require('./send');

module.exports = { name, checkRoute, routting, query, show, edit, showSender, upload, send, settings }