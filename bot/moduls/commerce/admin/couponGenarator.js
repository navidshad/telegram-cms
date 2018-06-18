var show = async function(userid)
{ 
    var titles = [
        fn.mstr.commerce.btns['addgenerator']
    ];

    var back = fn.mstr.commerce['back'];
    var mess = fn.mstr.commerce.btns['couponGenerators'];

    var generators = await fn.db.generator.find({}).sort('-_id').exec().then();
    generators.forEach(item => { titles.push(item.name) });

    var markup = fn.generateKeyboard({'custom':true, 'list':titles, 'grid':true, 'back':back}, false);
    global.fn.sendMessage(userid, mess, markup);
    fn.userOper.setSection(userid, mess, true);
}

var showGenerator = async function(userid, name)
{
    //get generator
    var gen = await fn.db.generator.findOne({'name': name}).sort('-_id').exec().then();
    if(!gen) {
        global.fn.sendMessage(userid, fn.mstr.commerce.mess['notGenerator']);
        show(userid);
        return;
    }

    var detailArr = [];
    var qt = fn.mstr.commerce.query;

    var fn_sessions     = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['sessions'] + '-' + gen.id;
    var fn_minimumP     = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['minimumP'] + '-' + gen.id;
    var fn_maximumP     = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['maximumP'] + '-' + gen.id;
    var fn_mode         = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['mode'] + '-' + gen.id;
    var fn_discountmode = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['discountmode'] + '-' + gen.id;
    var fn_amount       = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['amount'] + '-' + gen.id;
    var fn_percent      = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['percent'] + '-' + gen.id;
    var fn_days         = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['days'] + '-' + gen.id;
    var fn_hours        = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['hours'] + '-' + gen.id;
    var fn_consumption  = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['consumption'] + '-' + gen.id;
    var fn_consumptionway  = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['consumptionway'] + '-' + gen.id;
    
    var fn_active = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['status'] + '-' + gen.id;
    var fn_delete = qt['commerce'] + '-' + qt['admin'] + '-' + qt['generator'] + '-' + qt['delete'] + '-' + gen.id;

    if(gen.allowEdit)
    {        
        detailArr = [ 
            [{'text': 'دوره', 'callback_data': fn_sessions}],

            [{'text': 'حداکثر محصول', 'callback_data': fn_maximumP},
            {'text': 'حداقل محصول', 'callback_data': fn_minimumP}],

            [{'text': 'حالت صدور', 'callback_data': fn_mode}, 
            {'text': 'نوع تخفیف', 'callback_data': fn_discountmode}],

            [{'text': 'مقدار تخفیف', 'callback_data': fn_amount}, 
            {'text': 'درصد تخفیف', 'callback_data': fn_percent}],

            [{'text': 'تعداد روز', 'callback_data': fn_days}, 
            {'text': 'تعداد ساعت', 'callback_data': fn_hours}],

            [{'text': 'دفعات مصرف', 'callback_data': fn_consumption},
            {'text': 'شیوه مصرف', 'callback_data': fn_consumptionway}],

            [{'text': 'حذف کردن', 'callback_data': fn_delete}, 
            {'text': 'وضعیت', 'callback_data': fn_active}],
        ];
    }

    var detail = '';
    var mstrdatas = Object.keys(fn.mstr['commerce'].generator);
    var genData = fn.mstr['commerce'].generator;
    mstrdatas.forEach(item => {
        detail += '✴️ ' + genData[item].name + ': ' + gen[item] + '\n';
    });

    var mess = 'بن ساز: ' + gen.name +
    '\n' + 'ــــــــــــــــــــ' +
    '\n' + detail +
    '🏷';

    global.fn.sendMessage(userid, mess, {"reply_markup" : {"inline_keyboard" : detailArr}});
}

var createGenerator = async function(userid, name, allowEdit)
{
    var newGenerator = new fn.db.generator({'name': name});
    if(allowEdit) newGenerator.allowEdit = allowEdit;

    await newGenerator.save().then();
    show(userid);
    showGenerator(userid, name);
}

var editGenerator = async function(userid, id, data)
{
    var generator = await fn.db.generator.findOne({'_id': id}).exec().then();
    if(!generator) return;

    generator[data.name] = data.value;
    await generator.save().then();
    showGenerator(userid, generator.name);
}

