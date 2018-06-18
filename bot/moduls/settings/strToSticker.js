var showitem = async function (userid, name) 
{
    var btn = await fn.db.strStickers.findOne({'name': name}).exec().then();
    if(!btn) return;

   //create callback keyboard
   var detailArr = [];
   var qt = fn.mstr['settings'].query;

   var sticker = qt['settings'] + '-' + qt['admin'] + '-' + qt['strSticker'] + '-' + qt['sticker'] + '-' + btn._id;
   var fn_delete = qt['settings'] + '-' + qt['admin'] + '-' + qt['strSticker'] + '-' + qt['delete'] + '-' + btn._id;

   //edit btns //publication btn
   detailArr.push([ 
        {'text': 'استیکر', 'callback_data': sticker},
        {'text': 'حذف', 'callback_data': fn_delete},
    ].reverse());

   //create message
   var text = 'اطلاعات دکمه' + '\n' +
   'ــــــــــــــــ' + '\n' +
   `🔶 نام دکمه: ${btn.name} \n` +
   `🔶 نوع: ${btn.type} \n` +
   `🔶 ایدی: ${btn.fileid} \n\n` +
   'لطفا برای تنظیم استیکر از گزینه های زیر استفاده کنید.';
 
   global.fn.sendMessage(userid, text, {"reply_markup" : {"inline_keyboard" : detailArr}});
}

var create = async function(userid, name)
{
    var existedSticker = await fn.db.strStickers.count({'name': name}).exec().then();
 
    // error
    if(existedSticker || !name.startsWith('-'))
    {
        var mess = fn.mstr['settings'].mess['getstickerName'];
        global.fn.sendMessage(userid, mess);
        return;
    }

    // creat new button
    var newSticker = {'name': name}; 
    await new fn.db.strStickers(newSticker).save().then();
    show(userid, fn.mstr['seccess']);
}

var show = async function(userid, txt)
{
    var titles = [[ fn.mstr['settings'].btns['addsticker'] ]];
    var stickers = await fn.db.strStickers.find({}).limit(35).sort('-_id').exec().then();
    
    //make title list
    stickers.map(item => { titles.push(item.name); });

    var section = fn.mstr['settings'].btns['strToSticker'];
    var back = fn.mstr['settings'].btns['strToSticker_back'];
    var mess = (txt) ? txt : section;
    var markup = global.fn.generateKeyboard({'custom': true, 'grid':false, 'list': titles, 'back':back}, false);
    global.fn.sendMessage(userid, mess, markup);
    fn.userOper.setSection(userid, section, true);
}

var editItem = async function(id, detail, userid)
{
    var btn = await fn.db.strStickers.findOne({'_id': id}).exec().then();

    if(!btn) 
    {
        show(message,'این دکمه وجود ندارد');
        return;
    }

    //file
    btn.fileid  = detail.fileid;
    btn.type    = detail.type;

    await btn.save().then();
    show(userid, fn.str['seccess']);
    showitem(userid, btn.name);
}

var routting = function(message, speratedSection, user, mName)
{
    var btns = fn.mstr[mName].btns;
    var text = message.text;
    var last = speratedSection.length-1;
    var userid = message.from.id;

    //ask to show section
    if (text === btns['strToSticker'] || text === btns['strToSticker_back'])
        show(userid);

    //create new sticker
    else if (text === btns['addsticker'])
    {
        var mess = fn.mstr['settings'].mess['getstickerName'];
        var markup = fn.generateKeyboard({'section':btns['strToSticker_back']}, true);
        global.fn.sendMessage(userid, mess, markup);
        fn.userOper.setSection(userid, btns['addsticker'], true);
    }
    //get the title of new message
    else if(speratedSection[4] === btns['addsticker'])
        create(userid, text);

    //choose an button
    else showitem(userid, text);
}

var query = async function(query, speratedQuery, user, mName)
{
    var last = speratedQuery.length-1;
    var queryTag = fn.mstr[mName].query;

    //upload sticker
    if(speratedQuery[last-1] === queryTag['sticker'])
    {
        var nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr[mName].name + '/' + fn.mstr[mName].btns['strToSticker'] + '/' + fn.mstr[mName].sections['upload'] + '/' + speratedQuery[last];
        var markup = fn.generateKeyboard({section: fn.mstr[mName].btns['strToSticker_back']}, true);
        var mess = fn.mstr[mName].mess['getSticker'];

        global.fn.sendMessage(query.from.id, mess, markup);
        fn.userOper.setSection(query.from.id, nSection, false);
    }

    //delete
    else if (speratedQuery[last-1] === queryTag['delete'])
    {
        var id = speratedQuery[last];
        await fn.db.strStickers.remove({'_id': id}).then();
        show(query.from.id, fn.str['seccess']);
    }
}

var upload = function(message, speratedSection, user, mName)
{
    var last = speratedSection.length-1;
    var userid = message.from.id;

    if(speratedSection[last-1] === fn.mstr[mName].sections['upload']) 
    {
        console.log('recognize file type');
        var id = speratedSection[last];
        
        var resourceid = '';
        var fileType = '';

        //file
        if(message.document){
            resourceid = message.document.file_id;
            editItem(id, {'fileid': resourceid, type:'document'}, userid);
        }
        //photo
        else if(message.photo){
            resourceid = message.photo[2].file_id;
            editItem(id, {'fileid': resourceid, type:'photo'}, userid);
        }       
        //audio
        else if(message.audio){       
            resourceid = message.audio.file_id;
            editItem(id, {'fileid': resourceid, type:'audio'}, userid);
        }
        //video
        else if(message.video){
            resourceid = message.video.file_id;
            editItem(id, {'fileid': resourceid, type:'video'}, userid);
        }
        //video
        else if(message.sticker){
            resourceid = message.sticker.file_id;
            editItem(id, {'fileid': resourceid, type:'sticker'}, userid);
        }
    }
}

var check = async function (userid, name)
{
    var lastmess = await fn.getLastMessage(userid);
    var result = {status: false, replacer: null};
    var replacer = await fn.db.strStickers.findOne({'name': `-${lastmess.text}`}).exec().then();
    if(replacer) result.status = true;
    result.replacer = replacer;
    return result;
}

module.exports = { routting, query, upload, check }