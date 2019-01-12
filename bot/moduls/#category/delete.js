//find cats by name or parent
var find = function(option)
{
    var matched = [];
    
    global.robot.category.forEach((element) => {
        if(option.name && option.name === element.name) matched.push(element);
        else if(option.parent && option.parent === element.parent) matched.push(element);
    }, this);
    
    return matched;
}
//get relativs of a category
var getrelativs = function(name){
    var relativs = [];

    matched = find({'parent': name});
    if(matched.length > 0){
        matched.forEach(function(element) {
            relativs.push(element.name);

            var elementRelativs = getrelativs(element.name);
            if(elementRelativs.length > 0) 
                elementRelativs.forEach(function(er) {relativs.push(er)}, this);
        }, this);
    }

    return relativs;
}

//remove a category
var clear = function(name, call){

    //prepare clear list
    var clearList = getrelativs(name);
    clearList.push(name);
    console.log(clearList);

    //prepare query
    var querystr = '';
    for(var i=0; i<clearList.length; i++){
        if(i !== 0 && i<i<clearList.length-1) querystr += ' || ';
        querystr += 'this.name === "' + clearList[i] + '"';
    }
    console.log(querystr);

    //remove items
    fn.db.category.remove({}).$where(querystr).exec(() => {
        fn.m.category.get();   //get new category list from db
        if(call) call();
    });
}
module.exports = { clear, find }