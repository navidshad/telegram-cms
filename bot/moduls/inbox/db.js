var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var inboxSchema = new Schema({
  messId      : String,
  date        : String,
  userid      : Number,
  username    : String,
  fullname    : String,
  message     : String,
  answered    : {type: Boolean, default: false},
});

module.exports.inbox = mongoose.model('inbox', inboxSchema);