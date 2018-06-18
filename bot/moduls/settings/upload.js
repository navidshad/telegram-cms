var checkUpload = function(option, mName){

    var btnsArr  = [ 
        fn.mstr[mName]['name'],
    ];

    var result = {}

    //check seperate section
    if(option.speratedSection){
        option.speratedSection.forEach(section => {
            btnsArr.forEach(btn => 
            { 
                if(section === btn){
                    result.status = true; 
                    result.button = btn;
                    result.routting = routting;
                }
            });
        });
    }

    //return
    return result;
}

var routting = function(message, speratedSection, user, mName)
{
    var last = speratedSection.length-1;

    if(speratedSection[3] === fn.mstr[mName].btns['strToSticker']) 
        fn.m[mName].strToSticker.upload(message, speratedSection, user, mName);
}

module.exports = { routting, checkUpload }