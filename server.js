// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoUrl =process.env.MONGOLAB_URI; 
var validUrl = require('valid-url');
var shortid = require('shortid');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.get("/:shortId", function (request, response) {
  
  MongoClient.connect(mongoUrl,function(err, db) {
      if (err) {
        response.send({error: 'Unable to connect to the mongoDB server. Error:'+err});
      } else {
        console.log(request.params.shortId);
        db.collection('shortUrls').findOne({shortid:request.params.shortId}, function(err, data) {
            if(!err) {
              console.log(data.url);
              response.redirect(data.url);
            } else {
              response.send({error: err});
            }
            db.close();
        });
     
      }          
  });
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/new/:url(*)", function (request, response) {
  
  var host = request.protocol + '://' + request.get('host');
  console.log("host " + host);
  var url = request.params.url;
  var shortUrl;
  if(!validUrl.isUri(url)) {
    response.send({
      error: "URL is not valid"
    });
  } else {
    MongoClient.connect(mongoUrl,function(err, db) {
      if (err) {
        response.send({error: 'Unable to connect to the mongoDB server. Error:'+err});
      } else {
        
        var id = shortid.generate();
        db.collection('shortUrls').findOneAndUpdate({url:url}, {$setOnInsert: {url:url, shortid: id}}, {upsert:true, returnOriginal: false}, function(err, data) {
            if(!err) {
              response.send({
                original_url: url,
                short_url: host +"/" + data.value.shortid
              });
            } else {
              response.send({error: err});
            }
            db.close();
        });
      
     
      }
    
                      
  });
    
  }
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
