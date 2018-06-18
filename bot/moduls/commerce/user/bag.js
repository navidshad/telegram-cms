var createBag = function(userid)
{
    var newBag = new fn.db.bag({
        'userid'        : userid,
        'items'         : [],
        'boughtItems'   : [],
    });
    return newBag.save().then();
}

var get = async function(userid)
{
    var bag = null;
    bag = await fn.db.bag.findOne({'userid': userid}).exec().then();
    if(!bag) bag = await createBag(userid);
    return bag;
}

var additem = async function(userid,  item, option, callback)
{
    var bag = await get(userid);

    //find bot
    var notAdded = true;
    bag.items.forEach(element => {
        if(element.name === item.name) notAdded = false;
    });

    //add item
    if(notAdded) bag.items.push(item);

    //save
    return new Promise((resolve, reject) => {
        bag.save((e) => {
            if(e) {
                console.log(e);
                reject(e);
            }

            var result = {
                'status':notAdded
            }

            resolve(result);
            if(callback) callback(result);
            if(option.showbag === true) show(userid, bag);
        });
    });
}

var addToBag = async function(userid, type, productid, datas)
{
    var bag = await get(userid);
    var product = null
    var item = {};

    if(type === 'post') {
        product = await fn.db.post.findOne({'_id':productid}).exec().then();
        item = {
            'name'  :product.name, 
            'id'    :productid, 
            'price' :product.price, 
            'type'  :'post',
            'data'  : datas,
        };
    }

    var result = await additem(userid, item, {'showbag':true}).then();
    if(!result.status) global.fn.sendMessage(userid, fn.mstr.commerce.mess['alreadyAdded']);
}

var submitBag = async function(userid)
{
    var userBag = await get(userid);
    if(!userBag.address.length && !userBag.phone && !userBag.fullname)
    {
        global.fn.sendMessage(userid, 'لطفا ابتدا نام کامل، آدرس و شماره تلفن خود را وارد کنید.');
        show(userid, userBag);
        return;
    }
    // no items
    else if (!userBag.items.length)
    {
        global.fn.sendMessage(userid, 'ابتدا باید چندتا محصول به سبد خرید خود اضافه کنید');
        return;
    }
    
    fn.m.commerce.user.factor.create(userid, userBag.items, {'coupon':userBag.cid});

}

var getView_main = function(coupons)
{
    var detailArr = [];
    var query = fn.mstr.commerce.query;
    var fn_submit   = query['commerce'] + '-' + query['user'] + '-' + query['submitbag'];
    var fn_usecoupon= query['commerce'] + '-' + query['user'] + '-' + query['usecoupon'];
    var fn_clear    = query['commerce'] + '-' + query['user'] + '-' + query['clearbag'];
    var fn_close    = query['commerce'] + '-' + query['close'];

    //controller btns
    detailArr.push([ {'text': '✅ ' + 'ثبت و پرداخت', 'callback_data': fn_submit} ]);
    
    if(coupons.length) 
        detailArr.push([{'text': '🏷 ' + 'اعمال بن', 'callback_data': fn_usecoupon}]);

    //personal info 
    var fn_address = query['commerce'] + '-' + query['user'] + '-' + query['address'];
    var fn_phone = query['commerce'] + '-' + query['user'] + '-' + query['phone'];
    var fn_fullname = query['commerce'] + '-' + query['user'] + '-' + query['fullname'];
    var fn_showPostalInfo = query['commerce'] + '-' + query['user'] + '-' + query['postalInfo'];

    detailArr.push([ 
        {'text': '🏠' + 'آدرس', 'callback_data': fn_address},
        {'text': '📱' + 'موبایل', 'callback_data': fn_phone},
        {'text': '👤' + 'نام کامل', 'callback_data': fn_fullname},
    ]);

    detailArr.push([{'text': '👤📱🏠' + 'نمایش', 'callback_data': fn_showPostalInfo}]);

    //close
    detailArr.push([
        {'text': '❌ ' + 'تخلیه سبد', 'callback_data': fn_clear},
        {'text': 'بستن سبد', 'callback_data': fn_close}
    ]);

    return detailArr;
}

