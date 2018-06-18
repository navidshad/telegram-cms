fn = global.fn;

var custome = function(arr, grid, keys, back, columns)
{
    //grid mode
    if(grid){
        var items = arr;
        var row = [];
        var secondPosition = true;

        //make grid
        for (var i = 0; i < items.length; i++) {
            const btn = items[i];
            row.push(btn);

            if(row.length >= columns || i == items.length-1)
            {
                keys.reply_markup.keyboard.push(row);
                row = [];
            }
        }
    }
    //list
    else{
        arr.forEach(function(element) {
            if(typeof element === 'string')keys.reply_markup.keyboard.push([element]);
            else keys.reply_markup.keyboard.push(element);
        }, this);
    }

    //back button
    if(back){
        keys.reply_markup.keyboard.push([back]);
    }
    else{
        //keys.reply_markup.keyboard.push([fn.str['backToMenu']]);
    }
    return keys;
}

module.exports = function(flag, onlyBack, columns){
    columns = (!columns) ? 2 : columns;
    var keys = {
        "reply_markup": {
            'keyboard': [],
            'resize_keyboard': true
        }
    }

    if(onlyBack){
        keys.reply_markup.keyboard.push([flag.section]);
        return keys;
    }

    //costume keyboard
    else if(flag.custom === true){
        //console.log('generate costume keyboard');
        return custome(flag.list, flag.grid, keys, flag.back, columns);
    }

    //main menu keybard
    else if(flag.section === fn.str['mainMenu']){
        var items = (flag.list) ? flag.list : [];
        row = [];
        var secondPosition = true;
        for (var i = 0; i < items.length; i++) {
            var btnsLevel = [];
            btnsLevel.push(items[i]);
            if(secondPosition){
                i +=1;
                if(i < items.length)
                    btnsLevel.push(items[i]);
                secondPosition = false;
            }
            if(i < items.length-1){secondPosition = true;}
            keys.reply_markup.keyboard.push(btnsLevel);
        }
        //
        if(flag.isAdmin)
            keys.reply_markup.keyboard.push([fn.str.goToAdmin['name']]);
        return keys;
    }

    //admin section
    else if(flag.section === fn.str.goToAdmin.name){
        var items = [];
        for (item in flag.list){
            var element = flag.list[item];
            var key = global.robot.config.modules[element.modulename];
            if(key) items.push(element.name);
        }
        return custome(items, true, keys, flag.back, columns);
    }
}
