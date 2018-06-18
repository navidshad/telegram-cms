var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var attachment = new Schema({
    'name':String, 
    'type':String, 
    'id':String,
    'caption':String,
  });
  
  var postSchema = new Schema({
    name        :String,
    isproduct   :{type:Boolean, default:false},
    price       :{type:Number, default:1000},
    category    :String,
    order       :Number,
    date        :String,
    description :String,
  
    type        :String,
    fileid      :String,
    photoid     :String,
    audioid     :String,
    videoid     :String,
    thumbLink   :String,
    publish     :Boolean,
    attachments :[ attachment ],
    allowlike   :{type:Boolean, default:true},
  });

  module.exports.post = mongoose.model('posts', postSchema);