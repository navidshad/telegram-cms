fn = global.fn;

var routting = async function(message){
    console.log('routing', message.from.id);
    
    //commands
    if(message.text && message.text === '/start')                   fn.commands.start(message);
    else if (message.text && message.text === '/getsection')        fn.commands.getsection(message);
    else if (message.text && message.text.includes('/register-'))   fn.commands.registerAdmin(message);
    else if (message.text && message.text.includes('/getwordcount'))  fn.commands.getWordCount(message.from.id);
    
    //emit command event
    else if (message.text && message.text.startsWith('/')) 
    {
        if(message.text.startsWith('/start')) 
            await fn.commands.start(message);

        //validating user
        var user = await fn.userOper.checkProfile(message.from.id).then();
        if(!user) return;

        // emit command
        fn.eventEmitter.emit('commands', message, user);
    }
    
    //routting
    else
    {
        //validating user
        var user = await fn.userOper.checkProfile(message.from.id).then();
        if(!user) return;

        //sperate section 
        var speratedSection = user.section.split('/');
        
        //go to meain menu
        if(message.text && message.text === fn.str['backToMenu']) fn.commands.backToMainMenu(message.from.id, user);
        
        //when profile is compelet
        else if(user.isCompelet){
            //console.log('user profile is compelet');
            //text message
            if(message.text)
            {
                var text = message.text;
                
                //go to admin
                if(text === fn.str.goToAdmin['name'] || text === fn.str.goToAdmin['back'] || speratedSection[1] === fn.str.goToAdmin['name'] && user.isAdmin){
                    fn.adminPanel.routting(message, speratedSection, user);
                }
                
                //chanelChecker
                else if(!user.isAdmin && !user.isMemberOfChannel) {
                    fn.m.chanelChecker.InviteUser(message.from.id); 
                    return;
                }

                //menu items
                else if(text === fn.mstr.category['backtoParent'] || fn.checkValidMessage(text, global.robot.menuItems) || fn.checkValidMessage(speratedSection[1], global.robot.menuItems))
                    fn.menu.routting(message, speratedSection, user);

                //free message
                else fn.freeStrings.routting(message, speratedSection, user);
            }

            else if(message.contact)
                fn.freeStrings.routting(message, speratedSection, user);

            //non text message
            else fn.upload(message, speratedSection, user);
        }
        //user profile is not compelet
        else if (!isCompelet && message.text){
            //console.log('user profile is not compelet', 'you should register first');
            var name = 'کاربر گرامی ' + message.from.first_name + ' عزیر،';
            var pm = name + '\n' + 'شما ابتدا باید پروفایل خود را تکمیل کنید تا بتوانید از امکانات ربات استفاده کنید.';
            global.fn.sendMessage(message.from.id, pm, fn.generateKeyboard({section:fn.str['mainMenu'], "isCompelet": isCompelet}, false));
        }
    }
}

module.exports = { routting }