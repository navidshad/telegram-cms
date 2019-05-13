//#region send ------------------------------------------------------
let queryObject = {
    $or: [
        {blocked: null}, 
        {blocked: false}
    ]
};

var preparetoSend = async function(userid, sendboxid)
{
    var item = await global.fn.db.sendbox.findOne({'_id': sendboxid}).exec().then();
    if(!item.text) global.fn.sendMessage(userid, 'شما هنوز متن پیام را ارسال نکرده اید.');

    // reset sendbox statistic
    let sendFromData = global.fn.getModuleData('sendbox', 'sendFrom');
    if(sendFromData.value == null || sendFromData.value == '0')
    {
        item.blocked = 0;
        await item.save().then();
        await global.fn.db.sendboxVote.remove({'sendboxid': sendboxid}).exec().then();
    }

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

    global.fn.eventEmitter.emit('sendtoall', userid, item, messateText, item.attachments, markup);
}

function isEven(number) {
    let reminder = number % 2;
    let isEven = true;

    if (reminder != 0) isEven = false;
    
    return isEven;
}

global.fn.eventEmitter.on('sendtoall', async (userid, sender, text, attachments, markup={}) =>
{
    var usercount = await global.fn.db.user.count(queryObject).exec().then();

    var option = {
        'userid'    : userid,
        'sender'    : sender,
        'mess'      : text,
        'markup'    : markup,
        'attachments': attachments,
        'total'     : usercount,
        'next'      : 0,
        'counter'   : 0,
    }
    option.totalGroup = Math.ceil(option.total / option.perGroup);

    // get sendFrom option
    let sendFromData = global.fn.getModuleData('sendbox', 'sendFrom');
    if(sendFromData.value != null)
    {
        let sendFrom = parseInt(sendFromData.value);
        option.next = sendFrom;
        option.counter = sendFrom;
    }

    // odd & even
    let addToNext = 1;
    if(sender.title.toLowerCase().includes('odd')){
        addToNext = 2;
        option.next = (option.next == 0) ? 1 : option.next;
        option.total = Math.floor(usercount/2);

        if(isEven(option.next)) option.next++;
    }
    else if(sender.title.toLowerCase().includes('even')){
        addToNext = 2;
        option.next = (option.next == 0) ? 0 : option.next;
        option.total = Math.ceil(usercount/2);

        if(!isEven(option.next)) option.next++;
    }

    sendMessToNextUser(option, addToNext);
    
    tempSendDetail = option;
});

let tempSendDetail;
function getReport()
{
    if(!tempSendDetail)
        return '\n.';

    var rMess = 'گزارش ارسال' + ':\n';
    rMess += 'تعداد کل کاربران: ' + tempSendDetail.total + '\n';
    rMess += 'ارسال شده: ' + tempSendDetail.counter + '\n\n.';

    return rMess;
}

var sendMessToNextUser = async (op, addToNext) =>
{
    // get user profile
    var skip  = op.next;
    var user  = await global.fn.db.user.findOne(queryObject).sort({'userid':1}).skip(skip).exec().then();

    //send to user
    if(user != null){
        var msent = await global.fn.sendMessage(user.userid, op.mess, op.markup).then()
            .catch(e => {
                console.log(`sendbox error to ${user.userid} | statusCode ${e.response.statusCode}`);
                if(e.response.statusCode == 403){
                    global.fn.db.sendbox.update({'_id': op.sender._id}, { $inc: {blocked: 1}}).exec();
                    global.fn.db.user.update({userid:user.userid}, {$set: {blocked: true}}).exec();
                }
            });

        //attachment
        if(msent && op.attachments.length > 0) await prepareAttachments(msent.chat.id, op.attachments, 0);
    }
    // get done
    else {
        getDoneTheSendProcess(op);
        return;
    }

    //waite for seconds
    await global.fn.sleep(35);

    //next
    op.next += addToNext;
    op.counter++;

    //send report message
    tempSendDetail = op;
    // var rMess = 'گزارش ارسال برای ' + op.sender.title + '\n';
    // rMess += 'تعداد کل کاربران: ' + op.total + '\n';
    // rMess += 'ارسال شده: ' + op.counter + '\n\n';

    if(op.next <= op.total)
    {
        // rMess += '⚠️ ' + 'لطفا این پیام را حذف نکنید...';
        // global.fn.editMessageText(rMess, {'chat_id': op.chat_id, 'message_id': op.message_id}).then();
        sendMessToNextUser(op, addToNext);
        return;
    }

    //done
    else getDoneTheSendProcess(op);
};

function getDoneTheSendProcess(op)
{
    //send report message
    var rMess = 'گزارش ارسال برای ' + op.sender.title + '\n';
    rMess += 'تعداد کل کاربران: ' + op.total + '\n';
    rMess += 'ارسال شده: ' + op.counter + '\n\n';

    //done
    rMess += '✅ ' + 'به همه ارسال شد';
    global.fn.sendMessage(op.userid, rMess);
}

var prepareAttachments = async function(chat_id, attachments, number)
{
    var nextItem = number +1;

    await global.fn.sendDocument(chat_id, attachments[number].id, attachments[number].type, {'caption':attachments[number].caption});
    //next attachment
    if(attachments.length > nextItem)
        await prepareAttachments(chat_id, attachments, nextItem);
}
//#endregion

module.exports = {
    preparetoSend,
    getReport
}