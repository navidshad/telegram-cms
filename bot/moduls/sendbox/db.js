var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var attachment = new Schema({
  'name':String, 
  'type':String, 
  'id':String,
  'caption':String,
});
var sendBoxSchema = new Schema({
  date        : String,
  title       : String,
  text        : String,
  attachments : [attachment],
});

module.exports.sendbox = mongoose.model('sendBox', sendBoxSchema);