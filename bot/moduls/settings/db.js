var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var strStickerSchema = new Schema({
  name        : String,
  fileid      : String,
  type        : String,
});

module.exports.strStickers = mongoose.model('strreplacers', strStickerSchema);