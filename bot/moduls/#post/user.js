var show = async function(message, postName, user, optionPrams, callback)
{
    var option = (optionPrams) ? optionPrams : {};
    var post = await fn.db.post.findOne({'name': postName, 'publish': true}).exec().then();
    var detailArr = [];
    
    //nothing
    if(!post) {
        if(callback) callback(user);
        return;
    }
    
    if(post.isproduct) {
        //inline buttuns
        var query = fn.mstr.commerce.query;
        var fn_addToBag = query['commerce'] + '-' + query['user'] + '-' + query['addToBag'] + '-' + 'post' + '-' + post.id;

        var isbought = await fn.m.commerce.user.bag.checkBoughtItem(user.userid, post.id);
        if(!isbought) 
            detailArr.push([ {'text': 'افزودن به سبد', 'callback_data': fn_addToBag} ]);   
    }

    //like button 
    if(post.allowlike)
    {
        var like = await fn.m.favorites.user.getbutton(user.userid, 'post', post.id);
        if(like) detailArr.push([like]);
    }

    var description = post.description + '\n @' +  global.robot.username;
    var markup = {'inline_keyboard': detailArr};
    var option = {'caption' : description, 'reply_markup': markup};

    //send post
    switch (post.type) {
        case fn.mstr.post.types['text'].name:
            console.log('send text post');
            await global.fn.sendMessage(user.userid, description, option).then();
            break;
        case fn.mstr.post.types['file'].name:
            console.log('send file post');
            await global.robot.bot.sendDocument(user.chatid, post.fileid, option).then();
            break;
        case fn.mstr.post.types['photo'].name:
            console.log('send photo post');
            await global.robot.bot.sendPhoto(user.chatid, post.photoid, option).then();
            break;
            
        case fn.mstr.post.types['sound'].name:
            console.log('send sound post');
            await global.robot.bot.sendAudio(user.chatid,post.audioid, option).then();
            break;

        case fn.mstr.post.types['video'].name:
            console.log('send video post');
            await global.robot.bot.sendVideo(user.chatid,post.videoid, option).then();
            break;
    }
    
    let eventCategory = 'post';
    
    // send attachments
    let allowSendAttachments = false;
    
    if(post.isproduct)
    {
        eventCategory = 'product';
        allowSendAttachments = await fn.m.commerce.user.bag.checkBoughtItem(user.userid, post.id);
    }
    else allowSendAttachments = true;
    
    if(allowSendAttachments)
        snedAttachmentArray(message, post.attachments, 0);
        
    // analytic
    let eventAction = 'show';
    let eventLabel = postName;
    fn.m.analytic.trackEvent(user.userid, eventCategory, eventAction, eventLabel);
}

var snedAttachmentArray = function(message, attachments, number)
{
    //return 0
    if(attachments.length === 0) return;
    
    var nextItem = number +1;
    //console.log('attachment length ', attachments.length, number);
    send(message, attachments[number].id, attachments[number].type, attachments[number].caption, () => {
    if(attachments.length > nextItem) snedAttachmentArray(message, attachments, nextItem);
  });
}

//send an attachment item
var send = function(message, resid, type, caption, callback){
    switch (type) {
        case fn.mstr.post.types['file'].name:
            global.robot.bot.sendDocument(message.chat.id, resid, {'caption':caption})
            .then(() => { if(callback) callback() });               
            break;
        case fn.mstr.post.types['photo'].name:
            global.robot.bot.sendPhoto(message.chat.id, resid, {'caption':caption})
            .then(() => { if(callback) callback() });
            break;
        case fn.mstr.post.types['sound'].name:
            global.robot.bot.sendAudio(message.chat.id, resid, {'caption':caption})
            .then(() => { if(callback) callback() });
            break;
        case fn.mstr.post.types['video'].name:
            global.robot.bot.sendVideo(message.chat.id, resid, {'caption':caption})
            .then(() => { if(callback) callback() });
            break;
    }
}

async function sendAllPost(categoryName, message, user)
{
    var posts = await fn.db.post.find({'category': categoryName, 'publish': true}).exec().then();
    
    console.log('sendAllPost', posts.length);
    
    for(var i =0; i < posts.length; i++)
        await show(message, posts[i].name, user);
}

var makebtntitle = function(post)
{
    var btn = post.name;
    return btn;
}

var searchRoute = function (userid, text)
{
    return new Promise(async (resolve, reject) => 
    {
        var posts = await fn.db.post.find({ $text: {$search: text}}).limit(30).exec().then()
        .catch(e => {
            console.log(e);
        });
        var reesult = {
            items: posts, 
            mName:'post', 
            'makebtntitle': makebtntitle
        };
        resolve(reesult);
    });
}

global.fn.eventEmitter.on('searchshowitem', async (message, speratedSection) => 
{
    var symbol = fn.mstr['post'].symbol;
    var text = message.text;
    if(!text.startsWith(symbol)) return;

    message.text = message.text.replace(symbol, '');
    message.text = message.text.trim();
    fn.m.post.user.show(message, message.text, () => {
        //item does not existed
        global.fn.sendMessage(message.user.id, fn.str['choosethisItems']);
    });
});
module.exports = { show, snedAttachmentArray, searchRoute, sendAllPost }
