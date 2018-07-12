global.scheduleTasks = [];

//check task list
var checktasks = function()
{
    var now = new Date();
    var doneCounter = 0;
    var newSchedule = [];
    return new Promise((resolve, reject) => 
    {
        for (let i = 0; i < global.scheduleTasks.length; i++) 
        {
            const task = global.scheduleTasks[i];
            // compare date, 1 = greater, -1 = less than, 0 = equal
            var status = now.compareTo(task.date);
            
            if(status == -1) {
                newSchedule.push(task);
                continue; // new is less than the task date
            }

            //do task
            doneCounter++;
            task.callback(task.params);
        }

        //set new schedule
        global.scheduleTasks = newSchedule;
        if(doneCounter) console.log(`schedule: ${doneCounter} tasks being done.`);
        resolve();
    });
}

var runcCycle = async function() 
{
    //waiting
    await global.fn.sleep(5000).then();
    
    //check schedule
    await checktasks().then();

    //run new sycle
    runcCycle();
}

// event
global.fn.eventEmitter.on('addtoschedule', (code, date,  params={}, callback) => 
{
    if(!date || !callback) return;
    var newTask = {'code':code, 'date':date, 'params': params, 'callback':callback};

    // recognize
    var isadded = false;
    var index = null;
    global.scheduleTasks.forEach((task, i) => 
    {
        if(code == null || code !== task.code) return;
        isadded = true;
        index = i;
    });

    // update
    if(isadded) global.scheduleTasks[index] = newTask;
    // create
    else global.scheduleTasks.push(newTask);
});

module.exports = {runcCycle}