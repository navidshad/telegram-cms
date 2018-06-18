var checkUpload = function(option){

    var btnsArr  = [ 
        fn.mstr.category['name'],
        fn.mstr.category['back']
    ];

    var result = {}
    //check text message
    if(option.text) btnsArr.forEach(btn => { 
        if(option.text === btn) 
        {
            result.status = true; 
            result.button = btn;
            result.routting = routting;
        }
    });

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

var uploadAttachment = function(message, speratedSection)
{
    console.log('recognize file type');
    var resId = speratedSection[speratedSection.length-1];
    
     var resourceid = '';
    var fileType = '';
    var caption = (message.caption) ? message.caption : '';

    //file
    if(message.document){
        resourceid = message.document.file_id;
        fileType = 'file';
        var name = message.document.file_name;
        var attachment = {'name': name, 'type':fileType, 'id':resourceid, 'caption': caption};
        fn.m.category.editcategory(resId, {'attachment': attachment}, message.from.id, speratedSection);
    }
    //photo
    if(message.photo){
        resourceid = message.photo[2].file_id;
        fileType = 'photo';
        var name = (message.photo[0].file_path) ? message.photo[0].file_path.replace('photos/','') : 'photo';
        var attachment = {'name': name, 'type':fileType, 'id':resourceid, 'caption':caption};
        fn.m.category.editcategory(resId, {'attachment': attachment}, message.from.id, speratedSection);      
    }       
    //audio
    if(message.audio){       
        resourceid = message.audio.file_id;
        fileType = 'sound';
        var name = (message.audio.title) ? message.audio.title : 'audio';
        var attachment = {'name': name, 'type':fileType, 'id':resourceid, 'caption':caption};
        fn.m.category.editcategory(resId, {'attachment': attachment}, message.from.id, speratedSection);
    }
    //video
    if(message.video){
        resourceid = message.video.file_id;
        fileType = 'video';
        var name = message.video.mime_type.replace('video/','');
        var attachment = {'name': name, 'type':fileType, 'id':resourceid, 'caption':caption};
        fn.m.category.editcategory(resId, {'attachment': attachment}, message.from.id, speratedSection);
    }
}


var routting = function(message, speratedSection)
{
    var last = speratedSection.length-1;

    if (speratedSection[last-1] === fn.mstr.category['endAttach']) uploadAttachment(message, speratedSection);
}

module.exports = { routting, checkUpload }