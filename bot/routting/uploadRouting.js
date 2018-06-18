module.exports = function(message, speratedSection, user){

    //define query route
    global.mRoutes.forEach(route => {
        var result = (route.upload) ? route.upload({'speratedSection': speratedSection}, route.name) : {'status': false};
        if(result.status) {
            result.routting(message, speratedSection, user, route.name);
            nothingToRoute = false;
            return;
        }
    });

    // //post
    // if(speratedSection[2] === fn.mstr.post['name']){
    //     console.log('post upload');
    //     fn.m.post.upload.routting(message, speratedSection);
    // }

}