var name = 'post';

var checkRoute = function(option){

    var btnsArr  = [ 
        fn.mstr.post['name'],
        fn.mstr.post['back']
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

var showPostList = function(userid, injectedtext){
    fn.userOper.setSection(userid, fn.mstr.post['name'], true);
    var list = [fn.mstr.post.postOptions];
    var back = fn.str.goToAdmin['back'];
    var mess = (injectedtext) ? injectedtext : fn.mstr.post['name'];
    //find
    fn.db.post.find({}).select('name category').sort('-_id').exec((e, cats) => {
        if(cats && cats.length > 0) cats.forEach(function(element) { 
            var itemname = element.category + ' - ' + element.name;
            list.push(itemname); }, this);
        global.fn.sendMessage(userid, mess, fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false));        
    });
}

var createpostMess = function(userid, post){
    //create callback keyboard
    var detailArr = [];
    var querTag = fn.mstr.post.query;
    var fn_text     = querTag['post'] + '-' + querTag['admin'] + '-' + querTag['text'] + '-' + post._id;
    var fn_file     = querTag['post'] + '-' + querTag['admin'] + '-' + querTag['file'] + '-' + post._id;
    var fn_photo    = querTag['post'] + '-' + querTag['admin'] + '-' + querTag['photo'] + '-' + post._id;
    var fn_sound    = querTag['post'] + '-' + querTag['admin'] + '-' + querTag['sound'] + '-' + post._id;
    var fn_video    = querTag['post'] + '-' + querTag['admin'] + '-' + querTag['video'] + '-' + post._id;

    var fn_attachment   = querTag['post'] + '-' + querTag['admin'] + '-' + fn.str.query['attach'] + '-' + post._id;
    var fn_upload       = querTag['post'] + '-' + querTag['admin'] + '-' + fn.str.query['upload'] + '-' + post._id;

    var fn_name         = querTag['post'] + '-' + querTag['admin'] + '-' + querTag['name'] + '-' + post._id;
    var fn_category     = querTag['post'] + '-' + querTag['admin'] + '-' + querTag['category'] + '-' + post._id;
    var fn_description  = querTag['post'] + '-' + querTag['admin'] + '-' + querTag['description'] + '-' + post._id;
    var fn_delete       = querTag['post'] + '-' + querTag['admin'] + '-' + fn.str.query['delete'] + '-' + post._id;
    var fn_publication  = querTag['post'] + '-' + querTag['admin'] + '-' + fn.str.query['publication'] + '-' + post._id;
    var fn_order        = querTag['post'] + '-' + querTag['admin'] + '-' + fn.str.query['queryOrder'] + '-' + post._id;            
    var fn_allowLike    = querTag['post'] + '-' + querTag['admin'] + '-' + querTag['allowlike'] + '-' + post._id;            
    var fn_close        = querTag['post'] + '-' + querTag['admin'] + '-close';

    var tx_text =fn.mstr.post.types['text'].icon,
    tx_file     =fn.mstr.post.types['file'].icon,
    tx_photo    =fn.mstr.post.types['photo'].icon, 
    tx_sound    =fn.mstr.post.types['sound'].icon, 
    tx_video    =fn.mstr.post.types['video'].icon;

    console.log(post.type)
    if(post.type === 'text')       tx_text = tx_text + ' ' + fn.str['Published'];
    else if(post.type === 'file')  tx_file = tx_file + ' ' + fn.str['Published'];
    else if(post.type === 'photo') tx_photo = tx_photo + ' ' + fn.str['Published'];
    else if(post.type === 'sound') tx_sound = tx_sound + ' ' + fn.str['Published'];
    else if(post.type === 'video') tx_video = tx_video + ' ' + fn.str['Published'];

    //upload
    var tx_upload = 'آپلود';
    if(post.type === 'file'  && post.fileid)  tx_upload = 'آپلود' + fn.mstr.post.types['attached'];
    if(post.type === 'photo' && post.photoid && post.photoid.length > 0) tx_upload = 'آپلود' + fn.mstr.post.types['attached'];
    if(post.type === 'sound' && post.audioid) tx_upload = 'آپلود' + fn.mstr.post.types['attached'];
    if(post.type === 'video' && post.videoid) tx_upload = 'آپلود' + fn.mstr.post.types['attached']; 

    //publication
    var tx_publication = (post.publish) ? fn.str['Published'] +'منتشر شده' : fn.str['NotPublished'] +'منتشر نشده';

    //post or product
    var fn_isproduct = querTag['post'] + '-' + querTag['admin'] + '-' + querTag['isproduct'] + '-' + post._id;;
    var isProduct = (post.isproduct) ? '✅' : '◻️';
    var tx_product = isProduct + ' یک محصول است';
    var fn_price = querTag['post'] + '-' + querTag['admin'] + '-' + querTag['price'] + '-' + post._id;

    var productRow = [];
    productRow.push({'text': tx_product , 'callback_data': fn_isproduct});
    if(post.isproduct) productRow.push({'text': 'قیمت' , 'callback_data': fn_price});
    detailArr.push(productRow.reverse());

    //type btns
    detailArr.push([
        {'text': tx_text, 'callback_data': fn_text},
        {'text': tx_file, 'callback_data': fn_file},    
        {'text': tx_photo, 'callback_data': fn_photo},
        {'text': tx_sound, 'callback_data': fn_sound},
        {'text': tx_video, 'callback_data': fn_video}
    ]);

    //upload btn
    if(post.type !== 'text') detailArr.push([{'text': tx_upload, 'callback_data': fn_upload}]);

    detailArr.push([ 
        {'text': 'منو', 'callback_data': fn_category},
        {'text': 'توضیح', 'callback_data': fn_description},
        {'text': 'نام', 'callback_data': fn_name}
    ]);

    //priority and allow like
    var tx_allowlike = (post.allowlike) ? '◻️' + 'حذف دکمه لایک' : '✅' + 'حذف دکمه لایک';
    detailArr.push([
        {'text': 'اولویت', 'callback_data': fn_order},
        {'text': tx_allowlike, 'callback_data': fn_allowLike},
    ]);

    detailArr.push([
        {'text': 'حذف', 'callback_data': fn_delete},
        {'text': 'بستن', 'callback_data': fn_close},
        {'text': tx_publication, 'callback_data': fn_publication}
    ]);

    //attachment 
    detailArr.push([{'text': 'پیوست', 'callback_data': fn_attachment}]);
    //attached fiels
    if(post.attachments) post.attachments.forEach((element, i) => {
        var fn_removeAttchment = querTag['post'] + '-' + querTag['admin'] + '-' + fn.str.query['removeAttachment'] + '-' + post._id + '-' + i;
        var row = [ {'text':'❌', 'callback_data':fn_removeAttchment},
                    {'text':element.name, 'callback_data':'nothing'} ];
        detailArr.push(row);
    });

    //create message
    var description='...', 
    title    = post.name, 
    category = post.category, 
    order = post.order,
    publish  = fn.str['NotPublished'] + ' منتشر نشده.';

    if(post.description) description = post.description;
    publish = (post.publish) ? fn.str['Published'] : fn.str['NotPublished'] + ' منتشر شده.';

    var text = 'اطلاعات مطلب' + '\n' +
    'ــــــــــــــــــــــــــــــــ' + '\n' +
    '⏺ ' + 'عنوان: ' + title + '\n' +
    '⏺ ' + 'منو: ' + category + '\n' +
    '⏺ ' + 'اولویت: ' + order + '\n' +
    '⏺ ' + 'وضعیت: ' + publish + '\n';

    if(post.isproduct) text += '💶 ' + 'قیمت: ' + post.price + ' تومان \n';

    text += 'ــــــــــــــــــــــــــــــــ' + '\n' +
    '⏺ ' + 'توضیحات: ' + '\n' +
    description + '\n' + 
    'ــــــــــــــــــــــــــــــــ' + '\n' + 
    '⚠️' + 'برای ویرایش مطلب از دکمه های پیوست شده استفاده کنید.';

    //global.fn.sendMessage(userid, fn.str.query['seccess'], fn.generateKeyboard({section:fn.str.goTopost[0]}, false));    
    showPostList(userid);
    global.fn.sendMessage(userid, text, {"reply_markup" : {"inline_keyboard" : detailArr}});
}

var ceatePost = function(message){
    var newpost = new fn.db.post({
        'name': message.text,
        'category': fn.mstr.category['maincategory'],
        'order': 1,
        'type': 'text',
        'date': fn.time.gettime(),
        'publish': false
    });
    newpost.save(() => { 
        showPostList(message.from.id, fn.str.query['seccess']); 
        fn.updateBotContent();
    });
}

var editpost = async function(id, detail, userid, ecCallBack)
{
    var sendKey = true;
    //console.log('edit a post', id);
    var post = await fn.db.post.findOne({"_id": id}).exec().then();
    if(!post) global.fn.sendMessage(userid, 'این مطلب دیگر وجود ندارد');

    if(detail.name) post.name                       = detail.name;
    if(detail.category) post.category               = detail.category;
    if(detail.description) post.description         = detail.description;
    if(detail.type) post.type            = detail.type;
    if(detail.fileid) post.fileid        = detail.fileid;
    if(detail.audioid) post.audioid      = detail.audioid;
    if(detail.videoid) post.videoid      = detail.videoid;
    if(detail.thumbLink) post.thumbLink  = detail.thumbLink;
    if(detail.allowlike) post.allowlike  = !post.allowlike;

    if(detail.isproduct) post.isproduct  = !post.isproduct;
    if(detail.price) post.price      = detail.price;

    if(detail.publish){
        if(detail.publish === fn.str['Published']) post.publish = true;
        else if(detail.publish === 'switch') post.publish       = !post.publish;
        else post.publish = false;
    }
    if(detail.order) post.order = detail.order;

    //attachment
    //add
    if(detail.attachment) {
        sendKey = false;
        if(!post.attachments.length === 0) post.attachments = [];
        post.attachments.push(detail.attachment);
    }
    //remove
    if(detail.removeAttachment) post.attachments.splice(parseInt(detail.removeAttachment), 1);

    //albums
    //if(detail.clearalbum) {post.photoid = []; sendKey = false};
    if(detail.photoid) post.photoid = detail.photoid;

    post.save((e) => {
        if(e) console.log(e);
        if(!detail.clearalbum) global.fn.sendMessage(userid, fn.str.query['seccess']);
        if(sendKey) {
            var nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.post['name'];
            fn.userOper.setSection(userid, nSection, false);
            createpostMess(userid, post);
        }
        global.fn.updateBotContent();
        if(ecCallBack) ecCallBack();
    });
}

var upload = require('./upload');
var user   = require('./user');
var query = require('./query');

var routting = function(message, speratedSection)
{
    var text = message.text;
    var last = speratedSection.length-1;
    
    //show posts root
    if(text === fn.mstr.post['name'] || text === fn.mstr.post['back']) showPostList(message.from.id);

    //create new post
    else if(text === fn.mstr.post.postOptions[1])
    {
        var mess = fn.mstr.post.edit['newSCMess'];
        var back = fn.mstr.post['back'];
        
        fn.userOper.setSection(message.from.id, fn.mstr.post.postOptions[1], true);        
        global.fn.sendMessage(message.from.id, mess, fn.generateKeyboard({'section': back}, true));
    }
    else if(speratedSection[last] === fn.mstr.post.postOptions[1])
    {
        if(fn.m.category.checkInValidCat(text)) global.fn.sendMessage(message.from.id, fn.mstr.post.scErrors[0]);
        else if(fn.checkValidMessage(text)) global.fn.sendMessage(message.from.id, fn.str.query['chooseOtherText']);
        else if(text.includes('-') || text.legth > 50) global.fn.sendMessage(message.from.id, fn.str.query['chooseOtherText']);
        else{
            fn.db.post.findOne({'name': text}).exec((e, post) => {
                if(!post) ceatePost(message);
                else global.fn.sendMessage(message.from.id, fn.mstr.post.scErrors[1]);
            });
        }
    }

    //edit name
    else if(speratedSection[last-1] === fn.mstr.post.edit['name']){
        if(fn.m.category.checkInValidCat(text)) global.fn.sendMessage(message.from.id, fn.mstr.post.scErrors[0]);
        else if(fn.checkValidMessage(text)) global.fn.sendMessage(message.from.id, fn.str.query['chooseOtherText']);
        else{
            fn.db.post.findOne({'name': text}).exec((e, post) => {
                if(!post) editpost(speratedSection[last], {'name': text}, message.from.id);
                else global.fn.sendMessage(message.from.id, fn.mstr.post.scErrors[1]);
            });
        }
    }

    //edit decription
    else if (speratedSection[last-1] === fn.mstr.post.edit['description']) 
        editpost(speratedSection[last], {'description': text}, message.from.id);

    //edit category
    else if (speratedSection[last-1] === fn.mstr.post.edit['category']){
        var cat = text.split(' - ')[1];
        if(fn.m.category.checkInValidCat(cat)) editpost(speratedSection[last], {'category': cat}, message.from.id);
        else global.fn.sendMessage(message.from.id, fn.str.query['choosethisItems']);
    }

    //edit order
    else if (speratedSection[last-1] === fn.mstr.post.edit['order']) {
        var order = parseInt(text);
        if(!isNaN(order)) editpost(speratedSection[last], {'order': text}, message.from.id);
        else global.fn.sendMessage(message.from.id, fn.mstr.post.edit['order']); 
    }  
        
    //edit price
    else if (speratedSection[last-1] === fn.mstr.post.edit['price']) {
        var price = parseInt(text);
        if(!isNaN(price) && price > 99) editpost(speratedSection[last], {'price': text}, message.from.id);
        else global.fn.sendMessage(message.from.id, fn.mstr.post.edit['price']); 
    }

    //end upload
    else if (speratedSection[last-1] === fn.mstr.post['endupload']){
        fn.db.post.findOne({'_id': speratedSection[last]}).exec((e, post) => {
            if(post) createpostMess(message.from.id, post);           
        });
    }

    //end attachment
    else if (speratedSection[last-1] === fn.mstr.post['endAttach']){
        fn.db.post.findOne({'_id': speratedSection[last]}).exec((e, post) => {
            if(post) createpostMess(message.from.id, post);           
        });
    }

    //choose a post
    else {
        var postname = text.split(' - ')[1];
        fn.db.post.findOne({'name': postname}).exec((e, post) => {
            if(post) createpostMess(message.from.id, post);
            else global.fn.sendMessage(message.from.id, fn.str.query['choosethisItems']);            
        });
    }
}
module.exports = { name, checkRoute, routting, query, showPostList, editpost, upload, user }