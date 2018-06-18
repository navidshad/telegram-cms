const fs = require('fs');
const path = require('path');

var walk = function(dir, settings, done) 
{
    let results = [];

    //read director fild and folders
    fs.readdir(dir, function(err, list) 
    {
        if (err) return done(err);

        var pending = list.length;
        if (!pending) return done(null, results);

        list.forEach(function(file)
        {
            file = path.join(dir, file);
            fs.stat(file, function(err, stat)
            {
                // If directory, execute a recursive call
                if (stat && stat.isDirectory()) 
                {
                    // Add directory to array [comment if you need to remove the directories from the array]
                    //results.push(file);
                    walk(file, settings, function(err, res){
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } 
                else 
                {
                    //file filter
                    var extension = path.extname(file);
                    var fileName = path.basename(file).split('.')[0];
                    var fileNameKey = true;

                    //name filter
                    if(settings.name && settings.name === fileName) fileNameKey = true;
                    else fileNameKey = false;

                    //extention filter
                    if(settings.filter && fileNameKey){
                        settings.filter.forEach(function(element) {
                            if(element.toLowerCase() === extension.toLowerCase()) 
                                results.push(file);
                        }, this);
                    }

                    //push any file if no option
                    else if (fileNameKey) results.push(file);

                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

module.exports = {walk}