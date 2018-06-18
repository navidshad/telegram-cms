
var mainBtnsPermissions = {
    'activation': true,
    'category': false,
    'order': false,
}

var getSettingsInlinesBtns = function(options)
{
    var detailArr = [],
    mName   = options.mName,
    qt      = fn.mstr[mName].query,
    fn_activation = qt[mName] + '-' + qt['admin'] + '-' + qt['settings'] + '-' + qt['activation'],
    fn_category   = qt[mName] + '-' + qt['admin'] + '-' + qt['settings'] + '-' + qt['category'],
    fn_order      = qt[mName] + '-' + qt['admin'] + '-' + qt['settings'] + '-' + qt['order'],

    tx_activation = fn.str.activation[options.activation],
    tx_category   = fn.mstr['category'].asoption,
    tx_order      = fn.str['editOrder'];

    var firstrow = [];
    if(mainBtnsPermissions.activation) firstrow.push({'text': tx_activation, 'callback_data': fn_activation});
    if(mainBtnsPermissions.category) firstrow.push({'text': tx_category, 'callback_data': fn_category});
    if(mainBtnsPermissions.order) firstrow.push({'text': tx_order, 'callback_data': fn_order});
    detailArr.push(firstrow.reverse());

    //data parameters
    var datas = Object.keys(fn.mstr[mName].datas);
    var row = [];
    datas.forEach((item, i) => 
    {
        var fn_item = qt[mName] + '-' + qt['admin'] + '-' + qt['settings'] + '-' + item;
        var tx_item = fn.mstr[mName].datas[item].name;
        row.push({'text': tx_item, 'callback_data': fn_item});
        
        if(row.length == 2 || i == datas.length-1) {
            detailArr.push(row);
            row = [];
        }
    });

    return detailArr;
}

var getDatsDetail = function(moduleOption, mName)
{
    var mess = '';
    moduleOption.option.datas.forEach(data => {
        var key = (data.key) ? data.key + ', ' : '';
        var value = (data.value) ? data.value : '';
        mess += '\n' + '✴️ ' + fn.mstr[mName].datas[data.name].name + ': ' + key + value;
    });

    return mess;
}

var show = function(userid, mName, newcat)
{
    var activationtext = '';
    var moduleOption = fn.getModuleOption(mName, {'create': true});
    
    //defin activation button
    activationtext = (moduleOption.option.active) ? 'disable' : 'enable';
    //defin new category
    if(newcat) {
        moduleOption.option.category = newcat;
        var button = fn.getModuleData(mName, 'menuItem');
        if(button) moduleOption.option.buttons = [button.value];
        global.robot.config.moduleOptions[moduleOption.index] = moduleOption.option;
        //save configuration
        global.robot.save();
        fn.updateBotContent();
    }

    var detailArr = getSettingsInlinesBtns({'mName':mName,'activation': activationtext});
    var messOption = {"reply_markup" : {"inline_keyboard" : detailArr}};
    
    var title = fn.mstr[mName].name;
    var category = (moduleOption.option.category) ? moduleOption.option.category : 'نامشخص';
    var buttons = (moduleOption.option.buttons) ? moduleOption.option.buttons : 'نامشخص';
    var btn_order = (moduleOption.option.btn_order) ? moduleOption.option.btn_order : 'نامشخص';
    var active = (moduleOption.option.active) ? '✅ فعال' : '⭕️ غیر فعال';
    var datas = getDatsDetail(moduleOption, mName);

    var detailMess = 'اطلاعات افزونه ' + title + '\n'
    + '✴️ ' + 'دسته: ' + category + '\n'
    + '✴️ ' + 'نام دکمه در منو: ' + buttons + '\n'
    + '✴️ ' + 'اولویت در منو: ' + btn_order + '\n'
    + '✴️ ' + 'وضعیت: ' + active + '\n' 
    + datas + '\n'
    + '⚙️';

    global.fn.sendMessage(userid, detailMess, messOption);
}

