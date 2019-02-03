var name = 'analytic';

var buildUrl = require('build-url');

var checkRoute = function(option)
{
    var btnsArr  = [ 
        fn.mstr[name]['name']
    ];

    var result = {}
    //check text message
    if(option.text) btnsArr.forEach(btn => { 
        if(option.text === btn) 
        {
            result.status = true; 
            result.button = btn;
            result.routting = routting;
        }
    });

    //check seperate section
    if(option.speratedSection){
        option.speratedSection.forEach(section => {
            btnsArr.forEach(btn => 
            { 
                if(section === btn){
                    result.status = true; 
                    result.button = btn;
                    result.routting = routting;
                }
            });
        });
    }

    //return
    return result;
}

function sendRequestToGoogleAnalytic (parameters)
{
    // get module option
    let trackid = fn.getModuleData(name, 'trackID');
    
    let isModuleActive = fn.getModuleOption(name).option.active;
    if(!isModuleActive) return;
     
    // create query parameters
    let query = Object.assign({ 'v':'1', 'tid':trackid.value } , parameters);
    
    // create url
    let url = buildUrl('https://google-analytics.com', {
      path: 'collect',
      queryParams: query
    });
    
    fn.request.post(url);
    
    //console.log('Google Analytic, Tracking', query);
}

function trackPage(userid, page, title)
{
    let pageQuery = {
        'cid': userid,
        't':'pageview',
        'dp':page,
        'dt': title
    };
    
    sendRequestToGoogleAnalytic(pageQuery);
}

function trackEvent(userid, category, action, label, value)
{
    let eventQuery = {
      'cid': userid,
      't' :'event',
      'ec':category,
      'ea':action,
    };
    
    if(label != null) eventQuery['el'] = label;
    if(value != null) eventQuery['ev'] = value;
    
    sendRequestToGoogleAnalytic(eventQuery);
}

var routting = function(message, speratedSection, user)
{
    //show section
    if(message.text === fn.mstr[name]['name'] || message.text === fn.mstr['inbox'].back)
        settings.show(message.from.id, name);
    
    //show setting
    // else if(message.text === fn.mstr[name].btns['settings']) 
    //     settings.show(message.from.id, name);

    else if(speratedSection[3] === fn.mstr[name].btns['settings']) 
        settings.routting(message, speratedSection, user, name);


}

var settings = require('./settings');
var query = require('./query');

module.exports = { 
    name, 
    checkRoute, 
    routting,
    settings,
    query, 
    
    trackPage,
    trackEvent,
}