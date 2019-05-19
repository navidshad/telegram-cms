global.messageRouting = require('../routting/messageRouting.js');
global.queryRouting = require('../routting/queryRouting.js');

module.exports = function(detail)
{
    this.username = detail.username
    this.token = detail.token;
    this.bot = {};
    this.adminWaitingList = [];
    this.config = detail.config;
    this.category = [];
    this.menuItems = [];
    this.lastMessage = null;

    this.start = async function()
    {
        global.robot = this;
        var bot = new global.fn.telegramBot(this.token, {polling: true});
        global.robot.bot = bot;
        await this.load();

        //Message
        global.robot.bot.on('message', (msg) => 
        {
            //console.log(msg.text);
            bot.sendChatAction(msg.chat.id, 'typing');

            this.lastMessage = msg;
            global.messageRouting.routting(msg);
        });

        //other events
        require('./events')();
    }

    this.save = async function()
    {
        var update = {
            //update
            'username'    : global.robot.username,
            'firstmessage' : global.robot.config.firstmessage,
            'moduleOptions': global.robot.config.moduleOptions
        }

        var count = await global.fn.db.config.count({'username': this.username}).exec().then();
        //update
        if(count > 0)
            await global.fn.db.config.update({"username": this.username}, update).exec().then();
        //creat
        else await new global.fn.db.config(update).save();
    }

    this.load = async function()
    {
        var conf = await global.fn.db.config.findOne({"username": this.username}).exec().then();
        if(!conf) {
            this.save();
            return;
        }

        global.robot.config.moduleOptions = conf.moduleOptions;
        global.robot.config.collectorlink = conf.collectorlink;
        global.robot.config.firstmessage = conf.firstmessage;

        //get main menu items
        global.fn.updateBotContent();
    }
}