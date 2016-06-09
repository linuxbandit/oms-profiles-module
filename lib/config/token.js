//token.js

var assert = require('assert');
var restify = require('restify');

var config = require('../config/config.json');

// Creates a REST client talking JSON to core
var coreRestClient = restify.createJsonClient({
  url: config.rest_core.url
});

// Creates a REST client talking JSON to tokenmaster
var tokenRestClient = restify.createJsonClient({
  url: config.rest_token.url
});

// INTERNAL methods 


//EXPOSED Methods 

var API_TOKEN = null;

//logging in to the profiles microservice
function requestAPIToken(credentials){

    tokenRestClient.post('/authenticate', credentials, function(resterr, restreq, restres, restobj) {
      //check if error
      if(resterr){
        assert.ifError(resterr);
      }

      console.log('response token and other: \n %j \n', restobj); 

      API_TOKEN = restobj.token;
      exports.API_TOKEN = API_TOKEN;

    });
};


function consumeRememberMeToken(token, done) { //OK

   var options = {
    'path': '/expiretoken',
    'headers': {
      'x-access-token': API_TOKEN
    }
  };

 console.log("expToken");
  tokenRestClient.post(options, {"token": token}, function(resterr, restreq, restres, restobj) {
    assert.ifError(resterr);
    if (resterr) { return done(resterr); }
    console.log('\n %j \n', restobj);
    var uid = restobj;
    return done(null, uid);
  });


}

function issueToken(user, done) { //OK

  var options = {
    'path': '/requesttoken',
    'headers': {
      'x-access-token': API_TOKEN
    }
  };

 console.log("IssueToken");
  tokenRestClient.post(options, {"user": user}, function(resterr, restreq, restres, restobj) {
    assert.ifError(resterr);
    if (resterr) { return done(resterr); }
    console.log('\n %j \n', restobj);
    var token = restobj;
    return done(null, token);
  });

}

function findByID(uid, next){

  var options = {
    'path': '/users/'+uid,
    'headers': {
      'x-access-token': API_TOKEN
    }
  };
  console.log("findByID");
  coreRestClient.get(options, function(resterr, restreq, restres, restobj) {
    assert.ifError(resterr);
    //console.log('\n %j \n', restobj[0]); //The core always returns an array (even for single element)
    user = restobj[0];
    return next(null, user);
  });

}

//Expose stuff
exports.issueToken = issueToken;
exports.consumeRememberMeToken = consumeRememberMeToken;
exports.requestAPIToken = requestAPIToken;
exports.findByID = findByID;