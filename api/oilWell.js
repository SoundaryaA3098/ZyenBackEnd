var request = require('request');
const uuidv4 = require('uuid/v4');
const fabricURL = 'http://localhost:4000';
var EventEmitter = require('events').EventEmitter;

const express = require('express');
var app = express();
var upload = require('express-fileupload');
var fs = require('fs');
var crypto = require('crypto');
app.use(upload()); // configure middleware


// var sha1 = require('sha1');

var sh = require('shorthash');
  
var oilWell = {
   
    updateOilWell:function(req,res,next) {
     console.log(req.body);
      var OWellID = uuidv4();
      console.log("OWellID:::"+OWellID);
      var hash=sh.unique(OWellID);
      console.log("Hash:::"+hash);
      var TimeStamp = new Date();
      console.log("TimeStamp:::"+TimeStamp);
     var postData={
      	peers:req.body.peers,
        fcn:"CreateOilWell",
        args:[req.body.OWellID,req.body.OHash,req.body.OWellName,req.body.OCountry,req.body.OState,req.body.OWellType,req.body.OPermitDate,req.body.OCurrentOperator,req.body.OWellOwner,req.body.OFlag,TimeStamp,req.body.OOiFieldID, req.body.OWellDigType, req.body.OWellDescription, req.body.OWellImgHash, req.body.OWellImgPath,req.body.OWellExploStatus,req.body.OWellStatus,req.body.OWellResults, req.body.OWellFundOpenDate, req.body.OwellFundComplDate, "active"]
      };
      console.log("PostData:::::"+JSON.stringify(postData));
     request.post({
      	uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'OilWellCC',
      	headers:{'content-type': 'application/json',
              'authorization': 'Bearer '+req.body.token},
      	body:JSON.stringify(postData)
      	},
     function (error, response, body) {
         if (!error && response.statusCode == 200) {
             response = JSON.parse(body);
             res.send(response);
         } else {
             console.log(response.statusCode + response.body);

             res.send({oilWell: -1});
         }
     });
   
   },
   createOilWell:function(req,res,next) {


    var documentDetails = new EventEmitter();

    var uploadpath = '/OilWellImages/' + req.file.filename;
    var fd = fs.createReadStream('/var/www/html/OilWellImages/' + req.file.filename);
    var hash = crypto.createHash('sha1');
    hash.setEncoding('hex');

    fd.on('end', function () {
      hash.end();

      var FileHash = hash.read();
      var FilePath = uploadpath;
      var docName = req.file.filename;

      documentDetails.data = {
        FileHash,
        FilePath,
        docName
      };
      documentDetails.emit('update');

    });

    fd.pipe(hash);
    documentDetails.on('update', function () {


    console.log(req.body);
    //  var OWellID = uuidv4();
    //  console.log("OWellID:::"+OWellID);
     var hash=sh.unique(req.body.OWellID);
     console.log("Hash:::"+hash);
     var TimeStamp = new Date();
     console.log("TimeStamp:::"+TimeStamp);

     var peerString = req.body.peers;
      var peerArr = peerString.split(",");
     
    var postData={
       peers:peerArr,
       fcn:"CreateOilWell",
       args:[req.body.OWellID,hash.toString(),req.body.OWellName,req.body.OCountry,req.body.OState,req.body.OWellType,req.body.OPermitDate,req.body.OCurrentOperator,"","NU",TimeStamp,"", req.body.OWellDigType, req.body.OWellDescription, documentDetails.data.FileHash, documentDetails.data.FilePath,req.body.OWellExploStatus,req.body.OWellStatus,req.body.OWellResults, req.body.OWellFundOpenDate, req.body.OwellFundComplDate, "active"]
     };
     console.log("PostData:::::"+JSON.stringify(postData));
    request.post({
       uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'OilWellCC',
       headers:{'content-type': 'application/json',
             'authorization': 'Bearer '+req.body.token},
       body:JSON.stringify(postData)
       },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            res.send(response);
        } else {
            console.log(response.statusCode + response.body);

            res.send({oilWell: -1});
        }
    });

  }); // end of emmit
  
  },
   getOilWellDetailsByOWellID: function(req, res, next) {
     console.log(req.query);
     var getData={
      	peer:req.query.peer,
        fcn:"GetOilWellDetailsByOWellID",
        args:'[\"'+req.params.oilWellId+'\"]'
      };
      console.log("---"+JSON.stringify(getData));
     request.get({
      	uri: fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'OilWellCC?'+require('querystring').stringify(getData),
      	headers:{'content-type': 'application/json',
              'authorization': 'Bearer '+req.query.token
            }
      	// body:require('querystring').stringify(getData)
      	},
     function (error, response, body) {
       
         if (!error && response.statusCode == 200) {
           console.log(body);
             response = JSON.parse(body);


             res.send(response);
         } else {
             console.log(response.statusCode + response.body);
             res.send({oilWell: -1});
         }
     });
   },
   getOilWellDetailsByOHash: function(req, res, next) {
    console.log(req.query);
    var getData={
         peer:req.query.peer,
       fcn:"GetOilWellDetailsByOHash",
       args:'[\"'+req.params.oilHash+'\"]'
     };
     console.log("---"+JSON.stringify(getData));
    request.get({
         uri: fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'OilWellCC?'+require('querystring').stringify(getData),
         headers:{'content-type': 'application/json',
             'authorization': 'Bearer '+req.query.token
           }
         // body:require('querystring').stringify(getData)
         },
    function (error, response, body) {
      
        if (!error && response.statusCode == 200) {
          console.log(body);
            response = JSON.parse(body);
            res.send(response);
        } else {
            console.log(response.statusCode + response.body);
            res.send({oilWell: -1});
        }
    });
  },
  
  getOilWellDetailsByArrayOfOHashes: function(req, res, next) {
    console.log(req.query);
    
    var EmitterForOilField = new EventEmitter();
      var getData={
         peer:req.query.peer,
         fcn:"GetOilFieldDetailsByOFieldID",
         args:'[\"'+req.params.oilFieldId+'\"]'
       };
      request.get({
         uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'OilFieldCC?'+require('querystring').stringify(getData),
         headers:{'content-type': 'application/json',
               'authorization': 'Bearer '+req.query.token}
         // body:require('querystring').stringify(getData)
         },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              response = JSON.parse(body);
              EmitterForOilField.data = response;
              console.log("EmitterForOilField Data:::"+JSON.stringify(EmitterForOilField.data));
              EmitterForOilField.emit('update');
              // res.send(response);
          } else {
              console.log(response.statusCode + response.body);
              res.send({oilWell: -1});
          }
        });

        EmitterForOilField.on('update', function(){
          console.log("OilField Data Hashes:::"+JSON.stringify(EmitterForOilField.data.OFieldOilWellHashes));
          var getData={
            peer:req.query.peer,
          fcn:"GetOilWellDetailsByArrayOfOHashes",
          args:'[\"'+EmitterForOilField.data.OFieldOilWellHashes+'\"]'
        };
        console.log("---"+JSON.stringify(getData));
       request.get({
            uri: fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'OilWellCC?'+require('querystring').stringify(getData),
            headers:{'content-type': 'application/json',
                'authorization': 'Bearer '+req.query.token
              }
            // body:require('querystring').stringify(getData)
            },
       function (error, response, body) {
         
           if (!error && response.statusCode == 200) {
             console.log(body);
               response = JSON.parse(body);
               res.send(response);
           } else {
               console.log(response.statusCode + response.body);
               res.send({oilWell: -1});
           }
       });
});
  },
  
  getAllOilWells: function(req, res, next) {
    console.log(req.query);
    var getData={
         peer:req.query.peer,
       fcn:"GetAllOilWells",
       args:'[\"\"]'
     };
     console.log("---"+JSON.stringify(getData));
    request.get({
         uri: fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'OilWellCC?'+require('querystring').stringify(getData),
         headers:{'content-type': 'application/json',
             'authorization': 'Bearer '+req.query.token
           }
         // body:require('querystring').stringify(getData)
         },
    function (error, response, body) {
      
        if (!error && response.statusCode == 200) {
          console.log(body);
            response = JSON.parse(body);
            res.send(response);
        } else {
            console.log(response.statusCode + response.body);
            res.send({oilWell: -1});
        }
    });
  }


};

module.exports = oilWell;
