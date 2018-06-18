var soap = require('soap');

var GetToken = async function (order_id, amount, key) {
    var port = global.config.serverport;
    var callback_uri = global.config.domain + ':' + port + '/returnback/nextpay';
    console.log('nextpay callback: ' + callback_uri);
    var url = 'https://api.nextpay.org/gateway/token.wsdl';
    
    var payload = {
        'api_key': key,
        'order_id': order_id,
        'amount': amount,
        'callback_uri': callback_uri
    };

    var client = await soap.createClientAsync(url).then();
    return client.TokenGeneratorAsync(payload).then();
};


var VerifyPayment = async function(trans_id, order_id, amount, key)
{
    // trans_id and order_id will POST to callback_uri
    var url = 'https://api.nextpay.org/gateway/verify.wsdl';
    var payload = {
        'api_key'   : key,
        'trans_id'  : trans_id,
        'order_id'  : order_id,
        'amount'    : amount
    };

    var client = await soap.createClientAsync(url).then();
    return client.PaymentVerificationAsync(payload).then();
};

var getPaylink = async function(fnumber, amount)
{
    //get session
    var session = null;
    session = await fn.db.nextpay.findOne({'order_id': fnumber}).exec().then();
    if(!session) session = await new fn.db.nextpay({'order_id': fnumber, 'amount': amount}).save().then();
    else session.amount = amount;

    //get nextpay api key
    var nextpayapikey = fn.getModuleData(fn.mstr.commerce['modulename'], 'nextpayapikey');
    nextpayapikey = (nextpayapikey) ? nextpayapikey.value : '...';

    //get new token
    return await GetToken(fnumber, amount, nextpayapikey)
    .then(async (result) => 
    {
        var TokenGeneratorResult = result.TokenGeneratorResult;

        //return fake url
        if(TokenGeneratorResult.code !== -1) {
            console.log('nextpay error: ' + result.TokenGeneratorResult.code);
            return 'https://api.nextpay.org/gateway/payment/***';
        }

        //save
        session.trans_id = TokenGeneratorResult.trans_id;
        session.code = TokenGeneratorResult.code;
        await session.save().then();

        //return url
        var url = 'https://api.nextpay.org/gateway/payment/' + session.trans_id;
        return url;
    })
    .catch(e => 
    {
        console.log(e);
        return 'https://api.nextpay.org/gateway/payment/***';
    });
}
module.exports = { VerifyPayment, getPaylink }