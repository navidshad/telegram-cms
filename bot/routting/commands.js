//start bot
var start = async function(message){
    //collect 
    var form = Object(message.from);
    form.bot = global.robot.username;
    form.date = Date.today();
    
    var newuser = await fn.userOper.registerId(message.from);
    backToMainMenu(message.from.id, newuser);
    if(newuser.isAdmin) global.fn.sendMessage(message.from.id, fn.str['youareadmin']);
}

//get user's section
var getsection = function(message){
    fn.userOper.checkProfile(message.from.id, (user) => {
        global.fn.sendMessage(message.from.id, user.section);
    });
}

//register admin
var registerAdmin = function(message){
    //console.log('register someone');
    var sperate = message.text.split('-');
    fn.userOper.addAdminToWaintingList(sperate[1]);
    global.fn.sendMessage(message.from.id, fn.str['registeradmin']);
}

//back to mainMenu
var backToMainMenu = async function(userid, user, mess){
    //console.log('go to main menu');
    await fn.getMainMenuItems().then();
    var items = global.robot.menuItems;
    fn.userOper.setSection(userid, fn.str['mainMenu'], false);
    remarkup = fn.generateKeyboard({'section':fn.str['mainMenu'], 'list':items, "isCompelet": user.isCompelet, "isAdmin": user.isAdmin}, false);
    var texttosend = (mess) ? mess : global.robot.config.firstmessage;
    if(texttosend == null) texttosend = global.fn.str['mainMenuMess'];
    global.fn.sendMessage(userid, texttosend, remarkup);
}

//get word counr
var getWordCount = async function(userid){ 
    var count = await fn.db.word.count({}).exec().then();
    var mess = 'تعداد واژه های جستجو شده توسط کاربران: ' + count;
    global.fn.sendMessage(userid, mess);
}

module.exports = {
    start, getsection, registerAdmin, backToMainMenu, getWordCount,
}