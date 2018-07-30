var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.plugin(schema => { schema.options.usePushEach = true });
mongoose.set('debug', false);
mongoose.connect(global.config.dbpath);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() { console.log('db was connected'); });

//create schemas
var Schema = mongoose.Schema;

var data = new Schema({ 
  name:String, 
  value:String, 
  key: Boolean,
  more:[ {name:String, value:String, key: Boolean} ]
});

var UserSchema = new Schema({
    userid      : Number,
    inviter     : Number,
    username    : String,
    is_bot      : String,
    first_name	: String,
    last_name	  : String,
    language_code:String,

    isAdmin     : Boolean,
    isCompelet  : Boolean,
    section     : String,
    datas       : [data],
    date        : Date
});

var ConfigSchema = new Schema({
  username      : String,
  firstmessage  : String,
  domain        : String,
  moduleOptions:[{
    name:String, 
    category:String, 
    active: Boolean, 
    button:String,
    buttons:[String],
    btn_order:Number,
    datas : [data]
  }]
});

var lastMessageSchema = new Schema({
  userid: Number,
  text  : String,
  chatid: Number,
  messageid: Number,
})

var user     = mongoose.model('Users', UserSchema);
var config   = mongoose.model('config', ConfigSchema);
var lastMess = mongoose.model('lastMessages', lastMessageSchema);
module.exports = {user, config, lastMess};