var routting = async function(message, speratedSection)
{
    var mName = 'commerce';
    var text = message.text;
    var last = speratedSection.length-1;
    var userid = message.from.id;
    var btns = fn.mstr.commerce.btns;

    //show generators list
    if(text === btns['couponGenerators'] || text === btns['couponGeneratorsBack'])
        show(userid);

    //create new generator
    else if (text === btns['addgenerator'])
    {
        var mess = fn.mstr.commerce.mess['getnameGenerator'];
        var back = btns['couponGeneratorsBack'];
        var markup = fn.generateKeyboard({'section':back}, true);
        global.fn.sendMessage(userid, mess, markup);
        fn.userOper.setSection(userid, btns['addgenerator'], true);
    }
    else if (speratedSection[last] === btns['addgenerator'])
    {
        var count = await fn.db.generator.count({'name': text}).exec().then();
        if(count > 0) global.fn.sendMessage(userid, fn.str['chooseOtherText']);
        else createGenerator(userid, text);
    }

    else
    {
        var mstrdatas = Object.keys(fn.mstr[mName].generator);
        var key = false;
        mstrdatas.forEach(item => {
            if(item === speratedSection[last-1]) key = true;
        });
    
        //edit
        if(key)
        {
            var itemSection = speratedSection[last-1];
            var genid = speratedSection[last];
            var dataOption = fn.mstr[mName].generator[itemSection];
        
            var truechoose = true;
            var value = text;
            if(dataOption.items)
            {
                truechoose = false;
                dataOption.items.forEach(element => {
                    if(element.lable === text) {
                        truechoose = true;
                        value = element.name;
                    }
                });
            }
        
            if(!truechoose) return;
        
            var data = {'name': itemSection, 'value':value};
            editGenerator(userid, genid, data);
            show (userid);
        }
        
        //choose a generator
        else showGenerator(userid, text);
    }
}

var query = async function(query, speratedQuery)
{
    var mName = 'commerce';
    var last = speratedQuery.length-1;
    var qt = fn.mstr.commerce.query;

    //delete
    if(speratedQuery[3] === qt['delete'])
        await fn.db.generator.remove({'_id': speratedQuery[last]}).exec().then();

    //edit
    else 
    {
        var datas = Object.keys(fn.mstr[mName].generator);
        var key = false;
        datas.forEach(item => {
            if(item === speratedQuery[3]) key = true;
        });
    
        if(!key) return;
    
        var itemSection = speratedQuery[3];
        var dataOption = fn.mstr[mName].generator[itemSection];
    
        var list = [];
        var back = fn.mstr[mName].btns['couponGeneratorsBack'];
    
        if(dataOption.items) dataOption.items.forEach(element => { list.push(element.lable) });
    
        var mess = dataOption.mess;
        var nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr[mName]['name'] + '/' + fn.mstr[mName].btns['couponGenerators'] + '/' + itemSection + '/' + speratedQuery[last];
        var remarkup = fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false);
    
        global.fn.sendMessage(query.from.id, mess, remarkup);
        fn.userOper.setSection(query.from.id, nSection, false);
    }
}

//#region successPeymentData
var getGentemp = async function(userid)
{
    var gentemp = await global.fn.db.gentemp.findOne({'userid': userid}).exec().then();
    if(!gentemp) gentemp = await new global.fn.db.gentemp({'userid': userid}).save().then();
    return gentemp;
}

var generateCoupon = async function(userid, generator)
{
    var coupon = {
        'userid'        : userid,
        'days'          : generator.days,
        'hours'         : generator.hours,
        'startDate'     : new Date(),
        'endDate'       : new Date().addDays(generator.days).addHours(generator.hours),
        'consumption'   : generator.consumption,
        'consumptionway': generator.consumptionway,
        'discountmode'  : generator.discountmode,
        'amount'        : generator.amount,
        'percent'       : generator.percent,
    }
    global.fn.eventEmitter.emit('createCoupon', coupon);
}

