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

//vote
var addVoteItem = function(query, speratedQuery)
{
    var mess = fn.mstr.sendbox.mess['getVoteItem'];
    console.log('addVoteItem');
    var last = speratedQuery.length-1;
    var markup = fn.generateKeyboard({section:fn.mstr.sendbox['back']}, true);
    var newSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.sendbox['name'] + '/' + mess + '/' + speratedQuery[last];
    fn.userOper.setSection(query.from.id, newSection, false);
    global.fn.sendMessage(query.from.id, mess, markup);
}

var removeVoteItem = function(query, speratedQuery)
{
    var last = speratedQuery.length-1;
    console.log('removeVoteItem');
    var newSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.sendbox['name'];
    fn.userOper.setSection(query.from.id, newSection, false);
    fn.m.sendbox.edit(speratedQuery[last-1], {'removeVoteOption': speratedQuery[last]}, query.from.id)
}

var showVoteResult = async function(query, speratedQuery)
{
    var last = speratedQuery.length-1;
    var sendboxid = speratedQuery[last];
    var userid = query.from.id;

    // get sendbox
    var sendbox = await global.fn.db.sendbox.findOne({'_id': sendboxid}, 'title voteOptions').exec().then();
    if(!sendbox) return;
    
    // make promisarray
    var promisarray = [];
    sendbox.voteOptions.forEach((op, i) => {
        var r_query = {'sendboxid': sendboxid, voteOption: i};
        var request = global.fn.db.sendboxVote.count(r_query).exec().then();
        promisarray.push(request);
    });

    // requesting, get vote count;
    var result = await Promise.all(promisarray).then();

    // sort counts
    var sortedOptions = [];
    sendbox.voteOptions.forEach((op, i) => 
    {
        var voteitem = {
            count   : result[i],
            option  : op,
        }
        sortedOptions.push(voteitem);
    });
    sortedOptions.sort((a, b) => { return a.count - b.count });

    // make statistic message
    var time = Date.today().setTimeToNow();
    var mess = `📊 آمار پیام: ${sendbox.title} \n\n`;
    mess += `📆 تاریخ: ${time.toString('d-MMM-yyyy HH:mm')} \n\n`;
    sortedOptions.forEach(item => 
    {
        mess += `👥 ${item.count} | ${item.option} \n`;
    });

    mess += '\n .';

    // markup
    var qt = global.fn.mstr.sendbox.query;
    var fn_voteResult = qt['sendbox'] + '-' + qt['voteresult'] + '-' + sendbox._id;
    var detailArr = [[{'text': '🔄', 'callback_data': fn_voteResult},]];
    var markup = {"inline_keyboard" : detailArr};

    // update message
    var option = {chat_id: query.message.chat.id, message_id: query.message.message_id};
    await fn.editMessageText(mess, option);
    await fn.editMessageReplyMarkup(markup, option);
}

var votting = async function (query, speratedQuery)
{
    var last = speratedQuery.length-1;
    var sendboxid = speratedQuery[last-1];
    var optionIndex = speratedQuery[last];
    var userid = query.from.id;

    //check user voted already or not
    var m_query = {'sendboxid': sendboxid, 'userid': userid}
    var sendboxVote = await global.fn.db.sendboxVote.findOne(m_query).exec().then();
    
    // update
    if(sendboxVote) 
    {
        sendboxVote.voteOption = optionIndex;
        await sendboxVote.save().then();
    }
    // create
    else
    {
        await global.fn.db.sendboxVote({
            'sendboxid': sendboxid, 
            'userid': userid,
            'voteOption': optionIndex
        }).save().then();
    }

    // update inline keyboard
    var sendbox = await global.fn.db.sendbox.findOne({'_id': sendboxid}).exec().then();
    if(!sendbox) close(query);
    else {
        // markup, vote items
        var detailArr = [];
        var qt = global.fn.mstr.sendbox.query;
        sendbox.voteOptions.forEach((element, i) => 
        {
            var fn_vote = qt['sendbox'] + '-' + qt['votting'] + '-' + sendbox._id + '-' + i;
            var selected = (i == optionIndex) ? '💎' : '';
            var tx_vote = `${selected} ${element}`;
            var row = [ {'text': tx_vote, 'callback_data': fn_vote} ];
            detailArr.push(row);
        });
        var markup = {"inline_keyboard" : detailArr};

        //send update
        var option = {chat_id: query.message.chat.id, message_id: query.message.message_id};
        fn.editMessageReplyMarkup(markup, option);
    }
}

//attachment
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

var close = function(query)
{
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);
}

routting = async function(query, speratedQuery, user, mName)
{
    var last = speratedQuery.length-1;
    var qt = global.fn.mstr.sendbox.query;

    //remove query message
    if(speratedQuery[1] !== qt['votting'] && speratedQuery[1] !== qt['voteresult']) 
        close(query);

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

    //vote item
    else if(speratedQuery[1] === qt['addVoteitem']) addVoteItem(query,speratedQuery)
    else if(speratedQuery[1] === qt['removeVoteitem']) removeVoteItem(query,speratedQuery);
    // show vote result
    else if (speratedQuery[1] === qt['voteresult']) showVoteResult(query,speratedQuery);

    //attachment
    else if(speratedQuery[1] === fn.str.query['attach']) attachSection(query,speratedQuery)
    else if(speratedQuery[1] === fn.str.query['removeAttachment']) removeattachment(query,speratedQuery);

    //votting by users
    else if (speratedQuery[1] === qt['votting'])
        votting(query,speratedQuery);
}

//#region send ------------------------------------------------------
var preparetoSend = async function(userid, sendboxid)
{
    var item = await global.fn.db.sendbox.findOne({'_id': sendboxid}).exec().then();
    if(!item.text) global.fn.sendMessage(userid, 'شما هنوز متن پیام را ارسال نکرده اید.');

    // text message
    var link = '@' + robot.username;
    var messateText = item.text + '\n' + '\n' + link;

    // markup, vote items
    var detailArr = [];
    var qt = global.fn.mstr.sendbox.query;
    item.voteOptions.forEach((element, i) => 
    {
        var fn_vote = qt['sendbox'] + '-' + qt['votting'] + '-' + item._id + '-' + i;
        var row = [ {'text':`${element}`, 'callback_data':fn_vote} ];
        detailArr.push(row);
    });
    var markup = {"reply_markup" : {"inline_keyboard" : detailArr}}

    global.fn.eventEmitter.emit('sendtoall', userid, item.title, messateText, item.attachments, markup);
}

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
module.exports = { checkQuery, routting };
