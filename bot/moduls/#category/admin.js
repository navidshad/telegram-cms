var name = 'category';

var checkRoute = function(option){

    var btnsArr  = [ 
        fn.mstr.category['name'],
        fn.mstr.category['back']
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

//primarly
var get  = async function(callback)
{
    global.robot.category = [{'name':fn.mstr.category.maincategory, 'parent':'.'}];
    
    let isAdded = function(cat) {
        var isAdded = false;
        
        global.robot.category.forEach((c) => {
           if(c.name == cat.name && cat.parent)
            isAdded = true;
        });
        
        return isAdded;
    }
    
    var cats = await fn.db.category.find({}).exec().then();
    cats.forEach((element) =>
    {
        console.log(element);
        
        var newItem = {
            'name':element.name,
            'parent': element.parent,
            'order':element.order
        };
        
        if(!isAdded(element)) global.robot.category.push(newItem);
    });

    if(callback) callback();
}

var checkInValidCat = function(text, custom){
    var isvalid = false;
    if(custom) {
        custom.forEach(function(element) {
            if(element === text) 
                isvalid = true;
        }, this);
    }
    else{
        //category
        if(text === fn.mstr.category.maincategory) isvalid = true;
        else{
            global.robot.category.forEach(function(element) {
                if(element.name === text) 
                    isvalid = true;
            }, this);
        }
    }

    return isvalid;
}  

var showRoot = function(message, speratedSection){
    var nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] +  '/' + fn.mstr['category']['name'] + '/' + fn.mstr.category.maincategory;
    fn.userOper.setSection(message.from.id, nSection, false);
    showCategoryDir(message.from.id, fn.mstr.category.maincategory, speratedSection);
}

//additional
var showCategoryDir = function(userid,catname, speratedSection){
    var parent;
    //parent
    if(catname === fn.mstr.category.maincategory) parent = '';
    else{
        for(var i =0; i<speratedSection.length; i++){
            if(speratedSection[i] === catname) parent = speratedSection[i-1];
        }
    }

    var list = [fn.mstr.category.categoryoptions[0], fn.mstr.category.categoryoptions[1]];
    var back = (catname === fn.mstr.category.maincategory) ? fn.str.goToAdmin['back'] : fn.mstr.category['backtoParent'] + ' از "' + catname + '" به ' + ' - ' + parent;

    fn.db.category.find({'parent':catname}).exec((e, cats) => {
        if(cats && cats.length > 0) cats.forEach(function(element) { list.push(element.order + ' - ' + element.name); }, this);
        global.fn.sendMessage(userid, catname, 
        fn.generateKeyboard({'custom': true, 'grid':true, 'list': list, 'back':back}, false));                
    });
}

var createcategory = function(name, speratedSection, userid){
    //create new category
    var newcategory = new fn.db.category({
        'name': name,
        'parent': speratedSection[speratedSection.length-2],
        'order':1,
    });
    newcategory.save(() => {showCategoryDir(userid, newcategory.parent, speratedSection); global.fn.updateBotContent(); });
}

var deleteCategory = require('./delete');

var createcategoryMess = function(userid, category, option){
    //create callback keyboard
    var detailArr = [];
    
    var fn_name         = fn.mstr.category['queryCategory'] + '-' + fn.mstr.category['queryCategoryName'] + '-' + category._id;
    var fn_parent       = fn.mstr.category['queryCategory'] + '-' + fn.mstr.category['queryCategoryParent'] + '-' + category._id;
    var fn_description  = fn.mstr.category['queryCategory'] + '-' + fn.mstr.category['queryCategoryDescription'] + '-' + category._id;
    var fn_delete       = fn.mstr.category['queryCategory'] + '-' + fn.mstr.category['queryDelete'] + '-' + category._id;
    var fn_attachment   = fn.mstr.category['queryCategory'] + '-' + global.fn.str.query['attach'] + '-' + category._id;
    var fn_order        = fn.mstr.category['queryCategory'] + '-' + fn.mstr.category['queryOrder'] + '-' + category._id;    
    var fn_close        = fn.mstr.category['queryCategory'] + '-close';
    
    var fn_publication  = fn.mstr.category['queryCategory'] + '-' + fn.str.query['publication'] + '-' + category._id;
    var fn_sendAll      = fn.mstr.category['queryCategory'] + '-' + fn.mstr.category['sendall'] + '-' + category._id;
    
    detailArr.push([ 
        {'text': 'دسته مادر', 'callback_data': fn_parent},
        {'text': 'توضیح', 'callback_data': fn_description},
        {'text': 'نام', 'callback_data': fn_name}
    ]);
    
    //publication
    var tx_publication = (category.publish) ? fn.str['Published'] +' فعال' : fn.str['NotPublished'] +' غیر فعال';
    var tx_sendall = (category.sendAll) ? fn.str['Published'] +' ارسال یکجا' : fn.str['NotPublished'] +' ارسال یکجا';

    detailArr.push([
        {'text': 'حذف', 'callback_data': fn_delete},
        {'text': 'بستن', 'callback_data': fn_close},
        {'text': 'اولویت', 'callback_data': fn_order},
    ]);

    detailArr.push([
        {'text': tx_publication, 'callback_data': fn_publication},
        {'text': tx_sendall, 'callback_data': fn_sendAll},
        {'text': 'آپلود پیوست', 'callback_data': fn_attachment}
    ]);

    if(category.attachments) category.attachments.forEach((element, i) => {
        var fn_removeAttchment = fn.mstr.category['queryCategory'] + '-' + fn.str.query['removeAttachment'] + '-' + category._id + '-' + i;
        var row = [ 
            {'text':'❌', 'callback_data':fn_removeAttchment},
            {'text':element.name, 'callback_data':'nothing'} 
        ];
        detailArr.push(row);
    });

   //create message
   var description='...', 
   title    = category.name, 
   parent = category.parent, 
   order = category.order,
   publish  = fn.str['NotPublished'] + ' منتشر نشده.';

   if(category.description) description = category.description;
   publish = (category.publish) ? fn.str['Published'] : fn.str['NotPublished'] + ' منتشر شده.';

   var text = 'اطلاعات مطلب' + '\n' +
   'ــــــــــــــــــــــــــــــــ' + '\n' +
   '⏺ ' + 'عنوان: ' + title + '\n' +
   '⏺ ' + 'دسته مادر: ' + parent + '\n' +
   '⏺ ' + 'اولویت: ' + order + '\n' +
   '⏺ ' + 'توضیحات: ' + '\n' +
   'ــــــــــــــــــــــــــــــــ' + '\n' +
   description + '\n' + 
   'ــــــــــــــــــــــــــــــــ' + '\n' + 
   '⚠️' + 'برای ویرایش مطلب از دکمه های پیوست شده استفاده کنید.';

   //global.fn.sendMessage(userid, fn.str['seccess'], fn.generateKeyboard({section:fn.str.goTocategory[0]}, false));    
   //showcategoryList(userid);
   global.fn.sendMessage(userid, text, {"reply_markup" : {"inline_keyboard" : detailArr}});
}

updatePostCategory = function(oldCat, newCat){
    fn.db.post.update({'category': oldCat}, {'category': newCat}, {'multi': true}).exec();
}

var editcategory = async function(id, detail, userid, speratedSection, ecCallBack){
    //console.log('edit a category', id);
    var sendKey = true;
    var category = await fn.db.category.findOne({"_id": id}).exec().then();

    if(!category)
    {
        global.fn.sendMessage(userid, 'این منو دیگر وجود ندارد', fn.generateKeyboard({section:fn.str['goTocategory']}));
        return;
    }
    
    if(detail.name) {
        var oldn = category.name;
        category.name = detail.name;
        updatePostCategory(oldn, detail.name);
    }
    
    if(detail.parent) category.parent = detail.parent;
    if(detail.description) category.description = detail.description;
    if(detail.order) category.order = detail.order;


    //attachment
    //add
    if(detail.attachment) {
        speratedSection = speratedSection.splice(speratedSection.length-1, 1);
        sendKey = false;
        if(!category.attachments.length === 0) category.attachments = [];
        category.attachments.push(detail.attachment);
        global.fn.sendMessage(userid, 'انجام شد');
    }
    //remove
    if(detail.removeAttachment) category.attachments.splice(parseInt(detail.removeAttachment), 1);

    await category.save().then();
    //get new category
    global.fn.updateBotContent(() => 
    {
        if(!sendKey) return;
        
        fn.userOper.setSection(userid, fn.mstr.category.maincategory, true);
        createcategoryMess(userid, category);
        showCategoryDir(userid, category.parent, speratedSection); 
    });
                    
    if(ecCallBack) ecCallBack();

}

//routting
var routting = async function(message, speratedSection)
{
    var text = message.text;
    var last = speratedSection.length-1;
    var catname = (text.split(' - ')[1]) ? text.split(' - ')[1] : text;
    
    //show category root
    if(text === fn.mstr.category['name'] || text === fn.mstr.category['back']){
        console.log('root gategory');
        showRoot(message, speratedSection);
    }
    
    //back to a category
    else if(text.includes(fn.str['back']) || text.includes(fn.str['escapEdit']) && text.split(' - ')[1]){
        console.log('back to category', text);
        var catname = text.split(' - ')[1];
        fn.userOper.setSection(message.from.id, catname, true);
        showCategoryDir(message.from.id, catname, speratedSection);
    }

    //go to specific cat
    else if(checkInValidCat(catname) && checkInValidCat(speratedSection[last])){
        console.log('go to category', catname);
        speratedSection.push(catname);
        fn.userOper.setSection(message.from.id, catname, true);
        showCategoryDir(message.from.id, catname, speratedSection);
    }
    
    //add new 
    else if(text === fn.mstr.category.categoryoptions[1] && checkInValidCat(speratedSection[last])){
        var mess = fn.mstr.category.categoryoptions[1];
        var back = fn.str['back'] + ' - ' + speratedSection[last];
        
        fn.userOper.setSection(message.from.id, mess, true);        
        global.fn.sendMessage(message.from.id, mess, fn.generateKeyboard({'section': back}, true));
    }
    else if(speratedSection[last] === fn.mstr.category.categoryoptions[1]){
        var parent = speratedSection[last-2];
        var grandparent = speratedSection[last-3];
        console.log('create category', text);
        if(checkInValidCat(text)) global.fn.sendMessage(message.from.id, fn.mstr.post.scErrors[2]);
        else if(fn.checkValidMessage(text)) global.fn.sendMessage(message.from.id, fn.str['chooseOtherText']);
        else if(text.includes('-') || text.legth > 50) global.fn.sendMessage(message.from.id, fn.str['chooseOtherText']);
        else{
            fn.db.category.findOne({'name': text}).exec((e, category) => {
                if(!category){ 
                    fn.userOper.setSection(message.from.id, speratedSection[last-1], true);
                    createcategory(text, speratedSection, message.from.id);
                }
                else global.fn.sendMessage(message.from.id, fn.mstr.post.scErrors[0]);
            });
        }
    }

    //edit mode
    else if(text === fn.mstr.category.categoryoptions[0] && checkInValidCat(speratedSection[last])){            
        console.log('show edit mode');
        var catlist = [];
        deleteCategory.find({'parent': speratedSection[last]}).map((i) => { catlist.push(i.name) });

        if(catlist.length > 0){
            var back = fn.str['escapEdit'] + ' - ' + speratedSection[last];
            fn.userOper.setSection(message.from.id, fn.mstr.category.categoryoptions[0], true);                    
            global.fn.sendMessage(message.from.id, 'انتخاب کنید', fn.generateKeyboard({'custom': true, 'grid':true, 'list': catlist, 'back':back}, false));
        }
        else global.fn.sendMessage(message.from.id, 'در اینجا گزینه ای برای ویرایش وجود ندارد.');
    }
    else if(speratedSection[last] === fn.mstr.category.categoryoptions[0]){
        console.log('show category option');
        var catlist = [];
        deleteCategory.find({'parent': speratedSection[last-1]}).map((i) => { catlist.push(i.name) });
        if(!checkInValidCat(text, catlist)) {global.fn.sendMessage(message.from.id, fn.str['choosethisItems']); return;}
        else {
            //fn.userOper.setSection(message.from.id, speratedSection[last-1], true);                                
            //deleteCategory.clear(text, () => {showCategoryDir(message.from.id, speratedSection[last-1], speratedSection)});            
            fn.db.category.findOne({'name':text}).exec((e, cat) => {
                createcategoryMess(message.from.id, cat);
            });
        }
    }

    //edit name
    else if(speratedSection[last-1] === fn.mstr.category.edit['name']){
        if(checkInValidCat(text)) global.fn.sendMessage(message.from.id, fn.mstr.post.scErrors[2]);
        else if(fn.checkValidMessage(text)) global.fn.sendMessage(message.from.id, fn.str['chooseOtherText']);
        else{
            fn.db.category.findOne({'_id': speratedSection[last]}).exec((e, category) => {
                if(category) editcategory(speratedSection[last], {'name': text}, message.from.id, speratedSection);
                else global.fn.sendMessage(message.from.id,  fn.str['chooseOtherText']);
            });
        }
    }

    //edit decription
    else if (speratedSection[last-1] === fn.mstr.category.edit['description'])
        editcategory(speratedSection[last], {'description': text}, message.from.id, speratedSection);

    //edit parent
    else if (speratedSection[last-1] === fn.mstr.category.edit['parent']){
        var cat = text.split(' - ')[1];
        if(fn.m.category.checkInValidCat(cat)){
            editcategory(speratedSection[last], {'parent': cat}, message.from.id, speratedSection);
        }else global.fn.sendMessage(message.from.id, fn.str['choosethisItems']);
    }

    //edit order
    else if(speratedSection[last-1] === fn.mstr.category.edit['order']){
        if(parseFloat(text) || text === 0) editcategory(speratedSection[last], {'order': text}, message.from.id, speratedSection);        
        else global.fn.sendMessage(message.from.id, fn.mstr.category.edit['order']);        
    }

    //end attachment
    else if (speratedSection[last-1] === fn.mstr.category['endAttach'])
    {
        var cat = await fn.db.category.findOne({'_id':speratedSection[last]}).exec().then()
        if(cat) createcategoryMess(message.from.id, cat);
        showRoot(message, speratedSection);
    }
}

var query = require('./query');
var upload = require('./upload');

module.exports = { name, get, checkRoute, routting, query, createcategoryMess, editcategory, checkInValidCat, deleteCategory, upload }