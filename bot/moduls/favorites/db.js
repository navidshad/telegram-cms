var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favorItem = new Schema({
    'name'  :String,
    'id'    :String,
    'type'  :String,
});
  
var favoritesSchema = new Schema({
    'userid'    : Number,
    'items'     :[favorItem],
}, { usePushEach: true });

module.exports.favorites     = mongoose.model('favorites', favoritesSchema);