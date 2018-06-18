var name = 'commerce';

var checkRoute = function(option){

    var btnsArr  = [ 
        fn.mstr.commerce['name'],
        fn.mstr.commerce['back']
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

var show = async function(userid)
{
    var botusername = global.robot.username;    
    var titles = [];
    titles.push(fn.mstr.commerce.btns['settings']);
    titles.push(fn.mstr.commerce.btns['couponGenerators']);

    var factors = await fn.db.factor.find({'ispaid': true})
    .sort('-_id').limit(35).exec().then();

    factors.forEach(function(item) {
        var title = item.number.toString();
        titles.push(title);
    }, this);

    //show list
    var markup = fn.generateKeyboard({custom:true, list:titles, grid:true, back:fn.str.goToAdmin['back']}, false);
    global.fn.sendMessage(userid, fn.mstr[name].name, markup);
    fn.userOper.setSection(userid, fn.mstr[name].name, true);
}

var showFactor = async function(userid, fnumber, option={})
{
    //find message
    var factor = await fn.db.factor.findOne({'number':fnumber}).exec().then();
    if(!factor) return;

    //get user bag
    var bag = await fn.m[name].user.bag.get(factor.userid);

    //item details
    var details = '';
    factor.products.forEach(pro =>
    {
        if(!pro.data.length) return;
        details += `\n${pro.name}: `;
        pro.data.forEach(de => { details += `${de.key} ${de.value}, `; });
    });

    var text = `${factor.desc} \n`;
    text += `<code>ـــــــــــــــــ</code> \n`;
    text += `<code> ${details} </code> \n`;
    text += `<code>ـــــــــــــــــ</code> \n`;
    text += `👤 ${factor.userid} \n`;
    text += `🏠 ${bag.address} \n`;
    text += `📱 ${bag.phone}`;

    if(option.alertoadmins) fn.alertadmins(text);
    else global.fn.sendMessage(userid, text, {'parse_mode':'HTML'});
}

var routting = function(message, speratedSection, user)
{
    var text = message.text;
    var last = speratedSection.length-1;
    var couponGenerators = fn.mstr.commerce.btns['couponGenerators'];
    
    //show factor list
    if(text === fn.mstr[name].name || text === fn.mstr[name].back)
        show(message.from.id);
    
    //setting
    else if(text === fn.mstr[name].btns.settings || speratedSection[3] === fn.mstr[name].btns.settings) 
        setting.routting(message, speratedSection, user, name);

    //generators
    else if(text === couponGenerators || speratedSection[3] === couponGenerators) 
        couponGenerator.routting(message, speratedSection);

    //show a factor 
    else showFactor(message.from.id, text);
}

var setting = require('./settings');
var user    = require('./user');
var query   = require('./query');
var coupon  = require('./admin/coupon');
var couponGenerator = require('./admin/couponGenarator');
var gates = {
    'nextpay': require('./gates/nextpay'),
}

module.exports = { name, checkRoute, routting, query, show, user, gates, 
    coupon, couponGenerator, showFactor, setting
}