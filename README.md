# Telegram-CMS
It is a nodejs application to launch a Telegram bot in seconds with primary components.
I have been working on Telegram bots for almost 2 years and catched up most of needs for a chatbot. so I made this to solve lots of challenges and launching a bot easily.
There is an ability to write your own modules on telegram-cms that I'll explain then.
I'll complete this documentation during my tasks. but here is a simple "how to use"

### Note
- the main language of the cms is persian, but I will make a localization system for it, soon.
- [here is a chat room on gitter, I'll be there to answer yourquestions.](https://gitter.im/telegram-cms/Lobby)


### Sample Bots
- [@maaniyab_bot](http://t.me/maaniyab_bot)
- [@steryobot](http://t.me/steryobot)
- [@poshakyasin_bot](http://t.me/poshakyasin_bot)
- [@PinkPanterSbot](http://t.me/PinkPanterSbot)


## How to use
- Install it,
- Create an app.js (or what ever you want)
- Require it and start

...

    // this is your app.js file
    var tcms = require('telegram-cms');

    var option = {
        // mongo db path
        dbpath      :'mongodb://127.0.0.1:27017/telegram_cms',
        // bot token
        token       :'tokenxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        // bot username
        botusername :'username_bot',
        // activate modules
        modules:{
            'category'          :true,	// category module
            'post'              :true,	// post module
            'settings'          :true,	// setting module
            'search'            :true,	// search module
            'sendbox'           :true,	// contact form module
            'inbox'             :true,	// a module for send message to users
            'chanelChecker'     :true,	// a module for connecting to a channel
            'favorites'         :true,	// a module to make favorite (favorite posts, etc)
        },

        // web
        serverport:2002,	//express server, needed for commerce module

        // folders
        modulespath: require('path').join(__dirname, 'plugins'),	// If you write your own modules
    }
    
    // initialize the cms
    tcms.start(option);
    
...

## comment events

...

    // if nothing to be routed by moduls,
    global.fn.eventEmitter.on('nothingtoroute', (message, speratedSection, user) => {});

    // if user send a command type message
    global.fn.eventEmitter.on('commands', (message) => {});

    // receive from inline mode
    global.fn.eventEmitter.on('inlineQuery', (InlineQuery) => {});

    // schedule an event
    global.fn.eventEmitter.emit('addtoschedule', code, date,  parameters, callback);

...
