var showitem = async function (userid, category) 
{
    console.log('showitem', category);
    var menu = await fn.db.rowColumns.findOne({'category': category}).exec().then();
    
    if(!menu) return;

   //create callback keyboard
   var detailArr = [];
   var qt = fn.mstr['settings'].query;

   var sticker = qt['settings'] + '-' + qt['admin'] + '-' + qt['rowColumns'] + '-' + qt['addRow'] + '-' + menu._id;
   var fn_delete = qt['settings'] + '-' + qt['admin'] + '-' + qt['rowColumns'] + '-' + qt['delete'] + '-' + menu._id;

   //edit btns //publication btn
   detailArr.push([ 
        {'text': 'افزودن سطر', 'callback_data': sticker},
        {'text': 'حذف', 'callback_data': fn_delete},
    ].reverse());
    
    // rows
    menu.rows.forEach(r => 
    {
        let labels = {'r':'سطر', 'c':'ستون'};
        r_text = '❌ | ' + `${labels['r']} ${r.rowNumber} | ${r.totalColumns} ${labels['c']}`;
        r_fn = qt['settings'] + '-' + qt['admin'] + '-' + qt['rowColumns'] + '-' + qt['deleteRow'] + '-' + r.rowNumber + '-' + menu._id;
        
        let btn = {'text': r_text, 'callback_data': r_fn};
        detailArr.push([btn]);
    });

   //create message
   var text = 'اطلاعات منو' + '\n' +
   'ــــــــــــــــ' + '\n' +
   `🔶 نام منو: ${menu.category} \n.`;
 
   global.fn.sendMessage(userid, text, {"reply_markup" : {"inline_keyboard" : detailArr}});
}

var create = async function(userid, category)
{
    var existedCategory = await fn.db.rowColumns.count({'category': category}).exec().then();
 
    // error
    if(existedCategory || !category.startsWith('-'))
    {
        var mess = fn.mstr['settings'].mess['getstickerName'];
        global.fn.sendMessage(userid, mess);
        return;
    }

    // creat new button
    var newRow = {'category': category}; 
    await new fn.db.rowColumns(newRow).save().then();
    show(userid, fn.mstr['seccess']);
}

var show = async function(userid, txt)
{
    let btns = fn.mstr['settings'].btns;
    var titles = [[ btns['addMenu'] ]];

    var categories = await fn.db.rowColumns.find({}).limit(35).sort('-_id').exec().then();
    
    //make title list
    categories.map(item => { titles.push(item.category); });

    var section = btns['rowColumns'];
    var back = fn.mstr['settings']['back'];
    var mess = (txt) ? txt : section;
    var markup = global.fn.generateKeyboard({'custom': true, 'grid':false, 'list': titles, 'back':back}, false);
    
    global.fn.sendMessage(userid, mess, markup);
    fn.userOper.setSection(userid, section, true);
}

var editItem = async function(id, detail, userid, mName)
{
    var menu = await fn.db.rowColumns.findOne({'_id': id}).exec().then();

    if(!menu) 
    {
        show(message,'این دکمه وجود ندارد');
        return;
    }
    
    let addRow = function(newRow)
    {
        let isAdded = false;
        
        menu.rows.forEach((r) => { if(r.rowNumber == newRow.rowNumber) isAdded= true; });
        
        if(!isAdded) menu.rows.push(newRow);
    }

    if(detail['row'])
    {
        let tRow;
        let tColumn;
        let text = detail['row'];
        
        let verifyNumbers = function(r, c)
        {
            let verified = true;
            r = parseInt(r);
            c = parseInt(c);
            
            if(isNaN(r) || isNaN(c)) verified = false;
            
            //console.log('row & columns are: ', typeof r, typeof c);
            
            return verified;
        }
        
        // extract row and column from text
        try{
            tRow = text.split('-')[0];
            tColumn = text.split('-')[1];
        }
        catch (e) {
            console.log('text dosent splited', e);
            global.fn.sendMessage(userid, fn.mstr[mName].mess['getRow']);
            return;
        }
        
        // verify numbers
        if(!verifyNumbers(tRow, tColumn))
        {
            console.log('text isnt a number');
            global.fn.sendMessage(userid, fn.mstr[mName].mess['getRow']);
            return;
        }
        
        // pars numbers
        tRow = parseInt(tRow);
        tColumn = parseInt(tColumn);
        
        // add row
        let newRow = { rowNumber: tRow, totalColumns: tColumn };
        addRow(newRow);
        
        show(userid, fn.str['seccess']);
    }
    
    if(detail['removeRow'])
    {
        let removingRow = detail['removeRow'];
        let rIndex;
        
        menu.rows.forEach((r, i) => { if(r.rowNumber == removingRow) rIndex = i });
        
        console.log('removingRow', removingRow, 'rIndex', rIndex);
        
        menu.rows.splice(rIndex, 1);
    }
    
    await menu.save().then();
    showitem(userid, menu.category);
}

var routting = function(message, speratedSection, user, mName)
{
    var btns = fn.mstr[mName].btns;
    var text = message.text;
    var last = speratedSection.length-1;
    var userid = message.from.id;

    //ask to show section
    if (text === btns['rowColumns'] || text === btns['rowColumns_back'])
        show(userid);

    //create new category
    else if (text === btns['addMenu'])
    {
        var mess = fn.mstr['settings'].mess['getCategoryName'];
        var markup = fn.generateKeyboard({'section':btns['rowColumns_back']}, true);
        global.fn.sendMessage(userid, mess, markup);
        fn.userOper.setSection(userid, btns['addMenu'], true);
    }
    //get the title of new category
    else if(speratedSection[4] === btns['addMenu'])
        create(userid, text);
        
    // add row
    else if(speratedSection[4] === fn.mstr[mName].mess['getRow'])
        editItem(speratedSection[last], {'row': text}, userid, mName);

    //choose an button
    else showitem(userid, text);
}

var query = async function(query, speratedQuery, user, mName)
{
    var last = speratedQuery.length-1;
    var queryTag = fn.mstr[mName].query;

    //add row
    if(speratedQuery[last-1] === queryTag['addRow'])
    {
        var nSection = fn.str['mainMenu'] + '/' + fn.str.goToAdmin['name'] + '/' + fn.mstr[mName].name + '/' + fn.mstr[mName].btns['rowColumns'] + '/' + fn.mstr[mName].mess['getRow'] + '/' + speratedQuery[last];
        var markup = fn.generateKeyboard({section: fn.mstr[mName].btns['rowColumns_back']}, true);
        var mess = fn.mstr[mName].mess['getRow'];

        global.fn.sendMessage(query.from.id, mess, markup);
        fn.userOper.setSection(query.from.id, nSection, false);
    }
    
    // delet row
    if(speratedQuery[last-2] === queryTag['deleteRow'])
    {
        let removingRow = parseInt(speratedQuery[last-1]);
        editItem(speratedQuery[last], {'removeRow': removingRow}, user.userid, mName);
    }

    //delete
    else if (speratedQuery[last-1] === queryTag['delete'])
    {
        var id = speratedQuery[last];
        await fn.db.rowColumns.remove({'_id': id}).then();
        show(query.from.id, fn.str['seccess']);
    }
}

var check = async function (category)
{
    var rc = await fn.db.rowColumns.findOne({'category': `-${category}`}).exec().then();
    //console.log('check custom rowColumns', category, rc);
    return rc;
}

module.exports = { routting, query, check }