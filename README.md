# telegram-cms
it is a nodejs application to lunch a telegram bot in seconds with primary components.
I have work on telegram bots for almost 2 years and catched up most of needs for a chatbot. so I made this to solve lots of challenges and lunching a bot easily.
there is an ability to write your own modules on telegram-cms that I'll explain then.
I'll complete this documentation during my tasks. but here is a simple "how to use"

### Note
- the main language of the cms is persion, but I will make a multilanguage system for it, soon.

## How to use
- install it,
- creat an app.js (or what ever you want)
- require it and start

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
            'contacttousers'    :true,	// a module for send message to users
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

    // if nothing tobe routed by moduls,
    global.fn.eventEmitter.on('nothingtoroute', (message, speratedSection, user) => {});

    // if user send a command type message
    global.fn.eventEmitter.on('commands', (message) => {});

    // recive from inline mode
    global.fn.eventEmitter.on('inlineQuery', (InlineQuery) => {});

...