global.fn.eventEmitter.on('affterSuccessPeyment', async (factor) => 
{
    var mode = 'buy';
    var generators = await global.fn.db.generator.find({'mode': mode, 'status': true}).exec().then();
    var user = await fn.db.user.findOne({'userid':factor.userid}).exec().then();
    var gentemp = await getGentemp(user.userid);

    //each generator
    for (let index = 0; index < generators.length; index++) 
    {
        const element = generators[index];
        var sessions = element.sessions;

        //check products.length
        var productcount = factor.products.length;
        if(element.minimumP > 0 && element.minimumP > productcount) continue;
        else if (element.maximumP > 0 && element.maximumP < productcount) continue;

        //get buy mode detail
        var temp = null
        var tindex = null
        gentemp.generators.forEach((gen, i) => 
        { 
            if(gen.name === element.name) temp = gen; 
            tindex=i; 
        });
    
        //add if doesn't exsit
        if(!temp){
            temp = {'name': element.name, 'counter': 0};
            gentemp.generators.push(temp);
            tindex = gentemp.length-1;
        }
    
        //add to counter
        temp.counter += 1;
    
        //update gentemp
        gentemp.generators[tindex] = temp;
        await gentemp.save().then();
    
        //dont generate coupons
        console.log('comparing counter');
        if(temp.counter < sessions) return;

        //reset session counter
        gentemp.generators[tindex].counter = 0;
        await gentemp.save().then();

        //generate coupon
        generateCoupon (user.userid, element, productcount);
    }

});

global.fn.eventEmitter.on('affterChannelCheck', async (userid, isMember) => 
{
    var mode = 'membership';
    var generators = await global.fn.db.generator.find({'mode': mode, 'status': true}).exec().then();
    var user = await fn.db.user.findOne({'userid':userid}).exec().then();
    var gentemp = await getGentemp(user.userid, generators.name);

    //each generator
    for (let index = 0; index < generators.length; index++) 
    {
        const element = generators[index];
        var sessions = element.sessions;
        //get mode detail
        var temp = null
        var tindex = null
        gentemp.generators.forEach((gen, i) => 
        { 
            if(gen.name === element.name) temp = gen; 
            tindex=i; 
        });
    
        //add if doesn't exsit
        if(!temp){
            temp = {'name': element.name, 'counter': 0, 'old': Date.today()};
            gentemp.generators.push(temp);
            tindex = gentemp.length-1;
            await gentemp.save().then();
        }
        else if (!temp.old) 
        {
            temp.old = Date.today();
            gentemp.generators[tindex] = temp;
            await gentemp.save().then();
        }
    
        //#region counter analyze
        var registeryDate =  Date.parse(temp.old);
        var nextSessionsDays = registeryDate.addDays(sessions);
        var today = Date.today();

        //compare
        //console.log('comparing days');
        var compare = today.compareTo(nextSessionsDays);
        if(compare < 0) 
            return; //it means less than 

        //reset session counter
        gentemp.generators[tindex].old = today;
        await gentemp.save().then();

        //generate coupon
        generateCoupon (user.userid, element);
    }
});

global.fn.eventEmitter.on('affterInvitedUserRegistered', async (inviter, newuser) => 
{
    var mode = 'invite';
    var generators = await global.fn.db.generator.find({'mode': mode, 'status': true}).exec().then();
    var user = await fn.db.user.findOne({'userid':inviter}).exec().then();
    var gentemp = await getGentemp(user.userid, generators.name);

    //each generator
    for (let index = 0; index < generators.length; index++) 
    {
        const element = generators[index];
        var sessions = element.sessions;
        //get mode detail
        var temp = null
        var tindex = null
        gentemp.generators.forEach((gen, i) => 
        { 
            if(gen.name === element.name) temp = gen; 
            tindex=i; 
        });
    
        //add if doesn't exsit
        if(!temp){
            temp = {'name': element.name, 'counter': 0, 'old': Date.today()};
            gentemp.generators.push(temp);
            tindex = gentemp.generators.length-1;
            await gentemp.save().then();
        }
        
        gentemp.generators[tindex].counter += 1;

        //compare
        var counter = gentemp.generators[tindex].counter;
        if(counter > sessions) 
            return; //it means less than 

        //reset session counter
        gentemp.generators[tindex].counter = 0;
        await gentemp.save().then();

        //generate coupon
        generateCoupon (user.userid, element);
    }
});

//#endregion
module.exports = {
    routting, query
}