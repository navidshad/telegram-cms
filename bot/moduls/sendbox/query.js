var checkQuery = function(option){

    var btnsArr  = [
        fn.mstr['sendbox'].query['sendbox']
    ];

    var result = {}
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

var preparetoSend = async function(userid, sendboxid)
{
    var item = await global.fn.db.sendbox.findOne({'_id': sendboxid}).exec().then();
    if(!item.text) global.fn.sendMessage(userid, 'شما هنوز متن پیام را ارسال نکرده اید.');

    var link = '@' + robot.username;
    var messateText = item.text + '\n' + '\n' + link;

    global.fn.eventEmitter.emit('sendtoall', userid, item.title, item.text, item.attachments);
}

var attachSection = function(query, speratedQuery)
{
    console.log('get attachment');
    var last = speratedQuery.length-1;
    var markup = fn.generateKeyboard({section:fn.str['endAttach']}, true);
    var newSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.sendbox['name'] + '/' + fn.str['endAttach'] + '/' + speratedQuery[last];
    fn.userOper.setSection(query.from.id, newSection, false);
    global.fn.sendMessage(query.from.id, fn.str['getattachment'], markup);
}

var removeattachment = function(query, speratedQuery)
{
    var last = speratedQuery.length-1;
    console.log('remove attachment');
    var newSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.sendbox['name'];
    fn.userOper.setSection(query.from.id, newSection, false);
    fn.m.sendbox.edit(speratedQuery[last-1], {'removeAttachment': speratedQuery[last]}, query.from.id)
}

routting = async function(query, speratedQuery, user, mName)
{
    var last = speratedQuery.length-1;
    var qt = global.fn.mstr.sendbox.query;

    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);

    //edit message
    if(speratedQuery[1] === qt['text']){
        console.log('get message text');
        fn.userOper.setSection(query.from.id, fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr['sendbox'].name + '/' + fn.mstr.sendbox.mess['gettext'] + '/' + speratedQuery[last], false);
        global.fn.sendMessage(query.from.id, fn.mstr.sendbox.mess['gettext'], fn.generateKeyboard({section:fn.mstr['sendbox'].back}, true));
    }

    //delete message
    else if(speratedQuery[1] === qt['delete']){
        await fn.db.sendbox.remove({'_id': speratedQuery[speratedQuery.length-1]}).exec().then();
        fn.m.sendbox.show(query.from.id, fn.str['seccess']);
    }

    //send message
    else if(speratedQuery[1] === qt['send'])
        preparetoSend(query.from.id, speratedQuery[speratedQuery.length-1]);

    //attachment
    else if(speratedQuery[1] === fn.str.query['attach']) attachSection(query,speratedQuery)
    else if(speratedQuery[1] === fn.str.query['removeAttachment']) removeattachment(query,speratedQuery);
}

//#region send
global.fn.eventEmitter.on('sendtoall', async (userid, title, text, attachments, markup={}) =>
{
    var usercount = await global.fn.db.user.count({}).exec().then();
    var option = {
        'userid'    : userid,
        'sender'    : title,
        'mess'      : text,
        'markup'    : markup,
        'attachments': attachments,
        'total'     : usercount,
        'next'      : 0,
    }
    option.totalGroup = Math.ceil(option.total / option.perGroup);

    //send report message
    var rMess = 'گزارش ارسال برای ' + title + '\n';
    rMess += 'تعداد کل کاربران: ' + option.total + '\n';
    rMess += 'ارسال شده: ' + option.next + '\n\n';
    rMess += '⚠️ ' + 'لطفا این پیام را حذف نکنید...';

    var sent = await global.fn.sendMessage(userid, rMess).then();
    option.message_id   = sent.message_id;
    option.chat_id      = sent.chat.id;

    sendMessToNextUser(option);
});

var sendMessToNextUser = async (op) =>
{
    //send to user
    var skip  = op.next;
    var user  = await global.fn.db.user.findOne().sort({'userid':1}).skip(skip).exec().then();
    var msent = await global.fn.sendMessage(user.userid, op.mess, op.markup).then().catch(e => {
      console.log(e);
    });

    //attachment
    if(msent && op.attachments.length > 0) await prepareAttachments(msent.chat.id, op.attachments, 0);

    //waite for seconds
    await global.fn.sleep(1100);

    //next
    op.next += 1;

    //send report message
    var rMess = 'گزارش ارسال برای ' + op.sender + '\n';
    rMess += 'تعداد کل کاربران: ' + op.total + '\n';
    rMess += 'ارسال شده: ' + op.next + '\n\n';

    if(op.next < op.total)
    {
        rMess += '⚠️ ' + 'لطفا این پیام را حذف نکنید...';
        global.fn.editMessageText(rMess, {'chat_id': op.chat_id, 'message_id': op.message_id}).then();
        sendMessToNextUser(op);
        return;
    }

    //done
    rMess += '✅ ' + 'به همه ارسال شد';
    global.fn.editMessageText(rMess, {'chat_id': op.chat_id, 'message_id': op.message_id}).then();
};

var prepareAttachments = async function(chat_id, attachments, number)
{
    var nextItem = number +1;

    await global.fn.sendDocument(chat_id, attachments[number].id, attachments[number].type, {'caption':attachments[number].caption});
    //next attachment
    if(attachments.length > nextItem)
        await prepareAttachments(chat_id, attachments, nextItem);
}
//#endregion
module.exports = { checkQuery, routting }
