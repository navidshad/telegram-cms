var checkQuery = function(option){

    var btnsArr  = [ 
        fn.mstr.commerce.query['commerce']
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
    var qt = fn.mstr.commerce.query;

    //remove query message
    if(speratedQuery[2] !== qt['itemsdetail'] && speratedQuery[2] !== qt['postalInfo']) 
        global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);

    //admin settings
    if(speratedQuery[1] === qt['admin'] && speratedQuery[2] === qt['settings'])
        fn.m[mName].setting.query(query, speratedQuery, user, mName);

    //admin generator
    if (speratedQuery[2] === qt['generator']) 
        fn.m.commerce.couponGenerator.query(query, speratedQuery);

    //if user
    if(speratedQuery[1] === qt['user']) 
        fn.m.commerce.user.query(query, speratedQuery, user);
}

module.exports = { checkQuery, routting }