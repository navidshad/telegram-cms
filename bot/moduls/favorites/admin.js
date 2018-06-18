var name = 'favorites';

var checkRoute = function(option){

    var btnsArr  = [ 
        fn.mstr.favorites['name'],
        fn.mstr.favorites['back']
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
    var mName = fn.mstr.favorites['modulename'];
    var activationtext = '',
    moduleOption = fn.getModuleOption(mName,  {'create': true});
    
    //defin activation button
    activationtext = (moduleOption.option.active) ? 'disable' : 'enable';
    //defin new category
    if(newcat) {
        moduleOption.option.category = newcat;
        moduleOption.option.buttons = fn.convertObjectToArray(fn.mstr.favorites.btns_user);
        global.robot.config.moduleOptions[moduleOption.index] = moduleOption.option;
        //save configuration
        global.robot.save();
        fn.updateBotContent( () => { show(userid); });
    }

    var list = [
        fn.mstr['category'].asoption, 
        fn.str.activation[activationtext],
        fn.str['editOrder'],
    ],
    back = fn.str.goToAdmin['back'],
    remarkup = fn.generateKeyboard({'custom': true, 'grid':true, 'list': list, 'back':back}, false);
    
    var detailMess = 'اطلاعات افزونه' + '\n'
    + 'دسته: ' + moduleOption.option.category + '\n'
    + 'نام دکمه در منو: ' + moduleOption.option.buttons + '\n'
    + 'اولویت در منو: ' + moduleOption.option.btn_order + '\n'
    + 'وضعیت: ' + moduleOption.option.active;

    global.fn.sendMessage(userid, detailMess, remarkup);
    fn.userOper.setSection(userid,  fn.mstr.favorites['name'], true);
}

var category = function (message, speratedQuery){
    console.log('set categori for favorites');
    fn.userOper.setSection(message.from.id,  fn.mstr['category'].asoption, true);
    var back = fn.mstr['favorites']['back'];
    var list = [];
    global.robot.category.forEach((element) => {
        list.push(element.parent + ' - ' + element.name);
    });
    global.fn.sendMessage(message.from.id, fn.mstr.post.edit['category'], 
    fn.generateKeyboard({'custom': true, 'grid':false, 'list': list, 'back':back}, false));
}

var routting = function(message, speratedSection){
    var mName = fn.mstr.favorites['modulename'];
    var text = message.text;
    var last = speratedSection.length-1;

    //show favorites setting
    if (text === fn.mstr.favorites['name'] || text === fn.mstr.favorites['back'])
        show(message.from.id);

    //active or deactive
    else if(fn.checkValidMessage(text, [fn.str.activation.enable,fn.str.activation.disable])){
        console.log('active deactive favorites');
        var key = (text === fn.str.activation.enable) ? true : false;
        var moduleOption = fn.getModuleOption(mName);
        global.robot.config.moduleOptions[moduleOption.index].active = key;
        //save configuration
        global.robot.save();
        fn.updateBotContent( () => { show(message.from.id); });
    }

    //set category
    else if(text === fn.mstr['category'].asoption) category(message, speratedSection);
    else if(speratedSection[last] == fn.mstr['category'].asoption){
        console.log('get new category for favorites');
        var cat = text.split(' - ')[1];
        if(fn.m.category.checkInValidCat(cat)) show (message.from.id,  cat);
        else global.fn.sendMessage(message.from.id, fn.str['choosethisItems']);
    }

    //change order
    else if (text === fn.str['editOrder']){
        var remarkup = fn.generateKeyboard({'section': fn.mstr.favorites['backsetting']}, true);
        global.fn.sendMessage(message.from.id, fn.str['editOrderMess'], remarkup);
        fn.userOper.setSection(message.from.id,  fn.str['editOrder'], true);
    }
    else if(speratedSection[last] === fn.str['editOrder']){
        var order = parseInt(text);
        if(!typeof order === 'number') global.fn.sendMessage(message.from.id, fn.str['editOrder']);

        var moduleOption = fn.getModuleOption(fn.mstr.favorites['modulename']);
        global.robot.config.moduleOptions[moduleOption.index].btn_order = order;
        //save configuration
        global.robot.save();
        fn.updateBotContent( () => { show(message.from.id) });
    }
}

var user    = require('./user');
var query   = require('./query');

module.exports = { name, checkRoute, routting, user, query }