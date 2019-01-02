var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let strStickerSchema = new Schema({
  name        : String,
  fileid      : String,
  type        : String,
});

let rowSchema = new Schema({
  rowNumber: Number,
  totalColumns: Number,
});

let rowColumnsSchema = new Schema({
  category  : String,
  row       : [rowSchema]
});

module.exports.strStickers = mongoose.model('strreplacers', strStickerSchema);
module.exports.rowColumns = mongoose.model('rowColumns', rowColumnsSchema);