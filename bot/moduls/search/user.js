var checkRoute = function(option){

    var btnsArr  = [ 
        fn.mstr.search['lable'],
        fn.mstr.search['back']
    ];

    var result = {}
    //check text message
    if(option.text) btnsArr.forEach(btn => { 
        if(option.text === btn && option.text !== fn.mstr.category['backtoParent']) 
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

var show = function(userid){
    var remarkup = fn.generateKeyboard({'section': fn.mstr.category['backtoParent']}, true);
    var detailMess = fn.mstr.search['getmess'];
    global.fn.sendMessage(userid, detailMess, remarkup);
    fn.userOper.setSection(userid, fn.mstr.search['name'], true);
}

var search = async function(userid, text)
{
    var list = [];
    var back = fn.mstr.search['back'];
    var mess = 'نتیجه جستجو برای ' + text;
    var promissarray = [];
    var symbols = {};

    //get search routes 
    var searchroutes = fn.getRoute('searchRoute');
    searchroutes.map(route => {
        promissarray.push(route.searchRoute(userid, text));
        symbols[route.name] = fn.mstr[route.name].symbol;
    });

    var results = await Promise.all(promissarray).then()
    .catch((e) => { 
        console.log(e);
        global.fn.sendMessage(userid, 'دیتابیس باید برای عملیات جستجو تنظیم شود، لطفا به مسئول فنی اطلاع دهید.');
    });

    for (let index = 0; index < results.length; index++) 
    {
        const result = results[index];
        var mName = result.mName;
        var symbol = symbols[mName];
        if(result.items)
            result.items.map(item => 
            {
                var title = result.makebtntitle(item);
                var btn = `${symbol} ${title}`;
                list.push(btn);
            });
    }

    var markup = fn.generateKeyboard({'custom': true, 'grid':true, 'list': list, 'back':back}, false);
    global.fn.sendMessage(userid, mess, markup);
    fn.userOper.setSection(userid, fn.mstr.search['result'], true);
}

var showItem = function(message, name){
    fn.m.post.user.show(message, name, () => {
        //item does not existed
        global.fn.sendMessage(message.user.id, fn.str['choosethisItems']);
    });
}

var routting = function(message, speratedSection)
{
    var mName = fn.mstr.search['modulename'];
    var text = message.text;
    var last = speratedSection.length-1;

    //show search section
    if (text === fn.mstr.search['lable'] || text === fn.mstr.search['back'])
        show(message.from.id);

    //search
    else if (speratedSection[last] === fn.mstr.search['name'])
        search(message.from.id, text);
    
    //choose item
    else if (speratedSection[last] === fn.mstr.search['result'])
        fn.eventEmitter.emit('searchshowitem', message, speratedSection)

}

module.exports = { routting, checkRoute }