var checkQuery = function(option)
{
    var mName = option.mName;
    var btnsArr  = [ 
        fn.mstr[mName].query[mName],
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
    var queryTag = fn.mstr[mName].query;
    
    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);

    //got to setting
    fn.m[mName].settings.query(query, speratedQuery, user, mName);
}

module.exports = { routting, checkQuery }