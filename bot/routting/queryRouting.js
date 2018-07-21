fn = global.fn;

var routting = function(query){
    var speratedQuery = query.data.split('-');

    //get user detail
    fn.userOper.checkProfile(query.from.id, (user) => 
    {
        if(!user) return;

        //define query route
        for (let index = 0; index < global.mRoutes.length; index++) 
        {
            const route = global.mRoutes[index];
            var result = (route.query) ? route.query({'mName': route.name, 'speratedSection': speratedQuery}) : {'status': false};
            if(!result.status) continue;

            result.routting(query, speratedQuery, user, route.name);
            nothingToRoute = false;
            break;
        }
    });
}

module.exports = {
    routting
}