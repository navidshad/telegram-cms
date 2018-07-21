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
  voteOptions : [String],
});

var voteOptionSchema = new Schema({
  index: Number,
  data: String,
})
var voteSchema = new Schema({
  sendboxid : String,
  userid    : Number,
  voteOption: Number,
});

module.exports.sendbox = mongoose.model('sendBox', sendBoxSchema);
module.exports.sendboxVote = mongoose.model('sendBox_vote', voteSchema);
