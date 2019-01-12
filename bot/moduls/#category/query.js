var checkQuery = function(option){

    var btnsArr  = [ 
        fn.mstr.category['queryCategory']
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

var description = function(query, speratedQuery){
    console.log('get new description of post');
    fn.userOper.setSection(query.from.id, fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr['category']['name'] + '/' + fn.mstr.category.maincategory + '/' + fn.mstr.category.edit['description'] + '/' + speratedQuery[speratedQuery.length-1], false);
    global.fn.sendMessage(query.from.id, fn.mstr.category.edit['description'], fn.generateKeyboard({section:fn.mstr['category']['name']}, true));
}

var order = function(query, speratedQuery){
    console.log('get new order');
    fn.userOper.setSection(query.from.id, fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] +  '/' + fn.mstr['category']['name'] + '/' + fn.mstr.category.maincategory + '/' + fn.mstr.category.edit['order'] + '/' + speratedQuery[speratedQuery.length-1], false);
    global.fn.sendMessage(query.from.id, fn.mstr.category.edit['order'], fn.generateKeyboard({section:fn.mstr['category']['back']}, true));
}

var parent = function (query, speratedQuery){
    console.log('get new parent of post');
    fn.userOper.setSection(query.from.id, fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] +  '/' + fn.mstr['category']['name'] + '/' + fn.mstr['category'].maincategory + '/' + fn.mstr['category'].edit['parent'] + '/' + speratedQuery[speratedQuery.length-1], false);
    var back = fn.mstr['category']['back'];
    var list = [];
    global.robot.category.forEach(function(element) { list.push(element.parent + ' - ' + element.name); }, this);
    global.fn.sendMessage(query.from.id, fn.mstr['category'].edit['parent'], 
    fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false));
}

var attachSection = function(query,speratedQuery){
    console.log('get attachment');
    var last = speratedQuery.length-1;
    var markup = fn.generateKeyboard({section:fn.mstr.category['endAttach']}, true);
    var newSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.category['name'] + '/' + fn.mstr.category.maincategory + '/' + fn.mstr.category['endAttach'] + '/' + speratedQuery[last];
    fn.userOper.setSection(query.from.id, newSection, false);
    global.fn.sendMessage(query.from.id, fn.mstr.category.edit['attach'], markup);
}

var removeattachment = function(query,speratedQuery){
    var last = speratedQuery.length-1;
    console.log('remove attachment');
    var newSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr.category['name'] + '/' + fn.mstr.category.maincategory;
    fn.userOper.setSection(query.from.id, newSection, false);
    fn.m.category.editcategory(speratedQuery[last-1], {'removeAttachment': speratedQuery[last]}, query.from.id, speratedQuery);
}

var routting = async function(query, speratedQuery, user)
{
    var last = speratedQuery.length - 1;    
    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);

    //edit name
    if(speratedQuery[1] === global.fn.mstr.category['queryCategoryName']){
        console.log('get new title of post');
        fn.userOper.setSection(query.from.id, fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] +  '/' + fn.mstr['category']['name'] + '/' + fn.mstr['category'].maincategory + '/'  + fn.mstr['category'].edit['name'] + '/' + speratedQuery[speratedQuery.length-1], false);
        global.fn.sendMessage(query.from.id, fn.mstr['category'].edit['name'], fn.generateKeyboard({section: fn.mstr['category']['back']}, true));
    }

    //edit description
    else if(speratedQuery[1] === global.fn.mstr.category['queryCategoryDescription']) description(query, speratedQuery);
    //edit parent
    else if(speratedQuery[1] === global.fn.mstr.category['queryCategoryParent']) parent(query, speratedQuery);
    //edit order
    else if(speratedQuery[1] === global.fn.mstr.category['queryOrder']) order(query, speratedQuery);

    //delete message
    else if(speratedQuery[1] === global.fn.mstr.category['queryDelete']){
        fn.db.category.findOne({'_id': speratedQuery[speratedQuery.length-1]}, function(err, cat){
            if(cat) {
                fn.m.category.deleteCategory.clear(cat.name, () => {
                    global.fn.sendMessage(query.from.id, fn.str['seccess']);
                    global.fn.updateBotContent();
                });
            }
        });
    }
    
    // publication
    else if(speratedQuery[1] === fn.str.query['publication'])
    {
        var cat = await fn.db.category.findOne({'_id':speratedQuery[last]}).exec().then();
        if(cat) {
            cat.publish = !cat.publish;
            await cat.save().then();
            fn.m['category'].createcategoryMess(user.userid, cat);
        }
    }

    else if(speratedQuery[1] === global.fn.str.query['attach']) attachSection(query,speratedQuery)
    else if(speratedQuery[1] === fn.str.query['removeAttachment']) removeattachment(query,speratedQuery);
}

module.exports = {routting, checkQuery}