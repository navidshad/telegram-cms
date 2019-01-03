fn = global.fn;
var show = function(message)
{
    fn.userOper.setSection(message.from.id, fn.str.goToAdmin['name'], true);
    markup = fn.generateKeyboard({section:fn.str.goToAdmin['name'], 'list':fn.mstr, 'back':fn.str['backToMenu']}, false);        
    global.fn.sendMessage(message.from.id, fn.str.goToAdmin['name'], markup);
}

var routting = function(message, speratedSection, user)
{
    var text = message.text;

    //go to Admin 
    if(message.text === fn.str.goToAdmin['name'] || message.text === fn.str.goToAdmin['back']){
        console.log('got to admin section');
        show(message);
    }
    //module routting
    else 
    {
        for (let index = 0; index < global.mRoutes.length; index++) 
        {
            const route = global.mRoutes[index];
            var result = route.admin({'text':text, 'speratedSection': speratedSection});
            if(!result.status) continue;

            result.routting(message, speratedSection, user, route.name);
            break;
        }
    }
}

module.exports = {routting, show}