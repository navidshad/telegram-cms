var checkQuery = function(option){

    var btnsArr  = [ 
        fn.mstr.post.query['post']
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

var uploadSection = function(query,speratedQuery)
{
    console.log('get post file');
    var last = speratedQuery.length-1;
    var newSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.post['name'] + '/' + fn.mstr.post['endupload'] + '/' + speratedQuery[last];
    var markup = fn.generateKeyboard({section:fn.mstr.post['endupload']}, true);
    fn.userOper.setSection(query.from.id, newSection, false);
    global.fn.sendMessage(query.from.id, fn.mstr.post.edit['upload'], markup);
}

var attachSection = function(query,speratedQuery)
{
    console.log('get attachment');
    var last = speratedQuery.length-1;
    var markup = fn.generateKeyboard({section:fn.mstr.post['endAttach']}, true);
    var newSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.post['name'] + '/' + fn.mstr.post['endAttach'] + '/' + speratedQuery[last];
    fn.userOper.setSection(query.from.id, newSection, false);
    global.fn.sendMessage(query.from.id, fn.mstr.post.edit['attach'], markup);
}

var removeattachment = function(query,speratedQuery)
{
    var last = speratedQuery.length-1;
    console.log('remove attachment');
    var newSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.post['name'];
    fn.userOper.setSection(query.from.id, newSection, false);
    fn.m.post.editpost(speratedQuery[last-1], {'removeAttachment': speratedQuery[last]}, query.from.id)
}

var description = function(query, speratedQuery)
{
    console.log('get new title of post');
    var last = speratedQuery.length-1;
    fn.userOper.setSection(query.from.id, fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name']  + '/' + fn.mstr.post['name'] + '/' + fn.mstr.post.edit['description'] + '/' + speratedQuery[last], false);
    global.fn.sendMessage(query.from.id, fn.mstr.post.edit['description'], fn.generateKeyboard({section:fn.mstr.post['name']}, true));
}

var order = function(query, speratedQuery)
{
    console.log('get new order');
    var last = speratedQuery.length-1;
    fn.userOper.setSection(query.from.id, fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name']  + '/' + fn.mstr.post['name'] + '/' + fn.mstr.post.edit['order'] + '/' + speratedQuery[last], false);
    global.fn.sendMessage(query.from.id, fn.mstr.post.edit['order'], fn.generateKeyboard({section:fn.mstr['post']['back']}, true));
}

var category = function (query, speratedQuery)
{
    console.log('get new category of post');
    var last = speratedQuery.length-1;
    fn.userOper.setSection(query.from.id, fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name']  + '/' + fn.mstr.post['name'] + '/' + fn.mstr.post.edit['category'] + '/' + speratedQuery[last], false);
    var back = fn.mstr.post['back'];
    var list = [];
    global.robot.category.forEach(function(element) { list.push(element.parent + ' - ' + element.name); }, this);
    global.fn.sendMessage(query.from.id, fn.mstr.post.edit['category'], 
    fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false));
}

var routting = async function(query, speratedQuery)
{
    var queryTag = global.fn.mstr.post.query;
    var last = speratedQuery.length-1;

    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);

    //choose a type
    if(speratedQuery[2].includes('format')){
        var type = speratedQuery[2].replace('format', '').trim();
        console.log('format query', type);
        fn.m.post.editpost(speratedQuery[last], {'type': type, 'publish': fn.str['NotPublished']}, query.from.id);
    }
  
      //is product
    if(speratedQuery[2] === queryTag['isproduct']){
        fn.m.post.editpost(speratedQuery[last], {'isproduct': true, 'publish': fn.str['NotPublished']}, query.from.id);
    }

    //edit price
    if(speratedQuery[2] === queryTag['price']){
        console.log('get new price of post');
        var mess = fn.mstr.post.edit['price'];
        var nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.post['name'] + '/' + mess + '/' + speratedQuery[last];
        var markup = fn.generateKeyboard({section:fn.mstr.post['name']}, true);

        fn.userOper.setSection(query.from.id, nSection, false);
        global.fn.sendMessage(query.from.id, mess, markup);
    }

    //edit name
    if(speratedQuery[2] === queryTag['name']){
        console.log('get new title of post');
        fn.userOper.setSection(query.from.id, fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.post['name'] + '/' + fn.mstr.post.edit['name'] + '/' + speratedQuery[last], false);
        global.fn.sendMessage(query.from.id, fn.mstr.post.edit['name'], fn.generateKeyboard({section:fn.mstr.post['name']}, true));
    }

    //edit description
    else if(speratedQuery[2] === queryTag['description']) description(query, speratedQuery);
    //edit category
    else if(speratedQuery[2] === queryTag['category']) category(query, speratedQuery);
    //upload
    else if(speratedQuery[2] === global.fn.str.query['upload']) uploadSection(query,speratedQuery)
    //edit order
    else if(speratedQuery[2] === global.fn.str.query['queryOrder']) order(query, speratedQuery);
    
    //publication
    if(speratedQuery[2] === fn.str.query['publication']){
        console.log('get resource price');
        var post = await fn.db.post.findOne({'_id': speratedQuery[last]}).exec().then();
        if(!post) console.log('post wasnt found');
        var allow = true;

        //get description
        if(!post.description){
            allow = false;
            global.fn.sendMessage(query.from.id, 'لطفا قسمت توضیحاترا کامل کنید.');
            description(query, speratedQuery);
        }

        //ask to upload something
        var uploadMess = fn.mstr.post.uploadMess;
        var idNames = fn.mstr.post.idNames;
        Object.keys(uploadMess).forEach(key => 
        {
            var idName = idNames[post.type];
            if(post.type !== key) return;
            if(post[idName]) return;
            
            allow = false;
            global.fn.sendMessage(query.from.id, uploadMess[key]);
        });
        if(!allow) {
            uploadSection(query, speratedQuery);
            return;
        }

        //switch publication
        fn.m.post.editpost(speratedQuery[last], {'publish': 'switch'}, query.from.id);
    }

    //delete post
    else if(speratedQuery[2] === global.fn.str.query['delete'])
    {
        var post = await fn.db.post.findOne({'_id': speratedQuery[last]}, 'name').exec().then();
        
        if(post) 
            global.fn.eventEmitter.emit('deleteFavorite', {'oldName': post.name});
        
        fn.db.post.remove({'_id': speratedQuery[last]}, function(err){
            global.fn.m.post.showPostList(query.from.id, fn.str.query['seccess']);
            global.fn.updateBotContent();
        });
    }

    //attaching
    else if(speratedQuery[2] === global.fn.str.query['attach']) attachSection(query,speratedQuery)
    else if(speratedQuery[2] === fn.str.query['removeAttachment']) removeattachment(query,speratedQuery);

    //allow like
    else if(speratedQuery[2] === queryTag['allowlike']) 
        fn.m.post.editpost(speratedQuery[last], {'allowlike': 'switch'}, query.from.id);

}

module.exports = { checkQuery, routting } 