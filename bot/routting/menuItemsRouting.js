var showCategoryDir = async function(message, catname, speratedSection, user)
{
    console.log('catname', catname);
    var result = await fn.getMenuItems(catname, user);

    var items = result.items,
        detail = result.detail,
        noitem = result.noitem; 

    //parent
    var parent = speratedSection[speratedSection.length-2];
    var back = (parent === fn.str['mainMenu']) ? fn.str['backToMenu'] : fn.mstr.category['backtoParent'];
    
    if(noitem)
    {
        global.fn.sendMessage(message.from.id, 'این بخش هنوز خالی است.');
        return;
    }

    let keyBoardOption = {'custom': true, 'grid':true, 'list': items, 'back':back};
    
    // check custom rowColumns
    let customRows = await fn.m['settings'].rowColumns.check(catname);
    if(customRows) keyBoardOption['customRows'] = customRows;
    
    var markup = fn.generateKeyboard(keyBoardOption, false);
    
    fn.sendMessage(message.from.id, detail.description, markup);
    fn.m.post.user.snedAttachmentArray(message, detail.attachments, 0);
    
    fn.userOper.setSection(message.from.id, catname, true);
}

var backtoParent = function(message, speratedSection, user)
{
    //console.log(speratedSection);
    var from = speratedSection.length-1
    var catname = speratedSection[speratedSection.length-2];
    nsperatedSection = []
    nsperatedSection = nsperatedSection.concat(speratedSection);
    nsperatedSection.splice(from, 1);
    
    if(catname == fn.str['mainMenu'] || !catname) 
        fn.commands.backToMainMenu(message.from.id, user);
    else if(fn.m.category.checkInValidCat(catname)) 
        showCategoryDir(message, catname, nsperatedSection, user);
    // free string
    else fn.freeStrings.routting(message, speratedSection, user); 
}


//routting
var routting = async function(message, speratedSection, user)
{
    var text = message.text;
    var last = speratedSection.length-1;

    //back to uper level
    if(text === fn.mstr.category['backtoParent'])
    {
        console.log('backtoParent', text);
        backtoParent(message, speratedSection, user);   
    }

    //back to a category
    else if(text.includes(fn.str['back']) && text.split(' - ')[1])
    {
        console.log('back to category', text);
        var catname = text.split(' - ')[1];
        speratedSection.splice(last, 1);
        fn.userOper.setSection(message.from.id, catname, true);
        showCategoryDir(message, catname, speratedSection, user);
    }

    //go to category
    else if(fn.m.category.checkInValidCat(text))
    {
        console.log('go to category', text);
        let category = await fn.db.category.findOne({'name': text}, 'sendAll').exec().then();
        
        if(category.sendAll) fn.m.post.user.sendAllPost(text, message, user);
        else {
            speratedSection.push(text);
            showCategoryDir(message, text, speratedSection, user);   
        }
    }

    //go to a post  
    else{
        //console.log('this is a post');
        fn.m.post.user.show(message, message.text, user, {},
            //exit and go to free message if item would no be a post 
            (user) => { 
                fn.freeStrings.routting(message, speratedSection, user); 
            });
    }
}

module.exports = { routting, backtoParent }