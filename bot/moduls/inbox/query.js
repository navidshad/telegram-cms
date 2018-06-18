var checkQuery = function(option){

    var btnsArr  = [ 
        fn.mstr.inbox.query['inbox']
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

var routting = function(query, speratedQuery){
    var last = speratedQuery.length-1;
    
    //remove query message
    global.robot.bot.deleteMessage(query.message.chat.id, query.message.message_id);
    //answer
    if(speratedQuery[1] === fn.mstr.inbox.query['answer']) {
        fn.userOper.setSection(query.from.id, fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr['inbox'].name + '/' + fn.mstr.inbox.mess['answer'] + '/' + speratedQuery[speratedQuery.length-1], false);
        global.fn.sendMessage(query.from.id, fn.mstr.inbox.mess['answer'], fn.generateKeyboard({section:fn.mstr['inbox'].back}, true));
    }
    //delete message
    else if(speratedQuery[1] === fn.mstr.inbox.query['delete']) deleteMessage(query.from.id, {'id': speratedQuery[last]});
}

module.exports = { routting, checkQuery }