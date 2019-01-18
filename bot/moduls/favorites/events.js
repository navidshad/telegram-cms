fn.eventEmitter.on('editFavorite', (detail) => 
{
  global.fn.db.favorites.find({"items.name": detail.oldName},
  (err, docs) => 
  {
    if(err){
      console.error(err);
      return;
    }
    
    for(let counter=0; counter < docs.length; counter++)
    {
      let doc = docs[counter];
      console.log('editFavorite', 'doc', doc);
      
      let index;
      doc.items.forEach((item, i) => {
        if(item.name == detail.oldName) index = i;
      });
      
      doc.items[index].name = detail.newName;
      console.log('editFavorite', 'doc', doc);
      doc.save().then();
    }
  });
});

fn.eventEmitter.on('deleteFavorite', (detail) => 
{
    global.fn.db.favorites.find({"items.name": detail.oldName},
  (err, docs) => 
  {
    if(err){
      console.error(err);
      return;
    }
    
    for(let counter=0; counter < docs.length; counter++)
    {
      let doc = docs[counter];
      console.log('editFavorite', 'doc', doc);
      
      let newList = [];
      
      doc.items.forEach((item, i) => 
      {
        if(item.name != detail.oldName) {
          delete item._id;
          newList.push(item);
        }
      });
      
      //remove
      if(newList.length) doc.items = newList;
      
      doc.save().then();
    }
  });
});