var routting = function(message, speratedSection, user, mName)
{
    var text = message.text;
    var last = speratedSection.length-1;
    //show inbox setting
    if (text === fn.mstr[mName]['name'])
        show(message.from.id, mName);


    //set category
    else if(speratedSection[last] == fn.mstr['category'].asoption)
    {
        console.log('get new category for inbox');
        var cat = text.split(' - ')[1];
        if(fn.m.category.checkInValidCat(cat)) {
            show (message.from.id, mName, cat);
            fn.m[mName].show(message.from.id);
        }
        else global.fn.sendMessage(message.from.id, fn.str['choosethisItems']);
    }

    //change order
    else if(speratedSection[last] === fn.str['editOrder'])
    {
        var order = parseInt(text);
        if(!typeof order === 'number') global.fn.sendMessage(message.from.id, fn.str['editOrder']);

        var moduleOption = fn.getModuleOption(fn.mstr[mName]['modulename']);
        global.robot.config.moduleOptions[moduleOption.index].btn_order = order;
        //save configuration
        global.robot.save();
        fn.updateBotContent(() => { 
            show(message.from.id, mName);
            fn.m[mName].show(message.from.id);
        });
    }

    //dates
    else
    {
        var mstrdatas = Object.keys(fn.mstr[mName].datas);
        var key = false;
        mstrdatas.forEach(item => {
            if(item === speratedSection[last]) key = true;
        });

        if(!key) return;

        var itemSection = speratedSection[last];
        var dataOption = fn.mstr[mName].datas[itemSection];

        var key = true;
        var value = text;
        if(dataOption.items)
        {
            key = false;
            dataOption.items.forEach(element => {
                if(element.lable === text) {
                    key = true;
                    value = element.name;
                }
            });
        }

        if(!key) return;

        var datas = [{'name': itemSection, 'value':value}];
        fn.putDatasToModuleOption(mName, datas);
        
        global.robot.save();
        show (message.from.id, mName);
        fn.adminPanel.show(message);
    }
}

var query = function(query, speratedQuery, user, mName)
{
    var last = speratedQuery.length-1;
    var queryTag = fn.mstr[mName].query;

    //activation
    if(speratedQuery[3] === queryTag['activation'])
    {
        console.log(`active deactive ${mName}`);
        var moduleOption = fn.getModuleOption(mName);
        var key = global.robot.config.moduleOptions[moduleOption.index].active;
        global.robot.config.moduleOptions[moduleOption.index].active = !key;
        //save configuration
        global.robot.save();
        fn.updateBotContent(() => {
            show(query.from.id, mName);
        });
    }

    //setcategory
    else if (speratedQuery[3] === queryTag['category'])
    {
        console.log(`set categori for ${mName}`);
        var nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr[mName]['name'] + '/' + fn.mstr[mName].btns['settings'] + '/' + fn.mstr['category'].asoption;
        var back = fn.mstr[mName]['back'];
        var list = [];
        global.robot.category.forEach((element) => {
            list.push(element.parent + ' - ' + element.name);
        });
        var markup = fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false);

        global.fn.sendMessage(query.from.id, fn.str['editCategory'], markup);
        fn.userOper.setSection(query.from.id, nSection, false);
    }

    //order
    else if (speratedQuery[3] === queryTag['order'])
    {
        var nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr[mName]['name'] + '/' + fn.mstr[mName].btns['settings'] + '/' + fn.str['editOrder'];
        var remarkup = fn.generateKeyboard({'section': fn.mstr[mName]['back']}, true);
        global.fn.sendMessage(query.from.id, fn.str['editOrderMess'], remarkup);
        fn.userOper.setSection(query.from.id, nSection, false);
    }

    //datas
    else
    {
        var datas = Object.keys(fn.mstr[mName].datas);
        var key = false;
        datas.forEach(item => {
            if(item === speratedQuery[3]) key = true;
        });

        if(!key) return;

        var itemSection = speratedQuery[3];
        var dataOption = fn.mstr[mName].datas[itemSection];

        var list = [];
        var back = fn.mstr[mName]['back'];

        if(dataOption.items) dataOption.items.forEach(element => { list.push(element.lable) });

        var mess = dataOption.mess;
        var nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr[mName]['name'] + '/' + fn.mstr[mName].btns['settings'] + '/' + itemSection;
        var remarkup = fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false);

        global.fn.sendMessage(query.from.id, mess, remarkup);
        fn.userOper.setSection(query.from.id, nSection, false);
    }
}

module.exports = { routting, query, show }