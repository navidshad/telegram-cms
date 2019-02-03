var checkRoute = function(option){

    var btnsArr  = [ 
        fn.mstr.favorites.btns_user['favorites']
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

//get favorites of user
var get = async function(userid)
{
    var favorites = null;
    //get
    favorites = await fn.db.favorites.findOne({'userid': userid}).exec().then();
    //create
    if(!favorites) favorites = await new fn.db.favorites({ 'userid': userid }).save().then();
    //return
    return favorites;
}

//show favorites list
var show = async function(userid)
{
    var favorites = await get(userid);
    var list = favorites.items.map(item => { return item.name });
    var back = fn.mstr.category['backtoParent'];
    var markup = fn.generateKeyboard({'custom': true, 'grid':true, 'list': list, 'back':back}, false);
    var mess = fn.mstr.favorites.btns_user['favorites'];

    //no favorit
    if(favorites.length === 0) {
        global.fn.sendMessage(userid, fn.mstr.favorites.mess['notFound']);
        return;
    }

    global.fn.sendMessage(userid, mess, markup);
    fn.userOper.setSection(userid,  mess, true);
}

//add to or remove from favorites
var addremove = async function(query, newitem, user)
{
    var userid = query.from.id;
    var notAdded = true;
    var index = null;
    var favorites = await get(userid);

    //recognize
    favorites.items.forEach((item, i) => 
    { 
        if(item.name !== newitem.name) return;
        notAdded = false;
        index = i;
    });
    
    let eventAction = 'add';

    //remove
    if(index !== null) {
        eventAction = 'remove';
        favorites.items = favorites.items.splice(index+1, 1);
    }
    //add
    else if(notAdded) favorites.items.push(newitem);

    //save
    await favorites.save();
    //showItem
    fn.eventEmitter.emit('favshowitem', query, newitem, user);
    
    // analytic
    let eventCategory = 'favorite';
    let eventLabel = newitem.name;
    fn.m.analytic.trackEvent(user.userid, eventCategory, eventAction, eventLabel);
}

var getbutton = async function(userid, type, id)
{
    //ckeck module status
    var mName = fn.mstr.favorites.modulename;
    var setting = {'name':mName, 'active': false }
    var isModuleActive = fn.getModuleOption(mName, {'create': true, 'setting': setting}).option.active;
    if(!isModuleActive) return null;

    //recognize
    var notAdded = true;
    var favorites = await get(userid);
    favorites.items.forEach((item, i) => 
    { 
        if(item.id !== id) return;
        notAdded = false;
    });

    var queryTag = fn.mstr.favorites.query;
    var fn_like = queryTag['favorites'] + '-' + queryTag['user'] + '-' + queryTag['like'] + '-' + type + '-' + id;
    
    return {'text': (notAdded) ? '🖤': '❤️', 'callback_data': fn_like};
}

var routting = async function(message, speratedSection, user)
{
    var last = speratedSection.length-1;
    var text = message.text;
    var userid = message.from.id;

    //show list
    if(text === fn.mstr.favorites.btns_user['favorites']) show(userid);
    
    //show item
    else 
    {
        var favorites = await get(userid);
        var fav = null;

        favorites.items.map(item => { if(item.name === text) fav = item; });
    
        if(fav) fn.eventEmitter.emit('favshowitem', message, fav, user);
    }
}

global.fn.eventEmitter.on('favshowitem', async (query, item, user) =>
{
    var types = fn.mstr.favorites.types;
    
    if(item.type === types['post'])
    {
        var user = await fn.userOper.checkProfile(user.userid).then();
        fn.m.post.user.show(query, item.name, user);
    }
});

module.exports = { routting, checkRoute, addremove, getbutton }