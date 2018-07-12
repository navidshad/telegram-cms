module.exports = function()
{
    //text 
    global.robot.bot.on('text', (msg) => {
        global.fn.saveLastMessage(msg);
    });

    //callback 
    global.robot.bot.on('callback_query', (query) => {
        //console.log(query);
        global.queryRouting.routting(query);
    });

    //channel post 
    global.robot.bot.on('channel_post', (post) => 
    {
        global.fn.eventEmitter.emit('channel_post', post);

        //console.log(post);
        if(post.text === fn.mstr.chanelChecker['addChannelRegister'])
            global.fn.m.chanelChecker.registerChannel(post.chat, post.message_id);
        //global.queryRouting.analyze(query);
    });

    //inline_query 
    global.robot.bot.on('inline_query', (inlineQuery) => {
        global.fn.eventEmitter.emit('inline_query', inlineQuery);
    });

    //chosen_inline_result 
    global.robot.bot.on('chosen_inline_result', (result) => {
        global.fn.eventEmitter.emit('chosen_inline_result', result);
    });
}