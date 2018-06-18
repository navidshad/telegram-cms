var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/nextpay', async (req, res, next) =>
{
    console.log('a request to nextpay callback', req.body);
    var body = req.body;
    if(!body.trans_id || !body.order_id) {
        res.send('اطلاعات محصول اشتباه است.');
        return;
    }

    //get nextpay session
    var nextpaySession = await global.fn.db.nextpay
    .findOne({ 'order_id'  : body.order_id, 'trans_id'  : body.trans_id }).exec().then();
    
    //no session found
    if(!nextpaySession) {
        res.send('در ذخیره سازی اطلاعات محصول، قبل از پرداخت مشکلی پیش آماده است. لطفا اطلاعات زیر را به بخش پشتیبانی ربات ارسال کنید. \n' + body);
        return;
    }

    //get nextpay api key
    var nextpayapikey = fn.getModuleData(fn.mstr.commerce['modulename'], 'nextpayapikey');
    nextpayapikey = (nextpayapikey) ? nextpayapikey.value : '...';

    //validate purchase
    var validate = await global.fn.m.commerce.gates.nextpay
    .VerifyPayment(body.trans_id, body.order_id, nextpaySession.amount, nextpayapikey);
    console.log('validate', validate);
    var code = validate.PaymentVerificationResult.code; 

    //not purched
    if(code !== 0){
        res.send('مشکل در پرداخت، شماره خطا: ' + code);
        return;
    }
    
    //seccess payment
    var factor = await global.fn.db.factor.findOne({'number':body.order_id}).exec().then();
    global.fn.m.commerce.user.factor.getPaied(factor.userid, factor.id);
    res.send('پرداخت با موفقیت انجام شد.');
});

module.exports = router;
