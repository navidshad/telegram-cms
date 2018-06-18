var routting = function(message, speratedSection, user){
    console.log('free strings');
    var last = speratedSection.length-1;
    var text = message.text;
    var nothingToRoute = true;

    global.mRoutes.forEach(route => {
        var result = (route.user) ? route.user({'mName': route.name, 'text':text, 'speratedSection': speratedSection}) : {'status': false};
        if(result.status) {
            result.routting(message, speratedSection, user, route.name);
            nothingToRoute = false;
            return;
        }
    });

    //nothing
    if(nothingToRoute) fn.eventEmitter.emit('nothingtoroute', message, speratedSection, user);
    //global.fn.sendMessage(message.from.id, 'لطفا از گزینه های ربات استفاده کنید.');
}

module.exports = {routting}