var routting = function(message, speratedSection, user)
{
    var last = speratedSection.length-1;
    var text = message.text;
    var nothingToRoute = true;

    for (let i = 0; i < global.mRoutes.length; i++) 
    {
        const route = global.mRoutes[i];

        var result = (route.user) ? route.user({'mName': route.name, 'text':text, 'speratedSection': speratedSection}) : {'status': false};
        if(!result.status) continue;

        result.routting(message, speratedSection, user, route.name);
        nothingToRoute = false;
        break;
    }

    //nothing
    if(nothingToRoute) fn.eventEmitter.emit('nothingtoroute', message, speratedSection, user);
    //global.fn.sendMessage(message.from.id, 'لطفا از گزینه های ربات استفاده کنید.');
}

module.exports = {routting}