var getView_coupons = function(coupons)
{
    var detailArr = [];
    var query = fn.mstr.commerce.query;

    //back btn
    var back_fn = query['commerce'] + '-' + query['user'] + '-' + query['backtobag'];
    var back_tx = '🔙 ' + 'بازگشت';
    var bbtn  = {'text': back_tx , 'callback_data': back_fn};
    detailArr.push([bbtn]);

    coupons.forEach((coup, i) => {
        var num = i+1;
        var code = coup.code;
        var dis = (coup.discountmode == 'amount') ? coup.amount + ' تومان ' : coup.percent + ' درصد ';
        var coup_fn = query['commerce'] + '-' + query['user'] + '-' + query['coupon'] + '-' + coup.id;
        var coup_tx = '🏷 ' + num + ', ' + dis + 'تخفیف \n';
        var btn  = {'text': coup_tx, 'callback_data': coup_fn};
        detailArr.push([btn]);
    });
    return detailArr;
}

var show = async function(userid, bag,  optionparam)
{
    var option = (optionparam) ? optionparam : {};

    //coupons 
    var coupons = await fn.m.commerce.coupon.getusercoupons(userid);
    var couponsText = fn.m.commerce.coupon.getCouponsDetail(coupons);
    
    var detailArr = [];
    if(option.view === 'coupons') detailArr = getView_coupons(coupons);
    else detailArr = getView_main(coupons);


    //products
    var total = 0;
    var titles = '';
    bag.items.forEach((item, i) => {
        titles += '\n🆔 ' + item.name + ' | 💶: ' + item.price + ' تومان';
        total += item.price;
    });

    //perform coupon
    var totalPerDis = 0;
    var DisResult = await fn.m.commerce.coupon.performCoupon(userid, total, bag.cid);
    totalPerDis = DisResult.total;
    if(totalPerDis == 0) {
        bag.cid = null;
        bag.save();
    }

    var usedcouponsText = fn.m.commerce.coupon.getUsedCouponsDetail(DisResult.usedcoupons);

    // shipping -----------
    var shippingOption = fn.getModuleData('commerce', 'shipping').value;
    var shippingCost = fn.getModuleData('commerce', 'shippingCost').value;
    var shippingLable = `\n🚚 هزینه ارسال: ${shippingCost} تومان`;
    if(shippingOption == 'true') {
        var shippingCost = fn.getModuleData('commerce', 'shippingCost').value;
        shippingCost = parseInt(shippingCost);
    }
    // --------------------

    var finalprice = totalPerDis + shippingCost;

    //message
    var mess = '🛍 ' + 'سبد خرید شما' + '\n' +
    '<code>ـــــــــــــــــ</code>' +
    titles + '\n' +
    '<code>ـــــــــــــــــ</code>' + '\n' +
    '📊 ' + 'جمع قیمت: ' + total + ' تومان' + '\n';
    mess += '🎁 ' + 'اعمال تخفیف: ' + totalPerDis + ' تومان';
    mess += (shippingOption == 'true') ? shippingLable : '';
    mess += '\n💶 ' + 'جمع کل: ' + finalprice + ' تومان';
    mess += '\n' + '<code>ـــــــــــــــــ</code>' + '\n' +
    '⏰ وضعیت تخفیف ها:\n' +
    '\n🏷 بن های اعمال شده: ' + usedcouponsText +
    '\n🏷 بن های تخفیف شما: ' + couponsText +
    '<code>ـــــــــــــــــ</code>' + '\n' +
    fn.mstr.commerce.mess['editbag'] + '\n.';

    var showBag = true;
    if(option && option.show != null) showBag = option.show;

    //send
    if(showBag) {
        global.fn.sendMessage(userid, mess, {'parse_mode':'HTML', "reply_markup" : {"inline_keyboard" : detailArr}})
        .then((msg) => {

        });
    }
}

var clear = async function(userid, botindex)
{
    var bag = await fn.db.bag.findOne({'userid':userid}).exec().then();
    if(!bag) return;

    //clear
    bag.items = [];
    bag.ccode = null;

    //save
    await bag.save().then();
    show(userid, bag,  {'show':false});
}

var checkBoughtItem = async function(userid, productid)
{   
    var bag = await get(userid);
    var isbought = false;
    bag.boughtItems.forEach(item => {
        if(item.id === productid) isbought = true;
    });

    return isbought;
}

var useCoupon = async function(userid, cid)
{
    var userbag = await get(userid);
    userbag.cid = cid;
    await userbag.save().then();
    show(userid, userbag);
}

module.exports = { show, additem, clear, get, addToBag, checkBoughtItem, useCoupon, submitBag }