var checkQuery = function(option){

    var btnsArr  = [ 
        fn.mstr.settings.query['settings']
    ];

    var result = {}
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

var routting = function(query, speratedQuery, user, mName)
{
    var last = speratedQuery.length-1;
    var queryTag = fn.mstr.settings.query;
    
    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);

    //switch like
    if(speratedQuery[2] === queryTag['strSticker']) 
        fn.m.settings.strToSticker.query(query, speratedQuery, user, mName);
}

module.exports = { checkQuery, routting }