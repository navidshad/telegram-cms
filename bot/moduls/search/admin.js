var name = 'search';

var checkRoute = function(option){

    var btnsArr  = [ 
        fn.mstr.search['name'],
        fn.mstr.search['back']
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

var show = function(userid, newcat){
    var mName = fn.mstr.search['modulename'];
    var activationtext = '',
    moduleOption = fn.getModuleOption(mName);

    if(!moduleOption) {
        activationtext = 'enable';
        var option = {'name':mName,'active':false, 'button': fn.mstr.search['lable']};
        global.robot.config.moduleOptions.push(option);
        moduleOption = fn.getModuleOption(mName);
    }
    
    //defin activation button
    activationtext = (moduleOption.option.active) ? 'disable' : 'enable';
    //defin new category
    if(newcat) {
        moduleOption.option.category = newcat;
        moduleOption.option.button = fn.mstr.search['lable'];
        global.robot.config.moduleOptions[moduleOption.index] = moduleOption.option;
    }

    //save configuration
    global.robot.save();

    var list = [
        fn.mstr['category'].asoption, 
        fn.str.activation[activationtext],
        fn.str['editOrder'],
    ],
    back = fn.str.goToAdmin['back'],
    remarkup = fn.generateKeyboard({'custom': true, 'grid':true, 'list': list, 'back':back}, false);
    
    var detailMess = 'اطلاعات افزونه' + '\n'
    + 'دسته: ' + moduleOption.option.category + '\n'
    + 'نام دکمه در منو: ' + moduleOption.option.button + '\n'
    + 'اولویت در منو: ' + moduleOption.option.btn_order + '\n'
    + 'وضعیت: ' + moduleOption.option.active;

    global.fn.sendMessage(userid, detailMess, remarkup);
    fn.userOper.setSection(userid, fn.mstr.search['name'], true);
}

var category = function (message, speratedQuery){
    console.log('set categori for search');
    fn.userOper.setSection(message.from.id, fn.mstr['category'].asoption, true);
    var back = fn.mstr['search']['back'];
    var list = [];
    global.robot.category.forEach((element) => {
        list.push(element.parent + ' - ' + element.name);
    });
    global.fn.sendMessage(message.from.id, fn.mstr.post.edit['category'], 
    fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false));
}

var routting = function(message, speratedSection){
    var mName = fn.mstr.search['modulename'];
    var text = message.text;
    var last = speratedSection.length-1;
    //show search setting
    if (text === fn.mstr.search['name'] || text === fn.mstr.search['back'])
        show(message.from.id);

    //active or deactive
    else if(fn.checkValidMessage(text, [fn.str.activation.enable,fn.str.activation.disable])){
        console.log('active deactive search');
        var key = (text === fn.str.activation.enable) ? true : false;
        var moduleOption = fn.getModuleOption(mName);
        global.robot.config.moduleOptions[moduleOption.index].active = key;
        //save configuration
        global.robot.save();
        fn.updateBotContent(() => { show(message.from.id); });
    }

    //set category
    else if(text === fn.mstr['category'].asoption) category(message, speratedSection);
    else if(speratedSection[last] == fn.mstr['category'].asoption){
        console.log('get new category for search');
        var cat = text.split(' - ')[1];
        if(fn.m.category.checkInValidCat(cat)){
            show (message.from.id, cat);
        }else global.fn.sendMessage(message.from.id, fn.str['choosethisItems']);
    }

    //change order
    else if (text === fn.str['editOrder']){
        var remarkup = fn.generateKeyboard({'section': fn.mstr.search['back']}, true);
        global.fn.sendMessage(message.from.id, fn.str['editOrderMess'], remarkup);
        fn.userOper.setSection(message.from.id, fn.str['editOrder'], true);
    }
    else if(speratedSection[last] === fn.str['editOrder']){
        var order = parseInt(text);
        if(!typeof order === 'number') global.fn.sendMessage(message.from.id, fn.str['editOrder']);

        var moduleOption = fn.getModuleOption(fn.mstr.search['modulename']);
        global.robot.config.moduleOptions[moduleOption.index].btn_order = order;
        //save configuration
        global.robot.save();
        fn.updateBotContent(() => { show(message.from.id); });
    }
}

var user = require('./user');

module.exports = { name, checkRoute, routting, user }