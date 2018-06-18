//factor list
var show = async function(userid,  injectedText){
    var botusername = global.robot.username;
    var titles = [];
    
    var bag = await fn.m.commerce.user.bag.get(userid);

    if(bag.boughtItems == 0) {
        global.fn.sendMessage(userid, 'اکنون هیچ خریدی برای شما ثبت نشده است.');
        return;
    }
     
    bag.boughtItems.forEach(item => {
        titles.push(item.name);
    });
    
    var mess = (injectedText) ? injectedText : fn.mstr.commerce.btns_user['myProducts'];
    var back = fn.mstr.category['backtoParent'];
    var remarkup = global.fn.generateKeyboard({'custom': true, 'grid':false, 'list': titles, 'back':back}, false);
    global.fn.sendMessage(userid, mess, remarkup);
    fn.userOper.setSection(userid,  mess, true);  
}

var showProduct = async function(message, user)
{
    var name = message.text;
    var bag = await fn.m.commerce.user.bag.get(message.from.id);
    var boughtItem = null;
    bag.boughtItems.forEach(item => {
        if(item.name === name) boughtItem = item;
    });

    if(!boughtItem) return;

    if(boughtItem.type === 'post') 
        fn.m.post.user.show(message, boughtItem.name, user, {'isbought': true});
}

var routting = async function(message, speratedSection, user){
    var botusername = global.robot.username;
    var text = message.text;

    //show list
    if(text === fn.mstr.commerce.btns_user['myProducts']) show(message.from.id);

    //show a product
    else showProduct(message, user);
}

module.exports = { routting, show }