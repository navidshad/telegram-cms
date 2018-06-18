var bag = require('./user/bag');
var factor = require('./user/factor');
var myProducts = require('./user/myProducts');

var checkRoute = function(option){
    var mName = fn.mstr.commerce['modulename'];
    var btnsArr  = [];
    Object.values(fn.mstr.commerce.btns_user).map((value) => { btnsArr.push(value); });
    var result = {}

    //check text message
    if(option.text) btnsArr.forEach(btn => { 
        if(option.text === btn) {
            result.status = true; 
            result.button = btn;
            result.routting = routting;
        }
    });
    //check seperate section
    if(option.speratedSection){
        option.speratedSection.forEach(section => {
            btnsArr.forEach(btn => { 
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

var routting = async function(message, speratedSection, user)
{
    var text = message.text;
    var last = speratedSection.length-1;
    var checkRouteText = checkRoute({'text':text});
    var checkRouteSection = checkRoute({'speratedSection':speratedSection});
    var userButtons = fn.mstr.commerce.btns_user;

    //ask to show bag
    if(checkRouteText.button === userButtons['bagshop']) {
        var userbag = await bag.get(message.from.id);
        bag.show(user.userid, userbag);
    }

    //ask to factor section
    else if (checkRouteText.button === userButtons['factor'] || speratedSection[last] === userButtons['factor'])
        factor.routting(message, speratedSection, user);

    //ask to myProducts
    else if (checkRouteText.button === userButtons['myProducts'] || speratedSection[last] === userButtons['myProducts'])
        myProducts.routting(message, speratedSection, user);

    //get address
    else if (speratedSection[last] === fn.mstr.commerce.mess['getAddress']){
        var userbag = await bag.get(message.from.id);
        userbag.address = text;
        await userbag.save().then();
        bag.show(message.from.id, userbag);

        //rim section to be prepare for parent category
        speratedSection.splice(last-1, 1);
        fn.menu.backtoParent (message, speratedSection, user);    }

    //get phone
    else if (speratedSection[last] === fn.mstr.commerce.mess['getPhone'] && message.contact){
        var userbag = await bag.get(message.from.id);
        userbag.phone = message.contact.phone_number;
        await userbag.save().then();
        bag.show(message.from.id, userbag);
        
        //rim section to be prepare for parent category
        speratedSection.splice(last-1, 1);
        fn.menu.backtoParent (message, speratedSection, user);
    }

    // get fullname
    else if (speratedSection[last] === fn.mstr.commerce.mess['getfullname']){
        var userbag = await bag.get(message.from.id);
        userbag.fullname = text;
        await userbag.save().then();
        bag.show(message.from.id, userbag);

        //rim section to be prepare for parent category
        speratedSection.splice(last-1, 1);
        fn.menu.backtoParent (message, speratedSection, user);    }
}

var query = async function(query, speratedQuery, user)
{
    var last = speratedQuery.length-1;
    var botusername = global.robot.username;
    var querytag = fn.mstr.commerce.query;
    var userid = query.from.id;

    //clear bag
    if(speratedQuery[2] === querytag['clearbag']) bag.clear(query.from.id);

    //add prodcut to bag
    if(speratedQuery[2] === querytag['addToBag']) {
        var type = speratedQuery[last-1];
        var productid = speratedQuery[last];
        bag.addToBag(user.userid, type, productid);
    }

    //submit
    else if(speratedQuery[2] === querytag['submitbag'])
        bag.submitBag(user.userid);


    //get address
    else if(speratedQuery[2] === querytag['address']) 
    {
        var mess = fn.mstr.commerce.mess['getAddress'];
        var nSection = fn.str['mainMenu'] + '/' + fn.mstr.commerce.btns_user['bagshop'] + '/' + mess;
        var markup = fn.generateKeyboard({'section': fn.str['backToMenu']}, true);

        fn.userOper.setSection(query.from.id, nSection, false);
        global.fn.sendMessage(query.from.id, mess, markup);
    }

    //get phone
    else if(speratedQuery[2] === querytag['phone']) 
    {
        var list = [
            {'text':'📱 ' + 'ارسال شماره موبایل', 'request_contact':true}
        ]
        var mess = fn.mstr.commerce.mess['getPhone'];
        var nSection = fn.str['mainMenu'] + '/' + fn.mstr.commerce.btns_user['bagshop'] + '/' + mess;
        var markup = fn.generateKeyboard({'custom': true, 'grid':true, 'list': list, back: fn.str['backToMenu'] }, false);
        fn.userOper.setSection(query.from.id, nSection, false);
        global.fn.sendMessage(query.from.id, mess, markup);
    }

    //fullname
    else if (speratedQuery[2] === querytag['fullname'])
    {
        var mess = fn.mstr.commerce.mess['getfullname'];
        var nSection = fn.str['mainMenu'] + '/' + fn.mstr.commerce.btns_user['bagshop'] + '/' + mess;
        var markup = fn.generateKeyboard({'section': fn.str['backToMenu']}, true);

        fn.userOper.setSection(query.from.id, nSection, false);
        global.fn.sendMessage(query.from.id, mess, markup);
    }

    //postalInfo
    else if (speratedQuery[2] === querytag['postalInfo']){
        var userBag = await bag.get(query.from.id);
        var address = (userBag.address) ? userBag.address   : '...', 
        phone       = (userBag.phone)   ? userBag.phone     : '...',
        fullname    = (userBag.fullname)? userBag.fullname     : '...';

        var mess = '🚚 ' + 'مشخصات پستی شما \n\n' + '👤 ' + fullname + '\n' + '📱 ' + phone + '\n' + '🏠 ' + address;
        global.fn.sendMessage(query.from.id, mess);
    }

    //show factor Items detail
    else if (speratedQuery[2] === querytag['itemsdetail']) factor.showfactorItems(query.from.id,  speratedQuery[last]);
    
    //get paid 
    //only for test
    //free product
    else if(speratedQuery[2] === querytag['getpaid']) factor.getPaied(query.from.id,  speratedQuery[last]);

    //remove factor
    else if(speratedQuery[2] === querytag['deletefactor']) 
    {
        fn.db.factor.remove({'_id':speratedQuery[last]}).exec();
    }

    //show coupon list
    else if (speratedQuery[2] === querytag['usecoupon'])
    {
        var userBag = await bag.get(query.from.id);
        bag.show(userid, userBag,  {'view': 'coupons'});
    }
    //use a coupon
    else if (speratedQuery[2] === querytag['coupon'])
    {
        var cid = speratedQuery[3];
        bag.useCoupon(userid, cid);
    }

    //back to bag
    else if (speratedQuery[2] === querytag['backtobag'])
    {
        var userBag = await bag.get(query.from.id);
        bag.show(userid, userBag);
    }
}

module.exports = { routting, query, checkRoute, bag, factor }